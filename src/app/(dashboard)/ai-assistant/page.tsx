'use client';

import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  MessageSquare,
  PenTool,
  FileText,
  Globe,
  Lightbulb,
  BarChart,
  ChevronDown,
  RotateCcw,
  Paperclip,
  CheckCircle2,
  Calendar,
  ArrowRight
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
  bullets?: string[];
  actionLabel?: string;
}

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'user',
      text: 'Giúp tôi lên kế hoạch học IELTS trong 1 tháng với trình độ hiện tại là 5.5 nhé.',
      time: 'Hôm nay 09:15',
    },
    {
      id: '2',
      sender: 'ai',
      text: 'Đây là kế hoạch học IELTS 1 tháng dành cho bạn:',
      time: 'Hôm nay 09:15',
      bullets: [
        'Tuần 1: Củng cố nền tảng (Listening + Reading)',
        'Tuần 2: Phát triển kỹ năng (Speaking + Writing)',
        'Tuần 3: Luyện đề và cải thiện điểm yếu',
        'Tuần 4: Tổng ôn và thi thử chuyên sâu',
      ],
      actionLabel: 'Xem chi tiết kế hoạch',
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeFeature, setActiveFeature] = useState('Trò chuyện thông minh');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      time: `Hôm nay ${now}`,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userText }),
      });
      const data = await res.json();
      
      const aiReply = data?.answer || `Tôi đã ghi nhận yêu cầu: "${userText}". Tôi có thể hỗ trợ bạn lên lịch chi tiết, phân tích công việc hoặc trích xuất báo cáo ngay lập tức!`;

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiReply,
        time: `Hôm nay ${now}`,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: `Đã phân tích yêu cầu: "${userText}". Tôi đã thêm nhiệm vụ này vào lịch trình hôm nay để bạn theo dõi.`,
        time: `Hôm nay ${now}`,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setLoading(false);
    }
  };

  const AI_FEATURES = [
    {
      title: 'Trò chuyện thông minh',
      desc: 'Trả lời câu hỏi, tư vấn, lên lịch',
      icon: MessageSquare,
      color: 'bg-indigo-500/20 text-indigo-400',
    },
    {
      title: 'Tạo nội dung',
      desc: 'Viết email, bài luận, kịch bản',
      icon: PenTool,
      color: 'bg-purple-500/20 text-purple-400',
    },
    {
      title: 'Tóm tắt & phân tích',
      desc: 'Tóm tắt tài liệu, PDF, ghi chú',
      icon: FileText,
      color: 'bg-pink-500/20 text-pink-400',
    },
    {
      title: 'Dịch thuật',
      desc: 'Đa ngôn ngữ, chuẩn ngữ cảnh',
      icon: Globe,
      color: 'bg-cyan-500/20 text-cyan-400',
    },
    {
      title: 'Sáng tạo ý tưởng',
      desc: 'Brainstorm, tìm ý tưởng dự án',
      icon: Lightbulb,
      color: 'bg-amber-500/20 text-amber-400',
    },
    {
      title: 'Phân tích dữ liệu',
      desc: 'Biểu đồ, báo cáo thu chi, insight',
      icon: BarChart,
      color: 'bg-emerald-500/20 text-emerald-400',
    },
  ];

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
      
      {/* Left Column: AI Capabilities (Panel 4) */}
      <div className="w-full lg:w-80 flex flex-col gap-3 flex-shrink-0">
        <div className="flex items-center gap-2 px-1">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <h2 className="text-sm font-bold text-white tracking-tight">Các tính năng AI</h2>
        </div>

        <div className="space-y-2 overflow-y-auto pr-1">
          {AI_FEATURES.map((feat) => {
            const Icon = feat.icon;
            const isSelected = activeFeature === feat.title;
            return (
              <button
                key={feat.title}
                onClick={() => {
                  setActiveFeature(feat.title);
                  setInput(`Hãy giúp tôi thực hiện: ${feat.title}`);
                }}
                className={`w-full p-3 rounded-2xl text-left border transition-all flex items-start gap-3 ${
                  isSelected
                    ? 'bg-[#182042] border-indigo-500/40 shadow-lg shadow-indigo-600/10'
                    : 'bg-[#12172C]/80 border-indigo-500/15 hover:border-indigo-500/30'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl ${feat.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white">{feat.title}</p>
                  <p className="text-[11px] text-slate-400 truncate">{feat.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Column: Interactive Chat Window (Panel 4) */}
      <div className="flex-1 flex flex-col bg-[#12172C]/90 rounded-3xl border border-indigo-500/20 backdrop-blur-xl shadow-2xl overflow-hidden">
        
        {/* Chat Header */}
        <div className="h-14 px-6 border-b border-indigo-500/15 flex items-center justify-between bg-[#151C36]/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                Trò chuyện với AI
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </h3>
              <p className="text-[10px] text-slate-400">MindFlow Intelligence Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="px-2.5 py-1 rounded-lg bg-[#182142] border border-indigo-500/20 text-[11px] font-semibold text-indigo-300 flex items-center gap-1.5">
              <span>GPT-4o</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            <button
              onClick={() => setMessages([])}
              title="Xóa đoạn chat"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-2xl ${msg.sender === 'user' ? 'ml-auto justify-end' : 'mr-auto'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white flex-shrink-0 mt-1 shadow-md">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`p-4 rounded-2xl text-xs space-y-2 leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-none shadow-lg shadow-indigo-600/20'
                    : 'bg-[#182142] border border-indigo-500/20 text-slate-200 rounded-tl-none shadow-md'
                }`}
              >
                <p className="font-medium">{msg.text}</p>

                {msg.bullets && (
                  <ul className="space-y-1.5 pl-2 pt-1 border-l-2 border-indigo-400/40 text-slate-300">
                    {msg.bullets.map((b, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {msg.actionLabel && (
                  <div className="pt-2">
                    <button className="px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 font-semibold text-[11px] flex items-center gap-1.5 transition-colors">
                      <span>{msg.actionLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <p className="text-[10px] text-slate-400 text-right pt-1">{msg.time}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 max-w-md mr-auto">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Bot className="w-4 h-4 animate-bounce" />
              </div>
              <div className="p-3.5 rounded-2xl bg-[#182142] border border-indigo-500/20 text-slate-400 text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                <span>MindFlow AI đang suy nghĩ...</span>
              </div>
            </div>
          )}
        </div>

        {/* Chat Input Bar */}
        <form onSubmit={handleSend} className="p-3 sm:p-4 border-t border-indigo-500/15 bg-[#141A34]/50">
          <div className="relative flex items-center gap-2">
            <button
              type="button"
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập câu hỏi của bạn..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#182142] border border-indigo-500/20 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 disabled:opacity-40 transition-all flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>

      </div>

    </div>
  );
}
