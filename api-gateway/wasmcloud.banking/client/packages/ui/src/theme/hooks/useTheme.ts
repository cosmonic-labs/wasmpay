import {useThemeStore} from '#theme/state/store.ts';

function useTheme(): ['dark' | 'light', () => void] {
  const [mode, toggleTheme] = useThemeStore((state) => [state.theme.mode, state.toggleTheme]);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = mode === 'system' ? (prefersDark ? 'dark' : 'light') : mode;

  return [theme, toggleTheme];
}

export {useTheme};
