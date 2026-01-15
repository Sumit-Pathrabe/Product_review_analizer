import { useCallback, useState } from "react";
import { Upload, FileText, X, CheckCircle, AlertCircle } from "lucide-react";
import Papa from "papaparse";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Review } from "@/types/review";
import { useReviewStore } from "@/stores/reviewStore";
import { toast } from "sonner";

interface ParsedRow {
  review_text?: string;
  text?: string;
  content?: string;
  review?: string;
  rating?: string | number;
  score?: string | number;
  stars?: string | number;
  date?: string;
  created_at?: string;
  timestamp?: string;
}

export function FileUploadZone() {
  const [isDragging, setIsDragging] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  
  const { setReviews, setUploadedFile, uploadedFile, clearAll } = useReviewStore();

  const parseFile = useCallback((file: File) => {
    setIsParsing(true);
    setParseError(null);
    setParseProgress(0);

    const isJSON = file.name.endsWith('.json');
    
    if (isJSON) {
      const reader = new FileReader();
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          setParseProgress((e.loaded / e.total) * 100);
        }
      };
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          const reviews = processData(Array.isArray(data) ? data : [data]);
          completeUpload(file, reviews);
        } catch {
          setParseError("Invalid JSON file format");
          setIsParsing(false);
        }
      };
      reader.onerror = () => {
        setParseError("Failed to read file");
        setIsParsing(false);
      };
      reader.readAsText(file);
    } else {
      let rowCount = 0;
      const allRows: ParsedRow[] = [];
      
      Papa.parse<ParsedRow>(file, {
        header: true,
        skipEmptyLines: true,
        chunk: (results, parser) => {
          rowCount += results.data.length;
          allRows.push(...results.data);
          // Estimate progress based on chunks processed
          const estimatedTotal = file.size / 100; // rough estimate
          setParseProgress(Math.min((rowCount / estimatedTotal) * 100, 95));
        },
        complete: () => {
          const reviews = processData(allRows);
          completeUpload(file, reviews);
        },
        error: (error) => {
          setParseError(error.message || "Failed to parse CSV file");
          setIsParsing(false);
        },
      });
    }
  }, []);

  const processData = (data: ParsedRow[]): Review[] => {
    return data
      .map((row, index) => {
        const reviewText = row.review_text || row.text || row.content || row.review || '';
        const rating = Number(row.rating || row.score || row.stars) || 0;
        const date = row.date || row.created_at || row.timestamp || new Date().toISOString();

        if (!reviewText.trim()) return null;

        return {
          id: `review-${index}-${Date.now()}`,
          review_text: reviewText.trim(),
          rating: Math.max(1, Math.min(5, rating || 3)),
          date: date,
        } as Review;
      })
      .filter((review): review is Review => review !== null);
  };

  const completeUpload = (file: File, reviews: Review[]) => {
    if (reviews.length === 0) {
      setParseError("No valid reviews found. Please ensure your file has 'review_text', 'rating', and 'date' columns.");
      setIsParsing(false);
      return;
    }

    setParseProgress(100);
    setReviews(reviews);
    setUploadedFile({
      name: file.name,
      size: file.size,
      reviews,
      uploadedAt: new Date().toISOString(),
    });
    setIsParsing(false);
    toast.success(`Successfully loaded ${reviews.length.toLocaleString()} reviews!`);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.csv') || file.name.endsWith('.json'))) {
      parseFile(file);
    } else {
      toast.error("Please upload a CSV or JSON file");
    }
  }, [parseFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      parseFile(file);
    }
  }, [parseFile]);

  const handleClear = () => {
    clearAll();
    setParseProgress(0);
    setParseError(null);
  };

  if (uploadedFile) {
    return (
      <Card className="border-success/30 bg-success/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-success/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{uploadedFile.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {uploadedFile.reviews.length.toLocaleString()} reviews loaded • 
                  {(uploadedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClear}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "border-2 border-dashed transition-all duration-200",
        isDragging ? "border-primary bg-accent/50" : "border-border hover:border-primary/50",
        parseError && "border-destructive/50 bg-destructive/5"
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <CardContent className="p-8 flex flex-col items-center justify-center gap-4 min-h-[200px]">
        {isParsing ? (
          <>
            <FileText className="w-12 h-12 text-primary animate-pulse" />
            <div className="w-full max-w-xs">
              <Progress value={parseProgress} className="h-2" />
              <p className="text-sm text-muted-foreground text-center mt-2">
                Parsing file... {Math.round(parseProgress)}%
              </p>
            </div>
          </>
        ) : parseError ? (
          <>
            <AlertCircle className="w-12 h-12 text-destructive" />
            <div className="text-center">
              <p className="text-destructive font-medium">{parseError}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setParseError(null)}
              >
                Try Again
              </Button>
            </div>
          </>
        ) : (
          <>
            <Upload className={cn(
              "w-12 h-12 transition-colors",
              isDragging ? "text-primary" : "text-muted-foreground"
            )} />
            <div className="text-center">
              <p className="font-medium text-foreground">
                {isDragging ? "Drop your file here" : "Drag & drop your file here"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Supports CSV and JSON files with review data
              </p>
            </div>
            <label>
              <input
                type="file"
                accept=".csv,.json"
                className="hidden"
                onChange={handleFileSelect}
              />
              <Button variant="outline" className="cursor-pointer" asChild>
                <span>Browse Files</span>
              </Button>
            </label>
            <p className="text-xs text-muted-foreground">
              Required columns: review_text, rating, date
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
