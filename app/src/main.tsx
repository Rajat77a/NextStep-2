import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { PageTransitionProvider } from '@/contexts/PageTransitionContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <PageTransitionProvider>
        <App />
      </PageTransitionProvider>
    </BrowserRouter>
  </StrictMode>
);
