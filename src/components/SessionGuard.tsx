'use client';

import { useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';

const PUBLIC_PATHS = ['/', '/set-pin'];
const CHECK_INTERVAL = 30_000; // 30 seconds

export default function SessionGuard() {
  const pathname = usePathname();

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/check');
      const data = await res.json();
      if (!data.ok) {
        // Clear cookie via logout and redirect to login
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/?logged_out=1';
      }
    } catch {
      // Network error — skip this check
    }
  }, []);

  useEffect(() => {
    // Don't poll on public pages
    if (PUBLIC_PATHS.includes(pathname)) return;

    // Check immediately on mount
    checkSession();

    // Poll on interval
    const interval = setInterval(checkSession, CHECK_INTERVAL);

    // Check on window focus
    function handleFocus() {
      checkSession();
    }
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [pathname, checkSession]);

  return null;
}
