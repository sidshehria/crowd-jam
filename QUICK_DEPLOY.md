# Quick Deployment Guide

## 🚀 Fastest Way to Deploy

### Prerequisites
- GitHub account
- Vercel account (free at vercel.com)
- Backend hosting (choose one):
  - **Render** (free) - recommended for free tier
  - **Railway** ($5/month) - recommended for MVP
  - **Fly.io** (free) - alternative free option

---

## Step 1: Deploy Backend (Choose One)

### Option A: Render (FREE - Recommended for Free Tier)
See `DEPLOY_FREE.md` for complete free deployment guide.

### Option B: Railway ($5/month - Recommended for MVP)

1. **Push code to GitHub** (if not already)
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Go to Railway**
   - Visit [railway.app](https://railway.app)
   - Sign up with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository

3. **Configure Service**
   - Railway auto-detects Node.js
   - Click on the service → Settings
   - Set **Root Directory**: `server`
   - Go to **Variables** tab, add:
     ```
     PORT=4000
     NODE_ENV=production
     FRONTEND_URL=https://your-app.vercel.app (update after Vercel deploy)
     ```

4. **Deploy**
   - Railway auto-deploys
   - Copy the generated URL (e.g., `https://crowdjam-production.up.railway.app`)
   - **Save this URL** - you'll need it for frontend
   - ⚠️ **Note**: Railway free tier only gives $1/month credits (may not be enough)
   - 💡 **Recommendation**: Use Render (free) or Railway Hobby ($5/month)

---

## Step 2: Deploy Frontend on Vercel (3 minutes)

1. **Go to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Sign up with GitHub
   - Click "Add New Project"
   - Import your repository

2. **Configure Project**
   - **Root Directory**: `web`
   - **Framework Preset**: Next.js (auto-detected)
   - Click "Deploy" (use defaults)

3. **Add Environment Variable**
   - After first deploy, go to **Settings** → **Environment Variables**
   - Add:
     ```
     NEXT_PUBLIC_API_URL=https://your-railway-url.up.railway.app
     ```
   - Click "Save"
   - Go to **Deployments** → Click "..." on latest → "Redeploy"

4. **Update Backend CORS**
   - Go back to Railway
   - Update `FRONTEND_URL` variable to your Vercel URL
   - Service will auto-restart

---

## Step 3: Test (2 minutes)

1. **Open your Vercel URL**
   - Should see the join page
   - Open browser console (F12)
   - Check for connection errors

2. **Test Features**
   - Join as Audience
   - Submit a suggestion
   - Check if it appears in real-time
   - Verify WebSocket connection in Network tab

---

## ✅ Done!

Your app is now live:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.up.railway.app`

---

## 🔧 Troubleshooting

**WebSocket not connecting?**
- Verify `NEXT_PUBLIC_API_URL` in Vercel matches Railway URL
- Check Railway logs for errors
- Ensure backend is running (check Railway dashboard)

**CORS errors?**
- Update `FRONTEND_URL` in Railway to match Vercel URL exactly
- Restart Railway service

**Build failing?**
- Check build logs in Vercel
- Ensure `web/package.json` exists
- Verify all dependencies are in `package.json`

---

## 📝 Environment Variables Summary

### Railway (Backend):
```
PORT=4000
NODE_ENV=production
FRONTEND_URL=https://your-vercel-app.vercel.app
OPENAI_API_KEY=your_key (optional)
```

### Vercel (Frontend):
```
NEXT_PUBLIC_API_URL=https://your-railway-backend.up.railway.app
```

---

## 🎉 That's it!

Your CrowdJam Live MVP is now deployed and accessible worldwide!

