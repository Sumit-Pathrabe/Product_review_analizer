import { useState } from "react";
import { Brain, Play, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useReviewStore } from "@/stores/reviewStore";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function AnalysisPage() {
  const navigate = useNavigate();
  const { 
    reviews, 
    apiConfig, 
    isAnalyzing, 
    analysisProgress, 
    analysisResult,
    setIsAnalyzing,
    setAnalysisProgress,
    setAnalysisResult,
    setAnalysisError,
    updateReviewSentiment
  } = useReviewStore();

  const runAnalysis = async () => {
    if (reviews.length === 0) {
      toast.error("No reviews to analyze");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisError(null);

    try {
      const batchSize = 50;
      const batches = Math.ceil(reviews.length / batchSize);
      
      let allResults: any[] = [];
      
      for (let i = 0; i < batches; i++) {
        const batch = reviews.slice(i * batchSize, (i + 1) * batchSize);
        
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-reviews`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ 
            reviews: batch,
            provider: apiConfig.provider,
            customOpenAIKey: apiConfig.customOpenAIKey,
            customClaudeKey: apiConfig.customClaudeKey,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Analysis failed');
        }

        const result = await response.json();
        allResults.push(result);
        
        // Update individual review sentiments
        result.reviewAnalysis?.forEach((ra: any) => {
          updateReviewSentiment(ra.id, ra.sentiment, ra.isRedFlag, ra.redFlagReason);
        });

        setAnalysisProgress(((i + 1) / batches) * 100);
      }

      // Aggregate results
      const aggregated = aggregateResults(allResults, reviews.length);
      setAnalysisResult(aggregated);
      
      toast.success("Analysis complete!");
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(error instanceof Error ? error.message : 'Analysis failed');
      setAnalysisError(error instanceof Error ? error.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const aggregateResults = (results: any[], totalReviews: number) => {
    const sentiment = { positive: 0, neutral: 0, negative: 0 };
    const prosMap = new Map<string, number>();
    const consMap = new Map<string, number>();
    const themesMap = new Map<string, number>();
    const redFlags: any[] = [];
    const ratingDist = [0, 0, 0, 0, 0];

    results.forEach(r => {
      if (r.sentiment) {
        sentiment.positive += r.sentiment.positive || 0;
        sentiment.neutral += r.sentiment.neutral || 0;
        sentiment.negative += r.sentiment.negative || 0;
      }
      r.pros?.forEach((p: any) => prosMap.set(p.text, (prosMap.get(p.text) || 0) + p.count));
      r.cons?.forEach((c: any) => consMap.set(c.text, (consMap.get(c.text) || 0) + c.count));
      r.themes?.forEach((t: any) => themesMap.set(t.theme, (themesMap.get(t.theme) || 0) + t.count));
      if (r.redFlags) redFlags.push(...r.redFlags);
    });

    reviews.forEach(r => ratingDist[r.rating - 1]++);

    return {
      overallSentiment: sentiment,
      topPros: Array.from(prosMap.entries()).map(([text, count]) => ({ text, count })).sort((a, b) => b.count - a.count).slice(0, 5),
      topCons: Array.from(consMap.entries()).map(([text, count]) => ({ text, count })).sort((a, b) => b.count - a.count).slice(0, 5),
      redFlags,
      keyThemes: Array.from(themesMap.entries()).map(([theme, count]) => ({ theme, count })).sort((a, b) => b.count - a.count).slice(0, 10),
      sentimentTrend: [],
      ratingDistribution: ratingDist.map((count, i) => ({ rating: i + 1, count })),
      totalReviews,
      analyzedAt: new Date().toISOString(),
    };
  };

  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <Brain className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold">No Reviews to Analyze</h2>
        <p className="text-muted-foreground mt-2">Upload review data first</p>
        <Button className="mt-6" onClick={() => navigate("/upload")}>Go to Upload</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Analysis</h1>
        <p className="text-muted-foreground mt-1">Run AI-powered analysis on your reviews</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Review Analysis
          </CardTitle>
          <CardDescription>
            Analyze {reviews.length.toLocaleString()} reviews using {apiConfig.provider === 'lovable' ? 'Lovable AI' : 'Custom API'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isAnalyzing ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span>Analyzing reviews...</span>
              </div>
              <Progress value={analysisProgress} />
              <p className="text-sm text-muted-foreground">{Math.round(analysisProgress)}% complete</p>
            </div>
          ) : analysisResult ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-success" />
                <span>Analysis complete!</span>
                <Badge variant="secondary">{analysisResult.totalReviews} reviews</Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={runAnalysis}>Re-run</Button>
                <Button onClick={() => navigate("/insights")}>View Insights</Button>
              </div>
            </div>
          ) : (
            <Button onClick={runAnalysis} className="w-full gradient-primary">
              <Play className="w-4 h-4 mr-2" />
              Run Analysis
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
