'use client';

import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  CheckSquare,
  Sparkles,
  Pin,
  MoreVertical,
  X,
  Trash2
} from 'lucide-react';

interface Note {
  id: string;
  title: string;
  badge?: string;
  content: string[];
  isChecklist?: boolean;
  isQuote?: boolean;
  date: string;
  borderColor: string;
  accentBg: string;
}

const INITIAL_NOTES: Note[] = [
  {
    id: '1',
    title: 'Kế hoạch học IELTS',
    badge: '24',
    content: [
      '• Listening: 1h/ngày',
      '• Reading: 1h/ngày',
      '• Writing: 30p/ngày',
    ],
    date: 'Hôm nay 09:15',
    borderColor: 'border-blue-500/30',
    accentBg: 'bg-blue-950/20',
  },
  {
    id: '2',
    title: 'Ý tưởng dự án',
    content: [
      'Xây dựng app quản lý thời gian',
      'Tính năng AI assistant',
      'Đồng bộ đa nền tảng',
    ],
    date: 'Hôm qua 18:30',
    borderColor: 'border-purple-500/30',
    accentBg: 'bg-purple-950/20',
  },
  {
    id: '3',
    title: 'Danh sách mua sắm',
    isChecklist: true,
    content: [
      'Sữa tươi không đường',
      'Trứng gà',
      'Rau củ quả tươi',
    ],
    date: '22/04/2025',
    borderColor: 'border-emerald-500/30',
    accentBg: 'bg-emerald-950/20',
  },
  {
    id: '4',
    title: 'Lời nhắc bản thân',
    isQuote: true,
    content: [
      '"Mỗi ngày cố gắng một chút là đủ để tạo nên sự khác biệt lớn."',
    ],
    date: '21/04/2025',
    borderColor: 'border-indigo-500/30',
    accentBg: 'bg-indigo-950/20',
  },
];

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newNote: Note = {
      id: Date.now().toString(),
      title: newTitle,
      content: newContent.split('\n').filter(Boolean),
      date: 'Vừa xong',
      borderColor: 'border-indigo-500/30',
      accentBg: 'bg-indigo-950/20',
    };

    setNotes([newNote, ...notes]);
    setNewTitle('');
    setNewContent('');
    setIsAddModalOpen(false);
  };

  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Top Controls (Panel 6 from image) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm ghi chú..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#13182B] border border-indigo-500/20 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo ghi chú</span>
        </button>
      </div>

      {/* Notes Grid (Panel 6) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            className={`p-5 rounded-2xl bg-[#12172C]/90 border ${note.borderColor} ${note.accentBg} backdrop-blur-xl shadow-xl hover:border-indigo-500/40 transition-all flex flex-col justify-between min-h-[160px]`}
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-indigo-500/10">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white tracking-tight">{note.title}</h3>
                  {note.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {note.badge}
                    </span>
                  )}
                </div>
                <button className="text-slate-500 hover:text-slate-300">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3.5 space-y-1.5 text-xs text-slate-300 leading-relaxed">
                {note.isQuote ? (
                  <p className="italic text-indigo-200 font-medium">{note.content[0]}</p>
                ) : note.isChecklist ? (
                  note.content.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        defaultChecked={idx === 0}
                        className="w-3.5 h-3.5 rounded border-indigo-500/30 bg-slate-900 text-indigo-500 focus:ring-0 cursor-pointer"
                      />
                      <span>{item}</span>
                    </div>
                  ))
                ) : (
                  note.content.map((line, idx) => (
                    <p key={idx}>{line}</p>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-indigo-500/10 flex items-center justify-between text-[11px] text-slate-500">
              <span>{note.date}</span>
              <button
                onClick={() => setNotes(notes.filter(n => n.id !== note.id))}
                className="text-slate-500 hover:text-rose-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Note Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#12172C] border border-indigo-500/30 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-indigo-500/20">
              <h3 className="text-base font-bold text-white">Tạo ghi chú mới</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNote} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Tiêu đề ghi chú</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ví dụ: Kế hoạch tuần tới"
                  className="w-full px-3 py-2 rounded-xl bg-[#161D38] border border-indigo-500/20 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Nội dung (mỗi dòng một ý)</label>
                <textarea
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Nội dung ghi chú..."
                  className="w-full px-3 py-2 rounded-xl bg-[#161D38] border border-indigo-500/20 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 hover:bg-slate-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-xs font-semibold text-white shadow-md shadow-indigo-600/30"
                >
                  Lưu ghi chú
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
