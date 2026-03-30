// ============================================================
// netlify/functions/gemini-proxy.js
// Proxy รับ request จากหน้าเว็บ แล้วส่งต่อไปหา Gemini API
// API Key เก็บใน Netlify Environment Variable — ไม่อยู่ใน code
// ============================================================

exports.handler = async function (event) {

    // รับเฉพาะ POST เท่านั้น
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    // ดึง API Key จาก Environment Variable (ตั้งค่าใน Netlify Dashboard)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "API Key ยังไม่ได้ตั้งค่าใน Netlify Environment Variables" })
        };
    }

    try {
        const body = JSON.parse(event.body);

        const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            }
        );

        const data = await geminiRes.json();

        return {
            statusCode: geminiRes.status,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        };

    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message })
        };
    }
};
