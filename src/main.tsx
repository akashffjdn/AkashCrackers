import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/App.tsx';
import '@/styles/index.css';

// Initialize theme before render to prevent flash
const savedTheme = JSON.parse(localStorage.getItem('akash-crackers-theme') ?? '{}');
if (savedTheme?.state?.theme === 'light') {
  document.documentElement.classList.remove('dark');
} else {
  document.documentElement.classList.add('dark');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
