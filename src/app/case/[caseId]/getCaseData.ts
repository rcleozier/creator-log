import { YouTubeCase } from "@/types/case";
import Papa from "papaparse";

// Same Google Sheets CSV URL as the API route
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

export async function getAllCases(): Promise<YouTubeCase[]> {
  try {
    const response = await fetch(CSV_URL, {
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch CSV');
    }

    const csvText = await response.text();

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
            const findField = (fieldNames: string[]): string | undefined => {
              for (const fieldName of fieldNames) {
                const value = row[fieldName];
                if (value !== undefined && value !== null && String(value).trim() !== '') {
                  return String(value).trim();
                }
              }
              return undefined;
            };

            const channelName = findField(['channel name', 'channelname', 'name', 'Channel Name']);
            if (!channelName) return; // Skip rows without channel name

            const appealStatusRaw = findField(['appeal status', 'appealstatus', 'appeal']) || 'PENDING';
            let appealStatus = appealStatusRaw.toUpperCase().replace(/\s+/g, '_');
            if (appealStatus === 'REJECTED') {
              appealStatus = 'REJECTED';
            } else if (appealStatus === 'PENDING') {
              appealStatus = 'PENDING';
            } else if (appealStatus === 'DENIED') {
              appealStatus = 'DENIED';
            }

            const statusRaw = findField([
              'channel status',
              'channelstatus',
              'termination status'
            ]) || 'TERMINATED';

            const generateStableId = (): string => {
              const caseId = findField(['case id', 'caseid', 'id', 'Case ID']);
              if (caseId && caseId.trim() !== '') {
                const cleanId = caseId.replace(/^case-/i, '').trim();
                return cleanId;
              }
              
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
              
              if (channelName) {
                const slug = channelName
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/^-+|-+$/g, '')
                  .substring(0, 30);
                return slug;
              }
              
              return `case-${(index + 1).toString().padStart(3, '0')}`;
            };

            const caseItem: YouTubeCase = {
              id: generateStableId(),
              channelName: channelName || `Unnamed Channel ${index + 1}`,
              channelUrl: findField(['channel url', 'channelurl', 'url', 'channel link']),
              twitterHandle: (() => {
                const handle = findField([
                  'Twitter Handle', 'twitter handle', 'twitterhandle', 'twitter', 'x handle',
                  'x handle (twitter)', 'twitter/x', 'twitter username', 'twitterusername',
                  'x username', 'xusername', 'contact', 'twitter contact'
                ]);
                return handle;
              })(),
              status: (statusRaw.toUpperCase() as YouTubeCase['status']) || 'TERMINATED',
              reason: findField(['reason', 'reason given', 'reasongiven', 'termination reason']) || '',
              appealStatus: (appealStatus as YouTubeCase['appealStatus']) || 'PENDING',
              submittedDate: findField(['submitted date', 'submitteddate', 'submitted', 'date submitted']) || new Date().toISOString().split('T')[0],
              terminationDate: findField(['termination date', 'terminationdate', 'terminated', 'date']),
              lastUpdated: findField(['last updated', 'lastupdated', 'updated']),
              description: findField([
                'notes', 'Notes', 'description', 'why termination is wrongful - full story',
                'full story', 'story', 'details', 'explanation'
              ]),
              subscriberCount: (() => {
                const subs = findField(['subscriber count', 'subscribercount', 'subs', 'approx. subs', 'approx subs', 'subscribers']);
                return subs ? parseInt(subs) : undefined;
              })(),
              category: findField(['category', 'type']),
              niche: findField(['niche', 'niche/content type', 'niche/contenttype', 'content type', 'contenttype']),
              monetized: (() => {
                const monetizedValue = findField(['monetized', 'monetization', 'monetisation']);
                if (!monetizedValue) return undefined;
                const lower = monetizedValue.toLowerCase().trim();
                if (lower === 'yes' || lower === 'true' || lower === '1' || lower === 'y') return true;
                if (lower === 'no' || lower === 'false' || lower === '0' || lower === 'n') return false;
                return monetizedValue;
              })(),
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
    throw new Error(`Failed to fetch or parse Google Sheet data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}


