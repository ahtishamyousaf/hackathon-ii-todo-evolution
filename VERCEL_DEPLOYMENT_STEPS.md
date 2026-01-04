# Vercel Deployment - Step-by-Step Guide

## 🚀 Deploy Frontend to Vercel

### Step 1: Import Repository (2 minutes)

1. Open **https://vercel.com/new** in your browser
2. Sign in with GitHub (if not already)
3. Click **"Import Git Repository"**
4. Find and select: **`hackathon-ii-todo-evolution`**
5. Click **"Import"**

---

### Step 2: Configure Project (3 minutes)

You'll see the configuration screen. Set these **CRITICAL** settings:

#### **Framework Preset**
- Should auto-detect as: **Next.js**
- If not, select: **Next.js** from dropdown

#### **Root Directory** (CRITICAL!)
```
phase-2-web/frontend
```
⚠️ **Must include this!** Click "Edit" next to Root Directory and enter exactly:
```
phase-2-web/frontend
```

#### **Build Settings** (Usually Auto-detected)
- **Build Command:** `npm run build` (default, should auto-fill)
- **Output Directory:** `.next` (default, should auto-fill)
- **Install Command:** `npm install` (default, should auto-fill)

---

### Step 3: Add Environment Variables (5 minutes)

Click **"Environment Variables"** section and add these **3 required variables**:

#### **Variable 1: DATABASE_URL**
```
Key: DATABASE_URL
Value: <your-neon-postgres-connection-string>
```

**Where to get it:**
- Go to your Neon dashboard (https://console.neon.tech)
- Copy the connection string (starts with `postgresql://`)
- Should look like: `postgresql://user:password@host/dbname?sslmode=require`

#### **Variable 2: BETTER_AUTH_SECRET**
```
Key: BETTER_AUTH_SECRET
Value: <generate-new-secret>
```

**How to generate:**
Run this in your terminal:
```bash
openssl rand -hex 32
```
Copy the output and paste as the value.

#### **Variable 3: NEXT_PUBLIC_API_URL**
```
Key: NEXT_PUBLIC_API_URL
Value: http://localhost:8000
```

⚠️ **Note:** We'll update this after deploying the backend. For now, use `http://localhost:8000`

---

### Step 4: Deploy! (5-10 minutes)

1. Review your settings:
   - ✅ Root Directory: `phase-2-web/frontend`
   - ✅ Framework: Next.js
   - ✅ 3 Environment Variables added

2. Click **"Deploy"**

3. Vercel will:
   - Clone your repository
   - Install dependencies
   - Build the Next.js app
   - Deploy to production

4. **Watch the build logs** for any errors

---

### Step 5: Get Your Production URL (1 minute)

Once deployment completes:

1. Copy your production URL (e.g., `https://your-app-name.vercel.app`)
2. **Save this URL** - you'll need it for:
   - Backend CORS configuration
   - ChatKit domain allowlist (later)

---

## ✅ Verification Checklist

After deployment, test your site:

1. Visit your Vercel URL
2. ✅ Site loads (should show landing page)
3. ✅ Can navigate to `/login`
4. ✅ Can navigate to `/register`

⚠️ **Expected at this point:**
- ✅ Frontend loads
- ❌ Login/Register won't work yet (backend not deployed)
- ❌ API calls will fail (backend not deployed)

**This is normal!** We'll deploy the backend next.

---

## 🐛 Common Issues

### Issue: "Build Failed" Error

**Check build logs for:**

**Error: "Module not found"**
- Solution: Make sure all dependencies are in `package.json`
- Run locally: `npm install && npm run build`

**Error: "Invalid root directory"**
- Solution: Verify Root Directory is exactly: `phase-2-web/frontend`
- No leading/trailing slashes

**Error: TypeScript errors**
- Solution: Fix TypeScript errors locally first
- Run: `npx tsc --noEmit` to check

### Issue: "Environment Variable Not Found"

Make sure you added all 3 variables:
- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `NEXT_PUBLIC_API_URL`

Click "Redeploy" after adding missing variables.

### Issue: "Database Connection Failed"

- Verify `DATABASE_URL` is correct
- Check Neon database is not paused
- Ensure connection string includes `?sslmode=require`

---

## 📝 After Successful Deployment

**Save these for next step:**
1. ✅ Vercel Production URL: `https://________.vercel.app`
2. ✅ BETTER_AUTH_SECRET: `(the hex string you generated)`

**You'll need them for backend deployment!**

---

## 🎯 Next Step

Once frontend is deployed:
1. ✅ Save your Vercel URL
2. ➡️ Deploy backend to Railway/Render
3. ➡️ Update `NEXT_PUBLIC_API_URL` with backend URL
4. ➡️ Test full application

---

**Need help?** Check the build logs in Vercel dashboard for specific errors.

**Ready for backend deployment?** Let me know when frontend is live!
