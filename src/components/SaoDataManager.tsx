import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2,
  Users,
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  Save,
  RotateCcw,
  Check,
  ExternalLink,
  Phone,
  ShieldCheck,
  Award,
  Globe,
  Clock,
  MapPin,
} from 'lucide-react';
import { SaoProfile, Executive, KnowledgeItem } from '../types';

interface SaoDataManagerProps {
  profile: SaoProfile;
  executives: Executive[];
  knowledgeItems: KnowledgeItem[];
  onUpdateProfile: (profile: SaoProfile) => Promise<void>;
  onAddExecutive: (executive: Omit<Executive, 'id'>) => Promise<void>;
  onUpdateExecutive: (id: string, executive: Partial<Executive>) => Promise<void>;
  onDeleteExecutive: (id: string) => Promise<void>;
  onAddKnowledgeItem: (item: Omit<KnowledgeItem, 'id'>) => Promise<void>;
  onUpdateKnowledgeItem: (id: string, item: Partial<KnowledgeItem>) => Promise<void>;
  onDeleteKnowledgeItem: (id: string) => Promise<void>;
  onResetDefaultData: () => Promise<void>;
}

export function SaoDataManager({
  profile,
  executives,
  knowledgeItems,
  onUpdateProfile,
  onAddExecutive,
  onUpdateExecutive,
  onDeleteExecutive,
  onAddKnowledgeItem,
  onUpdateKnowledgeItem,
  onDeleteKnowledgeItem,
  onResetDefaultData,
}: SaoDataManagerProps) {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'executives' | 'knowledge'>('executives');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState<SaoProfile>(profile);

  // Executive modal / form state
  const [isExecModalOpen, setIsExecModalOpen] = useState(false);
  const [editingExecId, setEditingExecId] = useState<string | null>(null);
  const [execForm, setExecForm] = useState<Omit<Executive, 'id'>>({
    name: '',
    position: 'นายกองค์การบริหารส่วนตำบล',
    department: 'คณะผู้บริหาร',
    phone: '',
    bio: '',
    order: 1,
  });

  // Knowledge item modal / form state
  const [isKbModalOpen, setIsKbModalOpen] = useState(false);
  const [editingKbId, setEditingKbId] = useState<string | null>(null);
  const [kbForm, setKbForm] = useState<Omit<KnowledgeItem, 'id'>>({
    topic: '',
    category: 'บริการประชาชน/สวัสดิการ',
    question: '',
    answer: '',
    keywords: '',
  });

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdateProfile(profileForm);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: any) {
      alert('บันทึกไม่สำเร็จ: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenAddExec = () => {
    setEditingExecId(null);
    setExecForm({
      name: '',
      position: 'รองนายกองค์การบริหารส่วนตำบล',
      department: 'คณะผู้บริหาร',
      phone: profile.phone || '',
      bio: '',
      order: executives.length + 1,
    });
    setIsExecModalOpen(true);
  };

  const handleOpenEditExec = (exec: Executive) => {
    setEditingExecId(exec.id);
    setExecForm({
      name: exec.name,
      position: exec.position,
      department: exec.department || '',
      phone: exec.phone || '',
      bio: exec.bio || '',
      order: exec.order || 1,
    });
    setIsExecModalOpen(true);
  };

  const handleSaveExec = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!execForm.name.trim() || !execForm.position.trim()) return;

    try {
      if (editingExecId) {
        await onUpdateExecutive(editingExecId, execForm);
      } else {
        await onAddExecutive(execForm);
      }
      setIsExecModalOpen(false);
    } catch (err: any) {
      alert('บันทึกไม่สำเร็จ: ' + err.message);
    }
  };

  const handleOpenAddKb = () => {
    setEditingKbId(null);
    setKbForm({
      topic: '',
      category: 'บริการประชาชน/สวัสดิการ',
      question: '',
      answer: '',
      keywords: '',
    });
    setIsKbModalOpen(true);
  };

  const handleOpenEditKb = (item: KnowledgeItem) => {
    setEditingKbId(item.id);
    setKbForm({
      topic: item.topic,
      category: item.category || 'บริการประชาชน/สวัสดิการ',
      question: item.question || '',
      answer: item.answer,
      keywords: item.keywords || '',
    });
    setIsKbModalOpen(true);
  };

  const handleSaveKb = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kbForm.topic.trim() || !kbForm.answer.trim()) return;

    try {
      if (editingKbId) {
        await onUpdateKnowledgeItem(editingKbId, kbForm);
      } else {
        await onAddKnowledgeItem(kbForm);
      }
      setIsKbModalOpen(false);
    } catch (err: any) {
      alert('บันทึกไม่สำเร็จ: ' + err.message);
    }
  };

  const positionPresets = [
    'นายกองค์การบริหารส่วนตำบล',
    'รองนายกองค์การบริหารส่วนตำบล (คนที่ 1)',
    'รองนายกองค์การบริหารส่วนตำบล (คนที่ 2)',
    'ที่ปรึกษานายกองค์การบริหารส่วนตำบล',
    'เลขานุการนายกองค์การบริหารส่วนตำบล',
    'ปลัดองค์การบริหารส่วนตำบล',
    'รองปลัดองค์การบริหารส่วนตำบล',
    'ผู้อำนวยการกองช่าง',
    'ผู้อำนวยการกองคลัง',
    'ผู้อำนวยการกองสาธารณสุขและสิ่งแวดล้อม',
    'ผู้อำนวยการกองการศึกษา ศาสนาและวัฒนธรรม',
    'หัวหน้าสำนักปลัด',
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Banner with tt.go.th Reference */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                ฐานข้อมูล อบต. (Firebase Firestore)
              </span>
              <span className="text-xs text-emerald-200">ซิงค์แบบเรียลไทม์กับแชทบอท</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              จัดการข้อมูล อบต. ผู้บริหาร และบริการประชาชน
            </h2>
            <p className="text-sm text-emerald-100 mt-1 max-w-2xl leading-relaxed">
              ป้อนข้อมูล <strong className="text-white">นายก อบต., รองนายก, ปลัด</strong>{' '}
              และงานบริการต่างๆ จากเว็บไซต์ทางการ{' '}
              <a
                href="https://tt.go.th/public/"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-white inline-flex items-center gap-1 font-semibold"
              >
                https://tt.go.th/public/
                <ExternalLink className="w-3 h-3 inline" />
              </a>{' '}
              เพื่อให้น้อง อบต. AI ใช้เป็นฐานข้อมูลตอบคำถามและคิดคำโพสต์ Facebook ได้ตรงเป๊ะ 100%
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              onClick={async () => {
                if (confirm('ต้องการโหลดข้อมูลตั้งต้นจาก อบต.ท่าตูม (tt.go.th) หรือไม่?')) {
                  await onResetDefaultData();
                  setProfileForm(profile);
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-medium transition border border-white/20 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>โหลดข้อมูล อบต.ท่าตูม</span>
            </button>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="mt-5 pt-4 border-t border-emerald-700/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveSubTab('executives')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'executives'
                ? 'bg-white text-emerald-900 font-bold shadow-xs'
                : 'bg-emerald-900/40 text-emerald-100 hover:bg-emerald-900/70'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>ทำเนียบผู้บริหาร ({executives.length} ท่าน)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('profile')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'profile'
                ? 'bg-white text-emerald-900 font-bold shadow-xs'
                : 'bg-emerald-900/40 text-emerald-100 hover:bg-emerald-900/70'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>ข้อมูลทั่วไป & ช่องทางติดต่อ อบต.</span>
          </button>

          <button
            onClick={() => setActiveSubTab('knowledge')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'knowledge'
                ? 'bg-white text-emerald-900 font-bold shadow-xs'
                : 'bg-emerald-900/40 text-emerald-100 hover:bg-emerald-900/70'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>คลังความรู้ & บริการประชาชน ({knowledgeItems.length} หัวข้อ)</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: EXECUTIVES DIRECTORY */}
      {activeSubTab === 'executives' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <div>
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <span>รายชื่อคณะผู้บริหารและหัวหน้าส่วนราชการ</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ข้อมูล นายก อบต., รองนายก, ปลัด และหัวหน้ากอง ที่น้อง อบต. AI ใช้ตอบคำถามประชาชน
              </p>
            </div>

            <button
              onClick={handleOpenAddExec}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มรายชื่อผู้บริหาร</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {executives.map((exec) => {
              const isMayor = exec.position.includes('นายก') && !exec.position.includes('รอง');
              const isDeputy = exec.position.includes('รองนายก');
              const isSecretary = exec.position.includes('ปลัด');

              return (
                <div
                  key={exec.id}
                  className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all duration-150 hover:shadow-sm flex flex-col justify-between ${
                    isMayor
                      ? 'border-emerald-400 bg-gradient-to-br from-emerald-50/50 to-white ring-1 ring-emerald-300'
                      : isDeputy
                      ? 'border-blue-200 bg-gradient-to-br from-blue-50/30 to-white'
                      : 'border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          isMayor
                            ? 'bg-emerald-600 text-white'
                            : isDeputy
                            ? 'bg-blue-600 text-white'
                            : isSecretary
                            ? 'bg-amber-600 text-white'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {exec.department || 'คณะผู้บริหาร'}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditExec(exec)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                          title="แก้ไข"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`ต้องการลบ ${exec.name} หรือไม่?`)) {
                              onDeleteExecutive(exec.id);
                            }
                          }}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition cursor-pointer"
                          title="ลบ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="font-bold text-slate-900 text-base leading-tight mb-1">
                      {exec.name}
                    </h4>
                    <p className="text-xs font-semibold text-emerald-800 mb-2">{exec.position}</p>

                    {exec.bio && (
                      <p className="text-xs text-slate-600 line-clamp-3 mb-3 leading-relaxed">
                        {exec.bio}
                      </p>
                    )}
                  </div>

                  {exec.phone && (
                    <div className="pt-2.5 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-500">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{exec.phone}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 2: GENERAL SAO PROFILE */}
      {activeSubTab === 'profile' && (
        <form
          onSubmit={handleSaveProfile}
          className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-2xs space-y-5"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-base">ข้อมูลองค์กรและช่องทางติดต่อ</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ข้อมูลนี้จะแสดงในส่วนหัวเว็บ และใช้อ้างอิงในแคปชั่นโพสต์ Facebook
              </p>
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold transition shadow-xs cursor-pointer"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>บันทึกสำเร็จ</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึกลง Firebase'}</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                ชื่อหน่วยงาน อบต. <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={profileForm.orgName}
                onChange={(e) => setProfileForm({ ...profileForm, orgName: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                อำเภอ
              </label>
              <input
                type="text"
                value={profileForm.district || ''}
                onChange={(e) => setProfileForm({ ...profileForm, district: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                จังหวัด
              </label>
              <input
                type="text"
                value={profileForm.province || ''}
                onChange={(e) => setProfileForm({ ...profileForm, province: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                เว็บไซต์ทางการ
              </label>
              <input
                type="url"
                value={profileForm.websiteUrl || ''}
                onChange={(e) => setProfileForm({ ...profileForm, websiteUrl: e.target.value })}
                placeholder="https://tt.go.th/public/"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                ชื่อหน้าเพจ Facebook ทางการ
              </label>
              <input
                type="text"
                value={profileForm.facebookPage || ''}
                onChange={(e) => setProfileForm({ ...profileForm, facebookPage: e.target.value })}
                placeholder="องค์การบริหารส่วนตำบลท่าตูม จังหวัดสุรินทร์"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                เบอร์โทรศัพท์สำนักงาน
              </label>
              <input
                type="text"
                value={profileForm.phone || ''}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                placeholder="044-591111"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                เบอร์สายด่วนฉุกเฉิน / กู้ชีพ 24 ชั่วโมง
              </label>
              <input
                type="text"
                value={profileForm.emergencyPhone || ''}
                onChange={(e) => setProfileForm({ ...profileForm, emergencyPhone: e.target.value })}
                placeholder="044-591199 หรือ 199"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                ที่อยู่สำนักงาน อบต.
              </label>
              <input
                type="text"
                value={profileForm.address || ''}
                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                วันและเวลาทำการ
              </label>
              <input
                type="text"
                value={profileForm.workHours || ''}
                onChange={(e) => setProfileForm({ ...profileForm, workHours: e.target.value })}
                placeholder="จันทร์ - ศุกร์ เวลา 08.30 - 16.30 น."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                วิสัยทัศน์หรือคำขวัญ อบต.
              </label>
              <textarea
                rows={2}
                value={profileForm.vision || ''}
                onChange={(e) => setProfileForm({ ...profileForm, vision: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </form>
      )}

      {/* SUBTAB 3: KNOWLEDGE BASE / SERVICES */}
      {activeSubTab === 'knowledge' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <div>
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                <span>คลังความรู้ บริการประชาชน และขั้นตอนติดต่อราชการ</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ข้อมูลเบี้ยยังชีพ, ภาษีที่ดิน, การขออนุญาตก่อสร้าง สำหรับแชทบอทตอบคำถาม
              </p>
            </div>

            <button
              onClick={handleOpenAddKb}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มหัวข้อบริการใหม่</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {knowledgeItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 flex flex-col justify-between hover:border-emerald-300 transition shadow-2xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {item.category || 'บริการประชาชน'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditKb(item)}
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`ต้องการลบ "${item.topic}" หรือไม่?`)) {
                            onDeleteKnowledgeItem(item.id);
                          }
                        }}
                        className="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm sm:text-base mb-1">
                    {item.topic}
                  </h4>
                  {item.question && (
                    <p className="text-xs font-semibold text-slate-600 mb-2 italic">
                      "ถาม: {item.question}"
                    </p>
                  )}
                  <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed line-clamp-4">
                    {item.answer}
                  </p>
                </div>

                {item.keywords && (
                  <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-400 truncate">
                    คำค้นหา: {item.keywords}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EXECUTIVE MODAL */}
      <AnimatePresence>
        {isExecModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200"
            >
              <h3 className="font-bold text-slate-900 text-lg mb-4">
                {editingExecId ? 'แก้ไขข้อมูลผู้บริหาร' : 'เพิ่มรายชื่อผู้บริหาร / เจ้าหน้าที่'}
              </h3>

              <form onSubmit={handleSaveExec} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    ชื่อ - นามสกุล (พร้อมคำนำหน้า) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={execForm.name}
                    onChange={(e) => setExecForm({ ...execForm, name: e.target.value })}
                    placeholder="เช่น นายพศิน เกษียรพันธุ์"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    ตำแหน่ง <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={execForm.position}
                    onChange={(e) => setExecForm({ ...execForm, position: e.target.value })}
                    placeholder="เช่น นายกองค์การบริหารส่วนตำบล, รองนายก อบต."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none mb-1.5"
                  />
                  <div className="flex flex-wrap gap-1">
                    {positionPresets.slice(0, 5).map((pos) => (
                      <button
                        type="button"
                        key={pos}
                        onClick={() => setExecForm({ ...execForm, position: pos })}
                        className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 cursor-pointer"
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      สำนัก / กอง
                    </label>
                    <input
                      type="text"
                      value={execForm.department || ''}
                      onChange={(e) => setExecForm({ ...execForm, department: e.target.value })}
                      placeholder="เช่น คณะผู้บริหาร, สำนักปลัด"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      เบอร์โทรศัพท์ติดต่อ
                    </label>
                    <input
                      type="text"
                      value={execForm.phone || ''}
                      onChange={(e) => setExecForm({ ...execForm, phone: e.target.value })}
                      placeholder="เช่น 044-591111 ต่อ 101"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    ภารกิจที่กำกับดูแล / ประวัติย่อ
                  </label>
                  <textarea
                    rows={3}
                    value={execForm.bio || ''}
                    onChange={(e) => setExecForm({ ...execForm, bio: e.target.value })}
                    placeholder="เช่น กำกับดูแลงานโยธา กองช่าง และการพัฒนาโครงสร้างพื้นฐาน"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsExecModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs sm:text-sm font-medium transition cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold transition cursor-pointer shadow-xs"
                  >
                    บันทึกข้อมูล
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* KNOWLEDGE ITEM MODAL */}
      <AnimatePresence>
        {isKbModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200"
            >
              <h3 className="font-bold text-slate-900 text-lg mb-4">
                {editingKbId ? 'แก้ไขข้อมูลบริการ' : 'เพิ่มหัวข้อบริการ / คำถามพบบ่อย'}
              </h3>

              <form onSubmit={handleSaveKb} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    เรื่อง / หัวข้อบริการ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={kbForm.topic}
                    onChange={(e) => setKbForm({ ...kbForm, topic: e.target.value })}
                    placeholder="เช่น การลงทะเบียนเบี้ยยังชีพผู้สูงอายุ"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      หมวดหมู่
                    </label>
                    <select
                      value={kbForm.category}
                      onChange={(e) => setKbForm({ ...kbForm, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none bg-white cursor-pointer"
                    >
                      <option value="บริการประชาชน/สวัสดิการ">บริการประชาชน/สวัสดิการ</option>
                      <option value="ภาษีและรายได้">ภาษีและรายได้</option>
                      <option value="บริการช่าง/โยธา">บริการช่าง/โยธา</option>
                      <option value="ฉุกเฉิน/กู้ชีพ">ฉุกเฉิน/กู้ชีพ</option>
                      <option value="การศึกษาและวัฒนธรรม">การศึกษาและวัฒนธรรม</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      คำค้นหา / Keywords
                    </label>
                    <input
                      type="text"
                      value={kbForm.keywords || ''}
                      onChange={(e) => setKbForm({ ...kbForm, keywords: e.target.value })}
                      placeholder="เช่น เบี้ยคนชรา, เงินคนแก่"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    คำถามที่ประชาชนมักถามบ่อย
                  </label>
                  <input
                    type="text"
                    value={kbForm.question || ''}
                    onChange={(e) => setKbForm({ ...kbForm, question: e.target.value })}
                    placeholder="เช่น ต้องใช้เอกสารอะไรบ้าง และได้เงินกี่บาท?"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    คำตอบ / ข้อมูลขั้นตอนที่ถูกต้อง <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={kbForm.answer}
                    onChange={(e) => setKbForm({ ...kbForm, answer: e.target.value })}
                    placeholder="เอกสารที่ต้องใช้ ขั้นตอนการยื่น ระยะเวลา และช่องทางติดต่อ..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsKbModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs sm:text-sm font-medium transition cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold transition cursor-pointer shadow-xs"
                  >
                    บันทึกข้อมูล
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
