import { LocalStorage } from '@/lib/local-storage';
import { useEffect } from 'react';
import { create } from 'zustand';

type Theme = 'dark' | 'light' | 'system';

const themeStorage = new LocalStorage('@fuel-streams/theme');

export type ThemeStore = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isTheme: (theme: 'dark' | 'light') => boolean;
};

export const useTheme = create<ThemeStore>((set, get) => ({
  theme: themeStorage.get<Theme>() ?? 'system',
  setTheme: (theme) => {
    set({ theme });
    themeStorage.set(theme);

    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  },
  isTheme: (value) => {
    const theme = get().theme;
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      return mediaQuery.matches ? value === 'dark' : value === 'light';
    }
    return theme === value;
  },
}));

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      root.classList.add(mediaQuery.matches ? 'dark' : 'light');
      return;
    }

    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  return <>{children}</>;
}
