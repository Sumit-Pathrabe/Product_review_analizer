import { useState } from "react";
import { Key, Zap, Eye, EyeOff, Check, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useReviewStore } from "@/stores/reviewStore";
import { cn } from "@/lib/utils";

export function APIConfigPanel() {
  const { apiConfig, setAPIConfig } = useReviewStore();
  const [showKeys, setShowKeys] = useState({
    openai: false,
    claude: false,
    scraping: false,
  });

  const isLovableActive = apiConfig.provider === 'lovable';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5" />
          API Configuration
        </CardTitle>
        <CardDescription>
          Configure your AI provider and API keys for analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="llm" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="llm">LLM Provider</TabsTrigger>
            <TabsTrigger value="scraping">Scraping API</TabsTrigger>
          </TabsList>
          
          <TabsContent value="llm" className="space-y-6 mt-6">
            {/* Lovable AI Option */}
            <div
              className={cn(
                "relative rounded-lg border-2 p-4 cursor-pointer transition-all",
                isLovableActive 
                  ? "border-primary bg-accent/50" 
                  : "border-border hover:border-primary/50"
              )}
              onClick={() => setAPIConfig({ provider: 'lovable' })}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">Lovable AI</h3>
                    <Badge className="gradient-primary text-xs">Recommended</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Pre-configured AI with no API key required. Uses Google Gemini for fast, accurate analysis.
                  </p>
                </div>
                {isLovableActive && (
                  <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            </div>

            {/* Custom API Option */}
            <div
              className={cn(
                "relative rounded-lg border-2 p-4 transition-all",
                !isLovableActive 
                  ? "border-primary bg-accent/50" 
                  : "border-border hover:border-primary/50"
              )}
            >
              <div 
                className="flex items-start gap-4 cursor-pointer"
                onClick={() => setAPIConfig({ provider: 'custom' })}
              >
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <Key className="w-5 h-5 text-secondary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Custom API Keys</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Use your own OpenAI or Anthropic API keys
                  </p>
                </div>
                {!isLovableActive && (
                  <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </div>

              {!isLovableActive && (
                <div className="mt-6 space-y-4 pl-14">
                  <div className="space-y-2">
                    <Label htmlFor="openai-key">OpenAI API Key</Label>
                    <div className="relative">
                      <Input
                        id="openai-key"
                        type={showKeys.openai ? "text" : "password"}
                        placeholder="sk-..."
                        value={apiConfig.customOpenAIKey || ""}
                        onChange={(e) => setAPIConfig({ customOpenAIKey: e.target.value })}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowKeys(prev => ({ ...prev, openai: !prev.openai }))}
                      >
                        {showKeys.openai ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="claude-key">Anthropic Claude API Key</Label>
                    <div className="relative">
                      <Input
                        id="claude-key"
                        type={showKeys.claude ? "text" : "password"}
                        placeholder="sk-ant-..."
                        value={apiConfig.customClaudeKey || ""}
                        onChange={(e) => setAPIConfig({ customClaudeKey: e.target.value })}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowKeys(prev => ({ ...prev, claude: !prev.claude }))}
                      >
                        {showKeys.claude ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" />
                    Keys are stored in session only and never sent to our servers
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="scraping" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Scraping Integration</Label>
                  <p className="text-sm text-muted-foreground">
                    Connect a scraping API for future automated review collection
                  </p>
                </div>
                <Switch />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scraping-key">Scraping API Key</Label>
                <div className="relative">
                  <Input
                    id="scraping-key"
                    type={showKeys.scraping ? "text" : "password"}
                    placeholder="Enter your scraping API key"
                    value={apiConfig.scrapingAPIKey || ""}
                    onChange={(e) => setAPIConfig({ scrapingAPIKey: e.target.value })}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowKeys(prev => ({ ...prev, scraping: !prev.scraping }))}
                  >
                    {showKeys.scraping ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Compatible with Apify, ScraperAPI, or similar services
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
