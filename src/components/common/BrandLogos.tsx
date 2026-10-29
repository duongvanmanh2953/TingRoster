'use client';

import React from 'react';

export function FacebookLogo({
  size = 22,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block flex-shrink-0 ${className}`}
      aria-label="Facebook"
    >
      <path
        d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.412c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.971H15.83c-1.491 0-1.956.93-1.956 1.886v2.265h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"
        fill="#1877F2"
      />
      <path
        d="M16.67 15.563l.532-3.49h-3.328v-2.265c0-.955.465-1.886 1.956-1.886h1.514V4.95s-1.374-.236-2.686-.236c-2.741 0-4.533 1.672-4.533 4.697v2.662H7.078v3.49h3.047V24c.618.097 1.25.147 1.875.147s1.257-.05 1.875-.147v-8.437h2.795z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

export function ZaloLogo({
  size = 22,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block flex-shrink-0 ${className}`}
      aria-label="Zalo"
    >
      <rect width="48" height="48" rx="10" fill="#0068FF" />
      <path
        d="M10 29.5L19.5 17.5H11.5V14.5H23.5V17L14 29.5H24.5V32.5H10V29.5Z"
        fill="white"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M26 23.8C26 21.7 27.6 20 29.8 20C32 20 33.6 21.7 33.6 23.8V31H31.4V29.2C30.6 30.3 29.5 31 28.1 31C26 31 24.5 29.4 24.5 27.3C24.5 25.2 26 23.6 28.1 23.6C29.5 23.6 30.6 24.3 31.4 25.4V23.8C31.4 22.7 30.7 22 29.8 22C28.9 22 28.2 22.7 28.2 23.8H26ZM26.8 27.3C26.8 28.3 27.4 29 28.4 29C29.4 29 30.1 28.3 30.1 27.3C30.1 26.3 29.4 25.6 28.4 25.6C27.4 25.6 26.8 26.3 26.8 27.3Z"
        fill="white"
      />
      <path
        d="M34.5 14H37V31H34.5V14Z"
        fill="white"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M38.5 25.5C38.5 22.5 40.5 20 43.5 20C46.5 20 48.5 22.5 48.5 25.5C48.5 28.5 46.5 31 43.5 31C40.5 31 38.5 28.5 38.5 25.5ZM46 25.5C46 23.6 44.8 22 43.5 22C42.2 22 41 23.6 41 25.5C41 27.4 42.2 29 43.5 29C44.8 29 46 27.4 46 25.5Z"
        fill="white"
      />
    </svg>
  );
}
