import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProvider } from './lib/context';
import { LanguageProvider } from './lib/context';
import { App } from './components/App';
import { Toaster } from 'sonner';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LanguageProvider>
      <AppProvider>
        <App />
        <Toaster 
          position="top-center" 
          dir="rtl" 
          style={{ pointerEvents: 'none' }}
          toastOptions={{
            style: { pointerEvents: 'auto' }
          }}
        />
      </AppProvider>
    </LanguageProvider>
  </React.StrictMode>
);