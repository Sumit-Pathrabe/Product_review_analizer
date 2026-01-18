import { Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useReviewStore } from "@/stores/reviewStore";
import { format } from "date-fns";

export function DataPreviewTable() {
  const { reviews } = useReviewStore();

  if (reviews.length === 0) return null;

  const previewReviews = reviews.slice(0, 5);

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 ${
              star <= rating
                ? "text-warning fill-warning"
                : "text-muted-foreground"
            }`}
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Data Preview</CardTitle>
        <CardDescription>
          Showing first 5 of {reviews.length.toLocaleString()} reviews
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50%]">Review Text</TableHead>
                <TableHead className="w-[15%]">Rating</TableHead>
                <TableHead className="w-[20%]">Date</TableHead>
                <TableHead className="w-[15%]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewReviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell className="font-medium">
                    <p className="line-clamp-2 text-sm">{review.review_text}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {renderStars(review.rating)}
                      <span className="text-xs text-muted-foreground">
                        ({review.rating})
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(review.date)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      Pending
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {reviews.length > 5 && (
          <p className="text-sm text-muted-foreground text-center mt-4">
            And {(reviews.length - 5).toLocaleString()} more reviews...
          </p>
        )}
      </CardContent>
    </Card>
  );
}
