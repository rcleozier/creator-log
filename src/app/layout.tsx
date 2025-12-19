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
  title: "Creator Visibility Log - YouTube Channel Appeal Tracker",
  description: "Tracking YouTube channel appeals and enforcement actions for transparency. Community-reported data on channel terminations, demonetizations, and reinstatements.",
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
