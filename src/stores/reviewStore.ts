import { create } from 'zustand';
import { Review, AnalysisResult, APIConfig, UploadedFile } from '@/types/review';

interface ReviewStore {
  // Data
  reviews: Review[];
  uploadedFile: UploadedFile | null;
  analysisResult: AnalysisResult | null;
  
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
  clearAll: () => void;
}

export const useReviewStore = create<ReviewStore>((set) => ({
  // Initial State
  reviews: [],
  uploadedFile: null,
  analysisResult: null,
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
  clearAll: () => set({
    reviews: [],
    uploadedFile: null,
    analysisResult: null,
    isAnalyzing: false,
    analysisProgress: 0,
    analysisError: null,
  }),
}));
