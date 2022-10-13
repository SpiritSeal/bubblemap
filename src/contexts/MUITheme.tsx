import React, { useState, createContext, useMemo, ReactNode } from 'react';
import { PaletteMode, ThemeOptions, useMediaQuery } from '@mui/material';

import { ThemeProvider, createTheme } from '@mui/material/styles';

const getDesignTokens: (mode: PaletteMode) => ThemeOptions = (
  mode: PaletteMode
) => ({
  typography: {
    fontFamily: 'century-gothic, sans-serif',
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
  },
  palette: {
    mode,
    background: {
      default: mode === 'light' ? '#f8f7f8' : '#121212',
    },
    primary: {
      main: '#3891A6',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#4C5B5C',
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
    prefersDarkMode ? 'dark' : 'light'
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
