import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Android back-button handling via Capacitor
// On web this import is a no-op, so it's safe in all environments
async function setupBackButton() {
  try {
    const { App: CapApp } = await import('@capacitor/app');
    const { isPlatform } = await import('@capacitor/core').catch(() => ({ isPlatform: () => false }));

    CapApp.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        // On dashboard (root), do nothing — don't close the app accidentally
        // Android will close it on a second back press via system behavior
      }
    });
  } catch {
    // Running in browser — no Capacitor, skip silently
  }
}

setupBackButton();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
