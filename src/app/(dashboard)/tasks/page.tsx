'use client';

import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Star,
  MoreVertical,
  Clock,
  Filter,
  CheckCircle2,
  Calendar,
  Tag,
  Trash2,
  X
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  category: 'Quan trọng' | 'Học tập' | 'Sức khỏe' | 'Phát triển' | 'Công việc' | 'Cá nhân';
  tagColor: string;
  time: string;
  tab: 'today' | 'week' | 'completed';
  completed: boolean;
  starred?: boolean;
}

const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    title: 'Hoàn thành báo cáo tuần',
    category: 'Quan trọng',
    tagColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    time: '09:00',
    tab: 'today',
    completed: true,
    starred: true,
  },
  {
    id: '2',
    title: 'Học bài IELTS',
    category: 'Học tập',
    tagColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    time: '14:00',
    tab: 'today',
    completed: false,
  },
  {
    id: '3',
    title: 'Tập gym',
    category: 'Sức khỏe',
    tagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    time: '18:00',
    tab: 'today',
    completed: false,
  },
  {
    id: '4',
    title: 'Đọc sách 30 phút',
    category: 'Phát triển',
    tagColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    time: '20:00',
    tab: 'today',
    completed: false,
  },
  {
    id: '5',
    title: 'Làm bài tập toán',
    category: 'Học tập',
    tagColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    time: 'Tối',
    tab: 'today',
    completed: false,
  },
  {
    id: '6',
    title: 'Gửi email cho khách hàng',
    category: 'Công việc',
    tagColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    time: '15:00',
    tab: 'week',
    completed: false,
  },
  {
    id: '7',
    title: 'Chuẩn bị bài thuyết trình',
    category: 'Công việc',
    tagColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    time: 'Ngày mai',
    tab: 'week',
    completed: false,
  },
  {
    id: '8',
    title: 'Mua đồ dùng cá nhân',
    category: 'Cá nhân',
    tagColor: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    time: 'Ngày mai',
    tab: 'week',
    completed: false,
  },
];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'week' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<Task['category']>('Công việc');
  const [newTime, setNewTime] = useState('10:00');

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const toggleStar = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, starred: !t.starred } : t));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const categoryColors: Record<Task['category'], string> = {
      'Quan trọng': 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      'Học tập': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'Sức khỏe': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      'Phát triển': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'Công việc': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      'Cá nhân': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    };

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTitle,
      category: newCategory,
      tagColor: categoryColors[newCategory],
      time: newTime || 'Hôm nay',
      tab: 'today',
      completed: false,
    };

    setTasks([newTask, ...tasks]);
    setNewTitle('');
    setIsAddModalOpen(false);
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeTab === 'all') return true;
    if (activeTab === 'today') return task.tab === 'today';
    if (activeTab === 'week') return task.tab === 'week';
    if (activeTab === 'completed') return task.completed;
    return true;
  });

  const countToday = tasks.filter(t => t.tab === 'today').length;
  const countWeek = tasks.filter(t => t.tab === 'week').length;
  const countCompleted = tasks.filter(t => t.completed).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Top Controls (Exact Panel 3 from image) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm công việc..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#13182B] border border-indigo-500/20 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Add Task Button */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm công việc</span>
        </button>
      </div>

      {/* Tabs Filter Bar (Tất cả 8, Hôm nay 5, Tuần này 3, Đã hoàn thành 12) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-indigo-500/15 pb-4">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
            activeTab === 'all'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-md shadow-indigo-600/30'
              : 'bg-[#13182B] text-slate-400 hover:text-white border border-indigo-500/15'
          }`}
        >
          <span>Tất cả</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-bold">{tasks.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('today')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
            activeTab === 'today'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-md shadow-indigo-600/30'
              : 'bg-[#13182B] text-slate-400 hover:text-white border border-indigo-500/15'
          }`}
        >
          <span>Hôm nay</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-500/30 text-indigo-200 font-bold">{countToday}</span>
        </button>

        <button
          onClick={() => setActiveTab('week')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
            activeTab === 'week'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-md shadow-indigo-600/30'
              : 'bg-[#13182B] text-slate-400 hover:text-white border border-indigo-500/15'
          }`}
        >
          <span>Tuần này</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-500/30 text-indigo-200 font-bold">{countWeek}</span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
            activeTab === 'completed'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-md shadow-indigo-600/30'
              : 'bg-[#13182B] text-slate-400 hover:text-white border border-indigo-500/15'
          }`}
        >
          <span>Đã hoàn thành</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/30 text-emerald-200 font-bold">{countCompleted}</span>
        </button>
      </div>

      {/* Task List (Exact Panel 3 layout) */}
      <div className="bg-[#12172C]/90 rounded-2xl border border-indigo-500/15 divide-y divide-indigo-500/10 overflow-hidden shadow-xl shadow-indigo-950/40">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-indigo-400 mx-auto" />
            <p className="text-sm font-medium">Không tìm thấy công việc nào</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-[#18203E]/50 transition-colors ${
                task.completed ? 'bg-[#0F1426]/50' : ''
              }`}
            >
              {/* Checkbox & Title */}
              <div className="flex items-center gap-3.5 min-w-0">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  className="w-4 h-4 rounded-md border-indigo-500/40 bg-slate-900 text-indigo-500 focus:ring-0 cursor-pointer"
                />
                <span
                  className={`text-xs sm:text-sm font-medium truncate ${
                    task.completed ? 'line-through text-slate-500' : 'text-slate-100'
                  }`}
                >
                  {task.title}
                </span>
              </div>

              {/* Tag, Time, Actions */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-lg border ${task.tagColor}`}>
                  {task.category}
                </span>

                <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                  {task.time}
                </span>

                <button
                  onClick={() => toggleStar(task.id)}
                  className="p-1 text-slate-500 hover:text-amber-400 transition-colors"
                >
                  <Star
                    className={`w-4 h-4 ${
                      task.starred ? 'text-amber-400 fill-amber-400' : 'text-slate-500'
                    }`}
                  />
                </button>

                <button className="p-1 text-slate-500 hover:text-slate-300">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Thêm công việc mới */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#12172C] border border-indigo-500/30 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-indigo-500/20">
              <h3 className="text-base font-bold text-white">Thêm công việc mới</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Tên công việc</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ví dụ: Ôn tập từ vựng tiếng Anh"
                  className="w-full px-3 py-2 rounded-xl bg-[#161D38] border border-indigo-500/20 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Nhóm danh mục</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#161D38] border border-indigo-500/20 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Quan trọng">Quan trọng</option>
                    <option value="Học tập">Học tập</option>
                    <option value="Sức khỏe">Sức khỏe</option>
                    <option value="Phát triển">Phát triển</option>
                    <option value="Công việc">Công việc</option>
                    <option value="Cá nhân">Cá nhân</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Thời gian</label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="10:00 hoặc Chiều"
                    className="w-full px-3 py-2 rounded-xl bg-[#161D38] border border-indigo-500/20 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
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
                  Lưu công việc
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
