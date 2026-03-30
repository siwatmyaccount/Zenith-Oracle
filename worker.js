// ============================================================
// worker.js — Cloudflare Worker: Gemini API Proxy
// deploy ด้วยคำสั่ง: wrangler deploy
// API Key เก็บใน Cloudflare Secret — ไม่อยู่ใน code เลย
// ============================================================

export default {
    async fetch(request, env) {

        // อนุญาต CORS จาก GitHub Pages ของคุณ
        // ✏️ เปลี่ยน your-username และ your-repo ให้ตรงกับของคุณ
        const ALLOWED_ORIGIN = " https://siwatmyaccount.github.io/Zenith-Oracle";

        const origin = request.headers.get("Origin") || "";
        const corsHeaders = {
            "Access-Control-Allow-Origin": origin === ALLOWED_ORIGIN ? ALLOWED_ORIGIN : "",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        };

        // รับ Preflight OPTIONS request จาก browser
        if (request.method === "OPTIONS") {
            return new Response(null, { status: 204, headers: corsHeaders });
        }

        // รับเฉพาะ POST เท่านั้น
        if (request.method !== "POST") {
            return new Response("Method Not Allowed", { status: 405 });
        }

        // ดึง API Key จาก Cloudflare Secret (ตั้งค่าด้วย wrangler secret put)
        const apiKey = env.GEMINI_API_KEY;
        if (!apiKey) {
            return new Response(
                JSON.stringify({ error: "GEMINI_API_KEY secret ยังไม่ได้ตั้งค่า" }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        try {
            const body = await request.json();

            const geminiRes = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                }
            );

            const data = await geminiRes.json();

            return new Response(JSON.stringify(data), {
                status: geminiRes.status,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });

        } catch (err) {
            return new Response(
                JSON.stringify({ error: err.message }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }
    },
};
