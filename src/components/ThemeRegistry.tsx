'use client';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import '@fontsource/cairo';
import Box from '@mui/material/Box';
import React from 'react';

const theme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: 'Cairo, Arial',
  },
  palette: {
    primary: { main: '#1A237E' },
    secondary: { main: '#FFD600' },
    background: { default: '#F5F5F5' },
    text: { primary: '#222222' },
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