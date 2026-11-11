import { useState } from 'react';
import {
  BookmarkCheck,
  Copy,
  Check,
  Trash2,
  Share2,
  Calendar,
  Tag,
  ExternalLink,
} from 'lucide-react';
import { PrPost } from '../types';

interface SavedPostsSectionProps {
  posts: PrPost[];
  onDeletePost: (id: string) => Promise<void>;
  onSelectForStudio: (content: string) => void;
}

export function SavedPostsSection({
  posts,
  onDeletePost,
  onSelectForStudio,
}: SavedPostsSectionProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const categories = ['all', ...Array.from(new Set(posts.map((p) => p.category).filter(Boolean)))];

  const filteredPosts =
    filterCategory === 'all' ? posts : posts.filter((p) => p.category === filterCategory);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookmarkCheck className="w-5 h-5 text-emerald-600" />
            <span>คลังโพสต์ประชาสัมพันธ์ Facebook ({posts.length} รายการ)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            โพสต์ที่สร้างและบันทึกไว้ใน Firebase Firestore สามารถคัดลอกไปใช้ หรือนำกลับมาแก้ไขได้ตลอดเวลา
          </p>
        </div>

        {/* Category Filter */}
        {categories.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat!)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer capitalize ${
                  filterCategory === cat
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'all' ? 'ทั้งหมด' : cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {filteredPosts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          <BookmarkCheck className="w-12 h-12 mx-auto text-slate-300 mb-2" />
          <p className="text-base font-semibold text-slate-700">ยังไม่มีโพสต์ที่บันทึกไว้</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            สร้างโพสต์ในแท็บ "เขียนโพสต์ Facebook" แล้วกด "บันทึกลงคลังโพสต์"
            โพสต์จะถูกจัดเก็บลงฐานข้อมูล Firebase ทันที
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between hover:shadow-sm hover:border-slate-300 transition duration-150"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    {post.category || 'ข่าวประชาสัมพันธ์'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(post.id, post.content)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                      title="คัดลอกข้อความ"
                    >
                      {copiedId === post.id ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`ต้องการลบโพสต์ "${post.title}" หรือไม่?`)) {
                          onDeletePost(post.id);
                        }
                      }}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition cursor-pointer"
                      title="ลบ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-base leading-snug mb-2 line-clamp-2">
                  {post.title}
                </h3>

                <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-700 leading-relaxed font-normal whitespace-pre-wrap line-clamp-6 mb-3 border border-slate-100">
                  {post.content}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {post.createdAt ? new Date(post.createdAt).toLocaleDateString('th-TH') : 'วันนี้'}
                </span>

                <button
                  onClick={() => onSelectForStudio(post.content)}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 px-2.5 py-1 rounded-lg hover:bg-blue-50 transition cursor-pointer"
                >
                  <Share2 className="w-3 h-3" />
                  <span>แก้ไขในสตูดิโอ</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
