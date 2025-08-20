# 🌐 External Data Providers Setup

## Overview

Page Doctor now includes **Domain Analytics** - a comprehensive domain-wide reporting feature powered by external data providers. This gives you insights similar to tools like WebPageTest (performance), Ahrefs, and SEMrush without requiring you to crawl every page.

## 🚀 Features Included

### **Traffic Analytics**
- Monthly visitor estimates
- Traffic source breakdown (direct, search, social, referral)
- Geographic distribution
- Visit duration & bounce rate
- Pages per visit metrics

### **SEO Metrics**
- Domain Authority & Page Authority
- Organic keyword rankings
- Backlink profile analysis
- Organic traffic value estimation
- Top performing keywords

### **Backlink Analysis**
- Total backlinks & referring domains
- Domain rating/authority scores
- Top referring domains
- Link quality analysis (dofollow/nofollow)
- Recent high-quality backlinks

### **Content Intelligence**
- Top performing pages
- Page-level traffic estimates
- Content performance insights
- Competitor analysis (when available)

## 🔧 Supported Data Providers

### **WebPageTest** (Performance & Web Vitals)
- **Features**: Performance tests, Web Vitals, Lighthouse, filmstrips
- **API**: Public API with free tier and pro options
- **Environment Variables**: `VITE_WEBPAGETEST_API_KEY`, optional: `VITE_WEBPAGETEST_LOCATION`, `VITE_WEBPAGETEST_CONNECTION`, `VITE_WEBPAGETEST_LIGHTHOUSE`

```bash
# .env.local
VITE_WEBPAGETEST_API_KEY=your_webpagetest_api_key_here
# Optional
VITE_WEBPAGETEST_LOCATION=Dulles:Chrome
VITE_WEBPAGETEST_CONNECTION=Cable
VITE_WEBPAGETEST_LIGHTHOUSE=1
```

### **Ahrefs** (SEO & Backlinks)
- **Features**: SEO metrics, backlinks, keywords, competitor analysis  
- **API**: Starting at $500/month
- **Environment Variable**: `VITE_AHREFS_API_KEY`

```bash
# .env.local
VITE_AHREFS_API_KEY=your_ahrefs_api_key_here
```

### **Moz** (Domain Authority)
- **Features**: Domain Authority, Page Authority, link analysis
- **API**: Free tier available, paid plans from $99/month
- **Environment Variables**: `VITE_MOZ_ACCESS_ID` & `VITE_MOZ_SECRET_KEY`

```bash
# .env.local
VITE_MOZ_ACCESS_ID=your_moz_access_id_here
VITE_MOZ_SECRET_KEY=your_moz_secret_key_here
```

### **SEMrush** (Keywords & Competition)
- **Features**: Organic research, paid research
- **API**: Starting at $119.95/month
- **Environment Variable**: `VITE_SEMRUSH_API_KEY`

```bash
# .env.local
VITE_SEMRUSH_API_KEY=your_semrush_api_key_here
```

### **SerpApi** (SERP Analysis)
- **Features**: SERP analysis, keyword tracking
- **API**: Free tier with 100 searches/month, paid plans from $50/month
- **Environment Variable**: `VITE_SERPAPI_KEY`

```bash
# .env.local
VITE_SERPAPI_KEY=your_serpapi_key_here
```

## ⚡ Quick Setup

### **1. Create Environment File**
```bash
# In your project root
touch .env.local
```

### **2. Add Your API Keys**
```bash
# .env.local - Add only the providers you have access to

# WebPageTest (Performance)
VITE_WEBPAGETEST_API_KEY=your_api_key_here
VITE_WEBPAGETEST_LOCATION=Dulles:Chrome
VITE_WEBPAGETEST_CONNECTION=Cable
VITE_WEBPAGETEST_LIGHTHOUSE=1

# Ahrefs (SEO & Backlinks) 
VITE_AHREFS_API_KEY=your_api_key_here

# Moz (Domain Authority)
VITE_MOZ_ACCESS_ID=your_access_id_here
VITE_MOZ_SECRET_KEY=your_secret_key_here

# SEMrush (Keywords)
VITE_SEMRUSH_API_KEY=your_api_key_here

# SerpApi (SERP Data)
VITE_SERPAPI_KEY=your_api_key_here
```

### **3. Restart Development Server**
```bash
npm run dev
```

### **4. Test Domain Analytics**
1. Go to Page Doctor
2. Select "Domain Analytics" audit mode
3. Enter any domain (e.g., `github.com`)
4. Click "Analyze Domain"

## 🔄 Fallback System

**Don't have API keys?** No problem! The system includes intelligent fallback estimation:

- **Real Data**: When API keys are configured, get actual data from providers
- **Smart Estimates**: When APIs aren't available, generates realistic estimates based on domain characteristics
- **Transparent**: Clear indication of data source (real vs estimated)

## 💰 Cost-Effective Options

### **Free Tier Strategy**
```bash
# Start with free/affordable options
VITE_MOZ_ACCESS_ID=free_moz_account
VITE_SERPAPI_KEY=free_100_searches_monthly
```

### **Essential Package**
```bash
# Most bang for buck - covers core metrics
VITE_AHREFS_API_KEY=ahrefs_for_seo_backlinks  # $500/month
VITE_WEBPAGETEST_API_KEY=use_for_performance
```

### **Enterprise Setup**
```bash
# Full featured setup
VITE_WEBPAGETEST_API_KEY=pro_or_enterprise
VITE_AHREFS_API_KEY=comprehensive_seo_data
VITE_MOZ_ACCESS_ID=domain_authority_data
VITE_MOZ_SECRET_KEY=moz_secret_for_authentication
VITE_SEMRUSH_API_KEY=keyword_competition_data
VITE_SERPAPI_KEY=serp_tracking_data
```

## 🛠️ Technical Implementation

### **Data Caching**
- **Cache Duration**: 24 hours per domain
- **Storage**: Supabase database (requires table setup)
- **Benefits**: Reduces API costs, faster repeated queries

### **Provider Priority**
```
Traffic Data: Estimation (no traffic provider enabled)
SEO Metrics: Ahrefs → Moz → SEMrush → Estimation  
Backlinks: Ahrefs → Moz → Estimation
Performance: WebPageTest → PageSpeed → Estimation
```

### **API Rate Limiting**
- Automatically throttles requests to respect provider limits
- Falls back to estimation if rate limits exceeded
- Parallel requests where possible for faster results

## 📊 Sample Output

### **With Real API Data**
```
🌐 github.com Domain Analytics

⚡ Performance
• LCP: 2.1s
• FCP: 1.3s
• TBT: 120ms
• CLS: 0.03

🔍 SEO Performance  
• Domain Authority: 91/100
• 1.2M organic keywords
• $2.8M organic traffic value
• 847K total backlinks

Data Sources: WebPageTest • Ahrefs • Moz
```

### **With Estimation**
```
🌐 example.com Domain Analytics

⚠️ Estimates (No API Keys Configured)

📈 Traffic Overview (Estimated)
• ~15K monthly visitors  
• ~3m average session
• ~2.5 pages per visit
• ~65% bounce rate

🔍 SEO Performance (Estimated)
• Domain Authority: ~35/100
• ~500 organic keywords
• ~$2,500 organic traffic value
• ~1,200 total backlinks

Data Sources: Intelligent Estimation
Configure API keys for real-time data
```

## 🚀 Getting Started

### **Immediate Setup (Free)**
1. Create a Moz free account → Get Access ID & Secret Key
2. Create SerpApi free account → Get 100 free searches/month
3. Add to `.env.local` and restart server
4. Test with any domain

### **Professional Setup** 
1. Configure WebPageTest API key (free/pro tiers)
2. Subscribe to Ahrefs Standard ($500/month) 
3. Upgrade Moz to Pro ($99/month)
4. Add all keys to environment variables
5. Get comprehensive, real-time domain intelligence

## 🔍 Provider Comparison

| Provider | Best For | Free Tier | Paid Plans | Key Strengths |
|----------|----------|-----------|------------|---------------|
| **WebPageTest** | Performance | Yes | Pro plans | Deep performance diagnostics |
| **Ahrefs** | SEO & Backlinks | No | $500/mo | Best backlink database |
| **Moz** | Domain Authority | Yes | $99/mo | Industry-standard DA metric |
| **SEMrush** | Keywords | Limited | $119/mo | Comprehensive keyword data |
| **SerpApi** | SERP Tracking | 100/mo | $50/mo | Real-time SERP data |

## 💡 Pro Tips

### **Start Small**
- Begin with Moz (free) + SerpApi (free) for basic insights
- Add WebPageTest for performance insights
- Ahrefs last for comprehensive SEO (most expensive)

### **API Key Security**
- Store in `.env.local` (automatically gitignored)
- Never commit API keys to version control
- Use environment-specific keys for staging/production

### **Cost Optimization**
- 24-hour caching minimizes API calls
- Smart fallbacks reduce unnecessary requests
- Provider prioritization uses cheapest sources first

---

## 🎯 Result

**Domain Analytics brings enterprise-level website intelligence to Page Doctor** with support for:
- **Performance** via WebPageTest, plus SEO/backlinks and SERP integrations
- **Smart fallback estimation** when APIs aren't available
- **24-hour caching** to minimize costs
- **Beautiful dashboard** with comprehensive insights
- **Flexible configuration** - use any combination of providers

**Configure your API keys and unlock professional domain analytics!** 🚀 