import { MessageSquare, Sparkles, Building2, BookmarkCheck, Globe } from 'lucide-react';
import { SaoProfile } from '../types';

interface NavbarProps {
  activeTab: 'chat' | 'facebook' | 'sao_data' | 'saved_posts';
  setActiveTab: (tab: 'chat' | 'facebook' | 'sao_data' | 'saved_posts') => void;
  profile: SaoProfile;
}

export function Navbar({ activeTab, setActiveTab, profile }: NavbarProps) {
  const tabs = [
    {
      id: 'chat' as const,
      label: 'แชทบอท & เสียง',
      sublabel: 'ถาม-ตอบ & สั่งงานด้วยเสียง',
      icon: MessageSquare,
      badge: 'ไมค์ STT',
    },
    {
      id: 'facebook' as const,
      label: 'เขียนโพสต์ Facebook',
      sublabel: 'คิดคำ เรียบเรียง & ดูตัวอย่าง',
      icon: Sparkles,
      badge: 'AI Creator',
    },
    {
      id: 'sao_data' as const,
      label: 'ข้อมูล อบต. & ผู้บริหาร',
      sublabel: 'นายก, รองนายก & บริการ',
      icon: Building2,
      badge: 'Firebase',
    },
    {
      id: 'saved_posts' as const,
      label: 'คลังโพสต์',
      sublabel: 'แบบร่าง & ประวัติโพสต์',
      icon: BookmarkCheck,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          {/* Logo & Org Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-emerald-600 via-teal-600 to-blue-700 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 shrink-0">
              <span className="font-bold text-lg sm:text-xl tracking-tighter">อบต</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-slate-900 text-sm sm:text-lg truncate tracking-tight">
                  {profile.orgName || 'อบต. ประชาสัมพันธ์ AI'}
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Firebase Sync
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate hidden xs:block">
                ระบบผู้ช่วยประชาสัมพันธ์ & เครื่องมือคิดคำโพสต์ Facebook รองรับพิมพ์/สั่งด้วยเสียง
              </p>
            </div>
          </div>

          {/* Quick External Link */}
          {profile.websiteUrl && (
            <a
              href={profile.websiteUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-700 transition px-2.5 py-1 rounded-md border border-slate-200 bg-slate-50 shrink-0"
              title="เปิดดูเว็บไซต์ อบต. ต้นทาง"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="truncate max-w-[150px]">{profile.websiteUrl}</span>
            </a>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 no-scrollbar border-t border-slate-100">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`hidden md:inline-block text-[10px] px-1.5 py-0.2 rounded-md ${
                      isActive ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
