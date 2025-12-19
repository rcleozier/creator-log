'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DisclaimerBanner } from '@/app/components/DisclaimerBanner';

interface TerminationRow {
  [key: string]: string | undefined;
}

function escapeHtml(text: string | undefined): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function isUrl(str: string | undefined): boolean {
  if (!str) return false;
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return str.startsWith('http://') || str.startsWith('https://') || str.startsWith('www.');
  }
}

function formatUrl(url: string | undefined): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  if (url.startsWith('www.')) {
    return `https://${url}`;
  }
  return url;
}

function getStatusColor(status: string | undefined): string {
  if (!status) return 'bg-gray-100 text-gray-700 border-gray-300';
  
  const statusUpper = status.toUpperCase();
  if (statusUpper.includes('REINSTATED') || statusUpper.includes('ACTIVE')) {
    return 'bg-green-100 text-green-700 border-green-300';
  }
  if (statusUpper.includes('TERMINATED') || statusUpper.includes('BANNED')) {
    return 'bg-red-100 text-red-700 border-red-300';
  }
  if (statusUpper.includes('DEMONETIZED')) {
    return 'bg-orange-100 text-orange-700 border-orange-300';
  }
  if (statusUpper.includes('RESTRICTED')) {
    return 'bg-yellow-100 text-yellow-700 border-yellow-300';
  }
  if (statusUpper.includes('PENDING') || statusUpper.includes('REVIEW')) {
    return 'bg-blue-100 text-blue-700 border-blue-300';
  }
  return 'bg-gray-100 text-gray-700 border-gray-300';
}

interface Case {
  id: string;
  channelName: string;
  channelUrl?: string;
}

export default function TerminationsPage() {
  const [data, setData] = useState<TerminationRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [displayCount, setDisplayCount] = useState(50);

  useEffect(() => {
    async function fetchTerminations() {
      setLoading(true);
      try {
        // Fetch both terminations data and cases data
        const [terminationsResponse, casesResponse] = await Promise.all([
          fetch('/api/terminations'),
          fetch('/api/cases')
        ]);

        if (!terminationsResponse.ok) {
          const errorData = await terminationsResponse.json();
          throw new Error(errorData.error || 'Failed to fetch terminations');
        }

        const result = await terminationsResponse.json();
        
        if (result.error) {
          throw new Error(result.error);
        }

        const rows = result.data || [];
        const cols = result.meta?.columns || (rows.length > 0 ? Object.keys(rows[0]) : []);

        // Fetch cases for linking
        if (casesResponse.ok) {
          const casesData = await casesResponse.json();
          setCases(casesData || []);
        }

        // Define priority columns to show first
        const priorityColumns = [
          'Channel Status',
          'Channel Name',
          'Channel URL',
          'Contact',
          'Twitter Handle',
          'Termination Date',
          'Reason',
        ];

        // Sort columns: priority first, then rest
        // Exclude "Status" column (internal column, not for display) and "Case ID" column
        const sortedColumns = [
          ...priorityColumns.filter(col => cols.some((c: string) => 
            c.toLowerCase() === col.toLowerCase()
          )),
          ...cols.filter((col: string) => 
            col.toLowerCase() !== 'status' && // Exclude Status column
            col.toLowerCase() !== 'case id' && // Exclude Case ID column
            col.toLowerCase() !== 'caseid' && // Exclude Case ID column (alternative)
            col.toLowerCase() !== 'id' && // Exclude ID column
            !priorityColumns.some(pc => 
              pc.toLowerCase() === col.toLowerCase()
            )
          )
        ];

        setColumns(sortedColumns);
        setData(rows);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load terminations');
      } finally {
        setLoading(false);
      }
    }

    fetchTerminations();
  }, []);

  // Filter data based on search and status
  const filteredData = data.filter((row) => {
    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      const channelName = (row['Channel Name'] || '').toLowerCase();
      const contact = (row['Contact'] || '').toLowerCase();
      const channelUrl = (row['Channel URL'] || '').toLowerCase();
      
      if (!channelName.includes(searchLower) && 
          !contact.includes(searchLower) && 
          !channelUrl.includes(searchLower)) {
        return false;
      }
    }

    // Status filter - use Channel Status only (Status is internal column)
    if (statusFilter !== 'ALL') {
      const status = (row['Channel Status'] || '').toUpperCase();
      const filterUpper = statusFilter.toUpperCase();
      if (!status.includes(filterUpper)) {
        return false;
      }
    }

    return true;
  });

  // Get unique status values for filter dropdown - use Channel Status only
  const statusValues = Array.from(
    new Set(
      data
        .map(row => row['Channel Status'] || '')
        .filter(Boolean)
    )
  ).sort();

  const displayedData = filteredData.slice(0, displayCount);
  const hasMore = filteredData.length > displayCount;

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500 mb-4"></div>
          <div className="text-gray-700 text-xl">Loading terminations...</div>
        </div>
      </div>
    );
  }

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
              <Link href="/terminations" className="text-gray-900 font-semibold">
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
      <main className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">Terminations Database</h2>
          <p className="text-gray-400 mb-6">
            Viewing {displayedData.length} of {filteredData.length} cases
            {filteredData.length !== data.length && ` (filtered from ${data.length} total)`}
          </p>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by Channel Name, Contact, or Channel URL..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent shadow-sm"
              />
            </div>

            {statusValues.length > 0 && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent min-w-[200px] shadow-sm"
              >
                <option value="ALL">All Statuses</option>
                {statusValues.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6">
            <div className="text-red-400">{error}</div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  {columns.map((col) => (
                    <th
                      key={col}
                      className="text-left py-4 px-6 text-sm font-semibold text-gray-400 whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayedData.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="py-8 px-6 text-center text-gray-400">
                      No data found. {searchTerm || statusFilter !== 'ALL' ? 'Try adjusting your filters.' : ''}
                    </td>
                  </tr>
                ) : (
                  displayedData.map((row, idx) => {
                    // Find matching case by channel name or URL
                    const channelName = row['Channel Name'] || '';
                    const channelUrl = row['Channel URL'] || '';
                    const matchingCase = cases.find(c => 
                      (c.channelName && channelName && 
                       c.channelName.toLowerCase() === channelName.toLowerCase()) ||
                      (c.channelUrl && channelUrl && 
                       c.channelUrl.toLowerCase() === channelUrl.toLowerCase())
                    );

                    const handleRowClick = matchingCase 
                      ? () => window.location.href = `/case/${matchingCase.id}`
                      : undefined;

                    return (
                      <tr
                        key={idx}
                        onClick={handleRowClick}
                        className={`border-b border-gray-200 transition-colors ${
                          matchingCase 
                            ? 'hover:bg-gray-50 cursor-pointer' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {columns.map((col) => {
                          const value = row[col] || '';
                          const isStatusCol = col.toLowerCase() === 'channel status';
                          const isUrlValue = isUrl(value);

                          return (
                            <td key={col} className="py-4 px-6 text-sm min-w-0">
                              {isStatusCol ? (
                                <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(value)}`}>
                                  {escapeHtml(value)}
                                </span>
                              ) : isUrlValue ? (
                                <a
                                  href={formatUrl(value)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-red-400 hover:text-red-300 break-all"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {escapeHtml(value)}
                                </a>
                              ) : (
                                <span className="text-gray-700 break-words">{escapeHtml(value)}</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setDisplayCount(prev => prev + 50)}
              className="bg-white hover:bg-gray-50 text-gray-900 px-6 py-3 rounded-lg font-semibold transition-colors border border-gray-300 shadow-sm"
            >
              Load More ({filteredData.length - displayCount} remaining)
            </button>
          </div>
        )}

        {!hasMore && displayedData.length > 0 && (
          <div className="mt-6 text-center text-gray-400 text-sm">
            Showing all {displayedData.length} results
          </div>
        )}
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

