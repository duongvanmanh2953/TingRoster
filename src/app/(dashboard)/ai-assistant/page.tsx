'use client';

import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  MessageSquare,
  PenTool,
  FileText,
  Lightbulb,
  BarChart3,
  Copy,
  Check,
  RotateCcw,
  CalendarCheck,
  CreditCard,
  Building2,
  Users2
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
      text: 'Học viên Trần Minh Quân lớp Toán 10A đã quá hạn nộp học phí 5 ngày. Hãy soạn giúp tôi tin nhắn Zalo gửi phụ huynh thật tinh tế, lịch sự nhưng rõ ràng số tiền 600.000đ và mã thanh toán TR84921 nhé.',
      time: '09:15',
    },
    {
      id: '2',
      sender: 'ai',
      text: 'Dạ thầy/cô, đây là mẫu tin nhắn Zalo nhắc học phí nhẹ nhàng, giữ trọn sự tôn trọng và tạo cảm giác chu đáo:',
      time: '09:15',
      bullets: [
        'Dạ em chào anh/chị phụ huynh em Trần Minh Quân ạ. Em gửi anh/chị thông tin học phí tháng 5/2026 của con là 600.000đ (đã tính theo 8 buổi học thực tế trên lớp).',
        'Để thuận tiện gạch nợ tự động ngay lập tức, anh/chị vui lòng quét mã VietQR hoặc chuyển khoản với nội dung: TR84921 giúp em nhé ạ.',
        'Anh/chị có thể xem lại chi tiết sổ điểm danh và phiếu thu của con tại link tra cứu cổng phụ huynh. Em cảm ơn gia đình nhiều ạ!'
      ],
      actionLabel: 'Sao chép tin nhắn mẫu',
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeFeature, setActiveFeature] = useState('Soạn tin nhắc phí');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      time: now,
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
      
      const aiReply = data?.answer || `Dạ, tôi đã phân tích yêu cầu: "${userText}". Đối với TingRoster, bạn có thể tự động hóa quy trình này bằng cách tạo mã VietQR động hoặc thiết lập bot cảnh báo tự động trong mục "Tự động hóa"!`;

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiReply,
        time: now,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: `Dạ, tôi đã tiếp nhận yêu cầu về "${userText}". Bạn có thể áp dụng ngay quy trình điểm danh 1 chạm hoặc gạch nợ tự động để giải phóng 100% thời gian quản lý thủ công.`,
        time: now,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const AI_CAPABILITIES = [
    {
      title: 'Soạn tin nhắc phí',
      desc: 'Nhắc khéo Zalo, ZNS phụ huynh & thành viên',
      prompt: 'Hãy giúp tôi soạn tin nhắn Zalo nhắc học phí nhẹ nhàng, lịch thiệp cho học sinh nợ học phí tháng này.',
      icon: MessageSquare,
      color: 'bg-indigo-50 text-[#2538D9]',
    },
    {
      title: 'Đối soát chuyển khoản',
      desc: 'Phân tích giao dịch sai nội dung hoặc thiếu mã TR',
      prompt: 'Tôi có giao dịch 600.000đ từ "NGUYEN THI B CK TIEN HOC" không có mã TR. Hãy hướng dẫn tôi cách kiểm tra đối soát nhanh nhất.',
      icon: CreditCard,
      color: 'bg-emerald-50 text-emerald-700',
    },
    {
      title: 'Quy chế điểm danh & học bù',
      desc: 'Xây dựng chính sách nghỉ phép, bảo lưu học phí',
      prompt: 'Gợi ý quy chế tính học phí khi học sinh vắng có phép và lịch học bù hợp lý cho lớp học thêm.',
      icon: CalendarCheck,
      color: 'bg-purple-50 text-[#6D5CE8]',
    },
    {
      title: 'Phân tích doanh thu CLB',
      desc: 'Đánh giá tỷ lệ thu tiền và dự báo dòng tiền',
      prompt: 'Phân tích giúp tôi cách tối ưu tỷ lệ thu tiền sân và quỹ tháng cho câu lạc bộ Pickleball / Cầu lông.',
      icon: BarChart3,
      color: 'bg-blue-50 text-blue-700',
    },
    {
      title: 'Thông báo nghỉ lễ & lịch học',
      desc: 'Soạn thông báo chuyên nghiệp gửi vào nhóm Zalo',
      prompt: 'Soạn giúp tôi thông báo nghỉ lễ 30/4 - 1/5 và lịch học bù gửi phụ huynh lớp học.',
      icon: PenTool,
      color: 'bg-amber-50 text-amber-700',
    },
  ];

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col lg:flex-row gap-5 max-w-7xl mx-auto">
      
      {/* Left Column: AI Capabilities */}
      <div className="w-full lg:w-80 flex flex-col gap-3 flex-shrink-0">
        <div className="flex items-center gap-2 px-1">
          <Sparkles className="w-4 h-4 text-[#2538D9]" />
          <h2 className="text-sm font-bold text-[#101828] tracking-tight">Kịch bản AI Hỗ trợ nhanh</h2>
        </div>

        <div className="space-y-2 overflow-y-auto pr-1">
          {AI_CAPABILITIES.map((feat) => {
            const Icon = feat.icon;
            const isSelected = activeFeature === feat.title;
            return (
              <button
                key={feat.title}
                onClick={() => {
                  setActiveFeature(feat.title);
                  setInput(feat.prompt);
                }}
                className={`w-full p-3.5 rounded-xl text-left border transition-all flex items-start gap-3 ${
                  isSelected
                    ? 'bg-white border-[#2538D9] shadow-sm shadow-[#2538D9]/10'
                    : 'bg-white border-[#E4E7EC] hover:border-slate-300'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg ${feat.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#101828]">{feat.title}</p>
                  <p className="text-[11px] text-[#475467] truncate mt-0.5">{feat.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Column: Interactive Chat Window */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-[#E4E7EC] shadow-sm overflow-hidden">
        
        {/* Chat Header */}
        <div className="h-16 px-6 border-b border-[#E4E7EC] flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#2538D9] to-[#6D5CE8] flex items-center justify-center text-white shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#101828] flex items-center gap-2">
                Trợ lý AI TingRoster
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </h3>
              <p className="text-[10px] text-[#475467]">Chuyên gia vận hành lớp học, CLB & đối soát VietQR</p>
            </div>
          </div>

          <button
            onClick={() => setMessages([])}
            className="p-2 text-[#475467] hover:text-[#101828] hover:bg-slate-200/60 rounded-lg transition-colors text-xs font-medium flex items-center gap-1"
            title="Làm mới cuộc trò chuyện"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Xóa đoạn chat</span>
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#2538D9]/10 text-[#2538D9] flex items-center justify-center font-bold">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-[#101828]">Xin chào, tôi là Trợ lý AI của TingRoster</h4>
              <p className="text-xs text-[#475467] max-w-md">
                Tôi có thể giúp bạn soạn tin nhắn Zalo gửi phụ huynh, xử lý giao dịch chuyển khoản sai sót hoặc phân tích tài chính lớp học.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-2xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    msg.sender === 'user'
                      ? 'bg-[#2538D9] text-white'
                      : 'bg-[#6D5CE8]/15 text-[#6D5CE8]'
                  }`}
                >
                  {msg.sender === 'user' ? 'Tôi' : <Bot className="w-4 h-4" />}
                </div>

                <div className="space-y-1">
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#2538D9] text-white rounded-tr-none'
                        : 'bg-[#F8FAFC] border border-[#E4E7EC] text-[#101828] rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                    
                    {msg.bullets && (
                      <div className="mt-2.5 space-y-1.5 border-t border-slate-200/80 pt-2 text-[#475467]">
                        {msg.bullets.map((b, i) => (
                          <div key={i} className="flex items-start gap-1.5">
                            <span className="text-[#2538D9] font-bold">•</span>
                            <span className="text-xs text-[#101828]">{b}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {msg.bullets && (
                      <button
                        onClick={() => handleCopyMessage(msg.bullets!.join('\n\n'), msg.id)}
                        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E4E7EC] hover:bg-slate-50 text-[11px] font-bold text-[#2538D9] transition-colors shadow-xs"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Đã sao chép tin nhắn</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Sao chép tin nhắn gửi Zalo</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  <span className="text-[10px] text-[#475467] block px-1">{msg.time}</span>
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="flex gap-3 max-w-2xl">
              <div className="w-7 h-7 rounded-lg bg-[#6D5CE8]/15 text-[#6D5CE8] flex items-center justify-center text-xs font-bold">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 bg-[#F8FAFC] border border-[#E4E7EC] rounded-2xl rounded-tl-none text-xs text-[#475467] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2538D9] animate-ping" />
                <span>AI đang suy nghĩ và tổng hợp thông tin...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 border-t border-[#E4E7EC] bg-white flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Hỏi AI về soạn tin nhắn nhắc phí, xử lý giao dịch hoặc biểu mẫu..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E4E7EC] text-xs text-[#101828] placeholder-slate-400 focus:outline-none focus:border-[#2538D9] focus:ring-1 focus:ring-[#2538D9] transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-4 py-2.5 bg-[#2538D9] hover:bg-[#1E2DB8] disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <span>Gửi</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>

    </div>
  );
}
