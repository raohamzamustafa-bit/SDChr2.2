/* ================================================================
   SDC HR Solutions — Main Application Provider Shell
   Binds global themes, toasts alerts, and router scopes.
   ================================================================ */

import React, { useEffect } from 'react';
import { AppRouter } from './router';
import { useThemeStore } from './store/themeStore';
import { Toaster } from 'react-hot-toast';

export const App: React.FC = () => {
  const theme = useThemeStore((state) => state.theme);

  // Sync theme attribute with document element for Tailwind v4 scoping
  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <>
      <AppRouter />
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'glass-card border border-slate-700/50 text-slate-100 text-xs font-semibold rounded-xl',
          style: {
            background: 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(12px)',
          },
          success: {
            iconTheme: {
              primary: '#8b5cf6',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
};

export default App;
