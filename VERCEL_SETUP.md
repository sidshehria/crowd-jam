# Vercel Deployment Setup Guide

## ⚠️ Important: Root Directory Configuration

When deploying to Vercel, you **MUST** set the **Root Directory** to `web` in the Vercel dashboard.

## Step-by-Step Fix

### Option 1: Set Root Directory in Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Open your project: https://vercel.com/dashboard
   - Click on your project

2. **Go to Settings**
   - Click "Settings" tab
   - Scroll to "Root Directory"

3. **Set Root Directory**
   - Click "Edit"
   - Enter: `web`
   - Click "Save"

4. **Redeploy**
   - Go to "Deployments" tab
   - Click "..." on latest deployment
   - Click "Redeploy"

### Option 2: Use Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to web directory
cd web

# Deploy from web directory
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? Yes (select your project)
```

### Option 3: Update vercel.json (Alternative)

If you want to keep vercel.json in root, use this configuration:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "web/package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "web/$1"
    }
  ]
}
```

But **Option 1 (Root Directory)** is the simplest and recommended approach.

---

## Quick Fix Summary

**The easiest solution:**
1. Go to Vercel Dashboard → Your Project → Settings
2. Find "Root Directory" section
3. Set it to: `web`
4. Save and redeploy

That's it! Vercel will now run all commands from the `web` directory automatically.

---

## Verify Configuration

After setting root directory, your build should show:
```
Running "install" command: npm install
Running "build" command: npm run build
```

Instead of:
```
Running "install" command: cd web && npm install  ❌
```

---

## Troubleshooting

### Still getting "No such file or directory"?
- Double-check root directory is set to `web` (not `/web` or `./web`)
- Make sure you saved the settings
- Try redeploying after saving

### Build still failing?
- Check that `web/package.json` exists
- Verify `web/next.config.js` exists
- Check build logs for specific errors

