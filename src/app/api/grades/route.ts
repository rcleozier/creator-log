import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const coinIds = searchParams.get('coins');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // If specific coins are requested
    if (coinIds) {
      const coinIdList = coinIds.split(',').map(id => id.trim());
      const grades = await Promise.all(
        coinIdList.map(async (coinId) => {
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/grade/${coinId}`);
            if (!response.ok) return null;
            return await response.json();
          } catch (error) {
            console.error(`Error fetching grade for ${coinId}:`, error);
            return null;
          }
        })
      );
      
      return NextResponse.json({
        success: true,
        data: grades.filter(grade => grade !== null),
        count: grades.filter(grade => grade !== null).length
      });
    }

    // Get top coins from CoinGecko
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=${Math.floor(offset / limit) + 1}&sparkline=false&price_change_percentage=24h,7d`,
      {
        next: { revalidate: 300 } // Cache for 5 minutes
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const coins: Array<{ id: string; name: string; symbol: string; image: string; current_price: number; market_cap: number; market_cap_rank: number; price_change_percentage_24h: number; total_volume: number }> = await response.json();
    
    // Get grades for the top coins
    const grades = await Promise.all(
      coins.map(async (coin) => {
        try {
          const gradeResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/grade/${coin.id}`);
          if (!gradeResponse.ok) return null;
          return await gradeResponse.json();
        } catch (error) {
          console.error(`Error fetching grade for ${coin.id}:`, error);
          return null;
        }
      })
    );

    const validGrades = grades.filter(grade => grade !== null);

    return NextResponse.json({
      success: true,
      data: validGrades,
      count: validGrades.length,
      pagination: {
        limit,
        offset,
        total: validGrades.length
      },
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'CoinGecko API + Custom Grading Algorithm'
      }
    });

  } catch (error) {
    console.error('Error fetching grades:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch grades',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST endpoint for batch grade requests
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { coinIds, includeDetails = false } = body;

    if (!coinIds || !Array.isArray(coinIds)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid request',
          message: 'coinIds must be an array of coin IDs'
        },
        { status: 400 }
      );
    }

    const grades = await Promise.all(
      coinIds.map(async (coinId: string) => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/grade/${coinId}`);
          if (!response.ok) return null;
          const gradeData = await response.json();
          
          // Return simplified data if includeDetails is false
          if (!includeDetails) {
            return {
              coin: {
                id: gradeData.coin.id,
                name: gradeData.coin.name,
                symbol: gradeData.coin.symbol,
                image: gradeData.coin.image
              },
              grade: gradeData.grade,
              metrics: {
                currentPrice: gradeData.metrics.currentPrice,
                marketCap: gradeData.metrics.marketCap,
                rank: gradeData.metrics.rank,
                priceChange24h: gradeData.metrics.priceChange24h
              },
              community: gradeData.community
            };
          }
          
          return gradeData;
        } catch (error) {
          console.error(`Error fetching grade for ${coinId}:`, error);
          return null;
        }
      })
    );

    const validGrades = grades.filter(grade => grade !== null);

    return NextResponse.json({
      success: true,
      data: validGrades,
      count: validGrades.length,
      requested: coinIds.length,
      metadata: {
        timestamp: new Date().toISOString(),
        includeDetails
      }
    });

  } catch (error) {
    console.error('Error processing batch request:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process request',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
