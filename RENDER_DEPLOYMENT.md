# 🚀 Deploy Page Doctor to Render (Always Free)

## ✅ **Why Render is Perfect for Page Doctor:**
- ✅ **Always free tier** (no time limits)
- ✅ **Full Puppeteer/Crawlee support**
- ✅ **No crawler restrictions**
- ✅ **24/7 uptime** (no sleep)
- ✅ **750 hours/month** free compute
- ✅ **Built-in SSL & CDN**

---

## 🔧 **Step 1: Fix Local Setup First**

Your error happens because you're using `node server.js` directly. Use the correct command:

```bash
# ❌ Don't use this (causes TypeScript error)
node server.js

# ✅ Use this instead  
npm run server
```

**Test locally:**
```bash
cd /Users/sandeepjana/Downloads/page-doctor-main
npm run server
# Should see: "🚀 Page Doctor API Server running on http://localhost:3001"
```

---

## 📋 **Step 2: Prepare for Deployment**

### **Check Your Files:**
Your project already has the correct deployment files:
- ✅ `render.yaml` - Render configuration
- ✅ `package.json` - Dependencies and scripts
- ✅ `Dockerfile` - Container setup (optional)

### **Environment Variables (Optional):**
Add these to `.env.local` if you want enhanced features:
```bash
# Optional: For enhanced PageSpeed analysis
VITE_PAGESPEED_API_KEY=your_pagespeed_api_key

# Optional: For AI-powered content analysis  
VITE_OPENAI_API_KEY=your_openai_api_key
```

---

## 🚀 **Step 3: Push to GitHub**

```bash
# Make sure all changes are committed
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

---

## 🌐 **Step 4: Deploy to Render**

### **4.1 Create Render Account:**
1. Go to [render.com](https://render.com)
2. Click **"Get Started for Free"**
3. Sign up with GitHub (recommended)

### **4.2 Create Web Service:**
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Select your **page-doctor-main** repository

### **4.3 Configure Service:**
```
Name: page-doctor-api
Region: Oregon (US West)
Branch: main
Build Command: npm ci
Start Command: npm run server
```

### **4.4 Advanced Settings:**
```
Plan: Free
Environment: Node
Auto-Deploy: Yes (recommended)
```

### **4.5 Environment Variables:**
Add these in the Render dashboard:
```
PORT = 10000
NODE_ENV = production

# Optional (if you have API keys):
VITE_PAGESPEED_API_KEY = your_key_here
VITE_OPENAI_API_KEY = your_key_here  
```

---

## ⚡ **Step 5: Deploy!**

1. Click **"Create Web Service"**
2. Render will automatically:
   - Build your app (`npm ci`)
   - Install dependencies 
   - Start server (`npm run server`)
3. **Build time:** ~3-5 minutes
4. **Your app will be live at:** `https://your-app-name.onrender.com`

---

## 🧪 **Step 6: Test Your Deployed App**

### **Health Check:**
```bash
curl https://your-app-name.onrender.com/health
# Should return: {"status":"OK","timestamp":"..."}
```

### **Test API Endpoints:**
```bash
# Test single page crawling
curl -X POST https://your-app-name.onrender.com/api/crawl-single \
     -H "Content-Type: application/json" \
     -d '{"url": "https://example.com"}'

# Test website discovery  
curl -X POST https://your-app-name.onrender.com/api/crawl-website \
     -H "Content-Type: application/json" \
     -d '{"url": "https://example.com", "maxPages": 5}'

# Test SEO audit
curl -X POST https://your-app-name.onrender.com/api/seo-audit \
     -H "Content-Type: application/json" \
     -d '{"url": "https://example.com"}'
```

---

## 🎉 **Success! Your App is Live**

### **✅ What Works Now:**
- ✅ **Real web crawling** (no mock data!)
- ✅ **Puppeteer browser automation**
- ✅ **Multi-page site analysis**
- ✅ **PDF generation**
- ✅ **All crawler features**
- ✅ **24/7 uptime**

### **📱 Access Your API:**
- **Base URL:** `https://your-app-name.onrender.com`
- **Health Check:** `/health`
- **API Endpoints:** `/api/crawl-single`, `/api/crawl-website`, `/api/seo-audit`

---

## 🔧 **Troubleshooting**

### **Build Fails:**
```bash
# Check build logs in Render dashboard
# Common issues:
1. Missing dependencies → Check package.json
2. TypeScript errors → Make sure tsx is installed
3. Memory limits → Reduce concurrent processes
```

### **App Won't Start:**
```bash
# Check if server.js uses correct command
npm run server  # Not node server.js
```

### **Crawling Issues:**
```bash
# Should work perfectly on Render!
# If you see errors, check the logs for specific issues
```

---

## 💰 **Free Tier Limits:**

- **✅ 750 build minutes/month** (plenty for most projects)  
- **✅ Unlimited bandwidth**
- **✅ Unlimited requests**
- **✅ Always-on** (no sleep after 30min like Heroku)
- **⚠️ 512MB RAM** (sufficient for Page Doctor)

---

## 🚀 **Next Steps**

### **Frontend Integration:**
If you want a web UI, you can:
1. **Deploy React frontend separately** to Vercel/Netlify  
2. **Point frontend to your Render API**
3. **Build a complete full-stack app**

### **Custom Domain:**
- Free SSL certificates
- Custom domain support
- Easy DNS configuration

---

## 🎯 **You're Done!**

Your Page Doctor app is now running on Render with:
- **✅ Always free hosting**
- **✅ Full crawler functionality** 
- **✅ No mock data issues**
- **✅ Professional API endpoints**
- **✅ 24/7 uptime**

**API Base URL:** `https://your-app-name.onrender.com`

Ready to deploy? Let's do it! 🚀 