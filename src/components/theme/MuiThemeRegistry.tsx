'use client';

import React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#10B981', // Ting Emerald
      contrastText: '#080C14',
    },
    secondary: {
      main: '#6366F1', // Electric Indigo
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#080C14',
      paper: '#0F1626',
    },
    text: {
      primary: '#F8FAFC',
      secondary: '#94A3B8',
    },
    divider: '#1E283D',
    error: {
      main: '#F43F5E',
    },
    warning: {
      main: '#F59E0B',
    },
    success: {
      main: '#10B981',
    },
    info: {
      main: '#06B6D4',
    },
  },
  typography: {
    fontFamily: 'inherit',
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '0.75rem',
          fontWeight: 700,
          boxShadow: 'none',
          padding: '8px 16px',
        },
        contained: {
          backgroundColor: '#10B981',
          color: '#080C14',
          '&:hover': {
            backgroundColor: '#059669',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#111726',
          borderRadius: '0.75rem',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#1E283D',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#334155',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#10B981',
            borderWidth: 1.5,
          },
        },
        input: {
          color: '#F8FAFC',
          fontSize: '0.875rem',
          padding: '10px 14px',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#94A3B8',
          fontSize: '0.875rem',
          '&.Mui-focused': {
            color: '#10B981',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: '#111726',
          borderRadius: '0.75rem',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#0F1626',
          border: '1px solid #1E283D',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '1rem',
          border: '1px solid #1E283D',
          backgroundColor: '#0F1626',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '0.5rem',
          fontWeight: 600,
        },
      },
    },
  },
});

export default function MuiThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
