/**
 * Sentry client-side configuration
 * This file configures Sentry for client-side error tracking
 */

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://0d39f542e63577abedf549afd5650491@o4505802780966912.ingest.us.sentry.io/4510567700692992",
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
  
  // Replay can be used to record user sessions and replay them when an error occurs
  replaysOnErrorSampleRate: 1.0,
  
  // This sets the sample rate to be 10%. You may want this to be 100% while in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,
  
  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  integrations: [
    Sentry.replayIntegration({
      // Additional Replay configuration goes in here, for example:
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  
  // Set environment
  environment: process.env.NODE_ENV || "development",
  
  // Filter out common errors that aren't actionable
  ignoreErrors: [
    // Browser extensions
    "top.GLOBALS",
    "originalCreateNotification",
    "canvas.contentDocument",
    "MyApp_RemoveAllHighlights",
    "atomicFindClose",
    "fb_xd_fragment",
    "bmi_SafeAddOnload",
    "EBCallBackMessageReceived",
    "conduitPage",
    // Network errors that are often not actionable
    "NetworkError",
    "Failed to fetch",
    "Network request failed",
  ],
  
  // Filter out URLs that might contain sensitive data
  beforeSend(event, hint) {
    // In development, you might want to see errors in console instead
    // Uncomment the following to disable Sentry in development:
    // if (process.env.NODE_ENV === "development") {
    //   return null;
    // }
    return event;
  },
});

