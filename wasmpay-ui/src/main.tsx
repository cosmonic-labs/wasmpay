import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {addThemeEventListeners} from '@repo/ui/theme/addThemeEventListeners';
import {AppProvider} from '@/components/AppProvider';
import App from '@/App.tsx';
import '@/style.css';

addThemeEventListeners();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>,
);
