import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from '@/App';
import { AuthProvider } from '@/context/AuthContext';
import { FinanceProvider } from '@/context/FinanceContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import './index.css';
import { runSupabaseDiagnostics } from '@/lib/supabaseDiagnostic';

if (import.meta.env.DEV) {
  runSupabaseDiagnostics();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <ThemeProvider>
          <FinanceProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </FinanceProvider>
        </ThemeProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
);
