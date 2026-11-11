import { useState, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Copy,
  Check,
  Save,
  ThumbsUp,
  MessageCircle,
  Share2,
  RefreshCw,
  Camera,
  FileText,
  PlusCircle,
  X,
  Upload,
  Image as ImageIcon,
  Palette,
  Link as LinkIcon,
  Maximize2,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { VoiceIndicator } from './VoiceIndicator';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { SaoProfile, GeneratedPostResult, PrPost } from '../types';
import {
  SAMPLE_OFFICIAL_GRAPHICS,
  SampleImageOption,
  compressImageFile,
} from '../lib/sampleImages';

export const DEFAULT_CONTACT_DETAIL = `#องค์การบริหารส่วนตำบลท่าตูม
📍 111 หมู่ 8 ต.ท่าตูม อ.ศรีมหาโพธิ จ.ปราจีนบุรี
☎️ โทรศัพท์ : 037-285161
📱 สายด่วน : 037-285347 (ตลอด 24 ชั่วโมง)
📘 Facebook : องค์การบริหารส่วนตำบลท่าตูม
📲 Line ID : @smartthatoom
🌐 เว็บไซต์ : www.tt.go.th`;

interface FacebookStudioSectionProps {
  profile: SaoProfile;
  initialContent?: string;
  initialImages?: string[];
  onSavePost: (post: Omit<PrPost, 'id'>) => Promise<void>;
}

export function FacebookStudioSection({
  profile,
  initialContent = '',
  initialImages = [],
  onSavePost,
}: FacebookStudioSectionProps) {
  const [topic, setTopic] = useState('');
  const [rawContent, setRawContent] = useState(initialContent);
  const [category, setCategory] = useState('ข่าวประชาสัมพันธ์');
  const [tone, setTone] = useState('เป็นทางการแต่น่าอ่าน');
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeCallToAction, setIncludeCallToAction] = useState(true);

  // Attached images state for post testing & preview
  const [postImages, setPostImages] = useState<string[]>(initialImages);
  const [isUploading, setIsUploading] = useState(false);
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState('');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailText, setDetailText] = useState(DEFAULT_CONTACT_DETAIL);
  const [insertedToast, setInsertedToast] = useState(false);

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

  // Image Upload / Add handlers
  const handleFileInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const newImages: string[] = [];
      for (let i = 0; i < files.length; i++) {
        if (files[i].type.startsWith('image/')) {
          const compressed = await compressImageFile(files[i]);
          newImages.push(compressed);
        }
      }
      setPostImages((prev) => [...prev, ...newImages].slice(0, 8)); // Support up to 8 images
    } catch (err) {
      console.error('Failed to compress/read image file:', err);
      alert('ไม่สามารถประมวลผลไฟล์รูปภาพได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAddPresetGraphic = (graphic: SampleImageOption) => {
    setPostImages((prev) => [...prev, graphic.dataUrl].slice(0, 8));
    setShowPresetModal(false);
  };

  const handleAddUrlImage = () => {
    const url = urlInputValue.trim();
    if (!url) return;
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('data:image/')) {
      alert('กรุณาป้อนลิงก์รูปภาพที่ถูกต้อง (ขึ้นต้นด้วย http:// หรือ https://)');
      return;
    }
    setPostImages((prev) => [...prev, url].slice(0, 8));
    setUrlInputValue('');
    setShowUrlInput(false);
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setPostImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleClearAllImages = () => {
    setPostImages([]);
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
    if (!textToCopy) return;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsertContactDetail = (textToInsert: string) => {
    if (!textToInsert.trim()) return;

    if (generatedResult) {
      setGeneratedResult((prev) => {
        if (!prev) return null;
        const currentFull = prev.fullPostText;
        if (currentFull.includes('037-285161')) return prev;
        return {
          ...prev,
          callToAction: textToInsert,
          fullPostText: `${prev.headline}\n\n${prev.body}\n\n${textToInsert}\n\n${prev.hashtags}`.trim(),
        };
      });
    }

    setRawContent((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return textToInsert;
      if (trimmed.includes('037-285161')) return trimmed;
      return `${trimmed}\n\n${textToInsert}`;
    });

    setIsDetailModalOpen(false);
    setInsertedToast(true);
    setTimeout(() => setInsertedToast(false), 2500);
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
        images: postImages,
        imageUrl: postImages[0] || '',
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
    { label: '🏛️ เป็นทางการ สุภาพ น่าเชื่อถือ', value: 'เป็นทางการแต่น่าอ่าน' },
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
      presetImageIndex: 1, // welfare banner
    },
    {
      title: 'แจ้งเตือนพายุฤดูร้อน & เบอร์ฉุกเฉิน',
      topic: 'แจ้งเตือนประชาชนรับมือพายุฤดูร้อน ฝนฟ้าคะนอง และลมกระโชกแรง',
      content:
        'ขอให้พี่น้องประชาชนตรวจสอบความแข็งแรงของอาคารบ้านเรือน ป้ายโฆษณา ระวังต้นไม้หักโค่น หากเกิดเหตุสาธารณภัย สามารถโทรแจ้งหน่วยกู้ชีพ/ป้องกันฯ อบต. ได้ตลอด 24 ชั่วโมง',
      category: 'เตือนภัยและสาธารณภัย',
      presetImageIndex: 2, // emergency banner
    },
    {
      title: 'บริการงาน อบต. จุดเดียวเบ็ดเสร็จ (304)',
      topic: 'ประชาสัมพันธ์จุดบริการประชาชน Smart Thatoom งานภาษีและช่าง',
      content:
        'อบต.ท่าตูม อำนวยความสะดวกในการชำระภาษีที่ดิน สิ่งปลูกสร้าง ขออนุญาตก่อสร้าง และติดต่อราชการ สะดวกรวดเร็ว',
      category: 'บริการประชาชนและสวัสดิการ',
      presetImageIndex: 3, // smart banner
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
              ช่วยคุณคิดคำ พาดหัว จัดย่อหน้า พร้อมลองใส่รูปภาพประกอบเพื่อตรวจดูความสมบูรณ์ของโพสต์บน Facebook{' '}
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
                if (item.presetImageIndex !== undefined) {
                  setPostImages([SAMPLE_OFFICIAL_GRAPHICS[item.presetImageIndex].dataUrl]);
                }
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
              rows={4}
              value={rawContent}
              onChange={(e) => setRawContent(e.target.value)}
              placeholder="พิมพ์เนื้อหาที่ต้องการให้ AI เรียบเรียง หรือกดปุ่มไมโครโฟนด้านบนเพื่อพูดเล่าเรื่องราว วันนี้ทำอะไร มีใครมาร่วมงาน จุดสำคัญคืออะไร..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-800 text-sm focus:outline-none transition leading-relaxed"
            />

            {/* Quick Contact Footer Tool */}
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 transition cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
                <span>📌 แทรกข้อมูลติดต่อ อบต. ท้ายโพสต์ (Popup)</span>
              </button>

              {insertedToast && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  <span>เพิ่มข้อมูลติดต่อใต้โพสต์แล้ว!</span>
                </motion.span>
              )}
            </div>

            {transcript && isListening && (
              <p className="mt-1 text-xs text-blue-600 italic">กำลังถอดเสียง: "{transcript}"</p>
            )}
          </div>

          {/* NEW: IMAGE INSERTION & MANAGEMENT SECTION */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                <span>ลองแนบรูปภาพประกอบโพสต์ ({postImages.length} รูป)</span>
              </label>

              {postImages.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllImages}
                  className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>ล้างรูปทั้งหมด</span>
                </button>
              )}
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              ลองใส่รูปภาพเพื่อดูความสมบูรณ์ของโพสต์บนหน้าจอจำลอง Facebook สามารถเลือกภาพจากมือถือ/คอม, ใช้แบนเนอร์กราฟิกทางการของ อบต., หรือใส่ลิงก์รูปภาพ
            </p>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileInputChange}
              className="hidden"
            />

            {/* Action Buttons for Inserting Images */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || postImages.length >= 8}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-medium text-xs transition shadow-2xs cursor-pointer disabled:opacity-50"
              >
                {isUploading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                ) : (
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                )}
                <span>{isUploading ? 'กำลังประมวลผลรูป...' : '📁 เลือกรูปจากเครื่อง / ถ่ายภาพ'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPresetModal(true)}
                disabled={postImages.length >= 8}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-medium text-xs transition shadow-2xs cursor-pointer disabled:opacity-50"
              >
                <Palette className="w-3.5 h-3.5 text-indigo-600" />
                <span>🎨 ป้ายกราฟิก อบต. (4 แบบ)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-medium text-xs transition shadow-2xs cursor-pointer"
              >
                <LinkIcon className="w-3.5 h-3.5 text-slate-500" />
                <span>🔗 ใส่ลิงก์ URL</span>
              </button>
            </div>

            {/* URL Input Form */}
            {showUrlInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 pt-1"
              >
                <input
                  type="url"
                  value={urlInputValue}
                  onChange={(e) => setUrlInputValue(e.target.value)}
                  placeholder="วางลิงก์รูปภาพ เช่น https://example.com/banner.jpg"
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-blue-500 bg-white"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddUrlImage();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddUrlImage}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  เพิ่มรูป
                </button>
              </motion.div>
            )}

            {/* Image Thumbnails Strip */}
            {postImages.length > 0 && (
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {postImages.map((imgSrc, index) => (
                    <div
                      key={index}
                      className="relative group shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 border-slate-300 bg-slate-200"
                    >
                      <img
                        src={imgSrc}
                        alt={`ภาพที่ ${index + 1}`}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => setLightboxIndex(index)}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition shadow-sm cursor-pointer"
                        title="ลบรูปนี้"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <span className="absolute bottom-0.5 left-0.5 text-[9px] px-1 rounded bg-black/60 text-white font-mono">
                        {index + 1}
                      </span>
                    </div>
                  ))}
                  {postImages.length < 8 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="shrink-0 w-16 h-16 rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-400 bg-white hover:bg-blue-50 flex flex-col items-center justify-center text-slate-400 hover:text-blue-600 text-[10px] gap-0.5 transition cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>เพิ่มรูป</span>
                    </button>
                  )}
                </div>
              </div>
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
              <span>📌 พื้นที่จำลองการแสดงผลเพื่อตรวจทานคำและรูปภาพ</span>
              <span className="text-amber-700 font-semibold">ไม่มีการเผยแพร่จริง 100%</span>
            </div>

            {/* FB Header */}
            <div className="p-4 flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0 ring-2 ring-blue-100">
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
                <div className="py-6 text-center text-slate-400">
                  <p className="text-sm">
                    กรอกข้อมูลหรือกดไมค์พูดทางด้านซ้าย แล้วกด "สร้างและเรียบเรียงโพสต์"
                    เพื่อดูตัวอย่างข้อความฉบับสมบูรณ์ที่นี่
                  </p>
                </div>
              )}
            </div>

            {/* REALISTIC FACEBOOK POST IMAGE PREVIEW */}
            {postImages.length === 0 ? (
              // Empty Image Placeholder with Interactive Actions
              <div
                onClick={() => setShowPresetModal(true)}
                className="bg-gradient-to-b from-slate-50 to-slate-100 border-y border-dashed border-slate-300 py-8 px-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-100/80 transition group"
              >
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-105 transition">
                  <Camera className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-slate-700 group-hover:text-blue-600 transition">
                  📷 ยังไม่มีรูปภาพประกอบโพสต์ (คลิกที่นี่เพื่อลองเลือกรูปภาพตัวอย่าง)
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  จำลองการแสดงผลภาพข่าว แบนเนอร์ หรือภาพกิจกรรม เหมือนหน้าฟีด Facebook ของจริง
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPresetModal(true);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 transition"
                  >
                    + ใช้ป้ายกราฟิก อบต.
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 transition"
                  >
                    + อัปโหลดรูปภาพ
                  </button>
                </div>
              </div>
            ) : postImages.length === 1 ? (
              // Single Photo View
              <div className="relative group bg-slate-950 overflow-hidden border-y border-slate-200">
                <img
                  src={postImages[0]}
                  alt="ภาพประกอบโพสต์"
                  onClick={() => setLightboxIndex(0)}
                  className="w-full max-h-[440px] object-cover cursor-pointer hover:opacity-95 transition"
                />
                <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition">
                  <button
                    type="button"
                    onClick={() => setLightboxIndex(0)}
                    className="p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 transition backdrop-blur-xs cursor-pointer"
                    title="ดูรูปขยาย"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(0)}
                    className="p-1.5 rounded-lg bg-red-600/80 text-white hover:bg-red-700 transition backdrop-blur-xs cursor-pointer"
                    title="ลบรูปนี้"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : postImages.length === 2 ? (
              // 2 Photos Side-by-Side View
              <div className="grid grid-cols-2 gap-1 bg-slate-950 border-y border-slate-200 h-[260px] sm:h-[300px]">
                {postImages.slice(0, 2).map((img, i) => (
                  <div key={i} className="relative group h-full overflow-hidden">
                    <img
                      src={img}
                      alt={`ภาพที่ ${i + 1}`}
                      onClick={() => setLightboxIndex(i)}
                      className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(i)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/60 text-white hover:bg-red-600 transition"
                      title="ลบรูป"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : postImages.length === 3 ? (
              // 3 Photos Layout (1 Top, 2 Bottom)
              <div className="grid grid-rows-2 gap-1 bg-slate-950 border-y border-slate-200 h-[340px]">
                <div className="relative group overflow-hidden">
                  <img
                    src={postImages[0]}
                    alt="ภาพที่ 1"
                    onClick={() => setLightboxIndex(0)}
                    className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(0)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/60 text-white hover:bg-red-600 transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1 overflow-hidden">
                  {postImages.slice(1, 3).map((img, i) => (
                    <div key={i} className="relative group overflow-hidden">
                      <img
                        src={img}
                        alt={`ภาพที่ ${i + 2}`}
                        onClick={() => setLightboxIndex(i + 1)}
                        className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(i + 1)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/60 text-white hover:bg-red-600 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // 4+ Photos Grid Layout with +N overlay
              <div className="grid grid-cols-2 gap-1 bg-slate-950 border-y border-slate-200 h-[320px]">
                {postImages.slice(0, 4).map((img, i) => (
                  <div key={i} className="relative group overflow-hidden">
                    <img
                      src={img}
                      alt={`ภาพที่ ${i + 1}`}
                      onClick={() => setLightboxIndex(i)}
                      className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition"
                    />
                    {i === 3 && postImages.length > 4 && (
                      <div
                        onClick={() => setLightboxIndex(3)}
                        className="absolute inset-0 bg-black/65 flex items-center justify-center text-white text-2xl font-bold cursor-pointer hover:bg-black/50 transition backdrop-blur-2xs"
                      >
                        +{postImages.length - 3}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(i)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/60 text-white hover:bg-red-600 transition z-10"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Image Advice or PR Tip */}
            {generatedResult?.imageAdvice && (
              <div className="mx-4 my-3 p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl flex items-start gap-2.5 text-xs text-slate-600">
                <Camera className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-800">คำแนะนำรูปภาพสำหรับทีม PR: </span>
                  <span>{generatedResult.imageAdvice}</span>
                </div>
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
                <span>ถูกใจ 54 คน</span>
              </div>
              <div className="flex gap-3">
                <span>15 ความคิดเห็น</span>
                <span>10 แชร์</span>
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
                ระบบนี้เป็นเพียงผู้ช่วยร่างข้อความและจำลองหน้าจอเท่านั้น <strong>ไม่มีการเชื่อมต่อสิทธิ์ (Token) เพื่อโพสต์เข้าเพจ Facebook จริงอย่างแน่นอน 100%</strong> ข้อความและรูปภาพจะถูกเผยแพร่ก็ต่อเมื่อคุณคัดลอกและนำไปวางบนหน้าเพจด้วยตัวเองเท่านั้นครับ
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: PRESET OFFICIAL SAO GRAPHICS PICKER */}
      <AnimatePresence>
        {showPresetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <Palette className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      เลือกป้ายกราฟิกทางการของ อบต.ท่าตูม
                    </h3>
                    <p className="text-xs text-slate-500">
                      แบนเนอร์กราฟิกความละเอียดสูง ออกแบบตามอัตลักษณ์ทางการของหน่วยงาน
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPresetModal(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Grid of 4 Presets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto p-1 flex-1">
                {SAMPLE_OFFICIAL_GRAPHICS.map((item) => (
                  <div
                    key={item.id}
                    className="border border-slate-200 rounded-xl overflow-hidden hover:border-indigo-500 hover:shadow-md transition flex flex-col justify-between bg-white group"
                  >
                    <div>
                      <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                        <img
                          src={item.dataUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-102 transition duration-200"
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-semibold backdrop-blur-xs">
                          {item.category}
                        </span>
                      </div>
                      <div className="p-3">
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{item.title}</h4>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="p-3 pt-0">
                      <button
                        type="button"
                        onClick={() => handleAddPresetGraphic(item)}
                        className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>เลือกใช้ภาพนี้</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setShowPresetModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-medium cursor-pointer"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: LIGHTBOX PHOTO VIEWER */}
      <AnimatePresence>
        {lightboxIndex !== null && postImages[lightboxIndex] && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl w-full flex flex-col items-center"
            >
              <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLightboxIndex(null)}
                  className="p-2 rounded-full bg-white/20 text-white hover:bg-white/40 transition cursor-pointer"
                  title="ปิด"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="max-h-[80vh] overflow-hidden rounded-xl bg-slate-900 flex items-center justify-center">
                <img
                  src={postImages[lightboxIndex]}
                  alt={`ภาพที่ ${lightboxIndex + 1}`}
                  className="max-h-[75vh] w-auto max-w-full object-contain"
                />
              </div>

              {/* Prev / Next controls if multiple images */}
              {postImages.length > 1 && (
                <div className="mt-4 flex items-center gap-4 text-white">
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxIndex((prev) =>
                        prev !== null ? (prev - 1 + postImages.length) % postImages.length : 0
                      )
                    }
                    className="p-2 rounded-full bg-white/20 hover:bg-white/40 transition cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-xs font-semibold">
                    {lightboxIndex + 1} / {postImages.length}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxIndex((prev) => (prev !== null ? (prev + 1) % postImages.length : 0))
                    }
                    className="p-2 rounded-full bg-white/20 hover:bg-white/40 transition cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: POPUP MODAL แทรกข้อมูลติดต่อ อบต.ท่าตูม ใต้โพสต์ */}
      <AnimatePresence>
        {isDetailModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      แทรกข้อมูลติดต่อ อบต. ท้ายโพสต์
                    </h3>
                    <p className="text-xs text-slate-500">
                      เพิ่มบล็อกข้อมูลทางการลงท้ายข้อความโพสต์ Facebook ทันที
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsDetailModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Textarea preview */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  ข้อความรายละเอียดที่จะเพิ่มลงใต้โพสต์ (สามารถปรับแก้ได้):
                </label>
                <textarea
                  rows={8}
                  value={detailText}
                  onChange={(e) => setDetailText(e.target.value)}
                  className="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-800 focus:outline-none bg-slate-50 leading-relaxed"
                />
              </div>

              {/* Quick Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(detailText);
                    setInsertedToast(true);
                    setTimeout(() => setInsertedToast(false), 2000);
                  }}
                  className="w-full sm:w-auto px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>คัดลอกเฉพาะข้อความนี้</span>
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setIsDetailModalOpen(false)}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-medium transition cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertContactDetail(detailText)}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>เพิ่มลงใต้โพสต์ทันที</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
