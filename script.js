// เพิ่ม BGM คลอเป็นพื้นหลัง (สามารถเปลี่ยน Link เป็นเพลงอื่นที่ชอบได้ครับ)
const bgmMystic = new Audio('Mgs.mp3'); // ใส่ชื่อไฟล์ MP3 ที่โหลดมาตรงนี้
bgmMystic.loop = true;  
bgmMystic.volume = 0.3; // ปรับความดัง-เบา ได้ตามความชอบเลยครับ (0.1 - 1.0)

// ตัวแปรสำหรับระบบเสียงและอ่านคำทำนาย
const sfxStart = new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3'); sfxStart.volume = 0.8;
const sfxPick = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'); sfxPick.volume = 0.8;
const sfxReveal = new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'); sfxReveal.volume = 0.8;

let isMuted = false;
let isReading = false; 
let utterance = null;

function safePlay(audioObj) {
    if (isMuted) return;
    try {
        if (audioObj.readyState > 0) audioObj.currentTime = 0;
        audioObj.play().catch(e => console.log("Audio play prevented", e));
    } catch(e) {}
}

function toggleSound() {
    isMuted = !isMuted;
    sfxStart.muted = isMuted;
    sfxPick.muted = isMuted;
    sfxReveal.muted = isMuted;
    bgmMystic.muted = isMuted; // ผูก BGM เข้ากับปุ่มปิดเสียงด้วย

    // ควบคุมการหยุด/เล่น BGM เมื่อกดปุ่ม
    if (isMuted) {
        bgmMystic.pause();
    } else if (document.getElementById('step-2').style.display === 'flex' || document.getElementById('step-3').style.display === 'flex') {
        // ให้เล่นเฉพาะตอนที่เข้ามาหน้าเลือกไพ่ หรือหน้าผลลัพธ์แล้ว
        bgmMystic.play().catch(e => console.log(e));
    }

    const iconContainer = document.getElementById('sound-toggle');
    iconContainer.innerHTML = isMuted ? '<i data-lucide="volume-x"></i>' : '<i data-lucide="volume-2"></i>';
    if (window.lucide) lucide.createIcons();
}

const finalTarotDB = [
    {
        name: "0. The Fool", score: 70,
        general: { past: "อดีตคุณมักทำตามใจตัวเอง กล้าเสี่ยงและรักอิสระ", present: "คุณกำลังเริ่มต้นสิ่งใหม่ หรืออยู่ในช่วงอยากปลดแอกตัวเอง", future: "การผจญภัยครั้งใหม่รออยู่ สิ่งที่คาดไม่ถึงจะนำพาประสบการณ์ดีๆ มาให้" },
        love: { past: "ความรักที่ผ่านมาเน้นสนุกสนาน ไม่ผูกมัด", present: "คนโสดจะพบรักไม่ทันตั้งตัว คนมีคู่ระวังความเอาแต่ใจ", future: "ความสัมพันธ์จะพัฒนาไปในทางที่คาดเดายาก แต่ตื่นเต้น" },
        money: { past: "ใช้เงินตามใจชอบ หมดไปกับประสบการณ์", present: "การเงินหมุนเวียนไว ระวังการซื้อของด้วยอารมณ์", future: "มีโอกาสทางการเงินใหม่ๆ เข้ามาแบบฟลุคๆ" },
        work: { past: "เคยผ่านการเริ่มต้นโปรเจกต์ใหม่ด้วยความกล้า", present: "เหมาะกับการเริ่มงานใหม่ เบื่อความจำเจ", future: "จะได้จับงานชิ้นใหม่ที่ไม่เคยทำมาก่อน" },
        reversedMeaning: "ระวังความประมาท ขาดความรับผิดชอบ หรือการตัดสินใจที่เสี่ยงเกินไปโดยไม่ไตร่ตรองให้ดี"
    },
    {
        name: "1. The Magician", score: 90,
        general: { past: "คุณใช้ไหวพริบเอาตัวรอดมาได้เสมอ", present: "คุณมีศักยภาพเต็มเปี่ยม พร้อมเนรมิตทุกสิ่ง", future: "ความสำเร็จเกิดจากการสื่อสารและลงมือทำอย่างชาญฉลาด" },
        love: { past: "รักเริ่มต้นด้วยแรงดึงดูดและพูดคุยถูกคอ", present: "มีเสน่ห์ดึงดูดใจ การสื่อสารมัดใจคนรักได้อยู่หมัด", future: "คุณจะเป็นฝ่ายคุมเกมในความสัมพันธ์นี้" },
        money: { past: "หาเงินเก่ง มีช่องทางรายได้หลายทาง", present: "จับหยิบอะไรเป็นเงินเป็นทอง หัวการค้าทำงาน", future: "ไอเดียใหม่ๆ สร้างเม็ดเงินมหาศาลได้" },
        work: { past: "ผลงานโดดเด่นเพราะความสามารถเฉพาะตัว", present: "โดดเด่นเรื่องเจรจา พรีเซนต์งานผ่านฉลุย", future: "ได้แสดงฝีมือเป็นที่ประจักษ์ รับโปรเจกต์สำคัญ" },
        reversedMeaning: "ระวังการถูกหลอกลวง การใช้เล่ห์เหลี่ยม หรือพรสวรรค์ที่มีอยู่ถูกปิดกั้นแสดงออกมาไม่ได้เต็มที่"
    },
    {
        name: "2. The High Priestess", score: 65,
        general: { past: "คุณใช้สัญชาตญาณนำทาง หรือเก็บซ่อนความรู้สึก", present: "ต้องฟังเสียงหัวใจตัวเอง มากกว่าเสียงคนรอบข้าง", future: "ความลับบางอย่างจะถูกเปิดเผย หรือค้นพบสัจธรรม" },
        love: { past: "รักที่ซ่อนเร้น รักข้างเดียว หรือสถานะไม่ชัดเจน", present: "ใช้เซนส์จับผิดหรือสังเกตคนรัก ระวังมือที่สาม", future: "หากมีความลับจะถูกเปิดเผย จงซื่อสัตย์ต่อความรู้สึก" },
        money: { past: "การเงินมาจากความรู้เฉพาะทาง หรือรายได้ไม่เปิดเผย", present: "จัดการเงินแบบเงียบๆ ไม่ชอบให้ใครรู้สถานะ", future: "สัญชาตญาณจะบอกเองว่าควรลงทุนกับสิ่งไหน" },
        work: { past: "เคยทำงานเบื้องหลัง เป็นที่ปรึกษาที่คนไว้ใจ", present: "งานสัญชาตญาณ วิชาการ หรือที่ปรึกษากำลังไปได้ดี", future: "ความรู้ลึกซึ้งจะทำให้ก้าวหน้ามั่นคง" },
        reversedMeaning: "การหลอกตัวเอง ความลับรั่วไหล หรือการเพิกเฉยต่อลางสังหรณ์จนเกิดความผิดพลาด"
    },
    {
        name: "3. The Empress", score: 95,
        general: { past: "ได้รับการดูแลอย่างดี หรือมีความสุขสมบูรณ์", present: "ชีวิตอุดมสมบูรณ์ มีความสุขกับสิ่งรอบตัว", future: "ชีวิตเข้าสู่โหมดสุขสบาย ได้รับการอุปถัมภ์" },
        love: { past: "ความรักอบอุ่น ดูแลกันเหมือนครอบครัว", present: "รักอุดมสมบูรณ์ มีเกณฑ์ข่าวดีหรือตกลงใช้ชีวิตคู่", future: "พัฒนาสู่ความมั่นคง อาจมีข่าวดีเรื่องบุตร" },
        money: { past: "ไม่เคยลำบากเรื่องเงิน มีกินมีใช้", present: "มั่งคั่ง มีผู้ใหญ่หรือสตรีให้การอุปถัมภ์", future: "ความมั่งคั่งรออยู่ ผลกำไรงอกเงย" },
        work: { past: "ผลงานที่ฟูมฟักเริ่มผลิดอกออกผล", present: "งานศิลปะ ความงาม การจัดการสำเร็จดี", future: "โปรเจกต์เติบโตก้าวกระโดด เจ้านายสนับสนุน" },
        reversedMeaning: "การพึ่งพาคนอื่นมากเกินไป ความรู้สึกไม่มั่นคง หรือการสูญเสียความสมดุลในการดูแลตัวเอง"
    },
    {
        name: "4. The Emperor", score: 85,
        general: { past: "ต้องเป็นผู้นำและแบกรับภาระหนักมาตลอด", present: "มีอำนาจตัดสินใจ ทุกอย่างต้องอยู่ในระเบียบ", future: "ความสำเร็จเกิดจากวินัยและความเข้มแข็งของคุณ" },
        love: { past: "ความรักที่มีคนนำและบงการ", present: "รักมั่นคงแต่แข็งกระด้าง อาจรู้สึกอึดอัด", future: "พบคนเป็นผู้ใหญ่กว่า หรือความสัมพันธ์หนักแน่นขึ้น" },
        money: { past: "สร้างฐานะด้วยน้ำพักน้ำแรงและแผนที่รัดกุม", present: "การเงินแข็งแกร่ง ควบคุมรายรับรายจ่ายดี", future: "สินทรัพย์เพิ่มพูนจากการลงทุนระยะยาว" },
        work: { past: "ฝ่าฟันจนได้รับการยอมรับฐานะผู้นำ", present: "มีโอกาสเลื่อนขั้น หรือคุมโปรเจกต์ใหญ่", future: "ประสบความสำเร็จสูงสุดในสายอาชีพ" },
        reversedMeaning: "การใช้อำนาจเผด็จการ เจ้าระเบียบเกินไปจนคนรอบข้างอึดอัด หรือขาดภาวะผู้นำ"
    },
    {
        name: "5. The Hierophant", score: 80,
        general: { past: "ดำเนินชีวิตตามกรอบและกฎเกณฑ์มาตลอด", present: "ช่วงเวลาแห่งการเรียนรู้ หรือต้องการที่ปรึกษา", future: "ชีวิตราบรื่น สงบสุข มีสติปัญญา" },
        love: { past: "รักอยู่ในสายตาผู้ใหญ่ เน้นความถูกต้อง", present: "ราบเรียบตามขนบ หวานน้อยแต่มั่นคง", future: "อาจมีการแต่งงานตามประเพณี หรือรักสงบร่มเย็น" },
        money: { past: "การเงินนิ่งๆ เก็บหอมรอมริบมาเรื่อยๆ", present: "พอใช้ มักเสียเงินกับการทำบุญหรือศึกษา", future: "การเงินมั่นคงหากไม่ทำอะไรเสี่ยงๆ" },
        work: { past: "สั่งสมประสบการณ์และความรู้มาอย่างยาวนาน", present: "ได้รับความไว้วางใจ เป็นที่ปรึกษา", future: "ได้รับการยกย่อง หรือสอบแข่งขันผ่าน" },
        reversedMeaning: "การต่อต้านกฎเกณฑ์ ความเชื่อที่ผิดเพี้ยน หรือได้รับคำแนะนำจากผู้ใหญ่ที่ผิดพลาด"
    },
    {
        name: "6. The Lovers", score: 85,
        general: { past: "เคยต้องตัดสินใจเลือกทางเดินสำคัญ", present: "มีแรงดึงดูด หรือต้องเลือกสองทาง", future: "การตัดสินใจครั้งสำคัญจากหัวใจจะเกิดขึ้น" },
        love: { past: "มีความทรงจำแสนหวาน หรือเจอรักที่ต้องเลือก", present: "รักหวานชื่น คนโสดเจอคนที่ถูกใจมาก", future: "พัฒนาไปอีกขั้น ระวังรักสามเส้าหากไม่ชัดเจน" },
        money: { past: "ได้เงินจากเสน่หา หรือหมดเงินกับคนรัก", present: "ราบรื่น มักได้โชคจากคนรักหรือหุ้นส่วน", future: "มีช่องทางทำเงินใหม่ๆ เข้ามาให้เลือก" },
        work: { past: "เคยทำงานร่วมกับผู้อื่นอย่างเข้าขา", present: "ทำงานเป็นทีมนำพาความสำเร็จมาให้", future: "ร่วมงานกับคนที่ถูกใจ หรือมีออฟเฟอร์งานน่าสนใจ" },
        reversedMeaning: "ความสัมพันธ์ที่ไม่สมดุล การตัดสินใจเลือกทางที่ผิด หรือความขัดแย้งภายในจิตใจ"
    },
    {
        name: "7. The Chariot", score: 75,
        general: { past: "ผ่านการต่อสู้และอุปสรรคด้วยความอดทน", present: "ชีวิตขับเคลื่อนไปข้างหน้า ต้องใช้พลังใจสูง", future: "ชัยชนะรออยู่ หากไม่ยอมแพ้" },
        love: { past: "รักที่ต้องฝ่าฟัน หรือรักระยะไกล", present: "มีปากเสียงบ้าง หรือต้องพยายามรักษาความสัมพันธ์", future: "เอาชนะใจได้ หรือคนรักจากแดนไกลจะมาหา" },
        money: { past: "หาเงินด้วยความเหนื่อย ไม่มีอะไรได้มาฟรี", present: "ออกแรงจึงได้เงิน อาจเสียเงินเรื่องรถ/เดินทาง", future: "ความเหนื่อยล้าจะแปรเปลี่ยนเป็นความสำเร็จ" },
        work: { past: "ลุยงานหนัก แข่งขันสูงแต่เอาตัวรอดมาได้", present: "งานหนัก เดินทาง หรือแข่งขันกับคู่แข่ง", future: "พยายามไม่สูญเปล่า จะเอาชนะคู่แข่งได้" },
        reversedMeaning: "ความพ่ายแพ้ อุปสรรคที่ควบคุมไม่ได้ การเดินทางที่ถูกเลื่อน หรือหมดกำลังใจในการสู้ต่อ"
    },
    {
        name: "8. Strength", score: 85,
        general: { past: "เอาชนะช่วงยากลำบากด้วยความเข้มแข็ง", present: "ต้องใช้อดทนและวาทศิลป์จัดการปัญหา", future: "ความเข้มแข็งจากภายในจะช่วยผ่านทุกสถานการณ์" },
        love: { past: "ต้องอดทนประคับประคองความรัก", present: "ใช้อ่อนโยนสยบความแข็งกร้าว", future: "คุมคนรักได้อยู่หมัดด้วยความรักและเมตตา" },
        money: { past: "มีช่วงต้องอดทนเรื่องเงิน แต่รอดมาได้", present: "ควบคุมค่าใช้จ่ายดี มีความสามารถหาเงิน", future: "ปลดหนี้ได้ หรือสร้างฐานะมั่นคงขึ้น" },
        work: { past: "จัดการงานยากหรือเจ้านายจู้จี้สำเร็จ", present: "เอาชนะปัญหาใหญ่ในที่ทำงานด้วยความนิ่ง", future: "ได้รับความเคารพ ผ่านงานหินๆ ได้" },
        reversedMeaning: "ความอ่อนแอ ความกลัว ขาดความมั่นใจ หรือปล่อยให้อารมณ์ด้านมืดเข้าครอบงำ"
    },
    {
        name: "9. The Hermit", score: 60,
        general: { past: "เคยปลีกวิเวก หรือเผชิญความเหงา", present: "ต้องการพื้นที่ส่วนตัว ถอยมองปัญหาจากมุมกว้าง", future: "ทบทวนตัวเองเพื่อค้นพบแสงสว่างนำทาง" },
        love: { past: "รักห่างเหิน หรือครองโสดมานาน", present: "โสดโฟกัสตัวเอง คนมีคู่ต้องการสเปซ", future: "ค้นพบคำตอบในใจว่าต้องการรักรูปแบบไหน" },
        money: { past: "ใช้จ่ายระมัดระวัง ไม่ตามกระแส", present: "เก็บเงินเก่ง ไม่เน้นวัตถุนิยม", future: "มีเงินเก็บมากขึ้น ตัดค่าใช้จ่ายไม่จำเป็นได้" },
        work: { past: "ทำงานปิดทองหลังพระ", present: "เหมาะกับงานวิจัย ใช้สมาธิสูง ทำคนเดียว", future: "ก้าวขึ้นเป็นผู้เชี่ยวชาญเฉพาะด้าน" },
        reversedMeaning: "การแยกตัวออกจากสังคมมากเกินไป จมอยู่กับความเศร้าในอดีต หรือไม่ยอมรับฟังความช่วยเหลือ"
    },
    {
        name: "10. Wheel of Fortune", score: 90,
        general: { past: "ชีวิตมีการเปลี่ยนแปลงขึ้นลงตามจังหวะ", present: "โอกาสและโชคชะตากำลังหมุนมาหา", future: "กงล้อโชคชะตาหมุนไปในทิศทางที่ดีขึ้น" },
        love: { past: "ความสัมพันธ์มีขึ้นมีลงตามโชคชะตา", present: "พรหมลิขิตทำงาน โอกาสพบเนื้อคู่", future: "จังหวะเวลานำพาคนที่ใช่เข้ามา" },
        money: { past: "การเงินไม่แน่นอน มีได้มีเสีย", present: "โชคลาภหมุนมาหา โอกาสได้เงินฟลุคๆ", future: "การเงินพลิกฟื้น โอกาสกอบโกยมาถึง" },
        work: { past: "การงานผันผวนตามสถานการณ์", present: "จังหวะเวลาแห่งความก้าวหน้า โอกาสทองมาถึง", future: "เปลี่ยนงาน เลื่อนขั้น โยกย้ายทิศทางที่ดี" },
        reversedMeaning: "โชคร้าย จังหวะเวลาไม่เป็นใจ ความล่าช้า หรือการพยายามฝืนโชคชะตาที่ไม่เกิดผล"
    },
    {
        name: "11. Justice", score: 75,
        general: { past: "ทำสิ่งใดไว้ก็ได้รับผลตามนั้น", present: "อยู่ในช่วงตัดสินใจด้วยเหตุและผลอย่างเด็ดขาด", future: "ความยุติธรรมจะปรากฏ ความจริงจะถูกเปิดเผย" },
        love: { past: "ความรักตั้งอยู่บนความถูกต้องมากกว่าอารมณ์", present: "อาจมีเรื่องกฎหมาย เอกสาร หรือการตกลงกัน", future: "ได้รับความชัดเจนในสถานะที่คลุมเครือ" },
        money: { past: "ได้เงินตามสัดส่วนความพยายาม", present: "ระวังเรื่องเอกสารสัญญาหรือการค้ำประกัน", future: "ปัญหาการเงินหรือคดีความจะตกลงกันได้ด้วยดี" },
        work: { past: "ทำงานตรงไปตรงมา ไม่เอาเปรียบใคร", present: "งานที่เกี่ยวข้องกับกฎหมาย เอกสาร โดดเด่น", future: "ผลงานจะถูกประเมินอย่างยุติธรรมที่สุด" },
        reversedMeaning: "ความไม่ยุติธรรม ความลำเอียง เอกสารสัญญาผิดพลาด หรือแพ้คดีความ"
    },
    {
        name: "12. The Hanged Man", score: 30,
        general: { past: "ต้องเสียสละบางสิ่งเพื่อผู้อื่นมาตลอด", present: "สถานการณ์หยุดชะงัก ขยับตัวลำบาก", future: "ต้องเปลี่ยนมุมมองใหม่หมดถึงจะเห็นทางออก" },
        love: { past: "รักที่ต้องอดทนรอคอย หรือตกเป็นรอง", present: "ความสัมพันธ์ติดหล่ม กลืนไม่เข้าคายไม่ออก", future: "ยอมถอยหนึ่งก้าวเพื่อรักษาสิ่งที่สำคัญกว่าไว้" },
        money: { past: "เสียเงินไปกับคนอื่นจนตัวเองลำบาก", present: "เงินติดขัดอย่างหนัก ต้องรัดเข็มขัด", future: "สูญเสียเงินก้อนเพื่อแลกกับความสบายใจ" },
        work: { past: "ทำงานเหนื่อยฟรี หรือโปรเจกต์โดนแช่แข็ง", present: "เจอทางตัน ทำอะไรไม่ได้นอกจากรอเวลา", future: "พลิกวิกฤตเป็นโอกาสได้หากคิดนอกกรอบ" },
        reversedMeaning: "การเสียสละที่สูญเปล่า ความดื้อรั้นไม่ยอมรับความจริง หรือติดอยู่ในวังวนความทุกข์"
    },
    {
        name: "13. Death", score: 20,
        general: { past: "ผ่านการสูญเสียหรือความเจ็บปวดแสนสาหัส", present: "กำลังจบสิ้นวัฏจักรเดิม เพื่อล้างไพ่ชีวิตใหม่", future: "จุดจบของบางสิ่ง คือจุดเริ่มต้นของสิ่งที่ดีกว่า" },
        love: { past: "จบความสัมพันธ์ที่ยืดเยื้อหรือบาดหมาง", present: "ต้องตัดใจจากสิ่งที่พังไปแล้วเพื่อมูฟออน", future: "จะได้เริ่มต้นชีวิตรักใหม่ที่ปราศจากแผลเดิม" },
        money: { past: "ล้มเหลวทางการเงิน หรือขาดทุนหนัก", present: "ถึงเวลาปรับโครงสร้างการเงินหรือหนี้สินใหม่หมด", future: "ฟื้นตัวจากศูนย์ได้หากกล้าตัดใจขายทิ้งบางสิ่ง" },
        work: { past: "ลาออกจากงาน หรือธุรกิจเดิมถึงทางตัน", present: "โปรเจกต์ถูกยกเลิก หรือมีการปรับเปลี่ยนองค์กรใหญ่", future: "ได้งานสายใหม่ หรือธุรกิจแนวใหม่ไปเลย" },
        reversedMeaning: "การดิ้นรนต่อต้านการสิ้นสุด ความกลัวการเปลี่ยนแปลง หรือยึดติดกับสิ่งที่ตายไปแล้ว"
    },
    {
        name: "14. Temperance", score: 65,
        general: { past: "ชีวิตมีความผันผวน ต้องคอยปรับตัวตลอด", present: "อยู่ในช่วงประนีประนอม หาความสมดุลให้ชีวิต", future: "การโยกย้าย เปลี่ยนแปลงที่ราบรื่นกำลังจะมา" },
        love: { past: "ความรักที่ต่างคนต่างปรับตัวเข้าหากัน", present: "ประคับประคองอารมณ์ คุยกันด้วยเหตุผลมากขึ้น", future: "ความสัมพันธ์จะกลมกลืนและเข้าใจกันกว่าเดิม" },
        money: { past: "เงินหมุนเข้าซ้ายออกขวาอย่างรวดเร็ว", present: "หมุนเงินเก่ง ยังเอาตัวรอดได้เรื่อยๆ", future: "จะมีแหล่งรายได้ใหม่เข้ามาเสริมให้มั่นคงขึ้น" },
        work: { past: "เปลี่ยนงาน หรือสลับตำแหน่งบ่อย", present: "ประสานงานกับคนหลายฝ่าย หรือต้องเดินทาง", future: "งานที่เกี่ยวกับการต่างประเทศหรือขนส่งจะรุ่งเรือง" },
        reversedMeaning: "ความไม่สมดุล ใจร้อน ทำอะไรสุดโต่งเกินไปจนเกิดความเสียหาย"
    },
    {
        name: "15. The Devil", score: 10,
        general: { past: "เคยตกเป็นทาสของกิเลสหรือความลุ่มหลง", present: "มีสิ่งล่อตาล่อใจ หรือพันธนาการที่ดิ้นไม่หลุด", future: "ระวังวังวนของความโลภและการเสพติด" },
        love: { past: "ความรักแบบ Toxic หรือผูกมัดทางกาย", present: "ลุ่มหลง หึงหวงแรง หรือมีความลับแอบแฝง", future: "ยากที่จะตัดใจจากความสัมพันธ์ที่เป็นพิษ" },
        money: { past: "ได้เงินจากช่องทางสีเทา หรือใช้เงินแก้ปัญหา", present: "กิเลสทำให้เสียเงินก้อนโต ติดหนี้บัตรเครดิต", future: "ระวังถูกหลอกลวงเพราะความโลภอยากได้เงินไว" },
        work: { past: "ทำงานเพื่อผลประโยชน์โดยไม่สนวิธีการ", present: "มีผลประโยชน์ทับซ้อน หรือโดนเอาเปรียบ", future: "ความทะเยอทะยานจะนำไปสู่ปัญหาหากไร้จริยธรรม" },
        reversedMeaning: "การหลุดพ้นจากพันธนาการ ตัดขาดจากคน Toxic หรือการตาสว่างจากความลุ่มหลง"
    },
    {
        name: "16. The Tower", score: 15,
        general: { past: "เกิดเหตุการณ์ช็อคความรู้สึกแบบกะทันหัน", present: "มีเรื่องเซอร์ไพรส์ที่ไม่ทันตั้งตัว โครงสร้างชีวิตสั่นคลอน", future: "การพังทลายของสิ่งจอมปลอมเพื่อสร้างรากฐานใหม่" },
        love: { past: "ทะเลาะรุนแรง หรือเลิกราแบบฟ้าผ่า", present: "อารมณ์คุกรุ่น ระวังคำพูดที่ทำลายความสัมพันธ์", future: "ความจริงที่ซ่อนไว้จะปะทุออกมาอย่างรุนแรง" },
        money: { past: "เสียเงินก้อนใหญ่กะทันหัน หรือข้าวของพัง", present: "อุบัติเหตุทางการเงินที่ไม่ได้คาดคิด", future: "ต้องนำเงินสำรองออกมาใช้ฉุกเฉิน" },
        work: { past: "โดนปลด โดนบีบออก หรืองานล่มไม่เป็นท่า", present: "ความขัดแย้งในที่ทำงานรุนแรง ถึงขั้นแตกหัก", future: "องค์กรเปลี่ยนโครงสร้างกะทันหัน กระทบตัวคุณ" },
        reversedMeaning: "หายนะที่หลีกเลี่ยงไม่ได้แต่เบากว่าที่คิด หรือการดันทุรังอยู่ในที่ที่พังทลายไปแล้ว"
    },
    {
        name: "17. The Star", score: 85,
        general: { past: "เยียวยาตัวเองจากบาดแผลในอดีตได้สำเร็จ", present: "มีแรงบันดาลใจ มองโลกในแง่บวกและมีความหวัง", future: "สิ่งแวดล้อมรอบตัวจะสดใส นำพาความสงบสุขมาให้" },
        love: { past: "มูฟออนได้แล้ว หรือเจอคนที่เป็นดั่งเพื่อนแท้", present: "ความสัมพันธ์ร่มเย็น ไว้ใจและเยียวยากัน", future: "รักที่บริสุทธิ์และเป็นกำลังใจให้กันและกัน" },
        money: { past: "การเงินเริ่มฟื้นตัว มองเห็นลู่ทางแจ่มใส", present: "มีคนอุปถัมภ์ช่วยเหลือ หรือได้เงินจากงานศิลปะ", future: "ความมั่งคั่งจะค่อยๆ เติบโตอย่างยั่งยืน" },
        work: { past: "ผลงานเป็นที่ยอมรับและมีชื่อเสียง", present: "ทำงานด้วยแพสชั่น ไอเดียสร้างสรรค์พุ่งปรี๊ด", future: "จะโด่งดัง เป็นที่รู้จักในสายงานของตัวเอง" },
        reversedMeaning: "การหมดหวัง ท้อแท้ มองโลกในแง่ร้าย หรือพรสวรรค์ที่เหือดแห้ง"
    },
    {
        name: "18. The Moon", score: 40,
        general: { past: "ตกอยู่ในความหวาดระแวง หรือโดนหลอกลวง", present: "มีความสับสน คลุมเครือ มองไม่เห็นทางออกที่ชัดเจน", future: "ลางสังหรณ์จะเตือนภัย ระวังภาพลวงตา" },
        love: { past: "รักซ้อน ซ่อนเงื่อน หรือระแวงกันเอง", present: "ไม่แน่ใจในความรู้สึกตัวเองหรือของอีกฝ่าย", future: "ความลับจะค่อยๆ ปรากฏ อย่าด่วนสรุป" },
        money: { past: "เสียเงินเพราะความใจอ่อน หรือโดนโกง", present: "สถานะการเงินคลุมเครือ มีรายจ่ายแฝง", future: "ระวังมิจฉาชีพ หรือการลงทุนที่มีความเสี่ยงสูงซ่อนอยู่" },
        work: { past: "บรรยากาศในที่ทำงานมาคุ หรือมีศัตรูแอบแฝง", present: "อึดอัดกับงานที่ไม่ชัดเจน เจ้านายโลเล", future: "ต้องใช้สัญชาตญาณจับผิดสิ่งผิดปกติในงาน" },
        reversedMeaning: "ความสับสนคลี่คลาย ความจริงปรากฏ หรือตื่นจากฝันร้ายหลุดพ้นความหวาดระแวง"
    },
    {
        name: "19. The Sun", score: 100,
        general: { past: "ชีวิตเต็มไปด้วยความสดใสและพลังงานบวก", present: "ความสำเร็จและความชัดเจนกำลังสาดส่องมาที่คุณ", future: "รุ่งโรจน์ สมหวังดั่งใจปรารถนาทุกประการ" },
        love: { past: "รักที่เปิดเผย จริงใจ และมีความสุขสุดๆ", present: "เสน่ห์แรง ใครเห็นก็รัก ความสัมพันธ์เบ่งบาน", future: "อาจมีเกณฑ์ข่าวดีเรื่องบุตร หรือแต่งงานชื่นมื่น" },
        money: { past: "โชคลาภเข้าข้าง หยิบจับอะไรก็เป็นเงิน", present: "ได้ลาภลอยก้อนโต หรือโบนัสก้อนใหญ่", future: "อิสรภาพทางการเงินอยู่ไม่ไกลเกินเอื้อม" },
        work: { past: "ผลงานชิ้นโบว์แดงได้รับการยกย่อง", present: "ได้รับโปรโมท เลื่อนขั้น ได้รับคำชมเชย", future: "ธุรกิจรุ่งเรือง ชื่อเสียงขจรขจาย ไร้อุปสรรค" },
        reversedMeaning: "ความสำเร็จที่ล่าช้า ความสุขที่ยังไม่เต็มร้อย หรือความเหนื่อยล้าจากการทำงานหนักเกินไป"
    },
    {
        name: "20. Judgement", score: 80,
        general: { past: "เคยผ่านการตัดสินใจครั้งใหญ่หรือได้รับผลกรรม", present: "ช่วงเวลาแห่งการตื่นรู้ ได้รับโอกาสครั้งที่สอง", future: "ผลแห่งความดีในอดีตจะส่งผลให้ได้รับรางวัลชีวิต" },
        love: { past: "ถ่านไฟเก่าคุ หรือมีการเคลียร์ใจกันชัดเจน", present: "ความสัมพันธ์มาถึงจุดที่ต้องฟันธงว่าจะไปต่อหรือพอ", future: "การให้อภัยและเริ่มต้นใหม่ด้วยความเข้าใจที่ลึกซึ้ง" },
        money: { past: "ได้เงินคืนจากลูกหนี้ หรือหุ้นที่เคยดอยไว้", present: "ได้รับผลตอบแทนจากการลงทุนในอดีต", future: "ข่าวดีทางเอกสารการเงิน การอนุมัติกู้ผ่าน" },
        work: { past: "ผ่านการประเมินหรือสอบแข่งขันมาอย่างเฉียดฉิว", present: "ได้โอกาสพิสูจน์ตัวเองอีกครั้งในสายงานเดิม", future: "จะได้รับการแต่งตั้งหรือเรียกตัวกลับไปรับตำแหน่ง" },
        reversedMeaning: "การปฏิเสธความจริง โทษคนอื่น ไม่ยอมรับผลการกระทำ หรือพลาดโอกาสสำคัญ"
    },
    {
        name: "21. The World", score: 100,
        general: { past: "ทำสิ่งหนึ่งสำเร็จลุล่วงอย่างสมบูรณ์แบบ", present: "วงจรชีวิตรอบหนึ่งเสร็จสมบูรณ์ พร้อมก้าวสู่บทใหม่", future: "ก้าวสู่สเกลที่ใหญ่ขึ้น เป็นที่ยอมรับระดับสากล" },
        love: { past: "ความรักที่ลงตัวและเติมเต็มซึ่งกันและกัน", present: "ความสัมพันธ์เข้าสู่เฟสที่มั่นคงที่สุด (หมั้น/แต่ง)", future: "พบรักทางไกล/ต่างชาติ หรือสร้างครอบครัวที่สมบูรณ์" },
        money: { past: "มีอิสรภาพทางการเงิน หมุนเงินราบรื่น", present: "เงินไหลมาเทมาจากการต่างประเทศหรือออนไลน์", future: "ความมั่งคั่งถึงขีดสุด ซื้อสินทรัพย์ใหญ่ได้สำเร็จ" },
        work: { past: "ปิดโปรเจกต์ใหญ่ได้อย่างสวยงาม", present: "งานขยายสเกล โกอินเตอร์ หรือเดินทางต่างประเทศ", future: "ความสำเร็จระดับสูงสุดในอาชีพที่คุณภาคภูมิใจ" },
        reversedMeaning: "ความไม่สมบูรณ์ โปรเจกต์ค้างคา ความสำเร็จที่ยังไปไม่ถึงจุดหมาย หรือกลัวการจบสิ้น"
    }
];

const dayTraits = [
    { day: "วันอาทิตย์", color: "สีแดง", colorCode: "#ff4757", luckyNum: "1, 8" },
    { day: "วันจันทร์", color: "สีเหลือง/ขาว", colorCode: "#eccc68", luckyNum: "2, 4" },
    { day: "วันอังคาร", color: "สีชมพู", colorCode: "#ff6b81", luckyNum: "3, 6" },
    { day: "วันพุธ", color: "สีเขียว", colorCode: "#2ed573", luckyNum: "4, 5" },
    { day: "วันพฤหัสบดี", color: "สีส้ม", colorCode: "#ffa502", luckyNum: "5, 9" },
    { day: "วันศุกร์", color: "สีฟ้า/น้ำเงิน", colorCode: "#1e90ff", luckyNum: "6, 2" },
    { day: "วันเสาร์", color: "สีม่วง/ดำ", colorCode: "#9b59b6", luckyNum: "7, 8" }
];

const soulMeanings = [
    "คุณมีจิตวิญญาณแห่งความเป็นเด็ก รักอิสระ กล้าเสี่ยงและชอบการผจญภัย ไม่ยึดติดกับอดีต", "คุณเป็นคนมีพรสวรรค์รอบด้าน มีไหวพริบ เรียนรู้เร็ว และสามารถเนรมิตสิ่งที่คิดให้เป็นจริงได้", "คุณมีลางสังหรณ์แม่นยำ เก็บความรู้สึกเก่ง มักเป็นที่ปรึกษาที่คนอื่นไว้ใจนำความลับมาเล่าให้ฟัง", "คุณมีจิตใจโอบอ้อมอารี ชอบดูแลเอาใจใส่ผู้อื่น มีเซนส์ด้านความงามและศิลปะสูง", "คุณมีความเป็นผู้นำสูง เด็ดขาด มีระเบียบวินัย และมักเป็นเสาหลักให้คนรอบข้างพึ่งพา", "คุณเป็นคนมีเหตุผล ชอบทำตามแบบแผน อนุรักษ์นิยม และมีสติปัญญาที่ชอบถ่ายทอดให้ผู้อื่น", "คุณมีเสน่ห์ดึงดูด ให้ความสำคัญกับความสัมพันธ์และการเข้าสังคม แต่มักต้องเจอเรื่องให้ตัดสินใจเสมอ", "คุณเป็นนักสู้ มุ่งมั่น ทะเยอทะยาน หากตั้งเป้าหมายอะไรไว้จะลุยไม่ถอยจนกว่าจะสำเร็จ", "คุณมีความเข้มแข็งจากภายใน ใช้ความอ่อนโยนสยบความแข็งกร้าว และอดทนต่อความกดดันได้ดีเยี่ยม", "คุณรักความสงบ ชอบคิดวิเคราะห์ ทบทวนสิ่งต่างๆ ด้วยตัวเอง และมีโลกส่วนตัวสูง", "ชีวิตคุณมักมีจุดพลิกผันที่คาดไม่ถึงเสมอ เป็นคนปรับตัวเก่ง และมักมีโชคในจังหวะที่พอดี", "คุณรักความยุติธรรม มีเหตุผล ตรงไปตรงมา และไม่ชอบการเอาเปรียบหรือความเอนเอียง", "คุณเป็นคนเสียสละ ยอมถอยเพื่อคนอื่น มักมีมุมมองความคิดที่แปลกแยกไม่เหมือนใคร", "ชีวิตคุณมักผ่านการเปลี่ยนแปลงครั้งใหญ่เพื่อเริ่มต้นใหม่ที่แกร่งกว่าเดิม เติบโตจากการสูญเสีย", "คุณเป็นนักประนีประนอม ปรับตัวเก่งเหมือนน้ำ ไกล่เกลี่ยความขัดแย้งได้ดีและชอบเดินทางสายกลาง", "คุณมีแรงขับเคลื่อนจากความปรารถนา มุ่งมั่นในสิ่งที่หลงใหล แต่อาจต้องระวังการยึดติดกับวัตถุ", "คุณมักเจอสถานการณ์ที่ท้าทายให้ต้องแก้ปัญหาเฉพาะหน้า เป็นคนคาดเดาได้ยากแต่อึดและทนทาน", "คุณเป็นคนมองโลกในแง่ดี มีความหวัง เป็นแรงบันดาลใจและคอยเยียวยาจิตใจคนรอบข้างได้ดี", "คุณมีจินตนาการสูง อ่อนไหวง่าย มักมีความคิดซับซ้อนและมีสัญชาตญาณที่ลึกซึ้ง", "คุณเป็นคนร่าเริง สดใส มีพลังงานบวกเปี่ยมล้น ใครอยู่ใกล้ก็มีความสุขและมักเป็นจุดเด่นเสมอ", "คุณเป็นคนตื่นรู้ เรียนรู้จากความผิดพลาดในอดีต และพร้อมจะให้อภัยเพื่อก้าวไปข้างหน้า", "คุณเป็นคนที่ทำอะไรมักจะไปให้สุดทาง รักความสมบูรณ์แบบ และมีวิสัยทัศน์ที่กว้างไกลระดับสากล"
];

// 🌟 Phase 2 - ระบบที่ 5: ฐานข้อมูลข้อความให้กำลังใจจากจักรวาล
const oracleDB = [
    "จักรวาลกำลังจัดสรรสิ่งที่ดีที่สุดมาให้คุณ จงวางใจในจังหวะของเวลา",
    "ปล่อยวางอดีตที่ทำร้ายคุณ แล้วเปิดรับแสงสว่างแห่งการเริ่มต้นใหม่",
    "คุณมีพลังเข้มแข็งกว่าที่คุณคิด จงเชื่อมั่นในศักยภาพของตนเอง",
    "ความรักและความเมตตาที่คุณมอบให้ผู้อื่น กำลังจะสะท้อนกลับมาหาคุณในไม่ช้า",
    "ทุกอุปสรรคคือบททดสอบ ที่จะเจียระไนให้คุณเปล่งประกายงดงามยิ่งขึ้น",
    "จงอนุญาตให้ตัวเองมีความสุขตั้งแต่วันนี้ เพราะคุณคู่ควรกับสิ่งที่ดีที่สุด",
    "ปาฏิหาริย์เกิดขึ้นได้เสมอ เพียงแค่คุณไม่หยุดศรัทธาและลงมือทำ",
    "คำตอบที่คุณตามหาซ่อนอยู่ภายในใจคุณเอง จงหาเวลาสงบนิ่งและรับฟังมัน",
    "ความกังวลไม่ได้ช่วยแก้ปัญหาในวันพรุ่งนี้ จงทำวันนี้ให้ดีที่สุดก็พอ",
    "เส้นทางที่คุณเดินอยู่คือเส้นทางที่ใช่แล้ว จงก้าวต่อไปด้วยความมั่นใจ"
];

// 🌟 Phase 2 - ระบบที่ 4: ฟังก์ชันคำนวณราศีเกิดและธาตุ
function getZodiac(dob) {
    if (!dob) return { sign: "ไม่ทราบราศี", element: "?", color: "#fff", advice: "" };
    const [, monthStr, dayStr] = dob.split('-');
    const m = parseInt(monthStr);
    const d = parseInt(dayStr);

    if ((m === 3 && d >= 21) || (m === 4 && d <= 19)) return { sign: "ราศีเมษ", element: "ไฟ", color: "#ff4757", advice: "ช่วงนี้พลังงานล้นเหลือ ควรใช้ความกระตือรือร้นผลักดันเป้าหมาย แต่อย่าใจร้อนเกินไป" };
    if ((m === 4 && d >= 20) || (m === 5 && d <= 20)) return { sign: "ราศีพฤษภ", element: "ดิน", color: "#2ed573", advice: "เน้นความมั่นคง ค่อยเป็นค่อยไป ช่วงนี้การวางแผนระยะยาวจะส่งผลดีที่สุด" };
    if ((m === 5 && d >= 21) || (m === 6 && d <= 20)) return { sign: "ราศีเมถุน", element: "ลม", color: "#1e90ff", advice: "ความคิดสร้างสรรค์และทักษะการสื่อสารจะนำพาโอกาสใหม่ๆ มาให้" };
    if ((m === 6 && d >= 21) || (m === 7 && d <= 22)) return { sign: "ราศีกรกฎ", element: "น้ำ", color: "#1abc9c", advice: "ใช้สัญชาตญาณและรับฟังความรู้สึกให้มาก ช่วงนี้เซนส์ของคุณแม่นยำเป็นพิเศษ" };
    if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) return { sign: "ราศีสิงห์", element: "ไฟ", color: "#ff4757", advice: "ดึงความมั่นใจและภาวะผู้นำออกมาใช้ คุณจะเป็นที่โดดเด่นในสายตาคนรอบข้าง" };
    if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) return { sign: "ราศีกันย์", element: "ดิน", color: "#2ed573", advice: "ความละเอียดรอบคอบคืออาวุธสำคัญของคุณ จัดระเบียบชีวิตแล้วทุกอย่างจะราบรื่น" };
    if ((m === 9 && d >= 23) || (m === 10 && d <= 22)) return { sign: "ราศีตุลย์", element: "ลม", color: "#1e90ff", advice: "การรักษาสมดุลและประนีประนอมจะช่วยแก้ปัญหาความขัดแย้งได้ดีที่สุด" };
    if ((m === 10 && d >= 23) || (m === 11 && d <= 21)) return { sign: "ราศีพิจิก", element: "น้ำ", color: "#1abc9c", advice: "ความมุ่งมั่นและโฟกัสที่แน่วแน่จะช่วยให้คุณเจาะลึกถึงแก่นแท้ของปัญหา" };
    if ((m === 11 && d >= 22) || (m === 12 && d <= 21)) return { sign: "ราศีธนู", element: "ไฟ", color: "#ff4757", advice: "เปิดรับมุมมองใหม่ๆ การเดินทางหรือการเรียนรู้สิ่งใหม่จะนำโชคลาภมาให้" };
    if ((m === 12 && d >= 22) || (m === 1 && d <= 19)) return { sign: "ราศีมังกร", element: "ดิน", color: "#2ed573", advice: "ความอดทนและระเบียบวินัยจะปูทางไปสู่ความสำเร็จที่ยิ่งใหญ่และมั่นคง" };
    if ((m === 1 && d >= 20) || (m === 2 && d <= 18)) return { sign: "ราศีกุมภ์", element: "ลม", color: "#1e90ff", advice: "คิดนอกกรอบและกล้าแตกต่าง ไอเดียที่ไม่เหมือนใครจะสร้างจุดเปลี่ยนให้คุณ" };
    if ((m === 2 && d >= 19) || (m === 3 && d <= 20)) return { sign: "ราศีมีน", element: "น้ำ", color: "#1abc9c", advice: "ความเมตตาและจินตนาการคือพลังของคุณ ปล่อยให้ความรู้สึกนำทางไปสู่ความสงบ" };
    
    return { sign: "ไม่ทราบราศี", element: "?", color: "#fff", advice: "" };
}

// 🌟 Phase 2 - ระบบที่ 10: ฟังก์ชันคำนวณข้างขึ้นข้างแรม (Moon Phase)
function getMoonPhase() {
    const date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    const day = date.getDate();

    if (month < 3) {
        year--;
        month += 12;
    }
    month++;
    
    const c = 365.25 * year;
    const e = 30.6 * month;
    let jd = c + e + day - 694039.09; 
    jd /= 29.5305882; 
    let b = parseInt(jd); 
    jd -= b; 
    b = Math.round(jd * 8); 

    if (b >= 8) b = 0; 

    const phases = [
        { name: "จันทร์ดับ (New Moon)", advice: "พลังงานแห่งการตั้งเป้าหมายและเริ่มต้นสิ่งใหม่" },
        { name: "จันทร์เสี้ยวข้างขึ้น (Waxing Crescent)", advice: "สะสมพลังงานและลุยตามแผนที่วางไว้" },
        { name: "จันทร์ครึ่งดวงข้างขึ้น (First Quarter)", advice: "ถึงเวลาลงมือทำและฟันฝ่าอุปสรรค" },
        { name: "จันทร์ค่อนดวงข้างขึ้น (Waxing Gibbous)", advice: "ปรับปรุงและประเมินผล พลังงานกำลังเพิ่มขึ้น" },
        { name: "จันทร์เพ็ญ (Full Moon)", advice: "พลังงานสูงสุด! เหมาะแก่การดึงดูดความสำเร็จ" },
        { name: "จันทร์ค่อนดวงข้างแรม (Waning Gibbous)", advice: "แสดงความขอบคุณและเริ่มปล่อยวางสิ่งที่ไม่ได้ผล" },
        { name: "จันทร์ครึ่งดวงข้างแรม (Last Quarter)", advice: "เคลียร์ปัญหา ทบทวนตัวเอง และทำความสะอาดพื้นที่" },
        { name: "จันทร์เสี้ยวข้างแรม (Waning Crescent)", advice: "พักผ่อน ฟื้นฟูจิตใจ เตรียมรับรอบใหม่" }
    ];
    return phases[b];
}

let selectedCards = [];
let user = {};

function startReading() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    isReading = false;

    user.name = document.getElementById('user-name').value;
    user.dob = document.getElementById('user-dob').value;
    user.dayIndex = document.getElementById('user-day').value;
    user.topic = document.getElementById('user-topic').value;
    user.spread = parseInt(document.getElementById('user-spread').value) || 3;
    user.question = document.getElementById('user-question').value.trim(); 
    
    if (user.spread === 4) {
        user.topic = 'love'; 
        document.getElementById('user-topic').value = 'love'; 
    }

    if (!user.name || !user.dob) return showToast("โปรดกรอกข้อมูลให้ครบถ้วนก่อนเริ่มทำนายครับ");

    const today = new Date().toDateString();
    const savedKey = `zenith_${user.name}_${user.topic}_${user.spread}`;
    const saved = JSON.parse(localStorage.getItem(savedKey));

    if (saved && saved.date === today) {
        user = saved.user;
        selectedCards = saved.cards;
        showToast("✨ ระบบดึงคำทำนายที่คุณเคยเปิดไว้ของวันนี้มาให้แล้วครับ");
        safePlay(sfxStart);
        showResults('step-1');
        return;
    }

    const spreadContainer = document.getElementById('table-spread-container');
    if (user.spread === 1) {
        spreadContainer.innerHTML = `<div class="slot" data-label="คำทำนาย"><i data-lucide="star"></i></div>`;
    } else if (user.spread === 4) {
        spreadContainer.innerHTML = `
            <div class="slot" data-label="คุณ"><i data-lucide="user"></i></div>
            <div class="slot" data-label="เขา"><i data-lucide="heart"></i></div>
            <div class="slot" data-label="อุปสรรค"><i data-lucide="shield-alert"></i></div>
            <div class="slot" data-label="สรุป"><i data-lucide="sparkles"></i></div>
        `;
    } else {
        spreadContainer.innerHTML = `
            <div class="slot" data-label="อดีต"><i data-lucide="history"></i></div>
            <div class="slot" data-label="ปัจจุบัน"><i data-lucide="zap"></i></div>
            <div class="slot" data-label="อนาคต"><i data-lucide="eye"></i></div>
        `;
    }

    const topicNames = { 'general': 'ภาพรวมชีวิต', 'love': 'ความรัก', 'money': 'การเงิน', 'work': 'การงาน' };
    document.getElementById('deck-title').innerText = `เลือกไพ่ทำนายเรื่อง${topicNames[user.topic]}`;
    document.getElementById('progress-text').innerText = `ตั้งสมาธิแล้วเลือกไพ่ 0 / ${user.spread} ใบ`;

    const focusQ = document.getElementById('focus-question-display');
    if (focusQ) {
        if (user.question) {
            focusQ.innerHTML = `&ldquo;${user.question}&rdquo;`;
            focusQ.style.display = 'block';
        } else {
            focusQ.style.display = 'none';
        }   
    }

    safePlay(sfxStart);
    if(!isMuted) bgmMystic.play().catch(e => {}); // 🌟 เพิ่มบรรทัดนี้เพื่อเริ่มเปิดเพลงคลอ
    switchScene('step-1', 'step-2');
    switchScene('step-1', 'step-2');
    generateDeck();
    if(window.lucide) lucide.createIcons();
}


// อัปเกรด: ระบบสร้างสำรับไพ่แบบกรีดโค้ง (แก้ปัญหาไพ่ล้นจอ และแตะ 2 จังหวะในมือถือแบบชัวร์ 100%)
function generateDeck() {
    const deck = document.getElementById('card-deck');
    deck.innerHTML = '';
    selectedCards = [];
    
    const totalCards = 42;
    const screenWidth = window.innerWidth;
    
    // หุบองศาพัดเหลือ 100 องศาถ้าจอมือถือ (กว้างไม่เกิน 768px)
    const maxSpreadAngle = screenWidth <= 768 ? 100 : 140;
    const startAngle = -maxSpreadAngle / 2;
    const angleStep = maxSpreadAngle / (totalCards - 1);

    for(let i = 0; i < totalCards; i++) {
        const c = document.createElement('div');
        c.className = 'card-mini';
        
        const currentAngle = startAngle + (i * angleStep);
        
        c.style.transform = `rotate(${currentAngle}deg)`;
        c.style.zIndex = i;
        c.dataset.angle = currentAngle; 
        c.dataset.zIndex = i; 

        // 🌟 ตัวแปรป้องกันบั๊กกดเบิ้ล (Ghost Click) ประจำไพ่แต่ละใบ
        let lastClickTime = 0;

        c.onclick = function(e) {
            // ป้องกันการกดไพ่ใบที่บินไปแล้ว
            if (this.classList.contains('picked')) return;

            // 🛑 เวทมนตร์แก้บั๊ก: ป้องกันเบราว์เซอร์ส่งคำสั่งคลิก 2 ครั้งซ้อนกันในเสี้ยววินาที
            const now = Date.now();
            if (now - lastClickTime < 300) return; 
            lastClickTime = now;

            // ตรวจสอบว่าเป็นมือถือหรือไม่ (ใช้ความกว้างหน้าจอเป็นหลัก ชัวร์ที่สุด)
            const isMobile = window.innerWidth <= 768;

            if (isMobile) {
                // ถ้ายังไม่ถูกโฟกัส (แตะครั้งแรก)
                if (!this.classList.contains('focused')) {
                    
                    // 1. เอาโฟกัสไพ่ใบอื่นลงให้หมด
                    document.querySelectorAll('.card-mini.focused').forEach(card => {
                        card.classList.remove('focused');
                        card.style.transform = `rotate(${card.dataset.angle}deg)`;
                        card.style.zIndex = card.dataset.zIndex;
                        card.style.borderColor = "rgba(212, 175, 55, 0.5)";
                    });
                    
                    // 2. โฟกัสไพ่ใบนี้ (เด้งขึ้นมาให้เห็นชัดๆ)
                    this.classList.add('focused');
                    
                    const liftDistance = window.innerWidth < 500 ? -40 : -30;
                    this.style.transform = `rotate(${currentAngle}deg) translateY(${liftDistance}px) scale(1.2)`;
                    this.style.zIndex = 100;
                    this.style.borderColor = "var(--gold-bright)";
                    
                    if (navigator.vibrate) navigator.vibrate(50);
                    
                    return; // 🛑 สั่งหยุดการทำงานตรงนี้ เพื่อรอให้ผู้ใช้แตะซ้ำอีกรอบ
                }
            }
            
            // 🌟 ถ้าเป็นคอมพิวเตอร์ หรือ มือถือที่ "แตะซ้ำใบเดิม" แล้ว จะทำงานส่วนนี้
            
            // 1. ลบคลาสโฟกัสออก
            this.classList.remove('focused'); 
            
            // 2. เรียกฟังก์ชันบินเข้าสล็อต
            pickCard(this); 
        };

        // 💻 ระบบ Hover สำหรับคอมพิวเตอร์ (ไม่ทำงานในมือถือ)
        c.onmouseenter = function() {
            if (window.innerWidth <= 768) return; // มือถือไม่ต้องทำ
            if(!this.classList.contains('picked')) {
                this.style.transform = `rotate(${currentAngle}deg) translateY(-25px) scale(1.15)`;
                this.style.zIndex = 100;
                this.style.borderColor = "var(--gold-bright)";
            }
        };
        
        c.onmouseleave = function() {
            if (window.innerWidth <= 768) return; // มือถือไม่ต้องทำ
            if(!this.classList.contains('picked') && !this.classList.contains('focused')) {
                this.style.transform = `rotate(${currentAngle}deg)`;
                this.style.zIndex = this.dataset.zIndex;
                this.style.borderColor = "rgba(212, 175, 55, 0.5)";
            }
        };
        
        deck.appendChild(c);
    }
}

// อัปเกรด: ระบบไพ่พุ่งเข้าสล็อต (Card Flight Animation) รองรับมือถือ 100%
function pickCard(el) {
    if (selectedCards.length >= user.spread) return;
    safePlay(sfxPick);

    // 1. สุ่มไพ่จากฐานข้อมูล
    let cardTemplate = finalTarotDB[Math.floor(Math.random() * finalTarotDB.length)];
    while(selectedCards.some(c => c.name === cardTemplate.name)) {
        cardTemplate = finalTarotDB[Math.floor(Math.random() * finalTarotDB.length)];
    }
    const isReversed = Math.random() > 0.7; 
    const card = { ...cardTemplate, isReversed };
    selectedCards.push(card);

    // 2. ซ่อนไพ่ใบที่โดนจิ้มในกอง
    el.classList.add('picked');

    // ==========================================
    // 🚀 เริ่มกระบวนการ Card Flight Animation
    // ==========================================
    const slots = document.querySelectorAll('.slot');
    const targetSlot = slots[selectedCards.length - 1]; // ช่องเป้าหมายที่ไพ่ต้องบินไปลง
    
    // คำนวณพิกัด X, Y บนหน้าจอ (เป๊ะทั้งคอมและมือถือ)
    const startRect = el.getBoundingClientRect();
    const targetRect = targetSlot.getBoundingClientRect();

    // สร้างไพ่ร่างแยก (Clone) เพื่อบิน
    const flyingCard = document.createElement('div');
    flyingCard.className = 'flying-card';
    
    // ตั้งพิกัดเริ่มต้นให้อยู่ตรงกับไพ่ที่ถูกจิ้มเป๊ะๆ
    flyingCard.style.left = `${startRect.left}px`;
    flyingCard.style.top = `${startRect.top}px`;
    
    // ดึงองศาเดิมของไพ่ใบนั้นมา เพื่อให้ตอนเริ่มบินมันเอียงตามรูปพัด
    const startAngle = el.dataset.angle || 0;
    flyingCard.style.transform = `rotate(${startAngle}deg)`;

    document.body.appendChild(flyingCard);

    // บังคับให้เบราว์เซอร์เตรียมตัวรับแอนิเมชัน (Reflow)
    void flyingCard.offsetWidth;

    // สั่งให้ไพ่บินไปที่เป้าหมาย!
    flyingCard.style.left = `${targetRect.left}px`;
    flyingCard.style.top = `${targetRect.top}px`;
    
    // ปรับขนาดให้พอดีกับช่องสล็อตเป้าหมาย และหมุนกลับมาตั้งตรง (0deg)
    flyingCard.style.width = `${targetRect.width}px`;
    flyingCard.style.height = `${targetRect.height}px`;
    flyingCard.style.transform = `rotate(0deg)`;

    // เมื่อบินเสร็จสิ้น (ใช้เวลา 600ms ตาม CSS)
    setTimeout(() => {
        flyingCard.remove(); // ลบไพ่ที่กำลังบินทิ้งไป
        
        // เติมลูกแก้ว 🔮 ลงในช่องสล็อต พร้อมเอฟเฟกต์แสง
        targetSlot.classList.add('filled');
        targetSlot.innerHTML = `<span style="font-size:2rem; animation:fadeIn 0.5s">🔮</span>`;
        targetSlot.style.opacity = "1";
        
        // อัปเดตหลอด Progress
        document.getElementById('progress-bar').style.width = (selectedCards.length / user.spread * 100) + "%";
        document.getElementById('progress-text').innerText = `ตั้งสมาธิแล้วเลือกไพ่ ${selectedCards.length} / ${user.spread} ใบ`;

        // ถ้าเลือกครบแล้ว ให้ไปหน้าผลลัพธ์
        if (selectedCards.length === user.spread) {
            setTimeout(() => showResults('step-2'), 1000);
        }
    }, 600); 
}

function calculateSoulNum(dob) {
    const sum = dob.replace(/-/g, '').split('').map(Number).reduce((a, b) => a + b, 0);
    return sum > 21 ? calculateSoulNum(sum.toString()) : sum;
}

function showResults(fromScene = 'step-2') {
    switchScene(fromScene, 'step-3');
    
    if (fromScene === 'step-2') {
        const today = new Date().toDateString();
        const savedKey = `zenith_${user.name}_${user.topic}_${user.spread}`;
        localStorage.setItem(savedKey, JSON.stringify({ date: today, user: user, cards: selectedCards }));
        
        // 🌟 ถ้านี่คือการเปิดไพ่ 1 ใบ ให้บันทึกวันที่เพื่อล็อคโหมดรายวัน
        if (user.spread === 1) {
            localStorage.setItem('zenith_daily_draw_date', today);
        }
    }

    const topicNames = { 'general': 'ภาพรวมชีวิต', 'love': 'ความรักเจาะลึก', 'money': 'การเงิน', 'work': 'การงาน' };
    const finalTopicText = user.spread === 4 ? "ความสัมพันธ์ความรัก" : topicNames[user.topic];
    document.getElementById('res-user-title').innerText = `คำทำนายเรื่อง${finalTopicText}: คุณ ${user.name}`;

    const resQ = document.getElementById('res-question-display');
    if (resQ) {
        if (user.question) {
            resQ.innerHTML = `เรื่องที่ถาม: "${user.question}"`;
            resQ.style.display = 'block';
        } else {
            resQ.style.display = 'none';
        }
    }
    
    const soulIndex = calculateSoulNum(user.dob);
    const soulCard = finalTarotDB[soulIndex];
    const userDayInfo = dayTraits[user.dayIndex];
    const zodiacInfo = getZodiac(user.dob);
    const moonInfo = getMoonPhase(); // 🌟 ดึงข้อมูลดวงจันทร์วันนี้
    
    const traitsContainer = document.getElementById('personal-traits');
    traitsContainer.innerHTML = `
        <div class="trait-badge"><i data-lucide="star" size="14"></i> ไพ่ประจำตัว: ${soulCard.name}</div>
        <div class="trait-badge"><i data-lucide="moon" size="14"></i> ${zodiacInfo.sign} (ธาตุ${zodiacInfo.element})</div>
        <div class="trait-badge">
            <span class="color-dot" style="background-color: ${userDayInfo.colorCode};"></span>
            สีมงคล: ${userDayInfo.color}
        </div>
        <div class="trait-badge"><i data-lucide="hash" size="14"></i> เลขนำโชค: ${userDayInfo.luckyNum}</div>
        <div class="trait-badge"><i data-lucide="sparkles" size="14"></i> พลังงานวันนี้: ${moonInfo.name}</div>
    `;

    const soulHighlight = document.getElementById('soul-card-highlight');
    if(soulHighlight) {
        soulHighlight.style.display = 'flex';
        soulHighlight.style.animation = 'fadeIn 0.5s ease 0.2s both';
        soulHighlight.innerHTML = `
            <h3 class="soul-title"><i data-lucide="sparkles"></i> ตัวตนเบื้องลึกของคุณ</h3>
            <p class="soul-desc">พลังงานจากไพ่ <strong>${soulCard.name}</strong> บ่งบอกว่า... ${soulMeanings[soulIndex]}</p>
            <p class="soul-desc" style="margin-top: 10px; color: ${zodiacInfo.color}; border-top: 1px dashed rgba(255,255,255,0.2); padding-top: 10px;">
                <i data-lucide="flame" size="14" style="vertical-align: middle;"></i> <strong>คำแนะนำเสริมสำหรับคนธาตุ${zodiacInfo.element}:</strong> ${zodiacInfo.advice}
            </p>
            <p class="soul-desc" style="margin-top: 10px; color: var(--gold-bright); border-top: 1px dashed rgba(255,255,255,0.2); padding-top: 10px;">
                <i data-lucide="moon" size="14" style="vertical-align: middle;"></i> <strong>อิทธิพลดวงจันทร์วันนี้:</strong> ${moonInfo.advice}
            </p>
        `;
    }

    const totalScore = selectedCards.reduce((a, b) => a + (b.isReversed ? b.score - 10 : b.score), 0);
    const avg = Math.floor(totalScore / user.spread);
    updateScore('score-love', avg + 5);
    updateScore('score-money', avg - 5);
    updateScore('score-work', avg);

    const details = document.getElementById('detailed-results');
    details.innerHTML = ''; 

    if (user.question && user.question.trim() !== '') {
        let answerText = "";
        let answerColor = "";
        
        if (avg >= 80) {
            answerText = "โอกาสสำเร็จสูงมาก! พลังงานไพ่เป็นใจ สิ่งที่คุณหวังไว้มีเกณฑ์สมหวัง ให้ลุยด้วยความมั่นใจได้เลยครับ";
            answerColor = "#2ed573"; 
        } else if (avg >= 60) {
            answerText = "มีแนวโน้มที่ดีครับ แต่อาจจะต้องใช้เวลาหรือความพยายามเพิ่มขึ้นอีกนิด สิ่งที่หวังจึงจะสำเร็จเป็นรูปเป็นร่าง";
            answerColor = "#1e90ff"; 
        } else if (avg >= 40) {
            answerText = "สถานการณ์ยัง 50/50 ครับ ไพ่แนะนำให้คุณเตรียมแผนสำรองเอาไว้ และอย่าเพิ่งคาดหวังผลลัพธ์ในระยะสั้น";
            answerColor = "#ffa502"; 
        } else {
            answerText = "ช่วงนี้พลังงานค่อนข้างท้าทายครับ สิ่งที่หวังอาจจะเจออุปสรรคใหญ่ ขอให้มีสติ ใจเย็นๆ และอย่าเพิ่งด่วนตัดสินใจใดๆ";
            answerColor = "#ff4757"; 
        }

        user.finalAnswer = answerText; 

        details.innerHTML += `
        <div class="result-row" style="background: rgba(10, 10, 15, 0.8); border-left: 4px solid ${answerColor}; flex-direction: column; align-items: flex-start;">
            <div style="width: 100%; text-align: center; margin-bottom: 10px;">
                <h4 style="color: var(--gold-bright); margin: 0 0 5px 0;"><i data-lucide="help-circle"></i> คำถามของคุณ</h4>
                <h3 style="color: #fff; font-style: italic; margin: 0;">"${user.question}"</h3>
            </div>
            <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px; width: 100%; box-sizing: border-box;">
                <strong style="color: ${answerColor}; font-size: 1rem;"><i data-lucide="message-circle"></i> สรุปคำตอบแบบฟันธง:</strong>
                <p style="margin: 8px 0 0 0; font-size: 0.95rem; color: #eee; line-height: 1.6;">${answerText}</p>
            </div>
        </div>
        `;
    }

    let positionTitles = [];
    if (user.spread === 1) {
        positionTitles = ["คำทำนายและคำแนะนำ (Guidance)"];
    } else if (user.spread === 4) {
        positionTitles = ["1. สิ่งที่คุณคิด/รู้สึก (You)", "2. สิ่งที่เขาคิด/รู้สึก (Them)", "3. อุปสรรค/สิ่งที่ต้องระวัง (Obstacles)", "4. บทสรุปความสัมพันธ์ (Outcome)"];
    } else {
        positionTitles = ["อดีตที่ผ่านมา", "สถานการณ์ปัจจุบัน", "แนวโน้มในอนาคต"];
    }
    
    // ==========================================
    // 🌟 สร้าง HTML ไพ่ (ลบ Delay อัตโนมัติออก และซ่อนไว้ก่อนด้วย opacity: 0)
    // ==========================================
    details.innerHTML += selectedCards.map((c, i) => {
        let predictionText = '';
        
        if (user.spread === 4) {
            if (i === 0) predictionText = c.love.present; 
            else if (i === 1) predictionText = c.love.present; 
            else if (i === 2) predictionText = c.reversedMeaning; 
            else if (i === 3) predictionText = c.love.future; 
        } 
        else if (user.spread === 1) {
            predictionText = c[user.topic].present;
        } 
        else {
            const posKeys = ["past", "present", "future"];
            predictionText = c[user.topic][posKeys[i]];
        }
        
        const cardNameOnly = c.name.split('. ')[1] || c.name;
        const imgUrl = `https://placehold.co/180x290/1a1a2e/d4af37?text=${encodeURIComponent(cardNameOnly)}&font=montserrat`;
        
        const reversedBadge = c.isReversed ? '<span class="reversed-badge">หัวกลับ (Reversed)</span>' : '';
        const reversedWarning = c.isReversed && user.spread !== 4 ? `<div class="reversed-text"><i data-lucide="alert-triangle" size="14"></i> <strong>ข้อควรระวัง:</strong> ${c.reversedMeaning}</div>` : '';

        // 🌟 เปลี่ยนมาใช้คลาส scroll-reveal แทนการใส่ Delay
        return `
        <div class="result-row tarot-row scroll-reveal" style="opacity: 0;">
            
            <div class="tarot-flip-container">
                <div class="tarot-flip-inner ${c.isReversed ? 'is-reversed' : ''}">
                    <div class="tarot-flip-front"></div>
                    <div class="tarot-flip-back" style="background-image: url('${imgUrl}')"></div>
                </div>
            </div>
            
            <div class="result-text" style="opacity: 0;">
                <h4 style="margin:0 0 5px 0; color:var(--gold); font-weight:600; font-size: 0.9rem;">${positionTitles[i]}</h4>
                <h5 style="margin:0 0 10px 0; color:#fff; font-size: 1.1rem; letter-spacing: 0.5px;">
                    ${c.name} ${reversedBadge}
                </h5>
                <p style="margin:0; font-size:0.9rem; line-height:1.6; color:#ddd;">
                    ${predictionText}
                </p>
                ${reversedWarning}
            </div>

        </div>
        `;
    }).join('');

    // ==========================================
    // 🌟 ระบบจับการเลื่อนจอ (Scroll Observer) สำหรับไพ่
    // ==========================================
    const cardObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const row = entry.target;
                
                // 1. ให้กล่องรวมเฟดขึ้นมาก่อน
                row.style.animation = 'fadeIn 0.5s ease forwards';
                
                const flipInner = row.querySelector('.tarot-flip-inner');
                const resText = row.querySelector('.result-text');
                
                // 2. หน่วงเวลา 0.3 วิ ค่อยพลิกไพ่
                setTimeout(() => {
                    if(flipInner) {
                        flipInner.style.animation = flipInner.classList.contains('is-reversed') 
                            ? 'flipCardAnimReversed 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
                            : 'flipCardAnim 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
                    }
                }, 300); 

                // 3. หน่วงเวลา 0.8 วิ (รอไพ่พลิกเสร็จ) ค่อยโชว์ข้อความ
                setTimeout(() => {
                    if(resText) resText.style.animation = 'fadeInTextAfterFlip 0.6s ease forwards';
                }, 800); 

                // เลิกติดตามกล่องนี้ (ให้เล่นแอนิเมชันแค่รอบเดียว)
                obs.unobserve(row);
            }
        });
    }, { threshold: 0.3 }); // 🌟 ทำงานเมื่อเลื่อนมาเห็นกล่อง 30%

    // สั่งให้ Observer เริ่มจับตาดูกล่องไพ่ทั้งหมด
    document.querySelectorAll('.tarot-row.scroll-reveal').forEach(row => {
        cardObserver.observe(row);
    });

    // ==========================================
    // 🌟 ระบบเครื่องพิมพ์ดีด + Scroll Observer สำหรับออราเคิล
    // ==========================================
    function typeWriterEffect(text, elementId, speed) {
        let i = 0;
        const element = document.getElementById(elementId);
        if(!element) return;
        element.innerHTML = '';
        element.classList.add('typewriter-text'); 
        
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else {
                element.classList.remove('typewriter-text'); // พิมพ์เสร็จให้เอาเคอร์เซอร์ออก
            }
        }
        type();
    }

    const oracleBox = document.getElementById('oracle-blessing');
    if(oracleBox) {
        const randomOracle = oracleDB[Math.floor(Math.random() * oracleDB.length)];
        
        oracleBox.style.display = 'block';
        oracleBox.style.opacity = '0'; // ซ่อนไว้ก่อน
        
        oracleBox.innerHTML = `
            <h3 class="oracle-title"><i data-lucide="feather"></i> ไพ่ออราเคิล (Oracle Blessing)</h3>
            <p class="oracle-desc" id="oracle-typewriter-text"></p>
        `;

        // สร้าง Observer สำหรับกล่องออราเคิลโดยเฉพาะ
        const oracleObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // 1. ให้กล่องเฟดขึ้นมา
                    oracleBox.style.animation = `fadeIn 0.8s ease forwards`; 
                    
                    // 2. รอ 0.8 วิให้กล่องชัด ค่อยเริ่มพิมพ์ดีด
                    setTimeout(() => {
                        typeWriterEffect(`"${randomOracle}"`, 'oracle-typewriter-text', 40); 
                    }, 800);
                    
                    obs.unobserve(oracleBox);
                }
            });
        }, { threshold: 0.4 }); // 🌟 ทำงานเมื่อเลื่อนมาเห็นกล่อง 40%

        oracleObserver.observe(oracleBox);
    }
    
    if(window.lucide) lucide.createIcons();
}
    // ==========================================
    // 🌟 ระบบที่ 7: เครื่องพิมพ์ดีดเวทมนตร์ (Oracle Typewriter Effect)
    // ==========================================
    
    // ฟังก์ชันช่วยพิมพ์ดีดทีละตัวอักษร
    function typeWriterEffect(text, elementId, speed) {
        let i = 0;
        const element = document.getElementById(elementId);
        element.innerHTML = '';
        element.classList.add('typewriter-text'); // ใส่คลาสเพื่อให้มีเคอร์เซอร์กะพริบ
        
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else {
                element.classList.remove('typewriter-text'); // พิมพ์เสร็จให้เอาเคอร์เซอร์ออก
            }
        }
        type();
    }

    const oracleBox = document.getElementById('oracle-blessing');
    
    if(oracleBox) {
        const randomOracle = oracleDB[Math.floor(Math.random() * oracleDB.length)];
        
        // คำนวณเวลาดีเลย์: รอให้ไพ่ใบสุดท้ายพลิกเสร็จ และข้อความสว่างขึ้นมาก่อน ค่อยแสดงกล่องนี้
        const finalDelay = (0.6 + (0.4 * (user.spread - 1)) + 0.3);
        
        oracleBox.style.display = 'block';
        oracleBox.style.animation = `fadeIn 0.8s ease ${finalDelay + 0.5}s both`; 
        
        // สร้างโครงสร้างเปล่าๆ รอไว้ก่อน (ไอคอน + ชื่อกล่อง)
        oracleBox.innerHTML = `
            <h3 class="oracle-title"><i data-lucide="feather"></i> ไพ่ออราเคิล (Oracle Blessing)</h3>
            <p class="oracle-desc" id="oracle-typewriter-text"></p>
        `;

        // สั่งให้เริ่มพิมพ์ดีดข้อความ หลังจากกล่องปรากฏขึ้นมาแล้ว 1 วินาที
        setTimeout(() => {
            typeWriterEffect(`"${randomOracle}"`, 'oracle-typewriter-text', 40); // ความเร็วพิมพ์ 40ms
        }, (finalDelay + 1.5) * 1000);
    }
    
    if(window.lucide) lucide.createIcons();


function updateScore(id, val) {
    const finalVal = Math.max(10, Math.min(100, val));
    document.getElementById(id).innerHTML = `
        <div class="circle-chart" style="--p:${finalVal}%">
            <span>${finalVal}%</span>
        </div>
    `;
}

function switchScene(from, to) {
    const f = document.getElementById(from);
    const t = document.getElementById(to);
    f.classList.remove('active');
    setTimeout(() => {
        f.style.display = 'none';
        t.style.display = 'flex';
        setTimeout(() => t.classList.add('active'), 50);
    }, 400);
}

// 🌟 ฟังก์ชันเสริม: ปิดแอนิเมชันทั้งหมดก่อนแคปจอ (แก้บั๊กรูปหาย)
function fixAnimationForCapture(element) {
    element.style.animation = 'none';
    element.style.opacity = '1';
    const children = element.querySelectorAll('*');
    children.forEach(child => {
        child.style.animation = 'none';
        if (window.getComputedStyle(child).display !== 'none') {
            child.style.opacity = '1';
        }
    });
}

// ==========================================
// 🌟 Phase 5: ระบบจัดการการ์ดแชร์สุดหรู (อัปเกรดข้อมูลครบถ้วน + ข้อมูลเชิงลึก)
// ==========================================
function prepareShareCard() {
    // 1. ชื่อและหัวข้อ
    const topicNames = { 'general': 'ภาพรวมชีวิต', 'love': 'ความรักเจาะลึก', 'money': 'การเงิน', 'work': 'การงาน' };
    const finalTopicText = user.spread === 4 ? "ความสัมพันธ์ความรัก" : topicNames[user.topic];
    document.getElementById('share-title').innerText = `คำทำนายเรื่อง${finalTopicText} ของคุณ ${user.name}`;
    
    // 2. ข้อมูลส่วนตัว (คำนวณใหม่ให้สดเสมอ)
    const soulIndex = calculateSoulNum(user.dob);
    const userDayInfo = dayTraits[user.dayIndex];
    const zodiacInfo = getZodiac(user.dob);
    const moonInfo = getMoonPhase();

    // ป้าย Badge ด้านบน
    document.getElementById('share-traits').innerHTML = `
        <div class="share-badge">ไพ่ประจำตัว: ${finalTarotDB[soulIndex].name}</div>
        <div class="share-badge">${zodiacInfo.sign} (ธาตุ${zodiacInfo.element})</div>
        <div class="share-badge">สีมงคล: ${userDayInfo.color} | เลขนำโชค: ${userDayInfo.luckyNum}</div>
        <div class="share-badge">พลังงาน: ${moonInfo.name.split(' (')[0]}</div>
    `;

    // 🌟 2.5 ข้อมูลเชิงลึก (ตัวตน, ธาตุ, พระจันทร์) ยัดลงกล่องใหม่
    const deepTraitsBox = document.getElementById('share-deep-traits');
    if (deepTraitsBox) {
        deepTraitsBox.innerHTML = `
            <p class="share-deep-desc">
                <strong style="color: var(--gold-bright); font-size: 1.35rem;"><i data-lucide="sparkles" size="20" style="vertical-align: middle;"></i> ตัวตนเบื้องลึกของคุณ:</strong> 
                พลังงานจากไพ่ ${finalTarotDB[soulIndex].name} บ่งบอกว่า... ${soulMeanings[soulIndex]}
            </p>
            <p class="share-deep-desc" style="border-top: 1px dashed rgba(255,255,255,0.2); padding-top: 12px;">
                <strong style="color: ${zodiacInfo.color};"><i data-lucide="flame" size="18" style="vertical-align: middle;"></i> คำแนะนำเสริมสำหรับคนธาตุ${zodiacInfo.element}:</strong> ${zodiacInfo.advice}
            </p>
            <p class="share-deep-desc" style="border-top: 1px dashed rgba(255,255,255,0.2); padding-top: 12px;">
                <strong style="color: var(--gold-bright);"><i data-lucide="moon" size="18" style="vertical-align: middle;"></i> อิทธิพลดวงจันทร์วันนี้:</strong> ${moonInfo.advice}
            </p>
        `;
    }

    // 3. คะแนน 3 ด้าน
    const totalScore = selectedCards.reduce((a, b) => a + (b.isReversed ? b.score - 10 : b.score), 0);
    const avg = Math.floor(totalScore / user.spread);
    const lScore = Math.min(100, Math.max(10, avg + 5));
    const mScore = Math.max(10, avg - 5);
    const wScore = Math.max(10, avg);
    
    document.getElementById('share-scores').innerHTML = `
        <div class="share-score-item">❤️ ความรัก ${lScore}%</div>
        <div class="share-score-item">💰 การเงิน ${mScore}%</div>
        <div class="share-score-item">💼 การงาน ${wScore}%</div>
    `;

    // 4. กล่องคำถามและคำฟันธง
    let predictionText = user.finalAnswer || "";
    if (!predictionText) {
        if (user.spread === 1) predictionText = selectedCards[0][user.topic].present;
        else predictionText = selectedCards[selectedCards.length - 1][user.topic].future || selectedCards[selectedCards.length - 1].love.future;
    }
    
    const qBox = document.getElementById('share-question-box');
    if (user.question) {
        qBox.innerHTML = `
            <div style="color: #aaa; font-size: 1.2rem; margin-bottom: 5px;">เรื่องที่ถาม:</div>
            <div style="font-size: 1.6rem; color: #fff; font-style: italic; margin-bottom: 15px;">"${user.question}"</div>
            <div style="color: var(--gold-bright); border-top: 1px dashed rgba(212,175,55,0.3); padding-top: 15px;"><strong>สรุปฟันธง:</strong> ${predictionText}</div>
        `;
    } else {
        qBox.innerHTML = `<div style="color: var(--gold-bright);"><strong>สรุปฟันธง:</strong> ${predictionText}</div>`;
    }

    // 5. เรียงไพ่แต่ละใบ (ภาพ + คำทำนายกระชับ)
    const cardsContainer = document.getElementById('share-cards-container');
    let positionTitles = user.spread === 1 ? ["คำแนะนำ"] : (user.spread === 4 ? ["1. คุณ", "2. เขา", "3. อุปสรรค", "4. สรุป"] : ["อดีต", "ปัจจุบัน", "อนาคต"]);
    
    cardsContainer.innerHTML = selectedCards.map((c, i) => {
        const cardNameOnly = c.name.split('. ')[1] || c.name;
        const imgUrl = `https://placehold.co/200x320/1a1a2e/d4af37?text=${encodeURIComponent(cardNameOnly)}&font=montserrat`;
        
        let pText = '';
        if (user.spread === 4) {
            if (i === 0 || i === 1) pText = c.love.present; 
            else if (i === 2) pText = c.reversedMeaning; 
            else if (i === 3) pText = c.love.future; 
        } else if (user.spread === 1) {
            pText = c[user.topic].present;
        } else {
            const posKeys = ["past", "present", "future"];
            pText = c[user.topic][posKeys[i]];
        }

        const isRev = c.isReversed ? '<span style="color:#ff4757; font-size:1.1rem; display:block;">(หัวกลับ)</span>' : '';
        const revWarn = (c.isReversed && user.spread !== 4) ? `<div style="color:#ffaa55; font-size:1.05rem; margin-top:8px; border-top: 1px dashed #553322; padding-top:8px;">⚠️ <strong>ระวัง:</strong> ${c.reversedMeaning}</div>` : '';

        return `
        <div class="share-card-col">
            <div style="color:var(--gold); font-size:1.3rem; margin-bottom:10px; font-weight:bold;">${positionTitles[i]}</div>
            <img src="${imgUrl}" class="share-card-img ${c.isReversed ? 'reversed' : ''}">
            <div class="share-card-name">${c.name} ${isRev}</div>
            <div class="share-card-desc">${pText}${revWarn}</div>
        </div>
        `;
    }).join('');

    // 6. ดึงคำอวยพรออราเคิล
    const currentOracleDOM = document.getElementById('oracle-typewriter-text');
    let oracleText = currentOracleDOM && currentOracleDOM.innerText ? currentOracleDOM.innerText : `"${oracleDB[Math.floor(Math.random() * oracleDB.length)]}"`;
    document.getElementById('share-oracle').innerText = oracleText;

    if(window.lucide) lucide.createIcons();
}

function savePrediction() {
    const btn = document.getElementById('btn-save');
    btn.innerHTML = '⌛ กำลังจัดเตรียมรูปภาพ...';
    btn.disabled = true;

    // เตรียมการ์ดแชร์ที่ซ่อนไว้
    prepareShareCard();
    const shareLayout = document.getElementById('share-card-layout');

    // สั่งแคปเฉพาะการ์ดที่เตรียมไว้ (1080x1920)
    html2canvas(shareLayout, {
        backgroundColor: '#05010a', 
        logging: false, 
        useCORS: true, 
        scale: 1 // ใช้ scale 1 เพราะเราตั้งขนาดไว้ใหญ่ถึง 1080p แล้ว
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = `ZenithOracle_${user.name}_${new Date().toISOString().slice(0,10)}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        setTimeout(() => {
            btn.innerHTML = `<i data-lucide="download"></i> เซฟรูปภาพ`;
            btn.disabled = false;
            lucide.createIcons();
            showToast("✅ บันทึกรูปภาพคำทำนายสำเร็จ!");
        }, 800);
    }).catch(err => {
        showToast("❌ ขออภัย ระบบไม่สามารถบันทึกภาพได้");
        btn.disabled = false;
    });
}

async function sharePrediction() {
    const btn = document.getElementById('btn-share');
    if (!navigator.share) return showToast("เบราว์เซอร์นี้ไม่รองรับระบบแชร์ กรุณากดเซฟรูปภาพแทนนะครับ");

    btn.innerHTML = '⌛...';
    btn.disabled = true;

    prepareShareCard();
    const shareLayout = document.getElementById('share-card-layout');

    try {
        const canvas = await html2canvas(shareLayout, {
            backgroundColor: '#05010a', 
            logging: false, 
            useCORS: true, 
            scale: 1
        });

        canvas.toBlob(async (blob) => {
            const file = new File([blob], `ZenithOracle_${user.name}.png`, { type: 'image/png' });
            const shareData = {
                title: 'ZENITH ORACLE | คำทำนายของฉัน',
                text: `🔮 ดูคำทำนายดวงชะตาของ ${user.name} จาก Zenith Oracle ลองมาเช็คดวงของคุณบ้างสิ!`,
                files: [file]
            };

            btn.innerHTML = `<i data-lucide="share-2"></i> แชร์ผลลัพธ์`;
            btn.disabled = false;
            lucide.createIcons();

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share(shareData);
            } else {
                await navigator.share({ title: shareData.title, text: shareData.text, url: window.location.href });
            }
        }, 'image/png');
    } catch (err) {
        showToast("❌ เกิดข้อผิดพลาดในการแชร์");
        btn.innerHTML = `<i data-lucide="share-2"></i> แชร์ผลลัพธ์`;
        btn.disabled = false;
        lucide.createIcons();
    }
}

function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'custom-toast';
    toast.innerHTML = `<i data-lucide="alert-circle" size="18"></i> <span>${message}</span>`;
    
    container.appendChild(toast);
    if(window.lucide) lucide.createIcons();

    setTimeout(() => {
        toast.classList.add('hide');
        toast.addEventListener('animationend', () => toast.remove());
    }, 3000);
}

function toggleReadPrediction() {
    const btn = document.getElementById('btn-read');
    if (!window.speechSynthesis) {
        return showToast("ขออภัย เบราว์เซอร์ของคุณไม่รองรับระบบเสียงอ่านครับ");
    }

    if (isReading) {
        window.speechSynthesis.cancel();
        isReading = false;
        btn.innerHTML = `<i data-lucide="volume-2"></i> ฟังคำทำนาย`;
        lucide.createIcons();
        return;
    }

    let topicText = document.getElementById('user-topic').options[document.getElementById('user-topic').selectedIndex].text;
    let textToRead = `สวัสดีครับคุณ ${user.name}, ต่อไปนี้คือคำทำนายเรื่อง ${topicText.replace(" และ ", "และ")} ของคุณนะครับ, `;
    
    const soulBadge = document.querySelector('.soul-highlight-box .soul-desc');
    if (soulBadge && soulBadge.parentElement.style.display !== 'none') {
        const soulIndex = calculateSoulNum(user.dob);
        const soulCardName = finalTarotDB[soulIndex].name.replace(/[0-9]+\.\s*/g, ''); 
        textToRead += `เริ่มต้นที่ตัวตนเบื้องลึกของคุณ, พลังงานจากไพ่ ${soulCardName} บ่งบอกว่า, ${soulMeanings[soulIndex]}, `;
    }
    
    const zodiacInfo = getZodiac(user.dob);
    if (zodiacInfo.sign !== "ไม่ทราบราศี") {
        textToRead += `และเนื่องจากคุณเกิดใน${zodiacInfo.sign}, ซึ่งเป็นพลังงานธาตุ${zodiacInfo.element}, คำแนะนำเสริมสำหรับคุณก็คือ, ${zodiacInfo.advice}, `;
    }

    // 🌟 Phase 2 - ระบบ 10: อ่านดวงจันทร์ให้ฟังด้วย
    const moonInfo = getMoonPhase();
    textToRead += `นอกจากนี้, วันนี้ยังตรงกับช่วง${moonInfo.name.split(' (')[0]}, พลังงานของดวงจันทร์แนะนำว่า, ${moonInfo.advice}, `;

    if (user.question && user.finalAnswer) {
        textToRead += `และสำหรับคำถามที่คุณได้ตั้งจิตอธิษฐานไว้ว่า, ${user.question}, บทสรุปจากพลังงานไพ่ทั้งหมดชี้ให้เห็นว่า, ${user.finalAnswer}, `;
    } else if (user.question) {
        textToRead += `และสำหรับคำถามที่คุณได้ตั้งจิตอธิษฐานไว้ว่า, ${user.question}, `;
    }

    textToRead += `เอาล่ะครับ, เรามาเจาะลึกหน้าไพ่ที่คุณเลือกกันเลยนะครับ. `;

    const cards = document.querySelectorAll('.result-text');
    cards.forEach((card) => {
        const header = card.querySelector('h4');
        if (header) {
            let title = header.innerText.replace(/[0-9]+\.\s*/g, '').replace(/\//g, ' หรือ ').replace(/[A-Za-z()]/g, '').trim(); 
            if (title !== "คำถามของคุณ") {
                let name = card.querySelector('h5').innerText.replace(/[0-9]+\.\s*/g, '').replace(/หัวกลับ \(Reversed\)/g, "แบบหัวกลับ").trim();
                let desc = card.querySelector('p').innerText;
                
                textToRead += `สำหรับตำแหน่ง, ${title}, ไพ่ที่คุณได้ก็คือไพ่, ${name}, คำทำนายบอกไว้ว่า, ${desc}, `;
                
                const warningBox = card.querySelector('.reversed-text');
                if (warningBox) {
                    let warningText = warningBox.innerText.replace(/ข้อควรระวัง:/g, "").trim();
                    textToRead += `แต่เดี๋ยวก่อนครับ, ไพ่ใบนี้เป็นไพ่หัวกลับ, จึงมีข้อควรระวังก็คือ, ${warningText}, `;
                }
            }
        }
    });

    const oracleBox = document.getElementById('oracle-blessing');
    if (oracleBox && oracleBox.style.display !== 'none') {
        const oracleText = oracleBox.querySelector('.oracle-desc').innerText.replace(/"/g, "");
        textToRead += `และก่อนจะจากกันไป, นี่คือข้อความพิเศษจากจักรวาลที่ส่งถึงคุณครับ, ${oracleText}, ขอให้คุณโชคดีและใช้ชีวิตอย่างมีสตินะครับ.`;
    } else {
        textToRead += "จบคำทำนายแล้วครับ. ขอให้คุณโชคดี, และใช้ชีวิตอย่างมีสตินะครับ.";
    }

    utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'th-TH'; 
    utterance.rate = 0.85; 
    utterance.pitch = 0.9; 

    utterance.onend = () => {
        isReading = false;
        btn.innerHTML = `<i data-lucide="volume-2"></i> ฟังคำทำนาย`;
        lucide.createIcons();
    };

    utterance.onerror = () => {
        isReading = false;
        btn.innerHTML = `<i data-lucide="volume-2"></i> ฟังคำทำนาย`;
        lucide.createIcons();
    };

    window.speechSynthesis.speak(utterance);
    isReading = true;
    btn.innerHTML = `<i data-lucide="square"></i> หยุดฟัง`;
    lucide.createIcons();
}

function createMagicDust(e) {
    if (window.innerWidth < 768) return;

    const particle = document.createElement('div');
    particle.className = 'magic-particle';
    
    const offsetX = (Math.random() - 0.5) * 20;
    const offsetY = (Math.random() - 0.5) * 20;
    
    particle.style.left = (e.clientX + offsetX) + 'px';
    particle.style.top = (e.clientY + offsetY) + 'px';
    
    const size = Math.random() * 6 + 3;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';

    document.body.appendChild(particle);

    setTimeout(() => {
        particle.remove();
    }, 1000);
}

window.addEventListener('mousemove', createMagicDust);

const themes = ['default', 'theme-silver', 'theme-rose'];
let currentThemeIndex = 0;

function toggleTheme() {
    document.body.classList.remove('theme-silver', 'theme-rose');
    
    currentThemeIndex = (currentThemeIndex + 1) % themes.length;
    
    if (themes[currentThemeIndex] !== 'default') {
        document.body.classList.add(themes[currentThemeIndex]);
    }
    
    const iconContainer = document.getElementById('theme-toggle');
    if(currentThemeIndex === 0) {
        iconContainer.innerHTML = '<i data-lucide="palette"></i>';
        showToast("✨ เปลี่ยนเป็นธีม: สุริยคราส (Eclipse)");
    } else if(currentThemeIndex === 1) {
        iconContainer.innerHTML = '<i data-lucide="moon"></i>';
        showToast("🌙 เปลี่ยนเป็นธีม: จันทราสีเงิน (Silver Moon)");
    } else {
        iconContainer.innerHTML = '<i data-lucide="heart"></i>';
        showToast("🌸 เปลี่ยนเป็นธีม: โรสควอตซ์ (Rose Quartz)");
    }
    
    if (window.lucide) lucide.createIcons();
}

// ==========================================
// 🌟 Phase 5: ระบบไพ่ประจำวันล็อคเวลา (Daily Draw Cooldown)
// ==========================================
let cooldownTimer = null;

function checkDailyCooldown() {
    const spreadSelect = document.getElementById('user-spread');
    const startBtn = document.querySelector('.btn-shine');
    const btnSpan = startBtn.querySelector('span');
    const btnIcon = startBtn.querySelector('i');
    
    clearInterval(cooldownTimer); // เคลียร์เวลาเก่าทิ้งก่อน

    if (spreadSelect.value === '1') {
        const lastDrawDate = localStorage.getItem('zenith_daily_draw_date');
        const todayStr = new Date().toDateString();

        if (lastDrawDate === todayStr) {
            // 🛑 ล็อคปุ่ม! เพราะวันนี้เปิดไพ่รายวันไปแล้ว
            startBtn.classList.add('disabled-cooldown');
            startBtn.disabled = true;
            btnIcon.style.display = 'none';
            
            // เริ่มนับถอยหลังถึงเที่ยงคืน
            updateCountdownText(btnSpan);
            cooldownTimer = setInterval(() => updateCountdownText(btnSpan), 1000);
        } else {
            // ✅ ปลดล็อค
            resetStartButton(startBtn, btnSpan, btnIcon);
        }
    } else {
        // ✅ ถ้าไม่ใช่ไพ่รายวัน 1 ใบ (เช่น 3 ใบ หรือ 4 ใบ) ปลดล็อคให้กดได้ตลอด
        resetStartButton(startBtn, btnSpan, btnIcon);
    }
}

function resetStartButton(btn, span, icon) {
    btn.classList.remove('disabled-cooldown');
    btn.disabled = false;
    span.innerText = 'เริ่มต้นคำทำนาย';
    icon.style.display = 'inline-block';
}

function updateCountdownText(element) {
    const now = new Date();
    // หาวันพรุ่งนี้เวลา 00:00:00 น.
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const diff = tomorrow - now;

    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    element.innerText = `รอเปิดไพ่ใบใหม่ใน ${h} ชม. ${m} นาที ${s} วิ`;
}

// ผูกอีเวนต์: เมื่อผู้ใช้เปลี่ยน Dropdown ให้เช็ค Cooldown ทันที
document.getElementById('user-spread').addEventListener('change', checkDailyCooldown);
// เช็คตอนโหลดเว็บเสร็จ
window.addEventListener('load', checkDailyCooldown);