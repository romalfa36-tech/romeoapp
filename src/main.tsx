import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProvider } from './lib/context';
import { LanguageProvider } from './lib/context';
import { App } from './components/App';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LanguageProvider>
      <AppProvider>
        <App />
      </AppProvider>
    </LanguageProvider>
  </React.StrictMode>
);