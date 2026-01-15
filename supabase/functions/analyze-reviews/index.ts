import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reviews, provider } = await req.json();
    
    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
      return new Response(JSON.stringify({ error: "No reviews provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const reviewTexts = reviews.map((r: any, i: number) => `[${i}] Rating: ${r.rating}/5 - "${r.review_text}"`).join("\n");

    const systemPrompt = `You are a review analysis expert. Analyze the following product reviews and provide:
1. Sentiment for each review (positive/neutral/negative)
2. Red flag detection (fake reviews, shipping issues, quality concerns)
3. Top pros and cons mentioned
4. Key themes

Respond in JSON format:
{
  "reviewAnalysis": [{"id": "review-id", "sentiment": "positive|neutral|negative", "isRedFlag": boolean, "redFlagReason": "reason or null"}],
  "sentiment": {"positive": count, "neutral": count, "negative": count},
  "pros": [{"text": "pro description", "count": frequency}],
  "cons": [{"text": "con description", "count": frequency}],
  "themes": [{"theme": "theme name", "count": frequency}],
  "redFlags": [{"type": "fake_review|shipping_issue|quality_concern", "count": number, "examples": ["example"]}]
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze these ${reviews.length} reviews:\n\n${reviewTexts}` },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in AI response");
    }

    // Map back review IDs
    const result = JSON.parse(content);
    if (result.reviewAnalysis) {
      result.reviewAnalysis = result.reviewAnalysis.map((ra: any, i: number) => ({
        ...ra,
        id: reviews[i]?.id || `review-${i}`,
      }));
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Analysis failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
