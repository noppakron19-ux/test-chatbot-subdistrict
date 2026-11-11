import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  Share2,
  Trash2,
  AlertCircle,
  HelpCircle,
  Volume2,
} from 'lucide-react';
import { VoiceIndicator } from './VoiceIndicator';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { ChatMessage, SaoProfile, Executive, KnowledgeItem } from '../types';

interface ChatbotSectionProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, isVoice: boolean) => Promise<void>;
  onClearChat: () => void;
  isLoading: boolean;
  profile: SaoProfile;
  executives: Executive[];
  knowledgeItems: KnowledgeItem[];
  onTransferToFacebookStudio: (text: string) => void;
}

export function ChatbotSection({
  messages,
  onSendMessage,
  onClearChat,
  isLoading,
  profile,
  executives,
  knowledgeItems,
  onTransferToFacebookStudio,
}: ChatbotSectionProps) {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Speech recognition integration
  const {
    isListening,
    transcript,
    error: speechError,
    isSupported: speechSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    lang: 'th-TH',
    onResult: (liveText) => {
      setInputText(liveText);
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

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const textToSend = inputText.trim();
    if (!textToSend || isLoading) return;

    if (isListening) {
      stopListening();
    }

    const wasVoice = isListening || !!transcript;
    setInputText('');
    resetTranscript();

    await onSendMessage(textToSend, wasVoice);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Quick suggestions based on user prompt requirements
  const quickPrompts = [
    {
      title: '👔 นายกและรองนายกชื่ออะไร?',
      prompt: 'ขอทราบรายชื่อนายก อบต. รองนายก และคณะผู้บริหารของ อบต. พร้อมตำแหน่งอย่างเป็นทางการครับ',
    },
    {
      title: '📢 ช่วยคิดโพสต์ Facebook เบี้ยผู้สูงอายุ',
      prompt: 'ช่วยคิดคำและเรียบเรียงโพสต์ลงหน้าเพจ Facebook อบต. เรื่องการเปิดรับลงทะเบียนเบี้ยยังชีพผู้สูงอายุ ให้อ่านง่าย มีอิโมจิและแฮชแท็ก',
    },
    {
      title: '🚨 ขอเบอร์ติดต่อและสายด่วนฉุกเฉิน',
      prompt: 'ขอข้อมูลเบอร์โทรศัพท์ติดต่อ อบต. และเบอร์สายด่วนฉุกเฉินกู้ชีพตลอด 24 ชั่วโมง',
    },
    {
      title: '📋 การจ่ายภาษีที่ดินและสิ่งปลูกสร้าง',
      prompt: 'ประชาชนต้องชำระภาษีที่ดินและสิ่งปลูกสร้างช่วงไหน เอกสารและช่องทางชำระมีอะไรบ้าง?',
    },
    {
      title: '🎉 ช่วยร่างแคปชั่นเปิดงานกิจกรรม อบต.',
      prompt: 'ช่วยเขียนแคปชั่น Facebook สรุปภาพบรรยากาศเปิดงานกิจกรรมพัฒนาชุมชนของ อบต. ในวันนี้ ภาษาอบอุ่นเป็นกันเอง',
    },
  ];

  const mayor = executives.find((e) => e.position.includes('นายก') && !e.position.includes('รอง'));
  const deputyMayors = executives.filter((e) => e.position.includes('รองนายก'));

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] sm:h-[calc(100vh-155px)] max-w-5xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Chat Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-white border border-white/20">
              <Bot className="w-5 h-5 text-emerald-200" />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-emerald-800 rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-sm sm:text-base leading-tight">
                น้อง อบต. AI (ผู้ช่วยงานประชาสัมพันธ์ & ให้ข้อมูล)
              </h2>
            </div>
            <p className="text-xs text-emerald-100 flex items-center gap-1.5 opacity-90 truncate max-w-xs sm:max-w-md">
              <span>{profile.orgName}</span>
              {mayor && <span className="hidden sm:inline">• นายก: {mayor.name}</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={onClearChat}
              title="ล้างการสนทนา"
              className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition text-xs flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">ล้างแชท</span>
            </button>
          )}
        </div>
      </div>

      {/* Executives Quick Glance Banner */}
      <div className="bg-emerald-50/70 border-b border-emerald-100 px-4 py-2 flex items-center justify-between text-xs text-slate-700 overflow-x-auto no-scrollbar shrink-0">
        <div className="flex items-center gap-2 font-medium text-emerald-900 shrink-0">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-600" />
          <span>ข้อมูลผู้บริหาร:</span>
        </div>
        <div className="flex items-center gap-4 text-slate-600 shrink-0 pl-3">
          {mayor && (
            <span>
              <strong className="text-slate-800">นายก อบต.:</strong> {mayor.name}
            </span>
          )}
          {deputyMayors.length > 0 && (
            <span>
              <strong className="text-slate-800">รองนายก:</strong>{' '}
              {deputyMayors.map((d) => d.name).join(', ')}
            </span>
          )}
          <span className="text-emerald-700 font-medium">โทร: {profile.phone || '044-591111'}</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/50">
        {messages.length === 0 ? (
          <div className="max-w-xl mx-auto py-6 sm:py-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Bot className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg sm:text-xl mb-1">
              สวัสดีครับ! ผมคือ น้อง อบต. AI
            </h3>
            <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto leading-relaxed">
              พร้อมให้ข้อมูลเกี่ยวกับ <strong className="text-slate-700">{profile.orgName}</strong>,
              รายชื่อคณะผู้บริหาร, เบอร์ติดต่อ, บริการประชาชน และ{' '}
              <span className="text-emerald-700 font-semibold">
                ช่วยคิดคำ/เรียบเรียงโพสต์ลงเพจ Facebook
              </span>{' '}
              สามารถพูดผ่านไมค์ หรือพิมพ์ถามได้เลยครับ
            </p>

            {/* Quick Prompts */}
            <div className="text-left space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
                คำถามและคำสั่งยอดนิยมที่ลองกดได้ทันที:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quickPrompts.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setInputText(q.prompt);
                      inputRef.current?.focus();
                    }}
                    className="p-3 text-left rounded-xl border border-slate-200 bg-white hover:border-emerald-400 hover:bg-emerald-50/50 transition duration-150 text-xs sm:text-sm text-slate-700 group cursor-pointer shadow-2xs"
                  >
                    <div className="font-semibold text-emerald-800 group-hover:text-emerald-950 mb-0.5">
                      {q.title}
                    </div>
                    <div className="text-slate-500 line-clamp-2 text-xs">{q.prompt}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-2xs ${
                    isUser
                      ? 'bg-emerald-600 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                  }`}
                >
                  {/* Voice input indicator badge */}
                  {msg.isVoice && (
                    <div
                      className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full mb-1.5 ${
                        isUser
                          ? 'bg-emerald-700/60 text-emerald-100'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>ป้อนข้อมูลด้วยเสียง</span>
                    </div>
                  )}

                  {/* Message Content */}
                  <div className="whitespace-pre-wrap font-normal break-words">{msg.content}</div>

                  {/* Action Bar for Assistant Messages */}
                  {!isUser && (
                    <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                      <span className="text-[11px] text-slate-400">
                        {new Date(msg.timestamp).toLocaleTimeString('th-TH', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition cursor-pointer"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-600 font-medium">คัดลอกแล้ว</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>คัดลอก</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => onTransferToFacebookStudio(msg.content)}
                          title="ส่งข้อความนี้ไปจัดหน้าและดูตัวอย่างในสตูดิโอโพสต์ Facebook"
                          className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium transition cursor-pointer border border-blue-200"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>เปิดในสตูดิโอ Facebook</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </motion.div>
            );
          })
        )}

        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-xs px-4 py-3 shadow-2xs flex items-center gap-2 text-slate-500 text-sm">
              <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
              <span>น้อง อบต. AI กำลังเรียบเรียงข้อมูล...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Speech Status Banner */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-red-50 border-t border-red-200 px-4 py-2 flex items-center justify-between text-xs text-red-800"
          >
            <div className="flex items-center gap-2 truncate">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping shrink-0" />
              <span className="font-semibold">กำลังฟังเสียงภาษาไทย...</span>
              <span className="text-red-600 truncate">{transcript || 'พูดคำถามหรือเนื้อหาที่ต้องการได้เลย'}</span>
            </div>
            <button
              onClick={stopListening}
              className="text-xs bg-red-600 text-white px-2.5 py-1 rounded-md font-medium hover:bg-red-700 transition shrink-0 cursor-pointer"
            >
              เสร็จสิ้น / ส่ง
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Speech Error Warning */}
      {speechError && (
        <div className="bg-amber-50 border-t border-amber-200 px-4 py-1.5 flex items-center gap-2 text-xs text-amber-800">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
          <span>{speechError}</span>
        </div>
      )}

      {/* Input Form with Voice Dictation */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0">
        <form onSubmit={handleSend} className="flex items-end gap-2">
          {/* Microphone Voice Button */}
          <div className="shrink-0 mb-1">
            <VoiceIndicator
              isListening={isListening}
              onToggle={handleToggleMic}
              disabled={isLoading || !speechSupported}
              size="md"
            />
          </div>

          {/* Text Area */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isListening
                  ? 'กำลังแปลงเสียงพูดเป็นข้อความ...'
                  : 'พิมพ์คำถาม หรือกดไมค์พูด (เช่น นายกชื่ออะไร, ช่วยคิดโพสต์ Facebook...)'
              }
              className="w-full resize-none py-2.5 pl-3.5 pr-10 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 text-sm placeholder:text-slate-400 max-h-32 focus:outline-none transition"
              style={{ minHeight: '44px' }}
            />
            {inputText && (
              <button
                type="button"
                onClick={() => setInputText('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className={`shrink-0 w-11 h-11 mb-1 rounded-full flex items-center justify-center transition-all duration-150 shadow-sm ${
              inputText.trim() && !isLoading
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-95'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
            title="ส่งข้อความ (Enter)"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-between mt-1.5 px-1 text-[11px] text-slate-400">
          <span>รองรับการกดไมค์พูด (Speech-to-Text) เป็นภาษาไทยและจัดรูปแบบอัตโนมัติ</span>
          <span className="hidden sm:inline">กด Shift + Enter เพื่อขึ้นบรรทัดใหม่</span>
        </div>
      </div>
    </div>
  );
}
