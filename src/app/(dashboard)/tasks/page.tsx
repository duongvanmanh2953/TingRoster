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
  X,
  Sparkles,
  Zap
} from 'lucide-react';
import { SpotlightCard } from '@/components/reactbits/SpotlightCard';

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
    title: 'Gửi link VietQR thu học phí Toán 12',
    category: 'Quan trọng',
    tagColor: 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/30',
    time: '09:00',
    tab: 'today',
    completed: true,
    starred: true,
  },
  {
    id: '2',
    title: 'Đối soát các giao dịch treo chưa gạch nợ',
    category: 'Công việc',
    tagColor: 'bg-blue-500/15 text-blue-600 dark:text-blue-300 border-blue-500/30',
    time: '11:30',
    tab: 'today',
    completed: false,
  },
  {
    id: '3',
    title: 'Chốt chỉ số điện nước dãy trọ phòng 201 - 204',
    category: 'Quan trọng',
    tagColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30',
    time: '15:00',
    tab: 'today',
    completed: false,
  },
  {
    id: '4',
    title: 'Điểm danh buổi tập CLB Pickleball chiều',
    category: 'Sức khỏe',
    tagColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30',
    time: '17:30',
    tab: 'today',
    completed: false,
  },
  {
    id: '5',
    title: 'Xuất file bàn giao kế toán tháng 10 (.csv)',
    category: 'Công việc',
    tagColor: 'bg-purple-500/15 text-purple-600 dark:text-purple-300 border-purple-500/30',
    time: '20:00',
    tab: 'week',
    completed: false,
  },
  {
    id: '6',
    title: 'Kiểm tra gia hạn gói TingRoster Pro (299k)',
    category: 'Phát triển',
    tagColor: 'bg-black-500/15 text-indigo-600 dark:text-indigo-300 border-indigo-500/30',
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

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    let tagColor = 'bg-blue-500/15 text-blue-600 dark:text-blue-300 border-blue-500/30';
    if (newCategory === 'Quan trọng') tagColor = 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/30';
    if (newCategory === 'Sức khỏe') tagColor = 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30';
    if (newCategory === 'Phát triển') tagColor = 'bg-purple-500/15 text-purple-600 dark:text-purple-300 border-purple-500/30';

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      category: newCategory,
      tagColor,
      time: newTime || '10:00',
      tab: 'today',
      completed: false,
    };

    setTasks([newTask, ...tasks]);
    setNewTitle('');
    setIsAddModalOpen(false);
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          task.category.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeTab === 'today') return task.tab === 'today';
    if (activeTab === 'week') return task.tab === 'week';
    if (activeTab === 'completed') return task.completed;
    return true;
  });

  const countToday = tasks.filter(t => t.tab === 'today').length;
  const countWeek = tasks.filter(t => t.tab === 'week').length;
  const countCompleted = tasks.filter(t => t.completed).length;
  const countStarred = tasks.filter(t => t.starred).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Quản lý công việc hàng ngày
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Theo dõi danh sách nhắc việc, gạch nợ tự động và các đầu việc vận hành cơ sở.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2538D9] hover:bg-[#1D2DB0] text-white text-xs font-bold shadow-md shadow-[#2538D9]/25 transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>Thêm công việc</span>
        </button>
      </div>

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SpotlightCard
          onClick={() => setActiveTab('all')}
          spotlightColor="rgba(37, 56, 217, 0.15)"
          className={`p-4 cursor-pointer border ${activeTab === 'all' ? 'border-[#2538D9] ring-1 ring-[#2538D9]/30' : ''}`}
        >
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">Tổng việc</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{tasks.length}</span>
            <span className="text-xs font-semibold text-slate-500">việc</span>
          </div>
        </SpotlightCard>

        <SpotlightCard
          onClick={() => setActiveTab('today')}
          spotlightColor="rgba(99, 102, 241, 0.15)"
          className={`p-4 cursor-pointer border ${activeTab === 'today' ? 'border-indigo-500 ring-1 ring-indigo-500/30' : ''}`}
        >
          <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 block">Hôm nay</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{countToday}</span>
            <span className="text-xs font-semibold text-indigo-400">cần làm</span>
          </div>
        </SpotlightCard>

        <SpotlightCard
          onClick={() => setActiveTab('week')}
          spotlightColor="rgba(245, 158, 11, 0.15)"
          className={`p-4 cursor-pointer border ${activeTab === 'week' ? 'border-amber-500 ring-1 ring-amber-500/30' : ''}`}
        >
          <span className="text-xs font-medium text-amber-600 dark:text-amber-400 block">Quan trọng</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{countStarred}</span>
            <span className="text-xs font-semibold text-amber-500">gắn sao</span>
          </div>
        </SpotlightCard>

        <SpotlightCard
          onClick={() => setActiveTab('completed')}
          spotlightColor="rgba(16, 185, 129, 0.15)"
          className={`p-4 cursor-pointer border ${activeTab === 'completed' ? 'border-emerald-500 ring-1 ring-emerald-500/30' : ''}`}
        >
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 block">Đã xong</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{countCompleted}</span>
            <span className="text-xs font-semibold text-emerald-500">hoàn thành</span>
          </div>
        </SpotlightCard>
      </div>

      {/* Search & Tabs Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên hoặc danh mục..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-[#131C2E] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#2538D9]"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'Tất cả', count: tasks.length },
            { id: 'today', label: 'Hôm nay', count: countToday },
            { id: 'week', label: 'Tuần này', count: countWeek },
            { id: 'completed', label: 'Đã xong', count: countCompleted },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#2538D9] text-white shadow-xs'
                  : 'bg-white dark:bg-[#131C2E] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Task List (Grid of ReactBits Spotlight Cards) */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2 bg-white dark:bg-[#131C2E] rounded-2xl border border-slate-200 dark:border-white/10">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="text-sm font-medium">Không có công việc nào cần xử lý!</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <SpotlightCard
              key={task.id}
              spotlightColor={task.starred ? 'rgba(245, 158, 11, 0.12)' : 'rgba(37, 56, 217, 0.1)'}
              className={`p-3.5 sm:p-4 transition-all duration-200 hover:-translate-y-0.5 ${
                task.completed ? 'opacity-70 bg-slate-50/60 dark:bg-slate-900/40' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                {/* Left: Custom Checkbox & Title */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => toggleTask(task.id)}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                      task.completed
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-slate-300 dark:border-slate-600 hover:border-[#2538D9]'
                    }`}
                  >
                    {task.completed && <CheckSquare className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <span
                    onClick={() => toggleTask(task.id)}
                    className={`text-xs sm:text-sm font-medium cursor-pointer truncate ${
                      task.completed
                        ? 'line-through text-slate-400 dark:text-slate-500'
                        : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {task.title}
                  </span>
                </div>

                {/* Right: Tag, Time, Star, Delete */}
                <div className="flex items-center gap-2.5 flex-shrink-0">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${task.tagColor}`}>
                    {task.category}
                  </span>

                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
                    {task.time}
                  </span>

                  <button
                    onClick={() => toggleStar(task.id)}
                    className="p-1 text-slate-400 hover:text-amber-500 transition-colors"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        task.starred ? 'text-amber-400 fill-amber-400' : 'text-slate-400'
                      }`}
                    />
                  </button>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </SpotlightCard>
          ))
        )}
      </div>

      {/* Modal: Thêm công việc mới */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#131C2E] rounded-2xl border border-slate-200 dark:border-white/10 p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Thêm công việc mới
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Tên công việc *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ví dụ: Gạch nợ VietQR học phí Toán..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-[#2538D9]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Danh mục
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-[#2538D9]"
                  >
                    <option value="Công việc">Công việc</option>
                    <option value="Quan trọng">Quan trọng</option>
                    <option value="Học tập">Học tập</option>
                    <option value="Sức khỏe">Sức khỏe</option>
                    <option value="Phát triển">Phát triển</option>
                    <option value="Cá nhân">Cá nhân</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Giờ thực hiện
                  </label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="Ví dụ: 10:00 hoặc Hôm nay"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-[#2538D9]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#2538D9] text-white text-xs font-bold hover:bg-[#1D2DB0] shadow-xs"
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
