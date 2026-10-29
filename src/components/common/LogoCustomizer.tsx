'use client';

import React, { useState, useRef } from 'react';
import {
  Upload,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Building2,
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';

interface LogoCustomizerProps {
  currentLogoUrl?: string | null;
  defaultFallbackName?: string;
  title?: string;
  description?: string;
  onLogoUpdated: (newLogoUrl: string | null) => void;
  compact?: boolean;
  className?: string;
}

export function LogoCustomizer({
  currentLogoUrl,
  defaultFallbackName = 'TingRoster',
  title = 'Logo nhận diện thương hiệu',
  description = 'Hỗ trợ định dạng PNG (nền trong suốt), JPG, WEBP, SVG. Dung lượng tối đa 3MB.',
  onLogoUpdated,
  compact = false,
  className = '',
}: LogoCustomizerProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccessMsg(null);

    // Frontend validation
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      setError('Định dạng ảnh không hợp lệ. Vui lòng chọn PNG, JPG, WEBP hoặc SVG.');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setError('Dung lượng ảnh vượt quá giới hạn 3MB. Vui lòng chọn ảnh nhỏ hơn.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setImgError(false);
        onLogoUpdated(data.url);
        setSuccessMsg('Đã tải lên và áp dụng logo mới thành công!');
        setTimeout(() => setSuccessMsg(null), 3500);
      } else {
        setError(data.error || 'Lỗi khi tải logo lên máy chủ.');
      }
    } catch {
      setError('Lỗi kết nối khi tải ảnh lên.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    if (confirm('Bạn có chắc chắn muốn xóa logo này và quay về mặc định?')) {
      onLogoUpdated(null);
      setSuccessMsg('Đã khôi phục logo mặc định!');
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2.5 ${className}`}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden"
          onChange={handleFileChange}
        />
        
        {/* Logo Preview */}
        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-center overflow-hidden flex-shrink-0 p-1">
          {currentLogoUrl && !imgError ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={currentLogoUrl}
              alt="Logo"
              className="w-full h-full object-contain"
              onError={() => setImgError(true)}
            />
          ) : (
            <Building2 className="w-5 h-5 text-indigo-600" />
          )}
        </div>

        {/* Change / Upload Button */}
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <CircularProgress size={12} color="inherit" />
          ) : (
            <Upload className="w-3 h-3 text-[#2538D9]" />
          )}
          <span>Đổi logo</span>
        </button>

        {currentLogoUrl && (
          <Tooltip title="Khôi phục logo mặc định">
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
        )}
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-700/80">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[#2538D9] dark:text-indigo-400" />
            <span>{title}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            {description}
          </p>
        </div>

        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-[#2538D9] dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800 flex-shrink-0">
          Tùy chỉnh
        </span>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Preview Box & Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-5 pt-1">
        {/* Large Logo Canvas with Transparent Checkerboard BG Option */}
        <div className="w-36 h-24 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center p-3 relative overflow-hidden group">
          {currentLogoUrl && !imgError ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={currentLogoUrl}
              alt="Logo Preview"
              className="w-full h-full object-contain filter drop-shadow-sm select-none"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 text-center">
              <Building2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-1" />
              <span className="text-[10px] font-semibold text-slate-400">Logo mặc định</span>
            </div>
          )}
        </div>

        {/* Buttons & Guidelines */}
        <div className="space-y-2 flex-1 text-left">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <CircularProgress size={14} color="inherit" />
                  <span>Đang tải lên...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>{currentLogoUrl ? 'Thay logo mới' : 'Tải logo lên'}</span>
                </>
              )}
            </button>

            {currentLogoUrl && (
              <button
                type="button"
                onClick={handleRemove}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span>Khôi phục mặc định</span>
              </button>
            )}
          </div>

          <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
            Logo sẽ tự động xuất hiện trên thanh Sidebar, Header, Phiếu thu học phí và Cổng tra cứu trực tuyến dành cho phụ huynh & hội viên.
          </p>
        </div>
      </div>
    </div>
  );
}
