# Phase I Demo Video Script (90 seconds)

**Target Duration**: 90 seconds (1:30)
**Recording Tool**: OBS Studio, QuickTime, or phone camera
**Required**: Show screen with terminal + brief narration

---

## Pre-Recording Setup

1. **Clean terminal window**:
```bash
clear
cd ~/hackathon-2
```

2. **Have ready**:
   - Terminal window (large font for visibility)
   - Timer visible (90 seconds)
   - Water nearby (stay hydrated!)

3. **Practice run**: Do a full rehearsal with timer BEFORE recording

---

## Script Breakdown

### [0:00-0:15] Introduction & Hook (15 seconds)

**VISUAL**: Show project directory structure
```bash
tree -L 2 -I '__pycache__|.venv|.uv'
```

**NARRATION**:
> "Hi! This is my Phase I submission for Hackathon II: The Evolution of Todo.
> A spec-driven Python console app with ALL 5 CRUD features implemented,
> PLUS a bonus: a reusable CRUD specification generator skill worth 200 points!"

**KEY POINTS**:
- Hook: Mention bonus immediately
- Show project structure (specs, src, bonus files)

---

### [0:15-0:25] Bonus Feature - Reusable Intelligence (10 seconds)

**VISUAL**: Show skill file
```bash
cat .claude/skills/crud-spec-generator.md | head -30
```

**NARRATION**:
> "The CRUD Spec Generator automatically creates complete specifications for ANY entity.
> Here's a demo: I generated Note entity specs - 2,000 lines in 30 minutes,
> saving 95% of spec-writing time!"

**KEY POINTS**:
- Show skill file exists
- Mention generated Note specs as proof
- Emphasize time savings (95%)

---

### [0:25-0:35] Launch Application (10 seconds)

**VISUAL**: Start the app
```bash
uv run python src/main.py
```

**NARRATION**:
> "Let me show you the app in action. Clean menu with 6 options,
> all 5 CRUD features fully functional."

**KEY POINTS**:
- Show welcome banner
- Show menu (6 options)
- Professional appearance

---

### [0:35-0:50] Feature Demo - Add & View (15 seconds)

**VISUAL**: Add 2 tasks quickly

**INPUT SEQUENCE**:
```
1
Buy groceries
Milk, eggs, bread
1
Write demo script
Prepare for video recording
2
```

**NARRATION**:
> "Adding tasks with title and description - validation works perfectly.
> View shows a formatted table with status indicators, timestamps,
> and a helpful statistics summary."

**KEY POINTS**:
- Quick add (2 tasks)
- View table (formatted, indicators)
- Statistics line visible

---

### [0:50-1:05] Feature Demo - Mark Complete & Update (15 seconds)

**VISUAL**: Mark complete, then update

**INPUT SEQUENCE**:
```
5
1
3
2
Updated: Write demo script for Phase I

2
```

**NARRATION**:
> "Marking task 1 complete - see the status change from pending to done.
> Updating task 2 - just press Enter to keep current values, or type new text.
> The view updates instantly."

**KEY POINTS**:
- Toggle status (○ → ✓)
- Update feature (partial updates)
- View updated list

---

### [1:05-1:20] Feature Demo - Delete (15 seconds)

**VISUAL**: Delete with confirmation

**INPUT SEQUENCE**:
```
4
1
y
2
```

**NARRATION**:
> "Deletion requires confirmation for safety - notice the warning.
> After deleting task 1, the list updates automatically.
> ID 1 will never be reused, maintaining data integrity."

**KEY POINTS**:
- Warning displayed
- Confirmation prompt
- Safe deletion

---

### [1:20-1:30] Closing & GitHub (10 seconds)

**VISUAL**: Show GitHub repo (open browser to repo)
```bash
# Exit app first
6
```

Then open browser to: `https://github.com/YOUR_USERNAME/hackathon-2`

**NARRATION**:
> "Complete source code, specifications, and bonus feature available on GitHub.
> Built entirely through spec-driven development with Claude Code.
> Thank you!"

**KEY POINTS**:
- Show GitHub repo exists
- Mention spec-driven approach
- Professional close

---

## Alternative 90-Second Script (If Tight on Time)

### Condensed Version

**[0:00-0:10]** Intro + Bonus
> "Phase I: Todo Console App with BONUS: CRUD Spec Generator skill (+200 pts).
> Generates complete specs for any entity in 30 minutes."

**[0:10-0:20]** Launch + Add
> "Five CRUD features: Add tasks with validation..."
- Add 1 task quickly

**[0:20-0:35]** View + Mark Complete
> "View in formatted table, mark complete with status indicators..."
- View, mark complete, view again

**[0:35-0:50]** Update + Delete
> "Update with partial changes, delete with confirmation..."
- Update task, delete with confirmation

**[0:50-1:00]** Architecture
> "Clean separation: Models, Business Logic, CLI. All generated from specs."
- Show file structure: `ls -la src/`

**[1:00-1:30]** Bonus Deep Dive
> "The bonus skill: generates 5 complete CRUD specs from entity definition.
> Here's proof: Note entity specs, 2,000 lines. Usable in all future phases.
> Repo on GitHub. Thank you!"
- Show skill file, generated specs, GitHub

---

## Recording Checklist

### Before Recording
- [ ] Terminal font size readable (18pt+)
- [ ] Terminal dimensions: 80x24 minimum
- [ ] Background apps closed (notifications off)
- [ ] Timer ready
- [ ] Commands typed in text file for copy-paste
- [ ] Practiced full script 2-3 times

### During Recording
- [ ] Speak clearly and not too fast
- [ ] Show visuals clearly (pause for visibility)
- [ ] Keep energy up (you're excited about this!)
- [ ] Stay within 90 seconds

### After Recording
- [ ] Review video (audio clear? visuals readable?)
- [ ] Check duration (≤90 seconds)
- [ ] Upload to YouTube/Loom/Drive (unlisted/public)
- [ ] Copy shareable link

---

## Pro Tips

### Make It Memorable
1. **Start strong**: "PLUS a bonus worth 200 points!" (hook)
2. **Show, don't just tell**: Actually run commands, don't just talk
3. **Highlight differentiators**: Bonus feature, spec-driven, clean code
4. **End with call-to-action**: "See full code on GitHub"

### Technical Quality
1. **Clear terminal**: Dark background, light text (good contrast)
2. **Readable font**: Monaco, Fira Code, or default terminal (18pt+)
3. **Stable recording**: Don't shake camera if recording screen
4. **Good audio**: Built-in mic is fine, just minimize background noise

### Time Management
- If running over: Skip one feature (e.g., update)
- If running under: Show more of bonus feature (it's worth 200 pts!)
- Target 85 seconds, gives 5-second buffer

---

## Upload Instructions

### YouTube (Recommended)
1. Go to: https://studio.youtube.com
2. Click "Create" → "Upload video"
3. Select your video file
4. Set visibility: **Unlisted** (or Public)
5. Title: "Hackathon II - Phase I: Todo Console App + Bonus Feature"
6. Description: "Phase I submission: Spec-driven Python console app with CRUD Spec Generator bonus (+200 pts). Repo: [YOUR_GITHUB_URL]"
7. Click "Publish"
8. Copy link (format: `https://youtube.com/watch?v=...`)

### Google Drive (Alternative)
1. Upload to Drive
2. Right-click → "Get link"
3. Set: "Anyone with the link can view"
4. Copy link

### Loom (Alternative)
1. Install Loom desktop app
2. Select "Screen + Camera" or "Screen only"
3. Record
4. Copy shareable link

---

## Sample Narration (Full Script)

*[Practice speaking this out loud with timer]*

> "Hi! This is my Phase I submission for Hackathon II. A spec-driven Python console app with all five CRUD features, PLUS a bonus: a reusable CRUD specification generator skill worth 200 points!
>
> This skill automatically creates complete specifications for any entity. I generated Note entity specs as a demo - 2,000 lines in just 30 minutes, a 95% time savings!
>
> Let me show you the app in action. Clean menu with six options, all features fully functional.
>
> Adding tasks with title and description - validation works perfectly. View shows a formatted table with status indicators, timestamps, and statistics.
>
> Marking task one complete - see the status change from pending to done. Updating task two - press Enter to keep values, or type new text.
>
> Deletion requires confirmation for safety - notice the warning. After deleting, the list updates automatically. IDs are never reused.
>
> Complete source code, specifications, and bonus feature available on GitHub. Built entirely through spec-driven development with Claude Code. Thank you!"

**Word count**: ~170 words
**Speaking pace**: 110-120 words/minute
**Estimated duration**: 85-90 seconds ✓

---

## Final Check

Before uploading:
- [ ] Duration ≤ 90 seconds
- [ ] All 5 features shown (or at least 4 + bonus)
- [ ] Bonus feature mentioned prominently
- [ ] Audio is clear
- [ ] Visuals are readable
- [ ] No sensitive information visible (tokens, passwords)
- [ ] GitHub repo URL mentioned or shown

**Ready to record? Take a deep breath, practice once more, then GO! 🎬**
