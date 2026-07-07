import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// vite-plugin-pwa registers the service worker (build/sw.js) automatically.
// Clean up the cache left behind by the retired CRA-era service worker so
// returning users don't keep an orphaned 'offline' cache around.
if ('caches' in window) {
  caches.delete('offline').catch(() => {});
}

const root = createRoot(document.getElementById('root') as HTMLElement);

root.render(<App />);
