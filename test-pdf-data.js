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

  // Import the convertToPDFData function from the server
  const fs = await import('fs');
  const serverCode = fs.readFileSync('./simple-server.js', 'utf8');
  
  // Extract just the convertToPDFData function
  const functionStart = serverCode.indexOf('function convertToPDFData(');
  const functionEnd = serverCode.indexOf('\n}', functionStart) + 2;
  const functionCode = serverCode.substring(functionStart, functionEnd);
  
  console.log('🧪 Testing PDF data generation...');
  
  // Execute the function
  eval(functionCode);
  const pdfData = convertToPDFData(mockResults, url);
  
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