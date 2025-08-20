/**
 * LLM-Enhanced Web Optimization Service
 * Provides AI-powered content analysis and improvement recommendations
 */

interface LLMConfig {
  apiKey?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

interface ContentAnalysisRequest {
  url: string;
  title: string;
  content: string;
  metaDescription?: string;
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
  };
  images: Array<{
    src: string;
    alt: string;
  }>;
}

interface LLMContentAnalysis {
  readabilityScore: number;
  toneAnalysis: 'professional' | 'casual' | 'technical' | 'marketing' | 'conversational';
  contentGaps: string[];
  improvementSuggestions: string[];
  keywordOptimization: {
    currentKeywords: string[];
    suggestedKeywords: string[];
    keywordDensity: number;
    recommendations: string[];
  };
  seoInsights: {
    titleOptimization: string;
    metaDescriptionSuggestion: string;
    headingStructure: string[];
    internalLinkingSuggestions: string[];
  };
  accessibilityInsights: {
    imageAltTextIssues: string[];
    headingHierarchyIssues: string[];
    generalRecommendations: string[];
  };
  userExperienceScore: number;
  competitiveAdvantages: string[];
}

interface EnhancedScoreItem {
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

export class LLMService {
  private config: Required<LLMConfig>;
  private isEnabled: boolean = false;

  constructor(config: LLMConfig = {}) {
    this.config = {
      apiKey: config.apiKey || import.meta.env.VITE_OPENAI_API_KEY || '',
      model: config.model || import.meta.env.VITE_LLM_MODEL || 'gpt-4o-mini',
      maxTokens: config.maxTokens || parseInt(import.meta.env.VITE_LLM_MAX_TOKENS || '2000'),
      temperature: config.temperature || parseFloat(import.meta.env.VITE_LLM_TEMPERATURE || '0.3')
    };
    
    this.isEnabled = !!this.config.apiKey;
    
    if (!this.isEnabled) {
      console.warn('⚠️  LLM Service: No API key provided. LLM features will be disabled.');
      console.warn('💡 Add VITE_OPENAI_API_KEY to your .env.local file to enable AI-enhanced analytics');
    } else {
      console.log('✅ LLM Service initialized with model:', this.config.model);
    }
  }

  /**
   * Check if LLM service is available
   */
  isAvailable(): boolean {
    return this.isEnabled;
  }

  /**
   * Analyze page content with LLM for comprehensive insights
   */
  async analyzeContent(request: ContentAnalysisRequest): Promise<LLMContentAnalysis | null> {
    if (!this.isEnabled) {
      console.log('🤖 LLM Service disabled - skipping content analysis');
      return null;
    }

    try {
      console.log('🤖 Starting LLM content analysis for:', request.url);

      const systemPrompt = `You are an expert web optimization consultant with deep knowledge of SEO, UX, content strategy, and accessibility. Analyze the provided webpage content and return a JSON response with detailed insights and actionable recommendations.

Focus on:
1. Content quality and readability
2. SEO optimization opportunities  
3. User experience improvements
4. Accessibility enhancements
5. Competitive positioning

Be specific, actionable, and prioritize high-impact improvements.`;

      const userPrompt = `Analyze this webpage:

URL: ${request.url}
Title: ${request.title}
Meta Description: ${request.metaDescription || 'None provided'}

Headings:
H1: ${request.headings.h1.join(', ') || 'None'}
H2: ${request.headings.h2.join(', ') || 'None'}  
H3: ${request.headings.h3.join(', ') || 'None'}

Content (first 3000 chars):
${request.content.substring(0, 3000)}

Images:
${request.images.slice(0, 10).map(img => `- ${img.src} (alt: "${img.alt || 'missing'}")`).join('\n')}

Please provide a comprehensive analysis in valid JSON format matching this structure:
{
  "readabilityScore": number (0-100),
  "toneAnalysis": "professional|casual|technical|marketing|conversational",
  "contentGaps": ["specific gap 1", "specific gap 2"],
  "improvementSuggestions": ["actionable suggestion 1", "actionable suggestion 2"],
  "keywordOptimization": {
    "currentKeywords": ["keyword1", "keyword2"],
    "suggestedKeywords": ["new keyword1", "new keyword2"],
    "keywordDensity": number,
    "recommendations": ["specific rec 1", "specific rec 2"]
  },
  "seoInsights": {
    "titleOptimization": "specific title improvement",
    "metaDescriptionSuggestion": "improved meta description",
    "headingStructure": ["heading improvement 1", "heading improvement 2"],
    "internalLinkingSuggestions": ["linking suggestion 1", "linking suggestion 2"]
  },
  "accessibilityInsights": {
    "imageAltTextIssues": ["issue 1", "issue 2"],
    "headingHierarchyIssues": ["hierarchy issue 1"],
    "generalRecommendations": ["accessibility rec 1", "accessibility rec 2"]
  },
  "userExperienceScore": number (0-100),
  "competitiveAdvantages": ["advantage 1", "advantage 2"]
}`;

      const response = await this.callOpenAI(systemPrompt, userPrompt);
      
      if (!response) {
        console.error('❌ LLM API call failed');
        return null;
      }

      const analysis = this.parseJSONResponse(response);
      
      if (!analysis) {
        console.error('❌ Failed to parse LLM response as JSON');
        return null;
      }

      console.log('✅ LLM content analysis completed successfully');
      return analysis as LLMContentAnalysis;

    } catch (error) {
      console.error('❌ LLM content analysis failed:', error);
      return null;
    }
  }

  /**
   * Generate industry-specific recommendations
   */
  async generateIndustryRecommendations(
    content: string, 
    industry: string,
    businessType: string
  ): Promise<string[] | null> {
    if (!this.isEnabled) return null;

    try {
      const systemPrompt = `You are a digital marketing expert specializing in ${industry} businesses. Provide specific, actionable recommendations for improving this ${businessType} website.`;

      const userPrompt = `Analyze this ${industry} ${businessType} webpage content and provide 5-7 industry-specific optimization recommendations:

Content: ${content.substring(0, 2000)}

Focus on:
- Industry-specific SEO opportunities
- Conversion optimization for ${businessType}
- Trust signals important in ${industry}
- Competitive advantages
- User journey improvements

Return only a JSON array of specific recommendations:
["recommendation 1", "recommendation 2", ...]`;

      const response = await this.callOpenAI(systemPrompt, userPrompt);
      return response ? this.parseJSONResponse(response) : null;

    } catch (error) {
      console.error('❌ Industry recommendations failed:', error);
      return null;
    }
  }

  /**
   * Enhance existing audit scores with LLM insights
   */
  enhanceScoreWithLLM(
    scoreItem: any,
    llmAnalysis: LLMContentAnalysis,
    category: 'content' | 'seo' | 'accessibility' | 'ux'
  ): EnhancedScoreItem {
    const enhanced: EnhancedScoreItem = {
      ...scoreItem,
      llmInsights: this.generateInsightsForCategory(category, llmAnalysis)
    };

    // Adjust score based on LLM insights (optional)
    if (category === 'content' && llmAnalysis.readabilityScore) {
      enhanced.score = Math.round((enhanced.score + llmAnalysis.readabilityScore) / 2);
    }

    return enhanced;
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(systemPrompt: string, userPrompt: string): Promise<string | null> {
    try {
      // Add 10-second timeout for OpenAI API
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || null;

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error('❌ OpenAI API timeout (10s) - API too slow');
      } else {
        console.error('❌ OpenAI API error:', error.message);
      }
      return null;
    }
  }

  /**
   * Parse JSON response safely
   */
  private parseJSONResponse(response: string): any | null {
    try {
      // Clean up response (remove markdown code blocks if present)
      const cleaned = response.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (error) {
      console.error('Failed to parse JSON response:', error);
      console.log('Raw response:', response);
      return null;
    }
  }

  /**
   * Generate category-specific insights
   */
  private generateInsightsForCategory(
    category: 'content' | 'seo' | 'accessibility' | 'ux',
    analysis: LLMContentAnalysis
  ) {
    switch (category) {
      case 'content':
        return {
          analysis: `Content tone is ${analysis.toneAnalysis} with readability score of ${analysis.readabilityScore}/100`,
          recommendations: analysis.improvementSuggestions.slice(0, 3),
          priority: analysis.readabilityScore < 70 ? 'high' as const : 'medium' as const
        };
      
      case 'seo':
        return {
          analysis: analysis.seoInsights.titleOptimization,
          recommendations: [
            analysis.seoInsights.metaDescriptionSuggestion,
            ...analysis.seoInsights.headingStructure.slice(0, 2)
          ],
          priority: 'high' as const
        };
      
      case 'accessibility':
        return {
          analysis: `Found ${analysis.accessibilityInsights.imageAltTextIssues.length} image accessibility issues`,
          recommendations: analysis.accessibilityInsights.generalRecommendations.slice(0, 3),
          priority: analysis.accessibilityInsights.imageAltTextIssues.length > 0 ? 'high' as const : 'medium' as const
        };
      
      case 'ux':
        return {
          analysis: `User experience score: ${analysis.userExperienceScore}/100`,
          recommendations: analysis.competitiveAdvantages.slice(0, 3),
          priority: analysis.userExperienceScore < 70 ? 'high' as const : 'medium' as const
        };
      
      default:
        return {
          analysis: 'LLM analysis completed',
          recommendations: [],
          priority: 'medium' as const
        };
    }
  }
}

// Export singleton instance
export const llmService = new LLMService();

// Export types for use in other files
export type { LLMContentAnalysis, EnhancedScoreItem, ContentAnalysisRequest }; 