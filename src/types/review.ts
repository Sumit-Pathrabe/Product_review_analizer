export interface Review {
  id: string;
  review_text: string;
  rating: number;
  date: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  isRedFlag?: boolean;
  redFlagReason?: string;
}

export interface AnalysisResult {
  overallSentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  topPros: Array<{ text: string; count: number }>;
  topCons: Array<{ text: string; count: number }>;
  redFlags: Array<{
    type: 'fake_review' | 'shipping_issue' | 'quality_concern';
    count: number;
    examples: string[];
  }>;
  keyThemes: Array<{ theme: string; count: number }>;
  sentimentTrend: Array<{
    date: string;
    positive: number;
    neutral: number;
    negative: number;
  }>;
  ratingDistribution: Array<{
    rating: number;
    count: number;
  }>;
  totalReviews: number;
  analyzedAt: string;
}

export interface APIConfig {
  provider: 'lovable' | 'custom';
  customOpenAIKey?: string;
  customClaudeKey?: string;
  scrapingAPIKey?: string;
}

export interface UploadedFile {
  name: string;
  size: number;
  reviews: Review[];
  uploadedAt: string;
}
