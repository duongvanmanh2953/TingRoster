'use client';

import React, { useState, useEffect } from 'react';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Flame,
  CheckCircle2
} from 'lucide-react';

export default function PomodoroPage() {
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [shortBreak, setShortBreak] = useState(5);
  const [longBreak, setLongBreak] = useState(15);
  const [cycles, setCycles] = useState(4);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [currentMode, setCurrentMode] = useState<'focus' | 'break'>('focus');
  const [currentCycle, setCurrentCycle] = useState(1);

  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      if (currentMode === 'focus') {
        setCurrentMode('break');
        setTimeLeft(shortBreak * 60);
      } else {
        setCurrentMode('focus');
        setTimeLeft(focusMinutes * 60);
        setCurrentCycle((c) => Math.min(c + 1, cycles));
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, currentMode, focusMinutes, shortBreak, cycles]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(focusMinutes * 60);
    setCurrentMode('focus');
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const totalSeconds = currentMode === 'focus' ? focusMinutes * 60 : shortBreak * 60;
  const progressPercent = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* 2-Column Layout (Panel 7 from image) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left / Center: Glowing Circular Timer (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#12172C]/90 via-[#0E1224] to-[#0A0D1B] border border-indigo-500/20 backdrop-blur-2xl shadow-2xl relative overflow-hidden min-h-[460px]">
          
          {/* Ambient cosmic glows */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-64 h-32 bg-purple-600/20 rounded-full blur-2xl pointer-events-none" />

          {/* Mode Badge */}
          <div className="relative z-10 mb-8">
            <span className="px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-semibold text-xs tracking-wider uppercase">
              {currentMode === 'focus' ? 'Phiên tập trung' : 'Thời gian nghỉ ngơi'} • Vòng {currentCycle}/{cycles}
            </span>
          </div>

          {/* Radial Circular Neon Dial */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center z-10">
            {/* SVG Progress Ring */}
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-slate-800"
                strokeWidth="4"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-indigo-500 transition-all duration-500 ease-linear"
                strokeWidth="4"
                strokeDasharray="276"
                strokeDashoffset={276 - (276 * progressPercent) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tighter font-mono drop-shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                {formattedTime}
              </span>
              <span className="text-xs font-semibold text-indigo-300 mt-2 tracking-widest uppercase">
                {currentMode === 'focus' ? 'Tập trung' : 'Nghỉ ngơi'}
              </span>

              {/* Play / Pause Button inside ring */}
              <button
                onClick={toggleTimer}
                className="mt-4 w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white flex items-center justify-center shadow-lg shadow-indigo-600/40 hover:scale-105 transition-all"
              >
                {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>
            </div>
          </div>

          {/* Timer Action Buttons */}
          <div className="relative z-10 mt-8 flex items-center gap-4">
            <button
              onClick={resetTimer}
              className="p-2.5 rounded-xl bg-[#161D38] border border-indigo-500/20 text-slate-300 hover:text-white hover:bg-[#1E274A] transition-colors"
              title="Đặt lại"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2.5 rounded-xl bg-[#161D38] border border-indigo-500/20 text-slate-300 hover:text-white hover:bg-[#1E274A] transition-colors"
              title="Âm thanh"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
          </div>

          {/* Inspirational Motto at bottom */}
          <p className="relative z-10 mt-6 text-xs text-indigo-300/80 italic text-center">
            &ldquo;Tập trung hôm nay, thành công ngày mai!&rdquo;
          </p>

        </div>

        {/* Right: Pomodoro Settings Card (5 cols) */}
        <div className="lg:col-span-5 bg-[#12172C]/90 border border-indigo-500/15 rounded-3xl p-6 sm:p-7 backdrop-blur-xl shadow-2xl space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-indigo-500/15">
            <Timer className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Cài đặt Pomodoro</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1.5">Thời gian tập trung</label>
              <select
                value={focusMinutes}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setFocusMinutes(val);
                  if (!isRunning) setTimeLeft(val * 60);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#161D38] border border-indigo-500/20 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value={15}>15 phút</option>
                <option value={20}>20 phút</option>
                <option value={25}>25 phút</option>
                <option value={30}>30 phút</option>
                <option value={45}>45 phút</option>
                <option value={50}>50 phút</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1.5">Thời gian nghỉ ngắn</label>
              <select
                value={shortBreak}
                onChange={(e) => setShortBreak(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#161D38] border border-indigo-500/20 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value={5}>5 phút</option>
                <option value={10}>10 phút</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1.5">Thời gian nghỉ dài</label>
              <select
                value={longBreak}
                onChange={(e) => setLongBreak(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#161D38] border border-indigo-500/20 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value={15}>15 phút</option>
                <option value={20}>20 phút</option>
                <option value={30}>30 phút</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1.5">Số vòng lặp</label>
              <select
                value={cycles}
                onChange={(e) => setCycles(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#161D38] border border-indigo-500/20 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value={2}>2 vòng</option>
                <option value={3}>3 vòng</option>
                <option value={4}>4 vòng</option>
                <option value={6}>6 vòng</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-indigo-500/15">
              <span className="text-xs text-slate-300 font-medium">Âm thanh thông báo</span>
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  soundEnabled ? 'bg-indigo-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    soundEnabled ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-300 space-y-1">
            <p className="font-semibold text-white">Mẹo tập trung:</p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Tắt mọi thông báo điện thoại và tập trung hoàn toàn vào một mục tiêu duy nhất trong 25 phút.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
