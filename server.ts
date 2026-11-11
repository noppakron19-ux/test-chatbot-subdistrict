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
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Chatbot PR assistant endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, history = [], orgContext = {} } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const orgName = orgContext.orgName || 'องค์การบริหารส่วนตำบลท่าตูม (อบต.ท่าตูม)';
    const district = orgContext.district || 'อำเภอท่าตูม';
    const province = orgContext.province || 'จังหวัดสุรินทร์';
    const website = orgContext.websiteUrl || 'https://tt.go.th/public/';
    const executives = Array.isArray(orgContext.executives) && orgContext.executives.length > 0
      ? orgContext.executives.map((e: any) => `- ${e.position}: ${e.name} ${e.phone ? `(โทร: ${e.phone})` : ''}`).join('\n')
      : '- นายก อบต.: นายพศิน เกษียรพันธุ์\n- รองนายก อบต. คนที่ 1: นายสุรพงษ์ ยิ่งดี\n- รองนายก อบต. คนที่ 2: นางกัลยา สุขเจริญ\n- ปลัด อบต.: นายวิโรจน์ สุวรรณโชติ';

    const knowledgeBase = Array.isArray(orgContext.knowledgeItems) && orgContext.knowledgeItems.length > 0
      ? orgContext.knowledgeItems.map((k: any) => `[เรื่อง: ${k.topic}] ถาม: ${k.question || '-'} | ตอบ: ${k.answer}`).join('\n')
      : '';

    const systemInstruction = `คุณคือ "น้อง อบต. AI" ผู้ช่วยอัจฉริยะด้านงานประชาสัมพันธ์และการสื่อสารของ "${orgName}" (${district} ${province})
เว็บไซต์ทางการ: ${website}

ข้อมูลคณะผู้บริหารและเจ้าหน้าที่สำคัญปัจจุบัน:
${executives}

ข้อมูลงานบริการและสาระความรู้ อบต.:
${knowledgeBase || 'ให้บริการด้านงานทะเบียนราษฎร, การชำระภาษีที่ดินและสิ่งปลูกสร้าง, ภาษีป้าย, เบี้ยยังชีพผู้สูงอายุ/ผู้พิการ/เด็กแรกเกิด, การขออนุญาตก่อสร้าง, การจัดการขยะและสิ่งแวดล้อม, หน่วยกู้ชีพ/ป้องกันบรรเทาสาธารณภัย'}

ภารกิจหลักของคุณ:
1. ให้ข้อมูลเกี่ยวกับ อบต. ตอบคำถามประชาชนอย่างถูกต้อง แม่นยำ สุภาพ เป็นมิตร เช่น ตอบว่า "นายกชื่ออะไร", "รองนายกชื่ออะไร", "ปลัดชื่ออะไร", "ติดต่อช่องทางไหน", "ขอเบี้ยยังชีพต้องเตรียมเอกสารอะไร"
2. ช่วยเจ้าหน้าที่คิดคำ เรียบเรียง หรือสร้างข้อความสำหรับโพสต์ลงหน้าเพจ Facebook ของ อบต. ให้พร้อมใช้ มี Emoji น่าอ่าน มีการจัดย่อหน้า และแนะนำ Hashtag
3. หากผู้ใช้ป้อนข้อมูลด้วยเสียงหรือพูดคำสั้นๆ ไม่เป็นทางการ ให้เข้าใจบริบทและตอบกลับหรือช่วยร่างข้อความที่สละสลวย เป็นทางการแต่เข้าใจง่ายสำหรับประชาชน
4. ตอบด้วยภาษาไทยที่สุภาพ เป็นมืออาชีพ พร้อมใส่ใจความถูกต้องของข้อมูลท้องถิ่น`;

    // Build conversation prompt
    let promptWithContext = `ประวัติการสนทนา:\n`;
    for (const h of history.slice(-6)) {
      promptWithContext += `${h.role === 'user' ? 'ผู้ใช้งาน' : 'น้อง อบต. AI'}: ${h.content}\n`;
    }
    promptWithContext += `\nข้อความใหม่จากผู้ใช้งาน: ${message}\n\nกรุณาตอบคำถาม หรือเรียบเรียงข้อความประชาสัมพันธ์ตามที่ผู้ใช้ร้องขอ:`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptWithContext,
      config: {
        systemInstruction,
      },
    });

    const reply = response.text || 'ขออภัยครับ ขณะนี้ระบบกำลังประมวลผลข้อมูล กรุณาลองใหม่อีกครั้ง';
    res.json({ reply });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    res.status(500).json({ error: error.message || 'เกิดข้อผิดพลาดในการประมวลผลของ AI' });
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
    const phone = orgContext.phone || '044-591111';
    const emergencyPhone = orgContext.emergencyPhone || '044-591199 หรือ 199 สายด่วน อบต.';

    const systemInstruction = `คุณคือผู้เชี่ยวชาญด้านการสื่อสารและการตลาดดิจิทัลสำหรับเพจ Facebook ของหน่วยงานภาครัฐท้องถิ่น (อบต.)
งานของคุณคือเรียบเรียงและเขียนโพสต์ Facebook สำหรับ "${orgName}" ให้อ่านง่าย ดึงดูดความสนใจ ประชาชนแชร์ต่อได้ทันที และถูกต้องตามระเบียบงานสารบรรณ/ประชาสัมพันธ์`;

    const prompt = `ช่วยคิดคำและเรียบเรียงโพสต์สำหรับลงหน้าเพจ Facebook อบต. จากข้อมูลต่อไปนี้:
- หัวข้อ/เรื่อง: ${topic || 'ประชาสัมพันธ์ข้อมูล อบต.'}
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
  "hashtags": "#อบตท่าตูม #ข่าวประชาสัมพันธ์ #บริการประชาชน ...",
  "fullPostText": "ข้อความโพสต์ฉบับสมบูรณ์ที่พร้อมก๊อปปี้ไปวางบนเพจ Facebook ได้ทันที (รวมหัวข้อ เนื้อหา ไฮไลท์ ช่องทางติดต่อ และแฮชแท็ก)",
  "imageAdvice": "คำแนะนำสั้นๆ สำหรับทีมประชาสัมพันธ์ในการเลือกหรือถ่ายรูปประกอบโพสต์นี้เพื่อให้ดึงดูดสายตา"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const jsonStr = (response.text || '{}').trim();
    try {
      const parsed = JSON.parse(jsonStr);
      res.json(parsed);
    } catch (parseErr) {
      res.json({
        headline: `📢 ประชาสัมพันธ์: ${topic}`,
        body: response.text || rawContent,
        highlights: [],
        callToAction: `สอบถามรายละเอียดเพิ่มเติม โทร ${phone}`,
        hashtags: `#${orgName.replace(/[^ก-๙a-zA-Z0-9]/g, '')} #ข่าวสารอบต`,
        fullPostText: response.text || rawContent,
        imageAdvice: 'ใช้รูปภาพกิจกรรมจริงหรือแบนเนอร์ข้อความตัวหนาชัดเจน',
      });
    }
  } catch (error: any) {
    console.error('Generate Post Error:', error);
    res.status(500).json({ error: error.message || 'เกิดข้อผิดพลาดในการสร้างโพสต์' });
  }
});

// Seed / Initial data provider for tt.go.th/public/
app.get('/api/sao-default-data', (req: Request, res: Response) => {
  res.json({
    profile: {
      orgName: 'องค์การบริหารส่วนตำบลท่าตูม (อบต.ท่าตูม)',
      district: 'อำเภอท่าตูม',
      province: 'จังหวัดสุรินทร์',
      websiteUrl: 'https://tt.go.th/public/',
      facebookPage: 'องค์การบริหารส่วนตำบลท่าตูม จังหวัดสุรินทร์',
      address: 'เลขที่ 99 หมู่ 7 ตำบลท่าตูม อำเภอท่าตูม จังหวัดสุรินทร์ 32120',
      phone: '044-591111',
      emergencyPhone: '044-591199 (สายด่วนกู้ชีพ/บรรเทาสาธารณภัย 24 ชม.)',
      workHours: 'จันทร์ - ศุกร์ เวลา 08.30 - 16.30 น. (หยุดวันเสาร์-อาทิตย์ และวันหยุดนักขัตฤกษ์)',
      vision: 'ท่าตูมน่าอยู่ การศึกษาก้าวหน้า ประชาชนมีคุณภาพชีวิตที่ดี มีสิ่งแวดล้อมที่ยั่งยืน ยึดหลักธรรมาภิบาล',
      updatedAt: new Date().toISOString(),
    },
    executives: [
      {
        id: 'exec-1',
        name: 'นายพศิน เกษียรพันธุ์',
        position: 'นายกองค์การบริหารส่วนตำบลท่าตูม',
        department: 'คณะผู้บริหาร',
        phone: '044-591111 ต่อ 101',
        bio: 'ผู้นำฝ่ายบริหาร กำกับดูแลนโยบายการพัฒนาตำบลท่าตูม โครงสร้างพื้นฐาน และความเป็นอยู่ของพี่น้องประชาชน',
        order: 1,
      },
      {
        id: 'exec-2',
        name: 'นายสุรพงษ์ ยิ่งดี',
        position: 'รองนายกองค์การบริหารส่วนตำบลท่าตูม (คนที่ 1)',
        department: 'คณะผู้บริหาร',
        phone: '044-591111 ต่อ 102',
        bio: 'ดูแลงานด้านการป้องกันและบรรเทาสาธารณภัย กิจการสาธารณสุข และสิ่งแวดล้อม',
        order: 2,
      },
      {
        id: 'exec-3',
        name: 'นางกัลยา สุขเจริญ',
        position: 'รองนายกองค์การบริหารส่วนตำบลท่าตูม (คนที่ 2)',
        department: 'คณะผู้บริหาร',
        phone: '044-591111 ต่อ 103',
        bio: 'ดูแลงานด้านการศึกษา ศาสนา วัฒนธรรม และการพัฒนาคุณภาพชีวิตสตรี เด็ก คนชรา',
        order: 3,
      },
      {
        id: 'exec-4',
        name: 'นายวิโรจน์ สุวรรณโชติ',
        position: 'ปลัดองค์การบริหารส่วนตำบลท่าตูม',
        department: 'สำนักปลัด',
        phone: '044-591111 ต่อ 104',
        bio: 'หัวหน้าข้าราชการประจำ กำกับดูแลการปฏิบัติงานของทุกกอง/สำนัก ให้บริการประชาชนอย่างโปร่งใส รวดเร็ว',
        order: 4,
      },
      {
        id: 'exec-5',
        name: 'นายสมบัติ ศรีประเสริฐ',
        position: 'ผู้อำนวยการกองช่าง',
        department: 'กองช่าง',
        phone: '044-591111 ต่อ 201',
        bio: 'ดูแลงานขออนุญาตก่อสร้าง ซ่อมแซมถนน สะพาน ไฟฟ้าส่องสว่าง และระบบระบายน้ำ',
        order: 5,
      },
      {
        id: 'exec-6',
        name: 'นางปราณี วงษ์สวรรค์',
        position: 'ผู้อำนวยการกองคลัง',
        department: 'กองคลัง',
        phone: '044-591111 ต่อ 202',
        bio: 'ดูแลงานจัดเก็บภาษีที่ดินและสิ่งปลูกสร้าง ภาษีป้าย และการเบิกจ่ายงบประมาณ',
        order: 6,
      },
    ],
    knowledgeItems: [
      {
        id: 'kb-1',
        topic: 'เบี้ยยังชีพผู้สูงอายุ',
        category: 'บริการประชาชน/สวัสดิการ',
        question: 'ลงทะเบียนรับเบี้ยยังชีพผู้สูงอายุต้องใช้เอกสารอะไรบ้าง และได้เงินเท่าไร?',
        answer: 'เอกสารที่ต้องใช้: 1. บัตรประจำตัวประชาชน 2. ทะเบียนบ้านฉบับจริง 3. สมุดบัญชีเงินฝากธนาคาร (กรณีโอนเงิน)\nอัตราการจ่ายเบี้ยยังชีพตามขั้นบันไดอายุ:\n- 60-69 ปี: 600 บาท/เดือน\n- 70-79 ปี: 700 บาท/เดือน\n- 80-89 ปี: 800 บาท/เดือน\n- 90 ปีขึ้นไป: 1,000 บาท/เดือน\nเปิดรับลงทะเบียน ณ สำนักปลัด อบต. ในวันและเวลาราชการ',
        keywords: 'เบี้ยคนชรา, เงินคนแก่, เงินสูงอายุ, ลงทะเบียน',
      },
      {
        id: 'kb-2',
        topic: 'การชำระภาษีที่ดินและสิ่งปลูกสร้าง',
        category: 'ภาษีและรายได้',
        question: 'ต้องชำระภาษีที่ดินและสิ่งปลูกสร้างเมื่อใด และชำระช่องทางไหนได้บ้าง?',
        answer: 'การชำระภาษีที่ดินและสิ่งปลูกสร้าง:\n- อบต. จะจัดส่งหนังสือแจ้งประเมินภาษี (ภ.ด.ส.6/7/8) ให้เจ้าของทรัพย์สิน\n- ชำระภาษีได้ภายในเดือนเมษายนของทุกปี (หรือตามที่กระทรวงมหาดไทยขยายเวลา)\n- ช่องทางชำระ: ณ กองคลัง อบต.ท่าตูม หรือสแกน QR Code ผ่าน Mobile Banking ทุกธนาคาร',
        keywords: 'ภาษีที่ดิน, ภดส, กองคลัง, จ่ายภาษี, ค่าภาษี',
      },
      {
        id: 'kb-3',
        topic: 'การขออนุญาตก่อสร้าง/ดัดแปลงอาคาร',
        category: 'บริการช่าง/โยธา',
        question: 'สร้างบ้านหรือต่อเติมอาคาร ต้องขออนุญาตกับใคร ใช้เอกสารอะไร?',
        answer: 'ยื่นคำขออนุญาตก่อสร้างอาคาร (แบบ ข.1) ได้ที่กองช่าง อบต.ท่าตูม\nเอกสารประกอบ:\n1. สำเนาบัตร ปชช. และทะเบียนบ้านของผู้ขอ\n2. สำเนาโฉนดที่ดิน/น.ส.3 (พร้อมหนังสือยินยอมกรณีไม่ใช่เจ้าของ)\n3. แบบแปลนแผนผังบริเวณและรายการประกอบแบบ (เซ็นรับรองโดยวิศวกร/สถาปนิกตามที่กฎหมายกำหนด)\nระยะเวลาพิจารณาประมาณ 15-45 วัน',
        keywords: 'ขอสร้างบ้าน, ใบอนุญาตก่อสร้าง, ต่อเติม, กองช่าง, แบบ ข1',
      },
      {
        id: 'kb-4',
        topic: 'การแจ้งเหตุฉุกเฉินและสาธารณภัย',
        category: 'ฉุกเฉิน/กู้ชีพ',
        question: 'ไฟไหม้ อุบัติเหตุ น้ำท่วม หรือสัตว์มีพิษเข้าบ้าน ติดต่อที่ไหน?',
        answer: 'ติดต่อหน่วยป้องกันและบรรเทาสาธารณภัย / หน่วยกู้ชีพ อบต.ท่าตูม ได้ตลอด 24 ชั่วโมง\nโทรศัพท์: 044-591199 หรือแจ้งผ่านสายด่วน 199 ได้ทันที เจ้าหน้าที่พร้อมออกปฏิบัติการตลอดเวลา',
        keywords: 'ไฟไหม้, รถชน, งูเข้าบ้าน, น้ำท่วม, กู้ชีพ, ฉุกเฉิน 24 ชม',
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
