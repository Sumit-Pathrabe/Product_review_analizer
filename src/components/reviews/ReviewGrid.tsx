import { useState, useMemo } from "react";
import { ReviewCard } from "./ReviewCard";
import { ReviewFilters } from "./ReviewFilters";
import { Button } from "@/components/ui/button";
import { useReviewStore } from "@/stores/reviewStore";
import { ChevronLeft, ChevronRight } from "lucide-react";

const REVIEWS_PER_PAGE = 12;

export function ReviewGrid() {
  const { reviews } = useReviewStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [showRedFlagsOnly, setShowRedFlagsOnly] = useState(false);

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      // Search filter
      if (searchQuery && !review.review_text.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Sentiment filter
      if (sentimentFilter !== "all" && review.sentiment !== sentimentFilter) {
        return false;
      }

      // Rating filter
      if (ratingFilter !== "all" && review.rating !== parseInt(ratingFilter)) {
        return false;
      }

      // Red flags filter
      if (showRedFlagsOnly && !review.isRedFlag) {
        return false;
      }

      return true;
    });
  }, [reviews, searchQuery, sentimentFilter, ratingFilter, showRedFlagsOnly]);

  const totalPages = Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE);
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * REVIEWS_PER_PAGE,
    currentPage * REVIEWS_PER_PAGE
  );

  // Reset to page 1 when filters change
  const handleFilterChange = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <ReviewFilters
        searchQuery={searchQuery}
        onSearchChange={(query) => {
          setSearchQuery(query);
          setCurrentPage(1);
        }}
        sentimentFilter={sentimentFilter}
        onSentimentChange={handleFilterChange(setSentimentFilter)}
        ratingFilter={ratingFilter}
        onRatingChange={handleFilterChange(setRatingFilter)}
        showRedFlagsOnly={showRedFlagsOnly}
        onRedFlagsToggle={() => {
          setShowRedFlagsOnly(!showRedFlagsOnly);
          setCurrentPage(1);
        }}
        totalCount={reviews.length}
        filteredCount={filteredReviews.length}
      />

      {paginatedReviews.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No reviews match your filters</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="icon"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-10"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
