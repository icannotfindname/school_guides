# PDFs Directory

This directory contains all the PDF tutorial files for the School Guides application.

## 📍 Location

This directory is located at:
```
/school_guides/pdfs/
```

## 📚 Current PDFs

- `sample-guide.pdf` - Example tutorial demonstrating the PDF viewer
- `How Parents _can create account and_ apply Child.pdf` - Guide for parents
- `Publishing Decisions_ and_ Opening Enrolment Single.pdf` - Single enrolment guide
- `Publishing Decisions_ and_ Opening Enrolment_ Batch.pdf` - Batch enrolment guide

## ✨ Automatic PDF Detection

**NEW:** PDFs are now automatically detected! Simply add your PDF to this directory and regenerate the manifest.

## ➕ Adding New PDFs

To add a new PDF tutorial:

1. **Place your PDF file in this directory:**
   ```bash
   # Copy your PDF here
   cp /path/to/your-guide.pdf pdfs/your-guide.pdf
   ```

2. **Generate the PDF manifest:**
   ```bash
   # From the repository root
   node generate-pdf-list.js
   ```

3. **Commit your changes:**
   ```bash
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
