'use client';

/**
 * Shared navigation component for consistent navigation across all pages.
 * Ensures all pages have the same navigation structure including Methodology and Corrections links.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(path);
  };

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between flex-wrap gap-3 sm:gap-4">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-red-600 rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm text-white">
              ▶
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Open Creator Log</h1>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4 flex-wrap text-sm sm:text-base">
            <Link 
              href="/" 
              className={isActive('/') && pathname === '/' 
                ? "text-gray-900 font-semibold" 
                : "text-gray-600 hover:text-gray-900 transition-colors"
              }
            >
              Home
            </Link>
            <Link 
              href="/terminations" 
              className={isActive('/terminations') 
                ? "text-gray-900 font-semibold" 
                : "text-gray-600 hover:text-gray-900 transition-colors"
              }
            >
              Terminations
            </Link>
            <Link 
              href="/analytics" 
              className={isActive('/analytics') 
                ? "text-gray-900 font-semibold" 
                : "text-gray-600 hover:text-gray-900 transition-colors"
              }
            >
              Analytics
            </Link>
            <Link 
              href="/about" 
              className={isActive('/about') 
                ? "text-gray-900 font-semibold" 
                : "text-gray-600 hover:text-gray-900 transition-colors"
              }
            >
              About
            </Link>
            <Link 
              href="/methodology" 
              className={isActive('/methodology') 
                ? "text-gray-900 font-semibold" 
                : "text-gray-600 hover:text-gray-900 transition-colors"
              }
            >
              Methodology
            </Link>
            <Link 
              href="/submit"
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-semibold transition-colors text-sm sm:text-base"
            >
              Submit Your Case
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

