'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  CalendarCheck,
  Users2,
  MapPin,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Filter,
  GraduationCap,
  Trophy,
  Home,
  ArrowRight
} from 'lucide-react';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { Avatar } from '@/components/common/Avatar';
import { formatVND } from '@/lib/utils';

interface ScheduleSession {
  id: string;
  title: string;
  groupName: string;
  groupType: 'CLASS' | 'SPORTS_CLUB' | 'RENTAL';
  roomOrCourt: string;
  dayIndex: number; // 0: Thứ 2, 1: Thứ 3, ..., 6: Chủ nhật
  startTime: string; // '08:00'
  endTime: string; // '09:30'
  attendeesCount: number;
  expectedRevenue: number;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
}

const INITIAL_SESSIONS: ScheduleSession[] = [
  {
    id: 's1',
    title: 'Đại số & Phương trình bậc 2',
    groupName: 'Lớp Toán 6A',
    groupType: 'CLASS',
    roomOrCourt: 'Phòng 201 • Cơ sở 1',
    dayIndex: 0, // Thứ 2
    startTime: '08:00',
    endTime: '09:30',
    attendeesCount: 48,
    expectedRevenue: 600000,
    status: 'COMPLETED',
  },
  {
    id: 's2',
    title: 'Giao lưu đấu đôi nam nữ',
    groupName: 'CLB Pickleball',
    groupType: 'SPORTS_CLUB',
    roomOrCourt: 'Sân 2 - Cụm thể thao',
    dayIndex: 0,
    startTime: '17:30',
    endTime: '19:30',
    attendeesCount: 16,
    expectedRevenue: 800000,
    status: 'SCHEDULED',
  },
  {
    id: 's3',
    title: 'Ngữ pháp thì hiện tại hoàn thành',
    groupName: 'Lớp Tiếng Anh 7',
    groupType: 'CLASS',
    roomOrCourt: 'Phòng 104',
    dayIndex: 1, // Thứ 3
    startTime: '14:00',
    endTime: '15:30',
    attendeesCount: 36,
    expectedRevenue: 540000,
    status: 'SCHEDULED',
  },
  {
    id: 's4',
    title: 'Hình học không gian & Khối chóp',
    groupName: 'Lớp Toán 6A',
    groupType: 'CLASS',
    roomOrCourt: 'Phòng 201',
    dayIndex: 2, // Thứ 4
    startTime: '08:00',
    endTime: '09:30',
    attendeesCount: 48,
    expectedRevenue: 600000,
    status: 'SCHEDULED',
  },
  {
    id: 's5',
    title: 'Tập kỹ thuật Dinking & Third Shot',
    groupName: 'CLB Pickleball',
    groupType: 'SPORTS_CLUB',
    roomOrCourt: 'Sân 1',
    dayIndex: 3, // Thứ 5
    startTime: '18:00',
    endTime: '20:00',
    attendeesCount: 12,
    expectedRevenue: 600000,
    status: 'SCHEDULED',
  },
  {
    id: 's6',
    title: 'Chốt chỉ số điện nước tháng 4',
    groupName: 'Nhà trọ Blue House',
    groupType: 'RENTAL',
    roomOrCourt: 'Tòa nhà 4 tầng • 12 phòng',
    dayIndex: 4, // Thứ 6
    startTime: '19:00',
    endTime: '20:30',
    attendeesCount: 12,
    expectedRevenue: 42000000,
    status: 'SCHEDULED',
  },
  {
    id: 's7',
    title: 'Luyện đề chuyên Anh',
    groupName: 'Lớp Tiếng Anh 7',
    groupType: 'CLASS',
    roomOrCourt: 'Phòng 104',
    dayIndex: 5, // Thứ 7
    startTime: '09:00',
    endTime: '11:00',
    attendeesCount: 36,
    expectedRevenue: 720000,
    status: 'SCHEDULED',
  },
];

const WEEK_DAYS = [
  { dayIndex: 0, label: 'Thứ Hai', dateStr: '21/04' },
  { dayIndex: 1, label: 'Thứ Ba', dateStr: '22/04' },
  { dayIndex: 2, label: 'Thứ Tư', dateStr: '23/04' },
  { dayIndex: 3, label: 'Thứ Năm', dateStr: '24/04' },
  { dayIndex: 4, label: 'Thứ Sáu', dateStr: '25/04' },
  { dayIndex: 5, label: 'Thứ Bảy', dateStr: '26/04' },
  { dayIndex: 6, label: 'Chủ Nhật', dateStr: '27/04' },
];

const TIME_SLOTS = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];

export default function CalendarPage() {
  const router = useRouter();
  const [viewTab, setViewTab] = useState<'week' | 'day' | 'month'>('week');
  const [filterGroup, setFilterGroup] = useState<string>('ALL');
  const [sessions, setSessions] = useState<ScheduleSession[]>(INITIAL_SESSIONS);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // New session modal states
  const [newTitle, setNewTitle] = useState('');
  const [newGroup, setNewGroup] = useState('Lớp Toán 6A');
  const [newRoom, setNewRoom] = useState('Phòng 201');
  const [newDay, setNewDay] = useState(1);
  const [newStart, setNewStart] = useState('08:00');
  const [newEnd, setNewEnd] = useState('09:30');
  const [newAttendees, setNewAttendees] = useState(30);

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newSession: ScheduleSession = {
      id: `s-${Date.now()}`,
      title: newTitle,
      groupName: newGroup,
      groupType: newGroup.includes('Pickleball') ? 'SPORTS_CLUB' : newGroup.includes('Nhà trọ') ? 'RENTAL' : 'CLASS',
      roomOrCourt: newRoom,
      dayIndex: Number(newDay),
      startTime: newStart,
      endTime: newEnd,
      attendeesCount: Number(newAttendees),
      expectedRevenue: Number(newAttendees) * 50000,
      status: 'SCHEDULED',
    };

    setSessions([newSession, ...sessions]);
    setCreateModalOpen(false);
    setNewTitle('');
  };

  const filteredSessions = sessions.filter((s) => {
    if (filterGroup === 'ALL') return true;
    return s.groupName === filterGroup;
  });

  return (
    <div className="w-full space-y-6 pb-12">
      
      {/* 1. Header Toolbar with Material UI Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#101828]">
            Lịch biểu & Ca dạy
          </h1>
          <p className="text-xs text-[#475467] mt-0.5">
            Quản lý lịch học, ca thi đấu và hạn thu phí định kỳ theo tuần
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Workspace Filter Select using Material UI */}
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="workspace-filter-label" sx={{ fontSize: '0.75rem' }}>Lọc lớp / CLB</InputLabel>
            <Select
              labelId="workspace-filter-label"
              id="workspace-filter"
              value={filterGroup}
              label="Lọc lớp / CLB"
              onChange={(e) => setFilterGroup(e.target.value)}
              sx={{ fontSize: '0.75rem', height: 38, borderRadius: '0.75rem', backgroundColor: '#FFFFFF' }}
            >
              <MenuItem value="ALL" sx={{ fontSize: '0.75rem' }}>Tất cả các lớp & CLB</MenuItem>
              <MenuItem value="Lớp Toán 6A" sx={{ fontSize: '0.75rem' }}>Lớp Toán 6A</MenuItem>
              <MenuItem value="CLB Pickleball" sx={{ fontSize: '0.75rem' }}>CLB Pickleball</MenuItem>
              <MenuItem value="Lớp Tiếng Anh 7" sx={{ fontSize: '0.75rem' }}>Lớp Tiếng Anh 7</MenuItem>
              <MenuItem value="Nhà trọ Blue House" sx={{ fontSize: '0.75rem' }}>Nhà trọ Blue House</MenuItem>
            </Select>
          </FormControl>

          {/* Create Button using Material UI */}
          <Button
            variant="contained"
            startIcon={<Plus className="w-4 h-4" />}
            onClick={() => setCreateModalOpen(true)}
            sx={{
              backgroundColor: '#2538D9',
              borderRadius: '0.75rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              height: 38,
              '&:hover': { backgroundColor: '#1E2DB8' }
            }}
          >
            Thêm ca học / lịch
          </Button>

        </div>
      </div>

      {/* 2. Main Grid: Left 8 cols = Timetable; Right 4 cols = Today's Focus & Quick Check-in */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: 8 cols Weekly Schedule Board */}
        <div className="lg:col-span-8 ting-card p-5 space-y-4">
          
          {/* Week Selector Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E4E7EC]">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#101828]">Tuần 17 (21/04 - 27/04/2025)</span>
              <Chip label="Hôm nay" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, backgroundColor: '#EFF6FF', color: '#2538D9' }} />
            </div>

            {/* Material UI View Tabs */}
            <div className="flex items-center bg-[#F5F7FB] p-0.5 rounded-xl border border-[#E4E7EC]">
              <button
                onClick={() => setViewTab('week')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  viewTab === 'week' ? 'bg-white text-[#2538D9] shadow-xs' : 'text-[#475467]'
                }`}
              >
                Tuần
              </button>
              <button
                onClick={() => setViewTab('day')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  viewTab === 'day' ? 'bg-white text-[#2538D9] shadow-xs' : 'text-[#475467]'
                }`}
              >
                Ngày
              </button>
              <button
                onClick={() => setViewTab('month')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  viewTab === 'month' ? 'bg-white text-[#2538D9] shadow-xs' : 'text-[#475467]'
                }`}
              >
                Tháng
              </button>
            </div>
          </div>

          {/* 7 Days Grid Header */}
          <div className="grid grid-cols-7 gap-2 text-center">
            {WEEK_DAYS.map((day) => {
              const isToday = day.dayIndex === 0;
              return (
                <div
                  key={day.dayIndex}
                  className={`p-2 rounded-xl border transition-colors ${
                    isToday
                      ? 'bg-blue-50/60 border-[#2538D9]/30 text-[#2538D9]'
                      : 'bg-[#F8FAFC] border-[#E4E7EC] text-[#475467]'
                  }`}
                >
                  <span className="text-[10px] font-bold block uppercase">{day.label}</span>
                  <span className="text-sm font-bold tabular-nums block mt-0.5">{day.dateStr}</span>
                </div>
              );
            })}
          </div>

          {/* Sessions List grouped by Day */}
          <div className="space-y-3 pt-2">
            {filteredSessions.map((session) => {
              const day = WEEK_DAYS[session.dayIndex];
              const isClass = session.groupType === 'CLASS';
              const isSports = session.groupType === 'SPORTS_CLUB';

              return (
                <div
                  key={session.id}
                  className="p-4 rounded-xl border border-[#E4E7EC] bg-white hover:border-[#2538D9]/40 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 border ${
                        isClass
                          ? 'bg-blue-50 text-[#2538D9] border-blue-200'
                          : isSports
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {isClass ? <GraduationCap className="w-5 h-5" /> : isSports ? <Trophy className="w-5 h-5" /> : <Home className="w-5 h-5" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-[#101828] text-sm">{session.title}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-[#475467]">
                          {session.groupName}
                        </span>
                        {session.status === 'COMPLETED' ? (
                          <Chip label="Đã hoàn thành" size="small" sx={{ height: 18, fontSize: '0.625rem', backgroundColor: '#ECFDF5', color: '#047857' }} />
                        ) : (
                          <Chip label="Sắp diễn ra" size="small" sx={{ height: 18, fontSize: '0.625rem', backgroundColor: '#EFF6FF', color: '#2538D9' }} />
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#475467]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <strong className="text-[#101828]">{day.label} ({day.dateStr})</strong> • {session.startTime} - {session.endTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{session.roomOrCourt}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Users2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{session.attendeesCount} thành viên</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Link
                      href="/attendance"
                      className="px-3 py-1.5 rounded-lg bg-[#2538D9]/10 hover:bg-[#2538D9] text-[#2538D9] hover:text-white font-semibold text-xs transition-colors flex items-center gap-1"
                    >
                      <CalendarCheck className="w-3.5 h-3.5" />
                      <span>Điểm danh ca này</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right: 4 cols Focus Column (Today's Next Session & Kiosk Link) */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Card: Ca học tiếp theo hôm nay */}
          <div className="ting-card p-5 space-y-4 border-l-4 border-l-[#2538D9]">
            <div className="flex items-center justify-between pb-2 border-b border-[#E4E7EC]">
              <span className="text-xs font-bold text-[#101828]">Ca tiếp theo hôm nay</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                17:30 chiều
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-[#101828]">CLB Pickleball - Giao lưu đôi</h3>
              <p className="text-xs text-[#475467] mt-0.5">Sân 2 - Cụm thể thao • 16 hội viên</p>
            </div>

            <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E4E7EC] text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#475467]">Dự kiến thu:</span>
                <span className="font-bold text-[#101828] tabular-nums">800.000 đ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#475467]">Đã check-in:</span>
                <span className="font-bold text-emerald-700 tabular-nums">5 / 16 hội viên</span>
              </div>
            </div>

            <div className="pt-1 flex gap-2">
              <Link
                href="/kiosk"
                target="_blank"
                className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold text-center transition-colors"
              >
                Mở Kiosk tại sân
              </Link>
              <Link
                href="/attendance"
                className="flex-1 py-2 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-xs font-bold text-center transition-colors"
              >
                Điểm danh
              </Link>
            </div>
          </div>

          {/* Quick Schedule Tips */}
          <div className="ting-card p-5 space-y-3">
            <h4 className="text-xs font-bold text-[#101828] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#6D5CE8]" />
              <span>Tự động hóa với TingRoster</span>
            </h4>
            <p className="text-xs text-[#475467] leading-relaxed">
              Mỗi ca học được lưu trên lịch sẽ tự động sinh phiếu điểm danh tương ứng. Phụ huynh sẽ nhận thông báo khi học sinh check-in thành công.
            </p>
          </div>

        </div>

      </div>

      {/* Modal Thêm Ca Học Mới using Material UI */}
      <Dialog
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: '1rem', padding: '0.5rem' }
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem', color: '#101828' }}>
          Thêm ca học / Lịch hoạt động mới
        </DialogTitle>
        <form onSubmit={handleCreateSession}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            
            <TextField
              label="Tên bài học / Nội dung hoạt động"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
              fullWidth
              size="small"
              placeholder="VD: Ôn tập Hình học chương 2"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormControl size="small" fullWidth>
                <InputLabel id="modal-group-label">Chọn lớp / CLB</InputLabel>
                <Select
                  labelId="modal-group-label"
                  value={newGroup}
                  label="Chọn lớp / CLB"
                  onChange={(e) => setNewGroup(e.target.value)}
                >
                  <MenuItem value="Lớp Toán 6A">Lớp Toán 6A</MenuItem>
                  <MenuItem value="CLB Pickleball">CLB Pickleball</MenuItem>
                  <MenuItem value="Lớp Tiếng Anh 7">Lớp Tiếng Anh 7</MenuItem>
                  <MenuItem value="Nhà trọ Blue House">Nhà trọ Blue House</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Địa điểm / Phòng học"
                value={newRoom}
                onChange={(e) => setNewRoom(e.target.value)}
                size="small"
                placeholder="VD: Phòng 201"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FormControl size="small" fullWidth>
                <InputLabel id="modal-day-label">Ngày trong tuần</InputLabel>
                <Select
                  labelId="modal-day-label"
                  value={newDay}
                  label="Ngày trong tuần"
                  onChange={(e) => setNewDay(Number(e.target.value))}
                >
                  {WEEK_DAYS.map((d) => (
                    <MenuItem key={d.dayIndex} value={d.dayIndex}>
                      {d.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Giờ bắt đầu"
                value={newStart}
                onChange={(e) => setNewStart(e.target.value)}
                size="small"
                placeholder="08:00"
              />

              <TextField
                label="Giờ kết thúc"
                value={newEnd}
                onChange={(e) => setNewEnd(e.target.value)}
                size="small"
                placeholder="09:30"
              />
            </div>

            <TextField
              label="Số lượng học sinh / hội viên dự kiến"
              type="number"
              value={newAttendees}
              onChange={(e) => setNewAttendees(Number(e.target.value))}
              size="small"
            />

          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setCreateModalOpen(false)} sx={{ color: '#475467' }}>
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{ backgroundColor: '#2538D9', '&:hover': { backgroundColor: '#1E2DB8' } }}
            >
              Lưu ca học
            </Button>
          </DialogActions>
        </form>
      </Dialog>

    </div>
  );
}
