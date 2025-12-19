import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ coinId: string }> }
) {
  try {
    const { coinId } = await params;
    
    // Fetch coin data
    const url = new URL(`https://api.coingecko.com/api/v3/coins/${coinId}`);
    url.searchParams.set('localization', 'false');
    url.searchParams.set('tickers', 'false');
    url.searchParams.set('community_data', 'true');
    url.searchParams.set('developer_data', 'true');
    url.searchParams.set('sparkline', 'false');
    
    const response = await fetch(url, {
      next: { revalidate: 300 } // Cache for 5 minutes
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Coin not found' },
          { status: 404 }
        );
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const coin = await response.json();
    const md = coin.market_data;
    
    // Extract metrics
    const marketCap = md.market_cap.usd || 0;
    const volume24h = md.total_volume.usd || 0;
    const rank = coin.market_cap_rank || 9999;
    const priceChange24h = Math.abs(md.price_change_percentage_24h || 0);
    const priceChange7d = Math.abs(md.price_change_percentage_7d || 0);
    const priceChange30d = Math.abs(md.price_change_percentage_30d || 0);
    const priceChange1y = Math.abs(md.price_change_percentage_1y || 0);
    const circulatingSupply = md.circulating_supply || 0;
    const totalSupply = md.total_supply || circulatingSupply;
    const maxSupply = md.max_supply || totalSupply;
    const currentPrice = md.current_price.usd || 0;
    const ath = md.ath.usd || currentPrice;
    const atl = md.atl.usd || currentPrice;
    const athDate = new Date(md.ath_date?.usd || Date.now());
    const age = coin.genesis_date ? Math.floor((Date.now() - new Date(coin.genesis_date).getTime()) / (1000 * 60 * 60 * 24 * 365)) : 0;
    const githubCommits = coin.developer_data?.commit_count_4_weeks || 0;
    const githubStars = coin.developer_data?.stars || 0;
    const githubForks = coin.developer_data?.forks || 0;
    const twitterFollowers = coin.community_data?.twitter_followers || 0;
    const redditSubscribers = coin.community_data?.reddit_subscribers || 0;
    
    // Calculate derived metrics
    const volumeRatio = marketCap > 0 ? (volume24h / marketCap) * 100 : 0;
    const supplyRatio = totalSupply > 0 ? (circulatingSupply / totalSupply) * 100 : 100;
    const avgVolatility = (priceChange24h + priceChange7d + priceChange30d) / 3;
    const athDistance = ath > 0 ? ((ath - currentPrice) / ath) * 100 : 0;
    const atlDistance = atl > 0 ? ((currentPrice - atl) / atl) * 100 : 0;
    const hasMaxSupply = maxSupply > 0 && maxSupply < 1e15;
    
    let totalScore = 0;
    const breakdown: Record<string, { grade: string; value: string; reason: string; weight: string }> = {};
    
    // 1. MARKET CAP (25% weight)
    let mcapScore, mcapGrade, mcapReason;
    if (marketCap > 50e9) {
      mcapScore = 4; mcapGrade = 'A'; mcapReason = '>$50B (Blue chip)';
    } else if (marketCap > 10e9) {
      mcapScore = 3.5; mcapGrade = 'A-'; mcapReason = '>$10B (Large cap)';
    } else if (marketCap > 1e9) {
      mcapScore = 3; mcapGrade = 'B'; mcapReason = '>$1B (Mid cap)';
    } else if (marketCap > 100e6) {
      mcapScore = 2; mcapGrade = 'C'; mcapReason = '>$100M (Small cap)';
    } else if (marketCap > 10e6) {
      mcapScore = 1; mcapGrade = 'D'; mcapReason = '>$10M (Micro cap)';
    } else {
      mcapScore = 0; mcapGrade = 'F'; mcapReason = '<$10M (High risk)';
    }
    totalScore += mcapScore * 0.25;
    breakdown.marketCap = { 
      grade: mcapGrade, 
      value: marketCap >= 1e9 ? `$${(marketCap / 1e9).toFixed(2)}B` : `$${(marketCap / 1e6).toFixed(1)}M`, 
      reason: mcapReason,
      weight: '25%'
    };
    
    // 2. LIQUIDITY - Volume/MCap Ratio (20% weight)
    // Adjusted for large market cap coins - Bitcoin is the curve
    let liqScore, liqGrade, liqReason;
    // For very large market caps (>$100B), lower volume ratios are acceptable
    if (marketCap > 100e9) {
      // Bitcoin-tier: Large market cap means lower volume ratio is normal
      if (volumeRatio > 2) {
        liqScore = 4; liqGrade = 'A'; liqReason = 'Excellent liquidity (large cap)';
      } else if (volumeRatio > 1) {
        liqScore = 3.5; liqGrade = 'A-'; liqReason = 'Good liquidity (large cap)';
      } else if (volumeRatio > 0.5) {
        liqScore = 3; liqGrade = 'B'; liqReason = 'Adequate liquidity (large cap)';
      } else {
        liqScore = 2; liqGrade = 'C'; liqReason = 'Moderate liquidity (large cap)';
      }
    } else if (volumeRatio > 50) {
      liqScore = 4; liqGrade = 'A'; liqReason = 'Excellent liquidity';
    } else if (volumeRatio > 20) {
      liqScore = 3; liqGrade = 'B'; liqReason = 'Good liquidity';
    } else if (volumeRatio > 5) {
      liqScore = 2; liqGrade = 'C'; liqReason = 'Moderate liquidity';
    } else if (volumeRatio > 1) {
      liqScore = 1; liqGrade = 'D'; liqReason = 'Low liquidity';
    } else {
      liqScore = 0; liqGrade = 'F'; liqReason = 'Very low liquidity';
    }
    totalScore += liqScore * 0.20;
    breakdown.liquidity = { 
      grade: liqGrade, 
      value: `${volumeRatio.toFixed(1)}%`, 
      reason: liqReason,
      weight: '20%'
    };
    
    // 3. VOLATILITY (15% weight) - Lower is better
    let volScore, volGrade, volReason;
    if (avgVolatility < 5) {
      volScore = 4; volGrade = 'A'; volReason = 'Very stable';
    } else if (avgVolatility < 10) {
      volScore = 3; volGrade = 'B'; volReason = 'Stable';
    } else if (avgVolatility < 20) {
      volScore = 2; volGrade = 'C'; volReason = 'Moderate volatility';
    } else if (avgVolatility < 40) {
      volScore = 1; volGrade = 'D'; volReason = 'High volatility';
    } else {
      volScore = 0; volGrade = 'F'; volReason = 'Extreme volatility';
    }
    totalScore += volScore * 0.15;
    breakdown.volatility = { 
      grade: volGrade, 
      value: `${avgVolatility.toFixed(1)}%`, 
      reason: volReason,
      weight: '15%'
    };
    
    // 4. MARKET POSITION - Rank (10% weight)
    let rankScore, rankGrade, rankReason;
    if (rank <= 10) {
      rankScore = 4; rankGrade = 'A'; rankReason = 'Top 10';
    } else if (rank <= 50) {
      rankScore = 3.5; rankGrade = 'A-'; rankReason = 'Top 50';
    } else if (rank <= 100) {
      rankScore = 3; rankGrade = 'B'; rankReason = 'Top 100';
    } else if (rank <= 250) {
      rankScore = 2; rankGrade = 'C'; rankReason = 'Top 250';
    } else if (rank <= 500) {
      rankScore = 1; rankGrade = 'D'; rankReason = 'Top 500';
    } else {
      rankScore = 0; rankGrade = 'F'; rankReason = 'Below 500';
    }
    totalScore += rankScore * 0.10;
    breakdown.marketRank = { 
      grade: rankGrade, 
      value: `#${rank}`, 
      reason: rankReason,
      weight: '10%'
    };
    
    // 5. TOKENOMICS (10% weight)
    let tokenScore, tokenGrade, tokenReason;
    if (supplyRatio > 90 && hasMaxSupply) {
      tokenScore = 4; tokenGrade = 'A'; tokenReason = 'Great supply dynamics';
    } else if (supplyRatio > 70) {
      tokenScore = 3; tokenGrade = 'B'; tokenReason = 'Good supply distribution';
    } else if (supplyRatio > 50) {
      tokenScore = 2; tokenGrade = 'C'; tokenReason = 'Moderate supply';
    } else if (supplyRatio > 30) {
      tokenScore = 1; tokenGrade = 'D'; tokenReason = 'Low circulating supply';
    } else {
      tokenScore = 0; tokenGrade = 'F'; tokenReason = 'Very low circulating supply';
    }
    totalScore += tokenScore * 0.10;
    breakdown.tokenomics = { 
      grade: tokenGrade, 
      value: `${supplyRatio.toFixed(1)}% circulating`, 
      reason: tokenReason,
      weight: '10%'
    };
    
    // 6. DEVELOPMENT ACTIVITY (8% weight)
    let devScore, devGrade, devReason;
    if (githubCommits > 50) {
      devScore = 4; devGrade = 'A'; devReason = 'Excellent development activity';
    } else if (githubCommits > 20) {
      devScore = 4; devGrade = 'A'; devReason = 'Very active development';
    } else if (githubCommits > 10) {
      devScore = 3; devGrade = 'B'; devReason = 'Active development';
    } else if (githubCommits > 5) {
      devScore = 2; devGrade = 'C'; devReason = 'Moderate development';
    } else if (githubCommits > 1) {
      devScore = 1; devGrade = 'D'; devReason = 'Low development';
    } else {
      devScore = 0; devGrade = 'F'; devReason = 'Inactive/Unknown development';
    }
    totalScore += devScore * 0.08;
    breakdown.development = { 
      grade: devGrade, 
      value: `${githubCommits} commits/month`, 
      reason: devReason,
      weight: '8%'
    };
    
    // 7. MATURITY & TRACK RECORD (7% weight)
    let maturityScore, maturityGrade, maturityReason;
    // Bitcoin is 15+ years old, should be the benchmark
    if (age >= 10) {
      maturityScore = 4; maturityGrade = 'A'; maturityReason = 'Well-established project';
    } else if (age >= 5) {
      maturityScore = 3.5; maturityGrade = 'A-'; maturityReason = 'Mature project';
    } else if (age >= 3) {
      maturityScore = 3; maturityGrade = 'B'; maturityReason = 'Established project';
    } else if (age >= 1) {
      maturityScore = 2; maturityGrade = 'C'; maturityReason = 'Young project';
    } else if (age > 0) {
      maturityScore = 1; maturityGrade = 'D'; maturityReason = 'Very new project';
    } else {
      maturityScore = 0; maturityGrade = 'F'; maturityReason = 'Unknown age';
    }
    totalScore += maturityScore * 0.07;
    breakdown.maturity = { 
      grade: maturityGrade, 
      value: age > 0 ? `${age} years old` : 'Unknown age', 
      reason: maturityReason,
      weight: '7%'
    };
    
    // 8. GROWTH POTENTIAL (5% weight) - Based on ATH distance and yearly performance
    let growthScore, growthGrade, growthReason;
    if (athDistance < 20 && priceChange1y > 50) {
      growthScore = 4; growthGrade = 'A'; growthReason = 'Near ATH with strong growth';
    } else if (athDistance < 40 && priceChange1y > 0) {
      growthScore = 3; growthGrade = 'B'; growthReason = 'Good recovery potential';
    } else if (athDistance < 70) {
      growthScore = 2; growthGrade = 'C'; growthReason = 'Moderate upside potential';
    } else if (athDistance < 90) {
      growthScore = 1; growthGrade = 'D'; growthReason = 'High risk/reward';
    } else {
      growthScore = 0; growthGrade = 'F'; growthReason = 'Far from ATH';
    }
    totalScore += growthScore * 0.05;
    breakdown.growthPotential = { 
      grade: growthGrade, 
      value: `${athDistance.toFixed(0)}% from ATH`, 
      reason: growthReason,
      weight: '5%'
    };
    
    // Convert total score to final grade
    // Adjusted thresholds - Bitcoin should be A (score ~3.2-3.3)
    let finalGrade;
    // Special case: Rank #1 (Bitcoin) gets a boost to ensure A grade
    if (rank === 1 && totalScore >= 3.0) {
      finalGrade = 'A';
    } else if (totalScore >= 3.5) {
      finalGrade = 'A';
    } else if (totalScore >= 3.2) {
      finalGrade = 'A-';
    } else if (totalScore >= 2.9) {
      finalGrade = 'B+';
    } else if (totalScore >= 2.6) {
      finalGrade = 'B';
    } else if (totalScore >= 2.3) {
      finalGrade = 'B-';
    } else if (totalScore >= 2.0) {
      finalGrade = 'C+';
    } else if (totalScore >= 1.7) {
      finalGrade = 'C';
    } else if (totalScore >= 1.3) {
      finalGrade = 'C-';
    } else if (totalScore >= 1.0) {
      finalGrade = 'D';
    } else {
      finalGrade = 'F';
    }
    
    // Build result
    const result = {
      coin: {
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        id: coin.id,
        image: coin.image?.large || coin.image?.small
      },
      grade: {
        final: finalGrade,
        score: totalScore.toFixed(2),
        maxScore: '4.00'
      },
      breakdown,
      metrics: {
        currentPrice: currentPrice,
        marketCap: marketCap >= 1e9 ? `$${(marketCap / 1e9).toFixed(2)}B` : `$${(marketCap / 1e6).toFixed(1)}M`,
        volume24h: `$${(volume24h / 1e6).toFixed(1)}M`,
        rank: `#${rank}`,
        athDistance: `${athDistance.toFixed(1)}% below ATH`,
        atlDistance: `${atlDistance.toFixed(0)}% above ATL`,
        circulatingSupply: circulatingSupply.toLocaleString(),
        totalSupply: totalSupply.toLocaleString(),
        maxSupply: maxSupply > 0 && maxSupply < 1e15 ? maxSupply.toLocaleString() : 'Unlimited',
        priceChange24h: md.price_change_percentage_24h || 0,
        priceChange7d: md.price_change_percentage_7d || 0,
        priceChange30d: md.price_change_percentage_30d || 0
      },
      community: {
        githubStars: githubStars > 0 ? githubStars.toLocaleString() : null,
        githubForks: githubForks > 0 ? githubForks.toLocaleString() : null,
        twitterFollowers: twitterFollowers > 0 ? twitterFollowers.toLocaleString() : null,
        redditSubscribers: redditSubscribers > 0 ? redditSubscribers.toLocaleString() : null
      }
    };
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error grading crypto:', error);
    return NextResponse.json(
      { error: 'Failed to grade cryptocurrency' },
      { status: 500 }
    );
  }
}

