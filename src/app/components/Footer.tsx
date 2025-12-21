'use client';

import Link from 'next/link';

/**
 * Site-wide footer component with required disclaimers and legal links.
 * Ensures consistent footer messaging across all pages for liability protection.
 */
export function Footer() {
  return (
    <footer className="border-t border-gray-200 mt-20 py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="text-gray-600 text-sm space-y-2">
          <p>Tracking YouTube channel appeals and enforcement actions for transparency</p>
          <p className="text-xs text-gray-500 mt-4">
            Community-reported claims; not verified by YouTube or any official source
          </p>
          <p className="text-xs text-gray-500 mt-2 font-semibold">
            Not affiliated with YouTube or Google.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-gray-500">
            <Link href="/corrections" className="hover:text-gray-700 underline">
              Corrections & Removal Requests
            </Link>
            <Link href="/methodology" className="hover:text-gray-700 underline">
              Methodology
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}


