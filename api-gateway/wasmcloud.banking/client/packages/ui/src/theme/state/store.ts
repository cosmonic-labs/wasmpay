import {createThemeSlice, ThemeSlice} from './slice';
import {useStore} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import {immer} from 'zustand/middleware/immer';
import {createStore} from 'zustand/vanilla';

type ThemeStore = ThemeSlice;

const themeStore = createStore<ThemeStore>()(
  persist(immer<ThemeSlice>(createThemeSlice), {
    name: 'theme',
    storage: createJSONStorage(() => localStorage),
    version: 2,
  }),
);

function useThemeStore(): ThemeStore;
function useThemeStore<T>(selector: (state: ThemeStore) => T): T;
function useThemeStore<T>(selector?: (state: ThemeStore) => T) {
  return useStore(themeStore, selector!);
}

export {useThemeStore, themeStore};
