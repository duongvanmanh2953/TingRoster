'use client';

import React from 'react';

export function ZaloLogo({
  size = 22,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg"
      alt="Zalo"
      width={size}
      height={size}
      className={`inline-block flex-shrink-0 object-contain rounded-[22%] select-none ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).src = '/brands/zalo.svg';
      }}
      loading="lazy"
    />
  );
}

export function FacebookLogo({
  size = 22,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg"
      alt="Facebook"
      width={size}
      height={size}
      className={`inline-block flex-shrink-0 object-contain rounded-full select-none ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).src = '/brands/facebook.svg';
      }}
      loading="lazy"
    />
  );
}

export function TelegramLogo({
  size = 22,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg"
      alt="Telegram"
      width={size}
      height={size}
      className={`inline-block flex-shrink-0 object-contain rounded-full select-none ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).src = '/brands/telegram.svg';
      }}
      loading="lazy"
    />
  );
}

export function VietQRLogo({
  size = 28,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="https://img.vietqr.io/image/vietqr-logo.png"
      alt="VietQR"
      width={size * 2}
      height={size}
      className={`inline-block flex-shrink-0 object-contain select-none ${className}`}
      style={{ height: `${size}px`, width: 'auto' }}
      loading="lazy"
    />
  );
}

