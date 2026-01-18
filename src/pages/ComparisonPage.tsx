import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useReviewStore } from "@/stores/reviewStore";
import { useNavigate } from "react-router-dom";
import { CompetitorUploadZone } from "@/components/comparison/CompetitorUploadZone";
import { ComparisonView } from "@/components/comparison/ComparisonView";
import { Swords, Play, Loader2, BarChart3, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AnalysisResult } from "@/types/review";

export default function ComparisonPage() {
  const navigate = useNavigate();
  const { 
    analysisResult, 
    competitor, 
    isCompetitorAnalyzing,
    competitorAnalysisProgress,
    setCompetitorAnalysisResult,
    setIsCompetitorAnalyzing,
    setCompetitorAnalysisProgress,
    apiConfig
  } = useReviewStore();

  const runCompetitorAnalysis = async () => {
    if (!competitor?.reviews.length) {
      toast.error("No competitor reviews to analyze");
      return;
    }

    setIsCompetitorAnalyzing(true);
    setCompetitorAnalysisProgress(0);

    try {
      const batchSize = 50;
      const batches = [];
      for (let i = 0; i < competitor.reviews.length; i += batchSize) {
        batches.push(competitor.reviews.slice(i, i + batchSize));
      }

      const allResults: any[] = [];
      
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        const { data, error } = await supabase.functions.invoke('analyze-reviews', {
          body: { reviews: batch, provider: apiConfig.provider },
        });

        if (error) throw error;
        allResults.push(data);
        setCompetitorAnalysisProgress(Math.round(((i + 1) / batches.length) * 100));
      }

      // Aggregate results (map edge-function output into AnalysisResult)
      const aggregated = aggregateResults(allResults, competitor.reviews);
      setCompetitorAnalysisResult(aggregated);
      toast.success("Competitor analysis complete!");
    } catch (error) {
      console.error("Competitor analysis error:", error);
      toast.error("Failed to analyze competitor reviews");
    } finally {
      setIsCompetitorAnalyzing(false);
    }
  };

  const aggregateResults = (results: any[], sourceReviews: { rating?: number }[]): AnalysisResult => {
    const sentiment = { positive: 0, neutral: 0, negative: 0 };
    const prosMap = new Map<string, number>();
    const consMap = new Map<string, number>();
    const themesMap = new Map<string, number>();
    const redFlags: AnalysisResult['redFlags'] = [];

    results.forEach((r) => {
      if (r?.sentiment) {
        sentiment.positive += r.sentiment.positive || 0;
        sentiment.neutral += r.sentiment.neutral || 0;
        sentiment.negative += r.sentiment.negative || 0;
      }
      r?.pros?.forEach((p: any) => prosMap.set(p.text, (prosMap.get(p.text) || 0) + (p.count || 0)));
      r?.cons?.forEach((c: any) => consMap.set(c.text, (consMap.get(c.text) || 0) + (c.count || 0)));
      r?.themes?.forEach((t: any) => themesMap.set(t.theme, (themesMap.get(t.theme) || 0) + (t.count || 0)));
      if (r?.redFlags) redFlags.push(...r.redFlags);
    });

    const ratingDist = [0, 0, 0, 0, 0];
    sourceReviews.forEach((rv) => {
      const rating = Number(rv.rating || 0);
      if (rating >= 1 && rating <= 5) ratingDist[rating - 1] += 1;
    });

    return {
      overallSentiment: sentiment,
      topPros: Array.from(prosMap.entries())
        .map(([text, count]) => ({ text, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      topCons: Array.from(consMap.entries())
        .map(([text, count]) => ({ text, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      keyThemes: Array.from(themesMap.entries())
        .map(([theme, count]) => ({ theme, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      ratingDistribution: ratingDist.map((count, i) => ({ rating: i + 1, count })),
      redFlags,
      sentimentTrend: [],
      totalReviews: sourceReviews.length,
      analyzedAt: new Date().toISOString(),
    };
  };

  // No analysis result yet
  if (!analysisResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <BarChart3 className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold">Analyze Your Reviews First</h2>
        <p className="text-muted-foreground mt-2 max-w-md">
          Before comparing with competitors, you need to analyze your own reviews
        </p>
        <Button className="mt-6" onClick={() => navigate("/analysis")}>
          Go to Analysis
        </Button>
      </div>
    );
  }

  // Has analysis, show comparison setup or results
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Swords className="w-7 h-7 text-primary" />
            Competitive Benchmarking
          </h1>
          <p className="text-muted-foreground mt-1">
            Compare your reviews against a competitor to find your competitive edge
          </p>
        </div>
      </div>

      {/* Competitor Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload Competitor Data</CardTitle>
          <CardDescription>
            Upload a CSV or JSON file containing your competitor's product reviews
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <CompetitorUploadZone />
          
          {competitor && !competitor.analysisResult && (
            <div className="pt-4 border-t">
              {isCompetitorAnalyzing ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing competitor reviews...
                    </span>
                    <span>{competitorAnalysisProgress}%</span>
                  </div>
                  <Progress value={competitorAnalysisProgress} />
                </div>
              ) : (
                <Button onClick={runCompetitorAnalysis} className="w-full">
                  <Play className="w-4 h-4 mr-2" />
                  Analyze {competitor.reviews.length.toLocaleString()} Competitor Reviews
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comparison View - shows when both are analyzed */}
      {competitor?.analysisResult && (
        <ComparisonView 
          yourResult={analysisResult}
          competitorResult={competitor.analysisResult}
          competitorName={competitor.name}
        />
      )}

      {/* Prompt to upload if no competitor */}
      {!competitor && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No Competitor Data</h3>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              Upload a competitor's review data above to see a side-by-side comparison
              and discover your competitive advantages
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}