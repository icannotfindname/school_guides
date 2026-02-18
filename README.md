# Foley's Guides - Interactive PDF Tutorial Library

A modern web application for hosting and viewing PDF tutorials with search functionality and automatic PDF discovery.

## 🚀 Quick Start

### Option 1: Python Server (Recommended - No Installation Needed)

```bash
python3 server.py
```

The server will start at `http://localhost:3000`

### Option 2: Node.js Server (Alternative)

If you prefer Node.js:

```bash
# First time only - install dependencies
npm install

# Start the server
npm start
```

### 3. Add PDFs and Refresh

1. Add PDF files to the `pdfs/` folder
2. Open `http://localhost:3000` in your browser
3. Click the **Refresh** button - it will automatically scan for new PDFs!

## 📍 Quick Start: Where to Put PDFs

**All PDF files go in the `pdfs/` directory** located at the root of this repository:
```
school_guides/
├── pdfs/              ← PUT YOUR PDF FILES HERE
│   ├── README.md      (Documentation)
│   └── sample-guide.pdf
├── index.html
├── app.js
├── server.js          ← Backend server with auto-scan API
└── styles.css
```

See the [pdfs/README.md](pdfs/README.md) for detailed instructions on adding PDFs.

## Features

- 📚 **Interactive PDF Viewer** - View PDFs like webpages directly in the browser
- 🔍 **Full-Text Search** - Search across all PDF content and guide titles
- 🔄 **Auto-Discovery** - Automatically detects new PDFs in the pdfs/ folder
- ✨ **New Badge** - Visual indicator for guides added in the last week
- ⌨️ **Keyboard Navigation** - Use arrow keys to navigate pages
- 🎨 **Smooth Animations** - Beautiful transitions between pages
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile devices
- 🔎 **Search-First Interface** - Prominent searchbar for easy discovery

## How to Use

1. Open `index.html` in a web browser
2. Search for topics in the search bar at the top
3. Click on any guide card at the bottom to open it
4. Navigate through pages using the Previous/Next buttons or arrow keys
5. Zoom in/out using the +/- buttons
6. Press ESC to close the PDF viewer
7. Click the **Refresh** button to check for new or updated PDFs

## Adding New PDFs

> 📂 **PDFs Location:** All PDF files must be placed in the `pdfs/` directory at the repository root.  
> See [pdfs/README.md](pdfs/README.md) for detailed documentation.

### Simple 2-Step Process

1. **Add your PDF file** to the `pdfs/` directory:
   ```bash
   cp /path/to/your-file.pdf pdfs/your-file.pdf
   ```

2. **Click the Refresh button** on the website
   - The server automatically scans the pdfs folder
   - New PDFs appear immediately with a **NEW** badge
   - No manual script needed!

That's it! The Refresh button handles everything automatically.

### What Happens When You Click Refresh?

The Refresh button:
- ✅ Scans the `pdfs/` directory for all PDF files
- ✅ Detects new files automatically
- ✅ Assigns smart icons based on filename keywords (math, science, history, etc.)
- ✅ Tracks file creation and modification dates
- ✅ Updates the display instantly
- ✅ Shows "NEW" badges for files discovered in the last 7 days

### Command Line Quick Add

```bash
# Add a PDF and it will be auto-detected on next refresh
cp /path/to/your-guide.pdf pdfs/

# That's it! Just click Refresh on the website
```

### Using GitHub (for remote updates)

If you're pushing to GitHub:

```bash
# Add your PDF
git add pdfs/your-new-guide.pdf
git commit -m "Add new guide: Your Guide Title"
git push

# Pull changes on the server
git pull

# Click Refresh button on the website - done!
```

## Hosting on GitHub Pages

To host this website on GitHub Pages:

1. Go to your repository settings on GitHub
2. Navigate to "Pages" section
3. Under "Source", select the branch (usually `main` or `master`)
4. Click "Save"
5. Your site will be available at `https://yourusername.github.io/school_guides/`

## Project Structure

```
school_guides/
├── server.py                # Python server with auto-scan API ⭐ RECOMMENDED
├── server.js                # Node.js server (alternative)
├── package.json             # Node.js dependencies (for server.js)
├── index.html               # Main HTML structure
├── styles.css               # All styling and animations
├── app.js                   # JavaScript functionality (PDF viewer, search)
├── manifest.json            # Auto-generated list of PDFs
├── generate-manifest.py     # [Optional] Standalone script for manual generation
├── generate-manifest.js     # [Optional] Standalone script for manual generation
├── pdfs/                    # Directory for PDF files
│   ├── README.md
│   └── sample-guide.pdf
└── README.md                # This file
```

## Server Architecture

The application includes two server options (choose one):

### Python Server (`server.py`) - Recommended
- ✅ No installation needed (Python is pre-installed on most systems)
- ✅ Simple and lightweight
- ✅ Zero dependencies

### Node.js Server (`server.js`) - Alternative
- Requires Node.js and npm installation
- Uses Express framework

Both servers provide the same functionality:

- **Serves static files** (HTML, CSS, JS)
- **Provides API endpoints:**
  - `GET /api/scan` - Scans pdfs folder and returns fresh manifest
  - `GET /api/manifest` - Returns current manifest
- **Auto-discovery** - The Refresh button calls `/api/scan` to detect new PDFs

### Why a Server?

Browsers cannot access the file system directly for security reasons. The server enables:
- ✅ Automatic PDF discovery
- ✅ One-click refresh functionality
- ✅ No manual script running needed
- ✅ Real-time updates

## Manifest Generator Scripts (Optional)

The legacy manifest generator scripts are still included for manual generation if needed:

**Python version**:
```bash
python3 generate-manifest.py
```

**Node.js version**:
```bash
node generate-manifest.js
```

However, with the server running, you don't need these anymore! Just click the Refresh button.

## Technologies Used

- **PDF.js** - Mozilla's PDF rendering library (loaded via CDN)
- **Vanilla JavaScript** - No frameworks needed
- **CSS3** - Modern styling with animations
- **HTML5** - Semantic markup

## Browser Support

Works on all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

## Keyboard Shortcuts

- `←/→` Arrow keys - Navigate pages
- `+/-` Keys - Zoom in/out
- `ESC` - Close PDF viewer

## Customization

### Change Colors

Edit the CSS variables in `styles.css`:

```css
:root {
    --primary-color: #4a90e2;
    --secondary-color: #357abd;
    --background: #f5f7fa;
}
```

### Change Icons

Use any emoji in the guide configuration:
- 📚 📖 📝 📄 📃 📋 📊 📈
- 🔢 ➕ ➖ ✖️ ➗ (for math)
- 🔬 🧪 ⚗️ (for science)
- 💻 ⌨️ 🖥️ (for tech)
- 🎨 🖼️ 🎭 (for arts)

## License

This project is open source and available for educational purposes.
