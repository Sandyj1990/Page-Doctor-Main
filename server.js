#!/usr/bin/env node

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Dynamic service loading
async function loadServices() {
  const { CrawleeService } = await import('./src/services/crawleeService.ts');
  const { ComprehensiveSeoAuditService } = await import('./src/services/comprehensiveSeoAuditService.ts');
  
  // Only load services that don't require API keys
  let EnhancedDomainAnalyticsService = null;
  let RealTopPagesService = null;
  
  try {
    const enhancedAnalytics = await import('./src/services/enhancedDomainAnalyticsService.ts');
    EnhancedDomainAnalyticsService = enhancedAnalytics.EnhancedDomainAnalyticsService;
  } catch (error) {
    console.warn('⚠️ EnhancedDomainAnalyticsService requires API keys, skipping...');
  }
  
  try {
    const realTopPages = await import('./src/services/realTopPagesService.ts');
    RealTopPagesService = realTopPages.RealTopPagesService;
  } catch (error) {
    console.warn('⚠️ RealTopPagesService requires API keys, skipping...');
  }
  
  return { 
    CrawleeService, 
    ComprehensiveSeoAuditService, 
    EnhancedDomainAnalyticsService,
    RealTopPagesService 
  };
}

let services;

// Initialize services
async function initializeServices() {
  try {
    services = await loadServices();
    console.log('✅ Services loaded successfully');
  } catch (error) {
    console.error('❌ Failed to load services:', error.message);
    process.exit(1);
  }
}

// API Routes

// Welcome page
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Page Doctor API is Live!',
    status: 'active',
    timestamp: new Date().toISOString(),
    endpoints: {
      'GET /health': 'Health check',
      'POST /api/crawl-single': 'Single page crawl',
      'POST /api/crawl-website': 'Website discovery', 
      'POST /api/seo-audit': 'Comprehensive SEO audit',
      'POST /api/domain-analytics': 'Domain analytics',
      'POST /api/top-pages': 'Top pages analysis'
    },
    example: {
      url: `${req.protocol}://${req.get('host')}/api/crawl-single`,
      method: 'POST',
      body: '{"url": "https://example.com"}'
    },
    docs: 'Send POST requests to the API endpoints above'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Crawlee single page analysis
app.post('/api/crawl-single', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    console.log(`🕷️ Crawling single page: ${url}`);
    const result = await services.CrawleeService.crawlSingle(url);
    
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Crawl single error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Crawlee website discovery
app.post('/api/crawl-website', async (req, res) => {
  try {
    const { url, maxPages = 10 } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    console.log(`🕷️ Crawling website: ${url} (max ${maxPages} pages)`);
    
    const crawler = new services.CrawleeService({
      maxPages: parseInt(maxPages),
      maxDepth: 2,
      respectRobots: true
    });
    
    const result = await crawler.crawl(url);
    res.json(result);
  } catch (error) {
    console.error('Crawl website error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Comprehensive SEO Audit
app.post('/api/seo-audit', async (req, res) => {
  try {
    const { url, options = {} } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    console.log(`🔍 Running SEO audit: ${url}`);
    const result = await services.ComprehensiveSeoAuditService.performComprehensiveAudit(url, {
      crawlDepth: options.crawlDepth || 2,
      includeContent: options.includeContent !== false,
      analyzeTechnical: options.analyzeTechnical !== false,
      analyzeOnPage: options.analyzeOnPage !== false,
      ...options
    });
    
    res.json(result);
  } catch (error) {
    console.error('SEO audit error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Enhanced domain analytics
app.post('/api/domain-analytics', async (req, res) => {
  try {
    if (!services.EnhancedDomainAnalyticsService) {
      return res.status(503).json({ 
        error: 'Domain analytics service unavailable (requires API keys)' 
      });
    }

    const { domain, options = {} } = req.body;
    if (!domain) {
      return res.status(400).json({ error: 'Domain is required' });
    }

    console.log(`📊 Domain analytics: ${domain}`);
    const analyticsService = new services.EnhancedDomainAnalyticsService();
    const result = await analyticsService.getEnhancedDomainAnalytics(domain, options);
    
    res.json(result);
  } catch (error) {
    console.error('Domain analytics error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Real top pages analysis
app.post('/api/top-pages', async (req, res) => {
  try {
    if (!services.RealTopPagesService) {
      return res.status(503).json({ 
        error: 'Top pages service unavailable (requires API keys)' 
      });
    }

    const { domain, options = {} } = req.body;
    if (!domain) {
      return res.status(400).json({ error: 'Domain is required' });
    }

    console.log(`📈 Top pages analysis: ${domain}`);
    const topPagesService = new services.RealTopPagesService();
    const result = await topPagesService.getRealTopPages(domain, options);
    
    res.json(result);
  } catch (error) {
    console.error('Top pages error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
async function startServer() {
  await initializeServices();
  
  app.listen(PORT, () => {
    console.log(`🚀 Page Doctor API Server running on http://localhost:${PORT}`);
    console.log('\n📖 Available endpoints:');
    console.log('  GET  /health                    - Health check');
    console.log('  POST /api/crawl-single          - Single page crawl');
    console.log('  POST /api/crawl-website         - Website discovery');
    console.log('  POST /api/seo-audit             - Comprehensive SEO audit');
    console.log('  POST /api/domain-analytics      - Domain analytics');
    console.log('  POST /api/top-pages             - Top pages analysis');
    console.log('\n💡 Example usage:');
    console.log('  curl -X POST http://localhost:3001/api/crawl-single \\');
    console.log('       -H "Content-Type: application/json" \\');
    console.log('       -d \'{"url": "https://example.com"}\'');
  });
}

startServer().catch(console.error); 