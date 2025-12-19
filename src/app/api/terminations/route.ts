import { NextResponse } from 'next/server';
import Papa from 'papaparse';

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRu1g6643MWSvcXx89zDPZ4v4lH9Qrnz-DNt7yjD-IpDcprCKroFgOt9alcXswcqC_U91Bb2MUCSu-Q/pub?gid=353964355&single=true&output=csv';

function trimObject(obj: Record<string, any>): Record<string, any> {
  const trimmed: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const trimmedKey = key.trim();
    const trimmedValue = typeof value === 'string' ? value.trim() : value;
    trimmed[trimmedKey] = trimmedValue;
  }
  return trimmed;
}

export async function GET() {
  try {
    const response = await fetch(CSV_URL, {
      next: { revalidate: 60 } // Cache and revalidate every 60 seconds
    });

    if (!response.ok) {
      return NextResponse.json(
        { 
          error: 'Failed to fetch CSV data',
          status: response.status,
          statusText: response.statusText
        },
        { status: 500 }
      );
    }

    const csvText = await response.text();

    if (!csvText || csvText.trim().length === 0) {
      return NextResponse.json(
        { error: 'CSV data is empty' },
        { status: 500 }
      );
    }

    return new Promise((resolve) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
        transform: (value) => typeof value === 'string' ? value.trim() : value,
        complete: (results) => {
          if (results.errors && results.errors.length > 0) {
            console.error('CSV parsing errors:', results.errors);
            // Continue anyway, but log errors
          }

          const data = results.data.map(trimObject);
          
          resolve(NextResponse.json({
            data,
            meta: {
              totalRows: data.length,
              columns: results.meta.fields || [],
              parsedAt: new Date().toISOString()
            }
          }));
        },
        error: (error) => {
          resolve(NextResponse.json(
            { 
              error: 'Failed to parse CSV',
              details: error.message
            },
            { status: 500 }
          ));
        }
      });
    });
  } catch (error) {
    console.error('Error fetching terminations CSV:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch terminations data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

