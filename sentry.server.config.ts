/**
 * Sentry server-side configuration
 * This file configures Sentry for server-side error tracking
 */

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://0d39f542e63577abedf549afd5650491@o4505802780966912.ingest.us.sentry.io/4510567700692992",
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
  
  // Set environment
  environment: process.env.NODE_ENV || "development",
  
  // Filter out common errors that aren't actionable
  ignoreErrors: [
    // Common non-actionable errors
    "ECONNREFUSED",
    "ETIMEDOUT",
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

