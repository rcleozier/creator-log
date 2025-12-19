import { NextResponse } from 'next/server';
import Papa from 'papaparse';
import { YouTubeCase } from '@/types/case';

// Same Google Sheets CSV URL as terminations endpoint
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

async function fetchFromGoogleSheet(): Promise<YouTubeCase[]> {
  try {
    const response = await fetch(CSV_URL, {
      next: { revalidate: 60 } // Cache and revalidate every 60 seconds
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Google Sheet: ${response.status}`);
    }

    const csvText = await response.text();

    if (!csvText || csvText.trim().length === 0) {
      throw new Error('CSV data is empty');
    }

    // Check if we got HTML instead of CSV (redirect or error page)
    if (csvText.trim().startsWith('<')) {
      throw new Error('Received HTML instead of CSV data. Check CSV URL.');
    }

    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
        transform: (value) => typeof value === 'string' ? value.trim() : value,
        complete: (results) => {
          const rows = (results.data as Record<string, any>[]).map(trimObject);
          const cases: YouTubeCase[] = [];

          rows.forEach((row: Record<string, any>, index: number) => {
            // Helper function to find field by multiple possible names (case-insensitive)
            const findField = (possibleNames: string[]): string | undefined => {
              const rowKeys = Object.keys(row);
              for (const name of possibleNames) {
                const found = rowKeys.find(key => key.toLowerCase() === name.toLowerCase());
                if (found && row[found]) {
                  return row[found].toString().trim();
                }
              }
              return undefined;
            };

            // Find channel name with multiple possible column names
            let channelName = findField([
              'channel name',
              'channelname',
              'channel',
              'name',
              'Channel Name',
              'Channel'
            ]);

            // If no channel name found, try to use first non-empty text field
            if (!channelName || channelName.length === 0) {
              const firstNonEmpty = Object.values(row).find(val => 
                val && typeof val === 'string' && val.trim().length > 0
              );
              if (firstNonEmpty) {
                channelName = firstNonEmpty.toString().trim();
              } else {
                // Don't skip - use row index as channel name if nothing else works
                channelName = `Case ${index + 1}`;
              }
            }

            // Handle appeal status
            const appealStatusRaw = findField([
              'appeal status',
              'appealstatus',
              'appeal',
              'status'
            ]) || 'PENDING';
            
            let appealStatus = appealStatusRaw.toUpperCase().replace(/\s+/g, '_');
            if (appealStatus === 'REJECTED') {
              appealStatus = 'REJECTED';
            } else if (appealStatus === 'PENDING') {
              appealStatus = 'PENDING';
            } else if (appealStatus === 'DENIED') {
              appealStatus = 'DENIED';
            }

            // Find status - use Channel Status only (Status is internal column, not for display)
            const statusRaw = findField([
              'channel status',
              'channelstatus',
              'termination status'
            ]) || 'TERMINATED';

            // Generate a stable ID based on Case ID column (so IDs don't change when rows are removed)
            const generateStableId = (): string => {
              // First priority: Use explicit Case ID column
              const caseId = findField(['case id', 'caseid', 'id', 'Case ID']);
              if (caseId && caseId.trim() !== '') {
                // Remove "case-" prefix if present to keep IDs clean
                const cleanId = caseId.replace(/^case-/i, '').trim();
                return cleanId;
              }
              
              // Second priority: Generate a stable ID from channel URL
              const channelUrl = findField(['channel url', 'channelurl', 'url', 'channel link']);
              if (channelUrl) {
                try {
                  const url = new URL(channelUrl);
                  const pathParts = url.pathname.split('/').filter(p => p);
                  const identifier = pathParts[pathParts.length - 1] || pathParts[0];
                  if (identifier && identifier.length > 0) {
                    const cleanId = identifier.replace('@', '').toLowerCase();
                    return cleanId.substring(0, 20);
                  }
                } catch (e) {
                  // If URL parsing fails, fall through to channel name
                }
              }
              
              // Third priority: Fall back to channel name (slugified) - channelName is already defined above
              if (channelName) {
                const slug = channelName
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/^-+|-+$/g, '')
                  .substring(0, 30);
                return slug;
              }
              
              // Last resort: use index (but this is not ideal)
              return `case-${(index + 1).toString().padStart(3, '0')}`;
            };

            const caseItem: YouTubeCase = {
              id: generateStableId(),
              channelName: channelName || `Unnamed Channel ${index + 1}`,
              channelUrl: findField(['channel url', 'channelurl', 'url', 'channel link']),
              twitterHandle: findField([
                'Twitter Handle',  // Exact match for the column name
                'twitter handle', 
                'twitterhandle', 
                'twitter', 
                'x handle',
                'x handle (twitter)',
                'twitter/x',
                'twitter username',
                'twitterusername',
                'x username',
                'xusername',
                'contact',
                'twitter contact'
              ]),
              status: (statusRaw.toUpperCase() as YouTubeCase['status']) || 'TERMINATED',
              reason: findField(['reason', 'reason given', 'reasongiven', 'termination reason']) || '',
              appealStatus: (appealStatus as YouTubeCase['appealStatus']) || 'PENDING',
              submittedDate: findField(['submitted date', 'submitteddate', 'submitted', 'date submitted']) || new Date().toISOString().split('T')[0],
              terminationDate: findField(['termination date', 'terminationdate', 'terminated', 'date']),
              lastUpdated: findField(['last updated', 'lastupdated', 'updated']),
              description: findField([
                'notes',
                'Notes',
                'description',
                'why termination is wrongful - full story',
                'full story',
                'story',
                'details',
                'explanation'
              ]),
              subscriberCount: (() => {
                const subs = findField(['subscriber count', 'subscribercount', 'subs', 'approx. subs', 'approx subs', 'subscribers']);
                return subs ? parseInt(subs) : undefined;
              })(),
              category: findField(['category', 'type']),
              niche: findField(['niche', 'niche/content type', 'niche/contenttype', 'content type', 'contenttype']),
            };

            cases.push(caseItem);
          });

          resolve(cases);
        },
        error: (error: Error) => {
          reject(new Error(`Failed to parse CSV: ${error.message}`));
        }
      });
    });
  } catch (error) {
    throw error;
  }
}

async function getFallbackData(): Promise<YouTubeCase[]> {
  try {
    // Read from public folder directly using Node.js fs
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(process.cwd(), 'public', 'data', 'cases-fallback.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    // Return empty array if fallback also fails
    return [];
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let cases: YouTubeCase[] = [];

    // Try Google Sheet first, fallback to JSON
        try {
          cases = await fetchFromGoogleSheet();
        } catch (error) {
          cases = await getFallbackData();
        }

    // Apply filters
    if (status) {
      cases = cases.filter(c => c.status === status.toUpperCase());
    }

    if (search) {
      const searchLower = search.toLowerCase();
      cases = cases.filter(c => 
        c.channelName.toLowerCase().includes(searchLower) ||
        c.reason.toLowerCase().includes(searchLower) ||
        c.description?.toLowerCase().includes(searchLower)
      );
    }

        return NextResponse.json(cases);
      } catch (error) {
        return NextResponse.json(
          { error: 'Failed to fetch cases' },
          { status: 500 }
        );
      }
}

