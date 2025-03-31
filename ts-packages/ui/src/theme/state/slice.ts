import type {StateCreator} from 'zustand';

type ThemeState = {
  theme: {
    mode: 'light' | 'dark' | 'system';
  };
};

type ThemeActions = {
  toggleTheme: () => void;
};

type ThemeSlice = ThemeState & ThemeActions;

type ImmerStateCreator<T> = StateCreator<ThemeSlice, [['zustand/immer', never], never], [], T>;

const createThemeSlice: ImmerStateCreator<ThemeSlice> = (set) => ({
  theme: {
    mode: 'system',
  },
  toggleTheme() {
    set((state) => {
      state.theme.mode = state.theme.mode === 'light' ? 'dark' : 'light';
    });
  },
});

export {createThemeSlice, type ThemeSlice};
