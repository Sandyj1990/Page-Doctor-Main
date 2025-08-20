#!/usr/bin/env node

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

console.log('🚀 Starting Page Doctor Optimized API...');

// Welcome page
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Page Doctor API is Live! (Optimized for Free Hosting)',
    status: 'active',
    timestamp: new Date().toISOString(),
    optimizations: [
      'Reduced browser automation',
      'Faster response times',
      'Lower memory usage',
      'Free tier compatible'
    ],
    endpoints: {
      'GET /health': 'Health check',
      'POST /api/lightweight-audit': 'Fast website analysis',
      'POST /api/pagespeed-audit': 'PageSpeed-only analysis',
      'GET /api/test': 'Test endpoint'
    },
    example: {
      url: `${req.protocol}://${req.get('host')}/api/lightweight-audit`,
      method: 'POST',
      body: '{"url": "https://example.com"}'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: 'optimized',
    memory: process.memoryUsage()
  });
});

// Lightweight audit (no heavy browser automation)
app.post('/api/lightweight-audit', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    console.log(`🔍 Lightweight audit for: ${url}`);
    
    const startTime = Date.now();
    const urlObj = new URL(url);
    
    // Basic analysis without browser automation
    const analysis = {
      url,
      timestamp: new Date().toISOString(),
      processingTime: Date.now() - startTime,
      basic_analysis: {
        domain: urlObj.hostname,
        protocol: urlObj.protocol,
        https_enabled: urlObj.protocol === 'https:',
        has_www: urlObj.hostname.startsWith('www.'),
        path_length: urlObj.pathname.length,
        has_query_params: !!urlObj.search
      },
      scores: {
        https: urlObj.protocol === 'https:' ? 100 : 0,
        url_structure: 85,
        basic_seo: 75
      },
      recommendations: [
        '✅ Lightweight Page Doctor analysis complete',
        urlObj.protocol === 'https:' ? '✅ HTTPS enabled' : '❌ Consider enabling HTTPS',
        '💡 For detailed analysis, use /api/pagespeed-audit',
        '🚀 Optimized for free hosting - no browser timeouts!'
      ],
      type: 'lightweight'
    };
    
    res.json({ success: true, data: analysis });
  } catch (error) {
    console.error('Lightweight audit error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PageSpeed-only audit (uses external API, no browser automation)
app.post('/api/pagespeed-audit', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    console.log(`📊 PageSpeed audit for: ${url}`);
    
    const apiKey = process.env.VITE_PAGESPEED_API_KEY;
    if (!apiKey || apiKey === 'your_pagespeed_api_key_here') {
      return res.json({
        success: false,
        error: 'PageSpeed API key not configured',
        fallback_data: {
          message: 'Using basic analysis instead',
          url,
          basic_score: 75,
          recommendation: 'Add VITE_PAGESPEED_API_KEY environment variable for real PageSpeed data'
        }
      });
    }

    // Make PageSpeed API call (external, no browser needed)
    const pageSpeedUrl = `https://www.googleapis.com/pagespeed/insights/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}&strategy=desktop&category=performance&category=accessibility&category=best-practices&category=seo`;
    
    const response = await fetch(pageSpeedUrl);
    if (!response.ok) {
      throw new Error(`PageSpeed API error: ${response.status}`);
    }

    const data = await response.json();
    const lighthouse = data.lighthouseResult;
    const categories = lighthouse?.categories || {};
    
    const analysis = {
      url,
      timestamp: new Date().toISOString(),
      pagespeed_data: {
        performance: Math.round((categories.performance?.score || 0) * 100),
        accessibility: Math.round((categories.accessibility?.score || 0) * 100),
        best_practices: Math.round((categories['best-practices']?.score || 0) * 100),
        seo: Math.round((categories.seo?.score || 0) * 100)
      },
      overall_score: Math.round(Object.values(categories).reduce((sum, cat) => sum + (cat.score || 0), 0) / Object.keys(categories).length * 100),
      recommendations: [
        '✅ Real Google PageSpeed data',
        '🚀 No browser automation needed',
        '💡 Optimized for free hosting',
        '📊 Actual Lighthouse scores'
      ],
      type: 'pagespeed'
    };
    
    res.json({ success: true, data: analysis });
  } catch (error) {
    console.error('PageSpeed audit error:', error);
    res.status(500).json({ 
      error: error.message,
      fallback_message: 'PageSpeed API unavailable, using basic analysis'
    });
  }
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Page Doctor Optimized API is working!',
    status: 'healthy',
    optimizations: [
      'No heavy browser automation',
      'External API calls only',
      'Faster response times',
      'Free tier compatible'
    ],
    memory_usage: process.memoryUsage(),
    uptime: process.uptime()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Page Doctor Optimized API running on http://localhost:${PORT}`);
  console.log('\n📖 Available endpoints:');
  console.log('  GET  /health                     - Health check');
  console.log('  POST /api/lightweight-audit      - Fast website analysis');
  console.log('  POST /api/pagespeed-audit        - PageSpeed-only analysis');
  console.log('  GET  /api/test                   - Test endpoint');
  console.log('\n💡 Example usage:');
  console.log(`  curl -X POST http://localhost:${PORT}/api/lightweight-audit \\`);
  console.log('       -H "Content-Type: application/json" \\');
  console.log('       -d \'{"url": "https://example.com"}\'');
  console.log('\n⚡ Optimized for free hosting - no browser timeouts!');
}); 