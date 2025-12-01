# 🆓 Completely Free Deployment Guide

## Best Free Option: Vercel + Render

This guide shows you how to deploy **completely free** using:
- **Frontend**: Vercel (free, excellent Next.js support)
- **Backend**: Render (free tier, supports WebSockets)

⚠️ **Note**: Render free tier auto-sleeps after 15 minutes of inactivity. First request after sleep takes ~30 seconds to wake up.

---

## Step 1: Deploy Backend on Render (FREE)

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub (free)

2. **Create Web Service**
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Select your repository

3. **Configure Service**
   - **Name**: `crowdjam-backend`
   - **Root Directory**: `server`
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: **Free** (select this!)

4. **Add Environment Variables**
   - Click "Advanced" → "Add Environment Variable"
   - Add these:
     ```
     PORT=4000
     NODE_ENV=production
     FRONTEND_URL=https://your-app.vercel.app (update after Vercel)
     OPENAI_API_KEY=your_key (optional)
     ```

5. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy (takes ~5 minutes)
   - **Copy the URL** (e.g., `https://crowdjam-backend.onrender.com`)
   - ⚠️ First deploy is slow, be patient!

6. **Note the URL Format**
   - Render URLs look like: `https://your-service.onrender.com`
   - Save this URL for Step 2

---

## Step 2: Deploy Frontend on Vercel (FREE)

1. **Go to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Sign up with GitHub (free)

2. **Create New Project**
   - Click "Add New Project"
   - Import your GitHub repository
   - Select your repository

3. **Configure Project**
   - **Root Directory**: `web` (important!)
   - **Framework Preset**: Next.js (auto-detected)
   - **Build Command**: Leave default
   - **Output Directory**: Leave default
   - Click "Deploy" (don't add env vars yet)

4. **Wait for First Deploy**
   - First deploy takes ~2-3 minutes
   - Copy your Vercel URL (e.g., `https://your-app.vercel.app`)

5. **Add Environment Variable**
   - Go to **Settings** → **Environment Variables**
   - Click "Add New"
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://your-render-backend.onrender.com` (from Step 1)
   - Click "Save"

6. **Redeploy**
   - Go to **Deployments** tab
   - Click "..." on latest deployment
   - Click "Redeploy"
   - Wait for deployment to complete

---

## Step 3: Update Backend CORS

1. **Go back to Render**
   - Open your web service
   - Go to **Environment** tab
   - Update `FRONTEND_URL` to your Vercel URL:
     ```
     FRONTEND_URL=https://your-app.vercel.app
     ```
   - Service will auto-restart

---

## Step 4: Test Your Deployment

1. **Open your Vercel URL**
   - Should see the join page
   - Open browser console (F12)
   - Check for connection errors

2. **Test Features**
   - Join as Audience
   - Submit a suggestion
   - Check if it appears in real-time
   - Verify WebSocket connection

3. **First Request After Sleep**
   - If Render was sleeping, first request takes ~30 seconds
   - Subsequent requests are fast
   - This is normal for free tier

---

## ✅ You're Live - Completely FREE!

**Frontend**: `https://your-app.vercel.app`  
**Backend**: `https://your-backend.onrender.com`

**Cost**: $0/month 🎉

---

## ⚠️ Free Tier Limitations

### Render Free Tier:
- ✅ Free forever
- ✅ Supports WebSockets
- ✅ Automatic HTTPS
- ⚠️ Auto-sleeps after 15 min inactivity
- ⚠️ ~30 second wake-up time
- ⚠️ 750 hours/month limit (usually enough)

### Vercel Free Tier:
- ✅ Free forever
- ✅ Excellent Next.js support
- ✅ Automatic HTTPS
- ✅ Global CDN
- ⚠️ 100GB bandwidth/month
- ⚠️ Serverless function limits

---

## 🔧 Troubleshooting

### Issue: Slow first request
- **Cause**: Render service was sleeping
- **Solution**: Wait ~30 seconds, it will wake up
- **Prevention**: Upgrade to paid plan or use Railway ($5/month)

### Issue: WebSocket not connecting
- **Solution**: 
  1. Verify `NEXT_PUBLIC_API_URL` in Vercel matches Render URL
  2. Check Render logs for errors
  3. Ensure backend is running (check Render dashboard)

### Issue: CORS errors
- **Solution**: 
  1. Update `FRONTEND_URL` in Render to match Vercel URL exactly
  2. Restart Render service

### Issue: Build fails
- **Solution**: 
  1. Check build logs in Render/Vercel
  2. Verify `package.json` exists in correct directories
  3. Ensure all dependencies are listed

---

## 🚀 Upgrade Path (When Ready)

If you need better performance:

**Option 1: Railway Hobby ($5/month)**
- No cold starts
- Better performance
- Still affordable

**Option 2: Render Paid ($7/month)**
- No auto-sleep
- Better performance
- More resources

---

## 📝 Environment Variables Summary

### Render (Backend):
```
PORT=4000
NODE_ENV=production
FRONTEND_URL=https://your-vercel-app.vercel.app
OPENAI_API_KEY=your_key (optional)
```

### Vercel (Frontend):
```
NEXT_PUBLIC_API_URL=https://your-render-backend.onrender.com
```

---

## 🎉 That's It!

Your app is now live and **completely free**! Perfect for:
- ✅ Portfolio projects
- ✅ MVP demos
- ✅ Testing and development
- ✅ Personal projects

Need help? Check the main `DEPLOYMENT.md` for more options!

