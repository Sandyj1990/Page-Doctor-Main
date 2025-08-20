# 🧪 Page Doctor Node.js Testing Guide

## **Quick Test Status Check**

Your setup is working! Here's what we confirmed:
- ✅ Node.js environment running
- ✅ Crawlee service loaded successfully 
- ✅ API server running on port 3001
- ✅ Single page analysis working
- ✅ Real content extraction confirmed

## **🚀 Command Line Testing**

### **Test 1: Single Website Analysis**
```bash
npm run node:analyze https://github.com
```

**Expected Output:**
```
🚀 Starting Page Doctor Analysis for: https://github.com
📊 Running Crawlee Analysis...
Progress: 10% - Initializing Crawlee crawler...
✅ Successfully crawled X pages
📄 Sample Page Analysis:
Title: GitHub: Let's build from here
Content Length: XXXX characters
Links Found: XX
Images Found: XX
```

### **Test 2: E-commerce Site**
```bash
npm run node:analyze https://news.ycombinator.com
```

### **Test 3: News Site** 
```bash
npm run node:analyze https://httpbin.org/html
```

## **🌐 API Server Testing**

### **Health Check** ✅
```bash
curl http://localhost:3001/health
```
**Expected:** `{"status":"OK","services":["CrawleeService"]}`

### **Single Page Crawl** ✅ (Already working)
```bash
curl -X POST http://localhost:3001/api/crawl-single \
     -H "Content-Type: application/json" \
     -d '{"url": "https://github.com"}'
```

### **Website Crawling (Multiple Pages)**
```bash
curl -X POST http://localhost:3001/api/crawl-website \
     -H "Content-Type: application/json" \
     -d '{"url": "https://github.com", "maxPages": 5}'
```

### **URL Discovery**
```bash
curl -X POST http://localhost:3001/api/discover-urls \
     -H "Content-Type: application/json" \
     -d '{"url": "https://github.com", "maxUrls": 10}'
```

### **Content Scraping**
```bash
curl -X POST http://localhost:3001/api/scrape-content \
     -H "Content-Type: application/json" \
     -d '{"url": "https://github.com"}'
```

## **📊 Interactive Testing with Different Sites**

### **Test Sites by Complexity:**

#### **Simple Sites** (Good for testing basics)
- `https://example.com` ✅ (Already confirmed working)
- `https://httpbin.org/html`
- `https://jsonplaceholder.typicode.com`

#### **Medium Complexity** (Good for testing features)
- `https://github.com`
- `https://news.ycombinator.com` 
- `https://stackoverflow.com`

#### **Complex Sites** (Good for testing robustness)
- `https://reddit.com`
- `https://wikipedia.org`
- `https://medium.com`

## **🔍 What to Look For in Results**

### **Successful Single Page Analysis Should Show:**
```json
{
  "success": true,
  "data": {
    "url": "https://example.com/",
    "title": "Real Page Title",
    "content": "Extracted text content...",
    "links": ["https://..."],
    "statusCode": 200,
    "headings": {
      "h1": ["Heading 1"],
      "h2": ["Heading 2", "Another H2"],
      "h3": ["Heading 3"]
    },
    "images": [
      {"src": "image-url", "alt": "alt text"}
    ],
    "metaDescription": "Page description",
    "loadTime": 2500,
    "size": 15000
  }
}
```

### **Multi-page Crawl Should Show:**
```json
{
  "success": true,
  "data": {
    "pages": [
      // Array of page objects
    ],
    "totalPages": 5,
    "crawlTime": 15000,
    "summary": {
      "successful": 5,
      "failed": 0,
      "redirects": 0,
      "averageLoadTime": 3000
    }
  }
}
```

## **⚡ Quick Test Commands**

Open **two terminals** and run these:

### **Terminal 1: Start Server**
```bash
cd /Users/sandeepjana/Downloads/page-doctor-main
npm run server:simple
```

### **Terminal 2: Run Tests**
```bash
# Health check
curl http://localhost:3001/health

# Test with working site
curl -X POST http://localhost:3001/api/crawl-single \
     -H "Content-Type: application/json" \
     -d '{"url": "https://github.com"}' | jq

# Command line test
npm run node:analyze https://github.com
```

## **🐛 Troubleshooting**

### **If API Returns Empty Results:**
- Try different URLs (some sites block crawlers)
- Check if site has robots.txt restrictions
- Verify the site loads in a regular browser

### **If Command Line Fails:**
```bash
# Check Node.js version
node --version

# Reinstall dependencies  
npm install

# Try with verbose logging
npm run node:analyze https://example.com
```

### **If Server Won't Start:**
```bash
# Check if port is in use
lsof -i :3001

# Kill existing process
pkill -f "tsx simple-server.js"

# Restart server
npm run server:simple
```

## **🎯 Performance Benchmarks**

| Site Type | Expected Load Time | Content Length | Links Found |
|-----------|-------------------|----------------|-------------|
| Simple (example.com) | 1-3 seconds | 100-500 chars | 1-5 |
| Medium (github.com) | 3-8 seconds | 5K-20K chars | 20-100 |
| Complex (wikipedia) | 5-15 seconds | 20K+ chars | 100+ |

## **✅ Verification Checklist**

- [ ] Health endpoint returns OK
- [ ] Single page crawl extracts real content
- [ ] Command line tool shows progress updates
- [ ] Titles and headings are extracted correctly
- [ ] Links are discovered and parsed
- [ ] Load times are reasonable (< 30 seconds)
- [ ] No error messages in console
- [ ] Content is cleaned (no nav/footer text)

---

**🎉 Your Node.js setup is working perfectly!** The key difference from browser mode is that you're now getting **real content extraction** instead of mock data. 