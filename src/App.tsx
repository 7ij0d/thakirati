import React, { useEffect } from 'react';
import { AppLayout } from './components/Layout/AppLayout';
import { initializeDefaultData } from './lib/db';

export const App: React.FC = () => {
  useEffect(() => {
    initializeDefaultData();

    // Register service worker if available
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch((err) => {
          console.log('Service Worker registration skipped or failed:', err);
        });
      });
    }
  }, []);

  return <AppLayout />;
};

export default App;
