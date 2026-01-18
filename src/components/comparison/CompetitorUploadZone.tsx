import { useState, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileSpreadsheet, X, CheckCircle, Loader2 } from "lucide-react";
import { useReviewStore } from "@/stores/reviewStore";
import { Review } from "@/types/review";
import { toast } from "sonner";
import Papa from "papaparse";

interface ParsedRow {
  review_text?: string;
  text?: string;
  content?: string;
  review?: string;
  rating?: number | string;
  stars?: number | string;
  score?: number | string;
  date?: string;
  created_at?: string;
  timestamp?: string;
}

export function CompetitorUploadZone() {
  const { competitor, setCompetitor, clearCompetitor } = useReviewStore();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [competitorName, setCompetitorName] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const processData = useCallback((data: ParsedRow[]): Review[] => {
    return data
      .filter(row => row.review_text || row.text || row.content || row.review)
      .map((row, index) => ({
        id: `competitor-${index + 1}`,
        review_text: (row.review_text || row.text || row.content || row.review || '').toString(),
        rating: Number(row.rating || row.stars || row.score || 0),
        date: (row.date || row.created_at || row.timestamp || new Date().toISOString()).toString(),
      }));
  }, []);

  const parseFile = useCallback(async (file: File) => {
    const deriveName = (filename: string) => filename.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ").trim();
    const effectiveName = competitorName.trim() || deriveName(file.name);

    if (!effectiveName) {
      setError("Please enter a competitor name first");
      return;
    }

    if (!competitorName.trim()) {
      setCompetitorName(effectiveName);
    }
    
    setIsParsing(true);
    setError(null);
    setParseProgress(0);

    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      if (fileExtension === 'json') {
        const text = await file.text();
        const jsonData = JSON.parse(text);
        const data = Array.isArray(jsonData) ? jsonData : jsonData.reviews || jsonData.data || [];
        const reviews = processData(data);
        
        if (reviews.length === 0) {
          throw new Error("No valid reviews found in file");
        }

        setCompetitor({
          name: effectiveName,
          file: {
            name: file.name,
            size: file.size,
            reviews,
            uploadedAt: new Date().toISOString(),
          },
          reviews,
          analysisResult: null,
        });
        toast.success(`Loaded ${reviews.length} competitor reviews`);
      } else if (fileExtension === 'csv') {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const reviews = processData(results.data as ParsedRow[]);
            if (reviews.length === 0) {
              setError("No valid reviews found in file");
              setIsParsing(false);
              return;
            }
            setCompetitor({
              name: effectiveName,
              file: {
                name: file.name,
                size: file.size,
                reviews,
                uploadedAt: new Date().toISOString(),
              },
              reviews,
              analysisResult: null,
            });
            toast.success(`Loaded ${reviews.length} competitor reviews`);
            setIsParsing(false);
          },
          error: (err) => {
            setError(`Parse error: ${err.message}`);
            setIsParsing(false);
          },
        });
        return;
      } else {
        throw new Error("Unsupported file format. Use CSV or JSON.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse file");
    } finally {
      setIsParsing(false);
    }
  }, [competitorName, processData, setCompetitor]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) parseFile(file);
  }, [parseFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
  }, [parseFile]);

  if (competitor) {
    return (
      <Card className="border-success/50 bg-success/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-success" />
              <div>
                <p className="font-medium">{competitor.name}</p>
                <p className="text-sm text-muted-foreground">
                  {competitor.file.name} • {competitor.reviews.length.toLocaleString()} reviews
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={clearCompetitor}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="competitor-name">Competitor Name</Label>
        <Input
          id="competitor-name"
          placeholder="e.g., Brand X, Competitor Product"
          value={competitorName}
          onChange={(e) => setCompetitorName(e.target.value)}
        />
      </div>

      <Card
        className={`border-2 border-dashed transition-all duration-200 ${
          isDragOver ? 'border-primary bg-primary/5' : 
          error ? 'border-destructive' : 'border-muted-foreground/30'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        <CardContent className="py-8">
          {isParsing ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Parsing competitor data...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="p-3 rounded-full bg-muted">
                <FileSpreadsheet className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm">Upload Competitor Reviews</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Drag & drop or click to select CSV/JSON
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json"
                className="hidden"
                onChange={handleFileSelect}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isParsing}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Browse file
              </Button>
              {error && <p className="text-xs text-destructive">{error}</p>}
              {!competitorName.trim() && (
                <p className="text-xs text-muted-foreground">Enter competitor name first</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}