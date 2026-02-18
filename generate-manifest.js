#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const pdfsDir = path.join(__dirname, 'pdfs');
const manifestPath = path.join(__dirname, 'manifest.json');

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

// Scan pdfs directory
function scanPdfsDirectory() {
    try {
        if (!fs.existsSync(pdfsDir)) {
            console.error('pdfs directory not found!');
            process.exit(1);
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

        const manifest = {
            lastUpdated: new Date().toISOString(),
            guides: guides
        };

        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
        console.log(`✓ Generated manifest with ${guides.length} guides`);
        console.log(`✓ Manifest saved to ${manifestPath}`);

        return manifest;
    } catch (error) {
        console.error('Error generating manifest:', error);
        process.exit(1);
    }
}

// Run the scan
scanPdfsDirectory();
