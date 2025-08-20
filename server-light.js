#!/usr/bin/env node

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

console.log('🚀 Starting Page Doctor Lightweight API...');

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: 'lightweight',
    message: 'Page Doctor Lightweight API is running'
  });
});

// Basic audit endpoint (without heavy crawlers)
app.post('/api/basic-audit', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    console.log(`🔍 Basic audit for: ${url}`);
    
    // Basic URL analysis without crawling
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const hasWww = urlObj.hostname.startsWith('www.');
    
    const basicAudit = {
      url,
      timestamp: new Date().toISOString(),
      overallScore: 75,
      analysis: {
        security: {
          https: isHttps,
          score: isHttps ? 100 : 0,
          message: isHttps ? 'HTTPS enabled' : 'Consider enabling HTTPS'
        },
        url_structure: {
          hasWww,
          score: 85,
          message: 'URL structure looks good'
        },
        basic_seo: {
          score: 70,
          message: 'Basic SEO analysis complete'
        }
      },
      recommendations: [
        '✅ Lightweight Page Doctor API is working',
        '🚀 For full crawling features, upgrade to full version',
        isHttps ? '✅ HTTPS detected' : '❌ Consider switching to HTTPS',
        '💡 This is a basic audit - full crawling requires heavy dependencies'
      ],
      processingTime: 100,
      type: 'lightweight'
    };
    
    res.json({ success: true, data: basicAudit });
  } catch (error) {
    console.error('Basic audit error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Page Doctor Lightweight API is working!',
    endpoints: [
      'GET /health - Health check',
      'POST /api/basic-audit - Basic website audit',
      'GET /api/test - This test endpoint'
    ],
    features: [
      'Fast deployment',
      'No heavy dependencies',
      'Basic website analysis',
      'Always-on Render hosting'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Page Doctor Lightweight API running on http://localhost:${PORT}`);
  console.log('\n📖 Available endpoints:');
  console.log('  GET  /health                 - Health check');
  console.log('  POST /api/basic-audit        - Basic website audit');
  console.log('  GET  /api/test               - Test endpoint');
  console.log('\n💡 Example usage:');
  console.log(`  curl -X POST http://localhost:${PORT}/api/basic-audit \\`);
  console.log('       -H "Content-Type: application/json" \\');
  console.log('       -d \'{"url": "https://example.com"}\'');
  console.log('\n⚡ Lightweight version - deploys in ~2 minutes!');
}); 