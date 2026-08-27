import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/app/App';
import '@/styles/index.css';
import { loadBranding } from '@/app/config/branding';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

loadBranding().finally(() => {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
