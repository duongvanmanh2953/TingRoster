'use client';

import React, { useState } from 'react';
import { Share2, Copy, Check, ExternalLink, MessageCircle } from 'lucide-react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import { ZaloLogo } from '@/components/common/BrandLogos';

interface ZaloShareProps {
  shareUrl: string;
  title?: string;
  description?: string;
  variant?: 'button' | 'icon' | 'pill';
  buttonText?: string;
  className?: string;
}

export function ZaloShareButton({
  shareUrl,
  title = 'TingRoster — Cổng thông tin & Đối soát',
  description = 'Gửi liên kết công khai đến học viên, hội viên hoặc phụ huynh qua Zalo.',
  variant = 'button',
  buttonText = 'Chia sẻ Zalo',
  className = '',
}: ZaloShareProps) {
  const [copied, setCopied] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Normalize absolute URL
  const absoluteUrl = typeof window !== 'undefined'
    ? (shareUrl.startsWith('http') ? shareUrl : `${window.location.origin}${shareUrl}`)
    : shareUrl;

  const handleOpenZaloWeb = () => {
    // Official Zalo Web Share link
    const zaloShareUrl = `https://zalo.me/share?url=${encodeURIComponent(absoluteUrl)}`;
    
    // Open in safe new tab/window
    window.open(zaloShareUrl, '_blank', 'noopener,noreferrer,width=600,height=700');
    setFeedback('Đã mở cửa sổ chia sẻ Zalo');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: absoluteUrl,
        });
        setFeedback('Đã mở bảng chia sẻ trên thiết bị');
        setTimeout(() => setFeedback(null), 3000);
        return;
      } catch (err) {
        // User cancelled or share failed, fallback to modal
      }
    }
    setModalOpen(true);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setCopied(true);
      setFeedback('Đã sao chép liên kết vào bộ nhớ tạm!');
      setTimeout(() => {
        setCopied(false);
        setFeedback(null);
      }, 3000);
    } catch {
      // fallback
    }
  };

  return (
    <>
      {variant === 'icon' ? (
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className={`p-1.5 rounded-xl hover:opacity-90 transition-all ${className}`}
          title="Chia sẻ Zalo"
          aria-label="Chia sẻ liên kết qua Zalo"
        >
          <ZaloLogo size={24} />
        </button>
      ) : variant === 'pill' ? (
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0068FF]/10 hover:bg-[#0068FF]/20 text-[#0068FF] text-[11px] font-bold border border-[#0068FF]/25 transition-all ${className}`}
        >
          <ZaloLogo size={14} />
          <span>Zalo</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0068FF] hover:bg-[#0057D9] text-white text-xs font-bold shadow-xs transition-all hover:scale-[1.01] active:scale-[0.99] ${className}`}
        >
          <ZaloLogo size={18} />
          <span>{buttonText}</span>
        </button>
      )}

      {/* Interactive Zalo Sharing Modal */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '1.25rem',
              p: 1,
              bgcolor: 'background.paper',
            },
          },
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 1.5, px: 2 }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ZaloLogo size={32} />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                  Chia sẻ qua Zalo
                </h3>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  Liên kết công khai an toàn
                </span>
              </div>
            </div>
            <IconButton size="small" onClick={() => setModalOpen(false)} sx={{ color: '#94A3B8' }}>
              ✕
            </IconButton>
          </div>
        </DialogTitle>

        <DialogContent sx={{ px: 2, pb: 2, pt: 1 }} className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {description}
          </p>

          {feedback && (
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-[#0068FF] dark:text-blue-300 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>{feedback}</span>
            </div>
          )}

          {/* URL Box */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] font-semibold text-slate-400 block uppercase">Đường dẫn chia sẻ:</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={absoluteUrl}
                className="w-full text-xs font-mono bg-transparent border-none outline-none text-slate-800 dark:text-slate-200 truncate select-all"
              />
            </div>
          </div>

          {/* Dual Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handleOpenZaloWeb}
              className="py-2.5 px-3 rounded-xl bg-[#0068FF] hover:bg-[#0057D9] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all hover:scale-[1.01]"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Mở Zalo ngay</span>
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Đã sao chép!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Sao chép link</span>
                </>
              )}
            </button>
          </div>

          <p className="text-[10px] text-slate-400 text-center leading-tight">
            Trên điện thoại, nút này sẽ kích hoạt mở ứng dụng Zalo. Trên máy tính, cửa sổ Zalo Web sẽ được mở để bạn chọn danh bạ gửi tin nhắn.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
