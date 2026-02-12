# Foley's Guides - Interactive PDF Tutorial Library

A modern web application for hosting and viewing PDF tutorials with search functionality and smooth page transitions.

## 📍 Quick Start: Where to Put PDFs

**All PDF files go in the `pdfs/` directory** located at the root of this repository:
```
school_guides/
├── pdfs/              ← PUT YOUR PDF FILES HERE
│   ├── README.md      (Documentation)
│   └── sample-guide.pdf
├── index.html
├── app.js
└── styles.css
```

See the [pdfs/README.md](pdfs/README.md) for detailed instructions on adding PDFs.

## Features

- 📚 **Interactive PDF Viewer** - View PDFs like webpages directly in the browser
- 🔍 **Full-Text Search** - Search across all PDF content and guide titles
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

## Adding New PDFs

> 📂 **PDFs Location:** All PDF files must be placed in the `pdfs/` directory at the repository root.  
> See [pdfs/README.md](pdfs/README.md) for detailed documentation.

### Step 1: Add Your PDF File

Place your PDF file in the `pdfs/` directory (located at the root of this repository):
```
pdfs/
├── sample-guide.pdf
├── your-new-guide.pdf
└── another-guide.pdf
```

**Using command line:**
```bash
# From the repository root
cp /path/to/your-file.pdf pdfs/your-file.pdf
```

**Using GitHub web interface:**
1. Navigate to the `pdfs/` folder in GitHub
2. Click "Add file" → "Upload files"
3. Upload your PDF files

### Step 2: Register the PDF

Edit `app.js` and add a new entry to the `guides` array:

```javascript
const guides = [
    {
        id: 'sample-guide',
        title: 'Sample Tutorial Guide',
        description: 'An example guide to demonstrate the PDF viewer',
        file: 'pdfs/sample-guide.pdf',
        icon: '📚'
    },
    {
        id: 'your-new-guide',
        title: 'Your Guide Title',
        description: 'Brief description of your guide',
        file: 'pdfs/your-new-guide.pdf',
        icon: '📖'  // Choose any emoji
    }
];
```

### Step 3: Commit to GitHub

```bash
git add pdfs/your-new-guide.pdf app.js
git commit -m "Add new guide: Your Guide Title"
git push
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
├── index.html          # Main HTML structure
├── styles.css          # All styling and animations
├── app.js             # JavaScript functionality (PDF viewer, search)
├── pdfs/              # Directory for PDF files
│   └── sample-guide.pdf
└── README.md          # This file
```

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
