'use client';

/**
 * Corrections and takedown policy page for handling data correction and removal requests.
 * Provides clear process for users to request changes or removal of their information,
 * reducing liability and ensuring compliance with data protection expectations.
 */

import { useEffect } from 'react';
import Link from 'next/link';
import { DisclaimerBanner } from '@/app/components/DisclaimerBanner';
import { Footer } from '@/app/components/Footer';
import { Navigation } from '@/app/components/Navigation';

export default function CorrectionsPage() {
  useEffect(() => {
    document.title = 'Corrections & Removal Requests - Open Creator Log';
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <DisclaimerBanner />
      <Navigation />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8 md:p-12 shadow-sm">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-gray-900">
            Corrections & Removal Requests
          </h1>

          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-8">
              <h2 className="text-xl font-bold mb-4 text-gray-900">How to Request Corrections</h2>
              <p className="leading-relaxed mb-4">
                If you believe information about your case is incorrect, incomplete, or outdated, 
                you can request a correction. To request a correction:
              </p>
              <ol className="list-decimal list-inside space-y-2 ml-4 text-gray-700">
                <li>Contact us on Twitter at{' '}
                  <a
                    href="https://twitter.com/RobsManifesto"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    @RobsManifesto
                  </a>
                </li>
                <li>Provide the case ID or channel name</li>
                <li>Specify what information is incorrect</li>
                <li>Provide the correct information (if applicable)</li>
              </ol>
              <p className="leading-relaxed mt-4">
                We will review your request and update the information if appropriate. Please 
                note that we may ask for verification to ensure the request is legitimate.
              </p>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 my-8">
              <h2 className="text-xl font-bold mb-4 text-gray-900">How to Request Removal</h2>
              <p className="leading-relaxed mb-4">
                If you wish to have your case removed from the database entirely, you can request 
                removal. To request removal:
              </p>
              <ol className="list-decimal list-inside space-y-2 ml-4 text-gray-700">
                <li>Contact us on Twitter at{' '}
                  <a
                    href="https://twitter.com/RobsManifesto"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    @RobsManifesto
                  </a>
                </li>
                <li>Provide the case ID or channel name</li>
                <li>State that you wish to have the case removed</li>
                <li>We may ask for verification to confirm you are the channel owner</li>
              </ol>
              <p className="leading-relaxed mt-4">
                Removal requests will be processed promptly. Once removed, the case will no longer 
                appear in public listings, though historical data may remain in backups for a 
                limited period.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Response Time</h2>
              <p className="leading-relaxed">
                We aim to respond to correction and removal requests within 7 business days. 
                Please be patient as this is a community-maintained project and responses may 
                take time.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Verification</h2>
              <p className="leading-relaxed">
                To protect against fraudulent requests, we may ask for verification that you 
                are the channel owner or authorized representative. This may include:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700 mt-4">
                <li>Verification via the channel's official Twitter account</li>
                <li>Confirmation of channel ownership through other means</li>
                <li>Additional information to verify your identity</li>
              </ul>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-8">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Contact</h2>
              <p className="leading-relaxed mb-4">
                All correction and removal requests should be directed to:
              </p>
              <p className="text-lg">
                <a
                  href="https://twitter.com/RobsManifesto"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-2"
                >
                  @RobsManifesto on Twitter
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link 
            href="/"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

