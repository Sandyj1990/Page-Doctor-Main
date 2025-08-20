/**
 * Page Doctor Embeddable Widget
 * 
 * A lightweight, embeddable widget component that can be integrated into
 * external applications, CMS plugins, and other projects.
 */

import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, Globe, AlertCircle, CheckCircle, Clock, ExternalLink } from "lucide-react";
import { PageDoctorAPI, WidgetConfig, AuditRequest, WidgetAuditResult } from '../api/marketplace';

interface PageDoctorWidgetProps {
  config?: WidgetConfig;
  defaultUrl?: string;
  onAuditComplete?: (result: WidgetAuditResult) => void;
  onError?: (error: string) => void;
  className?: string;
}

interface WidgetState {
  url: string;
  isLoading: boolean;
  progress: number;
  progressMessage: string;
  result: WidgetAuditResult | null;
  error: string | null;
  auditType: 'single' | 'full' | 'sections';
}

export const PageDoctorWidget: React.FC<PageDoctorWidgetProps> = ({
  config = {},
  defaultUrl = '',
  onAuditComplete,
  onError,
  className = ''
}) => {
  const [state, setState] = useState<WidgetState>({
    url: defaultUrl,
    isLoading: false,
    progress: 0,
    progressMessage: '',
    result: null,
    error: null,
    auditType: 'single'
  });

  // Apply theme configuration
  const theme = config.theme || 'light';
  const primaryColor = config.primaryColor || '#3b82f6';
  const compact = config.compact || false;
  const showBranding = config.showBranding !== false;

  // Theme styles
  const themeClasses = {
    light: 'bg-white text-gray-900 border-gray-200',
    dark: 'bg-gray-900 text-white border-gray-700',
    auto: 'bg-background text-foreground border-border'
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  const handleUrlChange = (value: string) => {
    setState(prev => ({ ...prev, url: value, error: null }));
  };

  const handleAuditTypeChange = (type: 'single' | 'full' | 'sections') => {
    setState(prev => ({ ...prev, auditType: type }));
  };

  const runAudit = async () => {
    if (!state.url.trim()) {
      setState(prev => ({ ...prev, error: 'Please enter a valid URL' }));
      return;
    }

    setState(prev => ({
      ...prev,
      isLoading: true,
      progress: 0,
      progressMessage: 'Starting audit...',
      result: null,
      error: null
    }));

    try {
      const request: AuditRequest = {
        url: state.url,
        type: state.auditType,
        options: {
          useFastMode: true,
          maxPages: 15
        },
        config
      };

      // Simulate progress updates for better UX
      const progressInterval = setInterval(() => {
        setState(prev => {
          if (prev.progress < 90) {
            return {
              ...prev,
              progress: prev.progress + 10,
              progressMessage: getProgressMessage(prev.progress + 10)
            };
          }
          return prev;
        });
      }, 500);

      const result = await PageDoctorAPI.runAudit(request);

      clearInterval(progressInterval);

      if (!result.success) {
        throw new Error(result.error || 'Audit failed');
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        progress: 100,
        progressMessage: 'Audit complete!',
        result: result.data!
      }));

      // Call completion callback
      if (onAuditComplete && result.data) {
        onAuditComplete(result.data);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Audit failed';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));

      if (onError) {
        onError(errorMessage);
      }
    }
  };

  const getProgressMessage = (progress: number): string => {
    if (progress < 20) return 'Initializing audit...';
    if (progress < 40) return 'Discovering pages...';
    if (progress < 60) return 'Analyzing content...';
    if (progress < 80) return 'Checking performance...';
    if (progress < 95) return 'Generating report...';
    return 'Finalizing results...';
  };

  const resetWidget = () => {
    setState(prev => ({
      ...prev,
      result: null,
      error: null,
      progress: 0,
      progressMessage: ''
    }));
  };

  return (
    <div className={`page-doctor-widget ${themeClasses[theme]} ${className}`}>
      <Card className={`p-6 ${compact ? 'max-w-md' : 'max-w-2xl'} w-full border-2`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${primaryColor}20` }}>
              <Stethoscope className="w-6 h-6" style={{ color: primaryColor }} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Page Doctor</h3>
              {!compact && <p className="text-sm opacity-70">Website Health Checkup</p>}
            </div>
          </div>
          {showBranding && (
            <Badge variant="outline" className="text-xs">
              Powered by Page Doctor
            </Badge>
          )}
        </div>

        {/* Results Display */}
        {state.result ? (
          <div className="space-y-4">
            {/* Overall Score */}
            <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="text-3xl font-bold" style={{ color: primaryColor }}>
                {state.result.overallScore}
              </div>
              <div className="text-sm opacity-70">Overall Health Score</div>
            </div>

            {/* Category Scores */}
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 rounded border">
                <div className={`text-xl font-semibold ${getScoreColor(state.result.categories.writingQuality)}`}>
                  {state.result.categories.writingQuality}
                </div>
                <div className="text-xs opacity-70">Writing</div>
              </div>
              <div className="text-center p-3 rounded border">
                <div className={`text-xl font-semibold ${getScoreColor(state.result.categories.seoSignals)}`}>
                  {state.result.categories.seoSignals}
                </div>
                <div className="text-xs opacity-70">SEO</div>
              </div>
              <div className="text-center p-3 rounded border">
                <div className={`text-xl font-semibold ${getScoreColor(state.result.categories.structure)}`}>
                  {state.result.categories.structure}
                </div>
                <div className="text-xs opacity-70">Structure</div>
              </div>
              <div className="text-center p-3 rounded border">
                <div className={`text-xl font-semibold ${getScoreColor(state.result.categories.technical)}`}>
                  {state.result.categories.technical}
                </div>
                <div className="text-xs opacity-70">Technical</div>
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4" />
                <span>{state.result.summary.totalPages} pages analyzed</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" />
                <span>Completed in {(state.result.summary.completionTime / 1000).toFixed(1)}s</span>
              </div>
            </div>

            {/* Recommendations */}
            {state.result.summary.recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Key Recommendations:</h4>
                {state.result.summary.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <AlertCircle className="w-4 h-4 mt-0.5 text-amber-500" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button
                onClick={resetWidget}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                New Audit
              </Button>
              {!compact && (
                <Button
                  onClick={() => window.open(window.location.origin, '_blank')}
                  variant="default"
                  size="sm"
                  className="flex items-center gap-2"
                  style={{ backgroundColor: primaryColor }}
                >
                  <ExternalLink className="w-4 h-4" />
                  Full Report
                </Button>
              )}
            </div>
          </div>
        ) : (
          /* Audit Form */
          <div className="space-y-4">
            {/* URL Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Website URL
              </label>
              <Input
                type="url"
                value={state.url}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="Enter website URL"
                disabled={state.isLoading}
                className="h-10"
              />
            </div>

            {/* Audit Type Selection */}
            {!compact && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Audit Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['single', 'full', 'sections'] as const).map((type) => (
                    <Button
                      key={type}
                      variant={state.auditType === type ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleAuditTypeChange(type)}
                      disabled={state.isLoading}
                      className="text-xs"
                    >
                      {type === 'single' && 'Single Page'}
                      {type === 'full' && 'Full Site'}
                      {type === 'sections' && 'Sections'}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Loading State */}
            {state.isLoading && (
              <div className="space-y-3">
                <Progress value={state.progress} className="w-full" />
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                  <span>{state.progressMessage}</span>
                </div>
              </div>
            )}

            {/* Error Display */}
            {state.error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{state.error}</span>
              </div>
            )}

            {/* Run Audit Button */}
            <Button
              onClick={runAudit}
              disabled={state.isLoading || !state.url.trim()}
              className="w-full h-10"
              style={{ backgroundColor: primaryColor }}
            >
              {state.isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Running Audit...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" />
                  Run Health Check
                </div>
              )}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PageDoctorWidget; 