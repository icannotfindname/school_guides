const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static(__dirname));

// Icon mapping based on keywords in filename
function getIconForFile(filename) {
    const lower = filename.toLowerCase();
    if (lower.includes('admission')) return '📄';
    if (lower.includes('math')) return '🔢';
    if (lower.includes('science')) return '🔬';
    if (lower.includes('history')) return '📜';
    if (lower.includes('english') || lower.includes('writing')) return '✍️';
    if (lower.includes('art')) return '🎨';
    if (lower.includes('music')) return '🎵';
    if (lower.includes('computer') || lower.includes('coding')) return '💻';
    if (lower.includes('guide')) return '📚';
    return '📖';
}

// Generate description from filename
function getDescriptionForFile(filename) {
    const baseName = filename.replace('.pdf', '');
    return `Guide for ${baseName}`;
}

// Generate ID from filename
function generateId(filename) {
    return filename
        .replace('.pdf', '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

// Scan pdfs directory and generate manifest
function scanPdfsDirectory() {
    const pdfsDir = path.join(__dirname, 'pdfs');
    
    if (!fs.existsSync(pdfsDir)) {
        throw new Error('pdfs directory not found');
    }

    const files = fs.readdirSync(pdfsDir);
    const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));

    const guides = pdfFiles.map(file => {
        const filePath = path.join(pdfsDir, file);
        const stats = fs.statSync(filePath);
        const baseName = file.replace('.pdf', '');
        
        return {
            id: generateId(file),
            title: baseName,
            description: getDescriptionForFile(file),
            file: `pdfs/${file}`,
            icon: getIconForFile(file),
            dateAdded: stats.birthtime.toISOString(),
            dateModified: stats.mtime.toISOString()
        };
    });

    // Sort by title
    guides.sort((a, b) => a.title.localeCompare(b.title));

    return {
        lastUpdated: new Date().toISOString(),
        guides: guides
    };
}

// API endpoint to scan and return manifest
app.get('/api/scan', (req, res) => {
    try {
        const manifest = scanPdfsDirectory();
        
        // Also save to manifest.json file
        const manifestPath = path.join(__dirname, 'manifest.json');
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
        
        console.log(`✓ Scanned and found ${manifest.guides.length} guides`);
        res.json(manifest);
    } catch (error) {
        console.error('Error scanning pdfs:', error);
        res.status(500).json({ error: error.message });
    }
});

// API endpoint to get current manifest
app.get('/api/manifest', (req, res) => {
    try {
        const manifestPath = path.join(__dirname, 'manifest.json');
        
        if (fs.existsSync(manifestPath)) {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            res.json(manifest);
        } else {
            // If manifest doesn't exist, scan and create it
            const manifest = scanPdfsDirectory();
            fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
            res.json(manifest);
        }
    } catch (error) {
        console.error('Error reading manifest:', error);
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`
🚀 School Guides Server Running!
   
   Local:            http://localhost:${PORT}
   
   📚 Open the above URL in your browser
   🔄 Click "Refresh" button to auto-scan pdfs folder
   
   Press Ctrl+C to stop the server
    `);
});
