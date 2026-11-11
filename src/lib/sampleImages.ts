/**
 * High-fidelity Official Preset Graphics for SAO Thatoom Facebook Post Previews
 * Clean SVG Data URIs for instant rendering with zero network latency.
 */

export interface SampleImageOption {
  id: string;
  title: string;
  category: string;
  description: string;
  dataUrl: string;
}

// 1. Official Blue & Gold Announcement Banner
const createOfficialBannerSvg = () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f2b5c"/>
      <stop offset="50%" stop-color="#1e3a8a"/>
      <stop offset="100%" stop-color="#172554"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="50%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="30%" r="50%">
      <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#1e3a8a" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="675" fill="url(#bg)"/>
  <rect width="1200" height="675" fill="url(#glow)"/>
  
  <!-- Outer Gold Border -->
  <rect x="24" y="24" width="1152" height="627" rx="16" fill="none" stroke="url(#gold)" stroke-width="4"/>
  <rect x="36" y="36" width="1128" height="603" rx="12" fill="none" stroke="#60a5fa" stroke-opacity="0.3" stroke-width="1.5"/>
  
  <!-- Emblem Badge -->
  <circle cx="600" cy="180" r="75" fill="#1e40af" stroke="url(#gold)" stroke-width="4"/>
  <circle cx="600" cy="180" r="63" fill="#1d4ed8"/>
  <path d="M575 180 L600 135 L625 180 L600 165 Z" fill="#fbbf24"/>
  <circle cx="600" cy="180" r="22" fill="#f59e0b"/>
  <circle cx="600" cy="180" r="14" fill="#1e3a8a"/>

  <!-- Texts -->
  <text x="600" y="295" font-family="'Sarabun', 'Prompt', sans-serif" font-size="28" font-weight="600" fill="#93c5fd" text-anchor="middle" letter-spacing="2">
    องค์การบริหารส่วนตำบลท่าตูม
  </text>
  <text x="600" y="340" font-family="'Sarabun', 'Prompt', sans-serif" font-size="20" fill="#cbd5e1" text-anchor="middle">
    อำเภอศรีมหาโพธิ จังหวัดปราจีนบุรี
  </text>
  
  <!-- Headline Ribbon -->
  <rect x="260" y="380" width="680" height="85" rx="14" fill="url(#gold)" filter="drop-shadow(0 6px 12px rgba(0,0,0,0.3))"/>
  <text x="600" y="438" font-family="'Sarabun', 'Prompt', sans-serif" font-size="40" font-weight="800" fill="#1e293b" text-anchor="middle">
    📢 ข่าวประชาสัมพันธ์ทางการ
  </text>

  <!-- Subtitle -->
  <text x="600" y="520" font-family="'Sarabun', 'Prompt', sans-serif" font-size="22" font-weight="500" fill="#f8fafc" text-anchor="middle">
    ขอเชิญชวนพี่น้องประชาชนในเขตตำบลท่าตูม ติดตามข้อมูลข่าวสารสำคัญ
  </text>

  <!-- Contact Bar -->
  <rect x="80" y="580" width="1040" height="48" rx="8" fill="#0f172a" fill-opacity="0.8"/>
  <text x="600" y="611" font-family="'Sarabun', 'Prompt', sans-serif" font-size="17" fill="#e2e8f0" text-anchor="middle">
    ☎️ โทร: 037-285161 | 📱 สายด่วน 24 ชม.: 037-285347 | 🌐 www.tt.go.th | Line: @smartthatoom
  </text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

// 2. Welfare & Elderly Citizen Benefit Banner
const createWelfareBannerSvg = () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
  <defs>
    <linearGradient id="welfare-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#064e3b"/>
      <stop offset="50%" stop-color="#047857"/>
      <stop offset="100%" stop-color="#065f46"/>
    </linearGradient>
    <linearGradient id="warm-gold" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="100%" stop-color="#facc15"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="675" fill="url(#welfare-bg)"/>
  
  <rect x="24" y="24" width="1152" height="627" rx="16" fill="none" stroke="url(#warm-gold)" stroke-width="4"/>

  <!-- Icon Circle -->
  <circle cx="600" cy="170" r="70" fill="#065f46" stroke="#facc15" stroke-width="4"/>
  <text x="600" y="190" font-size="65" text-anchor="middle">👴👵</text>

  <text x="600" y="285" font-family="'Sarabun', 'Prompt', sans-serif" font-size="28" font-weight="600" fill="#a7f3d0" text-anchor="middle">
    กองสวัสดิการสังคม • อบต.ท่าตูม อ.ศรีมหาโพธิ
  </text>

  <rect x="200" y="340" width="800" height="90" rx="16" fill="#facc15"/>
  <text x="600" y="400" font-family="'Sarabun', 'Prompt', sans-serif" font-size="38" font-weight="800" fill="#064e3b" text-anchor="middle">
    สวัสดิการและเบี้ยยังชีพประชาชน
  </text>

  <!-- Bullet points -->
  <rect x="180" y="460" width="840" height="85" rx="12" fill="#022c22" fill-opacity="0.6"/>
  <text x="600" y="510" font-family="'Sarabun', 'Prompt', sans-serif" font-size="22" font-weight="500" fill="#f0fdf4" text-anchor="middle">
    ลงทะเบียนเบี้ยยังชีพผู้สูงอายุ / คนพิการ / เงินอุดหนุนเด็กแรกเกิด ประจำปี
  </text>

  <rect x="80" y="580" width="1040" height="48" rx="8" fill="#064e3b" fill-opacity="0.9"/>
  <text x="600" y="611" font-family="'Sarabun', 'Prompt', sans-serif" font-size="17" fill="#d1fae5" text-anchor="middle">
    ติดต่อสำนักปลัดและกองสวัสดิการสังคม อบต.ท่าตูม ในวันเวลาราชการ โทร: 037-285161
  </text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

// 3. Emergency & Disaster Rescue 24h Banner
const createEmergencyBannerSvg = () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
  <defs>
    <linearGradient id="red-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7f1d1d"/>
      <stop offset="50%" stop-color="#b91c1c"/>
      <stop offset="100%" stop-color="#991b1b"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="675" fill="url(#red-bg)"/>
  
  <rect x="24" y="24" width="1152" height="627" rx="16" fill="none" stroke="#fef08a" stroke-width="4"/>

  <!-- Siren Badge -->
  <circle cx="600" cy="160" r="65" fill="#450a0a" stroke="#facc15" stroke-width="4"/>
  <text x="600" y="180" font-size="60" text-anchor="middle">🚨</text>

  <text x="600" y="270" font-family="'Sarabun', 'Prompt', sans-serif" font-size="26" font-weight="600" fill="#fecaca" text-anchor="middle">
    หน่วยป้องกันและบรรเทาสาธารณภัย / หน่วยกู้ชีพ
  </text>
  <text x="600" y="310" font-family="'Sarabun', 'Prompt', sans-serif" font-size="20" fill="#fee2e2" text-anchor="middle">
    องค์การบริหารส่วนตำบลท่าตูม อ.ศรีมหาโพธิ จ.ปราจีนบุรี
  </text>

  <rect x="220" y="340" width="760" height="90" rx="16" fill="#facc15"/>
  <text x="600" y="400" font-family="'Sarabun', 'Prompt', sans-serif" font-size="38" font-weight="800" fill="#7f1d1d" text-anchor="middle">
    สายด่วนฉุกเฉิน 24 ชั่วโมง
  </text>

  <!-- Big Phone Number Box -->
  <rect x="260" y="455" width="680" height="95" rx="16" fill="#450a0a" stroke="#f87171" stroke-width="2"/>
  <text x="600" y="520" font-family="'Sarabun', 'Prompt', sans-serif" font-size="52" font-weight="900" fill="#fef08a" text-anchor="middle" letter-spacing="3">
    ☎️ 037-285347
  </text>

  <rect x="80" y="580" width="1040" height="48" rx="8" fill="#450a0a" fill-opacity="0.9"/>
  <text x="600" y="611" font-family="'Sarabun', 'Prompt', sans-serif" font-size="17" fill="#fee2e2" text-anchor="middle">
    พร้อมระงับเหตุอัคคีภัย อุบัติเหตุ และช่วยเหลือพี่น้องประชาชนตลอด 24 ชั่วโมง
  </text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

// 4. Smart City & Industrial Zone 304 Public Service
const createSmartThatoomBannerSvg = () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
  <defs>
    <linearGradient id="tech-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e1b4b"/>
      <stop offset="50%" stop-color="#312e81"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="cyan-glow" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#06b6d4"/>
      <stop offset="100%" stop-color="#3b82f6"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="675" fill="url(#tech-bg)"/>
  
  <rect x="24" y="24" width="1152" height="627" rx="16" fill="none" stroke="url(#cyan-glow)" stroke-width="4"/>

  <circle cx="600" cy="160" r="65" fill="#1e1b4b" stroke="#38bdf8" stroke-width="4"/>
  <text x="600" y="180" font-size="60" text-anchor="middle">🌐</text>

  <text x="600" y="265" font-family="'Sarabun', 'Prompt', sans-serif" font-size="26" font-weight="600" fill="#93c5fd" text-anchor="middle">
    ศูนย์บริการประชาชนดิจิทัล (Smart Thatoom)
  </text>

  <rect x="220" y="320" width="760" height="90" rx="16" fill="url(#cyan-glow)"/>
  <text x="600" y="380" font-family="'Sarabun', 'Prompt', sans-serif" font-size="38" font-weight="800" fill="#0f172a" text-anchor="middle">
    บริการงาน อบต. สะดวกรวดเร็ว
  </text>

  <!-- 3 Pillars -->
  <text x="600" y="470" font-family="'Sarabun', 'Prompt', sans-serif" font-size="22" font-weight="500" fill="#e0e7ff" text-anchor="middle">
    ชำระภาษีที่ดิน/ป้าย • ขออนุญาตก่อสร้าง • งานบริการชุมชนและนิคม 304
  </text>

  <rect x="80" y="580" width="1040" height="48" rx="8" fill="#0f172a" fill-opacity="0.9"/>
  <text x="600" y="611" font-family="'Sarabun', 'Prompt', sans-serif" font-size="17" fill="#cbd5e1" text-anchor="middle">
    Line ID: @smartthatoom | เว็บไซต์: www.tt.go.th | อบต.ท่าตูม อ.ศรีมหาโพธิ จ.ปราจีนบุรี
  </text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const SAMPLE_OFFICIAL_GRAPHICS: SampleImageOption[] = [
  {
    id: 'official-banner',
    title: '📢 ป้ายประกาศทางการ อบต.ท่าตูม',
    category: 'ข่าวประชาสัมพันธ์',
    description: 'แบนเนอร์สีน้ำเงิน-ทอง สง่างาม พร้อมชื่อ อบต.ท่าตูม อ.ศรีมหาโพธิ และช่องทางติดต่อ',
    dataUrl: createOfficialBannerSvg(),
  },
  {
    id: 'welfare-banner',
    title: '👵 สวัสดิการและเบี้ยยังชีพ อบต.',
    category: 'สวัสดิการประชาชน',
    description: 'แบนเนอร์สีเขียว-ทอง สำหรับข่าวลงทะเบียนเบี้ยผู้สูงอายุ คนพิการ และสวัสดิการ',
    dataUrl: createWelfareBannerSvg(),
  },
  {
    id: 'emergency-banner',
    title: '🚨 สายด่วนกู้ชีพ 24 ชม. (037-285347)',
    category: 'เตือนภัย & กู้ชีพ',
    description: 'แบนเนอร์สีแดงเด่นชัด แจ้งเหตุสาธารณภัย อุบัติเหตุ ดับเพลิง และสายด่วน',
    dataUrl: createEmergencyBannerSvg(),
  },
  {
    id: 'smart-thatoom',
    title: '🌐 Smart Thatoom บริการประชาชน',
    category: 'บริการ & ดิจิทัล',
    description: 'แบนเนอร์โทนโมเดิร์น น้ำเงิน-ฟ้า สำหรับงานภาษี ช่าง และการพัฒนาชุมชน/นิคม 304',
    dataUrl: createSmartThatoomBannerSvg(),
  },
];

/**
 * Client-side lightweight image compressor to max 1280px dimension and JPEG 0.82
 */
export async function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 1280;
        const maxHeight = 1280;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(readerEvent.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Convert to web-friendly JPEG to reduce storage & instant render
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('ไม่สามารถประมวลผลไฟล์รูปภาพได้'));
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = () => reject(new Error('ไม่สามารถอ่านไฟล์ได้'));
    reader.readAsDataURL(file);
  });
}
