// Test script to debug PDF data generation

async function testPDFData() {
  // Mock data similar to what would come from Crawlee and PageSpeed
  const mockResults = {
    crawlee: {
      data: {
        content: 'Mock content for testing luxury e-commerce analysis',
        links: ['link1', 'link2', 'link3'],
        images: ['img1', 'img2'],
        headings: { h1: 1, h2: 5, h3: 8 },
        loadTime: 2100
      }
    },
    pageSpeed: {
      data: {
        overallScore: 65
      }
    }
  };

  const url = 'https://luxe.ajio.com/';

  // Import the convertToPDFData function safely using dynamic import
  console.log('🧪 Testing PDF data generation...');
  
  try {
    // Safer approach: Try to import the function if it's exported
    const serverModule = await import('./simple-server.js');
    const convertToPDFData = serverModule.convertToPDFData;
    
    if (typeof convertToPDFData !== 'function') {
      throw new Error('convertToPDFData function not found or not exported');
    }
    
    const pdfData = convertToPDFData(mockResults, url);
  } catch (importError) {
    console.error('❌ Could not safely import convertToPDFData function:', importError.message);
    console.log('💡 Please ensure the function is properly exported from simple-server.js');
    
    // Fallback: create mock PDF data structure instead of using eval
    const pdfData = {
      url,
      timestamp: new Date().toISOString(),
      overallScore: mockResults.pageSpeed.data.overallScore,
      detailedScores: {
        writing: { readability: { analysis: 'Mock readability analysis for testing purposes' } },
        seo: { optimization: { analysis: 'Mock SEO analysis for testing purposes' } },
        structure: { layout: { analysis: 'Mock structure analysis for testing purposes' } },
        technical: { performance: { analysis: 'Mock technical analysis for testing purposes' } }
      },
      businessImpact: { revenue: 'Mock business impact analysis' },
      competitiveAnalysis: { comparison: 'Mock competitive analysis' },
      industrySpecific: { recommendations: 'Mock industry-specific recommendations' }
    };
  }
  
  console.log('📊 Generated PDF data structure:');
  console.log('Keys:', Object.keys(pdfData));
  console.log('Detailed scores present:', !!pdfData.detailedScores);
  
  if (pdfData.detailedScores) {
    console.log('📝 Detailed scores structure:');
    console.log('- Writing:', Object.keys(pdfData.detailedScores.writing || {}));
    console.log('- SEO:', Object.keys(pdfData.detailedScores.seo || {}));
    console.log('- Structure:', Object.keys(pdfData.detailedScores.structure || {}));
    console.log('- Technical:', Object.keys(pdfData.detailedScores.technical || {}));
    
    console.log('\n📋 Sample analysis content:');
    console.log('Writing readability:', pdfData.detailedScores.writing?.readability?.analysis?.substring(0, 100) + '...');
  }
  
  console.log('\n💼 Business impact present:', !!pdfData.businessImpact);
  console.log('🏆 Competitive analysis present:', !!pdfData.competitiveAnalysis);
  console.log('🎯 Industry specific present:', !!pdfData.industrySpecific);
}

testPDFData().catch(console.error); 