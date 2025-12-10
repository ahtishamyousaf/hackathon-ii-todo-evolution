# GitHub Setup & Push Instructions

**Time Estimate**: 5 minutes
**Goal**: Create repo, push all commits, verify online

---

## Step 1: Create GitHub Repository (2 minutes)

### Option A: Via GitHub Website (Recommended)

1. **Go to GitHub**: https://github.com
2. **Sign in** (or create account if needed)
3. **Click "+" icon** (top-right) → "New repository"
4. **Repository settings**:
   - **Name**: `hackathon-2` (or `hackathon-2-phase-1`)
   - **Description**: "Hackathon II Phase I: Spec-Driven Todo Console App with CRUD Spec Generator Bonus (+200 pts)"
   - **Visibility**: ✅ **Public** (required for hackathon)
   - **Initialize**: ❌ **DO NOT** add README, .gitignore, or license (we have these)
5. **Click "Create repository"**

### Option B: Via GitHub CLI (If installed)

```bash
gh repo create hackathon-2 --public --description "Hackathon II Phase I: Todo Console App + Bonus" --source=. --remote=origin --push
```

---

## Step 2: Connect Local Repo to GitHub (1 minute)

**Copy the commands from GitHub** (shown after repo creation), or use these:

```bash
# Verify current directory
pwd
# Should show: /home/ahtisham/hackathon-2

# Add GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/hackathon-2.git

# Verify remote added
git remote -v
# Should show:
# origin  https://github.com/YOUR_USERNAME/hackathon-2.git (fetch)
# origin  https://github.com/YOUR_USERNAME/hackathon-2.git (push)
```

**Replace `YOUR_USERNAME`** with your actual GitHub username!

---

## Step 3: Push All Commits (1 minute)

```bash
# Push to GitHub (main/master branch)
git push -u origin master

# If your default branch is 'main', use:
# git push -u origin main
```

**Expected output**:
```
Enumerating objects: 56, done.
Counting objects: 100% (56/56), done.
Delta compression using up to 8 threads
Compressing objects: 100% (48/48), done.
Writing objects: 100% (56/56), 145.23 KiB | 7.26 MiB/s, done.
Total 56 (delta 5), reused 0 (delta 0)
To https://github.com/YOUR_USERNAME/hackathon-2.git
 * [new branch]      master -> master
Branch 'master' set up to track remote branch 'master' from 'origin'.
```

**3 commits pushed**:
- c4097d9: Phase I specifications (9,583 insertions)
- d07ea47: Phase I implementation (643 insertions)
- 5db8d52: Bonus feature (1,858 insertions)

---

## Step 4: Verify on GitHub (1 minute)

1. **Open repo in browser**: `https://github.com/YOUR_USERNAME/hackathon-2`

2. **Verify files visible**:
   - ✅ `README.md` (displays on homepage)
   - ✅ `CLAUDE.md`
   - ✅ `constitution.md`
   - ✅ `BONUS_FEATURE.md`
   - ✅ `specs/` directory with all specs
   - ✅ `src/` directory with implementation
   - ✅ `.claude/skills/` with CRUD generator

3. **Check commits**:
   - Click "commits" or "X commits" link
   - Should see 3 commits:
     - "Bonus: Reusable Intelligence..." (latest)
     - "Phase I: Implement all 5 core features"
     - "Phase I: Complete specifications and documentation" (first)

4. **Check README renders properly**:
   - Should see formatted markdown
   - Bonus feature section visible
   - Installation instructions clear

---

## Step 5: Copy Repository URL

**You'll need this for submission!**

**Format**: `https://github.com/YOUR_USERNAME/hackathon-2`

**Example**: `https://github.com/ahtisham/hackathon-2`

Copy this URL - you'll paste it in the Google Form!

---

## Troubleshooting

### Issue: "remote origin already exists"

**Solution**: Remove and re-add
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/hackathon-2.git
```

---

### Issue: Authentication required (Username/Password)

**GitHub no longer accepts password authentication!**

**Solution 1: Use Personal Access Token (PAT)**

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Select scopes: ✅ `repo` (all)
4. Click "Generate token"
5. **COPY TOKEN** (you won't see it again!)
6. When pushing, use:
   - Username: YOUR_USERNAME
   - Password: PASTE_YOUR_TOKEN

**Solution 2: Use SSH (if you have SSH keys set up)**

```bash
# Use SSH URL instead
git remote set-url origin git@github.com:YOUR_USERNAME/hackathon-2.git
git push -u origin master
```

**Solution 3: Use GitHub CLI (easiest)**

```bash
# Install GitHub CLI first
# Then authenticate:
gh auth login

# Push will work automatically after authentication
```

---

### Issue: Branch name mismatch (main vs master)

**Check current branch**:
```bash
git branch
# Shows: * master
```

**If GitHub expects 'main' but you have 'master'**:

**Option A**: Rename local branch
```bash
git branch -M main
git push -u origin main
```

**Option B**: Push master to master
```bash
git push -u origin master
```

---

### Issue: Large files warning

**This should NOT happen** (no large files in Phase I)

If it does:
1. Check what's large: `du -sh * | sort -h`
2. Likely `.venv` or cache - already in `.gitignore`
3. Verify `.gitignore` is committed
4. Clean cache: `git rm -r --cached .venv`

---

## Final Verification Checklist

Before moving to submission:

- [ ] Repository is **Public** (not private!)
- [ ] All 3 commits visible on GitHub
- [ ] README.md displays correctly with bonus section
- [ ] `specs/` directory visible with all 7 specs + note specs
- [ ] `src/` directory visible with all 5 Python files
- [ ] `.claude/skills/crud-spec-generator.md` visible
- [ ] `BONUS_FEATURE.md` visible
- [ ] Repository URL copied (you'll need it!)

---

## What Judges Will See

When judges visit your repo, they'll see:

### Homepage (README.md)
```
# Todo Console App - Phase I

[Project description]

## Features
- 5 core features listed
- ✨ Bonus Feature: Reusable Intelligence (+200 points) ✨
  - CRUD Spec Generator explanation
  - Usage example
  - Demo link

## Installation
[Clear instructions with uv]

## Usage
[Examples of all 5 features]
```

### File Structure
```
hackathon-2/
├── README.md ⭐ (First impression)
├── CLAUDE.md ⭐ (Shows spec-driven approach)
├── constitution.md ⭐ (Shows principles)
├── BONUS_FEATURE.md ⭐ (Bonus justification)
├── specs/ ⭐ (All specifications)
│   ├── overview.md
│   ├── architecture.md
│   ├── features/ (5 task specs)
│   └── note/features/ (2 bonus demo specs)
├── src/ ⭐ (Implementation)
│   ├── models.py
│   ├── task_manager.py
│   ├── cli.py
│   └── main.py
├── .claude/skills/ ⭐ (Bonus skill)
│   └── crud-spec-generator.md
├── history/prompts/ (PHRs)
└── pyproject.toml
```

### Commit History
```
3 commits showing clear progression:
1. Specifications first (spec-driven ✓)
2. Implementation from specs (code generation ✓)
3. Bonus feature added (extra value ✓)
```

---

## Optional: Enhance Repository

### Add Topics (Tags)

On GitHub repo page:
1. Click ⚙️ (settings icon) next to "About"
2. Add topics: `hackathon`, `spec-driven-development`, `claude-code`, `python`, `todo-app`, `crud-generator`
3. Save

### Update Description

Click ⚙️ → Add description:
> "Phase I: Spec-driven Python console app with 5 CRUD features + Reusable Intelligence bonus (CRUD Spec Generator skill, +200 pts). Built with Claude Code following Spec-Driven Development."

---

## Next Step

✅ **Repository is live!**

**Copy your repo URL**: `https://github.com/YOUR_USERNAME/hackathon-2`

**Next**: Record demo video (see `DEMO_SCRIPT.md`)

---

## Quick Reference

```bash
# Complete push sequence (copy-paste ready)
git remote add origin https://github.com/YOUR_USERNAME/hackathon-2.git
git push -u origin master

# Verify commits
git log --oneline

# Check what's staged
git status

# View remote
git remote -v
```

**Remember**: Replace `YOUR_USERNAME` with your actual GitHub username!
