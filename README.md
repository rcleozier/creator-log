# Creator Visibility Log

A lightweight Next.js application for tracking YouTube channel appeals and enforcement actions. This project provides transparency and data for creators dealing with channel terminations, demonetizations, age restrictions, and strikes.

## Features

- **Searchable Case Browser**: Browse and search through community-reported YouTube channel cases
- **Filterable List**: Filter cases by status (Terminated, Reinstated, Demonetized, etc.)
- **Case Details Pages**: View detailed information about each case
- **Submit Case Form**: Link to Google Form for submitting new cases
- **Statistics Dashboard**: View aggregate statistics about cases
- **Dark Theme**: Clean, modern dark theme UI
- **Mobile-Friendly**: Responsive design that works on all devices

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Configuration

### Google Sheets Integration (Optional)

To pull data from a Google Sheet (typically exported from Google Forms):

1. Create a Google Sheet with the following columns (case-insensitive):
   - `id` - Unique case identifier (auto-generated if missing)
   - `channelName` or `channel name` - Name of the YouTube channel (required)
   - `channelUrl` or `channel url` - URL to the channel (channel/UC... format, optional)
   - `twitterHandle` or `twitter handle` - Twitter/X handle (optional)
   - `status` - Status: TERMINATED, REINSTATED, DEMONETIZED, AGE_RESTRICTED, STRUCK, UNDER_REVIEW (defaults to TERMINATED)
   - `reason` or `reason given` - Reason given by YouTube (required)
   - `appealStatus` or `appeal status` - PENDING, REJECTED, UNDER_REVIEW, DENIED, OVERTURNED, FINAL_DENIED (defaults to PENDING)
   - `submittedDate` or `submitted date` - Date case was submitted (YYYY-MM-DD or MM/DD/YYYY)
   - `terminationDate` or `termination date` - Date channel was terminated (MM/DD/YYYY format, optional)
   - `lastUpdated` or `last updated` - Last update date (optional)
   - `description` or `why termination is wrongful - full story` or `full story` - Detailed explanation (optional)
   - `subscriberCount` or `subscriber count` or `approx. subs` or `approx subs` - Approximate subscriber count (optional)
   - `category` - Channel category (optional)
   - `niche` or `niche/content type` - Content niche/type (optional)
   - `reviewTimeDays` or `review time days` - Days for review (optional)

2. Publish the sheet as CSV:
   - File → Share → Publish to web → CSV format
   - Copy the export URL

3. Set the environment variable:
   ```bash
   GOOGLE_SHEET_URL=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=0
   ```

If no Google Sheet URL is configured, the app will use the fallback JSON file at `public/data/cases-fallback.json`.

### Google Form Integration

To link the "Submit Case" page to your Google Form:

1. Create a Google Form for case submissions
2. Set the environment variable:
   ```bash
   NEXT_PUBLIC_GOOGLE_FORM_URL=https://docs.google.com/forms/d/YOUR_FORM_ID/viewform
   ```

Or edit `src/app/submit/page.tsx` and update the `GOOGLE_FORM_URL` constant.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── cases/          # API routes for fetching cases
│   ├── case/
│   │   └── [caseId]/       # Individual case detail pages
│   ├── submit/              # Submit case page
│   ├── components/          # Reusable components
│   ├── page.tsx             # Homepage with case browser
│   └── layout.tsx           # Root layout
├── types/
│   └── case.ts              # TypeScript types for cases
public/
└── data/
    └── cases-fallback.json  # Fallback data file
```

## Data Safety

All user-submitted text is automatically escaped to prevent XSS attacks. No raw HTML is rendered from case data.

## Disclaimer

This tracker displays community-reported claims that have not been verified by YouTube or any official source. All information is provided for transparency and informational purposes only.

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React 19** - UI library

## License

MIT
