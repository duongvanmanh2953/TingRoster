'use client';

import React, { useMemo } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { ThemeProvider, useTheme } from './ThemeContext';

function MuiThemeBridge({ children }: { children: React.ReactNode }) {
  const { isDark } = useTheme();

  const theme = useMemo(() => {
    return createTheme({
      palette: {
        mode: isDark ? 'dark' : 'light',
        primary: {
          main: '#2538D9', // Ting Royal Blue
          contrastText: '#FFFFFF',
        },
        secondary: {
          main: '#6D5CE8',
          contrastText: '#FFFFFF',
        },
        background: {
          default: isDark ? '#0B0F19' : '#F5F7FB',
          paper: isDark ? '#111726' : '#FFFFFF',
        },
        text: {
          primary: isDark ? '#F8FAFC' : '#101828',
          secondary: isDark ? '#94A3B8' : '#475467',
        },
        divider: isDark ? '#1E293B' : '#E4E7EC',
        error: {
          main: isDark ? '#F43F5E' : '#B42318',
        },
        warning: {
          main: isDark ? '#F59E0B' : '#B54708',
        },
        success: {
          main: isDark ? '#10B981' : '#067647',
        },
        info: {
          main: isDark ? '#3B82F6' : '#2538D9',
        },
      },
      typography: {
        fontFamily: "'__Be_Vietnam_Pro_0df554', var(--font-be-vietnam-pro), 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        button: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
      shape: {
        borderRadius: 8, // Refined non-bubbly radius (8px)
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: '0.5rem',
              fontWeight: 600,
              boxShadow: 'none',
              padding: '6px 14px',
            },
            contained: {
              backgroundColor: '#2538D9',
              color: '#FFFFFF',
              '&:hover': {
                backgroundColor: '#1E2DB8',
                boxShadow: 'none',
              },
            },
          },
        },
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              backgroundColor: isDark ? '#111726' : '#FFFFFF',
              borderRadius: '0.5rem',
              fontSize: '0.75rem',
              fontWeight: 500,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: isDark ? '#1E293B' : '#E4E7EC',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: isDark ? '#334155' : '#CBD5E1',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#2538D9',
                borderWidth: 1.5,
              },
            },
            input: {
              color: isDark ? '#F8FAFC' : '#101828',
              fontSize: '0.75rem',
              padding: '7px 12px',
              height: 'auto',
            },
            sizeSmall: {
              height: '36px',
            },
          },
        },
        MuiSelect: {
          styleOverrides: {
            select: {
              padding: '7px 28px 7px 12px !important',
              fontSize: '0.75rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
            },
            icon: {
              color: isDark ? '#94A3B8' : '#64748B',
              right: '8px',
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
              backgroundColor: isDark ? '#111726' : '#FFFFFF',
              border: isDark ? '1px solid #1E293B' : '1px solid #E4E7EC',
              borderRadius: '0.5rem',
            },
          },
        },
        MuiDialog: {
          styleOverrides: {
            paper: {
              borderRadius: '0.75rem',
              border: isDark ? '1px solid #1E293B' : '1px solid #E4E7EC',
              backgroundColor: isDark ? '#111726' : '#FFFFFF',
              boxShadow: isDark
                ? '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
                : '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: {
              borderRadius: '0.375rem',
              fontWeight: 600,
            },
          },
        },
      },
    });
  }, [isDark]);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}

export default function MuiThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ThemeProvider>
        <MuiThemeBridge>{children}</MuiThemeBridge>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
