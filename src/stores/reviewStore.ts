import { create } from 'zustand';
import { Review, AnalysisResult, APIConfig, UploadedFile, CompetitorData } from '@/types/review';

interface ReviewStore {
  // Data
  reviews: Review[];
  uploadedFile: UploadedFile | null;
  analysisResult: AnalysisResult | null;
  
  // Competitor Data
  competitor: CompetitorData | null;
  isCompetitorAnalyzing: boolean;
  competitorAnalysisProgress: number;
  
  // API Config
  apiConfig: APIConfig;
  
  // Analysis State
  isAnalyzing: boolean;
  analysisProgress: number;
  analysisError: string | null;
  
  // Actions
  setReviews: (reviews: Review[]) => void;
  setUploadedFile: (file: UploadedFile | null) => void;
  setAnalysisResult: (result: AnalysisResult | null) => void;
  setAPIConfig: (config: Partial<APIConfig>) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  setAnalysisProgress: (progress: number) => void;
  setAnalysisError: (error: string | null) => void;
  updateReviewSentiment: (reviewId: string, sentiment: Review['sentiment'], isRedFlag?: boolean, redFlagReason?: string) => void;
  
  // Competitor Actions
  setCompetitor: (competitor: CompetitorData | null) => void;
  setCompetitorAnalysisResult: (result: AnalysisResult | null) => void;
  setIsCompetitorAnalyzing: (isAnalyzing: boolean) => void;
  setCompetitorAnalysisProgress: (progress: number) => void;
  clearCompetitor: () => void;
  
  clearAll: () => void;
}

export const useReviewStore = create<ReviewStore>((set) => ({
  // Initial State
  reviews: [],
  uploadedFile: null,
  analysisResult: null,
  competitor: null,
  isCompetitorAnalyzing: false,
  competitorAnalysisProgress: 0,
  apiConfig: {
    provider: 'lovable',
  },
  isAnalyzing: false,
  analysisProgress: 0,
  analysisError: null,
  
  // Actions
  setReviews: (reviews) => set({ reviews }),
  setUploadedFile: (file) => set({ uploadedFile: file }),
  setAnalysisResult: (result) => set({ analysisResult: result }),
  setAPIConfig: (config) => set((state) => ({ 
    apiConfig: { ...state.apiConfig, ...config } 
  })),
  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setAnalysisProgress: (progress) => set({ analysisProgress: progress }),
  setAnalysisError: (error) => set({ analysisError: error }),
  updateReviewSentiment: (reviewId, sentiment, isRedFlag, redFlagReason) => 
    set((state) => ({
      reviews: state.reviews.map((review) =>
        review.id === reviewId
          ? { ...review, sentiment, isRedFlag, redFlagReason }
          : review
      ),
    })),
  
  // Competitor Actions
  setCompetitor: (competitor) => set({ competitor }),
  setCompetitorAnalysisResult: (result) => 
    set((state) => ({
      competitor: state.competitor ? { ...state.competitor, analysisResult: result } : null
    })),
  setIsCompetitorAnalyzing: (isCompetitorAnalyzing) => set({ isCompetitorAnalyzing }),
  setCompetitorAnalysisProgress: (competitorAnalysisProgress) => set({ competitorAnalysisProgress }),
  clearCompetitor: () => set({ 
    competitor: null, 
    isCompetitorAnalyzing: false, 
    competitorAnalysisProgress: 0 
  }),
  
  clearAll: () => set({
    reviews: [],
    uploadedFile: null,
    analysisResult: null,
    competitor: null,
    isCompetitorAnalyzing: false,
    competitorAnalysisProgress: 0,
    isAnalyzing: false,
    analysisProgress: 0,
    analysisError: null,
  }),
}));
