# Deployment Guide - CrowdJam Live

## ⚠️ Important: WebSocket Limitation

**Vercel serverless functions do NOT support persistent WebSocket connections** required by Socket.io. Therefore, we need a hybrid deployment:

- **Frontend (Next.js)**: Deploy on Vercel ✅
- **Backend (Socket.io)**: Deploy on a platform that supports WebSockets (Railway, Render, Fly.io, etc.) ✅

---

## Option 1: Frontend on Vercel + Backend on Railway (Recommended)

### Step 1: Deploy Backend on Railway

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your repository
   - Select the repository

3. **Configure Backend Service**
   - Railway will auto-detect Node.js
   - Set root directory: `server`
   - Add environment variables:
     ```
     PORT=4000
     FRONTEND_URL=https://your-vercel-app.vercel.app
     OPENAI_API_KEY=your_key_here (optional)
     NODE_ENV=production
     ```

4. **Deploy**
   - Railway will automatically build and deploy
   - Note the generated URL (e.g., `https://your-app.up.railway.app`)

5. **Update CORS Settings**
   - The backend will automatically allow your Vercel frontend URL

---

### Step 2: Deploy Frontend on Vercel

1. **Prepare for Deployment**
   - Create `vercel.json` in the root directory (see below)
   - Update environment variables in Vercel dashboard

2. **Deploy via Vercel Dashboard**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with GitHub
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure:
     - **Root Directory**: `web`
     - **Framework Preset**: Next.js
     - **Build Command**: `npm run build` (or leave default)
     - **Output Directory**: `.next` (or leave default)

3. **Add Environment Variables**
   - In Vercel project settings → Environment Variables:
     ```
     NEXT_PUBLIC_API_URL=https://your-railway-backend.up.railway.app
     ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-app.vercel.app`

---

## Option 2: Frontend on Vercel + Backend on Render

### Step 1: Deploy Backend on Render

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create Web Service**
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `crowdjam-backend`
     - **Root Directory**: `server`
     - **Environment**: Node
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
     - **Plan**: Free (or paid for better performance)

3. **Add Environment Variables**
   ```
   PORT=4000
   FRONTEND_URL=https://your-vercel-app.vercel.app
   OPENAI_API_KEY=your_key_here (optional)
   NODE_ENV=production
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy
   - Note the URL (e.g., `https://crowdjam-backend.onrender.com`)

---

### Step 2: Deploy Frontend on Vercel

Same as Option 1, Step 2, but use Render backend URL:
```
NEXT_PUBLIC_API_URL=https://crowdjam-backend.onrender.com
```

---

## Option 3: Both on Railway (Alternative)

If you prefer to keep everything in one place:

1. **Deploy Backend** (same as Option 1, Step 1)
2. **Deploy Frontend on Railway**
   - Create another service in the same Railway project
   - Root directory: `web`
   - Build command: `npm install && npm run build`
   - Start command: `npm start`
   - Environment variable: `NEXT_PUBLIC_API_URL=https://your-backend-service.up.railway.app`

---

## Required Configuration Files

### 1. Create `vercel.json` in root directory:

```json
{
  "buildCommand": "cd web && npm install && npm run build",
  "outputDirectory": "web/.next",
  "framework": "nextjs",
  "installCommand": "cd web && npm install"
}
```

### 2. Update `server/package.json` scripts:

Ensure you have:
```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

### 3. Create `server/.dockerfile` (optional, for Railway):

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 4000

CMD ["npm", "start"]
```

---

## Environment Variables Checklist

### Backend (Railway/Render):
- ✅ `PORT=4000`
- ✅ `FRONTEND_URL=https://your-vercel-app.vercel.app`
- ✅ `OPENAI_API_KEY=your_key` (optional)
- ✅ `NODE_ENV=production`

### Frontend (Vercel):
- ✅ `NEXT_PUBLIC_API_URL=https://your-backend-url.com`

---

## Post-Deployment Steps

1. **Update CORS in Backend**
   - Ensure `FRONTEND_URL` matches your Vercel URL exactly
   - Backend should already handle this, but verify

2. **Test the Connection**
   - Open your Vercel app
   - Check browser console for connection errors
   - Verify WebSocket connection in Network tab

3. **Update Socket.io Client**
   - The frontend should automatically use `NEXT_PUBLIC_API_URL`
   - Verify in `web/lib/socket.ts`

---

## Troubleshooting

### Issue: WebSocket connection fails
- **Solution**: Verify `NEXT_PUBLIC_API_URL` is set correctly in Vercel
- Check backend logs for CORS errors
- Ensure backend URL is accessible (not localhost)

### Issue: CORS errors
- **Solution**: Update `FRONTEND_URL` in backend environment variables
- Restart backend service

### Issue: Build fails on Vercel
- **Solution**: Ensure root directory is set to `web`
- Check build logs for specific errors
- Verify `package.json` exists in `web/` directory

### Issue: Backend crashes
- **Solution**: Check Railway/Render logs
- Verify all environment variables are set
- Ensure `npm run build` completes successfully

---

## Quick Deploy Commands

### Railway (CLI):
```bash
npm i -g @railway/cli
railway login
railway init
railway up
```

### Vercel (CLI):
```bash
npm i -g vercel
cd web
vercel
```

---

## Recommended Setup (Best for MVP)

### Option A: Completely Free (Best for Testing)
**Frontend**: Vercel (free tier, excellent Next.js support)  
**Backend**: Render (free tier, supports WebSockets)

**Pros:**
- ✅ $0/month
- ✅ Easy deployment
- ✅ Automatic HTTPS
- ✅ WebSocket support

**Cons:**
- ⚠️ Render auto-sleeps after 15 min (slow first request after sleep)
- ⚠️ Not ideal for production

### Option B: Best Value ($5/month - Recommended)
**Frontend**: Vercel (free tier)  
**Backend**: Railway Hobby ($5/month)

**Pros:**
- ✅ Reliable, no cold starts
- ✅ Easy deployment
- ✅ Automatic HTTPS
- ✅ Excellent WebSocket support
- ✅ Good for MVP/demos

**Cons:**
- ⚠️ Costs $5/month

### Option C: Production Ready ($40/month)
**Frontend**: Vercel Pro ($20/month)  
**Backend**: Railway Pro ($20/month)

**Pros:**
- ✅✅ Best performance
- ✅✅ No limitations
- ✅✅ Production-ready

---

## Production Considerations

1. **Database**: Add PostgreSQL/MongoDB for persistence
2. **Redis**: For session management and scaling
3. **CDN**: Vercel handles this automatically
4. **Monitoring**: Add error tracking (Sentry, etc.)
5. **Domain**: Connect custom domain in Vercel settings
6. **SSL**: Automatically handled by both platforms

---

## Cost Estimate

### Railway Pricing (2024):
- **Free Plan**: $1 usage credits/month (very limited - may not be enough for Socket.io)
- **Hobby Plan**: $5/month (recommended for MVP)
- **Pro Plan**: $20/month

### Free Alternatives:

**Option 1: Render (Recommended for Free Tier)**
- ✅ **Free tier available** (with limitations)
- ✅ Supports WebSockets
- ✅ Auto-sleeps after 15 min inactivity (wakes on request)
- ⚠️ Slower cold starts

**Option 2: Fly.io**
- ✅ **Free tier available** (generous)
- ✅ Supports WebSockets
- ✅ Good performance
- ✅ No auto-sleep

**Option 3: Railway Free**
- ⚠️ Only $1/month credits (very limited)
- ⚠️ May not be enough for persistent Socket.io connection
- ✅ Good for testing

### Cost Comparison:

**Completely Free (with limitations):**
- Vercel: Free (frontend)
- Render: Free (backend) - auto-sleeps after inactivity
- **Total**: $0/month ⚠️ (slow cold starts on Render)

**Best for MVP ($5/month):**
- Vercel: Free (frontend)
- Railway Hobby: $5/month (backend)
- **Total**: $5/month ✅ (reliable, no cold starts)

**Production Ready ($20/month):**
- Vercel Pro: $20/month
- Railway Pro: $20/month
- **Total**: $40/month ✅✅

---

Need help with a specific step? Let me know!

