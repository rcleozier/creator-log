import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AptabaseProvider } from "./components/AptabaseProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Open Creator Log - YouTube Channel Appeal Tracker",
  description: "Tracking YouTube channel appeals and enforcement actions for transparency. Community-reported data on channel terminations, demonetizations, and reinstatements.",
  openGraph: {
    title: "Open Creator Log - YouTube Channel Appeal Tracker",
    description: "Tracking YouTube channel appeals and enforcement actions for transparency.",
    url: "https://opencreatorlog.com",
    siteName: "Open Creator Log",
    type: "website",
    images: [
      {
        url: "https://opencreatorlog.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Open Creator Log - YouTube Channel Appeal Tracker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Open Creator Log - YouTube Channel Appeal Tracker",
    description: "Tracking YouTube channel appeals and enforcement actions for transparency.",
    images: ["https://opencreatorlog.com/og-image.png"],
    creator: "@RobsManifesto",
  },
  metadataBase: new URL("https://opencreatorlog.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AptabaseProvider>
          {children}
        </AptabaseProvider>
      </body>
    </html>
  );
}
