# HackTrack Deployment Guide

## 🚀 Production Deployment Instructions

### Prerequisites
- MongoDB Atlas account (already configured)
- Hosting platform account (Render/Vercel/Heroku)
- Node.js 18+ installed locally

---

## 📦 Backend Deployment (API + Scraper)

### Option 1: Deploy to Render.com (Recommended)

1. **Create New Web Service**
   - Connect your GitHub repository
   - Select `FYP_DATA` as the root directory
   - Build Command: `npm install`
   - Start Command: `npm start`

2. **Environment Variables** (Add in Render Dashboard)
   ```bash
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://prayushbagadia:prayush@cluster1.mbxqshj.mongodb.net/hacktrack-india?retryWrites=true&w=majority&appName=Cluster1
   JWT_SECRET=hacktrack-india-super-secret-key-2025-production
   JWT_EXPIRE=30d
   FRONTEND_URL=https://your-frontend-url.vercel.app
   HOSTED=true
   PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
   ```

3. **Add Puppeteer Buildpack** (For web scraping)
   - In Render Dashboard, add build command:
   ```bash
   npm install && apt-get update && apt-get install -y chromium
   ```

### Option 2: Deploy to Heroku

1. **Create Heroku App**
   ```bash
   heroku create hacktrack-backend
   ```

2. **Add Puppeteer Buildpack**
   ```bash
   heroku buildpacks:add jontewks/puppeteer
   heroku buildpacks:add heroku/nodejs
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=your-mongo-uri
   heroku config:set HOSTED=true
   ```

4. **Deploy**
   ```bash
   git subtree push --prefix FYP_DATA heroku main
   ```

---

## 🎨 Frontend Deployment (React App)

### Deploy to Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy from `fyp` directory**
   ```bash
   cd fyp
   vercel
   ```

3. **Environment Variables** (Add in Vercel Dashboard)
   ```bash
   REACT_APP_API_URL=https://your-backend-url.onrender.com/api
   NODE_ENV=production
   ```

4. **Build Settings in Vercel**
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm install`

### Deploy to Netlify (Alternative)

1. **Build the app locally**
   ```bash
   cd fyp
   npm run build
   ```

2. **Deploy via Netlify CLI**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod --dir=build
   ```

---

## 🛠️ Production Configuration Checklist

### Backend (FYP_DATA/.env)
- [ ] Set `NODE_ENV=production`
- [ ] Update `FRONTEND_URL` to your deployed frontend URL
- [ ] Set `HOSTED=true`
- [ ] Configure `PUPPETEER_EXECUTABLE_PATH` for your hosting platform
- [ ] Verify MongoDB Atlas IP whitelist (0.0.0.0/0 for cloud hosting)

### Frontend (fyp/.env)
- [ ] Create `.env.production` file
- [ ] Set `REACT_APP_API_URL` to your deployed backend URL
- [ ] Update CORS settings in backend to allow your frontend domain

---

## 🔒 Security for Production

1. **Update CORS in server.js**
   ```javascript
   app.use(cors({
     origin: process.env.FRONTEND_URL || 'http://localhost:3000',
     credentials: true
   }));
   ```

2. **MongoDB Atlas Security**
   - Add hosting platform IPs to whitelist
   - Or allow all IPs (0.0.0.0/0) for cloud hosting

3. **Environment Secrets**
   - Never commit `.env` files
   - Use platform-specific secret management
   - Rotate JWT_SECRET and ADMIN_SECRET regularly

---

## 📊 Scraper in Production

The scraper is **production-ready** with:
- ✅ Headless Chrome configuration for hosted environments
- ✅ Error recovery and retry logic
- ✅ Bulk processing to avoid rate limits
- ✅ Automatic detection of production/hosted environment
- ✅ Proper resource cleanup
- ✅ Logging system for debugging

**Note:** Some hosting platforms may have limitations on Puppeteer. For best scraping performance:
- Use **Render** (has Chrome pre-installed)
- Or use dedicated scraping services like ScrapingBee API (optional)

---

## 🧪 Testing Production Build Locally

### Backend
```bash
cd FYP_DATA
NODE_ENV=production npm start
```

### Frontend
```bash
cd fyp
npm run build
npx serve -s build -l 3000
```

---

## 🚨 Troubleshooting

### Issue: Puppeteer fails in production
**Solution:** 
- Add Chrome buildpack or set custom executable path
- Use `headless: 'new'` mode (already configured)
- Check hosting platform documentation for Puppeteer support

### Issue: CORS errors after deployment
**Solution:**
- Update `FRONTEND_URL` in backend `.env`
- Add your frontend domain to CORS whitelist
- Ensure credentials: true is set

### Issue: MongoDB connection fails
**Solution:**
- Check MongoDB Atlas IP whitelist
- Verify connection string in environment variables
- Ensure network access is configured for 0.0.0.0/0

---

## 📝 Post-Deployment Steps

1. **Test Core Features**
   - [ ] User registration and login
   - [ ] Job/opportunity browsing
   - [ ] Application tracking
   - [ ] Direct application links work
   - [ ] Scraper runs successfully

2. **Monitor Performance**
   - Check server logs regularly
   - Monitor scraper success rate
   - Track API response times

3. **Update Documentation**
   - Document your deployed URLs
   - Update README with live links

---

## 🎯 Live URLs (Update after deployment)

- **Frontend:** `https://your-app.vercel.app`
- **Backend API:** `https://your-backend.onrender.com/api`
- **Health Check:** `https://your-backend.onrender.com/api/health`

---

## 💡 Tips for Best Performance

1. **Use CDN** for static assets (automatic with Vercel/Netlify)
2. **Enable caching** for API responses (already configured)
3. **Compress images** before uploading profile pictures
4. **Use MongoDB indexes** (already configured)
5. **Monitor scraper** via `/api/scraper/status` endpoint

---

## 📞 Support

For deployment issues:
- Check hosting platform logs
- Review MongoDB Atlas metrics
- Test locally first with production build
- Verify all environment variables are set correctly

**Good luck with your deployment! 🚀**
