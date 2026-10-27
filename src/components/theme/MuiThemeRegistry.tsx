'use client';

import React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2538D9', // Ting Royal Indigo Blue
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#6D5CE8', // Accent Violet
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F5F7FB',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#101828',
      secondary: '#475467',
    },
    divider: '#E4E7EC',
    error: {
      main: '#B42318',
    },
    warning: {
      main: '#B54708',
    },
    success: {
      main: '#067647',
    },
    info: {
      main: '#2538D9',
    },
  },
  typography: {
    fontFamily: 'var(--font-be-vietnam-pro), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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
          borderRadius: '0.625rem',
          fontWeight: 600,
          boxShadow: 'none',
          padding: '8px 16px',
        },
        contained: {
          backgroundColor: '#2538D9',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#1E2DB8',
            boxShadow: '0 4px 12px rgba(37, 56, 217, 0.25)',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          borderRadius: '0.625rem',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#E4E7EC',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#CBD5E1',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#2538D9',
            borderWidth: 1.5,
          },
        },
        input: {
          color: '#101828',
          fontSize: '0.875rem',
          padding: '10px 14px',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#475467',
          fontSize: '0.875rem',
          '&.Mui-focused': {
            color: '#2538D9',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          borderRadius: '0.625rem',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E4E7EC',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '1rem',
          border: '1px solid #E4E7EC',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
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
      <ThemeProvider theme={lightTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
