'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    // Clear all caches first to remove any stale data
    if ('caches' in window) {
      caches.keys().then((keys) => {
        keys.forEach((key) => caches.delete(key));
      });
    }

    // Unregister all existing service workers, then re-register fresh
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      const unregisterAll = registrations.map((r) => r.unregister());
      return Promise.all(unregisterAll);
    }).then(() => {
      // Version param forces browser to see this as a new SW
      return navigator.serviceWorker.register('/sw.js?v=5');
    }).then((registration) => {
      registration.update();
    }).catch((err) => {
      console.error('SW registration failed:', err);
    });
  }, []);

  return null;
}
