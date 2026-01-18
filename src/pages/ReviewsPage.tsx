import { ReviewGrid } from "@/components/reviews/ReviewGrid";
import { useReviewStore } from "@/stores/reviewStore";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function ReviewsPage() {
  const { reviews } = useReviewStore();
  const navigate = useNavigate();

  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <FileText className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold text-foreground">No Reviews Loaded</h2>
        <p className="text-muted-foreground mt-2 max-w-md">
          Upload a CSV or JSON file with your review data to get started
        </p>
        <Button className="mt-6" onClick={() => navigate("/upload")}>
          Go to Upload
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reviews</h1>
        <p className="text-muted-foreground mt-1">
          Browse and filter your review data
        </p>
      </div>
      <ReviewGrid />
    </div>
  );
}
