/**
 * Enhanced Audit Service with LLM Integration
 * Combines traditional Page Doctor audits with AI-powered insights
 */

import { generateAuditResult } from './auditService';
import { llmService, LLMContentAnalysis, EnhancedScoreItem, ContentAnalysisRequest } from './llmService';
import { CrawleeService } from './crawleeService';

interface EnhancedAuditResult {
  overallScore: number;
  writingQuality: EnhancedScoreItem[];
  seoSignals: EnhancedScoreItem[];
  structure: EnhancedScoreItem[];
  technical: EnhancedScoreItem[];
  llmAnalysis?: LLMContentAnalysis;
  enhancementLevel: 'basic' | 'llm-enhanced';
  processingTime: number;
}

interface EnhancedAuditOptions {
  useLLM?: boolean;
  useFastMode?: boolean;
  includeContentAnalysis?: boolean;
  includeIndustryInsights?: boolean;
  industry?: string;
  businessType?: string;
  auditProvider?: 'pagespeed' | 'lighthouse' | 'sitespeed';
}

export class EnhancedAuditService {
  
  /**
   * Generate comprehensive audit with optional LLM enhancement
   */
  static async generateEnhancedAudit(
    url: string, 
    options: EnhancedAuditOptions = {}
  ): Promise<EnhancedAuditResult> {
    const startTime = Date.now();
    console.log('🚀 Starting enhanced audit for:', url, options);

    // Add 15-second timeout to entire enhanced audit process for faster responses
    return new Promise(async (resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Enhanced audit timeout (15s) - taking too long'));
      }, 15000);

      try {
        // Step 1: Get basic audit results
        const basicAudit = await generateAuditResult(url, options.useFastMode, options.auditProvider);
        
        let enhancedResult: EnhancedAuditResult = {
          overallScore: basicAudit.overallScore,
          writingQuality: basicAudit.writingQuality as EnhancedScoreItem[],
          seoSignals: basicAudit.seoSignals as EnhancedScoreItem[],
          structure: basicAudit.structure as EnhancedScoreItem[],
          technical: basicAudit.technical as EnhancedScoreItem[],
          enhancementLevel: 'basic',
          processingTime: Date.now() - startTime
        };

        // Step 2: Add LLM enhancement if requested and available
        if (options.useLLM && llmService.isAvailable()) {
          console.log('🤖 Adding LLM enhancement...');
          
          const llmAnalysis = await this.performLLMAnalysis(url);
          
          if (llmAnalysis) {
            enhancedResult = await this.enhanceWithLLM(enhancedResult, llmAnalysis, options);
            enhancedResult.llmAnalysis = llmAnalysis;
            enhancedResult.enhancementLevel = 'llm-enhanced';
            
            console.log('✅ LLM enhancement completed successfully');
          } else {
            console.log('⚠️  LLM enhancement failed, using basic results');
          }
        } else if (options.useLLM && !llmService.isAvailable()) {
          console.log('⚠️  LLM enhancement requested but service unavailable');
        }

        enhancedResult.processingTime = Date.now() - startTime;
        
        clearTimeout(timeoutId);
        console.log(`✅ Enhanced audit completed in ${enhancedResult.processingTime}ms`);
        resolve(enhancedResult);

      } catch (error) {
        clearTimeout(timeoutId);
        console.error('❌ Enhanced audit failed:', error);
        reject(new Error(`Enhanced audit failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    });
  }

  /**
   * Perform LLM analysis by extracting page content
   */
  private static async performLLMAnalysis(url: string): Promise<LLMContentAnalysis | null> {
    try {
      console.log('📄 Extracting page content for LLM analysis...');
      
      // Use CrawleeService to extract detailed page content
      const pageData = await CrawleeService.crawlSingle(url);
      
      if (!pageData) {
        console.log('⚠️  Could not extract page content for LLM analysis');
        return null;
      }

      // Prepare content analysis request
      const analysisRequest: ContentAnalysisRequest = {
        url: pageData.url,
        title: pageData.title,
        content: pageData.content,
        metaDescription: pageData.metaDescription,
        headings: pageData.headings,
        images: pageData.images
      };

      // Perform LLM analysis
      return await llmService.analyzeContent(analysisRequest);

    } catch (error) {
      console.error('❌ LLM analysis failed:', error);
      return null;
    }
  }

  /**
   * Enhance basic audit results with LLM insights
   */
  private static async enhanceWithLLM(
    basicResult: EnhancedAuditResult,
    llmAnalysis: LLMContentAnalysis,
    options: EnhancedAuditOptions
  ): Promise<EnhancedAuditResult> {
    
    // Enhance Writing Quality scores
    const enhancedWritingQuality = basicResult.writingQuality.map(item => {
      if (item.name.includes('Content') || item.name.includes('Accessibility')) {
        return llmService.enhanceScoreWithLLM(item, llmAnalysis, 'content');
      }
      return item;
    });

    // Enhance SEO Signals with LLM insights
    const enhancedSEOSignals = basicResult.seoSignals.map(item => {
      return llmService.enhanceScoreWithLLM(item, llmAnalysis, 'seo');
    });

    // Enhance Structure scores
    const enhancedStructure = basicResult.structure.map(item => {
      return llmService.enhanceScoreWithLLM(item, llmAnalysis, 'accessibility');
    });

    // Enhance Technical scores (UX focus)
    const enhancedTechnical = basicResult.technical.map(item => {
      return llmService.enhanceScoreWithLLM(item, llmAnalysis, 'ux');
    });

    // Add LLM-specific insights as new score items
    const llmContentScore: EnhancedScoreItem = {
      name: 'AI Content Analysis',
      score: llmAnalysis.readabilityScore,
      status: llmAnalysis.readabilityScore >= 80 ? 'good' : 
               llmAnalysis.readabilityScore >= 60 ? 'warning' : 'poor',
      description: `AI-powered content quality analysis (${llmAnalysis.toneAnalysis} tone)`,
      details: [
        `Readability Score: ${llmAnalysis.readabilityScore}/100`,
        `Content Tone: ${llmAnalysis.toneAnalysis}`,
        `Keywords Identified: ${llmAnalysis.keywordOptimization.currentKeywords.length}`,
        `Content Gaps Found: ${llmAnalysis.contentGaps.length}`
      ],
      llmInsights: {
        analysis: `Comprehensive AI analysis of content quality and optimization opportunities`,
        recommendations: llmAnalysis.improvementSuggestions.slice(0, 3),
        priority: llmAnalysis.readabilityScore < 70 ? 'high' : 'medium'
      },
      stats: {
        found: llmAnalysis.readabilityScore,
        total: 100,
        examples: llmAnalysis.keywordOptimization.suggestedKeywords.slice(0, 3)
      }
    };

    const llmUXScore: EnhancedScoreItem = {
      name: 'AI User Experience Analysis',
      score: llmAnalysis.userExperienceScore,
      status: llmAnalysis.userExperienceScore >= 80 ? 'good' : 
               llmAnalysis.userExperienceScore >= 60 ? 'warning' : 'poor',
      description: 'AI-powered user experience and engagement analysis',
      details: [
        `UX Score: ${llmAnalysis.userExperienceScore}/100`,
        `Competitive Advantages: ${llmAnalysis.competitiveAdvantages.length}`,
        `Improvement Areas: ${llmAnalysis.contentGaps.length}`,
        `Optimization Opportunities: ${llmAnalysis.improvementSuggestions.length}`
      ],
      llmInsights: {
        analysis: 'AI analysis of user experience and competitive positioning',
        recommendations: llmAnalysis.competitiveAdvantages.slice(0, 3),
        priority: llmAnalysis.userExperienceScore < 70 ? 'high' : 'medium'
      },
      stats: {
        found: llmAnalysis.userExperienceScore,
        total: 100,
        examples: llmAnalysis.competitiveAdvantages
      }
    };

    // Add industry-specific insights if requested
    if (options.includeIndustryInsights && options.industry) {
      try {
        const industryRecs = await llmService.generateIndustryRecommendations(
          llmAnalysis.improvementSuggestions.join(' '),
          options.industry,
          options.businessType || 'website'
        );

        if (industryRecs && industryRecs.length > 0) {
          const industryScore: EnhancedScoreItem = {
            name: `${options.industry} Industry Optimization`,
            score: 75, // Base score, could be calculated based on recommendations
            status: 'warning',
            description: `Industry-specific optimization recommendations for ${options.industry} businesses`,
            details: industryRecs.slice(0, 4),
            llmInsights: {
              analysis: `Tailored recommendations for ${options.industry} industry`,
              recommendations: industryRecs,
              priority: 'medium'
            },
            stats: {
              found: industryRecs.length,
              total: 10
            }
          };

          enhancedSEOSignals.push(industryScore);
        }
      } catch (error) {
        console.error('Industry insights generation failed:', error);
      }
    }

    // Calculate enhanced overall score
    const allScores = [
      ...enhancedWritingQuality.map(item => item.score),
      ...enhancedSEOSignals.map(item => item.score),
      ...enhancedStructure.map(item => item.score),
      ...enhancedTechnical.map(item => item.score),
      llmContentScore.score,
      llmUXScore.score
    ];

    const enhancedOverallScore = Math.round(
      allScores.reduce((sum, score) => sum + score, 0) / allScores.length
    );

    return {
      ...basicResult,
      overallScore: enhancedOverallScore,
      writingQuality: [...enhancedWritingQuality, llmContentScore],
      seoSignals: enhancedSEOSignals,
      structure: enhancedStructure,
      technical: [...enhancedTechnical, llmUXScore]
    };
  }

  /**
   * Get available enhancement options
   */
  static getEnhancementOptions(): { 
    llmAvailable: boolean; 
    supportedFeatures: string[];
    estimatedTime: { basic: string; enhanced: string; };
  } {
    return {
      llmAvailable: llmService.isAvailable(),
      supportedFeatures: [
        'Content Quality Analysis',
        'SEO Optimization Insights',
        'Accessibility Recommendations',
        'User Experience Analysis',
        'Industry-Specific Guidance',
        'Competitive Positioning'
      ],
      estimatedTime: {
        basic: '3-8 seconds',
        enhanced: '8-15 seconds'
      }
    };
  }
}

// Export types
export type { EnhancedAuditResult, EnhancedAuditOptions };
export type { EnhancedScoreItem } from './llmService'; 