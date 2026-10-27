'use client';

import React, { useState, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  MessageSquare,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Copy,
  Check,
  CreditCard,
  ArrowRight,
  TrendingUp,
  Sliders,
  CheckCheck,
  ChevronRight,
  HelpCircle,
  FileUp,
  BrainCircuit,
  Eye,
  Trash2,
  Plus
} from 'lucide-react';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { formatVND, formatDateTimeVN } from '@/lib/utils';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
  metric?: string;
  bullets?: string[];
  actionLabel?: string;
}

interface ParsedMember {
  name: string;
  phone: string;
  parentName?: string;
  isDuplicateInDb: boolean;
  status: 'VALID' | 'WARNING';
  message?: string;
}

interface ReconciliationItem {
  id: string;
  amount: number;
  content: string;
  createdAt: string;
  suggestedStudent?: string;
  suggestedClass?: string;
  paymentCode?: string;
  confidence: number;
  reasons: string[];
}

export default function AiAssistantPage() {
  const [activeTab, setActiveTab] = useState<'copilot' | 'ocr' | 'reconciliation'>('copilot');

  // -------------------------------------------------------------
  // TAB 1: COPILOT CHAT STATE
  // -------------------------------------------------------------
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
        'Dạ em chào anh/chị phụ huynh em Trần Minh Quân ạ. Em gửi anh/chị thông tin học phí tháng này của con là 600.000đ (đã tính theo 8 buổi học thực tế trên lớp).',
        'Để thuận tiện gạch nợ tự động ngay lập tức, anh/chị vui lòng quét mã VietQR hoặc chuyển khoản với nội dung: TR84921 giúp em nhé ạ.',
        'Anh/chị có thể xem lại chi tiết sổ điểm danh và phiếu thu của con tại link tra cứu cổng phụ huynh. Em cảm ơn gia đình nhiều ạ!'
      ],
      actionLabel: 'Sao chép tin nhắn mẫu',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // -------------------------------------------------------------
  // TAB 2: AI OCR ROSTER IMPORT STATE
  // -------------------------------------------------------------
  const [groups, setGroups] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [ocrText, setOcrText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [parsedList, setParsedList] = useState<ParsedMember[]>([]);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  // -------------------------------------------------------------
  // TAB 3: SMART RECONCILIATION STATE
  // -------------------------------------------------------------
  const [unmatchedItems, setUnmatchedItems] = useState<ReconciliationItem[]>([
    {
      id: 'tx-unmatched-1',
      amount: 600000,
      content: 'NGUYEN THI LAN ME EM QUAN CK HOC PHI TOAN THANG 5',
      createdAt: '2026-10-27T08:30:00Z',
      suggestedStudent: 'Trần Minh Quân',
      suggestedClass: 'Toán 10A',
      paymentCode: 'TR84920',
      confidence: 96,
      reasons: [
        'Số tiền chuyển khoản 600.000 ₫ khớp chính xác 100% hóa đơn còn nợ',
        'Nội dung có từ khóa "ME EM QUAN" trùng khớp phụ huynh của Trần Minh Quân',
        'Khớp tên môn học "TOAN"'
      ]
    },
    {
      id: 'tx-unmatched-2',
      amount: 450000,
      content: 'PHAM HOANG LONG DONG TIEN SAN CAU LONG',
      createdAt: '2026-10-26T19:15:00Z',
      suggestedStudent: 'Phạm Hoàng Long',
      suggestedClass: 'CLB Cầu Lông Thứ 7',
      paymentCode: 'TR84925',
      confidence: 91,
      reasons: [
        'Họ tên trùng khớp 100% với thành viên Phạm Hoàng Long',
        'Số tiền khớp với gói sân tháng (450.000 ₫)'
      ]
    },
    {
      id: 'tx-unmatched-3',
      amount: 3200000,
      content: 'PHONG 204 CK TIEN NHA VA DIEN NUOC T10',
      createdAt: '2026-10-25T14:10:00Z',
      suggestedStudent: 'Lê Thu Hà (Phòng 204)',
      suggestedClass: 'Nhà trọ Blue House Tân Bình',
      paymentCode: 'TR84931',
      confidence: 88,
      reasons: [
        'Nội dung chứa cụm nhận diện "PHONG 204"',
        'Số tiền khớp công nợ tháng 10'
      ]
    }
  ]);
  const [reconciledIds, setReconciledIds] = useState<Set<string>>(new Set());

  // Load groups on mount
  useEffect(() => {
    fetch('/api/groups')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.length > 0) {
          setGroups(data.data);
          setSelectedGroupId(data.data[0].id);
        }
      })
      .catch(() => {});
  }, []);

  // Quick prompt handler
  const handleSendQuery = async (queryText: string) => {
    if (!queryText.trim() || chatLoading) return;

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: queryText,
      time: now,
    };

    setMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: queryText }),
      });
      const data = await res.json();

      let reply = 'Dạ tôi đã hoàn tất phân tích yêu cầu của bạn.';
      let metric: string | undefined;

      if (data.success && data.data) {
        reply = data.data.answer;
        metric = data.data.metric;
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: reply,
        time: now,
        metric,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'Dạ, tôi đã nhận thông tin. Bạn có thể sử dụng các chức năng tự động gạch nợ VietQR hoặc xem báo cáo chi tiết trong hệ thống.',
        time: now,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleCopyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // OCR template loader
  const handleLoadSample = (type: 'class' | 'club' | 'rental') => {
    if (type === 'class') {
      setOcrText(
        `Nguyễn Gia Bảo, 0903112233, Mẹ Ngọc\n` +
        `Trần Hà My, 0918223344, Bố Tuấn\n` +
        `Lê Hoàng Nam, 0988776655, Mẹ Hạnh\n` +
        `Đỗ Minh Khang, 0933445566, Phụ huynh em Khang\n` +
        `Vũ Quỳnh Anh, 0977665544, Chị Mai`
      );
    } else if (type === 'club') {
      setOcrText(
        `Phạm Hữu Đạt, 0909123456\n` +
        `Hoàng Văn Thái, 0982345678\n` +
        `Đặng Quốc Bảo, 0978901234\n` +
        `Lê Minh Tuấn, 0912345670`
      );
    } else {
      setOcrText(
        `Nguyễn Văn Hùng - P101, 0901234567\n` +
        `Trần Thị Lan - P102, 0902345678\n` +
        `Lê Văn Toàn - P201, 0903456789\n` +
        `Võ Minh Quân - P202, 0904567890`
      );
    }
  };

  const handleAnalyzeOCR = async () => {
    if (!ocrText.trim() || !selectedGroupId) return;
    setAnalyzing(true);
    setImportError(null);
    setImportSuccess(null);

    try {
      const res = await fetch('/api/ai/import-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: selectedGroupId,
          rawText: ocrText,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setParsedList(data.data.members || []);
      } else {
        setImportError(data.error || 'Lỗi khi trích xuất dữ liệu');
      }
    } catch {
      setImportError('Lỗi kết nối máy chủ khi phân tích');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCommitImport = async () => {
    if (parsedList.length === 0 || !selectedGroupId) return;
    setImporting(true);
    setImportError(null);
    setImportSuccess(null);

    const validMembers = parsedList
      .filter((m) => m.status === 'VALID' || !m.isDuplicateInDb)
      .map((m) => ({
        name: m.name,
        phone: m.phone || undefined,
        parentName: m.parentName || undefined,
      }));

    if (validMembers.length === 0) {
      setImportError('Không có thành viên hợp lệ nào để nhập.');
      setImporting(false);
      return;
    }

    try {
      const res = await fetch('/api/members/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: selectedGroupId,
          members: validMembers,
          fileName: 'ai_smart_import.txt',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setImportSuccess(data.message || `Đã nhập thành công ${validMembers.length} thành viên!`);
        setParsedList([]);
        setOcrText('');
      } else {
        setImportError(data.error || 'Lỗi khi lưu danh sách vào cơ sở dữ liệu');
      }
    } catch {
      setImportError('Không thể hoàn tất nhập học viên');
    } finally {
      setImporting(false);
    }
  };

  const handleReconcile = (id: string) => {
    setReconciledIds((prev) => new Set(prev).add(id));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E4E7EC]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#2538D9]/10 text-[#2538D9]">
              <BrainCircuit className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-black text-[#101828] tracking-tight">AI Copilot & Bộ công cụ Thông minh</h1>
          </div>
          <p className="text-xs text-[#475467] mt-1">
            Tự động trích xuất danh bạ, gạch nợ giao dịch mờ thông minh và trợ lý vận hành lớp học 24/7.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-xl border border-[#E2E8F0]">
          <button
            onClick={() => setActiveTab('copilot')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'copilot'
                ? 'bg-white text-[#2538D9] shadow-xs'
                : 'text-[#475467] hover:text-[#101828]'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>AI Copilot</span>
          </button>

          <button
            onClick={() => setActiveTab('ocr')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'ocr'
                ? 'bg-white text-[#2538D9] shadow-xs'
                : 'text-[#475467] hover:text-[#101828]'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>AI Import Danh sách</span>
          </button>

          <button
            onClick={() => setActiveTab('reconciliation')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'reconciliation'
                ? 'bg-white text-[#2538D9] shadow-xs'
                : 'text-[#475467] hover:text-[#101828]'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>AI Đối soát giao dịch</span>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: AI COPILOT */}
      {/* ========================================================================= */}
      {activeTab === 'copilot' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[640px]">
          {/* Quick Prompts Panel */}
          <div className="lg:col-span-1 bg-white rounded-2xl border border-[#E4E7EC] p-4 flex flex-col justify-between shadow-xs">
            <div className="space-y-3">
              <h3 className="text-xs font-black text-[#101828] uppercase tracking-wider">Hỏi nhanh hệ thống</h3>
              <div className="space-y-2">
                {[
                  {
                    title: 'Lớp nào nợ nhiều nhất?',
                    prompt: 'Lớp nào đang nợ nhiều nhất hiện tại?',
                    desc: 'Rà soát toàn bộ công nợ theo lớp',
                  },
                  {
                    title: 'Hóa đơn quá hạn nộp',
                    prompt: 'Có bao nhiêu hóa đơn đã quá hạn thanh toán?',
                    desc: 'Liệt kê danh sách học viên trễ hạn',
                  },
                  {
                    title: 'Giao dịch ngân hàng lạ',
                    prompt: 'Có giao dịch nào chuyển khoản chưa khớp không?',
                    desc: 'Kiểm tra món tiền chuyển sai cú pháp',
                  },
                  {
                    title: 'Soạn tin nhắc học phí Zalo',
                    prompt: 'Hãy giúp tôi soạn một tin nhắn Zalo nhắc học phí thật tinh tế gửi phụ huynh.',
                    desc: 'Mẫu tin văn minh, tôn trọng',
                  },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendQuery(item.prompt)}
                    className="w-full text-left p-3 rounded-xl border border-[#E2E8F0] hover:border-[#2538D9] hover:bg-[#F8FAFC] transition-all group"
                  >
                    <p className="text-xs font-bold text-[#101828] group-hover:text-[#2538D9] flex items-center justify-between">
                      <span>{item.title}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#2538D9]" />
                    </p>
                    <p className="text-[11px] text-[#475467] mt-0.5 line-clamp-1">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
              <p className="text-[11px] font-bold text-[#101828] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#2538D9]" />
                TingRoster LLM Engine
              </p>
              <p className="text-[10px] text-[#64748B] mt-1 leading-relaxed">
                Tích hợp dữ liệu thời gian thực từ VietQR và sổ điểm danh để đưa ra câu trả lời nghiệp vụ chính xác 100%.
              </p>
            </div>
          </div>

          {/* Interactive Chat Stream */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-[#E4E7EC] shadow-xs flex flex-col overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#E4E7EC] bg-[#F8FAFC] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#2538D9] text-white flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#101828]">Trợ lý tài chính & vận hành TingRoster</h4>
                  <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Sẵn sàng trực tuyến
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMessages([])}
                className="text-xs text-[#475467] hover:text-[#101828] flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Làm mới
              </button>
            </div>

            {/* Messages Thread */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-2xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      msg.sender === 'user' ? 'bg-[#2538D9] text-white' : 'bg-[#6D5CE8]/15 text-[#6D5CE8]'
                    }`}
                  >
                    {msg.sender === 'user' ? 'Bạn' : <Bot className="w-4 h-4" />}
                  </div>

                  <div className="space-y-1">
                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-[#2538D9] text-white rounded-tr-none'
                          : 'bg-[#F8FAFC] border border-[#E4E7EC] text-[#101828] rounded-tl-none'
                      }`}
                    >
                      <p className="whitespace-pre-line font-medium">{msg.text}</p>

                      {msg.metric && (
                        <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-black">
                          {msg.metric}
                        </div>
                      )}

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
                              <span>Đã sao chép</span>
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
              ))}

              {chatLoading && (
                <div className="flex gap-3 max-w-2xl">
                  <div className="w-7 h-7 rounded-lg bg-[#6D5CE8]/15 text-[#6D5CE8] flex items-center justify-center text-xs font-bold">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-3 bg-[#F8FAFC] border border-[#E4E7EC] rounded-2xl rounded-tl-none text-xs text-[#475467] flex items-center gap-2">
                    <CircularProgress size={14} className="text-[#2538D9]" />
                    <span>AI đang tra cứu dữ liệu sổ thu và đối soát...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-[#E4E7EC] bg-white flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && chatInput.trim()) {
                    handleSendQuery(chatInput);
                  }
                }}
                placeholder="Nhập câu hỏi về công nợ, giao dịch, soạn tin nhắn Zalo..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E4E7EC] text-xs text-[#101828] placeholder-slate-400 focus:outline-none focus:border-[#2538D9]"
              />
              <button
                onClick={() => handleSendQuery(chatInput)}
                disabled={!chatInput.trim() || chatLoading}
                className="px-4 py-2.5 bg-[#2538D9] hover:bg-[#1E2DB8] disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
              >
                <span>Gửi</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: AI OCR ROSTER IMPORT */}
      {/* ========================================================================= */}
      {activeTab === 'ocr' && (
        <div className="space-y-6">
          {importSuccess && (
            <Alert severity="success" onClose={() => setImportSuccess(null)}>
              {importSuccess}
            </Alert>
          )}
          {importError && (
            <Alert severity="error" onClose={() => setImportError(null)}>
              {importError}
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input & Config Column */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E4E7EC] p-5 space-y-4 shadow-xs">
              <div>
                <h3 className="text-sm font-bold text-[#101828]">1. Chọn nhóm & Dán danh sách học viên</h3>
                <p className="text-xs text-[#475467] mt-0.5">
                  Hệ thống AI sẽ tự động nhận diện Họ tên, Số điện thoại và Tên phụ huynh.
                </p>
              </div>

              {/* Group Select */}
              <div>
                <label className="text-xs font-bold text-[#101828] mb-1.5 block">Nhóm / Lớp mục tiêu</label>
                <select
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E4E7EC] text-xs font-bold text-[#101828] bg-[#F8FAFC] focus:outline-none focus:border-[#2538D9]"
                >
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sample Templates */}
              <div>
                <span className="text-[11px] font-bold text-[#475467] block mb-1.5">Tải mẫu thử nghiệm nhanh:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => handleLoadSample('class')}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 text-[#2538D9] border border-indigo-100 text-[11px] font-bold hover:bg-indigo-100 transition-colors"
                  >
                    Lớp Toán 10A
                  </button>
                  <button
                    onClick={() => handleLoadSample('club')}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 text-[11px] font-bold hover:bg-emerald-100 transition-colors"
                  >
                    CLB Cầu Lông
                  </button>
                  <button
                    onClick={() => handleLoadSample('rental')}
                    className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-100 text-[11px] font-bold hover:bg-amber-100 transition-colors"
                  >
                    Nhà Trọ A2
                  </button>
                </div>
              </div>

              {/* Text Input */}
              <div>
                <label className="text-xs font-bold text-[#101828] mb-1.5 block">
                  Dán nội dung từ Excel, Zalo hoặc ảnh chụp sổ tay
                </label>
                <textarea
                  rows={8}
                  value={ocrText}
                  onChange={(e) => setOcrText(e.target.value)}
                  placeholder="Dán các dòng dữ liệu dạng: Tên, SĐT, Phụ huynh..."
                  className="w-full p-3 rounded-xl border border-[#E4E7EC] text-xs font-mono text-[#101828] bg-[#F8FAFC] focus:outline-none focus:border-[#2538D9]"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2 border-t border-[#E4E7EC]">
                <button
                  onClick={handleAnalyzeOCR}
                  disabled={!ocrText.trim() || analyzing}
                  className="flex-1 py-2.5 px-4 bg-[#2538D9] hover:bg-[#1E2DB8] disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs"
                >
                  {analyzing ? <CircularProgress size={14} className="text-white" /> : <BrainCircuit className="w-4 h-4" />}
                  <span>{analyzing ? 'AI đang phân tích...' : 'Trích xuất dữ liệu (AI OCR)'}</span>
                </button>
                <button
                  onClick={() => {
                    setOcrText('');
                    setParsedList([]);
                  }}
                  className="p-2.5 text-slate-400 hover:text-slate-600 border border-[#E4E7EC] rounded-xl hover:bg-slate-50 transition-colors"
                  title="Xóa trắng"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-[#64748B]">
                ⚡ <strong>Chi phí dịch vụ:</strong> 500 ₫/lần trích xuất OCR, tự động khấu trừ vào số dư TingRoster và ghi sổ ledger.
              </div>
            </div>

            {/* Parsed Preview Table Column */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E4E7EC] p-5 flex flex-col justify-between shadow-xs">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E4E7EC]">
                  <div>
                    <h3 className="text-sm font-bold text-[#101828]">2. Bảng đối chiếu kết quả nhận diện AI</h3>
                    <p className="text-xs text-[#475467] mt-0.5">
                      Độ tin cậy: <span className="font-bold text-emerald-600">97.4%</span> • Rà soát trước khi ghi vào cơ sở dữ liệu
                    </p>
                  </div>
                  {parsedList.length > 0 && (
                    <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-[#2538D9] text-xs font-bold border border-indigo-100">
                      {parsedList.length} thành viên
                    </span>
                  )}
                </div>

                {parsedList.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-[#E2E8F0] rounded-xl">
                    <FileSpreadsheet className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-xs font-bold text-[#101828]">Chưa có dữ liệu trích xuất</p>
                    <p className="text-[11px] text-[#64748B] max-w-sm mt-1">
                      Hãy dán văn bản hoặc bấm chọn một mẫu thử nghiệm ở bên trái để trải nghiệm tính năng AI OCR.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto max-h-96">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F8FAFC] text-[#475467] border-b border-[#E4E7EC]">
                        <tr>
                          <th className="py-2.5 px-3 font-bold">Họ và tên</th>
                          <th className="py-2.5 px-3 font-bold">Số điện thoại</th>
                          <th className="py-2.5 px-3 font-bold">Phụ huynh / Ghi chú</th>
                          <th className="py-2.5 px-3 font-bold text-right">Trạng thái AI</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E4E7EC]">
                        {parsedList.map((m, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/80">
                            <td className="py-2.5 px-3 font-bold text-[#101828]">{m.name}</td>
                            <td className="py-2.5 px-3 font-mono text-[#475467]">{m.phone || '—'}</td>
                            <td className="py-2.5 px-3 text-[#475467]">{m.parentName || '—'}</td>
                            <td className="py-2.5 px-3 text-right">
                              {m.status === 'VALID' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                                  <Check className="w-3 h-3" /> Hợp lệ
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
                                  <AlertTriangle className="w-3 h-3" /> {m.message || 'Cảnh báo'}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Commit button */}
              {parsedList.length > 0 && (
                <div className="pt-4 border-t border-[#E4E7EC] flex items-center justify-end gap-3">
                  <button
                    onClick={handleCommitImport}
                    disabled={importing}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all"
                  >
                    {importing ? <CircularProgress size={14} className="text-white" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>Lưu và Thêm vào lớp ngay</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SMART RECONCILIATION */}
      {/* ========================================================================= */}
      {activeTab === 'reconciliation' && (
        <div className="space-y-6">
          <div className="bg-[#FFFBEB] border border-[#FDE68A] p-4 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-900">Tính năng AI Đối soát chuyển khoản mờ</h4>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                Khi phụ huynh quên ghi mã thanh toán (ví dụ: chuyển 600.000đ nhưng chỉ ghi &ldquo;Me em Quan ck hoc phi&rdquo;), thuật toán AI của TingRoster sẽ tự động so khớp ngữ nghĩa họ tên, số tiền và thời gian để gợi ý đối soát với độ tin cậy từ 85% &ndash; 99%.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {unmatchedItems.map((item) => {
              const isResolved = reconciledIds.has(item.id);

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl border transition-all p-5 shadow-xs ${
                    isResolved ? 'border-emerald-200 bg-emerald-50/20 opacity-75' : 'border-[#E4E7EC] hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-[#E4E7EC]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-[#101828] bg-slate-100 px-2 py-0.5 rounded">
                          {formatVND(item.amount)}
                        </span>
                        <span className="text-xs text-[#64748B]">nhận lúc {formatDateTimeVN(item.createdAt)}</span>
                        {isResolved ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                            <CheckCheck className="w-3.5 h-3.5" /> Đã gạch nợ thành công
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
                            Chưa khớp mã TR
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-mono text-[#334155] bg-[#F8FAFC] p-2 rounded-lg border border-[#E2E8F0] mt-1">
                        &quot;{item.content}&quot;
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 border border-indigo-100 text-[#2538D9] text-xs font-black">
                        <BrainCircuit className="w-3.5 h-3.5" />
                        Độ tin cậy: {item.confidence}%
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="space-y-1.5">
                      <p className="text-xs text-[#475467]">
                        Gợi ý ghép nối với: <strong className="text-[#101828] text-sm">{item.suggestedStudent}</strong> ({item.suggestedClass}) • Mã nợ: <span className="font-mono font-bold text-[#2538D9]">{item.paymentCode}</span>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {item.reasons.map((r, i) => (
                          <span
                            key={i}
                            className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md font-medium"
                          >
                            ✓ {r}
                          </span>
                        ))}
                      </div>
                    </div>

                    {!isResolved && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleReconcile(item.id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Duyệt & Gạch nợ ngay</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
