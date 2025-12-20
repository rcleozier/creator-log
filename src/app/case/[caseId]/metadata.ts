import type { Metadata } from "next";
import { YouTubeCase } from "@/types/case";

/**
 * Generate metadata for individual case pages
 * This ensures proper Open Graph and Twitter Card images for sharing
 */
export function generateCaseMetadata(caseData: YouTubeCase): Metadata {
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
}

