import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { LanguageProvider } from '@/contexts/LanguageContext';
import { registerSW } from 'virtual:pwa-register';

// Service Worker registration (PWA support)
// Uses autoUpdate strategy for seamless version updates
const updateSW = registerSW({
  onNeedRefresh() {
    // User-facing notification (AI_RULES.md Rule 5)
    if (confirm('新しいバージョンが利用可能です。更新しますか？')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    // Debug log (AI_RULES.md Rule 5)
    console.log('✅ App ready to work offline');
  },
  onRegistered(registration) {
    console.log('✅ Service Worker registered:', registration);
  },
  onRegisterError(error) {
    console.error('❌ SW registration error:', error);
  }
});

// Development/Testing: Load Chaos Monkey stress testing utilities
// Only loads on localhost/127.0.0.1 to prevent exposure in production
const isLocalhost = ['localhost', '127.0.0.1', ''].includes(window.location.hostname);
if (isLocalhost) {
  import('./utils/debug/chaosMonkey').then(module => {
    (window as any).ChaosMonkey = module.ChaosMonkey;
    console.log('🐒 ChaosMonkey loaded. Access via window.ChaosMonkey');
  }).catch(err => {
    console.warn('Failed to load ChaosMonkey:', err);
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>,
)
