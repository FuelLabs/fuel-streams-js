import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolveTheme: () => 'dark' | 'light';
  isTheme: (checkTheme: 'dark' | 'light') => boolean;
};

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => {
    return null;
  },
  resolveTheme: () => {
    return 'light';
  },
  isTheme: () => {
    return false;
  },
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'ui-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme,
  );

  function resolveTheme() {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return theme;
  }

  function isTheme(checkTheme: 'dark' | 'light') {
    return resolveTheme() === checkTheme;
  }

  function handleSetTheme(theme: Theme) {
    localStorage.setItem(storageKey, theme);
    setTheme(theme);
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolveTheme());
  }, [theme]);

  const value = {
    theme,
    setTheme: handleSetTheme,
    resolveTheme,
    isTheme,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');

  return context;
}
