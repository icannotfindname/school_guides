# Deployment Guide

This application works in three environments with **full refresh functionality everywhere**:
1. **Local development with server** (API-based refresh)
2. **GitHub Pages** (GitHub Actions auto-update + smart cache refresh)
3. **Vercel** (Smart cache refresh)

## 🎯 Refresh Button Works Everywhere!

The refresh button uses a **3-tier strategy**:

1. **Try local API** (`/api/scan`) - If server running locally
2. **Cache-bust manifest.json** - Works on GitHub/Vercel
3. **Hard page reload** - Last resort fallback

---

## Local Development (Full Features)

Run the Python server for auto-scanning PDFs:

```bash
python3 server.py
```

Visit: http://localhost:8080

**Features:**
- ✅ Automatic PDF scanning via API
- ✅ Refresh button calls `/api/scan`
- ✅ No manual manifest updates needed

---

## Deploy to GitHub Pages

### 1. Prepare Repository

Make sure `manifest.json` is up to date:

```bash
python3 generate-manifest.py
```

### 2. Commit Files (including GitHub Actions)

```bash
git add .
git commit -m "Deploy to GitHub Pages with auto-manifest"
git push origin main
```

### 3. Enable GitHub Pages

1. Go to your repository settings
2. Navigate to **Pages** section
3. Select branch: `main`
4. Select folder: `/ (root)`
5. Click **Save**

### 4. Access Your Site

Your site will be available at:
```
https://YOUR_USERNAME.github.io/REPO_NAME/
```

### 5. Automatic Manifest Updates 🤖

GitHub Actions will automatically:
- Run when you push PDFs to `pdfs/` folder
- Regenerate `manifest.json`
- Commit changes automatically

**Manual trigger:** Go to Actions tab → "Update Manifest" → "Run workflow"

---

## Deploy to Vercel

### 1. Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### 2. Deploy

**Via CLI:**

```bash
# First time
vercel

# Subsequent deploys
vercel --prod
```

**Via Git:**

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click **"New Project"**
4. Import your GitHub repository
5. Click **"Deploy"**

### 3. Configuration (Optional)

Create `vercel.json` for custom settings:

```json
{
  "version": 2,
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

---

## Adding New PDFs

### Local Development
1. Add PDF files to `pdfs/` folder
2. Click the **Refresh** button in the app
3. Server automatically scans and updates ✨

### GitHub Pages
1. Add PDF files to `pdfs/` folder
2. Commit and push:
   ```bash
   git add pdfs/
   git commit -m "Add new PDFs"
   git push
   ```
3. **GitHub Actions automatically runs** and updates `manifest.json`
4. Click **Refresh** button in app (cache-bust reload)

**Or manually:**
```bash
python3 generate-manifest.py
git add manifest.json
git commit -m "Update manifest"
git push
```

### Vercel
1. Add PDF files to `pdfs/` folder
2. Run: `python3 generate-manifest.py`
3. Commit and push:
   ```bash
   git add pdfs/ manifest.json
   git commit -m "Add new PDFs"
   git push
   ```
4. Vercel auto-deploys
5. Click **Refresh** button in app

---

## How Refresh Button Works

### 🔄 3-Tier Smart Refresh Strategy

```
┌─────────────────┐
│ Click Refresh   │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│ Try /api/scan       │ ← Local server
└────────┬────────────┘
         │ Failed
         ▼
┌─────────────────────┐
│ manifest.json?v=... │ ← Cache bust (GitHub/Vercel)
└────────┬────────────┘
         │ Failed
         ▼
┌─────────────────────┐
│ Hard page reload    │ ← Last resort
└─────────────────────┘
```

**On GitHub Pages:**
- Refresh detects new/changed PDFs (if manifest updated)
- Shows smart notification: "Found 2 new guide(s)!"

**On Vercel:**
- Same cache-busting strategy
- Works instantly after deploy

**Locally:**
- Direct API call to scan filesystem
- Fastest and most accurate

---

## GitHub Actions Workflow

The workflow automatically:

**Triggers on:**
- Any push to `pdfs/` folder
- Manual run via "Actions" tab

**Does:**
1. Checks out code
2. Runs `generate-manifest.py`
3. Commits `manifest.json` if changed
4. Pushes to repository

**To manually trigger:**
1. Go to repo → **Actions** tab
2. Click **"Update Manifest"**
3. Click **"Run workflow"**

---

## Environment Detection

The app automatically detects which environment it's running in:

- **Local server**: Uses `/api/scan` endpoint
- **Static hosting**: Cache-busts `manifest.json`
- **Offline/Error**: Hard reloads page

No configuration needed! 🎉

---

## Troubleshooting

### Refresh button not finding new PDFs on GitHub Pages

1. Check if GitHub Action ran successfully (Actions tab)
2. Verify `manifest.json` was updated in repository
3. Try manual workflow trigger
4. Hard refresh browser: Ctrl+Shift+R (Cmd+Shift+R on Mac)

### GitHub Action not running

1. Check `.github/workflows/update-manifest.yml` exists
2. Verify Actions are enabled in repo settings
3. Check workflow permissions in Settings → Actions

### PDFs not loading

1. Verify PDF filenames in `manifest.json` match actual files
2. Check browser console for errors
3. Regenerate manifest: `python3 generate-manifest.py`
