'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DisclaimerBanner } from '@/app/components/DisclaimerBanner';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { YouTubeCase } from '@/types/case';

const COLORS = {
  blue: '#3B82F6',
  green: '#10B981',
  red: '#EF4444',
  orange: '#F59E0B',
  yellow: '#EAB308',
  purple: '#8B5CF6',
  gray: '#6B7280',
};

export default function AnalyticsPage() {
  const [cases, setCases] = useState<YouTubeCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Analytics & Insights - Open Creator Log';
  }, []);

  useEffect(() => {
    async function fetchCases() {
      setLoading(true);
      try {
        const response = await fetch('/api/cases');
        if (!response.ok) throw new Error('Failed to fetch cases');
        const data = await response.json();
        setCases(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    fetchCases();
  }, []);

  // Calculate chart data
  const appealStatusData = cases.reduce((acc, c) => {
    const status = c.appealStatus || 'UNKNOWN';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const appealStatusChart = Object.entries(appealStatusData).map(([name, value]) => ({
    name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value,
  }));

  const channelStatusData = cases.reduce((acc, c) => {
    const status = c.status || 'UNKNOWN';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const channelStatusChart = Object.entries(channelStatusData).map(([name, value]) => ({
    name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value,
  }));

  // Termination reasons breakdown
  const reasonsData = cases.reduce((acc, c) => {
    const reason = c.reason || 'Unknown';
    acc[reason] = (acc[reason] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const reasonsChart = Object.entries(reasonsData)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10); // Top 10 reasons


  // Reinstatement rate by reason
  const reinstatementByReason = cases.reduce((acc, c) => {
    const reason = c.reason || 'Unknown';
    if (!acc[reason]) {
      acc[reason] = { total: 0, reinstated: 0 };
    }
    acc[reason].total++;
    if (c.status === 'REINSTATED') {
      acc[reason].reinstated++;
    }
    return acc;
  }, {} as Record<string, { total: number; reinstated: number }>);

  const reinstatementRateChart = Object.entries(reinstatementByReason)
    .filter(([, data]) => data.total >= 3) // Only show reasons with 3+ cases
    .map(([name, data]) => ({
      name: name.length > 30 ? name.substring(0, 30) + '...' : name,
      rate: data.total > 0 ? (data.reinstated / data.total) * 100 : 0,
      total: data.total,
    }))
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 8);

  // Appeal outcome timeline (cases resolved over time)
  const resolvedCases = cases.filter(c => 
    c.appealStatus === 'OVERTURNED' || 
    c.appealStatus === 'DENIED' || 
    c.appealStatus === 'FINAL_DENIED' ||
    c.appealStatus === 'REJECTED'
  );

  const outcomeTimeline = resolvedCases.reduce((acc, c) => {
    const date = c.lastUpdated || c.submittedDate;
    const month = new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    if (!acc[month]) {
      acc[month] = { overturned: 0, denied: 0 };
    }
    if (c.appealStatus === 'OVERTURNED' || c.status === 'REINSTATED') {
      acc[month].overturned++;
    } else {
      acc[month].denied++;
    }
    return acc;
  }, {} as Record<string, { overturned: number; denied: number }>);

  const outcomeTimelineChart = Object.entries(outcomeTimeline)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([name, data]) => ({
      name,
      Reinstated: data.overturned,
      Denied: data.denied,
    }));

  // Subscriber Count Distribution (buckets)
  const subscriberBuckets = cases
    .filter(c => c.subscriberCount && c.subscriberCount > 0)
    .reduce((acc, c) => {
      const count = c.subscriberCount!;
      let bucket = '';
      if (count < 1000) bucket = '< 1K';
      else if (count < 10000) bucket = '1K - 10K';
      else if (count < 100000) bucket = '10K - 100K';
      else if (count < 1000000) bucket = '100K - 1M';
      else bucket = '1M+';
      acc[bucket] = (acc[bucket] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const subscriberChart = Object.entries(subscriberBuckets)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => {
      const order = ['< 1K', '1K - 10K', '10K - 100K', '100K - 1M', '1M+'];
      return order.indexOf(a.name) - order.indexOf(b.name);
    });

  // Termination Date Trends
  const terminationDateData = cases
    .filter(c => c.terminationDate)
    .reduce((acc, c) => {
      try {
        let date: Date;
        if (c.terminationDate!.includes('/')) {
          const [month, day, year] = c.terminationDate!.split('/').map(Number);
          date = new Date(year, month - 1, day);
        } else {
          date = new Date(c.terminationDate!);
        }
        if (!isNaN(date.getTime())) {
          const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          acc[month] = (acc[month] || 0) + 1;
        }
      } catch (e) {
        // Skip invalid dates
      }
      return acc;
    }, {} as Record<string, number>);

  const terminationDateChart = Object.entries(terminationDateData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, value]) => ({
      name: new Date(name + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      terminations: value,
    }));

  // Days Terminated Distribution
  const daysTerminatedData = cases
    .filter(c => c.terminationDate && c.status === 'TERMINATED')
    .map(c => {
      try {
        let date: Date;
        if (c.terminationDate!.includes('/')) {
          const [month, day, year] = c.terminationDate!.split('/').map(Number);
          date = new Date(year, month - 1, day);
        } else {
          date = new Date(c.terminationDate!);
        }
        if (!isNaN(date.getTime())) {
          const now = new Date();
          const diffTime = now.getTime() - date.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          return diffDays >= 0 ? diffDays : null;
        }
      } catch (e) {
        // Skip invalid dates
      }
      return null;
    })
    .filter((days): days is number => days !== null)
    .reduce((acc, days) => {
      let bucket = '';
      if (days < 30) bucket = '< 1 month';
      else if (days < 90) bucket = '1-3 months';
      else if (days < 180) bucket = '3-6 months';
      else if (days < 365) bucket = '6-12 months';
      else if (days < 730) bucket = '1-2 years';
      else bucket = '2+ years';
      acc[bucket] = (acc[bucket] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const daysTerminatedChart = Object.entries(daysTerminatedData)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => {
      const order = ['< 1 month', '1-3 months', '3-6 months', '6-12 months', '1-2 years', '2+ years'];
      return order.indexOf(a.name) - order.indexOf(b.name);
    });

  // Appeal Status by Channel Status (Cross-tabulation)
  const appealByStatus = cases.reduce((acc, c) => {
    const channelStatus = c.status || 'UNKNOWN';
    const appealStatus = c.appealStatus || 'UNKNOWN';
    if (!acc[channelStatus]) {
      acc[channelStatus] = {} as Record<string, number>;
    }
    acc[channelStatus][appealStatus] = (acc[channelStatus][appealStatus] || 0) + 1;
    return acc;
  }, {} as Record<string, Record<string, number>>);

  const appealByStatusChart = Object.entries(appealByStatus).map(([channelStatus, appeals]) => ({
    name: channelStatus.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    ...Object.fromEntries(
      Object.entries(appeals).map(([status, count]) => [
        status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        count
      ])
    ),
  }));

  // Subscriber Count vs Reinstatement Rate
  const subscriberReinstatement = cases
    .filter(c => c.subscriberCount && c.subscriberCount > 0)
    .reduce((acc, c) => {
      const count = c.subscriberCount!;
      let bucket = '';
      if (count < 10000) bucket = '< 10K';
      else if (count < 100000) bucket = '10K - 100K';
      else if (count < 1000000) bucket = '100K - 1M';
      else bucket = '1M+';
      if (!acc[bucket]) {
        acc[bucket] = { total: 0, reinstated: 0 };
      }
      acc[bucket].total++;
      if (c.status === 'REINSTATED') {
        acc[bucket].reinstated++;
      }
      return acc;
    }, {} as Record<string, { total: number; reinstated: number }>);

  const subscriberReinstatementChart = Object.entries(subscriberReinstatement)
    .map(([name, data]) => ({
      name,
      rate: data.total > 0 ? (data.reinstated / data.total) * 100 : 0,
      total: data.total,
    }))
    .sort((a, b) => {
      const order = ['< 10K', '10K - 100K', '100K - 1M', '1M+'];
      return order.indexOf(a.name) - order.indexOf(b.name);
    });

  // Calculate additional stats
  const casesWithSubs = cases.filter(c => c.subscriberCount && c.subscriberCount > 0);
  const avgSubscribers = casesWithSubs.length > 0
    ? Math.round(casesWithSubs.reduce((sum, c) => sum + (c.subscriberCount || 0), 0) / casesWithSubs.length)
    : 0;
  
  const terminatedCases = cases.filter(c => c.status === 'TERMINATED' && c.terminationDate);
  const avgDaysTerminated = terminatedCases.length > 0
    ? Math.round(
        terminatedCases
          .map(c => {
            try {
              let date: Date;
              if (c.terminationDate!.includes('/')) {
                const [month, day, year] = c.terminationDate!.split('/').map(Number);
                date = new Date(year, month - 1, day);
              } else {
                date = new Date(c.terminationDate!);
              }
              if (!isNaN(date.getTime())) {
                const now = new Date();
                const diffTime = now.getTime() - date.getTime();
                return Math.floor(diffTime / (1000 * 60 * 60 * 24));
              }
            } catch (e) {
              return 0;
            }
            return 0;
          })
          .reduce((sum, days) => sum + days, 0) / terminatedCases.length
      )
    : 0;

  const pendingAppeals = cases.filter(c => 
    c.appealStatus === 'PENDING' || c.appealStatus === 'UNDER_REVIEW'
  ).length;

  // Monetization Status Distribution
  const monetizationData = cases
    .filter(c => c.monetized !== undefined)
    .reduce((acc, c) => {
      let status = 'Unknown';
      if (typeof c.monetized === 'boolean') {
        status = c.monetized ? 'Yes' : 'No';
      } else if (typeof c.monetized === 'string') {
        const lower = c.monetized.toLowerCase().trim();
        if (lower.includes('yes') || lower === 'true' || lower === '1' || lower === 'y') {
          status = 'Yes';
        } else if (lower.includes('no') || lower === 'false' || lower === '0' || lower === 'n') {
          status = 'No';
        } else {
          status = c.monetized;
        }
      }
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const monetizationChart = Object.entries(monetizationData)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Reinstatement Rate by Monetization Status
  const monetizationReinstatement = cases
    .filter(c => c.monetized !== undefined)
    .reduce((acc, c) => {
      let status = 'Unknown';
      if (typeof c.monetized === 'boolean') {
        status = c.monetized ? 'Yes' : 'No';
      } else if (typeof c.monetized === 'string') {
        const lower = c.monetized.toLowerCase().trim();
        if (lower.includes('yes') || lower === 'true' || lower === '1' || lower === 'y') {
          status = 'Yes';
        } else if (lower.includes('no') || lower === 'false' || lower === '0' || lower === 'n') {
          status = 'No';
        } else {
          status = 'Other';
        }
      }
      if (!acc[status]) {
        acc[status] = { total: 0, reinstated: 0 };
      }
      acc[status].total++;
      if (c.status === 'REINSTATED') {
        acc[status].reinstated++;
      }
      return acc;
    }, {} as Record<string, { total: number; reinstated: number }>);

  const monetizationReinstatementChart = Object.entries(monetizationReinstatement)
    .filter(([, data]) => data.total >= 2) // Only show if 2+ cases
    .map(([name, data]) => ({
      name,
      rate: data.total > 0 ? (data.reinstated / data.total) * 100 : 0,
      total: data.total,
    }))
    .sort((a, b) => {
      // Sort: Yes, No, Other
      const order = ['Yes', 'No', 'Other'];
      return (order.indexOf(a.name) === -1 ? 999 : order.indexOf(a.name)) - 
             (order.indexOf(b.name) === -1 ? 999 : order.indexOf(b.name));
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <div className="text-gray-700 text-xl">Loading analytics...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8">
          <div className="text-red-600 text-xl">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <DisclaimerBanner />

      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between flex-wrap gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-red-600 rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm text-white">
                ▶
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Open Creator Log</h1>
            </div>
            <nav className="flex items-center gap-2 sm:gap-4 flex-wrap text-sm sm:text-base">
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                Home
              </Link>
              <Link href="/terminations" className="text-gray-600 hover:text-gray-900 transition-colors">
                Terminations
              </Link>
              <Link href="/analytics" className="text-gray-900 font-semibold">
                Analytics
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">
                About
              </Link>
              <Link 
                href="/submit"
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-semibold transition-colors"
              >
                Submit Your Case
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Analytics & Insights</h2>
          <p className="text-sm sm:text-base text-gray-400">
            Data-driven insights from {cases.length} community-reported cases
          </p>
        </div>

        {/* Chart Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Chart 1: Appeal Status Distribution */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Appeal Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={appealStatusChart}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {appealStatusChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index % Object.keys(COLORS).length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: '#111827'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Chart 2: Channel Status Distribution */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Channel Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={channelStatusChart}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {channelStatusChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index % Object.keys(COLORS).length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: '#111827'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Chart 3: Top Termination Reasons */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Top Termination Reasons</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reasonsChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                />
                <YAxis tick={{ fill: '#9CA3AF' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: '#111827'
                  }}
                />
                <Bar dataKey="value" fill={COLORS.blue} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Chart 4: Reinstatement Rate by Reason */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Reinstatement Rate by Reason</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reinstatementRateChart} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#9CA3AF' }} />
                <YAxis dataKey="name" type="category" width={150} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: '#111827'
                  }}
                  formatter={(value: number | undefined) => [`${(value || 0).toFixed(1)}%`, 'Reinstatement Rate']}
                />
                <Bar dataKey="rate" fill={COLORS.green} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Chart 5: Subscriber Count Distribution */}
          {subscriberChart.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Subscriber Count Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subscriberChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fill: '#9CA3AF' }} />
                  <YAxis tick={{ fill: '#9CA3AF' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      color: '#111827'
                    }}
                  />
                  <Bar dataKey="value" fill={COLORS.orange} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Chart 6: Termination Dates Over Time */}
          {terminationDateChart.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Terminations Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={terminationDateChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fill: '#9CA3AF' }} />
                  <YAxis tick={{ fill: '#9CA3AF' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      color: '#111827'
                    }}
                  />
                  <Line type="monotone" dataKey="terminations" stroke={COLORS.red} strokeWidth={2} dot={{ fill: COLORS.red }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Chart 7: Days Terminated Distribution */}
          {daysTerminatedChart.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Duration of Terminations</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={daysTerminatedChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#9CA3AF' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      color: '#111827'
                    }}
                  />
                  <Bar dataKey="value" fill={COLORS.yellow} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Chart 8: Reinstatement Rate by Subscriber Count */}
          {subscriberReinstatementChart.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Reinstatement Rate by Channel Size</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subscriberReinstatementChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fill: '#9CA3AF' }} />
                  <YAxis 
                    domain={[0, 100]} 
                    tick={{ fill: '#9CA3AF' }}
                    label={{ value: 'Reinstatement Rate (%)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      color: '#111827'
                    }}
                    formatter={(value: number | undefined) => [`${(value || 0).toFixed(1)}%`, 'Reinstatement Rate']}
                  />
                  <Bar dataKey="rate" fill={COLORS.green} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Chart 9: Monetization Status Distribution */}
          {monetizationChart.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Monetization Status</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={monetizationChart}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {monetizationChart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index % Object.keys(COLORS).length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      color: '#111827'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Chart 10: Reinstatement Rate by Monetization Status */}
          {monetizationReinstatementChart.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Reinstatement Rate by Monetization Status</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monetizationReinstatementChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fill: '#9CA3AF' }} />
                  <YAxis 
                    domain={[0, 100]} 
                    tick={{ fill: '#9CA3AF' }}
                    label={{ value: 'Reinstatement Rate (%)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      color: '#111827'
                    }}
                    formatter={(value: number | undefined) => [`${(value || 0).toFixed(1)}%`, 'Reinstatement Rate']}
                  />
                  <Bar dataKey="rate" fill={COLORS.green} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Chart 11: Appeal Outcome Timeline */}
          {outcomeTimelineChart.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Appeal Outcomes Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={outcomeTimelineChart}>
                  <defs>
                    <linearGradient id="colorReinstated" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.green} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={COLORS.green} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorDenied" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.red} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={COLORS.red} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fill: '#9CA3AF' }} />
                  <YAxis tick={{ fill: '#9CA3AF' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      color: '#111827'
                    }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="Reinstated" stackId="1" stroke={COLORS.green} fillOpacity={1} fill="url(#colorReinstated)" />
                  <Area type="monotone" dataKey="Denied" stackId="1" stroke={COLORS.red} fillOpacity={1} fill="url(#colorDenied)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
            <div className="text-gray-600 text-xs sm:text-sm mb-1 sm:mb-2">Total Cases</div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">{cases.length}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
            <div className="text-gray-600 text-xs sm:text-sm mb-1 sm:mb-2">Reinstatement Rate</div>
            <div className="text-2xl sm:text-3xl font-bold text-green-600">
              {cases.length > 0 
                ? `${((cases.filter(c => c.status === 'REINSTATED').length / cases.length) * 100).toFixed(1)}%`
                : '0%'
              }
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
            <div className="text-gray-600 text-xs sm:text-sm mb-1 sm:mb-2">Pending Appeals</div>
            <div className="text-2xl sm:text-3xl font-bold text-yellow-600">{pendingAppeals}</div>
          </div>
          {avgSubscribers > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
              <div className="text-gray-600 text-xs sm:text-sm mb-1 sm:mb-2">Avg Subscribers</div>
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                {avgSubscribers >= 1000000 
                  ? `${(avgSubscribers / 1000000).toFixed(1)}M`
                  : avgSubscribers >= 1000
                  ? `${(avgSubscribers / 1000).toFixed(1)}K`
                  : avgSubscribers.toLocaleString()
                }
              </div>
            </div>
          )}
          {avgDaysTerminated > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
              <div className="text-gray-600 text-xs sm:text-sm mb-1 sm:mb-2">Avg Days Terminated</div>
              <div className="text-2xl sm:text-3xl font-bold text-red-600">{avgDaysTerminated}</div>
            </div>
          )}
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
            <div className="text-gray-600 text-xs sm:text-sm mb-1 sm:mb-2">Terminated</div>
            <div className="text-2xl sm:text-3xl font-bold text-red-600">
              {cases.filter(c => c.status === 'TERMINATED').length}
            </div>
          </div>
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

