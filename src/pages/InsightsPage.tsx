import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useReviewStore } from "@/stores/reviewStore";
import { useNavigate } from "react-router-dom";
import { BarChart3, Download, ThumbsUp, ThumbsDown, AlertTriangle, Tag } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];
const SENTIMENT_COLORS = { positive: 'hsl(var(--success))', neutral: 'hsl(var(--muted-foreground))', negative: 'hsl(var(--destructive))' };

export default function InsightsPage() {
  const { analysisResult, reviews } = useReviewStore();
  const navigate = useNavigate();

  const exportPDF = () => {
    if (!analysisResult) return;
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Review Intelligence Report", 20, 20);
    doc.setFontSize(12);
    doc.text(`Total Reviews: ${analysisResult.totalReviews}`, 20, 35);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 42);
    doc.text("Sentiment Breakdown:", 20, 55);
    doc.text(`  Positive: ${analysisResult.overallSentiment.positive}`, 25, 62);
    doc.text(`  Neutral: ${analysisResult.overallSentiment.neutral}`, 25, 69);
    doc.text(`  Negative: ${analysisResult.overallSentiment.negative}`, 25, 76);
    doc.text("Top Pros:", 20, 90);
    analysisResult.topPros.forEach((p, i) => doc.text(`  ${i + 1}. ${p.text} (${p.count})`, 25, 97 + i * 7));
    doc.text("Top Cons:", 20, 140);
    analysisResult.topCons.forEach((c, i) => doc.text(`  ${i + 1}. ${c.text} (${c.count})`, 25, 147 + i * 7));
    doc.save("review-analysis-report.pdf");
    toast.success("PDF exported!");
  };

  const exportExcel = () => {
    if (!analysisResult) return;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(reviews), "Reviews");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(analysisResult.topPros), "Top Pros");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(analysisResult.topCons), "Top Cons");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(analysisResult.ratingDistribution), "Ratings");
    XLSX.writeFile(wb, "review-analysis.xlsx");
    toast.success("Excel exported!");
  };

  if (!analysisResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <BarChart3 className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold">No Analysis Data</h2>
        <p className="text-muted-foreground mt-2">Run analysis on your reviews first</p>
        <Button className="mt-6" onClick={() => navigate("/analysis")}>Go to Analysis</Button>
      </div>
    );
  }

  const sentimentData = [
    { name: 'Positive', value: analysisResult.overallSentiment.positive, color: SENTIMENT_COLORS.positive },
    { name: 'Neutral', value: analysisResult.overallSentiment.neutral, color: SENTIMENT_COLORS.neutral },
    { name: 'Negative', value: analysisResult.overallSentiment.negative, color: SENTIMENT_COLORS.negative },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Insights Dashboard</h1>
          <p className="text-muted-foreground mt-1">{analysisResult.totalReviews.toLocaleString()} reviews analyzed</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportPDF}><Download className="w-4 h-4 mr-2" />PDF</Button>
          <Button variant="outline" onClick={exportExcel}><Download className="w-4 h-4 mr-2" />Excel</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2"><ThumbsUp className="w-4 h-4 text-success" />Positive</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{analysisResult.overallSentiment.positive}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2"><ThumbsDown className="w-4 h-4 text-destructive" />Negative</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{analysisResult.overallSentiment.negative}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-warning" />Red Flags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{analysisResult.redFlags.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analysisResult.ratingDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="rating" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sentiment Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={sentimentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ThumbsUp className="w-4 h-4 text-success" />Top Pros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysisResult.topPros.map((pro, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-sm">{pro.text}</span>
                <Badge variant="secondary">{pro.count}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ThumbsDown className="w-4 h-4 text-destructive" />Top Cons</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysisResult.topCons.map((con, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-sm">{con.text}</span>
                <Badge variant="secondary">{con.count}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Tag className="w-4 h-4" />Key Themes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {analysisResult.keyThemes.map((theme, i) => (
              <Badge key={i} variant="outline" className="text-sm py-1 px-3">
                {theme.theme} <span className="ml-1 text-muted-foreground">({theme.count})</span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
