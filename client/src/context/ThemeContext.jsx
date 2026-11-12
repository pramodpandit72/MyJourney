import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('myjourney_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch (e) {}
    return 'light'; // Light mode is strictly the default theme
  });

  const [textScale, setTextScale] = useState(() => {
    try {
      const savedScale = localStorage.getItem('myjourney_text_scale');
      if (savedScale === 'sm' || savedScale === 'base' || savedScale === 'lg') {
        return savedScale;
      }
    } catch (e) {}
    return 'base';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('myjourney_theme', theme);
    } catch (e) {}
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    if (textScale === 'sm') {
      root.style.fontSize = '15px';
    } else if (textScale === 'lg') {
      root.style.fontSize = '17.5px';
    } else {
      root.style.fontSize = '16px';
    }
    try {
      localStorage.setItem('myjourney_text_scale', textScale);
    } catch (e) {}
  }, [textScale]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        isDark: theme === 'dark',
        textScale,
        setTextScale
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
