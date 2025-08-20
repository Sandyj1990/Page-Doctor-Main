import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, AlertCircle, XCircle, TrendingUp, FileText, Search, Settings, Code, Brain, Sparkles, Target, BookOpen } from "lucide-react";
import { generateAuditResult } from "@/services/auditService";
import { EnhancedAuditResult, EnhancedScoreItem } from "@/services/enhancedAuditService";
import SpellCheckModal from "@/components/SpellCheckModal";
import { GrammarSpellingService, GrammarSpellingResult } from "@/services/grammarSpellingService";
import CrawlingFixService from "@/services/crawlingFixService";

interface ReportCardProps {
  url: string;
  onBack: () => void;
}

interface ScoreItem {
  name: string;
  score: number;
  status: 'good' | 'warning' | 'poor';
  description: string;
  details: string[];
  llmInsights?: {
    analysis: string;
    recommendations: string[];
    priority: 'high' | 'medium' | 'low';
  };
  stats?: {
    found: number;
    total: number;
    examples?: string[];
  };
}

const getScoreColor = (score: number) => {
  if (score >= 80) return 'success';
  if (score >= 60) return 'warning';
  return 'destructive';
};

const getScoreIcon = (score: number) => {
  if (score >= 80) return CheckCircle;
  if (score >= 60) return AlertCircle;
  return XCircle;
};

export const ReportCard = ({ url, onBack }: ReportCardProps) => {
  const [activeTab, setActiveTab] = useState('writing');
  const [auditData, setAuditData] = useState<{
    overallScore: number;
    writingQuality: ScoreItem[];
    seoSignals: ScoreItem[];
    structure: ScoreItem[];
    technical: ScoreItem[];
  } | null>(null);
  const [enhancedData, setEnhancedData] = useState<EnhancedAuditResult | null>(null);
  const [isEnhanced, setIsEnhanced] = useState(false);
  const [spellCheckModalOpen, setSpellCheckModalOpen] = useState(false);
  const [spellCheckData, setSpellCheckData] = useState<GrammarSpellingResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('📊 ReportCard received URL:', url);
    const checkForEnhancedResults = () => {
      try {
        const storedEnhanced = sessionStorage.getItem('lastEnhancedAudit');
        if (storedEnhanced) {
          const enhancedResult: EnhancedAuditResult = JSON.parse(storedEnhanced);
          console.log('🤖 Found enhanced audit result:', enhancedResult);
          setEnhancedData(enhancedResult);
          setAuditData(enhancedResult);
          setIsEnhanced(true);
          sessionStorage.removeItem('lastEnhancedAudit');
          return true;
        }
      } catch (error) {
        console.error('Error loading enhanced audit result:', error);
      }
      return false;
    };

    const loadAuditData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (!checkForEnhancedResults()) {
          const result = await generateAuditResult(url);
          console.log('📈 Basic audit result generated for:', url, 'Overall score:', result.overallScore);
          setAuditData(result);
          setIsEnhanced(false);
        }
      } catch (error) {
        console.error('❌ Audit failed:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown audit error';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuditData();
  }, [url]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Generating audit results...</p>
          <p className="text-sm text-muted-foreground mt-2">This may take a few moments</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 flex items-center justify-center p-4">
        <div className="max-w-2xl mx-auto text-center">
          <Card className="border-red-200 bg-red-50/50">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center gap-2 justify-center">
                <XCircle className="w-6 h-6" />
                Audit Failed
              </CardTitle>
              <CardDescription className="text-red-600">
                {error}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-red-700 space-y-2">
                <p><strong>Common Solutions:</strong></p>
                <ul className="list-disc text-left pl-4 space-y-1">
                  <li>Check if the URL is accessible and valid</li>
                  <li>Ensure you have a Google PageSpeed API key configured</li>
                  <li>Try again in a few moments (API may be temporarily unavailable)</li>
                  <li>Check your internet connection</li>
                </ul>
              </div>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                  Try Again
                </Button>
                <Button onClick={onBack} variant="ghost" size="sm">
                  Back to Form
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!auditData) {
    return null;
  }

  const { overallScore, writingQuality, seoSignals, structure, technical } = auditData;

  const ScoreCard = ({ items, icon: Icon }: { items: ScoreItem[], icon: React.ComponentType<any> }) => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Icon className="w-6 h-6 text-primary" />
        <h3 className="text-xl font-semibold">Detailed Analysis</h3>
      </div>
      {items.map((item, index) => {
        const IconComponent = getScoreIcon(item.score);
        return (
          <Card key={index} className="p-6 border-l-4 border-l-primary/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <IconComponent className={`w-5 h-5 ${
                  item.score >= 80 ? 'text-success' : 
                  item.score >= 60 ? 'text-warning' : 'text-destructive'
                }`} />
                <h4 className="font-semibold text-lg">{item.name}</h4>
              </div>
              <div className="flex items-center gap-3">
                {item.stats && (
                  <span className="text-sm text-muted-foreground">
                    {item.stats.found}/{item.stats.total}
                  </span>
                )}
                <Badge variant={getScoreColor(item.score) as any} className="font-bold">
                  {item.score}/100
                </Badge>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
            <div className="space-y-3">
              <h5 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
                Detailed Findings
              </h5>
              <div className="grid gap-2">
                {item.details.map((detail, detailIndex) => (
                  <div key={detailIndex} className="flex items-start gap-2 p-2 rounded bg-muted/30">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-sm">{detail}</span>
                  </div>
                ))}
              </div>

              {item.stats?.examples && item.stats.examples.length > 0 && (
                <div className="mt-4">
                  <h6 className="font-medium text-sm text-muted-foreground mb-2">
                    Examples of Issues Found:
                  </h6>
                  <div className="space-y-1">
                    {item.stats.examples.map((example, exampleIndex) => (
                      <div 
                        key={exampleIndex}
                        className="text-xs p-2 bg-destructive/10 rounded border-l-2 border-l-destructive/50"
                      >
                        {example}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {item.llmInsights && (
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-4 h-4 text-purple-600" />
                    <h6 className="font-semibold text-sm text-purple-900 dark:text-purple-100">
                      AI-Enhanced Insights
                    </h6>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${
                        item.llmInsights.priority === 'high' ? 'bg-red-100 text-red-800' :
                        item.llmInsights.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}
                    >
                      {item.llmInsights.priority} priority
                    </Badge>
                  </div>
                  <p className="text-sm text-purple-800 dark:text-purple-200 mb-3">
                    {item.llmInsights.analysis}
                  </p>
                  {item.llmInsights.recommendations.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-3 h-3 text-purple-600" />
                        <span className="font-medium text-xs uppercase tracking-wide text-purple-700 dark:text-purple-300">
                          AI Recommendations
                        </span>
                      </div>
                      <div className="space-y-1">
                        {item.llmInsights.recommendations.map((rec, recIndex) => (
                          <div key={recIndex} className="flex items-start gap-2 p-2 rounded bg-purple-100/50 dark:bg-purple-900/20">
                            <Sparkles className="w-3 h-3 text-purple-600 mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-purple-800 dark:text-purple-200">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 p-4 md:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 md:mb-8">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="mb-6 hover:bg-secondary shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            New Audit
          </Button>
          <Card className="p-6 md:p-8 bg-card/90 backdrop-blur-sm border-0 shadow-xl">
            <div className="text-center">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
                <h1 className="text-2xl md:text-3xl font-bold">Health Report</h1>
                {isEnhanced && enhancedData && (
                  <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white shrink-0">
                    <Brain className="w-3 h-3 mr-1" />
                    AI Enhanced
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mb-4 break-all text-sm md:text-base px-4">{url}</p>
              {isEnhanced && enhancedData && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs text-muted-foreground mb-6 px-4">
                  <span>Processing Time: {enhancedData.processingTime}ms</span>
                  <span className="hidden sm:inline">•</span>
                  <span>Enhancement Level: {enhancedData.enhancementLevel}</span>
                  {enhancedData.llmAnalysis && (
                    <>
                      <span className="hidden sm:inline">•</span>
                      <span>Content Tone: {enhancedData.llmAnalysis.toneAnalysis}</span>
                    </>
                  )}
                </div>
              )}
              <div className="flex flex-col items-center justify-center mb-8 space-y-4">
                <div className="relative">
                  <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center shadow-lg">
                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-card flex items-center justify-center">
                      <span className="text-2xl md:text-3xl font-bold text-foreground">{overallScore}</span>
                    </div>
                  </div>
                </div>
                <Badge 
                  variant={getScoreColor(overallScore) as any}
                  className="shadow-md text-sm px-3 py-1"
                >
                  {overallScore >= 80 ? 'Excellent' : overallScore >= 60 ? 'Good' : 'Needs Work'}
                </Badge>
              </div>
              <p className="text-lg text-muted-foreground">Overall Health Score</p>
            </div>
          </Card>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 p-1 bg-card/60 backdrop-blur-sm shadow-md h-auto">
            <TabsTrigger value="writing" className="flex items-center gap-2 py-3 px-2 text-xs md:text-sm">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Writing</span>
              <span className="sm:hidden">Write</span>
            </TabsTrigger>
            <TabsTrigger value="seo" className="flex items-center gap-2 py-3 px-2 text-xs md:text-sm">
              <Search className="w-4 h-4" />
              <span>SEO</span>
            </TabsTrigger>
            <TabsTrigger value="structure" className="flex items-center gap-2 py-3 px-2 text-xs md:text-sm">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Structure</span>
              <span className="sm:hidden">Struct</span>
            </TabsTrigger>
            <TabsTrigger value="technical" className="flex items-center gap-2 py-3 px-2 text-xs md:text-sm">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Technical</span>
              <span className="sm:hidden">Tech</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="writing" className="mt-6">
            <Card className="p-6 md:p-8 bg-card/90 backdrop-blur-sm border-0 shadow-xl">
              <ScoreCard items={writingQuality} icon={FileText} />
            </Card>
          </TabsContent>
          <TabsContent value="seo" className="mt-6">
            <Card className="p-6 md:p-8 bg-card/90 backdrop-blur-sm border-0 shadow-xl">
              <ScoreCard items={seoSignals} icon={Search} />
            </Card>
          </TabsContent>
          <TabsContent value="structure" className="mt-6">
            <Card className="p-6 md:p-8 bg-card/90 backdrop-blur-sm border-0 shadow-xl">
              <ScoreCard items={structure} icon={TrendingUp} />
            </Card>
          </TabsContent>
          <TabsContent value="technical" className="mt-6">
            <Card className="p-6 md:p-8 bg-card/90 backdrop-blur-sm border-0 shadow-xl">
              <ScoreCard items={technical} icon={Code} />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};