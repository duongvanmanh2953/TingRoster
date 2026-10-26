'use client';

import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Bell,
  CheckCircle2,
  CalendarCheck
} from 'lucide-react';

interface EventItem {
  id: string;
  title: string;
  dayIndex: number; // 0: T2 (21), 1: T3 (22), etc.
  timeSlot: string; // '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'
  color: string;
}

export default function CalendarPage() {
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [events, setEvents] = useState<EventItem[]>([
    { id: '1', title: 'Tập gym', dayIndex: 0, timeSlot: '06:00', color: 'bg-blue-600/80 text-white' },
    { id: '2', title: 'Họp nhóm', dayIndex: 1, timeSlot: '09:00', color: 'bg-purple-600/80 text-white' },
    { id: '3', title: 'Ăn trưa', dayIndex: 2, timeSlot: '12:00', color: 'bg-emerald-600/80 text-white' },
    { id: '4', title: 'Làm việc', dayIndex: 4, timeSlot: '15:00', color: 'bg-amber-600/80 text-white' },
    { id: '5', title: 'Đọc sách', dayIndex: 3, timeSlot: '18:00', color: 'bg-pink-600/80 text-white' },
    { id: '6', title: 'Thiền', dayIndex: 2, timeSlot: '21:00', color: 'bg-indigo-600/80 text-white' },
  ]);

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('29/04/2025');
  const [time, setTime] = useState('09:00 - 10:00');
  const [reminder, setReminder] = useState('Trước 15 phút');
  const [selectedColor, setSelectedColor] = useState('bg-purple-600/80 text-white');

  const DAYS = [
    { name: 'T2', date: '21' },
    { name: 'T3', date: '22' },
    { name: 'T4', date: '23' },
    { name: 'T5', date: '24' },
    { name: 'T6', date: '25' },
    { name: 'T7', date: '26' },
    { name: 'CN', date: '27' },
  ];

  const TIME_SLOTS = ['06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newEv: EventItem = {
      id: Date.now().toString(),
      title,
      dayIndex: Math.floor(Math.random() * 7),
      timeSlot: '09:00',
      color: selectedColor,
    };

    setEvents([...events, newEv]);
    setTitle('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Calendar View & Controls (Panel 5 from image) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Grid: 8 cols */}
        <div className="lg:col-span-8 bg-[#12172C]/90 border border-indigo-500/15 rounded-3xl p-5 sm:p-6 backdrop-blur-xl shadow-2xl space-y-5">
          
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-500/15">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-white tracking-tight">Tháng 4, 2025</h2>
              <div className="flex items-center gap-1 bg-[#182040] p-1 rounded-xl border border-indigo-500/20">
                <button className="p-1 text-slate-400 hover:text-white rounded-lg">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="p-1 text-slate-400 hover:text-white rounded-lg">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 rounded-xl bg-[#182040] border border-indigo-500/20 text-xs text-indigo-300 font-semibold hover:bg-indigo-600/20">
                Hôm nay
              </button>
              <div className="flex items-center bg-[#182040] p-1 rounded-xl border border-indigo-500/20 text-xs">
                {(['day', 'week', 'month'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-3 py-1 rounded-lg capitalize font-medium transition-colors ${
                      viewMode === mode
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {mode === 'day' ? 'Ngày' : mode === 'week' ? 'Tuần' : 'Tháng'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Days Grid Header */}
          <div className="grid grid-cols-8 gap-2 text-center text-xs font-semibold pb-2 border-b border-indigo-500/10">
            <span className="text-slate-500">Giờ</span>
            {DAYS.map((d, i) => (
              <div key={i} className="text-slate-300">
                <span className="block text-[11px] text-slate-400 font-normal">{d.name}</span>
                <span className={`inline-block w-6 h-6 rounded-full leading-6 mt-0.5 ${i === 3 ? 'bg-indigo-600 text-white font-bold' : ''}`}>
                  {d.date}
                </span>
              </div>
            ))}
          </div>

          {/* Time Slots & Events */}
          <div className="space-y-3">
            {TIME_SLOTS.map((slot) => (
              <div key={slot} className="grid grid-cols-8 gap-2 items-center min-h-[50px] border-b border-indigo-500/5 pb-2">
                <span className="text-[11px] text-slate-500 font-mono text-center">{slot}</span>
                {DAYS.map((_, dayIdx) => {
                  const ev = events.find(e => e.timeSlot === slot && e.dayIndex === dayIdx);
                  return (
                    <div key={dayIdx} className="h-full flex items-center justify-center">
                      {ev && (
                        <div className={`w-full py-1.5 px-2 rounded-xl text-[11px] font-semibold text-center truncate shadow-md ${ev.color}`}>
                          {ev.title}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

        </div>

        {/* Right Form: "Tạo sự kiện" (4 cols) */}
        <div className="lg:col-span-4 bg-[#12172C]/90 border border-indigo-500/15 rounded-3xl p-5 sm:p-6 backdrop-blur-xl shadow-2xl space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-indigo-500/15">
            <CalendarCheck className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white">Tạo sự kiện</h3>
          </div>

          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">Tiêu đề</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tên sự kiện..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#161D38] border border-indigo-500/20 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">Ngày</label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#161D38] border border-indigo-500/20 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">Thời gian</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#161D38] border border-indigo-500/20 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">Nhắc nhở</label>
              <select
                value={reminder}
                onChange={(e) => setReminder(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#161D38] border border-indigo-500/20 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Trước 15 phút">Trước 15 phút</option>
                <option value="Trước 30 phút">Trước 30 phút</option>
                <option value="Trước 1 giờ">Trước 1 giờ</option>
                <option value="Trước 1 ngày">Trước 1 ngày</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium block mb-2">Màu sắc</label>
              <div className="flex items-center gap-3">
                {[
                  { color: 'bg-blue-600/80 text-white', dot: 'bg-blue-500' },
                  { color: 'bg-purple-600/80 text-white', dot: 'bg-purple-500' },
                  { color: 'bg-emerald-600/80 text-white', dot: 'bg-emerald-500' },
                  { color: 'bg-amber-600/80 text-white', dot: 'bg-amber-500' },
                  { color: 'bg-pink-600/80 text-white', dot: 'bg-pink-500' },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedColor(item.color)}
                    className={`w-6 h-6 rounded-full ${item.dot} transition-transform ${
                      selectedColor === item.color ? 'ring-2 ring-white scale-125' : 'opacity-70 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all mt-2"
            >
              Tạo sự kiện
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
