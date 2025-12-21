/**
 * Sentry edge runtime configuration
 * This file configures Sentry for edge runtime error tracking
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
});


