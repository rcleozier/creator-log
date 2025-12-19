import { NextResponse } from 'next/server';

interface BreakdownItem {
  grade: string;
  value: string;
  reason: string;
  weight: string;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ coinId: string }> }
) {
  try {
    const { coinId } = await params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'full'; // 'full' or 'summary'
    
    // Fetch the grade data
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/grade/${coinId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Coin not found',
            message: `No grade data available for ${coinId}`
          },
          { status: 404 }
        );
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const gradeData = await response.json();
    
    // Return summary format for mobile apps
    if (format === 'summary') {
      return NextResponse.json({
        success: true,
        data: {
          coin: {
            id: gradeData.coin.id,
            name: gradeData.coin.name,
            symbol: gradeData.coin.symbol,
            image: gradeData.coin.image
          },
          grade: {
            final: gradeData.grade.final,
            score: parseFloat(gradeData.grade.score),
            maxScore: 4.0
          },
          metrics: {
            currentPrice: gradeData.metrics.currentPrice,
            marketCap: gradeData.metrics.marketCap,
            rank: gradeData.metrics.rank,
            priceChange24h: gradeData.metrics.priceChange24h,
            priceChange7d: gradeData.metrics.priceChange7d,
            priceChange30d: gradeData.metrics.priceChange30d
          },
          community: gradeData.community,
          breakdown: Object.entries(gradeData.breakdown).map(([key, data]) => ({
            category: key,
            grade: (data as BreakdownItem).grade,
            score: (data as BreakdownItem).value,
            weight: (data as BreakdownItem).weight,
            reason: (data as BreakdownItem).reason
          }))
        },
        metadata: {
          timestamp: new Date().toISOString(),
          format: 'summary'
        }
      });
    }
    
    // Return full format
    return NextResponse.json({
      success: true,
      data: gradeData,
      metadata: {
        timestamp: new Date().toISOString(),
        format: 'full'
      }
    });

  } catch (error) {
    console.error('Error fetching grade:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch grade',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
