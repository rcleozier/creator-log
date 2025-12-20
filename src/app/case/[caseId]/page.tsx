'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { YouTubeCase } from '@/types/case';
import { DisclaimerBanner } from '@/app/components/DisclaimerBanner';
import { ShareButtons } from '@/app/components/ShareButtons';
import { Footer } from '@/app/components/Footer';
import { Navigation } from '@/app/components/Navigation';

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

function isUrl(str: string): boolean {
  if (!str) return false;
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return str.startsWith('http://') || str.startsWith('https://') || str.startsWith('www.');
  }
}

function formatUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  if (url.startsWith('www.')) {
    return `https://${url}`;
  }
  return `https://${url}`;
}

/**
 * Converts plain text with URLs into React elements with clickable links
 * Preserves line breaks and paragraph structure
 */
function formatTextWithUrls(text: string): React.ReactNode[] {
  if (!text) return [];
  
  // Split by double line breaks for paragraphs, but preserve single line breaks
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim());
  
  return paragraphs.map((paragraph, paraIdx) => {
    // Improved URL regex to catch URLs more reliably
    // Matches http://, https://, or www. followed by valid URL characters
    const urlRegex = /(https?:\/\/[^\s\)]+|www\.[^\s\)]+)/gi;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;
    const matches: Array<{ index: number; url: string }> = [];
    
    // Collect all URL matches first
    while ((match = urlRegex.exec(paragraph)) !== null) {
      matches.push({ index: match.index, url: match[0] });
    }
    
    // Process each URL match
    matches.forEach((urlMatch, urlIdx) => {
      // Add text before URL
      if (urlMatch.index > lastIndex) {
        const textBefore = paragraph.substring(lastIndex, urlMatch.index);
        if (textBefore.trim()) {
          // Preserve single line breaks within paragraphs
          const lines = textBefore.split('\n');
          lines.forEach((line, lineIdx) => {
            if (line.trim()) {
              parts.push(
                <span key={`text-${paraIdx}-${lastIndex}-${lineIdx}`}>
                  {escapeHtml(line)}
                </span>
              );
            }
            if (lineIdx < lines.length - 1) {
              parts.push(<br key={`br-${paraIdx}-${lastIndex}-${lineIdx}`} />);
            }
          });
        }
      }
      
      // Add clickable URL
      const formattedUrl = formatUrl(urlMatch.url);
      parts.push(
        <a
          key={`url-${paraIdx}-${urlMatch.index}`}
          href={formattedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline break-all"
        >
          {escapeHtml(urlMatch.url)}
        </a>
      );
      
      lastIndex = urlMatch.index + urlMatch.url.length;
    });
    
    // Add remaining text after last URL
    if (lastIndex < paragraph.length) {
      const textAfter = paragraph.substring(lastIndex);
      if (textAfter.trim()) {
        // Preserve single line breaks
        const lines = textAfter.split('\n');
        lines.forEach((line, lineIdx) => {
          if (line.trim()) {
            parts.push(
              <span key={`text-${paraIdx}-${lastIndex}-${lineIdx}`}>
                {escapeHtml(line)}
              </span>
            );
          }
          if (lineIdx < lines.length - 1) {
            parts.push(<br key={`br-${paraIdx}-${lastIndex}-${lineIdx}`} />);
          }
        });
      }
    }
    
    // If no URLs found, just return the escaped text with preserved line breaks
    if (parts.length === 0) {
      const lines = paragraph.split('\n');
      lines.forEach((line, lineIdx) => {
        if (line.trim()) {
          parts.push(
            <span key={`text-${paraIdx}-${lineIdx}`}>
              {escapeHtml(line)}
            </span>
          );
        }
        if (lineIdx < lines.length - 1) {
          parts.push(<br key={`br-${paraIdx}-${lineIdx}`} />);
        }
      });
    }
    
    return (
      <p key={`para-${paraIdx}`} className="mb-4 last:mb-0">
        {parts}
      </p>
    );
  });
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
    case 'REJECTED':
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

function calculateDaysTerminated(terminationDate: string | undefined): number | null {
  if (!terminationDate) return null;
  
  try {
    let date: Date;
    // Handle MM/DD/YYYY format
    if (terminationDate.includes('/')) {
      const [month, day, year] = terminationDate.split('/').map(Number);
      date = new Date(year, month - 1, day);
    } else {
      date = new Date(terminationDate);
    }
    
    if (isNaN(date.getTime())) return null;
    
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= 0 ? diffDays : null;
  } catch {
    return null;
  }
}

function formatDaysTerminated(days: number): string {
  if (days < 30) {
    return `${days} day${days !== 1 ? 's' : ''}`;
  } else if (days < 365) {
    const months = Math.floor(days / 30);
    const remainingDays = days % 30;
    if (remainingDays === 0) {
      return `${months} month${months !== 1 ? 's' : ''}`;
    }
    return `${months} month${months !== 1 ? 's' : ''} ${remainingDays} day${remainingDays !== 1 ? 's' : ''}`;
  } else {
    const years = Math.floor(days / 365);
    const remainingMonths = Math.floor((days % 365) / 30);
    if (remainingMonths === 0) {
      return `${years} year${years !== 1 ? 's' : ''}`;
    }
    return `${years} year${years !== 1 ? 's' : ''} ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
  }
}

export default function CasePage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.caseId as string;
  
  const [caseData, setCaseData] = useState<YouTubeCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Case Details - Open Creator Log';
  }, []);

  useEffect(() => {
    if (caseData) {
      document.title = `${caseData.channelName} - Open Creator Log`;
    }
  }, [caseData]);

  useEffect(() => {
    async function fetchCase() {
      try {
        const response = await fetch(`/api/cases/${caseId}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('Case not found');
            return;
          }
          throw new Error('Failed to fetch case');
        }
        const data = await response.json();
        setCaseData(data);
      } catch (err) {
        setError('Failed to load case. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    if (caseId) {
      fetchCase();
    }
  }, [caseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500 mb-4"></div>
          <div className="text-gray-700 text-xl">Loading case...</div>
        </div>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
          <div className="text-red-600 text-xl mb-4">{error || 'Case not found'}</div>
          <Link href="/" className="inline-block text-red-600 hover:text-red-700">
            ← Back to cases
          </Link>
        </div>
      </div>
    );
  }

  const daysTerminated = calculateDaysTerminated(caseData.terminationDate);
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = `${caseData.channelName} - Open Creator Log`;
  const shareDescription = caseData.description 
    ? `${caseData.description.substring(0, 150)}...`
    : `Channel status: ${caseData.status}. ${caseData.reason} | opencreatorlog.com`;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <DisclaimerBanner />
      <Navigation />

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Hero Section - Creator Story Focus */}
        <div className="bg-gradient-to-br from-red-50 via-white to-blue-50 rounded-xl sm:rounded-2xl border-2 border-gray-200 p-4 sm:p-6 md:p-8 lg:p-12 mb-6 sm:mb-8 shadow-lg">
          <div className="max-w-4xl">
            {/* Creator Name & Status */}
            <div className="mb-4 sm:mb-6">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-gray-900 leading-tight">
                {escapeHtml(caseData.channelName)}
              </h1>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <span className={`px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl text-sm sm:text-base font-bold border-2 ${getStatusColor(caseData.status)} shadow-sm`}>
                  {getStatusLabel(caseData.status)}
                  {daysTerminated !== null && caseData.status === 'TERMINATED' && (
                    <span className="ml-2 text-xs sm:text-sm font-normal">
                      ({formatDaysTerminated(daysTerminated)})
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Prominent Creator Links */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-4 sm:mb-6">
              {caseData.channelUrl && (
                <a
                  href={caseData.channelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg sm:rounded-xl font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <span>Visit YouTube Channel</span>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              )}
              {caseData.twitterHandle && caseData.twitterHandle.trim() !== '' && (
                <a
                  href={`https://twitter.com/${caseData.twitterHandle.replace('@', '').trim()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white rounded-lg sm:rounded-xl font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span className="hidden sm:inline">View @{caseData.twitterHandle.replace('@', '').trim()} on Twitter</span>
                  <span className="sm:hidden">View on Twitter</span>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              )}
            </div>

            {/* Share Section */}
            <div className="pt-6 border-t border-gray-200">
              <ShareButtons url={shareUrl} title={shareTitle} description={shareDescription} />
            </div>
          </div>
        </div>

        {/* Case Details Grid - More Visual */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg sm:rounded-xl border-2 border-red-200 p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-gray-600 text-xs sm:text-sm font-semibold uppercase tracking-wide">Reason Given (Reported)</h3>
            </div>
            <p className="text-lg sm:text-xl font-bold text-gray-900">{escapeHtml(caseData.reason)}</p>
          </div>

          {caseData.subscriberCount && (
            <div className="bg-white rounded-lg sm:rounded-xl border-2 border-gray-200 p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-gray-600 text-xs sm:text-sm font-semibold uppercase tracking-wide">Subscribers</h3>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{caseData.subscriberCount.toLocaleString()}</p>
            </div>
          )}

          {(caseData.category || caseData.niche) && (
            <div className="bg-white rounded-lg sm:rounded-xl border-2 border-gray-200 p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <h3 className="text-gray-600 text-xs sm:text-sm font-semibold uppercase tracking-wide">Content Type</h3>
              </div>
              <p className="text-lg sm:text-xl font-bold text-gray-900">{escapeHtml(caseData.niche || caseData.category)}</p>
            </div>
          )}

          {caseData.terminationDate && (
            <div className="bg-white rounded-lg sm:rounded-xl border-2 border-gray-200 p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-gray-600 text-xs sm:text-sm font-semibold uppercase tracking-wide">Termination Date</h3>
              </div>
              <p className="text-base sm:text-lg font-bold text-gray-900 mb-1 sm:mb-2">
                {caseData.terminationDate.includes('/') 
                  ? caseData.terminationDate
                  : new Date(caseData.terminationDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                }
              </p>
              {daysTerminated !== null && (
                <p className="text-sm text-red-600 font-semibold">
                  {daysTerminated === 0 ? 'Today' : `${formatDaysTerminated(daysTerminated)} ago`}
                </p>
              )}
            </div>
          )}

          {caseData.monetized !== undefined && (
            <div className="bg-white rounded-lg sm:rounded-xl border-2 border-gray-200 p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${
                  (typeof caseData.monetized === 'boolean' && caseData.monetized) || 
                  (typeof caseData.monetized === 'string' && caseData.monetized.toLowerCase().includes('yes'))
                    ? 'bg-green-100' 
                    : 'bg-gray-100'
                }`}>
                  <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${
                    (typeof caseData.monetized === 'boolean' && caseData.monetized) || 
                    (typeof caseData.monetized === 'string' && caseData.monetized.toLowerCase().includes('yes'))
                      ? 'text-green-600' 
                      : 'text-gray-600'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-gray-600 text-xs sm:text-sm font-semibold uppercase tracking-wide">Monetized</h3>
              </div>
              <p className={`text-lg sm:text-xl font-bold ${
                (typeof caseData.monetized === 'boolean' && caseData.monetized) || 
                (typeof caseData.monetized === 'string' && caseData.monetized.toLowerCase().includes('yes'))
                  ? 'text-green-600' 
                  : 'text-gray-600'
              }`}>
                {typeof caseData.monetized === 'boolean' 
                  ? (caseData.monetized ? 'Yes' : 'No')
                  : escapeHtml(String(caseData.monetized))
                }
              </p>
            </div>
          )}

          <div className="bg-white rounded-lg sm:rounded-xl border-2 border-gray-200 p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-gray-600 text-xs sm:text-sm font-semibold uppercase tracking-wide">Submitted Date</h3>
            </div>
            <p className="text-lg sm:text-xl font-bold text-gray-900">
              {new Date(caseData.submittedDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          {caseData.lastUpdated && (
            <div className="bg-white rounded-lg sm:rounded-xl border-2 border-gray-200 p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h3 className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Last Updated</h3>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {new Date(caseData.lastUpdated).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          )}
        </div>

        {/* Creator's Story - Highlighted */}
        {caseData.description && (
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6 sm:p-8 md:p-10 mb-8 shadow-lg">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md">
                ✍️
              </div>
              <div className="flex-1">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900">Creator Statement (Reported)</h2>
                <p className="text-gray-600 text-sm">In their own words</p>
              </div>
            </div>
            <div className="prose prose-lg max-w-none">
              <div className="text-gray-800 leading-relaxed text-base sm:text-lg bg-gray-50 p-6 rounded-lg border-l-4 border-red-500">
                {formatTextWithUrls(caseData.description)}
              </div>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <div className="flex gap-2 sm:gap-3">
            <div className="text-xl sm:text-2xl flex-shrink-0">⚠️</div>
            <div className="min-w-0">
              <h4 className="font-semibold text-yellow-700 mb-1 text-sm sm:text-base">Disclaimer</h4>
              <p className="text-xs sm:text-sm text-gray-700 mb-2">
                This is a community-submitted record. Treat as unverified unless stated otherwise.
              </p>
              <p className="text-xs sm:text-sm text-gray-700">
                This case information is community-reported and has not been verified by YouTube or any official source. 
                The information presented here is for transparency and informational purposes only.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

