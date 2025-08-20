import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Stethoscope, Globe, Loader2, Brain, Sparkles, Zap, Key } from "lucide-react";
import { EnhancedAuditService } from '@/services/enhancedAuditService';
import { LighthouseAuditService } from '@/services/lighthouseAuditService';
import { generateAuditResult } from '@/services/auditService';
import DomainAnalyticsReport from '@/components/DomainAnalyticsReport';

interface AuditFormProps {
  onAuditComplete: (url: string) => void;
}

export const AuditForm = ({ onAuditComplete }: AuditFormProps) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [showDomainAnalytics, setShowDomainAnalytics] = useState(false);
  const [auditMode, setAuditMode] = useState<'single' | 'domain'>('single');
  
  // Audit provider selection - DEFAULT TO REALTIME for combined PageSpeed + Lighthouse + Crawlee
  const [auditProvider, setAuditProvider] = useState<'sitespeed' | 'pagespeed' | 'lighthouse' | 'realtime'>('realtime');
  
  // LLM Enhancement options - DEFAULT TO FALSE for faster audits
  const [useLLMAnalysis, setUseLLMAnalysis] = useState(false);
  const [includeIndustryInsights, setIncludeIndustryInsights] = useState(false);
  const [industry, setIndustry] = useState('');
  
  // Get LLM enhancement options and audit capabilities
  const enhancementOptions = EnhancedAuditService.getEnhancementOptions();
  const lighthouseCapabilities = LighthouseAuditService.getCapabilities();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    if (auditMode === 'domain') {
      setShowDomainAnalytics(true);
      return;
    }

    // Single page audit
    setIsLoading(true);
    setLoadingMessage('Initializing audit...');
    
    try {
      if (auditProvider === 'realtime') {
        console.log('🚀 Starting REAL-TIME audit (PageSpeed + Lighthouse + Crawlee)...');
        setLoadingMessage('🚀 Running real-time audit - NO fallbacks or mock data...');
        
        const realTimeResult = await generateAuditResult(url, false, 'realtime');
        
        // Store real-time result for the report page to use
        sessionStorage.setItem('lastAuditResult', JSON.stringify(realTimeResult));
        setLoadingMessage('✅ Real-time audit complete - 100% live data!');
        console.log('✅ Real-time audit completed:', realTimeResult);
        
      } else if (useLLMAnalysis && enhancementOptions.llmAvailable) {
        console.log('🤖 Starting enhanced LLM audit...');
        setLoadingMessage('🤖 Running AI-enhanced analysis...');
        
        const enhancedResult = await EnhancedAuditService.generateEnhancedAudit(url, {
          useLLM: true,
          includeIndustryInsights: includeIndustryInsights,
          industry: industry.trim() || undefined,
          businessType: 'website',
          auditProvider: auditProvider as 'sitespeed' | 'pagespeed' | 'lighthouse'
        });
        
        // Store enhanced result for the report page to use
        sessionStorage.setItem('lastEnhancedAudit', JSON.stringify(enhancedResult));
        setLoadingMessage('✅ AI analysis complete!');
        console.log('✅ Enhanced audit completed:', enhancedResult);
      } else {
        setLoadingMessage('⚡ Running fast audit...');
        
        const basicResult = await generateAuditResult(url, false, auditProvider as 'sitespeed' | 'pagespeed' | 'lighthouse');
        
        // Store basic result for the report page to use
        sessionStorage.setItem('lastAuditResult', JSON.stringify(basicResult));
        setLoadingMessage('✅ Basic audit complete!');
        console.log('✅ Basic audit completed:', basicResult);
      }
      
      setTimeout(() => setLoadingMessage('🎉 Audit complete! Loading results...'), 500);
      
    } catch (error) {
      console.error('❌ Audit failed:', error);
      setLoadingMessage('❌ Audit failed - please try again');
      setTimeout(() => {
        setIsLoading(false);
        setLoadingMessage('');
      }, 2000);
      return;
    }
    
    setIsLoading(false);
    setLoadingMessage('');
    onAuditComplete(url);
  };

  // Show domain analytics if needed
  if (showDomainAnalytics) {
    const domain = url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    return (
      <DomainAnalyticsReport
        domain={domain}
        onBack={() => setShowDomainAnalytics(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 flex items-center justify-center p-4 md:p-6 lg:p-8">
      <div className="w-full max-w-3xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-primary/10 p-4 rounded-full">
              <Stethoscope className="w-10 h-10 md:w-12 md:h-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Page Doctor
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">
            Professional website health checkups. Diagnose your site's performance, SEO, and technical issues.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">🔍 Page Doctor Audit</CardTitle>
            <CardDescription className="text-center">
              Comprehensive website analysis powered by{' '}
              {auditProvider === 'realtime' ? (
                <span className="font-semibold text-purple-600">Real-time Combined Audit</span>
              ) : auditProvider === 'sitespeed' ? (
                <span className="font-semibold text-blue-600">Sitespeed.io</span>
              ) : auditProvider === 'lighthouse' ? (
                <span className="font-semibold text-orange-600">Lighthouse</span>
              ) : (
                <span className="font-semibold text-green-600">PageSpeed Insights</span>
              )}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="url" className="text-sm font-medium">
                  Website URL
                </label>
                <Input
                  id="url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  required
                  className="text-base"
                />
              </div>

              {/* Audit Provider Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Audit Provider</label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  
                  {/* Real-time Combined Audit (NEW DEFAULT) */}
                  <div 
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      auditProvider === 'realtime' 
                        ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200' 
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                    onClick={() => setAuditProvider('realtime')}
                  >
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="auditProvider"
                        value="realtime"
                        checked={auditProvider === 'realtime'}
                        onChange={(e) => setAuditProvider(e.target.value as any)}
                        className="text-purple-600"
                      />
                      <div>
                        <div className="font-medium text-sm flex items-center gap-1">
                          Real-time Combined
                          <span className="bg-purple-600 text-white text-xs px-1 py-0.5 rounded">NEW</span>
                        </div>
                        <div className="text-xs text-gray-500">PageSpeed + Lighthouse + Crawlee</div>
                      </div>
                    </div>
                  </div>
                  <div 
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      auditProvider === 'sitespeed' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => setAuditProvider('sitespeed')}
                  >
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="auditProvider"
                        value="sitespeed"
                        checked={auditProvider === 'sitespeed'}
                        onChange={(e) => setAuditProvider(e.target.value as any)}
                        className="text-blue-600"
                      />
                      <div>
                        <div className="font-medium text-sm">Sitespeed.io</div>
                        <div className="text-xs text-gray-500">Open-source, no API key needed</div>
                      </div>
                    </div>
                  </div>

                  <div 
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      auditProvider === 'lighthouse' 
                        ? 'border-orange-500 bg-orange-50' 
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                    onClick={() => setAuditProvider('lighthouse')}
                  >
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="auditProvider"
                        value="lighthouse"
                        checked={auditProvider === 'lighthouse'}
                        onChange={(e) => setAuditProvider(e.target.value as any)}
                        className="text-orange-600"
                      />
                      <div>
                        <div className="font-medium text-sm">Lighthouse</div>
                        <div className="text-xs text-gray-500">Google's tool, built-in</div>
                      </div>
                    </div>
                  </div>

                  <div 
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      auditProvider === 'pagespeed' 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                    onClick={() => setAuditProvider('pagespeed')}
                  >
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="auditProvider"
                        value="pagespeed"
                        checked={auditProvider === 'pagespeed'}
                        onChange={(e) => setAuditProvider(e.target.value as any)}
                        className="text-green-600"
                      />
                      <div>
                        <div className="font-medium text-sm">PageSpeed Insights</div>
                        <div className="text-xs text-gray-500">Requires API key</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Provider-specific information */}
              {auditProvider === 'realtime' && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <div className="text-purple-600 mt-0.5">🚀</div>
                    <div className="text-sm text-purple-800">
                      <div className="font-medium mb-1">Real-time Combined Audit</div>
                      <p className="mb-2">
                        <strong>NO FALLBACK OR MOCK DATA</strong> - combines real-time data from:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-xs mb-2">
                        <li><strong>PageSpeed API:</strong> Core Web Vitals & performance metrics</li>
                        <li><strong>Lighthouse:</strong> Accessibility, SEO, and best practices</li>
                        <li><strong>Crawlee:</strong> Real content extraction and analysis</li>
                      </ul>
                      <p className="text-xs bg-purple-100 px-2 py-1 rounded">
                        ✅ Recommended for most comprehensive real-time analysis
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {auditProvider === 'sitespeed' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <div className="text-blue-600 mt-0.5">ℹ️</div>
                    <div className="text-sm text-blue-800">
                      <div className="font-medium mb-1">Sitespeed.io Setup</div>
                      <p className="mb-2">For best results, install Sitespeed.io:</p>
                      <code className="bg-blue-100 px-2 py-1 rounded text-xs">
                        npm install -g sitespeed.io
                      </code>
                      <p className="mt-2 text-xs">
                        Alternative: Uses Docker if available. Falls back to basic analysis if neither is installed.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {auditProvider === 'pagespeed' && !import.meta.env.VITE_PAGESPEED_API_KEY && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <div className="text-yellow-600 mt-0.5">⚠️</div>
                    <div className="text-sm text-yellow-800">
                      <div className="font-medium mb-1">API Key Required</div>
                      <p>PageSpeed Insights requires a Google API key for reliable results.</p>
                      <p className="mt-1">
                        <a 
                          href="https://developers.google.com/speed/docs/insights/v5/get-started" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          Get your free API key here
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {auditProvider === 'pagespeed' && import.meta.env.VITE_PAGESPEED_API_KEY && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <div className="text-green-600 mt-0.5">✅</div>
                    <div className="text-sm text-green-800">
                      <div className="font-medium mb-1">API Key Configured</div>
                      <p>PageSpeed Insights API key is active. You have access to higher quotas (25,000 requests/day) and faster response times.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Audit Mode Selection */}
              <div className="space-y-4">
                <label className="text-sm font-semibold text-foreground">
                  Analysis Type
                </label>
                
                <div className="grid grid-cols-1 gap-3">
                  {/* Single page option */}
                  <div 
                    className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      auditMode === 'single' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setAuditMode('single')}
                  >
                    <div className="flex items-center gap-3">
                      <Stethoscope className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-medium text-foreground">Single Page Audit</div>
                        <div className="text-sm text-muted-foreground">
                          Multiple audit engines available • {auditProvider === 'lighthouse' ? '1-5 seconds (open source!)' : '3-8 seconds (optimized!)'}
                        </div>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      auditMode === 'single' ? 'border-primary bg-primary' : 'border-border'
                    }`} />
                  </div>

                  {/* Domain Analytics option */}
                  <div 
                    className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      auditMode === 'domain' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setAuditMode('domain')}
                  >
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-primary" />
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-foreground">Domain Analytics</div>
                          <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs rounded-full font-medium">
                            PRO
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Traffic estimates, SEO metrics, backlinks & competitor analysis • 1-2 minutes
                        </div>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      auditMode === 'domain' ? 'border-primary bg-primary' : 'border-border'
                    }`} />
                  </div>
                </div>
              </div>

              {/* Audit Provider Selection - Show only for single page audits */}
              {auditMode === 'single' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Zap className="w-4 h-4 text-blue-600" />
                      Audit Engine
                    </h3>
                    <span className="text-xs text-muted-foreground">Choose your preferred audit provider</span>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {/* PageSpeed API option */}
                    <div 
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                        auditProvider === 'pagespeed' 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
                          : 'border-border hover:border-blue-300'
                      }`}
                      onClick={() => setAuditProvider('pagespeed')}
                    >
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-blue-600" />
                        <div>
                          <div className="font-medium text-sm">Google PageSpeed API</div>
                          <div className="text-xs text-muted-foreground">
                            Comprehensive metrics • Best accuracy • {import.meta.env.VITE_PAGESPEED_API_KEY ? 'API key configured' : 'Limited quota'}
                          </div>
                        </div>
                      </div>
                      <div className={`w-3 h-3 rounded-full border ${
                        auditProvider === 'pagespeed' ? 'border-blue-500 bg-blue-500' : 'border-border'
                      }`} />
                    </div>

                    {/* Lighthouse Direct option */}
                    <div 
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                        auditProvider === 'lighthouse' 
                          ? 'border-green-500 bg-green-50 dark:bg-green-950/20' 
                          : lighthouseCapabilities.available 
                            ? 'border-border hover:border-green-300'
                            : 'border-border opacity-60'
                      }`}
                      onClick={() => lighthouseCapabilities.available && setAuditProvider('lighthouse')}
                    >
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-green-600" />
                        <div>
                          <div className="font-medium text-sm flex items-center gap-2">
                            Open Source Lighthouse 
                            <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                              FREE
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {lighthouseCapabilities.available 
                              ? 'No limits • Privacy focused • Local analysis'
                              : 'Not available in current browser'
                            }
                          </div>
                        </div>
                      </div>
                      <div className={`w-3 h-3 rounded-full border ${
                        auditProvider === 'lighthouse' ? 'border-green-500 bg-green-500' : 'border-border'
                      }`} />
                    </div>
                  </div>

                  {auditProvider === 'lighthouse' && (
                    <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="text-xs text-green-700 dark:text-green-300">
                        <div className="font-medium mb-1">✅ Open Source Benefits:</div>
                        <ul className="space-y-1 ml-2">
                          {lighthouseCapabilities.features.slice(0, 3).map((feature, idx) => (
                            <li key={idx}>• {feature}</li>
                          ))}
                        </ul>
                        {lighthouseCapabilities.limitations.length > 0 && (
                          <div className="mt-2 text-yellow-700 dark:text-yellow-300">
                            <div className="font-medium">⚠️ Limitations:</div>
                            <div>• {lighthouseCapabilities.limitations[0]}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* AI Enhancement Options - Show only for single page audits */}
              {auditMode === 'single' && (
                <div className="space-y-5 p-5 md:p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-xl border border-purple-200 dark:border-purple-800 shadow-sm">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <Brain className="w-5 h-5 text-purple-600" />
                      <h3 className="font-semibold text-foreground">AI-Enhanced Analysis</h3>
                    </div>
                    {!enhancementOptions.llmAvailable && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                        Requires API Key
                      </span>
                    )}
                  </div>

                  <div className="flex items-start space-x-4">
                    <Checkbox 
                      id="llm-analysis" 
                      checked={useLLMAnalysis}
                      onCheckedChange={(checked) => setUseLLMAnalysis(checked === true)}
                      disabled={!enhancementOptions.llmAvailable}
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-2">
                      <label htmlFor="llm-analysis" className="text-sm font-medium text-foreground cursor-pointer flex items-center gap-2">
                        🤖 Enhanced AI Content Analysis
                      </label>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {enhancementOptions.llmAvailable 
                          ? `⚠️ SLOWER: Deep AI insights, SEO recommendations (+8-15 seconds). Uncheck for faster ${auditProvider === 'lighthouse' ? '1-5s' : '3-8s'} audits.`
                          : 'Set up OpenAI API key in environment variables to enable AI features'
                        }
                      </p>
                    </div>
                  </div>

                  {useLLMAnalysis && enhancementOptions.llmAvailable && (
                    <div className="ml-8 md:ml-10 space-y-4 border-l-2 border-purple-200 dark:border-purple-700 pl-5">
                      <div className="flex items-start space-x-3">
                        <Checkbox 
                          id="industry-insights" 
                          checked={includeIndustryInsights}
                          onCheckedChange={(checked) => setIncludeIndustryInsights(checked === true)}
                          className="mt-1"
                        />
                        <div className="flex-1 space-y-2">
                          <label htmlFor="industry-insights" className="text-sm font-medium text-foreground cursor-pointer">
                            🎯 Industry-Specific Recommendations
                          </label>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Tailored optimization advice for your business type
                          </p>
                        </div>
                      </div>

                      {includeIndustryInsights && (
                        <div className="space-y-3 pl-6 border-l border-purple-300 dark:border-purple-600">
                          <label htmlFor="industry" className="text-xs font-medium text-foreground block">
                            Industry/Business Type:
                          </label>
                          <Input
                            id="industry"
                            type="text"
                            value={industry}
                            onChange={(e) => setIndustry(e.target.value)}
                            className="h-9 text-sm border-purple-200 dark:border-purple-700 focus:border-purple-400 focus:ring-purple-400/20"
                            placeholder="e.g., e-commerce, healthcare, SaaS, restaurant"
                            disabled={isLoading}
                          />
                        </div>
                      )}

                      <div className="text-xs text-purple-600 dark:text-purple-400 pt-2 border-t border-purple-200 dark:border-purple-700">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-3 h-3" />
                          <span>AI Features: {enhancementOptions.supportedFeatures.slice(0, 3).join(', ')}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Submit Button */}
              <div className="pt-4 border-t border-border">
                <Button
                  type="submit"
                  disabled={isLoading || !url}
                  className="w-full h-12 md:h-14 text-base md:text-lg bg-primary hover:bg-primary/90 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      <span>{loadingMessage || 'Running Diagnosis...'}</span>
                    </>
                  ) : (
                    <>
                      {auditMode === 'single' && <Stethoscope className="w-5 h-5 mr-3" />}
                      {auditMode === 'domain' && <Globe className="w-5 h-5 mr-3" />}
                      <span>
                        {auditMode === 'single' && (useLLMAnalysis && enhancementOptions.llmAvailable ? 'Run AI-Enhanced Audit' : 'Run Audit')}
                        {auditMode === 'domain' && 'Analyze Domain'}
                      </span>
                    </>
                  )}
                </Button>
                
                {/* Additional info for AI mode */}
                {auditMode === 'single' && useLLMAnalysis && enhancementOptions.llmAvailable && (
                  <p className="text-center text-xs text-muted-foreground mt-3">
                    Estimated time: {enhancementOptions.estimatedTime.enhanced} • Includes AI-powered insights
                  </p>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

                    <div className="text-center mt-8">
              <p className="text-sm text-muted-foreground">
                {auditMode === 'single' && `Comprehensive analysis including SEO, performance, and technical health • ${auditProvider === 'lighthouse' ? 'Open source & unlimited' : 'Google PageSpeed powered'}`}
                {auditMode === 'domain' && 'Domain-wide analytics including traffic estimates, SEO metrics, backlinks, and competitor insights'}
              </p>
            </div>
      </div>
    </div>
  );
};