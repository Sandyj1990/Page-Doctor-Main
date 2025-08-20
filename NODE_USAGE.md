# 🚀 Running Page Doctor in Node.js

Page Doctor can now run natively in Node.js environments, unlocking the full power of Crawlee and all advanced analysis features!

## 🔧 Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Install TypeScript runner:**
```bash
npm install -g tsx
```

## 📊 Option 1: Command Line Analysis

Run single analysis from command line:

```bash
# Analyze a single website
npm run node:analyze https://example.com

# Generate score-based report (uses template)
npm run analyze:score https://example.com

# Or use tsx directly
tsx node-runner.js https://example.com
```

**Example Output:**
```
🚀 Starting Page Doctor Analysis for: https://example.com

📊 Running Crawlee Analysis...
Progress: 10% - Initializing Crawlee crawler...
Progress: 20% - Starting crawl...
Progress: 50% - Processing page 1/5... (https://example.com)
✅ Successfully crawled 3 pages
⏱️ Total crawl time: 8432ms

📄 Sample Page Analysis:
Title: Example Domain
Content Length: 1256 characters
Links Found: 12
Images Found: 3
Headings: H1(1), H2(3), H3(2)

🔍 Running Comprehensive SEO Audit...
✅ SEO Audit completed successfully
Pages analyzed: 3
Issues found: 7
```

## 🌐 Option 2: API Server

Start the Express.js API server:

```bash
# Start server
npm run server

# Start with auto-reload during development
npm run server:dev
```

The server runs on `http://localhost:3001`

### Available Endpoints:

#### Health Check
```bash
curl http://localhost:3001/health
```

#### Single Page Crawl
```bash
curl -X POST http://localhost:3001/api/crawl-single \
     -H "Content-Type: application/json" \
     -d '{"url": "https://example.com"}'
```

#### Website Discovery (Multiple Pages)
```bash
curl -X POST http://localhost:3001/api/crawl-website \
     -H "Content-Type: application/json" \
     -d '{"url": "https://example.com", "maxPages": 10}'
```

#### Comprehensive SEO Audit
```bash
curl -X POST http://localhost:3001/api/seo-audit \
     -H "Content-Type: application/json" \
     -d '{"url": "https://example.com", "options": {"crawlDepth": 2}}'
```

#### Domain Analytics
```bash
curl -X POST http://localhost:3001/api/domain-analytics \
     -H "Content-Type: application/json" \
     -d '{"domain": "example.com"}'
```

#### Top Pages Analysis
```bash
curl -X POST http://localhost:3001/api/top-pages \
     -H "Content-Type: application/json" \
     -d '{"domain": "example.com"}'
```

## 🆚 Node.js vs Browser Comparison

| Feature | Browser (Vite) | Node.js |
|---------|----------------|---------|
| **Crawlee Support** | ❌ Mock data only | ✅ Full functionality |
| **Real Content Analysis** | ❌ Limited | ✅ Complete |
| **JavaScript Rendering** | ❌ No | ✅ Full Puppeteer |
| **Multi-page Crawling** | ❌ No | ✅ Yes |
| **Performance** | ⚠️ Limited | ✅ Fast |
| **API Dependencies** | ✅ Required | ✅ None needed |

## 🔥 Key Benefits in Node.js

### 1. **Real Content Extraction**
- ✅ Full JavaScript rendering with Puppeteer
- ✅ Smart content filtering (removes nav/footer)
- ✅ Complete DOM analysis

### 2. **Comprehensive Data**
- ✅ All headings (H1, H2, H3)
- ✅ Images with alt text analysis
- ✅ All internal/external links
- ✅ Performance metrics
- ✅ Meta descriptions and SEO data

### 3. **Multi-page Analysis**
- ✅ Website crawling with configurable depth
- ✅ Sitemap discovery
- ✅ Link following and analysis

### 4. **No External Dependencies**
- ✅ No API keys required
- ✅ Self-hosted and private
- ✅ No rate limits or costs

## ⚙️ Configuration Options

### Crawlee Configuration
```javascript
const crawler = new CrawleeService({
  maxPages: 20,           // Maximum pages to crawl
  maxDepth: 3,            // Maximum crawl depth
  timeout: 30000,         // Page timeout (30s)
  delay: 1000,            // Delay between requests (1s)
  respectRobots: true,    // Respect robots.txt
  includeExternal: false  // Include external domains
});
```

### SEO Audit Options
```javascript
const options = {
  crawlDepth: 2,         // How deep to crawl
  includeContent: true,   // Analyze page content
  analyzeTechnical: true, // Technical SEO checks
  analyzeOnPage: true     // On-page SEO analysis
};
```

## 🚨 Troubleshooting

### Common Issues

1. **`tsx not found`**
   ```bash
   npm install -g tsx
   ```

2. **Puppeteer installation issues**
   ```bash
   npm rebuild puppeteer
   ```

3. **Memory usage high**
   - Reduce `maxPages` setting
   - Implement pagination for large sites

4. **Timeout errors**
   - Increase `timeout` setting
   - Check network connectivity

### Performance Tips

- **For large sites**: Use `maxPages: 10-20` and `maxDepth: 2-3`
- **For speed**: Reduce `delay` to 500ms (be respectful)
- **For memory**: Monitor with `process.memoryUsage()`

## 🎯 Production Deployment

### Option 1: Process Manager (PM2)
```bash
npm install -g pm2
pm2 start server.js --name "page-doctor-api"
pm2 startup
pm2 save
```

### Option 2: Docker
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "run", "server"]
```

### Option 3: Serverless (Vercel/AWS)
Use the existing `api/lighthouse.ts` pattern and extend it with Crawlee services.

---

🎉 **You now have full Page Doctor functionality running in Node.js!** 