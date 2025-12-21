'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { YouTubeCase, CaseStats } from '@/types/case';
import { GOOGLE_FORM_URL } from '@/app/constants';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { Footer } from './components/Footer';
import { Navigation } from './components/Navigation';

function escapeHtml(text: string | undefined): string {
  if (!text) return '';
  // First decode any existing HTML entities to prevent double-escaping
  const decoded = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'");
  // Then escape for safe display
  return decoded
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getStatusColor(status: YouTubeCase['status']): string {
  switch (status) {
    case 'REINSTATED':
      return 'bg-green-100 text-green-700 border-green-300';
    case 'TERMINATED':
      return 'bg-red-100 text-red-700 border-red-300';
    case 'DEMONETIZED':
      return 'bg-orange-100 text-orange-700 border-orange-300';
    case 'AGE_RESTRICTED':
      return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    case 'STRUCK':
      return 'bg-purple-100 text-purple-700 border-purple-300';
    case 'UNDER_REVIEW':
      return 'bg-blue-100 text-blue-700 border-blue-300';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
  }
}

function getStatusLabel(status: YouTubeCase['status']): string {
  return status.replace(/_/g, ' ');
}

function getAppealStatusColor(status: YouTubeCase['appealStatus']): string {
  switch (status) {
    case 'OVERTURNED':
      return 'text-green-600';
    case 'DENIED':
    case 'FINAL_DENIED':
      return 'text-red-600';
    case 'UNDER_REVIEW':
      return 'text-blue-600';
    case 'PENDING':
      return 'text-yellow-600';
    default:
      return 'text-gray-600';
  }
}

function getAppealStatusLabel(status: YouTubeCase['appealStatus']): string {
  switch (status) {
    case 'OVERTURNED':
      return 'Overturned on appeal';
    case 'DENIED':
      return 'Appeal denied';
    case 'FINAL_DENIED':
      return 'Final appeal denied';
    case 'REJECTED':
      return 'Appeal rejected';
    case 'UNDER_REVIEW':
      return 'Under review';
    case 'PENDING':
      return 'Pending review';
    default:
      return String(status).replace(/_/g, ' ');
  }
}

export default function Home() {
  const [cases, setCases] = useState<YouTubeCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [stats, setStats] = useState<CaseStats>({
    totalCases: 0,
    reinstated: 0,
    terminated: 0,
    underReview: 0,
  });

  useEffect(() => {
    document.title = 'Open Creator Log - YouTube Channel Appeal Tracker';
  }, []);

  useEffect(() => {
    async function fetchCases() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (statusFilter !== 'ALL') {
          params.set('status', statusFilter);
        }
        if (searchTerm.trim()) {
          params.set('search', searchTerm.trim());
        }

        const response = await fetch(`/api/cases?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch cases');
        const data = await response.json();
        setCases(data);
      } catch (err) {
        setError('Failed to load cases. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchCases();
  }, [statusFilter, searchTerm]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/cases');
        if (!response.ok) return;
        const allCases = await response.json();
        
        const reinstated = allCases.filter((c: YouTubeCase) => c.status === 'REINSTATED').length;
        const terminated = allCases.filter((c: YouTubeCase) => c.status === 'TERMINATED').length;
        const underReview = allCases.filter((c: YouTubeCase) => 
          c.appealStatus === 'UNDER_REVIEW' || c.appealStatus === 'PENDING'
        ).length;

        setStats({
          totalCases: allCases.length,
          reinstated,
          terminated,
          underReview,
        });
      } catch (err) {
        // Silently fail
      }
    }

    fetchStats();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by useEffect
  };

  if (loading && cases.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <div className="text-gray-700 text-xl">Loading cases...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <DisclaimerBanner />
      <Navigation />

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Hero Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 text-gray-900">Track YouTube Channel Appeals</h2>
          <p className="text-lg sm:text-xl text-gray-600 mb-2">Transparency and Data for Creators</p>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-3xl">
            Collecting and analyzing YouTube enforcement appeals to bring clarity and accountability 
            to creators with demonetized, age-restricted, struck, or terminated channels.
          </p>
          
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-6">
            <a
              href={GOOGLE_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg font-semibold transition-colors text-center text-sm sm:text-base"
            >
              Submit Your Case
            </a>
            <Link 
              href="/terminations"
              className="bg-white hover:bg-gray-50 text-gray-900 px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg font-semibold transition-colors border border-gray-300 shadow-sm text-center text-sm sm:text-base"
            >
              View Case Browser
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm">
            <div className="text-gray-600 text-xs sm:text-sm mb-1 sm:mb-2">Total Cases</div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalCases}</div>
          </div>
          <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm">
            <div className="text-gray-600 text-xs sm:text-sm mb-1 sm:mb-2">Reinstated</div>
            <div className="text-2xl sm:text-3xl font-bold text-green-600">{stats.reinstated}</div>
          </div>
          <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm">
            <div className="text-gray-600 text-xs sm:text-sm mb-1 sm:mb-2">Terminated</div>
            <div className="text-2xl sm:text-3xl font-bold text-red-600">{stats.terminated}</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6" id="cases">
          <form onSubmit={handleSearch} className="relative w-full max-w-lg mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search cases by channel name, reason, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-12 py-2.5 sm:py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent shadow-sm text-sm sm:text-base"
            />
          </form>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm ${
                statusFilter === 'ALL'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 shadow-sm'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('TERMINATED')}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm ${
                statusFilter === 'TERMINATED'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 shadow-sm'
              }`}
            >
              Terminated
            </button>
            <button
              onClick={() => setStatusFilter('REINSTATED')}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm ${
                statusFilter === 'REINSTATED'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 shadow-sm'
              }`}
            >
              Reinstated
            </button>
            <button
              onClick={() => setStatusFilter('DEMONETIZED')}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm ${
                statusFilter === 'DEMONETIZED'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 shadow-sm'
              }`}
            >
              Demonetized
            </button>
            <button
              onClick={() => setStatusFilter('UNDER_REVIEW')}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm ${
                statusFilter === 'UNDER_REVIEW'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 shadow-sm'
              }`}
            >
              Under Review
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6">
            <div className="text-red-400">{error}</div>
          </div>
        )}

        {/* Cases List */}
        <div className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm">
          {cases.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              {loading ? 'Loading cases...' : 'No cases found. Try adjusting your filters.'}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {cases.map((caseItem) => (
                <Link
                  key={caseItem.id}
                  href={`/case/${caseItem.id}`}
                  className="block hover:bg-gray-50 transition-colors p-4 sm:p-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                        <h3 className="text-lg sm:text-xl font-bold truncate text-gray-900">{escapeHtml(caseItem.channelName)}</h3>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(caseItem.status)} self-start sm:self-center`}>
                          {getStatusLabel(caseItem.status)}
                        </span>
                      </div>
                      <p className="text-sm sm:text-base text-gray-600 mb-2">
                        <span className="font-semibold">Reason given (reported):</span> {escapeHtml(caseItem.reason)}
                      </p>
                      {caseItem.description && (
                        <p className="text-gray-500 text-xs sm:text-sm line-clamp-2">{escapeHtml(caseItem.description)}</p>
                      )}
                    </div>
                    <div className="flex flex-row sm:flex-col items-start sm:items-end gap-2 flex-shrink-0">
                      <div className={`text-xs sm:text-sm font-medium ${getAppealStatusColor(caseItem.appealStatus)}`}>
                        Appeal outcome (reported): {getAppealStatusLabel(caseItem.appealStatus)}
                      </div>
                      {caseItem.subscriberCount && (
                        <div className="text-xs text-gray-500">
                          {caseItem.subscriberCount.toLocaleString()} subscribers
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
