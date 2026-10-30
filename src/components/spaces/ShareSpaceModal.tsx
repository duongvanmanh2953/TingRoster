'use client';

import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  ExternalLink,
  ShieldAlert,
  Send,
  QrCode
} from 'lucide-react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { FacebookLogo, ZaloLogo } from '@/components/common/BrandLogos';

interface ShareSpaceModalProps {
  space: {
    id: string;
    name: string;
    slug: string;
    code?: string | null;
  };
  open: boolean;
  onClose: () => void;
}

export function ShareSpaceModal({
  space,
  open,
  onClose,
}: ShareSpaceModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showPortalNotice, setShowPortalNotice] = useState(false);

  const spaceCode = space.code || `TR-${space.slug.toUpperCase().slice(0, 4)}`;
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/p/${space.slug}`
    : `https://tingroster.vn/p/${space.slug}`;

  const copyToClipboard = async (text: string, isCode = false) => {
    try {
      await navigator.clipboard.writeText(text);
      if (isCode) {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      } else {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    } catch {
      // fallback
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `TingRoster — ${space.name}`,
          text: `Tham gia và tra cứu thông tin tại ${space.name} (Mã: ${spaceCode})`,
          url: shareUrl,
        });
      } catch {
        // User cancelled or aborted
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const handleShareZalo = () => {
    const zaloShareUrl = `https://zalo.me/share?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(`Tham gia ${space.name} trên TingRoster`)}`;
    window.open(zaloShareUrl, '_blank', 'noopener,noreferrer,width=600,height=500');
  };

  const handleShareFacebook = () => {
    const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(fbShareUrl, '_blank', 'noopener,noreferrer,width=600,height=500');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '1.25rem',
            overflow: 'hidden',
            backgroundColor: '#FFFFFF',
            backgroundImage: 'none',
          },
          className: 'dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl',
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Chia sẻ & Mã tham gia
              </h3>
              <p className="text-xs text-slate-500">{space.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Space Code Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
                Mã không gian
              </span>
              <span className="text-lg font-mono font-black text-slate-900 dark:text-white mt-0.5 block">
                {spaceCode}
              </span>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(spaceCode, true)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer shadow-2xs whitespace-nowrap"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <Copy className="w-3.5 h-3.5 shrink-0" />}
              <span>{copiedCode ? 'Đã sao chép' : 'Sao chép mã'}</span>
            </button>
          </div>

          {/* Share Link Box */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Đường dẫn cổng thông tin thành viên (Portal)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono select-all focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => copyToClipboard(shareUrl)}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 flex-shrink-0 cursor-pointer shadow-xs"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Đã chép' : 'Chép link'}</span>
              </button>
            </div>
          </div>

          {/* Share Channels */}
          <div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2.5">
              Gửi qua mạng xã hội & Thiết bị
            </span>
            <div className="grid grid-cols-3 gap-3">
              {/* Zalo Button */}
              <button
                type="button"
                onClick={handleShareZalo}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 bg-white dark:bg-slate-800 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs hover:shadow-sm"
              >
                <ZaloLogo size={32} />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Gửi Zalo</span>
              </button>

              {/* Facebook Button */}
              <button
                type="button"
                onClick={handleShareFacebook}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-600 bg-white dark:bg-slate-800 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs hover:shadow-sm"
              >
                <FacebookLogo size={32} />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Facebook</span>
              </button>

              {/* Device Share Button */}
              <button
                type="button"
                onClick={handleNativeShare}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-400 bg-white dark:bg-slate-800 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center">
                  <Share2 className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Chia sẻ khác</span>
              </button>
            </div>
          </div>

          {/* Member Security Note */}
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
              <strong>Bảo mật thông tin:</strong> Việc biết mã không gian chỉ cho phép thành viên truy cập cổng tra cứu công cộng (Portal). Thành viên không thể tự cấp quyền quản trị hoặc xem các khoản nợ của thành viên khác.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-slate-50/50 dark:bg-slate-800/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
