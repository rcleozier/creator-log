export interface YouTubeCase {
  id: string;
  channelName: string;
  channelUrl?: string;
  twitterHandle?: string;
  status: 'TERMINATED' | 'REINSTATED' | 'DEMONETIZED' | 'AGE_RESTRICTED' | 'STRUCK' | 'UNDER_REVIEW';
  reason: string;
  appealStatus: 'PENDING' | 'UNDER_REVIEW' | 'DENIED' | 'OVERTURNED' | 'FINAL_DENIED' | 'REJECTED';
  submittedDate: string;
  terminationDate?: string;
  lastUpdated?: string;
  description?: string;
  subscriberCount?: number;
  category?: string;
  niche?: string;
  monetized?: boolean | string; // Can be boolean or string like "Yes"/"No"
}

export interface CaseStats {
  totalCases: number;
  reinstated: number;
  terminated: number;
  underReview: number;
}

