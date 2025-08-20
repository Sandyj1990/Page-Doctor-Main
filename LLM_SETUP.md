# 🤖 LLM Integration Setup Guide

Page Doctor now includes **AI-powered content analysis** using OpenAI's GPT models to provide deep insights into your website's content quality, SEO optimization, and user experience.

## ✨ Features

### **AI Content Analysis**
- **Readability Assessment**: Advanced text analysis beyond simple metrics
- **Tone Detection**: Professional, casual, technical, marketing, conversational
- **Content Gap Identification**: Missing information and improvement opportunities
- **Keyword Optimization**: Current keywords analysis and strategic suggestions

### **Enhanced SEO Insights**
- **Title Optimization**: AI-generated title improvements
- **Meta Description Enhancement**: Compelling, search-optimized descriptions
- **Heading Structure Analysis**: Semantic hierarchy improvements
- **Internal Linking Suggestions**: Strategic linking opportunities

### **User Experience Analysis**
- **UX Scoring**: Comprehensive user experience evaluation
- **Competitive Advantages**: Unique selling points identification
- **Conversion Optimization**: User journey improvement suggestions
- **Accessibility Recommendations**: WCAG compliance guidance

### **Industry-Specific Recommendations**
- **Tailored Advice**: Custom recommendations for your business type
- **Industry Best Practices**: Sector-specific optimization strategies
- **Competitive Positioning**: How to stand out in your market

## 🚀 Quick Setup

### **1. Get OpenAI API Key**
1. Visit [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Sign up or log in to your OpenAI account
3. Click "Create new secret key"
4. Copy the generated API key (starts with `sk-`)

### **2. Configure Environment**
Create a `.env.local` file in your project root:

```bash
# OpenAI Configuration
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

### **3. Restart Development Server**
```bash
npm run dev
```

## 💰 Cost Information

### **OpenAI API Pricing** (as of 2024)
- **GPT-4o-mini**: ~$0.00015 per page analysis
- **GPT-4**: ~$0.003 per page analysis (more detailed)
- **Typical Usage**: $0.01-0.05 per website audit

### **Cost Control**
- LLM analysis is **opt-in** for each audit
- Only used for single-page detailed analysis
- Batch audits use fast simulation mode by default
- No recurring charges - pay only for what you use

## 🎯 Usage

### **Basic AI Analysis**
1. Enter a website URL
2. Select "Single Page" audit mode
3. Check "🤖 Enhanced AI Content Analysis"
4. Run audit for detailed AI insights

### **Industry-Specific Analysis**
1. Enable AI analysis (above)
2. Check "🎯 Industry-Specific Recommendations"  
3. Enter your business type (e.g., "e-commerce", "healthcare", "SaaS")
4. Get tailored optimization advice

## 📊 What You Get

### **Enhanced Report Sections**

#### **AI Content Analysis**
```
✅ Readability Score: 87/100
🎯 Content Tone: Professional
🔍 Keywords Identified: 12 primary terms
📝 Content Gaps Found: 3 improvement areas
💡 Improvement Suggestions:
  • Add customer testimonials section
  • Include clear pricing information
  • Enhance call-to-action clarity
```

#### **AI SEO Insights**
```
🎯 Title Optimization:
  "Consider adding target keywords and year"
📝 Meta Description:
  "Compelling 155-char description focusing on benefits"
🏗️ Heading Structure:
  • Add H2 for main services section
  • Include keyword in primary H1
```

#### **Industry Recommendations**
```
🏢 E-commerce Optimization:
  • Add product review sections
  • Implement trust badges
  • Optimize checkout flow messaging
  • Include clear return policy
```

## 🔧 Advanced Configuration

### **Custom Model Selection**
```typescript
// In src/services/llmService.ts
const llmService = new LLMService({
  model: 'gpt-4o-mini',        // Fast, affordable
  // model: 'gpt-4',           // More detailed analysis
  maxTokens: 2000,             // Response length
  temperature: 0.3             // Consistency vs creativity
});
```

### **Supported Industries**
- E-commerce & Retail
- Healthcare & Medical
- Technology & SaaS
- Professional Services
- Real Estate
- Restaurants & Food
- Education
- Non-profit
- Manufacturing
- Financial Services

## 🛡️ Privacy & Security

### **Data Handling**
- **Content Analysis**: Only page content is sent to OpenAI
- **No Personal Data**: User information stays local
- **Temporary Processing**: No content storage by OpenAI
- **API Security**: Requests use secure HTTPS

### **What Gets Analyzed**
- ✅ Page title and headings
- ✅ Main content text (first 3000 characters)
- ✅ Meta descriptions and basic HTML structure
- ✅ Image alt text information
- ❌ Personal user data
- ❌ Sensitive business information
- ❌ Full website source code

## 🚨 Troubleshooting

### **"Requires API Key" Message**
- Ensure `VITE_OPENAI_API_KEY` is set in `.env.local`
- Restart the development server after adding the key
- Check that the key starts with `sk-`

### **API Key Invalid**
- Verify the key is copied correctly (no extra spaces)
- Check your OpenAI account has sufficient credits
- Ensure the API key hasn't been revoked

### **Slow Response Times**
- GPT-4o-mini: 10-20 seconds (recommended)
- GPT-4: 20-40 seconds (more detailed)
- Network conditions may affect speed

### **Analysis Failed**
- Check browser console for error details
- Verify the website is accessible and not blocking crawlers
- Try with a simpler page first

## 🎉 Success Tips

### **Get Better Results**
1. **Use Descriptive Industry Terms**: "SaaS project management tool" vs "software"
2. **Analyze Key Pages**: Homepage, product pages, landing pages
3. **Review Suggestions**: AI recommendations are starting points for optimization
4. **Iterate**: Run analysis after implementing changes to track improvements

### **Best Practices**
- Start with homepage analysis to understand overall content strategy
- Use industry-specific mode for targeted business advice
- Combine AI insights with traditional PageSpeed metrics
- Focus on high-priority recommendations first

## 🔮 Coming Soon

- **Competitive Analysis**: Compare against competitor websites
- **Content Calendar**: AI-generated content improvement roadmap
- **A/B Test Suggestions**: Data-driven optimization experiments
- **Multi-language Support**: International SEO recommendations
- **Custom Prompts**: Industry-specific analysis templates

---

**Need Help?** Check the [main README](./README.md) or open an issue on GitHub. 

## 🌐 **Access the Application**

**Open your web browser and go to:**
```
http://localhost:8080
```

## 🧪 **Step-by-Step Testing Guide**

### **Step 1: Navigate to Domain Analytics**
1. On the Page Doctor homepage
2. Select **"Domain Analytics"** (the second radio button option)
3. You should see: *"Domain-wide analytics including traffic estimates, SEO metrics, backlinks, and competitor insights"*

### **Step 2: Test a Domain**
**Enter one of these test domains:**
- `github.com` ✅ (Recommended - lots of data)
- `stackoverflow.com` ✅ (Good historical data)  
- `netlify.com` ✅ (Tech company)
- `medium.com` ✅ (Popular site)

### **Step 3: Analyze**
1. Click **"Analyze Domain"** 
2. Wait for the analysis (should take 3-5 seconds)
3. You should see a loading screen, then results

### **Step 4: Check Phase 1 Results**
1. Click on the **"Technical Details"** tab
2. **Look for these 4 NEW sections:**

#### 🏢 **Domain Registration**
- Registrar name
- Domain age (in years)
- Created/expires dates
- Country info

#### 📅 **Historical Data** 
- First archived date
- Total snapshots count
- Availability score (progress bar)
- Last archived date

#### 🛡️ **Security Status**
- Safety badge (Safe/Warning)
- Threat level (LOW/MEDIUM/HIGH) 
- Safety score (progress bar)
- Threats detected

#### 🏆 **SSL Certificates**
- Certificates found count
- Subdomains discovered
- Transparency score (progress bar)
- Certificate issuers list
- Top subdomains

### **Step 5: Check Console (Optional)**
1. Press **F12** to open Developer Tools
2. Go to **Console** tab
3. **Look for these messages:**
```
🔓 Starting open-source domain analytics for: github.com
🚀 Phase 1 Enhanced: X/4 data sources active
ℹ️ Some APIs blocked by CORS - using intelligent fallbacks
✅ Open-source analytics completed
```

## 🎯 **What You Should See**

### **Success Indicators:**
- ✅ **No red error overlay** (Lighthouse issue fixed)
- ✅ **4 Phase 1 sections** in Technical Details tab
- ✅ **Real or estimated data** (not all zeros)
- ✅ **Data Quality: HIGH/MEDIUM** badge
- ✅ **Multiple data sources** in footer

### **Expected Results for GitHub.com:**
- **Domain Age:** ~15 years
- **Historical Snapshots:** Several thousand
- **Security Status:** Safe, Low threat
- **Certificates:** Multiple subdomains like `api.github.com`, `docs.github.com`

## ⚠️ **If You See Issues:**

1. **Still see red error?** → Hard refresh (`Ctrl+Shift+R` or `Cmd+Shift+R`)
2. **No Phase 1 sections?** → Try a different domain
3. **All zeros still showing?** → Check browser console for errors

## 📱 **Quick Test:**

**Just want to verify it works?**
1. Go to http://localhost:8080
2. Select "Domain Analytics" 
3. Enter `github.com`
4. Click "Analyze Domain"
5. Look for the 4 new sections in "Technical Details"

**Let me know what you see!** 🚀 