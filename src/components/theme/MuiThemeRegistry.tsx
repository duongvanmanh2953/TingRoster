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
        fontFamily:
          "'__Be_Vietnam_Pro_0df554', var(--font-be-vietnam-pro), 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        button: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
      shape: {
        borderRadius: 10,
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: '0.625rem',
              fontWeight: 600,
              fontSize: '0.8125rem',
              boxShadow: 'none',
              padding: '8px 16px',
              textTransform: 'none',
              letterSpacing: '0.01em',
              transition: 'all 0.15s ease-in-out',
            },
            contained: {
              backgroundColor: '#2538D9 !important',
              color: '#FFFFFF !important',
              boxShadow: '0 1px 3px 0 rgba(37, 56, 217, 0.3) !important',
              '&:hover': {
                backgroundColor: '#1E2DB8 !important',
                boxShadow: '0 4px 10px -1px rgba(37, 56, 217, 0.45) !important',
                transform: 'translateY(-1px)',
              },
              '&:active': {
                transform: 'translateY(0)',
              },
              '&.Mui-disabled': {
                backgroundColor: isDark ? '#1E293B !important' : '#E2E8F0 !important',
                color: isDark ? '#64748B !important' : '#94A3B8 !important',
              },
            },
            outlined: {
              borderWidth: '1.5px !important',
              borderColor: isDark ? '#334155 !important' : '#D0D5DD !important',
              color: isDark ? '#F1F5F9 !important' : '#1E293B !important',
              backgroundColor: isDark ? '#1E293B !important' : '#FFFFFF !important',
              '&:hover': {
                borderColor: '#2538D9 !important',
                color: '#2538D9 !important',
                backgroundColor: isDark
                  ? 'rgba(37, 56, 217, 0.12) !important'
                  : '#F8FAFC !important',
                borderWidth: '1.5px !important',
              },
            },
            text: {
              color: isDark ? '#94A3B8' : '#475467',
              '&:hover': {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
                color: isDark ? '#FFFFFF' : '#101828',
              },
            },
          },
        },
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              backgroundColor: isDark ? '#0F172A !important' : '#FFFFFF !important',
              borderRadius: '0.625rem',
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: isDark ? '#F8FAFC !important' : '#101828 !important',
              transition: 'all 0.15s ease-in-out',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: isDark ? '#334155 !important' : '#CBD5E1 !important',
                borderWidth: '1.5px !important',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: isDark ? '#64748B !important' : '#94A3B8 !important',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#2538D9 !important',
                borderWidth: '2px !important',
              },
              '&.Mui-focused': {
                boxShadow: '0 0 0 3px rgba(37, 56, 217, 0.18)',
              },
            },
            input: {
              color: isDark ? '#F8FAFC !important' : '#101828 !important',
              fontSize: '0.8125rem',
              padding: '9px 13px',
              height: 'auto',
              '&::placeholder': {
                color: isDark ? '#64748B !important' : '#94A3B8 !important',
                opacity: 1,
              },
            },
            sizeSmall: {
              minHeight: '38px',
            },
          },
        },
        MuiInputLabel: {
          styleOverrides: {
            root: {
              color: isDark ? '#CBD5E1 !important' : '#334155 !important',
              fontWeight: 600,
              fontSize: '0.75rem',
              '&.Mui-focused': {
                color: '#2538D9 !important',
              },
            },
          },
        },
        MuiFormHelperText: {
          styleOverrides: {
            root: {
              color: isDark ? '#94A3B8 !important' : '#64748B !important',
              fontSize: '0.6875rem',
              marginTop: '4px',
            },
          },
        },
        MuiSelect: {
          styleOverrides: {
            select: {
              padding: '9px 28px 9px 13px !important',
              fontSize: '0.8125rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              color: isDark ? '#F8FAFC !important' : '#101828 !important',
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
              borderRadius: '0.75rem',
            },
          },
        },
        MuiDialog: {
          styleOverrides: {
            paper: {
              borderRadius: '1rem !important',
              border: isDark ? '1px solid #1E293B !important' : '1px solid #E4E7EC !important',
              backgroundColor: isDark ? '#111726 !important' : '#FFFFFF !important',
              color: isDark ? '#F8FAFC !important' : '#101828 !important',
              boxShadow: isDark
                ? '0 25px 50px -12px rgba(0, 0, 0, 0.7) !important'
                : '0 25px 50px -12px rgba(0, 0, 0, 0.15) !important',
            },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: {
              borderRadius: '0.375rem',
              fontWeight: 600,
              fontSize: '0.75rem',
            },
            sizeSmall: {
              height: '22px',
              fontSize: '0.6875rem',
            },
          },
        },
        MuiBadge: {
          styleOverrides: {
            badge: {
              fontWeight: 700,
              fontSize: '0.625rem',
              minWidth: '18px',
              height: '18px',
              padding: '0 4px',
            },
            dot: {
              minWidth: '8px',
              height: '8px',
              borderRadius: '50%',
            },
          },
        },
        MuiDrawer: {
          styleOverrides: {
            paper: {
              backgroundColor: isDark ? '#0B0F19' : '#FFFFFF',
              borderRight: isDark ? '1px solid #1B2333' : '1px solid #E4E7EC',
            },
          },
        },
        MuiTooltip: {
          styleOverrides: {
            tooltip: {
              backgroundColor: isDark ? '#1E293B' : '#0F172A',
              color: '#FFFFFF',
              fontSize: '0.75rem',
              fontWeight: 500,
              borderRadius: '0.375rem',
              padding: '5px 9px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            },
            arrow: {
              color: isDark ? '#1E293B' : '#0F172A',
            },
          },
        },
        MuiIconButton: {
          styleOverrides: {
            root: {
              borderRadius: '0.5rem',
              transition: 'all 0.15s ease-in-out',
              color: isDark ? '#94A3B8' : '#475467',
              '&:hover': {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                color: isDark ? '#FFFFFF' : '#101828',
              },
            },
          },
        },
        MuiMenu: {
          styleOverrides: {
            paper: {
              borderRadius: '0.75rem',
              border: isDark ? '1px solid #1E293B' : '1px solid #E4E7EC',
              boxShadow: isDark
                ? '0 10px 25px -5px rgba(0, 0, 0, 0.6)'
                : '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
              padding: '4px',
            },
            list: {
              padding: '2px',
            },
          },
        },
        MuiMenuItem: {
          styleOverrides: {
            root: {
              fontSize: '0.75rem',
              fontWeight: 500,
              borderRadius: '0.375rem',
              margin: '2px 0',
              padding: '6px 12px',
              color: isDark ? '#F8FAFC' : '#101828',
              '&:hover': {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.04)',
              },
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

import { LanguageProvider } from '@/components/i18n/LanguageContext';

export default function MuiThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider>
        <LanguageProvider>
          <MuiThemeBridge>{children}</MuiThemeBridge>
        </LanguageProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
