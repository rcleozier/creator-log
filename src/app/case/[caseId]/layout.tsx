import type { Metadata } from "next";
import { getAllCases } from "./getCaseData";

/**
 * Generate metadata for individual case pages
 * This ensures proper Open Graph and Twitter Card images for sharing
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ caseId: string }>;
}): Promise<Metadata> {
  const { caseId } = await params;
  
  try {
    // Get all cases and find the matching one
    const cases = await getAllCases();
    
    // Remove "case-" prefix if present for backward compatibility
    const normalizedCaseId = caseId.startsWith('case-') ? caseId.replace(/^case-/i, '') : caseId;
    
    // Try exact match first (with and without case- prefix)
    let caseData = cases.find(c => {
      const cId = String(c.id).toLowerCase();
      const searchId = caseId.toLowerCase();
      const normalizedSearchId = normalizedCaseId.toLowerCase();
      return cId === searchId || cId === normalizedSearchId || cId === `case-${normalizedSearchId}`;
    });
    
    // If not found, try normalizing the ID (handle case-14 vs case-014)
    if (!caseData) {
      const match = caseId.match(/case-0*(\d+)/i);
      if (match) {
        const num = parseInt(match[1]);
        caseData = cases.find(c => {
          const cMatch = String(c.id).match(/case-0*(\d+)/i);
          return cMatch && parseInt(cMatch[1]) === num;
        });
      }
    }
    
    // Also try matching without "case-" prefix if it's a numeric ID
    if (!caseData && /^\d+$/.test(normalizedCaseId)) {
      const num = parseInt(normalizedCaseId);
      caseData = cases.find(c => {
        const cMatch = String(c.id).match(/case-0*(\d+)/i);
        if (cMatch) {
          return parseInt(cMatch[1]) === num;
        }
        // Also try direct numeric match
        return String(c.id) === normalizedCaseId || String(c.id) === `case-${normalizedCaseId}`;
      });
    }
    
    if (!caseData) {
      // Return generic metadata instead of "Case Not Found" to avoid misleading titles
      // The client-side page will handle the actual error display
      return {
        title: "Case Details - Open Creator Log",
        description: "View details about a YouTube channel appeal case.",
        openGraph: {
          title: "Case Details - Open Creator Log",
          description: "View details about a YouTube channel appeal case.",
          url: `https://opencreatorlog.com/case/${caseId}`,
          siteName: "Open Creator Log",
          type: "website",
          images: [
            {
              url: "https://opencreatorlog.com/og-image.png",
              width: 1200,
              height: 630,
              alt: "Open Creator Log",
            },
          ],
        },
        twitter: {
          card: "summary_large_image",
          title: "Case Details - Open Creator Log",
          description: "View details about a YouTube channel appeal case.",
          images: ["https://opencreatorlog.com/og-image.png"],
          creator: "@RobsManifesto",
        },
      };
    }
    
    const title = `${caseData.channelName} - Open Creator Log`;
    const description = caseData.description 
      ? `${caseData.description.substring(0, 150)}...`
      : `Channel status: ${caseData.status}. ${caseData.reason}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `https://opencreatorlog.com/case/${caseData.id}`,
        siteName: "Open Creator Log",
        type: "website",
        images: [
          {
            url: "https://opencreatorlog.com/og-image.png",
            width: 1200,
            height: 630,
            alt: `${caseData.channelName} - Open Creator Log`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: ["https://opencreatorlog.com/og-image.png"],
        creator: "@RobsManifesto",
      },
    };
  } catch (error) {
    // Return default metadata on error
    return {
      title: "Case Details - Open Creator Log",
      description: "View details about a YouTube channel appeal case.",
    };
  }
}

export default function CaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
