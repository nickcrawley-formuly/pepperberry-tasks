'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function NavigationProgress() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const prevPathname = useRef(pathname);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (pathname !== prevPathname.current) {
      // Navigation completed — hide everything
      setLoading(false);
      prevPathname.current = pathname;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
  }, [pathname]);

  // Intercept link clicks to show progress
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('tel:') || href.startsWith('#')) return;
      if (href === pathname) return;

      // Show immediately — no delay on mobile
      timeoutRef.current = setTimeout(() => setLoading(true), 30);
    }

    document.addEventListener('click', handleClick, true);
    return () => {
      document.removeEventListener('click', handleClick, true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [pathname]);

  if (!loading) return null;

  return (
    <>
      {/* Top progress bar — instant visual feedback */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-0.5 bg-fw-accent/20">
        <div className="h-full bg-fw-accent animate-progress-bar" />
      </div>
      {/* Full overlay spinner after a moment */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-fw-bg/60 backdrop-blur-sm animate-fade-in">
        <svg
          className="w-10 h-10 animate-spin text-fw-accent"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      </div>
    </>
  );
}
