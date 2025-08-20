import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, CheckCircle, Loader2, Search, Settings, BarChart3, Link, FileText, Zap } from 'lucide-react';
import { ComprehensiveSeoAuditService, SeoAuditOptions, ComprehensiveSeoResult } from '@/services/comprehensiveSeoAuditService';

interface ComprehensiveSeoAuditFormProps {
  onAuditComplete?: (result: ComprehensiveSeoResult) => void;
}

const ComprehensiveSeoAuditForm: React.FC<ComprehensiveSeoAuditFormProps> = ({ onAuditComplete }) => {
  const [url, setUrl] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditProgress, setAuditProgress] = useState(0);
  const [auditResult, setAuditResult] = useState<ComprehensiveSeoResult | null>(null);
  const [currentPhase, setCurrentPhase] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Audit options
  const [options, setOptions] = useState<Partial<SeoAuditOptions>>({
    crawlDepth: 2,
    includeExternalLinks: true,
    analyzeImages: true,
    checkRedirects: true,
    analyzeTechnical: true,
    includeContent: true
  });

  const handleAuditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) {
      setError('Please enter a URL to audit');
      return;
    }

    setIsAuditing(true);
    setError(null);
    setAuditProgress(0);
    setAuditResult(null);

    try {
      // Simulate progress updates
      const phases = [
        'Initializing crawl...',
        'Discovering pages...',
        'Analyzing technical SEO...',
        'Checking content quality...',
        'Analyzing link structure...',
        'Generating comprehensive report...'
      ];

      for (let i = 0; i < phases.length; i++) {
        setCurrentPhase(phases[i]);
        setAuditProgress((i + 1) * (100 / phases.length));
        
        if (i < phases.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      const result = await ComprehensiveSeoAuditService.performComprehensiveAudit(url, options);
      
      setAuditResult(result);
      setCurrentPhase('Audit complete!');
      onAuditComplete?.(result);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Audit failed';
      setError(errorMessage);
      console.error('Comprehensive SEO audit failed:', err);
    } finally {
      setIsAuditing(false);
      setAuditProgress(100);
    }
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (score >= 60) return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    return <AlertCircle className="w-4 h-4 text-red-600" />;
  };

  const getScoreColor = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary"; 
    return "destructive";
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Search className="w-6 h-6 text-blue-600" />
            Comprehensive SEO Audit
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Screaming Frog-style comprehensive website analysis including technical SEO, content quality, and link analysis
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuditSubmit} className="space-y-6">
            {/* URL Input */}
            <div className="space-y-2">
              <Label htmlFor="url">Website URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isAuditing}
                required
              />
            </div>

            {/* Audit Options */}
            <Card className="p-4 bg-gray-50">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Audit Configuration
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Crawl Depth */}
                <div className="space-y-2">
                  <Label>Crawl Depth: {options.crawlDepth} levels</Label>
                  <Slider
                    value={[options.crawlDepth || 2]}
                    onValueChange={([value]) => setOptions({...options, crawlDepth: value})}
                    max={5}
                    min={1}
                    step={1}
                    disabled={isAuditing}
                  />
                  <p className="text-xs text-gray-600">
                    Higher depth = more pages analyzed (slower)
                  </p>
                </div>

                {/* Analysis Options */}
                <div className="space-y-3">
                  <Label>Analysis Options</Label>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="external-links"
                        checked={options.includeExternalLinks}
                        onCheckedChange={(checked) => setOptions({...options, includeExternalLinks: !!checked})}
                        disabled={isAuditing}
                      />
                      <label htmlFor="external-links" className="text-sm">Analyze external links</label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="images"
                        checked={options.analyzeImages}
                        onCheckedChange={(checked) => setOptions({...options, analyzeImages: !!checked})}
                        disabled={isAuditing}
                      />
                      <label htmlFor="images" className="text-sm">Image optimization check</label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="redirects"
                        checked={options.checkRedirects}
                        onCheckedChange={(checked) => setOptions({...options, checkRedirects: !!checked})}
                        disabled={isAuditing}
                      />
                      <label htmlFor="redirects" className="text-sm">Check redirects</label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="technical"
                        checked={options.analyzeTechnical}
                        onCheckedChange={(checked) => setOptions({...options, analyzeTechnical: !!checked})}
                        disabled={isAuditing}
                      />
                      <label htmlFor="technical" className="text-sm">Technical SEO analysis</label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="content"
                        checked={options.includeContent}
                        onCheckedChange={(checked) => setOptions({...options, includeContent: !!checked})}
                        disabled={isAuditing}
                      />
                      <label htmlFor="content" className="text-sm">Content quality analysis</label>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Submit Button */}
            <Button 
              type="submit" 
              disabled={isAuditing || !url} 
              className="w-full"
              size="lg"
            >
              {isAuditing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running Comprehensive Audit...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Start Comprehensive SEO Audit
                </>
              )}
            </Button>
          </form>

          {/* Progress Display */}
          {isAuditing && (
            <div className="mt-6 space-y-4">
              <div className="text-center">
                <p className="text-sm font-medium">{currentPhase}</p>
                <Progress value={auditProgress} className="mt-2" />
                <p className="text-xs text-gray-600 mt-1">{Math.round(auditProgress)}% complete</p>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">Audit Failed</span>
              </div>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Display */}
      {auditResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Comprehensive SEO Audit Results</span>
              <Badge variant={getScoreColor(auditResult.overallScore)} className="text-lg px-3 py-1">
                {auditResult.overallScore}/100
              </Badge>
            </CardTitle>
            <p className="text-sm text-gray-600">
              Analyzed {auditResult.crawlStats.totalPages} pages • {auditResult.crawlStats.externalLinks} external links found
            </p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="technical" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Technical
                </TabsTrigger>
                <TabsTrigger value="content" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Content
                </TabsTrigger>
                <TabsTrigger value="links" className="flex items-center gap-2">
                  <Link className="w-4 h-4" />
                  Links
                </TabsTrigger>
                <TabsTrigger value="performance" className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Performance
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {auditResult.categories.map((category, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{category.type}</h3>
                        <Badge variant={getScoreColor(category.score)}>
                          {category.score}/100
                        </Badge>
                      </div>
                      <ScrollArea className="h-32">
                        <div className="space-y-2">
                          {category.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="flex items-center gap-2 text-sm">
                              {getScoreIcon(item.score)}
                              <span className="flex-1">{item.name}</span>
                              <span className="text-xs text-gray-600">{item.score}</span>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Technical SEO Tab */}
              <TabsContent value="technical" className="mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Technical SEO Analysis</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-4">
                      <h4 className="font-medium mb-2">Robots.txt</h4>
                      <div className="text-sm text-gray-600">
                        {auditResult.technicalSeo.robots ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            Robots.txt found and configured
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="w-4 h-4" />
                            Robots.txt not found
                          </div>
                        )}
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-medium mb-2">XML Sitemaps</h4>
                      <div className="text-sm text-gray-600">
                        {auditResult.technicalSeo.sitemap?.length > 0 ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            {auditResult.technicalSeo.sitemap.length} sitemap(s) found
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="w-4 h-4" />
                            No sitemaps found
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>

                  <Card className="p-4">
                    <h4 className="font-medium mb-3">Meta Data Overview</h4>
                    <ScrollArea className="h-40">
                      <div className="space-y-2">
                        {Object.entries(auditResult.technicalSeo.metaData).slice(0, 10).map(([url, meta]: [string, any]) => (
                          <div key={url} className="border rounded p-2 text-sm">
                            <div className="font-medium truncate">{url}</div>
                            <div className="text-gray-600 mt-1">
                              <span className={meta.titleLength >= 10 && meta.titleLength <= 60 ? 'text-green-600' : 'text-red-600'}>
                                Title: {meta.titleLength} chars
                              </span>
                              {" • "}
                              <span className={meta.descriptionLength >= 120 && meta.descriptionLength <= 160 ? 'text-green-600' : 'text-red-600'}>
                                Description: {meta.descriptionLength} chars
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </Card>
                </div>
              </TabsContent>

              {/* Content Tab */}
              <TabsContent value="content" className="mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Content Quality Analysis</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {Object.keys(auditResult.contentAnalysis.wordCount).length}
                      </div>
                      <div className="text-sm text-gray-600">Pages Analyzed</div>
                    </Card>

                    <Card className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {Object.values(auditResult.contentAnalysis.wordCount).reduce((sum: number, count: any) => sum + (count || 0), 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Total Words</div>
                    </Card>

                    <Card className="p-4 text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {auditResult.contentAnalysis.duplicateContent.length}
                      </div>
                      <div className="text-sm text-gray-600">Duplicate Pages</div>
                    </Card>
                  </div>

                  {auditResult.contentAnalysis.duplicateContent.length > 0 && (
                    <Card className="p-4">
                      <h4 className="font-medium mb-3 text-red-600">Duplicate Content Found</h4>
                      <ScrollArea className="h-32">
                        <div className="space-y-1">
                          {auditResult.contentAnalysis.duplicateContent.map((url, index) => (
                            <div key={index} className="text-sm text-red-700 truncate">{url}</div>
                          ))}
                        </div>
                      </ScrollArea>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* Links Tab */}
              <TabsContent value="links" className="mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Link Analysis</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-4">
                      <h4 className="font-medium mb-3">Internal Links</h4>
                      <div className="text-2xl font-bold text-blue-600 mb-2">
                        {Object.values(auditResult.linkAnalysis.internalLinks).flat().length}
                      </div>
                      <div className="text-sm text-gray-600">Total internal links found</div>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-medium mb-3">External Links</h4>
                      <div className="text-2xl font-bold text-purple-600 mb-2">
                        {Object.values(auditResult.linkAnalysis.externalLinks).flat().length}
                      </div>
                      <div className="text-sm text-gray-600">Total external links found</div>
                    </Card>
                  </div>

                  {auditResult.linkAnalysis.brokenLinks.length > 0 && (
                    <Card className="p-4">
                      <h4 className="font-medium mb-3 text-red-600">Broken Links</h4>
                      <ScrollArea className="h-32">
                        <div className="space-y-1">
                          {auditResult.linkAnalysis.brokenLinks.map((url, index) => (
                            <div key={index} className="text-sm text-red-700 truncate">{url}</div>
                          ))}
                        </div>
                      </ScrollArea>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* Performance Tab */}
              <TabsContent value="performance" className="mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Performance Overview</h3>
                  
                  <Card className="p-4">
                    <h4 className="font-medium mb-3">Page Performance</h4>
                    <ScrollArea className="h-40">
                      <div className="space-y-2">
                        {Object.entries(auditResult.technicalSeo.performance).slice(0, 10).map(([url, perf]: [string, any]) => (
                          <div key={url} className="border rounded p-2 text-sm">
                            <div className="font-medium truncate">{url}</div>
                            <div className="text-gray-600 mt-1 flex gap-4">
                              <span>Load: {perf.loadTime}ms</span>
                              <span>Size: {(perf.size / 1024).toFixed(1)}KB</span>
                              <span>Requests: {perf.requests}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ComprehensiveSeoAuditForm; 