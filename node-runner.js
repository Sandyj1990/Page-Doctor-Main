#!/usr/bin/env node

// Use dynamic imports to handle TypeScript modules
async function loadServices() {
  try {
    // For Node.js environment, import from built dist or use ts-node
    const { CrawleeService } = await import('./src/services/crawleeService.ts');
    const { ComprehensiveSeoAuditService } = await import('./src/services/comprehensiveSeoAuditService.ts');
    return { CrawleeService, ComprehensiveSeoAuditService };
  } catch (error) {
    console.error('Failed to load services. Make sure you have tsx installed:', error.message);
    console.log('Install with: npm install -g tsx');
    console.log('Then run: tsx node-runner.js <url>');
    process.exit(1);
  }
}

async function runPageDoctorAnalysis(url) {
  console.log(`🚀 Starting Page Doctor Analysis for: ${url}`);
  
  const { CrawleeService, ComprehensiveSeoAuditService } = await loadServices();
  
  try {
    // Test Crawlee functionality
    console.log('\n📊 Running Crawlee Analysis...');
    const crawleeService = new CrawleeService({
      maxPages: 5,
      maxDepth: 2,
      respectRobots: true
    });
    
    const crawlResult = await crawleeService.crawl(url, (progress, message, currentUrl) => {
      console.log(`Progress: ${progress}% - ${message} ${currentUrl ? `(${currentUrl})` : ''}`);
    });
    
    if (crawlResult.success && crawlResult.data) {
      console.log(`✅ Successfully crawled ${crawlResult.data.totalPages} pages`);
      console.log(`⏱️ Total crawl time: ${crawlResult.data.crawlTime}ms`);
      
      // Show sample page data
      const firstPage = crawlResult.data.pages[0];
      if (firstPage) {
        console.log(`\n📄 Sample Page Analysis:`);
        console.log(`Title: ${firstPage.title}`);
        console.log(`Content Length: ${firstPage.content.length} characters`);
        console.log(`Links Found: ${firstPage.links.length}`);
        console.log(`Images Found: ${firstPage.images.length}`);
        console.log(`Headings: H1(${firstPage.headings.h1.length}), H2(${firstPage.headings.h2.length}), H3(${firstPage.headings.h3.length})`);
      }
    } else {
      console.error('❌ Crawlee analysis failed:', crawlResult.error);
    }
    
    // Test Comprehensive SEO Audit
    console.log('\n🔍 Running Comprehensive SEO Audit...');
    const seoResult = await ComprehensiveSeoAuditService.performComprehensiveAudit(url, {
      crawlDepth: 2,
      includeContent: true,
      analyzeTechnical: true,
      analyzeOnPage: true
    });
    
    if (seoResult.success && seoResult.data) {
      console.log('✅ SEO Audit completed successfully');
      console.log(`Pages analyzed: ${Object.keys(seoResult.data.pages || {}).length}`);
      console.log(`Issues found: ${seoResult.data.issues?.length || 0}`);
    } else {
      console.error('❌ SEO Audit failed:', seoResult.error);
    }
    
  } catch (error) {
    console.error('❌ Analysis failed:', error);
  }
}

// Get URL from command line arguments
const url = process.argv[2];
if (!url) {
  console.log('Usage: node node-runner.js <url>');
  console.log('Example: node node-runner.js https://example.com');
  process.exit(1);
}

runPageDoctorAnalysis(url); 