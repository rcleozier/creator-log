'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { DisclaimerBanner } from '@/app/components/DisclaimerBanner';
import { Footer } from '@/app/components/Footer';
import { Navigation } from '@/app/components/Navigation';

// Set this to your Google Form URL
const GOOGLE_FORM_URL = process.env.NEXT_PUBLIC_GOOGLE_FORM_URL || 'https://docs.google.com/forms/d/e/1FAIpQLSfoVwmHJyBCKI7ZScANz838kX6c5mthhUdiycbva_9_PIp97w/viewform?usp=dialog';

export default function SubmitPage() {
  useEffect(() => {
    document.title = 'Submit a Case - Open Creator Log';
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <DisclaimerBanner />
      <Navigation />

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8 md:p-12 shadow-sm">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-gray-900">Submit a Case</h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-6 sm:mb-8">
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

      <Footer />
    </div>
  );
}

