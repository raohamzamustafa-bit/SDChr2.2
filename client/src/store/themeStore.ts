/* ================================================================
   SDC HR Solutions — Theme Configuration Store
   Switches UI layout style and persists selection.
   ================================================================ */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createTenantStorage } from '../lib/storage';

interface ThemeState {
  theme: 'light' | 'dark';
  toggle: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark', // Let's make SDC HR Solutions default to a beautiful premium Dark mode as requested!
      toggle: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' }))
    }),
    {
      name: 'sdc_hrms_theme',
      storage: createTenantStorage('theme')
    }
  )
);
