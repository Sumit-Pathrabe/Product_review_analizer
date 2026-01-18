import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AnalysisResult } from "@/types/review";
import { ThumbsUp, ThumbsDown, TrendingUp, TrendingDown, Minus, Star, Users } from "lucide-react";

interface ComparisonViewProps {
  yourResult: AnalysisResult;
  competitorResult: AnalysisResult;
  competitorName: string;
}

interface ComparisonItem {
  label: string;
  yourValue: number;
  competitorValue: number;
  type: 'higher-better' | 'lower-better';
}

export function ComparisonView({ yourResult, competitorResult, competitorName }: ComparisonViewProps) {
  // Safe calculations to handle 0 reviews
  const yourTotal = yourResult.totalReviews || 1;
  const competitorTotal = competitorResult.totalReviews || 1;
  
  const yourPositiveRate = Math.round((yourResult.overallSentiment.positive / yourTotal) * 100) || 0;
  const competitorPositiveRate = Math.round((competitorResult.overallSentiment.positive / competitorTotal) * 100) || 0;
  
  const yourNegativeRate = Math.round((yourResult.overallSentiment.negative / yourTotal) * 100) || 0;
  const competitorNegativeRate = Math.round((competitorResult.overallSentiment.negative / competitorTotal) * 100) || 0;

  const yourRatingSum = yourResult.ratingDistribution.reduce((sum, r) => sum + r.rating * r.count, 0);
  const yourRatingCount = yourResult.ratingDistribution.reduce((sum, r) => sum + r.count, 0);
  const yourAvgRating = yourRatingCount > 0 ? yourRatingSum / yourRatingCount : 0;
  
  const competitorRatingSum = competitorResult.ratingDistribution.reduce((sum, r) => sum + r.rating * r.count, 0);
  const competitorRatingCount = competitorResult.ratingDistribution.reduce((sum, r) => sum + r.count, 0);
  const competitorAvgRating = competitorRatingCount > 0 ? competitorRatingSum / competitorRatingCount : 0;

  const getWinner = (yours: number, theirs: number, higherBetter = true) => {
    if (yours === theirs) return 'tie';
    return higherBetter ? (yours > theirs ? 'you' : 'them') : (yours < theirs ? 'you' : 'them');
  };

  const WinnerBadge = ({ winner }: { winner: 'you' | 'them' | 'tie' }) => {
    if (winner === 'tie') return <Badge variant="secondary"><Minus className="w-3 h-3 mr-1" />Tie</Badge>;
    if (winner === 'you') return <Badge className="bg-success text-success-foreground"><TrendingUp className="w-3 h-3 mr-1" />You Win</Badge>;
    return <Badge variant="destructive"><TrendingDown className="w-3 h-3 mr-1" />They Win</Badge>;
  };

  // Find unique and overlapping pros/cons
  const yourProsSet = new Set(yourResult.topPros.map(p => p.text.toLowerCase()));
  const competitorProsSet = new Set(competitorResult.topPros.map(p => p.text.toLowerCase()));
  const yourConsSet = new Set(yourResult.topCons.map(c => c.text.toLowerCase()));
  const competitorConsSet = new Set(competitorResult.topCons.map(c => c.text.toLowerCase()));

  const uniqueYourPros = yourResult.topPros.filter(p => !competitorProsSet.has(p.text.toLowerCase()));
  const uniqueCompetitorPros = competitorResult.topPros.filter(p => !yourProsSet.has(p.text.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Header Stats Comparison */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center border-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Your Product</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{yourResult.totalReviews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">reviews</p>
          </CardContent>
        </Card>
        
        <Card className="text-center bg-muted/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-bold">VS</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Side by Side</p>
          </CardContent>
        </Card>
        
        <Card className="text-center border-warning/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{competitorName}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{competitorResult.totalReviews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">reviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" /> Key Metrics Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Average Rating */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Average Rating</span>
              <WinnerBadge winner={getWinner(yourAvgRating, competitorAvgRating)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>You</span>
                  <span className="font-semibold">{yourAvgRating.toFixed(1)} ★</span>
                </div>
                <Progress value={yourAvgRating * 20} className="h-2" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{competitorName}</span>
                  <span className="font-semibold">{competitorAvgRating.toFixed(1)} ★</span>
                </div>
                <Progress value={competitorAvgRating * 20} className="h-2 [&>div]:bg-warning" />
              </div>
            </div>
          </div>

          {/* Positive Sentiment Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                <ThumbsUp className="w-4 h-4 text-success" /> Positive Rate
              </span>
              <WinnerBadge winner={getWinner(yourPositiveRate, competitorPositiveRate)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>You</span>
                  <span className="font-semibold text-success">{yourPositiveRate}%</span>
                </div>
                <Progress value={yourPositiveRate} className="h-2 [&>div]:bg-success" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{competitorName}</span>
                  <span className="font-semibold text-success">{competitorPositiveRate}%</span>
                </div>
                <Progress value={competitorPositiveRate} className="h-2 [&>div]:bg-success" />
              </div>
            </div>
          </div>

          {/* Negative Sentiment Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                <ThumbsDown className="w-4 h-4 text-destructive" /> Negative Rate
              </span>
              <WinnerBadge winner={getWinner(yourNegativeRate, competitorNegativeRate, false)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>You</span>
                  <span className="font-semibold text-destructive">{yourNegativeRate}%</span>
                </div>
                <Progress value={yourNegativeRate} className="h-2 [&>div]:bg-destructive" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{competitorName}</span>
                  <span className="font-semibold text-destructive">{competitorNegativeRate}%</span>
                </div>
                <Progress value={competitorNegativeRate} className="h-2 [&>div]:bg-destructive" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Unique Strengths Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-success/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-success">
              <TrendingUp className="w-5 h-5" /> Your Unique Strengths
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {uniqueYourPros.length > 0 ? (
              uniqueYourPros.slice(0, 5).map((pro, i) => (
                <div key={i} className="flex justify-between items-center py-1">
                  <span className="text-sm">{pro.text}</span>
                  <Badge variant="secondary">{pro.count}</Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No unique strengths identified</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-warning/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <TrendingUp className="w-5 h-5" /> {competitorName}'s Unique Strengths
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {uniqueCompetitorPros.length > 0 ? (
              uniqueCompetitorPros.slice(0, 5).map((pro, i) => (
                <div key={i} className="flex justify-between items-center py-1">
                  <span className="text-sm">{pro.text}</span>
                  <Badge variant="secondary">{pro.count}</Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No unique strengths identified</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Side by Side Pros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ThumbsUp className="w-5 h-5 text-success" /> Top Pros Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground mb-3">Your Product</p>
              {yourResult.topPros.slice(0, 5).map((pro, i) => (
                <div key={i} className="flex justify-between items-center py-1 border-b border-border/50 last:border-0">
                  <span className="text-sm">{pro.text}</span>
                  <Badge variant="secondary">{pro.count}</Badge>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground mb-3">{competitorName}</p>
              {competitorResult.topPros.slice(0, 5).map((pro, i) => (
                <div key={i} className="flex justify-between items-center py-1 border-b border-border/50 last:border-0">
                  <span className="text-sm">{pro.text}</span>
                  <Badge variant="secondary">{pro.count}</Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Side by Side Cons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ThumbsDown className="w-5 h-5 text-destructive" /> Top Cons Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground mb-3">Your Product</p>
              {yourResult.topCons.slice(0, 5).map((con, i) => (
                <div key={i} className="flex justify-between items-center py-1 border-b border-border/50 last:border-0">
                  <span className="text-sm">{con.text}</span>
                  <Badge variant="secondary">{con.count}</Badge>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground mb-3">{competitorName}</p>
              {competitorResult.topCons.slice(0, 5).map((con, i) => (
                <div key={i} className="flex justify-between items-center py-1 border-b border-border/50 last:border-0">
                  <span className="text-sm">{con.text}</span>
                  <Badge variant="secondary">{con.count}</Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}