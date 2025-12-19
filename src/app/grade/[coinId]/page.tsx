'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { trackEvent } from '@aptabase/web';

interface GradeData {
  coin: {
    name: string;
    symbol: string;
    id: string;
    image: string;
  };
  grade: {
    final: string;
    score: string;
    maxScore: string;
  };
  breakdown: {
    [key: string]: {
      grade: string;
      value: string;
      reason: string;
      weight: string;
    };
  };
  metrics: {
    currentPrice: number;
    marketCap: string;
    volume24h: string;
    rank: string;
    athDistance: string;
    atlDistance: string;
    circulatingSupply: string;
    totalSupply: string;
    maxSupply: string;
    priceChange24h: number;
    priceChange7d: number;
    priceChange30d: number;
  };
  community: {
    githubStars: string | null;
    githubForks: string | null;
    twitterFollowers: string | null;
    redditSubscribers: string | null;
  };
}

const gradeColors: { [key: string]: { bg: string; glow: string; text: string } } = {
  'A': { bg: 'from-emerald-500 to-green-500', glow: 'shadow-emerald-500/50', text: 'Excellent' },
  'A-': { bg: 'from-green-500 to-emerald-600', glow: 'shadow-green-500/50', text: 'Great' },
  'B+': { bg: 'from-blue-400 to-blue-500', glow: 'shadow-blue-500/50', text: 'Good' },
  'B': { bg: 'from-blue-500 to-blue-600', glow: 'shadow-blue-500/50', text: 'Above Average' },
  'B-': { bg: 'from-blue-600 to-indigo-600', glow: 'shadow-blue-600/50', text: 'Solid' },
  'C+': { bg: 'from-yellow-400 to-yellow-500', glow: 'shadow-yellow-500/50', text: 'Fair' },
  'C': { bg: 'from-yellow-500 to-orange-500', glow: 'shadow-yellow-500/50', text: 'Average' },
  'C-': { bg: 'from-orange-500 to-orange-600', glow: 'shadow-orange-500/50', text: 'Below Average' },
  'D': { bg: 'from-orange-600 to-red-500', glow: 'shadow-orange-600/50', text: 'Poor' },
  'F': { bg: 'from-red-500 to-red-600', glow: 'shadow-red-500/50', text: 'Very Poor' }
};

const gradeCardColors: { [key: string]: string } = {
  'A': 'bg-gradient-to-br from-emerald-500/20 to-green-500/20 border-emerald-500/30',
  'A-': 'bg-gradient-to-br from-green-500/20 to-emerald-600/20 border-green-500/30',
  'B+': 'bg-gradient-to-br from-blue-400/20 to-blue-500/20 border-blue-400/30',
  'B': 'bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30',
  'B-': 'bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border-blue-600/30',
  'C+': 'bg-gradient-to-br from-yellow-400/20 to-yellow-500/20 border-yellow-400/30',
  'C': 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30',
  'C-': 'bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-500/30',
  'D': 'bg-gradient-to-br from-orange-600/20 to-red-500/20 border-orange-600/30',
  'F': 'bg-gradient-to-br from-red-500/20 to-red-600/20 border-red-500/30'
};

export default function GradePage() {
  const params = useParams();
  const coinId = params.coinId as string;
  
  const [gradeData, setGradeData] = useState<GradeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchGrade() {
      try {
        const response = await fetch(`/api/grade/${coinId}`);
        if (!response.ok) {
          if (response.status === 404) {
            // Use Next.js notFound() function instead of redirect
            notFound();
            return;
          }
          throw new Error('Failed to fetch grade');
        }
        const data = await response.json();
        setGradeData(data);
        // Update page title dynamically
        document.title = `${data.coin.name} (${data.coin.symbol}) - Grade ${data.grade.final} | TrueCoinGrade`;
        
        // Track coin grade view
        trackEvent('coin_grade_viewed', {
          coin_id: coinId,
          coin_name: data.coin.name,
          coin_symbol: data.coin.symbol,
          grade: data.grade.final,
          score: data.grade.score,
          rank: data.metrics.rank,
        });
      } catch (err) {
        setError('Failed to load grade. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (coinId) {
      fetchGrade();
    }
  }, [coinId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1220] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mb-4"></div>
          <div className="text-gray-300 text-xl">Analyzing grade...</div>
        </div>
      </div>
    );
  }

  if (error || !gradeData) {
    return (
      <div className="min-h-screen bg-[#0b1220] flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-8 backdrop-blur-sm">
          <div className="text-red-400 text-xl">{error}</div>
          <Link href="/" className="mt-4 inline-block text-purple-400 hover:text-purple-300">
            ← Back to list
          </Link>
        </div>
      </div>
    );
  }

  const gradeStyle = gradeColors[gradeData.grade.final] || gradeColors['F'];
  const scorePercentage = (parseFloat(gradeData.grade.score) / 4) * 100;

  return (
    <div className="min-h-screen bg-[#0F1419] text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#0F1419] sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity min-w-0 flex-1">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0">
                C
              </div>
              <h1 className="text-lg sm:text-2xl font-bold truncate">TrueCoinGrade</h1>
            </Link>
            <Link 
              href="/"
              className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors bg-gray-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded whitespace-nowrap flex-shrink-0"
            >
              ← Back
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Coin Header */}
        <div className="bg-[#1A1F2E] rounded-lg border border-gray-800 p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-6">
            <div className="flex items-center gap-4 sm:gap-6 min-w-0 flex-1">
              {gradeData.coin.image && (
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl sm:rounded-3xl blur-xl opacity-40"></div>
                  <Image 
                    src={gradeData.coin.image} 
                    alt={gradeData.coin.name}
                    width={80}
                    height={80}
                    className="relative rounded-2xl sm:rounded-3xl ring-4 ring-blue-500/20 w-16 h-16 sm:w-20 sm:h-20"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 truncate">
                  {gradeData.coin.name}
                </h1>
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <span className="text-base sm:text-lg md:text-xl text-gray-400 uppercase font-semibold">{gradeData.coin.symbol}</span>
                  <span className="text-sm sm:text-base md:text-lg text-gray-500">{gradeData.metrics.rank}</span>
                </div>
              </div>
            </div>
            
            {/* Quick Grade Badge */}
            <div className={`flex flex-col items-center justify-center bg-gradient-to-br ${gradeStyle.bg} rounded-xl sm:rounded-2xl p-4 sm:p-6 ${gradeStyle.glow} shadow-xl min-w-[100px] sm:min-w-[140px] flex-shrink-0`}>
              <div className="text-4xl sm:text-5xl md:text-6xl font-bold mb-1 sm:mb-2">{gradeData.grade.final}</div>
              <div className="text-xs sm:text-sm font-semibold opacity-90 text-center">{gradeStyle.text}</div>
            </div>
          </div>
        </div>

        {/* Price Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-slate-900/60 rounded-xl sm:rounded-2xl border border-slate-800 p-4 sm:p-6">
            <div className="text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2 font-medium">Current Price</div>
            <div className="text-lg sm:text-2xl md:text-3xl font-bold break-words">
              ${gradeData.metrics.currentPrice.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: gradeData.metrics.currentPrice < 1 ? 6 : 2
              })}
            </div>
          </div>
          
          <div className="bg-slate-900/60 rounded-xl sm:rounded-2xl border border-slate-800 p-4 sm:p-6">
            <div className="text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2 font-medium">24h Change</div>
            <div className={`text-lg sm:text-2xl md:text-3xl font-bold flex items-center gap-1 sm:gap-2 ${gradeData.metrics.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              <span className="text-base sm:text-xl">{gradeData.metrics.priceChange24h >= 0 ? '↑' : '↓'}</span>
              <span className="break-words">{Math.abs(gradeData.metrics.priceChange24h).toFixed(2)}%</span>
            </div>
          </div>
          
          <div className="bg-slate-900/60 rounded-xl sm:rounded-2xl border border-slate-800 p-4 sm:p-6">
            <div className="text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2 font-medium">Market Cap</div>
            <div className="text-lg sm:text-2xl md:text-3xl font-bold break-words">{gradeData.metrics.marketCap}</div>
          </div>
          
          <div className="bg-slate-900/60 rounded-xl sm:rounded-2xl border border-slate-800 p-4 sm:p-6">
            <div className="text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2 font-medium">Volume (24h)</div>
            <div className="text-lg sm:text-2xl md:text-3xl font-bold break-words">{gradeData.metrics.volume24h}</div>
          </div>
        </div>

        {/* Overall Grade Section */}
        <div className="bg-slate-900/60 rounded-xl sm:rounded-2xl border border-slate-800 p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 shadow-xl">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 text-white">
              Investment Grade Analysis
            </h2>
            <p className="text-sm sm:text-base text-slate-400">Comprehensive evaluation based on 8 key metrics</p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 sm:gap-8 md:gap-12">
            <div className={`relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 bg-gradient-to-br ${gradeStyle.bg} rounded-full flex items-center justify-center ${gradeStyle.glow} shadow-2xl flex-shrink-0`}>
              <div className="text-center">
                <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-1 sm:mb-2">{gradeData.grade.final}</div>
                <div className="text-sm sm:text-base md:text-lg font-semibold opacity-90">{gradeStyle.text}</div>
              </div>
            </div>
            
            <div className="flex-1 max-w-md w-full">
              <div className="mb-4">
                <div className="flex justify-between text-xs sm:text-sm mb-2">
                  <span className="text-gray-400">Overall Score</span>
                  <span className="font-semibold">{gradeData.grade.score} / {gradeData.grade.maxScore}</span>
                </div>
                <div className="h-3 sm:h-4 bg-white/5 rounded-full overflow-hidden border border-white/10">
                  <div 
                    className={`h-full bg-gradient-to-r ${gradeStyle.bg} transition-all duration-1000 ease-out`}
                    style={{ width: `${scorePercentage}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Performance</span>
                  <span className="text-white font-medium">{scorePercentage.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Rating</span>
                  <span className="text-white font-medium">{gradeStyle.text}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Metrics Analyzed</span>
                  <span className="text-white font-medium">8 Categories</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grade Breakdown */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-white">
            Detailed Breakdown
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {Object.entries(gradeData.breakdown).map(([key, data]) => {
              const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
              const cardColor = gradeCardColors[data.grade] || gradeCardColors['F'];
              
              return (
                <div key={key} className={`${cardColor} backdrop-blur-sm border rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}>
                  <div className="flex items-start justify-between gap-3 mb-3 sm:mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${gradeColors[data.grade]?.bg || 'from-gray-500 to-gray-600'} rounded-lg sm:rounded-xl flex items-center justify-center text-xl sm:text-2xl font-bold shadow-lg flex-shrink-0`}>
                          {data.grade}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base sm:text-lg font-bold break-words">{label}</h3>
                          <div className="text-xs text-gray-400 font-medium">Weight: {data.weight}</div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg sm:text-xl md:text-2xl font-bold text-purple-400 break-words whitespace-nowrap">{data.value}</div>
                    </div>
                  </div>
                  <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">{data.reason}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Supply Metrics */}
          <div className="bg-black/30 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/10 p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
              <span className="text-xl sm:text-2xl">📊</span> Supply Metrics
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center p-2 sm:p-3 bg-white/5 rounded-lg sm:rounded-xl gap-2">
                <span className="text-gray-400 text-sm sm:text-base">Circulating Supply</span>
                <span className="font-semibold text-sm sm:text-base text-right break-words">{gradeData.metrics.circulatingSupply}</span>
              </div>
              <div className="flex justify-between items-center p-2 sm:p-3 bg-white/5 rounded-lg sm:rounded-xl gap-2">
                <span className="text-gray-400 text-sm sm:text-base">Total Supply</span>
                <span className="font-semibold text-sm sm:text-base text-right break-words">{gradeData.metrics.totalSupply}</span>
              </div>
              <div className="flex justify-between items-center p-2 sm:p-3 bg-white/5 rounded-lg sm:rounded-xl gap-2">
                <span className="text-gray-400 text-sm sm:text-base">Max Supply</span>
                <span className="font-semibold text-sm sm:text-base text-right break-words">{gradeData.metrics.maxSupply}</span>
              </div>
            </div>
          </div>

          {/* Price History */}
          <div className="bg-black/30 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/10 p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
              <span className="text-xl sm:text-2xl">📈</span> Price Performance
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center p-2 sm:p-3 bg-white/5 rounded-lg sm:rounded-xl gap-2">
                <span className="text-gray-400 text-sm sm:text-base">24h Change</span>
                <span className={`font-semibold text-sm sm:text-base ${gradeData.metrics.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {gradeData.metrics.priceChange24h >= 0 ? '+' : ''}{gradeData.metrics.priceChange24h.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center p-2 sm:p-3 bg-white/5 rounded-lg sm:rounded-xl gap-2">
                <span className="text-gray-400 text-sm sm:text-base">7d Change</span>
                <span className={`font-semibold text-sm sm:text-base ${gradeData.metrics.priceChange7d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {gradeData.metrics.priceChange7d >= 0 ? '+' : ''}{gradeData.metrics.priceChange7d.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center p-2 sm:p-3 bg-white/5 rounded-lg sm:rounded-xl gap-2">
                <span className="text-gray-400 text-sm sm:text-base">30d Change</span>
                <span className={`font-semibold text-sm sm:text-base ${gradeData.metrics.priceChange30d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {gradeData.metrics.priceChange30d >= 0 ? '+' : ''}{gradeData.metrics.priceChange30d.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center p-2 sm:p-3 bg-white/5 rounded-lg sm:rounded-xl gap-2">
                <span className="text-gray-400 text-sm sm:text-base">From ATH</span>
                <span className="font-semibold text-sm sm:text-base text-orange-400 break-words">{gradeData.metrics.athDistance}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Community Metrics */}
        {(gradeData.community.githubStars || gradeData.community.twitterFollowers || gradeData.community.redditSubscribers) && (
          <div className="bg-black/30 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/10 p-4 sm:p-6 mb-6 sm:mb-8">
            <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
              <span className="text-xl sm:text-2xl">👥</span> Community & Development
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {gradeData.community.githubStars && (
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4 text-center">
                  <div className="text-3xl mb-2">⭐</div>
                  <div className="text-gray-400 text-xs mb-1">GitHub Stars</div>
                  <div className="text-xl font-bold">{gradeData.community.githubStars}</div>
                </div>
              )}
              {gradeData.community.githubForks && (
                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
                  <div className="text-3xl mb-2">🔱</div>
                  <div className="text-gray-400 text-xs mb-1">Forks</div>
                  <div className="text-xl font-bold">{gradeData.community.githubForks}</div>
                </div>
              )}
              {gradeData.community.twitterFollowers && (
                <div className="bg-gradient-to-br from-sky-500/10 to-blue-500/10 border border-sky-500/20 rounded-xl p-4 text-center">
                  <div className="text-3xl mb-2">🐦</div>
                  <div className="text-gray-400 text-xs mb-1">Twitter</div>
                  <div className="text-xl font-bold">{gradeData.community.twitterFollowers}</div>
                </div>
              )}
              {gradeData.community.redditSubscribers && (
                <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-4 text-center">
                  <div className="text-3xl mb-2">💬</div>
                  <div className="text-gray-400 text-xs mb-1">Reddit</div>
                  <div className="text-xl font-bold">{gradeData.community.redditSubscribers}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 backdrop-blur-sm">
          <div className="flex gap-2 sm:gap-3">
            <div className="text-xl sm:text-2xl flex-shrink-0">⚠️</div>
            <div className="min-w-0">
              <h4 className="font-semibold text-yellow-400 mb-1 text-sm sm:text-base">Investment Disclaimer</h4>
              <p className="text-xs sm:text-sm text-gray-300">
                This grade is for informational and educational purposes only. It does not constitute financial advice. 
                Always conduct your own research before making investment decisions.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-20 py-12 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-gray-400 text-sm space-y-2">
            <p>Comprehensive analysis using market data, development metrics, and community engagement</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
