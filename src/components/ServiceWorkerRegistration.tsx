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
      return navigator.serviceWorker.register('/sw.js');
    }).then((registration) => {
      // Force check for updated sw.js
      registration.update();
    }).catch((err) => {
      console.error('SW registration failed:', err);
    });
  }, []);

  return null;
}
