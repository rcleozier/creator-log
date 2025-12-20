'use client';

/**
 * Methodology page providing transparency about data collection, review process,
 * and definitions. Serves as a liability shield by clearly explaining the site's
 * purpose, limitations, and non-verification status.
 */

import { useEffect } from 'react';
import Link from 'next/link';
import { DisclaimerBanner } from '@/app/components/DisclaimerBanner';
import { Footer } from '@/app/components/Footer';
import { Navigation } from '@/app/components/Navigation';

export default function MethodologyPage() {
  useEffect(() => {
    document.title = 'Methodology - Open Creator Log';
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <DisclaimerBanner />
      <Navigation />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8 md:p-12 shadow-sm">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-gray-900">Methodology</h1>

          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            {/* What this site is */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">What This Site Is</h2>
              <p className="leading-relaxed">
                Open Creator Log is a community-maintained database that collects and displays 
                self-reported information about YouTube channel enforcement actions. The site 
                serves as a transparency tool to help creators understand patterns and outcomes 
                in the appeals process.
              </p>
              <p className="leading-relaxed mt-4">
                All data displayed on this site is submitted by community members through a 
                public submission form. The site does not independently verify any claims, 
                and inclusion in the database does not constitute verification or endorsement 
                of any claim.
              </p>
            </div>

            {/* What this site is not */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">What This Site Is Not</h2>
              <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700">
                <li>An official YouTube or Google product or service</li>
                <li>A verification or fact-checking service</li>
                <li>An advocacy organization or legal service</li>
                <li>A platform for making determinations about enforcement actions</li>
                <li>Affiliated with, endorsed by, or connected to YouTube, Google, or Alphabet Inc.</li>
              </ul>
              <p className="leading-relaxed mt-4">
                <strong>YouTube and Google are trademarks of their respective owners. This project is independent.</strong>
              </p>
            </div>

            {/* How submissions are collected */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">How Submissions Are Collected</h2>
              <p className="leading-relaxed">
                Submissions are collected through a public Google Form accessible from the 
                "Submit Your Case" page. Anyone can submit information about a YouTube channel 
                enforcement action. Submissions require:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700 mt-4">
                <li>Channel name and URL</li>
                <li>Termination date</li>
                <li>Reason provided by YouTube (as reported by submitter)</li>
                <li>Appeal status (as reported by submitter)</li>
                <li>Twitter handle for contact</li>
              </ul>
              <p className="leading-relaxed mt-4">
                All information is self-reported by the submitter. We do not contact YouTube 
                or verify information with any official source.
              </p>
            </div>

            {/* Review process */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Review Process</h2>
              <p className="leading-relaxed">
                Before publication, submissions undergo a manual review for:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700 mt-4">
                <li><strong>Plausibility:</strong> Does the submission contain complete and coherent information?</li>
                <li><strong>Completeness:</strong> Are required fields filled out?</li>
                <li><strong>Format:</strong> Is the data in a usable format?</li>
              </ul>
              <p className="leading-relaxed mt-4 font-semibold">
                Cases are reviewed for plausibility and completeness before publication; inclusion 
                does not imply wrongdoing by any platform or verification of claims.
              </p>
              <p className="leading-relaxed mt-4">
                This review process does not verify the accuracy of claims, determine whether 
                enforcement actions were correct, or validate any information with YouTube or 
                other platforms.
              </p>
            </div>

            {/* Definitions */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Definitions</h2>
              <dl className="space-y-4">
                <div>
                  <dt className="font-semibold text-gray-900">Reported</dt>
                  <dd className="text-gray-700 ml-4 mt-1">
                    Information that was submitted by a community member. "Reported" means 
                    user-submitted and not independently verified.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-900">Alleged</dt>
                  <dd className="text-gray-700 ml-4 mt-1">
                    A claim or statement that has been asserted but not proven or verified.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-900">Outcome (Reported)</dt>
                  <dd className="text-gray-700 ml-4 mt-1">
                    The status of a case as reported by the submitter. This may include 
                    "Reinstated," "Terminated," "Appeal Denied," etc. These outcomes are 
                    self-reported and not confirmed by YouTube.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-900">Reason Given (Reported)</dt>
                  <dd className="text-gray-700 ml-4 mt-1">
                    The reason for enforcement action as reported by the submitter. This 
                    is the reason the submitter states YouTube provided, not independently 
                    verified.
                  </dd>
                </div>
              </dl>
            </div>

            {/* Data limitations */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Data Limitations</h2>
              <p className="leading-relaxed">
                Users should be aware of the following limitations:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700 mt-4">
                <li>All data is self-reported and unverified</li>
                <li>Submissions may contain errors, inaccuracies, or incomplete information</li>
                <li>The database may not represent all enforcement actions</li>
                <li>Patterns observed in the data may not reflect actual platform policies</li>
                <li>Case statuses may change after publication without updates to this database</li>
              </ul>
              <p className="leading-relaxed mt-4">
                This site should be used as a reference tool only. Always verify important 
                information through official channels when making decisions about your channel.
              </p>
            </div>

            {/* Corrections policy */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Corrections Policy</h2>
              <p className="leading-relaxed">
                If you believe information about your case is incorrect or wish to request 
                removal, please see our{' '}
                <Link href="/corrections" className="text-blue-600 hover:text-blue-700 underline">
                  Corrections & Removal Requests
                </Link>{' '}
                page for instructions on how to contact us.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

