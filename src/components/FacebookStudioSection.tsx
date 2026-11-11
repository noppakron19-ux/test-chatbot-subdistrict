import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Copy,
  Check,
  Save,
  ThumbsUp,
  MessageCircle,
  Share2,
  ExternalLink,
  Mic,
  RefreshCw,
  Camera,
  Tag,
  PhoneCall,
  CheckCircle2,
} from 'lucide-react';
import { VoiceIndicator } from './VoiceIndicator';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { SaoProfile, GeneratedPostResult, PrPost } from '../types';

interface FacebookStudioSectionProps {
  profile: SaoProfile;
  initialContent?: string;
  onSavePost: (post: Omit<PrPost, 'id'>) => Promise<void>;
}

export function FacebookStudioSection({
  profile,
  initialContent = '',
  onSavePost,
}: FacebookStudioSectionProps) {
  const [topic, setTopic] = useState('');
  const [rawContent, setRawContent] = useState(initialContent);
  const [category, setCategory] = useState('ข่าวประชาสัมพันธ์');
  const [tone, setTone] = useState('เป็นทางการแต่น่าอ่าน');
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeCallToAction, setIncludeCallToAction] = useState(true);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [generatedResult, setGeneratedResult] = useState<GeneratedPostResult | null>(null);

  // Speech recognition for dictating raw post content
  const {
    isListening,
    transcript,
    isSupported: speechSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    lang: 'th-TH',
    onResult: (liveText) => {
      setRawContent(liveText);
    },
  });

  const handleToggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim() && !rawContent.trim()) return;

    setIsGenerating(true);
    setSaveSuccess(false);

    try {
      const response = await fetch('/api/generate-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          rawContent,
          category,
          tone,
          includeHashtags,
          includeCallToAction,
          orgContext: profile,
        }),
      });

      if (!response.ok) {
        throw new Error('เกิดข้อผิดพลาดในการประมวลผล');
      }

      const data: GeneratedPostResult = await response.json();
      setGeneratedResult(data);
    } catch (err: any) {
      console.error('Failed to generate post:', err);
      alert(err.message || 'ไม่สามารถสร้างโพสต์ได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    const textToCopy = generatedResult?.fullPostText || rawContent;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToFirebase = async () => {
    const textToSave = generatedResult?.fullPostText || rawContent;
    if (!textToSave.trim()) return;

    setIsSaving(true);
    try {
      await onSavePost({
        title: topic || generatedResult?.headline || 'โพสต์ประชาสัมพันธ์ อบต.',
        content: textToSave,
        category,
        tone,
        hashtags: generatedResult?.hashtags || '',
        status: 'ready',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        imageAdvice: generatedResult?.imageAdvice || '',
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to save to Firestore:', err);
      alert('บันทึกข้อมูลไม่สำเร็จ: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const categories = [
    { label: '📢 ข่าวสาร/ประกาศทางการ', value: 'ข่าวประชาสัมพันธ์' },
    { label: '🎉 กิจกรรม/โครงการ อบต.', value: 'กิจกรรมและโครงการ' },
    { label: '💡 บริการประชาชน/แจ้งสิทธิ', value: 'บริการประชาชนและสวัสดิการ' },
    { label: '⚠️ เตือนภัย/สภาพอากาศ/ฉุกเฉิน', value: 'เตือนภัยและสาธารณภัย' },
    { label: '🏆 ผลงาน อบต./แสดงความยินดี', value: 'ผลงานและแสดงความยินดี' },
  ];

  const tones = [
    { label: '🏛️ เป็นทางการ น่าเชื่อถือ', value: 'เป็นทางการแต่น่าอ่าน' },
    { label: '😊 อบอุ่น เป็นกันเอง เข้าถึงง่าย', value: 'อบอุ่นเป็นกันเอง' },
    { label: '⚡ กระชับ ฉับไว ชัดเจน', value: 'กระชับตรงประเด็น' },
    { label: '📖 เล่าเรื่องชวนติดตาม', value: 'สร้างสรรค์ชวนติดตาม' },
  ];

  // Quick preset templates for rapid generation
  const quickTemplates = [
    {
      title: 'เชิญชวนลงทะเบียนเบี้ยผู้สูงอายุ',
      topic: 'เปิดรับลงทะเบียนเบี้ยยังชีพผู้สูงอายุ ประจำปีงบประมาณใหม่',
      content:
        'อบต. เปิดรับลงทะเบียนผู้สูงอายุที่มีอายุครบ 60 ปีบริบูรณ์ขึ้นไป เอกสาร: บัตร ปชช., ทะเบียนบ้าน, หน้าสมุดบัญชีธนาคาร ติดต่อได้ที่สำนักปลัดในวันเวลาราชการ',
      category: 'บริการประชาชนและสวัสดิการ',
    },
    {
      title: 'แจ้งเตือนพายุฤดูร้อน & เบอร์ฉุกเฉิน',
      topic: 'แจ้งเตือนประชาชนรับมือพายุฤดูร้อน ฝนฟ้าคะนอง และลมกระโชกแรง',
      content:
        'ขอให้พี่น้องประชาชนตรวจสอบความแข็งแรงของอาคารบ้านเรือน ป้ายโฆษณา ระวังต้นไม้หักโค่น หากเกิดเหตุสาธารณภัย สามารถโทรแจ้งหน่วยกู้ชีพ/ป้องกันฯ อบต. ได้ตลอด 24 ชั่วโมง',
      category: 'เตือนภัยและสาธารณภัย',
    },
    {
      title: 'เปิดโครงการพัฒนาตำบล / วันเด็ก / กีฬา',
      topic: 'ภาพบรรยากาศท่านนายก อบต. เป็นประธานเปิดโครงการเพื่อประชาชน',
      content:
        'ท่านนายก อบต. พร้อมด้วยคณะผู้บริหาร สมาชิกสภา อบต. ร่วมเปิดโครงการส่งเสริมคุณภาพชีวิต มีประชาชนเข้าร่วมอย่างอบอุ่นและได้รับประโยชน์อย่างเต็มที่',
      category: 'กิจกรรมและโครงการ',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/40 text-blue-100 border border-blue-400/30">
                Facebook Draft Studio
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/30 text-emerald-100 border border-emerald-400/40 flex items-center gap-1">
                🛡️ จำลองตัวอย่างเท่านั้น ไม่โพสต์จริง 100%
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              เครื่องมือช่วยคิดคำ & เรียบเรียงโพสต์ Facebook (จำลองตัวอย่าง)
            </h2>
            <p className="text-sm text-blue-100 mt-1 max-w-2xl leading-relaxed">
              ช่วยคุณคิดคำ พาดหัว จัดย่อหน้า และแสดงภาพตัวอย่างจำลองหน้าจอ (Preview) เท่านั้น{' '}
              <strong className="text-white underline decoration-emerald-400 decoration-2">
                ระบบจะไม่โพสต์ลงเพจ Facebook ของคุณจริงโดยเด็ดขาด
              </strong>{' '}
              คุณเป็นผู้ตัดสินใจตรวจทานและคัดลอกข้อความไปใช้งานเองเสมอ
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              onClick={handleCopy}
              disabled={!generatedResult && !rawContent}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-blue-800 font-semibold text-xs sm:text-sm hover:bg-blue-50 transition shadow-sm cursor-pointer disabled:opacity-50"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'คัดลอกสำเร็จ!' : 'คัดลอกข้อความ'}</span>
            </button>
          </div>
        </div>

        {/* Quick Template Chips */}
        <div className="mt-4 pt-4 border-t border-blue-600/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-xs text-blue-200 shrink-0 font-medium">ตัวอย่างหัวข้อด่วน:</span>
          {quickTemplates.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setTopic(item.topic);
                setRawContent(item.content);
                setCategory(item.category);
              }}
              className="px-2.5 py-1 rounded-lg bg-blue-600/70 hover:bg-blue-500/90 text-xs text-white shrink-0 transition border border-blue-400/30 cursor-pointer"
            >
              {item.title}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-6 space-y-5 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>ข้อมูลสำหรับสร้างและเรียบเรียงโพสต์</span>
            </h3>
            <span className="text-xs text-slate-400">ป้อนด้วยการพิมพ์หรือพูด</span>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              หัวข้อหรือเรื่องที่จะโพสต์ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="เช่น แจ้งกำหนดการฉีดวัคซีนป้องกันโรคพิษสุนัขบ้า, ผลการประชุมสภา อบต."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-800 text-sm focus:outline-none transition"
            />
          </div>

          {/* Raw details with Voice Dictation */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                รายละเอียดหรือเนื้อหาดิบ (พิมพ์หรือกดไมค์พูด)
              </label>
              <div className="flex items-center gap-1.5">
                <VoiceIndicator
                  isListening={isListening}
                  onToggle={handleToggleMic}
                  disabled={isGenerating || !speechSupported}
                  size="sm"
                />
                <span className="text-[11px] text-slate-500 font-medium">
                  {isListening ? (
                    <span className="text-red-600 font-bold animate-pulse">กำลังรับเสียง...</span>
                  ) : (
                    'กดไมค์เพื่อพูด'
                  )}
                </span>
              </div>
            </div>

            <textarea
              rows={5}
              value={rawContent}
              onChange={(e) => setRawContent(e.target.value)}
              placeholder="พิมพ์เนื้อหาที่ต้องการให้ AI เรียบเรียง หรือกดปุ่มไมโครโฟนด้านบนเพื่อพูดเล่าเรื่องราว วันนี้ทำอะไร มีใครมาร่วมงาน จุดสำคัญคืออะไร..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-800 text-sm focus:outline-none transition leading-relaxed"
            />

            {transcript && isListening && (
              <p className="mt-1 text-xs text-blue-600 italic">กำลังถอดเสียง: "{transcript}"</p>
            )}
          </div>

          {/* Category & Tone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                ประเภทโพสต์
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-800 text-sm focus:outline-none bg-white cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                น้ำเสียง (Tone)
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-800 text-sm focus:outline-none bg-white cursor-pointer"
              >
                {tones.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeHashtags}
                onChange={(e) => setIncludeHashtags(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span>ใส่แฮชแท็ก (#Hashtags) ยอดนิยม</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeCallToAction}
                onChange={(e) => setIncludeCallToAction(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span>ใส่ช่องทางติดต่อ/เบอร์โทร อบต. ท้ายโพสต์</span>
            </label>
          </div>

          {/* Generate Button */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={(!topic.trim() && !rawContent.trim()) || isGenerating}
            className={`w-full py-3.5 px-5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition shadow-md ${
              (!topic.trim() && !rawContent.trim()) || isGenerating
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white cursor-pointer active:scale-[0.99] shadow-blue-600/25'
            }`}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>AI กำลังคิดคำและจัดย่อหน้าสำหรับ Facebook...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>สร้างและเรียบเรียงโพสต์ Facebook ทันที</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Realistic Facebook Mockup & Output */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
              <span>ภาพจำลองหน้าจอเพจ Facebook (Mockup Preview)</span>
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
              จำลองตัวอย่าง • ไม่ใช่การโพสต์จริง
            </span>
          </div>

          {/* Facebook Post Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
            {/* Simulation Watermark Banner */}
            <div className="bg-amber-500/10 border-b border-amber-200/60 px-3.5 py-1.5 flex items-center justify-between text-[11px] text-amber-900 font-medium">
              <span>📌 พื้นที่จำลองการแสดงผลเพื่อตรวจทานคำ</span>
              <span className="text-amber-700">ไม่มีการเผยแพร่จริง</span>
            </div>

            {/* FB Header */}
            <div className="p-4 flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0 ring-2 ring-blue-100">
                  อบต
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-slate-900 text-sm leading-tight hover:underline cursor-pointer">
                      {profile.facebookPage || profile.orgName}
                    </h4>
                    <span className="text-blue-500 font-bold text-xs" title="Verified Page">
                      ✓
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                    <span>เมื่อสักครู่</span>
                    <span>·</span>
                    <span title="สาธารณะ">🌐</span>
                    <span>·</span>
                    <span className="text-emerald-700 font-medium">{category}</span>
                  </div>
                </div>
              </div>

              <div className="text-slate-400 font-bold text-lg px-2 cursor-pointer">•••</div>
            </div>

            {/* FB Post Text Body */}
            <div className="p-4 sm:p-5 text-sm text-slate-900 leading-relaxed font-normal whitespace-pre-wrap break-words">
              {generatedResult ? (
                <div>
                  <p className="font-bold text-base text-slate-950 mb-2 leading-snug">
                    {generatedResult.headline}
                  </p>
                  <p className="mb-3">{generatedResult.body}</p>

                  {generatedResult.highlights && generatedResult.highlights.length > 0 && (
                    <div className="bg-blue-50/60 rounded-xl p-3 mb-3 border border-blue-100 text-xs sm:text-sm text-slate-800 space-y-1">
                      <p className="font-semibold text-blue-900 mb-1">📌 สรุปประเด็นสำคัญ:</p>
                      {generatedResult.highlights.map((h, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <span className="text-blue-600 font-bold">•</span>
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {generatedResult.callToAction && (
                    <p className="text-xs sm:text-sm text-slate-700 font-medium mb-3 pt-1 border-t border-slate-100">
                      {generatedResult.callToAction}
                    </p>
                  )}

                  {generatedResult.hashtags && (
                    <p className="text-blue-700 text-xs sm:text-sm font-medium mt-2">
                      {generatedResult.hashtags}
                    </p>
                  )}
                </div>
              ) : rawContent ? (
                <div>
                  <p className="font-bold text-base text-slate-950 mb-2">
                    📢 {topic || 'ประชาสัมพันธ์ข้อมูล อบต.'}
                  </p>
                  <p>{rawContent}</p>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400">
                  <p className="text-sm">
                    กรอกข้อมูลหรือกดไมค์พูดทางด้านซ้าย แล้วกด "สร้างและเรียบเรียงโพสต์"
                    เพื่อดูตัวอย่างข้อความฉบับสมบูรณ์ที่นี่
                  </p>
                </div>
              )}
            </div>

            {/* Image Advice or Banner Placeholder */}
            {generatedResult?.imageAdvice ? (
              <div className="mx-4 mb-4 p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl flex items-start gap-2.5 text-xs text-slate-600">
                <Camera className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-800">คำแนะนำรูปภาพสำหรับทีม PR: </span>
                  <span>{generatedResult.imageAdvice}</span>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-slate-100 to-slate-200 border-y border-slate-200 py-10 flex flex-col items-center justify-center text-slate-400 text-xs gap-1.5">
                <Camera className="w-8 h-8 text-slate-300" />
                <span>พื้นที่รูปภาพประกอบโพสต์ Facebook (แนบรูปภาพกิจกรรมจริงของ อบต.)</span>
              </div>
            )}

            {/* FB Engagement Metrics */}
            <div className="px-4 py-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                  👍
                </span>
                <span className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px]">
                  ❤️
                </span>
                <span>ถูกใจ 48 คน</span>
              </div>
              <div className="flex gap-3">
                <span>12 ความคิดเห็น</span>
                <span>8 แชร์</span>
              </div>
            </div>

            {/* FB Interactive Buttons */}
            <div className="px-2 py-1.5 border-t border-slate-200 flex items-center justify-around text-xs text-slate-600 font-semibold">
              <button className="flex-1 py-2 flex items-center justify-center gap-1.5 hover:bg-slate-100 rounded-lg cursor-pointer">
                <ThumbsUp className="w-4 h-4 text-slate-500" />
                <span>ถูกใจ</span>
              </button>
              <button className="flex-1 py-2 flex items-center justify-center gap-1.5 hover:bg-slate-100 rounded-lg cursor-pointer">
                <MessageCircle className="w-4 h-4 text-slate-500" />
                <span>แสดงความคิดเห็น</span>
              </button>
              <button className="flex-1 py-2 flex items-center justify-center gap-1.5 hover:bg-slate-100 rounded-lg cursor-pointer">
                <Share2 className="w-4 h-4 text-slate-500" />
                <span>แชร์</span>
              </button>
            </div>
          </div>

          {/* Action Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <button
                onClick={handleCopy}
                disabled={!generatedResult && !rawContent}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 shadow-xs"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'คัดลอกสำเร็จแล้ว!' : 'คัดลอกข้อความ (นำไปตรวจทานและโพสต์เอง)'}</span>
              </button>

              <button
                onClick={handleSaveToFirebase}
                disabled={(!generatedResult && !rawContent) || isSaving}
                className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : saveSuccess ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{saveSuccess ? 'บันทึกลง Firebase แล้ว' : 'บันทึกเป็นแบบร่าง (Firebase)'}</span>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/60 text-xs text-emerald-900 leading-relaxed flex items-start gap-2">
              <span className="font-bold text-emerald-700 shrink-0">🔒 ความปลอดภัย:</span>
              <span>
                ระบบนี้เป็นเพียงผู้ช่วยร่างข้อความและจำลองหน้าจอเท่านั้น <strong>ไม่มีการเชื่อมต่อสิทธิ์ (Token) เพื่อโพสต์เข้าเพจ Facebook จริงอย่างแน่นอน 100%</strong> ข้อความจะถูกเผยแพร่ก็ต่อเมื่อคุณคัดลอกและนำไปวางบนหน้าเพจด้วยตัวเองเท่านั้นครับ
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
