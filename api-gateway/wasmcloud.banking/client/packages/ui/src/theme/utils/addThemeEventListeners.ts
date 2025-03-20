import {themeStore} from '#theme/state/store.ts';

/**
 * Add event listeners for theme changes.
 *
 * @returns A function to remove the event listeners.
 */
function addThemeEventListeners() {
  function updateClasses() {
    const mode = themeStore.getState().theme.mode;

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = mode === 'system' ? (prefersDark ? 'dark' : 'light') : mode;

    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(theme);
  }

  // listen to changes on the browser's theme preference
  const query = window.matchMedia('(prefers-color-scheme: dark)');
  query.addEventListener('change', updateClasses);

  // listen to changes on the store's theme mode (defaults to 'system', set to 'dark' or 'light' by the user)
  const unsubscribe = themeStore.subscribe((state, previous) => {
    if (state.theme.mode !== previous.theme.mode) updateClasses();
  });

  // initial call to set the correct classes
  updateClasses();

  return () => {
    query.removeEventListener('change', updateClasses);
    unsubscribe();
  };
}

export {addThemeEventListeners};
