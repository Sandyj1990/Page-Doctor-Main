# Page Doctor

A comprehensive web page audit tool powered by **Sitespeed.io** that analyzes writing quality, SEO signals, structure, and technical performance.

## 🚀 Quick Setup

### Prerequisites
- Node.js 16+ and npm
- **Sitespeed.io** (recommended for best results)
- Optional: Docker for containerized Sitespeed.io
- Optional: Google PageSpeed Insights API key for fallback

### Installation
```bash
git clone <repository-url>
cd page-doctor
npm install
```

### 🏃 Quick Start (Recommended)

**Option 1: Install Sitespeed.io globally**
```bash
npm run setup-sitespeed
npm run dev
```

**Option 2: Use Docker**
```bash
npm run setup-docker
npm run dev
```

**Option 3: Basic fallback mode**
```bash
npm run dev
```

The app will start at `http://localhost:8082` (or another available port)

## 📋 Audit Providers

### 1. **Sitespeed.io** (Recommended - Default)
- ✅ **No API keys required**
- ✅ **Open-source and comprehensive**
- ✅ **Real performance testing**
- ✅ **Core Web Vitals measurement**
- ⚠️ Requires local installation or Docker

**Setup:**
```bash
# Option 1: Global install (recommended)
npm install -g sitespeed.io

# Option 2: Docker (alternative)
docker pull sitespeedio/sitespeed.io:latest

# Option 3: Via npm script
npm run setup-sitespeed
```

### 2. **Lighthouse** (Built-in Fallback)
- ✅ **No installation required**
- ✅ **Built into the app**
- ⚠️ Limited compared to Sitespeed.io

### 3. **PageSpeed Insights** (API Fallback)
- ✅ **Google's official API**
- ⚠️ **Requires API key**
- ⚠️ Subject to rate limits

Get API key: [Google PageSpeed Insights API](https://developers.google.com/speed/docs/insights/v5/get-started)

## 🔧 Configuration

### Environment Setup
Run the interactive setup:
```bash
npm run setup
```

Or manually create `.env.local`:
```bash
# Sitespeed.io (no configuration needed - auto-detected)

# Optional: PageSpeed API key for fallback
VITE_PAGESPEED_API_KEY=your_pagespeed_api_key_here

# Optional: AI-enhanced analysis
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

## 🎯 Usage

### 1. **Single Page Audit**
- Enter any website URL
- Choose your preferred audit provider (Sitespeed.io recommended)
- Get comprehensive analysis in seconds

### 2. **Batch Website Audit** 
- Enter a domain for full-site analysis
- Discovers pages automatically via sitemap
- Analyzes up to 15 pages concurrently

### 3. **Domain Analytics**
- Enter a domain (without protocol)
- Get domain-level insights and metrics
- Historical and registration data

## 📊 What Gets Analyzed

### **Performance Metrics**
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- Total Blocking Time (TBT)
- Speed Index
- Core Web Vitals scoring

### **SEO Analysis**
- Title tags and meta descriptions
- Heading structure (H1-H6)
- Technical SEO factors
- Mobile-friendliness
- HTTPS usage

### **Accessibility**
- Color contrast ratios
- Alt text for images
- Form labels and semantics
- Keyboard navigation

### **Best Practices**
- Security headers
- Console error detection
- Modern image formats
- Resource optimization

## 🛠 Troubleshooting

### "No audit results" or errors

1. **Install Sitespeed.io** for best results:
   ```bash
   npm install -g sitespeed.io
   ```

2. **Check if Sitespeed.io is working**:
   ```bash
   sitespeed.io --version
   ```

3. **Try Docker alternative**:
   ```bash
   docker --version
   docker pull sitespeedio/sitespeed.io:latest
   ```

4. **Fallback to Lighthouse**: The app will automatically use built-in Lighthouse if Sitespeed.io is unavailable

### Performance Tips

- **Best**: Sitespeed.io installed locally
- **Good**: Docker with Sitespeed.io image
- **Basic**: Built-in Lighthouse fallback

### Common Issues

| Issue | Solution |
|-------|----------|
| "Command not found: sitespeed.io" | Install: `npm install -g sitespeed.io` |
| "Docker not available" | Install Docker or use Lighthouse mode |
| Slow audit performance | Use "Fast Mode" option |
| API rate limits | Wait a few minutes between audits |

## 🚀 Advanced Features

### AI-Enhanced Analysis (Optional)
```bash
# Add to .env.local
VITE_OPENAI_API_KEY=sk-your-key-here
```

### Sitespeed.io Options
- **Fast Mode**: Single iteration for quick results
- **Mobile Testing**: Mobile device emulation  
- **Custom Settings**: Modify in `src/services/sitespeedService.ts`

## 📈 Performance

| Provider | Setup Time | Audit Speed | Detail Level | API Required |
|----------|------------|-------------|--------------|--------------|
| Sitespeed.io | 2 min | Fast | Comprehensive | No |
| Lighthouse | 0 min | Fast | Good | No |
| PageSpeed | 1 min | Medium | Good | Yes |

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run setup-sitespeed` - Install Sitespeed.io globally
- `npm run setup-docker` - Pull Sitespeed.io Docker image
- `npm run setup` - Interactive configuration setup

### Project Structure
```
src/
├── components/        # React UI components
├── services/
│   ├── sitespeedService.ts    # Sitespeed.io integration
│   ├── lighthouseService.ts   # Lighthouse integration  
│   ├── auditService.ts        # Main audit orchestration
│   └── ...
├── pages/            # Route components
└── utils/            # Helper utilities
```

## 📝 License

MIT License - see LICENSE file for details.

---

**🎉 Powered by Sitespeed.io** - The open-source web performance testing tool that gives you detailed insights into your website's performance without requiring API keys or external dependencies!
