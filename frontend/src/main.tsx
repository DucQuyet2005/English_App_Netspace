import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AppProvider } from './AppContext';
import { LanguageProvider } from './context/LanguageContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      {/* 2. Bọc LanguageProvider bên ngoài App */}
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </AppProvider>
  </StrictMode>,
);
