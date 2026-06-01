import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  direction: 'ltr' | 'rtl';
  toggleDirection: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr');

  useEffect(() => {
    const savedTheme = localStorage.getItem('hrms_theme') as 'light' | 'dark';
    const savedDir = localStorage.getItem('hrms_dir') as 'ltr' | 'rtl';
    
    if (savedTheme) {
      setTheme(savedTheme);
    }
    if (savedDir) {
      setDirection(savedDir);
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
    localStorage.setItem('hrms_theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute('dir', direction);
    localStorage.setItem('hrms_dir', direction);
  }, [direction]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const toggleDirection = () => {
    setDirection(prev => (prev === 'ltr' ? 'rtl' : 'ltr'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, direction, toggleDirection }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
