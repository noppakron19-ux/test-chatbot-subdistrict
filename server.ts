import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI server-side with required User-Agent header
const apiKey = (process.env.GEMINI_API_KEY || '').trim();
const hasValidGeminiKey = Boolean(
  apiKey &&
  apiKey !== 'MY_GEMINI_API_KEY' &&
  !apiKey.startsWith('MY_') &&
  apiKey.length > 20
);

let ai: GoogleGenAI | null = null;
if (hasValidGeminiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Timeout helper to ensure AI calls never hang or block the user
const withTimeout = <T>(promise: Promise<T>, timeoutMs = 4500): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('AI response timed out, using fast smart local engine')), timeoutMs)
    ),
  ]);
};

// Fallback intelligent responder when Gemini API key is unset or network error occurs
function generateSmartFallbackChatReply(message: string, orgContext: any): string {
  const query = message.toLowerCase();
  const orgName = orgContext.orgName || 'องค์การบริหารส่วนตำบลท่าตูม (อบต.ท่าตูม)';
  const mayorName = 'นายโยธิน พงษ์อ้อ';
  const phone = '037-285161';
  const emergencyPhone = '037-285347 (ตลอด 24 ชั่วโมง)';
  const lineId = '@smartthatoom';
  const address = '111 หมู่ 8 ต.ท่าตูม อ.ศรีมหาโพธิ จ.ปราจีนบุรี';
  const website = 'www.tt.go.th';

  if (query.includes('นายก') || query.includes('ชื่ออะไร') || query.includes('ใครเป็นนายก') || query.includes('ผู้บริหาร') || query.includes('รองนายก') || query.includes('ปลัด')) {
    return `สวัสดีครับ ข้อมูลคณะผู้บริหาร${orgName} อ.ศรีมหาโพธิ จ.ปราจีนบุรี ปัจจุบันมีดังนี้ครับ:

👔 **นายกองค์การบริหารส่วนตำบลท่าตูม:**
• **${mayorName}** (นายก อบต.ท่าตูม)

👥 **คณะผู้บริหารและข้าราชการประจำ:**
• รองนายก อบต.ท่าตูม (คนที่ 1): ดูแลงานป้องกันบรรเทาสาธารณภัยและสาธารณสุข
• รองนายก อบต.ท่าตูม (คนที่ 2): ดูแลงานการศึกษา ศาสนา วัฒนธรรม และสวัสดิการ
• ปลัด อบต.ท่าตูม: หัวหน้าฝ่ายข้าราชการประจำ กำกับดูแลทุกกอง/สำนัก

📍 ติดต่อสำนักงาน อบต.ท่าตูม: ${address}
☎️ โทรศัพท์: ${phone} | สายด่วนกู้ชีพ 24 ชม.: ${emergencyPhone}
📲 Line ID: ${lineId} | เว็บไซต์: ${website}
พร้อมยินดีให้บริการพี่น้องประชาชนทุกท่านครับ`;
  }

  if (query.includes('เบอร์') || query.includes('โทร') || query.includes('ติดต่อ') || query.includes('ฉุกเฉิน') || query.includes('สายด่วน') || query.includes('ไฟไหม้') || query.includes('กู้ชีพ')) {
    return `ช่องทางการติดต่อ ${orgName} (อ.ศรีมหาโพธิ จ.ปราจีนบุรี) ครับ:

📍 **ที่อยู่สำนักงาน:** ${address}
☎️ **โทรศัพท์สำนักงาน:** ${phone}
📱 **สายด่วนกู้ชีพ/ป้องกันบรรเทาสาธารณภัย (ตลอด 24 ชั่วโมง):** ${emergencyPhone}
📘 **Facebook:** องค์การบริหารส่วนตำบลท่าตูม
📲 **Line ID:** ${lineId}
🌐 **เว็บไซต์ทางการ:** ${website}

เวลาทำการ: วันจันทร์ - ศุกร์ เวลา 08.30 - 16.30 น. (สายด่วนกู้ชีพรับแจ้งเหตุตลอด 24 ชม. ครับ)`;
  }

  if (query.includes('เบี้ย') || query.includes('คนชรา') || query.includes('สูงอายุ') || query.includes('คนพิการ')) {
    return `การลงทะเบียนรับเบี้ยยังชีพผู้สูงอายุและคนพิการ ณ ${orgName} ครับ:

📄 **เอกสารที่ต้องใช้:**
1. บัตรประจำตัวประชาชน (ตัวจริง)
2. ทะเบียนบ้าน (ตัวจริง)
3. สมุดบัญชีเงินฝากธนาคาร (กรณีประสงค์รับเงินผ่านธนาคาร)

💰 **อัตราการจ่ายเบี้ยยังชีพผู้สูงอายุ (ขั้นบันได):**
• อายุ 60-69 ปี: 600 บาท/เดือน
• อายุ 70-79 ปี: 700 บาท/เดือน
• อายุ 80-89 ปี: 800 บาท/เดือน
• อายุ 90 ปีขึ้นไป: 1,000 บาท/เดือน

ยื่นลงทะเบียนได้ที่ สำนักปลัด อบต.ท่าตูม ในวันและเวลาราชการ สอบถามเพิ่มเติมโทร ${phone} ครับ`;
  }

  if (query.includes('ภาษี') || query.includes('ที่ดิน') || query.includes('ป้าย')) {
    return `การชำระภาษีที่ดิน สิ่งปลูกสร้าง และภาษีป้าย ของ ${orgName} ครับ:

1. อบต.ท่าตูม จะจัดส่งหนังสือแจ้งประเมินภาษี (ภ.ด.ส.) ให้แก่เจ้าของทรัพย์สิน
2. สามารถชำระได้ ณ กองคลัง อบต.ท่าตูม หรือสแกน QR Code Mobile Banking ทุกธนาคาร
3. สอบถามการประเมินภาษีและข้อมูลเพิ่มเติมได้ที่ กองคลัง อบต.ท่าตูม โทร ${phone} ครับ`;
  }

  if (query.includes('โพส') || query.includes('เขียน') || query.includes('แคปชั่น') || query.includes('เรียบเรียง') || query.includes('ประชาสัมพันธ์')) {
    return `📢 ได้เลยครับ! ข้อความสำหรับนำไปโพสต์เพจ Facebook มีดังนี้ครับ:

══════════════════════
📢 ประชาสัมพันธ์: ${message.replace(/ช่วย|คิดคำ|เขียน|โพสต์|หน่อย/g, '').trim() || 'กิจกรรมและการบริการประชาชน'}

องค์การบริหารส่วนตำบลท่าตูม ขอประชาสัมพันธ์แจ้งข้อมูลข่าวสารให้พี่น้องประชาชนในเขตตำบลท่าตูม อำเภอศรีมหาโพธิ จังหวัดปราจีนบุรี ได้รับทราบอย่างทั่วถึง

📌 รายละเอียดสำคัญ:
• ขอให้พี่น้องประชาชนตรวจสอบข้อมูลและปฏิบัติตามคำแนะนำของทางราชการ
• หากมีข้อสงสัยหรือต้องการสอบถามขั้นตอนเพิ่มเติม สามารถติดต่อสอบถามได้ที่เจ้าหน้าที่ อบต.ท่าตูม

สอบถามรายละเอียดเพิ่มเติมได้ที่:
#องค์การบริหารส่วนตำบลท่าตูม
📍 111 หมู่ 8 ต.ท่าตูม อ.ศรีมหาโพธิ จ.ปราจีนบุรี
☎️ โทรศัพท์ : 037-285161
📱 สายด่วน : 037-285347 (ตลอด 24 ชั่วโมง)
📘 Facebook : องค์การบริหารส่วนตำบลท่าตูม
📲 Line ID : @smartthatoom
🌐 เว็บไซต์ : www.tt.go.th

#อบตท่าตูม #ศรีมหาโพธิ #ปราจีนบุรี #ข่าวประชาสัมพันธ์ #บริการประชาชน
══════════════════════
(สามารถกดปุ่ม "เปิดในสตูดิโอ Facebook" หรือ "คัดลอก" เพื่อนำไปตรวจทานก่อนโพสต์ได้เลยครับ)`;
  }

  return `สวัสดีครับ! น้อง อบต. AI พร้อมให้บริการข้อมูล ${orgName} (อ.ศรีมหาโพธิ จ.ปราจีนบุรี)
โดยมี นายโยธิน พงษ์อ้อ เป็นนายก อบต.ท่าตูม

คุณสามารถถามข้อมูลผู้บริหาร, บริการประชาชน (เบี้ยยังชีพ, ภาษีที่ดิน, ขออนุญาตก่อสร้าง), เบอร์สายด่วนฉุกเฉิน 24 ชม. หรือพิมพ์/กดไมค์บอกให้ผมช่วยคิดคำและเรียบเรียงโพสต์สำหรับเพจ Facebook ได้เลยครับ!`;
}

// Fallback polished post generator
function generatePolishedFacebookPost(params: any): any {
  const {
    topic = 'ข่าวสารประชาสัมพันธ์',
    rawContent = '',
    category = 'ข่าวประชาสัมพันธ์',
    tone = 'เป็นทางการแต่น่าอ่าน',
    includeHashtags = true,
    includeCallToAction = true,
  } = params;

  const rawClean = rawContent.trim() || topic;
  const headline = `📢 [ประชาสัมพันธ์] ${topic || 'ข่าวสารจาก อบต.ท่าตูม'}`;

  let body = '';
  if (tone.includes('อบอุ่น')) {
    body = `สวัสดีพี่น้องชาวตำบลท่าตูมทุกท่านครับ 😊\n\nทางองค์การบริหารส่วนตำบลท่าตูมขอแจ้งข้อมูลข่าวสารที่เป็นประโยชน์สำหรับทุกท่านในวันนี้\n\n${rawClean}\n\nเพื่อให้พี่น้องประชาชนในพื้นที่ได้รับทราบข้อมูลที่ถูกต้องและได้รับบริการอย่างทั่วถึงและรวดเร็ว`;
  } else if (tone.includes('กระชับ')) {
    body = `องค์การบริหารส่วนตำบลท่าตูม ขอแจ้งข่าวสารประชาสัมพันธ์:\n\n${rawClean}\n\nขอให้พี่น้องประชาชนในพื้นที่รับทราบโดยทั่วกัน`;
  } else if (tone.includes('สร้างสรรค์')) {
    body = `✨ ร่วมสร้างตำบลท่าตูมให้น่าอยู่ ก้าวหน้าไปด้วยกัน ✨\n\n${rawClean}\n\nอบต.ท่าตูม มุ่งมั่นพัฒนาคุณภาพชีวิตและความเป็นอยู่ของพี่น้องประชาชนในทุกมิติ`;
  } else {
    body = `องค์การบริหารส่วนตำบลท่าตูม ขอประชาสัมพันธ์แจ้งข้อมูลข่าวสารให้พี่น้องประชาชนในเขตตำบลท่าตูม อำเภอศรีมหาโพธิ จังหวัดปราจีนบุรี ได้รับทราบ\n\n${rawClean}\n\nจึงขอประชาสัมพันธ์ให้พี่น้องประชาชนได้รับทราบโดยทั่วกัน`;
  }

  const highlights = [
    `ข้อมูลและรายละเอียดสำคัญ: ${topic || 'ประชาสัมพันธ์ อบต.ท่าตูม'}`,
    `บริการและอำนวยความสะดวกให้แก่พี่น้องประชาชนในเขตตำบลท่าตูม`,
    `ติดต่อสอบถามเจ้าหน้าที่ได้ในวันและเวลาราชการ`,
  ];

  const callToAction = includeCallToAction
    ? `#องค์การบริหารส่วนตำบลท่าตูม\n📍 111 หมู่ 8 ต.ท่าตูม อ.ศรีมหาโพธิ จ.ปราจีนบุรี\n☎️ โทรศัพท์ : 037-285161\n📱 สายด่วน : 037-285347 (ตลอด 24 ชั่วโมง)\n📘 Facebook : องค์การบริหารส่วนตำบลท่าตูม\n📲 Line ID : @smartthatoom\n🌐 เว็บไซต์ : www.tt.go.th`
    : 'สอบถามรายละเอียดเพิ่มเติม โทร 037-285161';

  const hashtags = includeHashtags
    ? '#องค์การบริหารส่วนตำบลท่าตูม #อบตท่าตูม #ศรีมหาโพธิ #ปราจีนบุรี #ข่าวประชาสัมพันธ์ #บริการประชาชน'
    : '';

  const fullPostText = `${headline}\n\n${body}\n\n📌 สรุปประเด็นสำคัญ:\n• ${highlights.join('\n• ')}\n\n${callToAction}\n\n${hashtags}`.trim();

  const imageAdvice = 'แนะนำให้ใช้ภาพถ่ายกิจกรรมจริงของ อบต. ภาพคมชัด มีความสว่างเพียงพอ หรือแบนเนอร์กราฟิกที่มีข้อความหัวข้อตัวหนาชัดเจน';

  return {
    headline,
    body,
    highlights,
    callToAction,
    hashtags,
    fullPostText,
    imageAdvice,
  };
}

// Chatbot PR assistant endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, history = [], orgContext = {} } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const orgName = orgContext.orgName || 'องค์การบริหารส่วนตำบลท่าตูม (อบต.ท่าตูม)';
    const district = orgContext.district || 'อำเภอศรีมหาโพธิ';
    const province = orgContext.province || 'จังหวัดปราจีนบุรี';
    const website = orgContext.websiteUrl || 'www.tt.go.th';
    const executives = Array.isArray(orgContext.executives) && orgContext.executives.length > 0
      ? orgContext.executives.map((e: any) => `- ${e.position}: ${e.name} ${e.phone ? `(โทร: ${e.phone})` : ''}`).join('\n')
      : '- นายก อบต.ท่าตูม: นายโยธิน พงษ์อ้อ\n- รองนายก อบต.ท่าตูม (คนที่ 1): คณะผู้บริหาร อบต.ท่าตูม\n- รองนายก อบต.ท่าตูม (คนที่ 2): คณะผู้บริหาร อบต.ท่าตูม\n- ปลัด อบต.ท่าตูม: ข้าราชการประจำ อบต.ท่าตูม';

    const knowledgeBase = Array.isArray(orgContext.knowledgeItems) && orgContext.knowledgeItems.length > 0
      ? orgContext.knowledgeItems.map((k: any) => `[เรื่อง: ${k.topic}] ถาม: ${k.question || '-'} | ตอบ: ${k.answer}`).join('\n')
      : '';

    // If Gemini client is available, attempt generateContent
    if (ai) {
      try {
        const systemInstruction = `คุณคือ "น้อง อบต. AI" ผู้ช่วยอัจฉริยะด้านงานประชาสัมพันธ์และการสื่อสารของ "${orgName}" (${district} ${province})
เว็บไซต์ทางการ: ${website} (พื้นที่สำคัญที่ตั้งของเขตนิคมอุตสาหกรรม 304 ปราจีนบุรี)

ข้อมูลคณะผู้บริหารและเจ้าหน้าที่สำคัญปัจจุบัน:
- นายก อบต.ท่าตูม: นายโยธิน พงษ์อ้อ
${executives}

ข้อมูลติดต่อทางการ:
- ที่อยู่: 111 หมู่ 8 ต.ท่าตูม อ.ศรีมหาโพธิ จ.ปราจีนบุรี 25140
- โทรศัพท์: 037-285161
- สายด่วนกู้ชีพ 24 ชม.: 037-285347
- Line ID: @smartthatoom
- เว็บไซต์: www.tt.go.th

ข้อมูลงานบริการและสาระความรู้ อบต.:
${knowledgeBase || 'ให้บริการด้านงานทะเบียนราษฎร, การชำระภาษีที่ดินและสิ่งปลูกสร้าง, ภาษีป้าย, เบี้ยยังชีพผู้สูงอายุ/ผู้พิการ/เด็กแรกเกิด, การขออนุญาตก่อสร้าง, การจัดการขยะและสิ่งแวดล้อม (เขตนิคมฯ 304 และชุมชน), หน่วยกู้ชีพ/ป้องกันบรรเทาสาธารณภัยตลอด 24 ชม.'}

ภารกิจหลักของคุณ:
1. ตอบคำถามเกี่ยวกับ อบต.ท่าตูม อ.ศรีมหาโพธิ จ.ปราจีนบุรี อย่างแม่นยำ สุภาพ เป็นมิตร เช่น ตอบชัดเจนว่านายกชื่อ "นายโยธิน พงษ์อ้อ"
2. ช่วยเจ้าหน้าที่คิดคำ เรียบเรียง หรือสร้างข้อความสำหรับโพสต์ลงหน้าเพจ Facebook ของ อบต. ให้พร้อมใช้ มี Emoji น่าอ่าน มีการจัดย่อหน้า และใส่ข้อมูลติดต่อ อบต. ท้ายโพสต์
3. หากผู้ใช้ป้อนข้อมูลด้วยเสียงหรือพูดคำสั้นๆ ให้ช่วยเรียบเรียงให้อย่างสละสลวย`;

        let promptWithContext = `ประวัติการสนทนา:\n`;
        for (const h of history.slice(-6)) {
          promptWithContext += `${h.role === 'user' ? 'ผู้ใช้งาน' : 'น้อง อบต. AI'}: ${h.content}\n`;
        }
        promptWithContext += `\nข้อความใหม่จากผู้ใช้งาน: ${message}\n\nกรุณาตอบคำถาม หรือเรียบเรียงข้อความประชาสัมพันธ์ตามที่ผู้ใช้ร้องขอ:`;

        const response = await withTimeout(
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: promptWithContext,
            config: {
              systemInstruction,
            },
          }),
          4000
        );

        if (response && response.text) {
          res.json({ reply: response.text });
          return;
        }
      } catch (geminiError: any) {
        console.warn('Gemini API call failed, using smart fallback reply:', geminiError?.message);
      }
    }

    // Smart fallback responder if Gemini key is missing or fails
    const fallbackReply = generateSmartFallbackChatReply(message, orgContext);
    res.json({ reply: fallbackReply });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    const reply = generateSmartFallbackChatReply(req.body.message || '', req.body.orgContext || {});
    res.json({ reply });
  }
});

// Dedicated Facebook PR Post Generator & Refiner
app.post('/api/generate-post', async (req: Request, res: Response) => {
  try {
    const {
      topic,
      rawContent,
      category = 'ข่าวประชาสัมพันธ์',
      tone = 'เป็นทางการแต่น่าอ่าน',
      targetAudience = 'ประชาชนทั่วไปในตำบล',
      includeHashtags = true,
      includeCallToAction = true,
      orgContext = {},
    } = req.body;

    if (!topic && !rawContent) {
      res.status(400).json({ error: 'Topic or raw content is required' });
      return;
    }

    const orgName = orgContext.orgName || 'องค์การบริหารส่วนตำบลท่าตูม (อบต.ท่าตูม)';
    const phone = orgContext.phone || '037-285161';
    const emergencyPhone = orgContext.emergencyPhone || '037-285347 (ตลอด 24 ชั่วโมง)';

    // If Gemini client is available, attempt generateContent with JSON schema
    if (ai) {
      try {
        const systemInstruction = `คุณคือผู้เชี่ยวชาญด้านการสื่อสารและการตลาดดิจิทัลสำหรับเพจ Facebook ของหน่วยงานภาครัฐท้องถิ่น (อบต.ท่าตูม อ.ศรีมหาโพธิ จ.ปราจีนบุรี)
งานของคุณคือเรียบเรียงและเขียนโพสต์ Facebook สำหรับ "${orgName}" ให้อ่านง่าย ดึงดูดความสนใจ ประชาชนแชร์ต่อได้ทันที และถูกต้องตามระเบียบงานสารบรรณ/ประชาสัมพันธ์`;

        const prompt = `ช่วยคิดคำและเรียบเรียงโพสต์สำหรับลงหน้าเพจ Facebook อบต. จากข้อมูลต่อไปนี้:
- หัวข้อ/เรื่อง: ${topic || 'ประชาสัมพันธ์ข้อมูล อบต.ท่าตูม'}
- ข้อมูลดิบ/รายละเอียดที่ต้องการแจ้ง: ${rawContent || topic}
- ประเภทโพสต์: ${category}
- สไตล์/น้ำเสียง (Tone): ${tone}
- กลุ่มเป้าหมาย: ${targetAudience}
- เบอร์ติดต่อ อบต.: ${phone} (ฉุกเฉิน: ${emergencyPhone})
- ใส่ Hashtags: ${includeHashtags ? 'ใช่' : 'ไม่'}
- ใส่ช่องทางติดต่อ Call To Action: ${includeCallToAction ? 'ใช่' : 'ไม่'}

กรุณาตอบเป็น JSON รูปแบบนี้เท่านั้น:
{
  "headline": "พาดหัวเปิดโพสต์ที่สะดุดตาพร้อม Emoji",
  "body": "เนื้อหาหลักที่เรียบเรียงใหม่อย่างสละสลวย มีการเว้นวรรค แบ่งย่อหน้าให้อ่านสบายตาบนจอมือถือ",
  "highlights": ["จุดสำคัญข้อที่ 1", "จุดสำคัญข้อที่ 2", "จุดสำคัญข้อที่ 3"],
  "callToAction": "ประโยคเชิญชวนหรือช่องทางสอบถามข้อมูลเพิ่มเติมพร้อมเบอร์โทรและเวลาทำการ",
  "hashtags": "#องค์การบริหารส่วนตำบลท่าตูม #อบตท่าตูม #ศรีมหาโพธิ #ปราจีนบุรี #ข่าวประชาสัมพันธ์",
  "fullPostText": "ข้อความโพสต์ฉบับสมบูรณ์ที่พร้อมก๊อปปี้ไปวางบนเพจ Facebook ได้ทันที (รวมหัวข้อ เนื้อหา ไฮไลท์ ช่องทางติดต่อ และแฮชแท็ก)",
  "imageAdvice": "คำแนะนำสั้นๆ สำหรับทีมประชาสัมพันธ์ในการเลือกหรือถ่ายรูปประกอบโพสต์นี้เพื่อให้ดึงดูดสายตา"
}`;

        const response = await withTimeout(
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              systemInstruction,
              responseMimeType: 'application/json',
            },
          }),
          4000
        );

        const jsonStr = (response?.text || '{}').trim();
        const parsed = JSON.parse(jsonStr);
        if (parsed && parsed.headline && parsed.fullPostText) {
          res.json(parsed);
          return;
        }
      } catch (geminiErr: any) {
        console.warn('Gemini post generator failed, using polished fallback:', geminiErr?.message);
      }
    }

    // Polished fallback post generator
    const fallbackResult = generatePolishedFacebookPost({
      topic,
      rawContent,
      category,
      tone,
      includeHashtags,
      includeCallToAction,
    });
    res.json(fallbackResult);
  } catch (error: any) {
    console.error('Generate Post Error:', error);
    const fallback = generatePolishedFacebookPost(req.body);
    res.json(fallback);
  }
});

// Seed / Initial data provider for tt.go.th/public/
app.get('/api/sao-default-data', (req: Request, res: Response) => {
  res.json({
    profile: {
      orgName: 'องค์การบริหารส่วนตำบลท่าตูม (อบต.ท่าตูม)',
      district: 'อำเภอศรีมหาโพธิ',
      province: 'จังหวัดปราจีนบุรี',
      websiteUrl: 'www.tt.go.th',
      facebookPage: 'องค์การบริหารส่วนตำบลท่าตูม',
      address: '111 หมู่ 8 ต.ท่าตูม อ.ศรีมหาโพธิ จ.ปราจีนบุรี 25140',
      phone: '037-285161',
      emergencyPhone: '037-285347 (ตลอด 24 ชั่วโมง)',
      lineId: '@smartthatoom',
      workHours: 'จันทร์ - ศุกร์ เวลา 08.30 - 16.30 น. (หยุดวันเสาร์-อาทิตย์ และวันหยุดนักขัตฤกษ์)',
      vision: 'ท่าตูมเมืองน่าอยู่ เคียงคู่อุตสาหกรรมสะอาด คุณภาพชีวิตดี มีธรรมาภิบาล พัฒนาสู่สากล',
      updatedAt: new Date().toISOString(),
    },
    executives: [
      {
        id: 'exec-1',
        name: 'นายโยธิน พงษ์อ้อ',
        position: 'นายกองค์การบริหารส่วนตำบลท่าตูม',
        department: 'คณะผู้บริหาร',
        phone: '037-285161',
        bio: 'นายกองค์การบริหารส่วนตำบลท่าตูม อำเภอศรีมหาโพธิ จังหวัดปราจีนบุรี ผู้นำฝ่ายบริหาร กำกับดูแลนโยบายการพัฒนาตำบลท่าตูม คุณภาพชีวิตประชาชน และพื้นที่เศรษฐกิจนิคมอุตสาหกรรม 304',
        order: 1,
      },
      {
        id: 'exec-2',
        name: 'นายชอ พงษ์อ้อ',
        position: 'รองนายกองค์การบริหารส่วนตำบลท่าตูม',
        department: 'คณะผู้บริหาร',
        phone: '037-285161',
        bio: 'รองนายก อบต.ท่าตูม กำกับดูแลกองการศึกษา ศาสนาและวัฒนธรรม และกองสวัสดิการสังคม',
        order: 2,
      },
      {
        id: 'exec-3',
        name: 'นายชัยวิวัฒน์ เปลี่ยนนุช',
        position: 'รองนายกองค์การบริหารส่วนตำบลท่าตูม',
        department: 'คณะผู้บริหาร',
        phone: '037-285161',
        bio: 'รองนายก อบต.ท่าตูม กำกับดูแลกองการประปา และฝ่ายป้องกันและบรรเทาสาธารณภัย สำนักปลัด',
        order: 3,
      },
      {
        id: 'exec-4',
        name: 'นางวิชรัตน์ แสงจันทร์',
        position: 'เลขานุการนายก อบต.ท่าตูม',
        department: 'คณะผู้บริหาร',
        phone: '037-285161',
        bio: 'เลขานุการนายกองค์การบริหารส่วนตำบลท่าตูม',
        order: 4,
      },
      {
        id: 'exec-5',
        name: 'นายอลงกรณ์ ไชยเสนีย์',
        position: 'ปลัดองค์การบริหารส่วนตำบลท่าตูม',
        department: 'สำนักปลัด',
        phone: '037-285161 ต่อ 1',
        bio: 'ปลัดองค์การบริหารส่วนตำบลท่าตูม หัวหน้าฝ่ายข้าราชการประจำ กำกับดูแลทุกกองและสำนัก ให้บริการประชาชนอย่างโปร่งใส รวดเร็ว',
        order: 5,
      },
      {
        id: 'exec-6',
        name: 'จ่าสิบเอกณรงค์ศักดิ์ อัคฮาด',
        position: 'รองปลัดองค์การบริหารส่วนตำบลท่าตูม',
        department: 'สำนักปลัด',
        phone: '037-285161',
        bio: 'รองปลัดองค์การบริหารส่วนตำบลท่าตูม',
        order: 6,
      },
      {
        id: 'exec-7',
        name: 'นางสาวเกษมณี แสงสกุล',
        position: 'รองปลัดองค์การบริหารส่วนตำบลท่าตูม',
        department: 'สำนักปลัด',
        phone: '037-285161',
        bio: 'รองปลัดองค์การบริหารส่วนตำบลท่าตูม',
        order: 7,
      },
      {
        id: 'exec-8',
        name: 'นางสาวสมใจ ชื่นตา',
        position: 'หัวหน้าสำนักปลัด',
        department: 'สำนักปลัด',
        phone: '037-285161',
        bio: 'หัวหน้าสำนักปลัด อบต.ท่าตูม',
        order: 8,
      },
      {
        id: 'exec-9',
        name: 'นางสาวอำไพวรรณ สวรรค์',
        position: 'ผู้อำนวยการกองคลัง',
        department: 'กองคลัง',
        phone: '037-285161',
        bio: 'ผู้อำนวยการกองคลัง ดูแลงานจัดเก็บภาษีที่ดิน สิ่งปลูกสร้าง ภาษีป้าย และงบประมาณ อบต.',
        order: 9,
      },
      {
        id: 'exec-10',
        name: 'นายธีรชัย วงศ์วนิชโยธิน',
        position: 'ผู้อำนวยการกองช่าง',
        department: 'กองช่าง',
        phone: '037-285161',
        bio: 'ผู้อำนวยการกองช่าง ดูแลงานขออนุญาตก่อสร้าง ผังเมือง และโครงสร้างพื้นฐาน',
        order: 10,
      },
      {
        id: 'exec-11',
        name: 'นางสาวสโรชา ชัยโคตร',
        position: 'ผู้อำนวยการกองสวัสดิการสังคม',
        department: 'กองสวัสดิการสังคม',
        phone: '037-285161',
        bio: 'ผู้อำนวยการกองสวัสดิการสังคม ดูแลเบี้ยยังชีพผู้สูงอายุ คนพิการ และสวัสดิการชุมชน',
        order: 11,
      },
      {
        id: 'exec-12',
        name: 'นายอนรรฆพงศ์ เกษตรเกื้อกูล',
        position: 'ผู้อำนวยการกองการศึกษา ศาสนาและวัฒนธรรม',
        department: 'กองการศึกษา ศาสนาและวัฒนธรรม',
        phone: '037-285161',
        bio: 'ผู้อำนวยการกองการศึกษา ศาสนาและวัฒนธรรม ดูแลศูนย์พัฒนาเด็กเล็กและการศึกษาชุมชน',
        order: 12,
      },
    ],
    knowledgeItems: [
      {
        id: 'kb-1',
        topic: 'เบี้ยยังชีพผู้สูงอายุและคนพิการ',
        category: 'บริการประชาชน/สวัสดิการ',
        question: 'ลงทะเบียนรับเบี้ยยังชีพผู้สูงอายุที่ อบต.ท่าตูม ต้องใช้เอกสารอะไรบ้าง?',
        answer: 'เอกสารที่ต้องใช้: 1. บัตรประจำตัวประชาชน 2. ทะเบียนบ้านฉบับจริง 3. สมุดบัญชีเงินฝากธนาคาร (กรณีโอนเงิน)\nอัตราการจ่ายเบี้ยยังชีพตามขั้นบันไดอายุ:\n- 60-69 ปี: 600 บาท/เดือน\n- 70-79 ปี: 700 บาท/เดือน\n- 80-89 ปี: 800 บาท/เดือน\n- 90 ปีขึ้นไป: 1,000 บาท/เดือน\nติดต่อลงทะเบียน ณ สำนักปลัด อบต.ท่าตูม อ.ศรีมหาโพธิ จ.ปราจีนบุรี ในวันเวลาราชการ',
        keywords: 'เบี้ยคนชรา, เงินคนแก่, เงินสูงอายุ, ลงทะเบียน, สวัสดิการ',
      },
      {
        id: 'kb-2',
        topic: 'การชำระภาษีที่ดิน สิ่งปลูกสร้าง และภาษีป้าย',
        category: 'ภาษีและรายได้',
        question: 'ต้องชำระภาษีที่ดินและสิ่งปลูกสร้างเมื่อใด และชำระช่องทางไหนได้บ้าง?',
        answer: 'การชำระภาษีที่ดินและสิ่งปลูกสร้าง/ภาษีป้าย:\n- อบต.ท่าตูม จะจัดส่งหนังสือแจ้งประเมินภาษี (ภ.ด.ส.6/7/8) ให้เจ้าของทรัพย์สิน\n- ชำระภาษีได้ตามระยะเวลาที่กำหนดในหนังสือแจ้ง\n- ช่องทางชำระ: ณ กองคลัง อบต.ท่าตูม (อ.ศรีมหาโพธิ) หรือชำระผ่านระบบ QR Code Mobile Banking\nสอบถามเพิ่มเติมโทร: 037-285161 ต่อ 202',
        keywords: 'ภาษีที่ดิน, ภาษีป้าย, กองคลัง, จ่ายภาษี, ภดส, 304',
      },
      {
        id: 'kb-3',
        topic: 'การขออนุญาตก่อสร้าง/ดัดแปลงอาคารและโรงงาน',
        category: 'บริการช่าง/โยธา',
        question: 'ขอสร้างบ้านหรืออาคารในเขต อบต.ท่าตูม ต้องทำอย่างไร?',
        answer: 'ยื่นคำขออนุญาตก่อสร้างอาคาร (แบบ ข.1) ได้ที่กองช่าง อบต.ท่าตูม (ศรีมหาโพธิ)\nเอกสารประกอบ:\n1. สำเนาบัตร ปชช. และทะเบียนบ้านของผู้ขอ\n2. สำเนาเอกสารสิทธิ์ที่ดิน (โฉนด/น.ส.3) พร้อมหนังสือยินยอมกรณีไม่ใช่เจ้าของ\n3. แบบแปลนแผนผังบริเวณและรายการประกอบแบบ (เซ็นรับรองโดยวิศวกร/สถาปนิก)\nสอบถามรายละเอียดกองช่าง โทร: 037-285161 ต่อ 201',
        keywords: 'ขอสร้างบ้าน, ใบอนุญาตก่อสร้าง, ต่อเติม, กองช่าง, แบบ ข1, นิคม 304',
      },
      {
        id: 'kb-4',
        topic: 'การแจ้งเหตุฉุกเฉินและสาธารณภัย อบต.ท่าตูม 24 ชม.',
        category: 'ฉุกเฉิน/กู้ชีพ',
        question: 'เกิดเหตุไฟไหม้ อุบัติเหตุ น้ำท่วม หรือสัตว์มีพิษเข้าบ้าน ติดต่อที่ไหน?',
        answer: 'ติดต่อหน่วยป้องกันและบรรเทาสาธารณภัย / หน่วยกู้ชีพ อบต.ท่าตูม (อ.ศรีมหาโพธิ จ.ปราจีนบุรี) ได้ตลอด 24 ชั่วโมง\nโทรศัพท์: 037-285347 (ตลอด 24 ชั่วโมง) หรือ 037-285161 ในเวลาราชการ เจ้าหน้าที่พร้อมออกปฏิบัติการช่วยเหลือพี่น้องประชาชนตลอดเวลา',
        keywords: 'ไฟไหม้, รถชน, อุบัติเหตุ, น้ำท่วม, กู้ชีพ, ดับเพลิง, ฉุกเฉิน 24 ชม, ปราจีนบุรี',
      },
    ],
  });
});

// Vite or Static file serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
