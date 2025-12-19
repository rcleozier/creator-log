'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { init, trackEvent } from '@aptabase/web';

export function AptabaseProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    init('A-US-3334805051');
  }, []);

  useEffect(() => {
    if (pathname) {
      // Track page view
      const pageName = pathname === '/' 
        ? 'home' 
        : pathname.startsWith('/case/') 
          ? 'case_detail' 
          : pathname.startsWith('/terminations')
            ? 'terminations'
            : pathname.startsWith('/analytics')
              ? 'analytics'
              : pathname.startsWith('/submit')
                ? 'submit'
                : pathname.startsWith('/about')
                  ? 'about'
                  : pathname.replace('/', '') || 'home';
      
      trackEvent('page_view', {
        path: pathname,
        page: pageName,
      });
    }
  }, [pathname]);

  return <>{children}</>;
}

