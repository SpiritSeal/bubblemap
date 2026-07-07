import React, { useState, createContext, useMemo, ReactNode } from 'react';
import { PaletteMode, ThemeOptions, useMediaQuery } from '@mui/material';

import { ThemeProvider, createTheme } from '@mui/material/styles';

const getDesignTokens: (mode: PaletteMode) => ThemeOptions = (
  mode: PaletteMode,
) => ({
  typography: {
    fontFamily: 'Inter, sans-serif',
    fontWeightLight: 500,
    fontWeightRegular: 600,
    fontWeightMedium: 700,
    fontWeightBold: 900,
  },
  palette: {
    mode,
    background: {
      default: mode === 'light' ? '#f8f7f8' : '#121212',
    },
    primary: {
      main: '#7F95D1',
      dark: '#0B3954',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FF7075',
    },
    warning: {
      main: '#FDE74C',
    },
    error: {
      main: '#DB5461',
    },
  },
});

const ThemeContext = createContext<() => void>(null as unknown as () => void);

export const ThemeContextProvider = ({ children }: { children: ReactNode }) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)', {
    noSsr: true,
  });
  const [theme, setTheme] = useState<'light' | 'dark'>(
    prefersDarkMode ? 'dark' : 'light',
  );
  // eslint-disable-next-line react/jsx-no-constructed-context-values
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const MUITheme = useMemo(() => createTheme(getDesignTokens(theme)), [theme]);

  return (
    <ThemeContext.Provider value={toggleTheme}>
      <ThemeProvider theme={MUITheme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
