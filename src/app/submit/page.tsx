'use client';

import Link from 'next/link';
import { DisclaimerBanner } from '@/app/components/DisclaimerBanner';

// Set this to your Google Form URL
const GOOGLE_FORM_URL = process.env.NEXT_PUBLIC_GOOGLE_FORM_URL || 'https://docs.google.com/forms/d/e/1FAIpQLSfoVwmHJyBCKI7ZScANz838kX6c5mthhUdiycbva_9_PIp97w/viewform?usp=dialog';

export default function SubmitPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <DisclaimerBanner />

      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center font-bold text-sm text-white">
                ▶
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Creator Visibility Log</h1>
            </div>
            <nav className="flex items-center gap-4 flex-wrap">
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                Home
              </Link>
              <Link href="/terminations" className="text-gray-600 hover:text-gray-900 transition-colors">
                Terminations
              </Link>
              <Link href="/analytics" className="text-gray-600 hover:text-gray-900 transition-colors">
                Analytics
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">
                About
              </Link>
              <Link 
                href="/submit"
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                Submit Your Case
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg border border-gray-200 p-8 md:p-12 shadow-sm">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Submit a Case</h1>
          <p className="text-gray-600 mb-8 text-lg">
            Help us track YouTube channel appeals and enforcement actions. Your submission helps bring 
            transparency to the creator community.
          </p>

          <div className="space-y-6 mb-8">
            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900">What We Track</h2>
              <p className="text-gray-700 mb-3">
                We document YouTube channel terminations to raise awareness of false or unresolved bans. 
                This helps bring transparency and accountability to the creator community.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900">Required Information</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>Twitter Handle</strong> - Your Twitter/X handle (required)</li>
                <li><strong>Channel Name</strong> - Your YouTube channel name (required)</li>
                <li><strong>Channel URL</strong> - Full YouTube channel URL (required)</li>
                <li><strong>Channel Termination Date</strong> - Date in MM/DD/YYYY format (required)</li>
                <li><strong>Content Type</strong> - What type of content you create (required)</li>
                <li><strong>Approx. Subs</strong> - Approximate subscriber count (required)</li>
                <li><strong>Appeal Status</strong> - Select from: Pending or Rejected (required)</li>
                <li><strong>Reason Given</strong> - The reason YouTube provided for termination (required)</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-yellow-700">Note:</span> Low quality submissions 
                may not be included. Please provide a detailed explanation of why the termination is wrongful.
              </p>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-sm text-gray-300">
                <span className="font-semibold text-blue-400">Note:</span> All submissions are 
                community-reported and will be reviewed before being added to the tracker. We do not 
                verify claims with YouTube or any official source.
              </p>
            </div>
          </div>

          <a
            href={GOOGLE_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-lg font-semibold text-center transition-colors text-lg"
          >
            Open Submission Form →
          </a>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Privacy & Transparency</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              By submitting a case, you understand that the information you provide will be publicly 
              displayed on this tracker. We will not publish personal contact information, but channel 
              names and URLs will be visible. All submissions are subject to review and may be edited 
              or removed at our discretion.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link 
            href="/"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Return to case browser
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-20 py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-gray-600 text-sm space-y-2">
            <p>Tracking YouTube channel appeals and enforcement actions for transparency</p>
            <p className="text-xs text-gray-500 mt-4">
              Community-reported claims; not verified by YouTube or any official source
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

