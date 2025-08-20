import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Globe, 
  Search, 
  ExternalLink, 
  Users, 
  Clock,
  MousePointer,
  Link,
  Target,
  Award,
  BarChart3,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Zap,
  Crown,
  Activity,
  Brain,
  Lightbulb,
  CheckCircle,
  Building,
  FileText,
  Code
} from 'lucide-react';
import { DomainAnalytics, externalDataService } from '../services/externalDataService';
import { EnhancedDomainAnalytics, enhancedDomainAnalyticsService } from '../services/enhancedDomainAnalyticsService';
import { Skeleton } from './ui/skeleton';

interface DomainAnalyticsReportProps {
  domain: string;
  onBack?: () => void;
}

const DomainAnalyticsReport: React.FC<DomainAnalyticsReportProps> = ({ 
  domain, 
  onBack 
}) => {
  const [analytics, setAnalytics] = useState<EnhancedDomainAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEnhanced, setIsEnhanced] = useState(false);

  useEffect(() => {
    fetchDomainAnalytics();
  }, [domain]);

  const fetchDomainAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      // Try enhanced analytics first if LLM is available
      if (enhancedDomainAnalyticsService.isAvailable()) {
        console.log('🚀 Using Enhanced Domain Analytics with LLM');
        const result = await enhancedDomainAnalyticsService.getEnhancedDomainAnalytics(domain, {
          includeLLMAnalysis: true,
          includeContentAnalysis: true,
          includeRealtimeMetrics: true,
          includeRealTopPages: true
        });
        
        if (result.success && result.data) {
          setAnalytics(result.data);
          setIsEnhanced(true);
          return;
        }
      }

      // Fallback to basic analytics
      console.log('📊 Using Basic Domain Analytics');
      const result = await externalDataService.getDomainAnalytics(domain);
      
      if (result.success && result.data) {
        // Convert basic analytics to enhanced format
        const enhancedData: EnhancedDomainAnalytics = {
          ...result.data,
          actualDataSources: ['ExternalDataService'],
          dataQuality: 'medium'
        };
        setAnalytics(enhancedData);
        setIsEnhanced(false);
      } else {
        setError(result.error || 'Failed to fetch domain analytics');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatCurrency = (num: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUpRight className="w-4 h-4 text-green-600" />;
    if (change < 0) return <ArrowDownRight className="w-4 h-4 text-red-600" />;
    return null;
  };

  const providersStatus = externalDataService.getProvidersStatus();
  const enabledProviders = Object.values(providersStatus).filter(p => p.enabled);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 p-4">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-10 w-24" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-24 mb-2" />
                  <Skeleton className="h-4 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="border-red-200 bg-red-50/50">
            <CardHeader>
              <CardTitle className="text-red-800">Domain Analytics Error</CardTitle>
              <CardDescription className="text-red-600">
                {error}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-red-700">
                  To get comprehensive domain analytics, you need to configure API keys for external data providers:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(providersStatus).map(([key, provider]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div>
                        <p className="font-medium text-gray-900">{provider.name}</p>
                        <p className="text-xs text-gray-500">{provider.features.join(', ')}</p>
                      </div>
                      <Badge variant={provider.enabled ? "default" : "secondary"}>
                        {provider.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button onClick={fetchDomainAnalytics} variant="outline" size="sm">
                    Retry with Estimation
                  </Button>
                  {onBack && (
                    <Button onClick={onBack} variant="ghost" size="sm">
                      Back
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Globe className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {analytics.domain}
                </h1>
                <p className="text-muted-foreground">
                  Domain Analytics Report • Last updated {new Date(analytics.lastUpdated).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-2">
              <Activity className="w-4 h-4" />
              {enabledProviders.length} Provider{enabledProviders.length !== 1 ? 's' : ''} Active
            </Badge>
            {onBack && (
              <Button onClick={onBack} variant="outline">
                ← Back
              </Button>
            )}
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Monthly Visitors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900 mb-1">
                {analytics.traffic.monthlyVisits > 0 ? formatNumber(analytics.traffic.monthlyVisits) : 'No data'}
              </div>
              <div className={`text-sm flex items-center gap-1 ${analytics.traffic.monthlyVisits === 0 ? 'text-amber-600' : getChangeColor(analytics.traffic.monthlyVisitsChange)}`}>
                {analytics.traffic.monthlyVisits === 0 ? (
                  'Requires external analytics APIs'
                ) : (
                  <>
                    {getChangeIcon(analytics.traffic.monthlyVisitsChange)}
                    {Math.abs(analytics.traffic.monthlyVisitsChange).toFixed(1)}% vs last month
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
                <Award className="w-4 h-4" />
                Domain Authority
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900 mb-1">
                {analytics.seo.domainAuthority > 0 ? `${analytics.seo.domainAuthority}/100` : 'No data'}
              </div>
              {analytics.seo.domainAuthority > 0 ? (
                <Progress 
                  value={analytics.seo.domainAuthority} 
                  className="h-2 bg-green-100" 
                />
              ) : (
                <div className="text-xs text-amber-600">Requires SEO data APIs</div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-800 flex items-center gap-2">
                <Link className="w-4 h-4" />
                Total Backlinks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900 mb-1">
                {formatNumber(analytics.backlinks.totalBacklinks)}
              </div>
              <div className="text-sm text-purple-700">
                from {formatNumber(analytics.backlinks.referringDomains)} domains
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-orange-800 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Organic Keywords
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900 mb-1">
                {formatNumber(analytics.seo.organicKeywords)}
              </div>
              <div className="text-sm text-orange-700">
                {formatCurrency(analytics.seo.organicTrafficValue)} value
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full ${analytics?.llmInsights ? 'grid-cols-5 lg:w-fit lg:grid-cols-5' : 'grid-cols-4 lg:w-fit lg:grid-cols-4'}`}>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="traffic" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Traffic</span>
            </TabsTrigger>
            <TabsTrigger value="seo" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">SEO</span>
            </TabsTrigger>
            <TabsTrigger value="technical" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Technical</span>
            </TabsTrigger>
            {analytics?.llmInsights && (
              <TabsTrigger value="ai-insights" className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                <span className="hidden sm:inline">AI Insights</span>
              </TabsTrigger>
            )}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Website Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Website Statistics
                    </div>
                    <Badge variant="outline" className="text-xs">
                      <Activity className="w-3 h-3 mr-1" />
                      Real-time Data
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Live website performance and technical metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Performance Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      {analytics.realTimeMetrics && (
                        <>
                          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`w-2 h-2 rounded-full ${analytics.realTimeMetrics.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                              <p className="text-sm font-medium">Status</p>
                            </div>
                            <p className="text-lg font-semibold text-green-700">
                              {analytics.realTimeMetrics.isOnline ? 'Online' : 'Offline'}
                            </p>
                            <p className="text-xs text-green-600">HTTP {analytics.realTimeMetrics.httpStatus}</p>
                          </div>
                          
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-2 mb-1">
                              <Clock className="w-3 h-3 text-blue-600" />
                              <p className="text-sm font-medium">Load Time</p>
                            </div>
                            <p className="text-lg font-semibold text-blue-700">
                              {analytics.realTimeMetrics.loadTime.toFixed(2)}s
                            </p>
                            <p className="text-xs text-blue-600">
                              {analytics.realTimeMetrics.loadTime < 3 ? 'Excellent' : analytics.realTimeMetrics.loadTime < 5 ? 'Good' : 'Needs Improvement'}
                            </p>
                          </div>
                        </>
                      )}
                      
                      {/* Business Type & Content */}
                      {analytics.websiteContent && (
                        <>
                          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                            <div className="flex items-center gap-2 mb-1">
                              <Building className="w-3 h-3 text-purple-600" />
                              <p className="text-sm font-medium">Business Type</p>
                            </div>
                            <p className="text-lg font-semibold text-purple-700 capitalize">
                              {analytics.websiteContent.businessType}
                            </p>
                          </div>
                          
                          <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                            <div className="flex items-center gap-2 mb-1">
                              <FileText className="w-3 h-3 text-orange-600" />
                              <p className="text-sm font-medium">Content Length</p>
                            </div>
                            <p className="text-lg font-semibold text-orange-700">
                              {analytics.websiteContent.mainContent.length.toLocaleString()} chars
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Technologies */}
                    {analytics.websiteContent?.technologies && analytics.websiteContent.technologies.length > 0 && (
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <div className="flex items-center gap-2 mb-2">
                          <Code className="w-4 h-4 text-gray-600" />
                          <p className="text-sm font-medium">Technologies Detected</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {analytics.websiteContent.technologies.slice(0, 4).map((tech, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                          {analytics.websiteContent.technologies.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{analytics.websiteContent.technologies.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Data Quality Indicator */}
                    <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">Data Quality</span>
                      </div>
                      <Badge variant={analytics.dataQuality === 'high' ? 'default' : analytics.dataQuality === 'medium' ? 'secondary' : 'outline'}>
                        {analytics.dataQuality.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Traffic Sources */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Traffic Sources
                  </CardTitle>
                  <CardDescription>
                    How visitors find your website
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(analytics.traffic.trafficSources).map(([source, percentage]) => (
                      <div key={source} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize font-medium">{source}</span>
                          <span>{percentage.toFixed(1)}%</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Traffic Tab */}
          <TabsContent value="traffic" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Traffic Metrics */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Traffic Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-secondary/30 rounded-lg">
                        <Clock className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                        <p className="text-2xl font-bold">{Math.round(analytics.traffic.averageVisitDuration)}s</p>
                        <p className="text-sm text-muted-foreground">Avg. Duration</p>
                      </div>
                      <div className="text-center p-4 bg-secondary/30 rounded-lg">
                        <MousePointer className="w-6 h-6 mx-auto mb-2 text-green-600" />
                        <p className="text-2xl font-bold">{analytics.traffic.pagesPerVisit.toFixed(1)}</p>
                        <p className="text-sm text-muted-foreground">Pages/Visit</p>
                      </div>
                      <div className="text-center p-4 bg-secondary/30 rounded-lg">
                        <TrendingDown className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                        <p className="text-2xl font-bold">{analytics.traffic.bounceRate.toFixed(1)}%</p>
                        <p className="text-sm text-muted-foreground">Bounce Rate</p>
                      </div>
                      <div className="text-center p-4 bg-secondary/30 rounded-lg">
                        <Users className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                        <p className="text-2xl font-bold">{formatNumber(analytics.traffic.monthlyVisits)}</p>
                        <p className="text-sm text-muted-foreground">Monthly Visits</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Countries */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Countries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.traffic.topCountries.map((country, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm font-medium">{country.country}</span>
                        <span className="text-sm text-muted-foreground">{country.percentage.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* SEO Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>SEO Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-secondary/30 rounded-lg">
                        <Crown className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
                        <p className="text-2xl font-bold">{analytics.seo.domainAuthority}</p>
                        <p className="text-sm text-muted-foreground">Domain Authority</p>
                      </div>
                      <div className="text-center p-4 bg-secondary/30 rounded-lg">
                        <Award className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                        <p className="text-2xl font-bold">{analytics.seo.pageAuthority}</p>
                        <p className="text-sm text-muted-foreground">Page Authority</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Organic Keywords</span>
                        <span className="text-sm">{formatNumber(analytics.seo.organicKeywords)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Organic Traffic</span>
                        <span className="text-sm">{formatNumber(analytics.seo.organicTraffic)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Traffic Value</span>
                        <span className="text-sm">{formatCurrency(analytics.seo.organicTrafficValue)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Keywords */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Organic Keywords</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.seo.topKeywords.slice(0, 10).map((keyword, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{keyword.keyword}</p>
                          <p className="text-xs text-muted-foreground">
                            Vol: {formatNumber(keyword.searchVolume)} • KD: {keyword.difficulty}%
                          </p>
                        </div>
                        <Badge variant={keyword.position <= 3 ? "default" : keyword.position <= 10 ? "outline" : "secondary"}>
                          #{keyword.position}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Technical Tab */}
          <TabsContent value="technical" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Metrics */}
              {analytics.openSourceData?.performance && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-orange-600" />
                      Performance Analysis
                    </CardTitle>
                    <CardDescription>Real-time performance data from Google PageSpeed</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <BarChart3 className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                        <p className="text-2xl font-bold text-orange-900">
                          {analytics.openSourceData.performance.pageSpeedScore}
                        </p>
                        <p className="text-sm text-orange-700">PageSpeed Score</p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <Clock className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                        <p className="text-2xl font-bold text-blue-900">
                          {(analytics.openSourceData.performance.loadTime / 1000).toFixed(1)}s
                        </p>
                        <p className="text-sm text-blue-700">Load Time</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">First Contentful Paint</span>
                        <span className="text-sm">{(analytics.openSourceData.performance.firstContentfulPaint / 1000).toFixed(1)}s</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Largest Contentful Paint</span>
                        <span className="text-sm">{(analytics.openSourceData.performance.largestContentfulPaint / 1000).toFixed(1)}s</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Lighthouse Metrics */}
              {analytics.lighthouse && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-violet-600" />
                      Lighthouse Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="text-center p-4 bg-violet-50 rounded-lg border border-violet-200">
                        <BarChart3 className="w-6 h-6 mx-auto mb-2 text-violet-600" />
                        <p className="text-2xl font-bold text-violet-900">
                          {analytics.lighthouse.metrics?.speedIndex ? Math.round(analytics.lighthouse.metrics.speedIndex) : '—'}
                        </p>
                        <p className="text-sm text-violet-700">Speed Index</p>
                      </div>
                      <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                        <Clock className="w-6 h-6 mx-auto mb-2 text-emerald-600" />
                        <p className="text-2xl font-bold text-emerald-900">
                          {analytics.lighthouse.metrics?.interactive ? (analytics.lighthouse.metrics.interactive / 1000).toFixed(1) + 's' : '—'}
                        </p>
                        <p className="text-sm text-emerald-700">Interactive</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">First Contentful Paint</span>
                        <span className="text-sm">{analytics.lighthouse.metrics?.firstContentfulPaint ? (analytics.lighthouse.metrics.firstContentfulPaint / 1000).toFixed(1) + 's' : '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Largest Contentful Paint</span>
                        <span className="text-sm">{analytics.lighthouse.metrics?.largestContentfulPaint ? (analytics.lighthouse.metrics.largestContentfulPaint / 1000).toFixed(1) + 's' : '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Total Blocking Time</span>
                        <span className="text-sm">{analytics.lighthouse.metrics?.totalBlockingTime ? Math.round(analytics.lighthouse.metrics.totalBlockingTime) + ' ms' : '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Cumulative Layout Shift</span>
                        <span className="text-sm">{analytics.lighthouse.metrics?.cumulativeLayoutShift ?? '—'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Security Analysis */}
              {analytics.openSourceData?.security && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      Security Analysis
                    </CardTitle>
                    <CardDescription>Security headers and HTTPS configuration</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                        <span className="text-sm font-medium">HTTPS Enabled</span>
                        <Badge variant={analytics.openSourceData.security.httpsEnabled ? 'default' : 'secondary'}>
                          {analytics.openSourceData.security.httpsEnabled ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      
                      {Object.entries(analytics.openSourceData.security.securityHeaders).map(([header, enabled]) => (
                        <div key={header} className="flex items-center justify-between p-2 rounded">
                          <span className="text-sm">{header.replace(/-/g, ' ')}</span>
                          <Badge variant={enabled ? 'default' : 'outline'}>
                            {enabled ? '✓' : '✗'}
                          </Badge>
                        </div>
                      ))}
                      
                      {analytics.openSourceData.security.vulnerabilities.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium mb-2 text-amber-600">Security Issues:</p>
                          {analytics.openSourceData.security.vulnerabilities.map((vuln, index) => (
                            <p key={index} className="text-xs text-amber-700 bg-amber-50 p-2 rounded mb-1">
                              {vuln}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* DNS & SSL Information */}
            {analytics.openSourceData && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* DNS Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-blue-600" />
                      DNS Information
                    </CardTitle>
                    <CardDescription>Domain infrastructure details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-3 bg-secondary/30 rounded-lg">
                        <p className="text-sm font-medium mb-1">IP Address</p>
                        <p className="text-sm text-muted-foreground">{analytics.openSourceData.dnsInfo.ipAddress}</p>
                      </div>
                      
                      <div className="p-3 bg-secondary/30 rounded-lg">
                        <p className="text-sm font-medium mb-1">Hosting Provider</p>
                        <p className="text-sm text-muted-foreground">{analytics.openSourceData.dnsInfo.provider}</p>
                      </div>
                      
                      {analytics.openSourceData.dnsInfo.nameServers.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Name Servers:</p>
                          {analytics.openSourceData.dnsInfo.nameServers.slice(0, 3).map((ns, index) => (
                            <p key={index} className="text-xs text-muted-foreground bg-secondary/20 p-2 rounded mb-1">
                              {ns}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* SSL Certificate */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      SSL Certificate
                    </CardTitle>
                    <CardDescription>SSL/TLS certificate information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-3 bg-secondary/30 rounded-lg">
                        <p className="text-sm font-medium mb-1">Issuer</p>
                        <p className="text-sm text-muted-foreground">{analytics.openSourceData.sslInfo.issuer}</p>
                      </div>
                      
                      <div className="p-3 bg-secondary/30 rounded-lg">
                        <p className="text-sm font-medium mb-1">SSL Grade</p>
                        <Badge variant={analytics.openSourceData.sslInfo.grade === 'A' ? 'default' : 'secondary'}>
                          {analytics.openSourceData.sslInfo.grade}
                        </Badge>
                      </div>
                      
                      {analytics.openSourceData.sslInfo.validTo && (
                        <div className="p-3 bg-secondary/30 rounded-lg">
                          <p className="text-sm font-medium mb-1">Valid Until</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(analytics.openSourceData.sslInfo.validTo).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Technology Stack */}
            {analytics.openSourceData?.technologies && analytics.openSourceData.technologies.detected.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5 text-purple-600" />
                    Technology Stack (Free Analysis)
                  </CardTitle>
                  <CardDescription>Detected technologies from website analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {analytics.openSourceData.technologies.detected.map((tech, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                    
                    {Object.entries(analytics.openSourceData.technologies.categories).map(([category, techs]) => (
                      techs.length > 0 && (
                        <div key={category} className="p-3 bg-secondary/30 rounded-lg">
                          <p className="text-sm font-medium mb-2">{category}:</p>
                          <div className="flex flex-wrap gap-1">
                            {techs.map((tech, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Phase 1 Extensions */}
            
            {/* Domain Registration Info */}
            {analytics.openSourceData?.domainInfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-blue-600" />
                    Domain Registration
                  </CardTitle>
                  <CardDescription>Domain ownership and registration details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Registrar</p>
                      <p className="text-sm text-muted-foreground">{analytics.openSourceData.domainInfo.registrar}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Domain Age</p>
                      <p className="text-sm text-muted-foreground">{analytics.openSourceData.domainInfo.domainAge} years</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Created</p>
                      <p className="text-sm text-muted-foreground">{analytics.openSourceData.domainInfo.createdDate || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Expires</p>
                      <p className="text-sm text-muted-foreground">{analytics.openSourceData.domainInfo.expiresDate || 'Unknown'}</p>
                    </div>
                    {analytics.openSourceData.domainInfo.registrantCountry && (
                      <div>
                        <p className="text-sm font-medium">Country</p>
                        <p className="text-sm text-muted-foreground">{analytics.openSourceData.domainInfo.registrantCountry}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Historical Data */}
            {analytics.openSourceData?.historicalData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-green-600" />
                    Historical Data
                  </CardTitle>
                  <CardDescription>Website history from Archive.org</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">First Archived</p>
                      <p className="text-sm text-muted-foreground">{analytics.openSourceData.historicalData.firstArchived}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Total Snapshots</p>
                      <p className="text-sm text-muted-foreground">{analytics.openSourceData.historicalData.totalSnapshots.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Last Archived</p>
                      <p className="text-sm text-muted-foreground">{analytics.openSourceData.historicalData.lastArchived}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Availability Score</p>
                      <div className="flex items-center gap-2">
                        <Progress value={analytics.openSourceData.historicalData.availabilityScore} className="flex-1" />
                        <span className="text-sm text-muted-foreground">{analytics.openSourceData.historicalData.availabilityScore}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Security Reputation */}
            {analytics.openSourceData?.securityReputation && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className={`w-5 h-5 ${
                      analytics.openSourceData.securityReputation.isSafe ? 'text-green-600' : 'text-red-600'
                    }`} />
                    Security Status
                  </CardTitle>
                  <CardDescription>Website security and reputation analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium">Safety Status</p>
                        <Badge variant={analytics.openSourceData.securityReputation.isSafe ? "default" : "destructive"} className="mt-1">
                          {analytics.openSourceData.securityReputation.isSafe ? 'Safe' : 'Warning'}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Threat Level</p>
                        <Badge 
                          variant={
                            analytics.openSourceData.securityReputation.threatLevel === 'low' ? 'default' :
                            analytics.openSourceData.securityReputation.threatLevel === 'medium' ? 'secondary' : 'destructive'
                          }
                          className="mt-1"
                        >
                          {analytics.openSourceData.securityReputation.threatLevel.toUpperCase()}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Safety Score</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={analytics.openSourceData.securityReputation.safetyScore} className="flex-1" />
                          <span className="text-sm text-muted-foreground">{analytics.openSourceData.securityReputation.safetyScore}%</span>
                        </div>
                      </div>
                    </div>
                    
                    {analytics.openSourceData.securityReputation.threats.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Detected Threats</p>
                        <div className="flex flex-wrap gap-1">
                          {analytics.openSourceData.securityReputation.threats.map((threat, index) => (
                            <Badge key={index} variant="destructive" className="text-xs">
                              {threat}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Certificate Transparency */}
            {analytics.openSourceData?.certificates && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-orange-600" />
                    SSL Certificates
                  </CardTitle>
                  <CardDescription>Certificate transparency and subdomain discovery</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium">Certificates Found</p>
                        <p className="text-sm text-muted-foreground">{analytics.openSourceData.certificates.certificateCount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Subdomains</p>
                        <p className="text-sm text-muted-foreground">{analytics.openSourceData.certificates.subdomains.length}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Transparency Score</p>
                        <div className="flex items-center gap-2">
                          <Progress value={analytics.openSourceData.certificates.transparencyScore} className="flex-1" />
                          <span className="text-sm text-muted-foreground">{analytics.openSourceData.certificates.transparencyScore}%</span>
                        </div>
                      </div>
                    </div>

                    {analytics.openSourceData.certificates.issuers.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Certificate Issuers</p>
                        <div className="flex flex-wrap gap-1">
                          {analytics.openSourceData.certificates.issuers.map((issuer, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {issuer}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {analytics.openSourceData.certificates.subdomains.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Discovered Subdomains (Top 10)</p>
                        <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                          {analytics.openSourceData.certificates.subdomains.slice(0, 10).map((subdomain, index) => (
                            <div key={index} className="p-2 bg-secondary/30 rounded text-xs">
                              {subdomain}
                            </div>
                          ))}
                        </div>
                        {analytics.openSourceData.certificates.subdomains.length > 10 && (
                          <p className="text-xs text-muted-foreground mt-2">
                            +{analytics.openSourceData.certificates.subdomains.length - 10} more subdomains found
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* AI Insights Tab */}
          {analytics?.llmInsights && (
            <TabsContent value="ai-insights" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Market Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-600" />
                      Market Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {analytics.llmInsights.marketAnalysis}
                    </p>
                  </CardContent>
                </Card>

                {/* Competitive Position */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-600" />
                      Competitive Position
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {analytics.llmInsights.competitivePosition}
                    </p>
                  </CardContent>
                </Card>

                {/* Growth Opportunities */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      Growth Opportunities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analytics.llmInsights.growthOpportunities.map((opportunity, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{opportunity}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Technical Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-orange-600" />
                      Technical Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analytics.llmInsights.technicalRecommendations.map((rec, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Lightbulb className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Content Strategy & SEO */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-indigo-600" />
                      Content Strategy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {analytics.llmInsights.contentStrategy}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="w-5 h-5 text-red-600" />
                      SEO Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {analytics.llmInsights.seoInsights}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Traffic Analysis & Business Intelligence */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-cyan-600" />
                      Traffic Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {analytics.llmInsights.trafficAnalysis}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-yellow-600" />
                      Business Intelligence
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {analytics.llmInsights.businessIntelligence}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Actionable Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    Actionable Tips
                  </CardTitle>
                  <CardDescription>
                    AI-powered recommendations for immediate implementation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {analytics.llmInsights.actionableTips.map((tip, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-secondary/20 rounded-lg">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 text-sm font-medium">
                          {index + 1}
                        </span>
                        <span className="text-sm text-muted-foreground flex-1">{tip}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* AI Analysis Badge */}
              <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Brain className="w-6 h-6 text-purple-600" />
                      <div>
                        <h3 className="font-medium text-foreground">AI-Enhanced Analysis</h3>
                        <p className="text-sm text-muted-foreground">
                          Powered by OpenAI GPT-4 • Data Quality: {analytics.dataQuality.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {analytics.actualDataSources.map((source) => (
                        <Badge key={source} variant="secondary" className="text-xs">
                          {source}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {/* Data Sources Footer */}
        <Card className="bg-secondary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Data Sources</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(providersStatus).map(([key, provider]) => (
                  <Badge 
                    key={key} 
                    variant={provider.enabled ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {provider.name}
                  </Badge>
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Domain analytics powered by multiple third-party data providers. 
              {enabledProviders.length === 0 && " Configure API keys to get real-time data from premium sources."}
              Last updated: {new Date(analytics.lastUpdated).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DomainAnalyticsReport; 