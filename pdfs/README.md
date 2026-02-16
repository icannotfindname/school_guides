# PDFs Directory

This directory contains all the PDF tutorial files for the School Guides application.

## 📍 Location

This directory is located at:
```
/school_guides/pdfs/
```

## 📚 Current PDFs

- `How Parents _can create account and_ apply Child.pdf` - Guide for parents
- `Publishing Decisions_ and_ Opening Enrolment Single.pdf` - Single enrolment guide
- `Publishing Decisions_ and_ Opening Enrolment_ Batch-1.pdf` - Batch enrolment guide

## ✨ Automatic PDF Detection

**NEW:** PDFs are now automatically discovered when you open the webapp! 🎉

- **Local development:** Simply add PDFs to this directory and refresh the page
- **GitHub Pages:** Commit your PDFs and they'll appear automatically on your site

No need to run `node generate-pdf-list.js` for local development anymore!

## ➕ Adding New PDFs

To add a new PDF tutorial:

1. **Place your PDF file in this directory:**
   ```bash
   # Copy your PDF here
   cp /path/to/your-guide.pdf pdfs/your-guide.pdf
   ```

2. **For local development:** Just refresh the page - PDFs are auto-discovered!

3. **For GitHub Pages (optional):** Regenerate the manifest and commit:
   ```bash
   # From the repository root
   node generate-pdf-list.js
   git add pdfs/your-guide.pdf pdf-manifest.json
   git commit -m "Add new guide: Your Guide Title"
   git push
   ```

### Optional: Manual Configuration

For custom titles, descriptions, or icons, you can still manually add entries to the `manualGuides` array in `app.js`. Manual entries take precedence over auto-detected PDFs.

## 📝 File Naming Guidelines

- Use lowercase letters and hyphens for file names
- Keep names descriptive but concise
- Examples: `math-101.pdf`, `python-basics.pdf`, `web-design-intro.pdf`

## 🔗 Path Reference

When registering PDFs in `app.js`, always use the relative path:
```javascript
file: 'pdfs/your-filename.pdf'
```

## ⚠️ Important Notes

- PDF files should be committed to the repository
- Maximum recommended file size: 10MB per PDF
- Ensure PDFs are not password-protected
- PDFs will be indexed for search functionality when the app loads

## 🔧 Troubleshooting

### PDFs Auto-Discovered! 🎉

**Good news:** The webapp now automatically discovers PDFs when you open it!

- **Local development:** New PDFs appear immediately when you refresh
- **GitHub Pages:** Commit your PDFs and they're available on your site

### Optional: Manual Manifest Update (GitHub Pages)

For static hosting like GitHub Pages, you can optionally regenerate the manifest:

```bash
# From the repository root (school_guides/)
node generate-pdf-list.js
git add pdf-manifest.json
git commit -m "Update PDF manifest"
git push
```

**Note:** This is optional for local development since PDFs are automatically discovered.

### When to Regenerate the Manifest (Optional)

For GitHub Pages deployment, consider regenerating after:
- ✅ Adding new PDFs to this directory
- ✅ Removing PDFs from this directory
- ✅ Renaming PDF files
- ✅ Replacing existing PDFs with new versions

### Quick Check

To verify your PDFs are detected:

```bash
# From repository root
ls -lh pdfs/*.pdf
```

## 🌐 GitHub Storage

All PDFs in this directory are:
- ✅ Stored in GitHub repository
- ✅ Served via GitHub Pages (when enabled)
- ✅ Accessible to all visitors
- ✅ Searchable through the web interface

## 📊 Current Storage

To check the size of PDFs:
```bash
du -h pdfs/
```

To list all PDFs:
```bash
ls -lh pdfs/*.pdf
```
