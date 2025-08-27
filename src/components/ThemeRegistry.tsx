'use client';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import Box from '@mui/material/Box';
import React from 'react';

const theme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: 'Cairo, Tajawal, Noto Sans Arabic, Arial, sans-serif',
    h1: {
      fontFamily: 'Cairo, sans-serif',
      fontWeight: 700,
    },
    h2: {
      fontFamily: 'Cairo, sans-serif',
      fontWeight: 600,
    },
    h3: {
      fontFamily: 'Cairo, sans-serif',
      fontWeight: 600,
    },
    body1: {
      fontFamily: 'Cairo, sans-serif',
      fontWeight: 400,
    },
    button: {
      fontFamily: 'Cairo, sans-serif',
      fontWeight: 600,
    },
  },
  palette: {
    primary: { 
      main: '#1A237E',
      light: '#534BAE',
      dark: '#000051',
    },
    secondary: { 
      main: '#FFD600',
      light: '#FFE54C',
      dark: '#C7A600',
    },
    background: { 
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
    text: { 
      primary: '#222222',
      secondary: '#666666',
    },
    error: {
      main: '#D32F2F',
    },
    warning: {
      main: '#ED6C02',
    },
    info: {
      main: '#0288D1',
    },
    success: {
      main: '#2E7D32',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
      },
    },
  },
});

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box minHeight="100vh" display="flex" flexDirection="column">
        {children}
      </Box>
    </ThemeProvider>
  );
} 