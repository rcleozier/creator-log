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


  // Cases over time (by submission date)
  const casesOverTime = cases.reduce((acc, c) => {
    const date = new Date(c.submittedDate);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const casesOverTimeChart = Object.entries(casesOverTime)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, value]) => ({
      name: new Date(name + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      cases: value,
    }));

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
              <Link href="/analytics" className="text-gray-900 font-semibold">
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Analytics & Insights</h2>
          <p className="text-gray-400">
            Data-driven insights from {cases.length} community-reported cases
          </p>
        </div>

        {/* Chart Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Chart 1: Appeal Status Distribution */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Appeal Status Distribution</h3>
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
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Channel Status Distribution</h3>
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
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Top Termination Reasons</h3>
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

          {/* Chart 4: Cases Over Time */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Cases Submitted Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={casesOverTimeChart}>
                <defs>
                  <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.blue} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={COLORS.blue} stopOpacity={0}/>
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
                <Area type="monotone" dataKey="cases" stroke={COLORS.blue} fillOpacity={1} fill="url(#colorCases)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Chart 5: Reinstatement Rate by Reason */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Reinstatement Rate by Reason</h3>
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
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="text-gray-600 text-sm mb-2">Total Cases</div>
            <div className="text-3xl font-bold text-gray-900">{cases.length}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="text-gray-600 text-sm mb-2">Reinstatement Rate</div>
            <div className="text-3xl font-bold text-green-600">
              {cases.length > 0 
                ? `${((cases.filter(c => c.status === 'REINSTATED').length / cases.length) * 100).toFixed(1)}%`
                : '0%'
              }
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

