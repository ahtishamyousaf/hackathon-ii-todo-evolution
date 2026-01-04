# Vercel Deployment Guide

## Status: Ready for Deployment ✅

All ChatKit references have been removed. The application is clean and ready to deploy.

## Prerequisites

1. ✅ GitHub repository
2. ✅ Vercel account (https://vercel.com)
3. ✅ Neon PostgreSQL database (already configured)
4. ⏳ OpenAI API key (for ChatKit after deployment)

## Step 1: Push to GitHub

```bash
git push origin 006-ai-chatbot
```

## Step 2: Deploy Frontend to Vercel

### Option A: Vercel Dashboard (Recommended)

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. **Framework Preset**: Next.js (auto-detected)
4. **Root Directory**: `phase-2-web/frontend`
5. Click "Deploy"

### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend
cd phase-2-web/frontend

# Deploy
vercel --prod
```

## Step 3: Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

### Required Variables

```bash
# Database (Better Auth)
DATABASE_URL=<your-neon-postgres-url>

# Better Auth Secret
BETTER_AUTH_SECRET=<generate-with-openssl-rand-hex-32>

# Backend API URL (will update after backend deployment)
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

### Generate Better Auth Secret

```bash
openssl rand -hex 32
```

## Step 4: Deploy Backend

### Recommended: Railway.app (Python-friendly)

1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select your repository
4. **Root Directory**: `phase-2-web/backend`
5. Add Environment Variables:
   ```bash
   DATABASE_URL=<your-neon-postgres-url>
   SECRET_KEY=<same-as-BETTER_AUTH_SECRET>
   OPENAI_API_KEY=<your-openai-key>
   CORS_ORIGINS=https://your-vercel-app.vercel.app
   ```
6. Deploy

### Alternative: Render.com

1. Go to https://render.com
2. New Web Service
3. Connect GitHub repository
4. **Root Directory**: `phase-2-web/backend`
5. **Build Command**: `pip install -r requirements.txt`
6. **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
7. Add environment variables (same as above)

## Step 5: Update Frontend Environment Variable

After backend is deployed:

1. Copy your backend URL (e.g., `https://your-app.railway.app`)
2. Update `NEXT_PUBLIC_API_URL` in Vercel
3. Redeploy frontend (Vercel will auto-redeploy)

## Step 6: Verify Deployment

Visit your Vercel URL:

✅ Login page loads
✅ Can register new user
✅ Can login
✅ Dashboard shows tasks
✅ Can create/edit/delete tasks
✅ Can create categories

## Step 7: ChatKit Setup (After Deployment)

### Get Production URL

Your frontend URL will be: `https://your-app-name.vercel.app`

### Configure Domain Allowlist

1. Go to https://platform.openai.com/settings/organization/security/domain-allowlist
2. Click "Add domain"
3. Enter: `https://your-app-name.vercel.app`
4. Copy the domain key provided

### Add ChatKit Environment Variable

In Vercel → Environment Variables:

```bash
NEXT_PUBLIC_CHATKIT_DOMAIN_KEY=<your-domain-key>
```

### Re-implement ChatKit

After domain allowlist is set up:

```bash
# Install ChatKit
npm install @openai/chatkit-react

# Create chat page following the contestant's guide
# See: phase-2-web/frontend/specs/007-openai-chatkit-integration/
```

## Deployment Checklist

### Frontend (Vercel)
- [ ] Repository connected
- [ ] Root directory set to `phase-2-web/frontend`
- [ ] `DATABASE_URL` configured
- [ ] `BETTER_AUTH_SECRET` configured
- [ ] `NEXT_PUBLIC_API_URL` configured
- [ ] Deployment successful
- [ ] Site loads and works

### Backend (Railway/Render)
- [ ] Repository connected
- [ ] Root directory set to `phase-2-web/backend`
- [ ] `DATABASE_URL` configured
- [ ] `SECRET_KEY` configured
- [ ] `OPENAI_API_KEY` configured
- [ ] `CORS_ORIGINS` configured
- [ ] Deployment successful
- [ ] `/health` endpoint returns 200

### Database (Neon)
- [ ] Database URL copied
- [ ] Tables created (Better Auth will auto-create)
- [ ] Connection works from both frontend and backend

### ChatKit (Post-Deployment)
- [ ] Domain added to OpenAI allowlist
- [ ] Domain key obtained
- [ ] `NEXT_PUBLIC_CHATKIT_DOMAIN_KEY` configured
- [ ] ChatKit package installed
- [ ] Chat page created
- [ ] Chat works end-to-end

## Troubleshooting

### Build Fails on Vercel

**Check:**
- Root directory is `phase-2-web/frontend`
- All dependencies are in `package.json`
- No TypeScript errors: `npm run build` locally

### Backend 500 Errors

**Check:**
- `DATABASE_URL` is correct
- `CORS_ORIGINS` includes your Vercel URL
- Backend logs for specific errors

### Authentication Not Working

**Check:**
- `DATABASE_URL` is the same in both frontend and backend
- `BETTER_AUTH_SECRET` and `SECRET_KEY` match
- Better Auth tables exist in database

### ChatKit Not Loading

**Check:**
- Domain allowlist includes exact URL (no trailing slash)
- `NEXT_PUBLIC_CHATKIT_DOMAIN_KEY` is set
- Wait 5 minutes after adding domain (propagation time)
- Hard refresh browser (Ctrl+Shift+R)

## Next Steps After Deployment

1. ✅ Verify all features work in production
2. ✅ Set up domain allowlist for ChatKit
3. ✅ Re-implement ChatKit with proper domain key
4. ✅ Test ChatKit integration end-to-end
5. ✅ Submit hackathon project!

---

**Generated with Claude Code**
