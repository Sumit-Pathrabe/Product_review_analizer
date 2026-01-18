import { Star, AlertTriangle, ThumbsUp, Minus, ThumbsDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Review } from "@/types/review";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ReviewCardProps {
  review: Review;
  searchQuery?: string;
}

function highlightText(text: string, query: string) {
  if (!query.trim()) return text;
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, index) => 
    regex.test(part) ? (
      <mark key={index} className="bg-primary/40 text-foreground rounded px-0.5 py-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export function ReviewCard({ review, searchQuery = "" }: ReviewCardProps) {
  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "w-4 h-4",
              star <= rating
                ? "text-warning fill-warning"
                : "text-muted-foreground/30"
            )}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "MMM d, yyyy");
    } catch {
      return dateStr;
    }
  };

  const getSentimentIcon = () => {
    switch (review.sentiment) {
      case 'positive':
        return <ThumbsUp className="w-4 h-4" />;
      case 'negative':
        return <ThumbsDown className="w-4 h-4" />;
      case 'neutral':
        return <Minus className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getSentimentBadge = () => {
    if (!review.sentiment) return null;
    
    const variants = {
      positive: "bg-success/20 text-success border-success/30",
      neutral: "bg-muted text-muted-foreground border-muted-foreground/30",
      negative: "bg-destructive/20 text-destructive border-destructive/30",
    };

    return (
      <Badge 
        variant="outline" 
        className={cn("flex items-center gap-1", variants[review.sentiment])}
      >
        {getSentimentIcon()}
        <span className="capitalize">{review.sentiment}</span>
      </Badge>
    );
  };

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      review.isRedFlag && "border-destructive/50 bg-destructive/5"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            {renderStars(review.rating)}
            <span className="text-sm text-muted-foreground">
              {formatDate(review.date)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {review.isRedFlag && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Red Flag
              </Badge>
            )}
            {getSentimentBadge()}
          </div>
        </div>

        <p className="text-sm text-foreground leading-relaxed">
          {highlightText(review.review_text, searchQuery)}
        </p>

        {review.redFlagReason && (
          <div className="mt-3 p-2 rounded bg-destructive/10 border border-destructive/20">
            <p className="text-xs text-destructive">
              <AlertTriangle className="w-3 h-3 inline mr-1" />
              {review.redFlagReason}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
