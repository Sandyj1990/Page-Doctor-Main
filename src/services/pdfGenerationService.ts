/**
 * PDF Generation Service for Page Doctor Audit Reports
 * Converts comprehensive audit analysis to professional PDF reports
 */

export interface PDFReportData {
  website: string;
  overallScore: number;
  analysisDate: string;
  analysisMethods: string;
  scores: {
    writing: number;
    seo: number;
    structure: number;
    technical: number;
  };
  detailedScores?: {
    writing: {
      readability: { score: number; analysis: string; recommendations: string };
      grammar: { score: number; analysis: string; recommendations: string };
      contentLength: { score: number; analysis: string; recommendations: string };
      headingStructure: { score: number; analysis: string; recommendations: string };
    };
    seo: {
      titleTags: { score: number; analysis: string; recommendations: string };
      metaDescription: { score: number; analysis: string; recommendations: string };
      urlStructure: { score: number; analysis: string; recommendations: string };
      internalLinking: { score: number; analysis: string; recommendations: string };
    };
    structure: {
      navigation: { score: number; analysis: string; recommendations: string };
      mobileLayout: { score: number; analysis: string; recommendations: string };
      visualSpacing: { score: number; analysis: string; recommendations: string };
      typography: { score: number; analysis: string; recommendations: string };
    };
    technical: {
      pageSpeed: { score: number; analysis: string; recommendations: string };
      htmlValidation: { score: number; analysis: string; recommendations: string };
      httpsSecurity: { score: number; analysis: string; recommendations: string };
      mobileFriendly: { score: number; analysis: string; recommendations: string };
    };
  };
  crawleeData?: {
    contentLength: number;
    linksFound: number;
    imagesFound: number;
    headings: { h1: number; h2: number; h3: number };
    loadTime: number;
  };
  pageSpeedData?: any;
  lighthouseData?: any;
  businessImpact?: {
    currentStrengths: string[];
    growthOpportunities: string[];
    expectedImpact: string[];
  };
  competitiveAnalysis?: {
    technicalPerformance: string;
    contentDepth: string;
    industryFocus: string;
    mobileExperience: string;
  };
  industrySpecific?: {
    features: string[];
    applications: string[];
    metrics: string[];
  };
  recommendations: {
    critical: string[];
    high: string[];
    medium: string[];
    low: string[];
  };
}

export class PDFGenerationService {
  /**
   * Generate PDF report from audit data
   */
  static async generateAuditPDF(reportData: PDFReportData): Promise<Uint8Array> {
    const isBrowser = typeof window !== 'undefined';
    
    if (isBrowser) {
      throw new Error('PDF generation requires Node.js environment with Puppeteer');
    }

    try {
      // Dynamic import for Node.js environment
      const puppeteer = await import('puppeteer');
      
      console.log('🎯 Generating PDF report...');
      console.log('📊 Report data keys:', Object.keys(reportData));
      console.log('📝 Detailed scores present:', !!reportData.detailedScores);
      if (reportData.detailedScores) {
        console.log('📋 Detailed scores structure:', Object.keys(reportData.detailedScores));
      }
      
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      
      // Generate HTML content for PDF
      const htmlContent = this.generateHTMLReport(reportData);
      
      // Set content and wait for rendering
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      // Generate PDF with professional formatting
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          bottom: '20mm',
          left: '15mm',
          right: '15mm'
        },
        displayHeaderFooter: true,
        headerTemplate: `
          <div style="font-size: 10px; text-align: center; width: 100%; color: #666;">
            <span>Page Doctor - Website Audit Report</span>
          </div>
        `,
        footerTemplate: `
          <div style="font-size: 10px; text-align: center; width: 100%; color: #666;">
            <span class="pageNumber"></span> / <span class="totalPages"></span>
          </div>
        `
      });
      
      await browser.close();
      
      console.log('✅ PDF report generated successfully');
      return pdf;
      
    } catch (error) {
      console.error('❌ PDF generation failed:', error);
      throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate professional HTML template for PDF conversion
   */
  private static generateHTMLReport(data: PDFReportData): string {
    const gradeClass = this.getGradeClass(data.overallScore);
    const gradeText = this.getGradeText(data.overallScore);
    
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Page Doctor Audit Report - ${data.website}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background: #fff;
        }
        
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px 20px;
          text-align: center;
          margin-bottom: 30px;
        }
        
        .header h1 {
          font-size: 2.5em;
          margin-bottom: 10px;
          font-weight: 300;
        }
        
        .header .subtitle {
          font-size: 1.2em;
          opacity: 0.9;
        }
        
        .score-summary {
          background: #f8f9fa;
          border-radius: 10px;
          padding: 30px;
          margin: 20px 0;
          text-align: center;
          border-left: 5px solid #667eea;
        }
        
        .overall-score {
          font-size: 4em;
          font-weight: bold;
          margin: 20px 0;
        }
        
        .grade-excellent { color: #28a745; }
        .grade-good { color: #17a2b8; }
        .grade-fair { color: #ffc107; }
        .grade-poor { color: #dc3545; }
        
        .score-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin: 30px 0;
        }
        
        .score-card {
          background: white;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          border-top: 4px solid #667eea;
        }
        
        .score-card h3 {
          color: #667eea;
          margin-bottom: 10px;
          font-size: 1.1em;
        }
        
        .score-value {
          font-size: 2.5em;
          font-weight: bold;
          margin: 10px 0;
        }
        
        .score-percentage {
          color: #666;
          font-size: 0.9em;
        }
        
        .section {
          margin: 30px 0;
          padding: 20px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }
        
        .section h2 {
          color: #667eea;
          border-bottom: 2px solid #667eea;
          padding-bottom: 10px;
          margin-bottom: 20px;
          font-size: 1.5em;
        }
        
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin: 20px 0;
        }
        
        .metric {
          padding: 15px;
          background: #f8f9fa;
          border-radius: 5px;
          border-left: 3px solid #667eea;
        }
        
        .metric-name {
          font-weight: bold;
          color: #333;
          margin-bottom: 5px;
        }
        
        .metric-value {
          color: #666;
          font-size: 0.9em;
        }
        
        .recommendations {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        
        .recommendations h3 {
          color: #856404;
          margin-bottom: 15px;
        }
        
        .rec-list {
          list-style: none;
          padding: 0;
        }
        
        .rec-list li {
          padding: 8px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        
                 .rec-list li:last-child {
           border-bottom: none;
         }
         
         .priority-critical { border-left: 4px solid #dc3545; padding-left: 10px; }
         .priority-high { border-left: 4px solid #fd7e14; padding-left: 10px; }
         .priority-medium { border-left: 4px solid #ffc107; padding-left: 10px; }
         .priority-low { border-left: 4px solid #28a745; padding-left: 10px; }
         
         .detail-card {
           background: #f8f9fa;
           border-radius: 8px;
           padding: 20px;
           margin: 15px 0;
           border-left: 4px solid #667eea;
         }
         
         .detail-card h3 {
           color: #667eea;
           margin-bottom: 15px;
           font-size: 1.1em;
         }
         
         .detail-card p {
           margin: 10px 0;
           line-height: 1.6;
         }
         
         .business-card {
           background: #e8f5e8;
           border-radius: 8px;
           padding: 20px;
           margin: 15px 0;
           border-left: 4px solid #28a745;
         }
         
         .business-card h3 {
           color: #28a745;
           margin-bottom: 15px;
           font-size: 1.1em;
         }
         
         .business-list {
           list-style: none;
           padding: 0;
         }
         
         .business-list li {
           padding: 8px 0;
           border-bottom: 1px solid #d4edda;
           position: relative;
           padding-left: 20px;
         }
         
         .business-list li:before {
           content: "✅";
           position: absolute;
           left: 0;
           top: 8px;
         }
         
         .business-list li:last-child {
           border-bottom: none;
         }
         
         .competitive-grid {
           display: grid;
           grid-template-columns: repeat(2, 1fr);
           gap: 15px;
           margin: 20px 0;
         }
         
         .competitive-card {
           background: #fff3cd;
           border-radius: 8px;
           padding: 15px;
           border-left: 4px solid #ffc107;
         }
         
         .competitive-card h3 {
           color: #856404;
           margin-bottom: 10px;
           font-size: 1em;
         }
         
         .competitive-card p {
           margin: 0;
           font-size: 0.9em;
           line-height: 1.5;
         }
         
         .industry-card {
           background: #e3f2fd;
           border-radius: 8px;
           padding: 20px;
           margin: 15px 0;
           border-left: 4px solid #2196f3;
         }
         
         .industry-card h3 {
           color: #1976d2;
           margin-bottom: 15px;
           font-size: 1.1em;
         }
         
         .industry-list {
           list-style: none;
           padding: 0;
         }
         
         .industry-list li {
           padding: 8px 0;
           border-bottom: 1px solid #bbdefb;
           position: relative;
           padding-left: 20px;
         }
         
         .industry-list li:before {
           content: "🏢";
           position: absolute;
           left: 0;
           top: 8px;
         }
         
         .industry-list li:last-child {
           border-bottom: none;
         }
        
        .footer {
          margin-top: 50px;
          text-align: center;
          color: #666;
          font-size: 0.9em;
          border-top: 1px solid #eee;
          padding-top: 20px;
        }
        
        .page-break {
          page-break-before: always;
        }
        
        @media print {
          .header {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .score-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🔍 Page Doctor Audit Report</h1>
        <div class="subtitle">Comprehensive Website Analysis & Optimization Guide</div>
      </div>
      
      <div class="score-summary">
        <h2>Overall Performance Score</h2>
        <div class="overall-score ${gradeClass}">${data.overallScore}/100</div>
        <div style="font-size: 1.2em; color: #666;">${gradeText} Performance</div>
        <div style="margin-top: 10px; font-size: 0.9em; color: #888;">
          Website: ${data.website}<br>
          Analysis Date: ${data.analysisDate}<br>
          Methods: ${data.analysisMethods}
        </div>
      </div>
      
      <div class="score-grid">
        <div class="score-card">
          <h3>📝 Writing</h3>
          <div class="score-value ${this.getGradeClass(data.scores.writing * 4)}">${data.scores.writing}/25</div>
          <div class="score-percentage">${Math.round((data.scores.writing/25)*100)}%</div>
        </div>
        <div class="score-card">
          <h3>🎯 SEO</h3>
          <div class="score-value ${this.getGradeClass(data.scores.seo * 4)}">${data.scores.seo}/25</div>
          <div class="score-percentage">${Math.round((data.scores.seo/25)*100)}%</div>
        </div>
        <div class="score-card">
          <h3>🏗️ Structure</h3>
          <div class="score-value ${this.getGradeClass(data.scores.structure * 4)}">${data.scores.structure}/25</div>
          <div class="score-percentage">${Math.round((data.scores.structure/25)*100)}%</div>
        </div>
        <div class="score-card">
          <h3>⚡ Technical</h3>
          <div class="score-value ${this.getGradeClass(data.scores.technical * 4)}">${data.scores.technical}/25</div>
          <div class="score-percentage">${Math.round((data.scores.technical/25)*100)}%</div>
        </div>
      </div>
      
      ${data.crawleeData ? `
      <div class="section">
        <h2>📊 Content Analysis Summary</h2>
        <div class="metrics-grid">
          <div class="metric">
            <div class="metric-name">Content Volume</div>
            <div class="metric-value">${data.crawleeData.contentLength.toLocaleString()} characters</div>
          </div>
          <div class="metric">
            <div class="metric-name">Internal Links</div>
            <div class="metric-value">${data.crawleeData.linksFound} links found</div>
          </div>
          <div class="metric">
            <div class="metric-name">Images</div>
            <div class="metric-value">${data.crawleeData.imagesFound} images detected</div>
          </div>
          <div class="metric">
            <div class="metric-name">Page Speed</div>
            <div class="metric-value">${(data.crawleeData.loadTime/1000).toFixed(1)}s load time</div>
          </div>
          <div class="metric">
            <div class="metric-name">Heading Structure</div>
            <div class="metric-value">H1(${data.crawleeData.headings.h1}) H2(${data.crawleeData.headings.h2}) H3(${data.crawleeData.headings.h3})</div>
          </div>
        </div>
      </div>
      ` : ''}
      
      <div class="page-break"></div>
      
      <div class="section">
        <h2>📝 Writing Analysis (${data.scores.writing}/25)</h2>
        
        <div class="detail-card">
          <h3>Readability Score - ${data.detailedScores.writing.readability.score}/5 ⭐</h3>
          <p><strong>Analysis:</strong> ${data.detailedScores.writing.readability.analysis}</p>
          <p><strong>Recommendations:</strong> ${data.detailedScores.writing.readability.recommendations}</p>
        </div>
        
        <div class="detail-card">
          <h3>Grammar and Spelling - ${data.detailedScores.writing.grammar.score}/5 ⭐</h3>
          <p><strong>Analysis:</strong> ${data.detailedScores.writing.grammar.analysis}</p>
          <p><strong>Recommendations:</strong> ${data.detailedScores.writing.grammar.recommendations}</p>
        </div>
        
        <div class="detail-card">
          <h3>Content Length - ${data.detailedScores.writing.contentLength.score}/5 ⭐</h3>
          <p><strong>Analysis:</strong> ${data.detailedScores.writing.contentLength.analysis}</p>
          <p><strong>Recommendations:</strong> ${data.detailedScores.writing.contentLength.recommendations}</p>
        </div>
        
        <div class="detail-card">
          <h3>Heading Structure - ${data.detailedScores.writing.headingStructure.score}/10 ⭐</h3>
          <p><strong>Analysis:</strong> ${data.detailedScores.writing.headingStructure.analysis}</p>
          <p><strong>Recommendations:</strong> ${data.detailedScores.writing.headingStructure.recommendations}</p>
        </div>
      </div>
      
      <div class="section">
        <h2>🎯 SEO Analysis (${data.scores.seo}/25)</h2>
        
        <div class="detail-card">
          <h3>Title Tags - ${data.detailedScores.seo.titleTags.score}/10 ⭐</h3>
          <p><strong>Analysis:</strong> ${data.detailedScores.seo.titleTags.analysis}</p>
          <p><strong>Recommendations:</strong> ${data.detailedScores.seo.titleTags.recommendations}</p>
        </div>
        
        <div class="detail-card">
          <h3>Meta Description - ${data.detailedScores.seo.metaDescription.score}/5 ⭐</h3>
          <p><strong>Analysis:</strong> ${data.detailedScores.seo.metaDescription.analysis}</p>
          <p><strong>Recommendations:</strong> ${data.detailedScores.seo.metaDescription.recommendations}</p>
        </div>
        
        <div class="detail-card">
          <h3>URL Structure - ${data.detailedScores.seo.urlStructure.score}/5 ⭐</h3>
          <p><strong>Analysis:</strong> ${data.detailedScores.seo.urlStructure.analysis}</p>
          <p><strong>Recommendations:</strong> ${data.detailedScores.seo.urlStructure.recommendations}</p>
        </div>
        
        <div class="detail-card">
          <h3>Internal Linking - ${data.detailedScores.seo.internalLinking.score}/5 ⭐</h3>
          <p><strong>Analysis:</strong> ${data.detailedScores.seo.internalLinking.analysis}</p>
          <p><strong>Recommendations:</strong> ${data.detailedScores.seo.internalLinking.recommendations}</p>
        </div>
      </div>
      
      <div class="page-break"></div>
      
      <div class="section">
        <h2>🏗️ Structure Analysis (${data.scores.structure}/25)</h2>
        
        <div class="detail-card">
          <h3>Navigation and Layout - ${data.detailedScores.structure.navigation.score}/10 ⭐</h3>
          <p><strong>Analysis:</strong> ${data.detailedScores.structure.navigation.analysis}</p>
          <p><strong>Recommendations:</strong> ${data.detailedScores.structure.navigation.recommendations}</p>
        </div>
        
        <div class="detail-card">
          <h3>Mobile Layout - ${data.detailedScores.structure.mobileLayout.score}/5 ⭐</h3>
          <p><strong>Analysis:</strong> ${data.detailedScores.structure.mobileLayout.analysis}</p>
          <p><strong>Recommendations:</strong> ${data.detailedScores.structure.mobileLayout.recommendations}</p>
        </div>
        
        <div class="detail-card">
          <h3>Visual Spacing - ${data.detailedScores.structure.visualSpacing.score}/5 ⭐</h3>
          <p><strong>Analysis:</strong> ${data.detailedScores.structure.visualSpacing.analysis}</p>
          <p><strong>Recommendations:</strong> ${data.detailedScores.structure.visualSpacing.recommendations}</p>
        </div>
        
        <div class="detail-card">
          <h3>Typography and Fonts - ${data.detailedScores.structure.typography.score}/5 ⭐</h3>
          <p><strong>Analysis:</strong> ${data.detailedScores.structure.typography.analysis}</p>
          <p><strong>Recommendations:</strong> ${data.detailedScores.structure.typography.recommendations}</p>
        </div>
      </div>
      
      <div class="section">
        <h2>⚡ Technical Analysis (${data.scores.technical}/25)</h2>
        
        <div class="detail-card">
          <h3>Page Speed - ${data.detailedScores.technical.pageSpeed.score}/10 ⭐</h3>
          <p><strong>Analysis:</strong> ${data.detailedScores.technical.pageSpeed.analysis}</p>
          <p><strong>Recommendations:</strong> ${data.detailedScores.technical.pageSpeed.recommendations}</p>
        </div>
        
        <div class="detail-card">
          <h3>HTML Validation - ${data.detailedScores.technical.htmlValidation.score}/5 ⭐</h3>
          <p><strong>Analysis:</strong> ${data.detailedScores.technical.htmlValidation.analysis}</p>
          <p><strong>Recommendations:</strong> ${data.detailedScores.technical.htmlValidation.recommendations}</p>
        </div>
        
        <div class="detail-card">
          <h3>HTTPS Security - ${data.detailedScores.technical.httpsSecurity.score}/5 ⭐</h3>
          <p><strong>Analysis:</strong> ${data.detailedScores.technical.httpsSecurity.analysis}</p>
          <p><strong>Recommendations:</strong> ${data.detailedScores.technical.httpsSecurity.recommendations}</p>
        </div>
        
        <div class="detail-card">
          <h3>Mobile Friendly - ${data.detailedScores.technical.mobileFriendly.score}/5 ⭐</h3>
          <p><strong>Analysis:</strong> ${data.detailedScores.technical.mobileFriendly.analysis}</p>
          <p><strong>Recommendations:</strong> ${data.detailedScores.technical.mobileFriendly.recommendations}</p>
        </div>
      </div>
      
      ${data.businessImpact ? `
      <div class="page-break"></div>
      
      <div class="section">
        <h2>📈 Business Impact Assessment</h2>
        
        <div class="business-card">
          <h3>🎯 Current Strengths Supporting Business Goals</h3>
          <ul class="business-list">
            ${data.businessImpact.currentStrengths.map(strength => `<li>${strength}</li>`).join('')}
          </ul>
        </div>
        
        <div class="business-card">
          <h3>🚀 Growth Opportunities</h3>
          <ul class="business-list">
            ${data.businessImpact.growthOpportunities.map(opportunity => `<li>${opportunity}</li>`).join('')}
          </ul>
        </div>
        
        <div class="business-card">
          <h3>📊 Expected Impact of Recommendations</h3>
          <ul class="business-list">
            ${data.businessImpact.expectedImpact.map(impact => `<li>${impact}</li>`).join('')}
          </ul>
        </div>
      </div>
      ` : ''}
      
      ${data.competitiveAnalysis ? `
      <div class="section">
        <h2>🏆 Competitive Positioning</h2>
        
        <div class="competitive-grid">
          <div class="competitive-card">
            <h3>Technical Performance</h3>
            <p>${data.competitiveAnalysis.technicalPerformance}</p>
          </div>
          <div class="competitive-card">
            <h3>Content Depth</h3>
            <p>${data.competitiveAnalysis.contentDepth}</p>
          </div>
          <div class="competitive-card">
            <h3>Industry Focus</h3>
            <p>${data.competitiveAnalysis.industryFocus}</p>
          </div>
          <div class="competitive-card">
            <h3>Mobile Experience</h3>
            <p>${data.competitiveAnalysis.mobileExperience}</p>
          </div>
        </div>
      </div>
      ` : ''}
      
      ${data.industrySpecific ? `
      <div class="section">
        <h2>🏢 Industry-Specific Analysis</h2>
        
        ${data.industrySpecific.features.length > 0 ? `
        <div class="industry-card">
          <h3>Key Features Analyzed</h3>
          <ul class="industry-list">
            ${data.industrySpecific.features.map(feature => `<li>${feature}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
        
        ${data.industrySpecific.applications.length > 0 ? `
        <div class="industry-card">
          <h3>Industry Applications</h3>
          <ul class="industry-list">
            ${data.industrySpecific.applications.map(application => `<li>${application}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
        
        ${data.industrySpecific.metrics.length > 0 ? `
        <div class="industry-card">
          <h3>Quantified Results</h3>
          <ul class="industry-list">
            ${data.industrySpecific.metrics.map(metric => `<li>${metric}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
      </div>
      ` : ''}
      
      <div class="page-break"></div>
      
      <div class="section">
        <h2>🚀 Priority Recommendations</h2>
        
        ${data.recommendations.critical.length > 0 ? `
        <div class="recommendations">
          <h3 style="color: #dc3545;">🔴 Critical Priority (Fix Immediately)</h3>
          <ul class="rec-list">
            ${data.recommendations.critical.map(rec => `<li class="priority-critical">${rec}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
        
        ${data.recommendations.high.length > 0 ? `
        <div class="recommendations">
          <h3 style="color: #fd7e14;">🟡 High Priority (Next 30 Days)</h3>
          <ul class="rec-list">
            ${data.recommendations.high.map(rec => `<li class="priority-high">${rec}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
        
        ${data.recommendations.medium.length > 0 ? `
        <div class="recommendations">
          <h3 style="color: #ffc107;">🟢 Medium Priority (Next 60 Days)</h3>
          <ul class="rec-list">
            ${data.recommendations.medium.map(rec => `<li class="priority-medium">${rec}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
        
        ${data.recommendations.low.length > 0 ? `
        <div class="recommendations">
          <h3 style="color: #28a745;">🔵 Low Priority (Ongoing)</h3>
          <ul class="rec-list">
            ${data.recommendations.low.map(rec => `<li class="priority-low">${rec}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
      </div>
      
      <div class="footer">
        <p><strong>Generated by Enhanced Page Doctor</strong></p>
        <p>Comprehensive Website Analysis Tool | Report Date: ${data.analysisDate}</p>
        <p>For questions or support, contact your Page Doctor administrator</p>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * Get CSS class for score styling
   */
  private static getGradeClass(score: number): string {
    if (score >= 90) return 'grade-excellent';
    if (score >= 75) return 'grade-good';
    if (score >= 60) return 'grade-fair';
    return 'grade-poor';
  }

  /**
   * Get grade text description
   */
  private static getGradeText(score: number): string {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
  }

  /**
   * Generate filename for PDF report
   */
  static generatePDFFilename(website: string, date: string): string {
    const domain = website.replace(/https?:\/\//, '').replace(/\//g, '');
    const dateStr = new Date(date).toISOString().split('T')[0];
    return `page-doctor-audit-${domain}-${dateStr}.pdf`;
  }
} 