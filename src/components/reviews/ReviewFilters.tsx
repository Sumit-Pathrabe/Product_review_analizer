import { Search, Filter, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface ReviewFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sentimentFilter: string;
  onSentimentChange: (sentiment: string) => void;
  ratingFilter: string;
  onRatingChange: (rating: string) => void;
  showRedFlagsOnly: boolean;
  onRedFlagsToggle: () => void;
  totalCount: number;
  filteredCount: number;
}

export function ReviewFilters({
  searchQuery,
  onSearchChange,
  sentimentFilter,
  onSentimentChange,
  ratingFilter,
  onRatingChange,
  showRedFlagsOnly,
  onRedFlagsToggle,
  totalCount,
  filteredCount,
}: ReviewFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search reviews by content... (e.g., 'screen', 'battery', 'shipping')"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4"
          />
        </div>

        <div className="flex gap-2">
          <Select value={sentimentFilter} onValueChange={onSentimentChange}>
            <SelectTrigger className="w-[140px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Sentiment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sentiments</SelectItem>
              <SelectItem value="positive">Positive</SelectItem>
              <SelectItem value="neutral">Neutral</SelectItem>
              <SelectItem value="negative">Negative</SelectItem>
            </SelectContent>
          </Select>

          <Select value={ratingFilter} onValueChange={onRatingChange}>
            <SelectTrigger className="w-[120px]">
              <Star className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="5">5 Stars</SelectItem>
              <SelectItem value="4">4 Stars</SelectItem>
              <SelectItem value="3">3 Stars</SelectItem>
              <SelectItem value="2">2 Stars</SelectItem>
              <SelectItem value="1">1 Star</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={showRedFlagsOnly ? "destructive" : "outline"}
            onClick={onRedFlagsToggle}
            className="whitespace-nowrap"
          >
            🚩 Red Flags
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <p className="text-muted-foreground">
          Showing <span className="font-medium text-foreground">{filteredCount.toLocaleString()}</span> of{" "}
          <span className="font-medium text-foreground">{totalCount.toLocaleString()}</span> reviews
        </p>
        {(searchQuery || sentimentFilter !== "all" || ratingFilter !== "all" || showRedFlagsOnly) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onSearchChange("");
              onSentimentChange("all");
              onRatingChange("all");
              if (showRedFlagsOnly) onRedFlagsToggle();
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}
