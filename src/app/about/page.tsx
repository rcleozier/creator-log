'use client';

import Link from 'next/link';
import { DisclaimerBanner } from '@/app/components/DisclaimerBanner';

export default function AboutPage() {
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
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg border border-gray-200 p-8 md:p-12 shadow-sm">
          <h1 className="text-4xl font-bold mb-6 text-gray-900">About This Tracker</h1>

          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Purpose</h2>
              <p className="leading-relaxed mb-4">
                To help YouTube identify and assist potentially misclassified terminations. This is a collaborative 
                log to make that process easier for everyone. It is community-maintained, and the information is 
                community-reported and may not be verified.
              </p>
              <p className="leading-relaxed">
                This tracker documents cases of YouTube channel terminations, demonetizations, age restrictions, 
                and strikes. By collecting and analyzing community-reported 
                data, we aim to help creators understand patterns, outcomes, and timelines in the appeals process.
              </p>
              <p className="leading-relaxed mt-4 text-sm text-gray-600">
                Please comment with updates or corrections if you have additional information about any case.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Scope</h2>
              <p className="leading-relaxed mb-4">
                This tracker tracks the following types of cases:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700">
                <li>Channel terminations and appeals</li>
                <li>Demonetization cases</li>
                <li>Age-restricted content actions</li>
                <li>Strikes and their outcomes</li>
                <li>Appeal timelines and results</li>
                <li>Reinstatement cases</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Data Collection</h2>
              <p className="leading-relaxed">
                All data is collected through community submissions via Google Forms. Cases are submitted by 
                creators or community members who have direct knowledge of the enforcement action. We do not 
                verify claims with YouTube or any official source—all information is community-reported.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">About the Project</h2>
              <p className="leading-relaxed">
                This tracker is maintained by <strong>@RobsManifesto</strong> on Twitter/X. The goal is to keep a comprehensive record of these cases to help the creator 
                community understand enforcement patterns and appeal outcomes.
              </p>
              <p className="mt-4 leading-relaxed">
                This project is community-maintained with contributions from affected creators. We welcome 
                updates, corrections, and additional information about any case.
              </p>
              <p className="mt-4">
                <a
                  href="https://twitter.com/RobsManifesto"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1"
                >
                  Follow @RobsManifesto on Twitter →
                </a>
              </p>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 my-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Important Disclaimer</h2>
              <p className="leading-relaxed">
                This tracker compiles self-reported claims from creators who believe their terminations were mistaken. 
                Every effort has been made to review and filter submissions for plausibility, but due to the volume 
                and complexity of cases, we cannot guarantee the veracity of all submissions.
              </p>
              <p className="mt-4 leading-relaxed">
                This tracker displays community-reported claims that have <strong>not been verified</strong> by 
                YouTube or any official source. The information presented here is for transparency and 
                informational purposes only. This is not an official YouTube resource, and we are not 
                affiliated with YouTube or Google.
              </p>
              <p className="mt-4 leading-relaxed">
                Use this information as a reference tool, but always verify important details through official 
                channels when making decisions about your channel.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">How to Contribute</h2>
              <p className="leading-relaxed mb-4">
                If you have a case to report, please use our submission form. We're looking for:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700">
                <li>Accurate information about the enforcement action</li>
                <li>Timeline details (when it happened, appeal status)</li>
                <li>Reason provided by YouTube</li>
              </ul>
              <div className="mt-6">
                <Link
                  href="/submit"
                  className="inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Submit a Case
                </Link>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-8 mt-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Contact</h2>
              <p className="leading-relaxed">
                For questions, corrections, or to report issues with the tracker, please reach out on Twitter:
              </p>
              <p className="mt-4">
                <a
                  href="https://twitter.com/RobsManifesto"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  @RobsManifesto
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

