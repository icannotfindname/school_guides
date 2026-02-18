# 🚀 Quick Start Guide

## Start the Server

```bash
python3 server.py
```

Then open: **http://localhost:3000**

That's it! 🎉

## How to Add New PDFs

1. **Drop PDF into `pdfs/` folder**
   ```bash
   cp your-guide.pdf pdfs/
   ```

2. **Click the "Refresh" button on the website**
   
   Done! Your PDF appears automatically with a "NEW" badge.

## Common Commands

```bash
# Start server
python3 server.py

# Check what PDFs are available
ls pdfs/*.pdf

# Add a new PDF
cp /path/to/file.pdf pdfs/
```

## Troubleshooting

**Server won't start?**
- Make sure port 3000 is not in use
- Try: `python3 server.py`

**PDFs not showing?**
- Make sure PDFs are in the `pdfs/` folder
- Click the "Refresh" button on the website
- Check server is running (you should see "Server Running" message)

**"NEW" badge not showing?**
- It only appears for PDFs discovered in the last 7 days
- Clear browser cache and refresh

## What the Refresh Button Does

When you click Refresh:
- ✅ Scans `pdfs/` folder
- ✅ Finds all PDF files
- ✅ Updates the list automatically
- ✅ Shows "NEW" badge for recent additions
- ✅ No manual work needed!

---

For more details, see [README.md](README.md)
