'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type SidebarThemeMode = 'auto' | 'dark' | 'light';

interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  sidebarTheme: SidebarThemeMode;
  isDarkSidebar: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setSidebarTheme: (mode: SidebarThemeMode) => void;
  cycleSidebarTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  isDark: false,
  sidebarTheme: 'auto',
  isDarkSidebar: false,
  setTheme: () => {},
  toggleTheme: () => {},
  setSidebarTheme: () => {},
  cycleSidebarTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('light');
  const [sidebarTheme, setSidebarThemeState] = useState<SidebarThemeMode>('auto');
  const [isDark, setIsDark] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedTheme = (localStorage.getItem('tingroster-theme') as ThemeMode) || 'light';
    const storedSidebar = (localStorage.getItem('tingroster-sidebar-theme') as SidebarThemeMode) || 'auto';
    
    setThemeState(storedTheme);
    setSidebarThemeState(storedSidebar);
    applyTheme(storedTheme);
  }, []);

  const applyTheme = (mode: ThemeMode) => {
    let effectiveDark = false;
    if (mode === 'dark') {
      effectiveDark = true;
    } else if (mode === 'system') {
      effectiveDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      effectiveDark = false;
    }

    setIsDark(effectiveDark);
    if (effectiveDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  };

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem('tingroster-theme', newTheme);
    applyTheme(newTheme);
  };

  const toggleTheme = () => {
    const next = isDark ? 'light' : 'dark';
    setTheme(next);
  };

  const setSidebarTheme = (mode: SidebarThemeMode) => {
    setSidebarThemeState(mode);
    localStorage.setItem('tingroster-sidebar-theme', mode);
  };

  const cycleSidebarTheme = () => {
    const order: SidebarThemeMode[] = ['auto', 'light', 'dark'];
    const currentIndex = order.indexOf(sidebarTheme);
    const nextMode = order[(currentIndex + 1) % order.length];
    setSidebarTheme(nextMode);
  };

  // Tính toán màu sidebar dựa trên tùy chọn của người dùng
  const isDarkSidebar = sidebarTheme === 'dark' ? true : sidebarTheme === 'light' ? false : isDark;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        sidebarTheme,
        isDarkSidebar,
        setTheme,
        toggleTheme,
        setSidebarTheme,
        cycleSidebarTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

