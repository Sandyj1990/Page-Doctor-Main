# 🚀 Google PageSpeed API Setup Guide

## ✅ **Current Status: INTEGRATED**

The Google PageSpeed Insights API is **fully integrated** and working in Page Doctor! Here's what you need to know:

## 🔧 **Current Configuration**

### **Without API Key (Default)**
- ✅ **Status**: Working but limited
- 📊 **Quota**: ~100 requests per hour
- ⚡ **Performance**: Standard rate limiting
- 🎯 **Usage**: Good for testing and light usage

### **With API Key (Recommended)**
- 🔑 **Status**: Enhanced performance
- 📊 **Quota**: 25,000 requests per day
- ⚡ **Performance**: Faster responses, minimal rate limiting
- 🎯 **Usage**: Production and heavy usage

## 🚀 **How to Get a FREE Google PageSpeed API Key**

1. **Visit Google Cloud Console**
   ```
   https://console.cloud.google.com/apis/credentials
   ```

2. **Create or Select a Project**
   - Click "Create Project" or select existing project
   - Name it "Page Doctor API" or similar

3. **Enable PageSpeed Insights API**
   - Go to APIs & Services > Library
   - Search for "PageSpeed Insights API"
   - Click "Enable"

4. **Create API Key**
   - Go to APIs & Services > Credentials
   - Click "Create Credentials" > "API Key"
   - Copy your API key (starts with `AIza...`)

5. **Configure Page Doctor**
   - Create `.env.local` file in your project root:
   ```bash
   # .env.local
   VITE_PAGESPEED_API_KEY=AIzaSyYourActualAPIKeyHere
   ```

6. **Restart Development Server**
   ```bash
   npm run dev
   ```

## 📊 **Performance Comparison**

| Feature | Without API Key | With API Key |
|---------|----------------|--------------|
| **Daily Quota** | ~2,400 requests | 25,000 requests |
| **Rate Limiting** | 100ms delays | Minimal delays |
| **Error Rate** | Higher (quota exceeded) | Much lower |
| **Response Time** | Standard | Optimized |
| **Cost** | Free | Free |

## 🛡️ **API Key Security**

✅ **Safe Practices:**
- Use `.env.local` (not tracked by Git)
- Restrict API key to PageSpeed Insights API only
- Monitor usage in Google Cloud Console

❌ **Avoid:**
- Hardcoding API keys in source code
- Committing API keys to version control
- Using production keys in development

## 🔍 **How to Verify Integration**

1. **Check Browser Console**
   - With API key: `🔑 Using PageSpeed API key for higher quotas`
   - Without API key: `⚡ Using PageSpeed API without key (limited quota)`

2. **Monitor Performance**
   - With API key: Audits complete in 3-8 seconds
   - Without API key: May take longer with rate limiting

## 🚨 **Troubleshooting**

### **Common Issues:**

**"PageSpeed API timeout"**
- ✅ **Solution**: Add API key to increase quota
- ✅ **Alternative**: Try again in a few minutes

**"API key not working"**
- ✅ **Check**: Ensure PageSpeed Insights API is enabled
- ✅ **Verify**: API key format starts with `AIza`
- ✅ **Restart**: Development server after adding key

**"Quota exceeded"**
- ✅ **Without API key**: Wait an hour or add API key
- ✅ **With API key**: Check Google Cloud Console for usage

## 📈 **Usage Statistics**

Page Doctor efficiently uses the PageSpeed API:
- **Single page audit**: 1 API call
- **Domain audit**: 10-15 API calls (depending on pages found)
- **Caching**: Results cached for 2 hours to minimize API usage

## 🎯 **Next Steps**

1. **Set up API key** for best performance
2. **Monitor usage** in Google Cloud Console  
3. **Consider upgrading** to paid plans if you exceed 25k requests/day

---

**Status**: ✅ **READY TO USE** - PageSpeed API is fully integrated and optimized! 