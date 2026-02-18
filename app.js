// Configuration - List of available PDF guides (loaded dynamically)
let guides = [];
const NEW_BADGE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Global variables
let currentPdf = null;
let currentPage = 1;
let totalPages = 0;
let pdfScale = 1.5;
let searchIndex = [];
let seenGuides = {}; // Track when guides were first seen

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    loadSeenGuides();
    await loadGuidesFromManifest();
    initializeSearch();
    initializePdfViewer();
    initializeRefreshButton();
    buildSearchIndex();
});

// Load guides from manifest.json
async function loadGuidesFromManifest(forceRefresh = false) {
    try {
        let manifest;
        let usedApi = false;
        
        // Try API endpoints first (for local development with server)
        if (forceRefresh) {
            try {
                const response = await fetch('/api/scan', { cache: 'no-store' });
                if (response.ok) {
                    manifest = await response.json();
                    guides = manifest.guides || [];
                    usedApi = true;
                    trackAndLoadGuides();
                    showNotification('Guides refreshed successfully! Found ' + guides.length + ' guide(s).', 'success');
                    return;
                }
            } catch (e) {
                console.log('API not available, using static manifest.json');
            }
        }
        
        // Fall back to static manifest.json (works on GitHub Pages/Vercel)
        const cacheParam = forceRefresh ? '?t=' + Date.now() : '';
        const response = await fetch('manifest.json' + cacheParam);
        if (!response.ok) {
            throw new Error('Failed to fetch manifest.json');
        }
        
        manifest = await response.json();
        guides = manifest.guides || [];
        trackAndLoadGuides();
        
        if (forceRefresh) {
            showNotification('Refreshed from manifest.json (' + guides.length + ' guide(s)). Running local server enables auto-scan.', 'info');
        }
    } catch (error) {
        console.error('Error loading manifest:', error);
        showNotification('Could not load guides. Please check that manifest.json exists.', 'error');
    }
}

// Helper function to track and load guides
function trackAndLoadGuides() {
    // Track new guides
    guides.forEach(guide => {
        if (!seenGuides[guide.id]) {
            seenGuides[guide.id] = Date.now();
        }
        // Check if guide is new (within last week)
        guide.isNew = isGuideNew(guide.id);
    });
    
    saveSeenGuides();
    loadGuides();
}

// Load seen guides from localStorage
function loadSeenGuides() {
    try {
        const stored = localStorage.getItem('seenGuides');
        if (stored) {
            seenGuides = JSON.parse(stored);
        }
    } catch (error) {
        console.error('Error loading seen guides:', error);
        seenGuides = {};
    }
}

// Save seen guides to localStorage
function saveSeenGuides() {
    try {
        localStorage.setItem('seenGuides', JSON.stringify(seenGuides));
    } catch (error) {
        console.error('Error saving seen guides:', error);
    }
}

// Check if a guide is new (seen within last week)
function isGuideNew(guideId) {
    if (!seenGuides[guideId]) return true;
    const timeSeen = seenGuides[guideId];
    return (Date.now() - timeSeen) < NEW_BADGE_DURATION;
}

// Initialize refresh button
function initializeRefreshButton() {
    const refreshBtn = document.getElementById('refreshBtn');
    refreshBtn.addEventListener('click', async () => {
        refreshBtn.classList.add('spinning');
        refreshBtn.disabled = true;
        
        try {
            await smartRefresh();
        } catch (error) {
            console.error('Refresh error:', error);
            showNotification('Failed to refresh guides.', 'error');
        } finally {
            setTimeout(() => {
                refreshBtn.classList.remove('spinning');
                refreshBtn.disabled = false;
            }, 500);
        }
    });
}

// Smart refresh - tries multiple strategies
async function smartRefresh() {
    // Strategy 1: Try local API scan (auto-generates manifest.json from pdfs folder)
    try {
        const response = await fetch('/api/scan', { cache: 'no-store' });
        if (response.ok) {
            const manifest = await response.json();
            const oldCount = guides.length;
            guides = manifest.guides || [];
            trackAndLoadGuides();
            await buildSearchIndex();
            const newCount = guides.length;
            
            let message = `✓ Scanned pdfs/ folder & saved manifest.json! Found ${newCount} guide(s).`;
            if (newCount > oldCount) {
                message = `✓ Found ${newCount - oldCount} new guide(s)! Total: ${newCount}`;
            } else if (newCount < oldCount) {
                message = `✓ Removed ${oldCount - newCount} guide(s). Total: ${newCount}`;
            }
            showNotification(message, 'success');
            return;
        }
    } catch (e) {
        console.log('Local API not available, trying manifest...');
    }
    
    // Strategy 2: Force reload manifest.json with aggressive cache busting
    try {
        // Use multiple cache-busting techniques
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(7);
        
        const response = await fetch(`manifest.json?v=${timestamp}&r=${randomStr}`, { 
            cache: 'no-store',
            headers: { 
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
        
        if (response.ok) {
            const manifest = await response.json();
            const oldCount = guides.length;
            guides = manifest.guides || [];
            const newCount = guides.length;
            
            trackAndLoadGuides();
            await buildSearchIndex();
            
            if (newCount > oldCount) {
                showNotification(`✓ Found ${newCount - oldCount} new guide(s)! Total: ${newCount}`, 'success');
            } else if (newCount < oldCount) {
                showNotification(`✓ Removed ${oldCount - newCount} guide(s). Total: ${newCount}`, 'success');
            } else {
                showNotification(`✓ Refreshed. ${newCount} guide(s) available.`, 'info');
            }
            return;
        }
    } catch (e) {
        console.error('Manifest refresh failed:', e);
    }
    
    // Strategy 3: Hard reload page (last resort)
    showNotification('Performing full page refresh...', 'info');
    setTimeout(() => {
        window.location.reload(true);
    }, 1000);
}

// Load guide cards into the grid
function loadGuides() {
    const guidesGrid = document.getElementById('guidesGrid');
    guidesGrid.innerHTML = '';
    
    if (guides.length === 0) {
        guidesGrid.innerHTML = '<p class="no-guides">No guides available. Add PDF files to the pdfs/ folder and click Refresh.</p>';
        return;
    }
    
    guides.forEach(guide => {
        const card = document.createElement('div');
        card.className = 'guide-card';
        
        const newBadge = guide.isNew ? '<span class="new-badge">NEW</span>' : '';
        
        card.innerHTML = `
            ${newBadge}
            <div class="guide-icon">${guide.icon}</div>
            <h3>${guide.title}</h3>
            <p>${guide.description}</p>
        `;
        card.addEventListener('click', () => openPdf(guide));
        guidesGrid.appendChild(card);
    });
}

// Initialize search functionality
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const searchResults = document.getElementById('searchResults');
    
    searchInput.addEventListener('input', debounce(performSearch, 300));
    searchBtn.addEventListener('click', performSearch);
    
    // Close search results when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-wrapper')) {
            searchResults.classList.remove('active');
        }
    });
}

// Build search index from PDFs
async function buildSearchIndex() {
    searchIndex = [];
    
    for (const guide of guides) {
            try {
            // Properly encode the file path
            const filePath = guide.file.split('/').map(part => encodeURIComponent(part)).join('/');
            const loadingTask = pdfjsLib.getDocument({ url: filePath, disableRange: true });
            const pdf = await loadingTask.promise;
            
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const textContent = await page.getTextContent();
                const text = textContent.items.map(item => item.str).join(' ');
                
                searchIndex.push({
                    guide: guide,
                    pageNum: pageNum,
                    text: text.toLowerCase()
                });
            }
        } catch (error) {
            console.warn(`Could not index ${guide.title}:`, error.message);
            // Mark guide as not searchable in content (title/description still searchable)
            guide.searchDisabled = true;
        }
    }
}

// Perform search across all PDFs
function performSearch() {
    const query = document.getElementById('searchInput').value.trim().toLowerCase();
    const searchResults = document.getElementById('searchResults');
    
    if (query.length < 2) {
        searchResults.classList.remove('active');
        return;
    }
    
    const results = [];
    
    // Search through guide titles and descriptions
    guides.forEach(guide => {
        if (guide.title.toLowerCase().includes(query) || 
            guide.description.toLowerCase().includes(query)) {
            results.push({
                guide: guide,
                pageNum: 1,
                context: guide.description,
                matchType: 'title'
            });
        }
    });
    
    // Search through PDF content
    searchIndex.forEach(item => {
        if (item.text.includes(query)) {
            const index = item.text.indexOf(query);
            const start = Math.max(0, index - 50);
            const end = Math.min(item.text.length, index + query.length + 50);
            const context = '...' + item.text.substring(start, end) + '...';
            
            results.push({
                guide: item.guide,
                pageNum: item.pageNum,
                context: context,
                matchType: 'content'
            });
        }
    });
    
    displaySearchResults(results);
}

// Display search results
function displaySearchResults(results) {
    const searchResults = document.getElementById('searchResults');
    
    if (results.length === 0) {
        searchResults.innerHTML = `
            <div class="search-result-item">
                <div class="result-title">No results found</div>
            </div>
        `;
    } else {
        searchResults.innerHTML = results.map(result => `
            <div class="search-result-item" data-guide-id="${result.guide.id}" data-page="${result.pageNum}">
                <div class="result-title">${result.guide.title}</div>
                <div class="result-context">${result.context}</div>
                <div class="result-page">Page ${result.pageNum}</div>
            </div>
        `).join('');
        
        // Add click handlers to results
        searchResults.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const guideId = item.dataset.guideId;
                const pageNum = parseInt(item.dataset.page);
                const guide = guides.find(g => g.id === guideId);
                if (guide) {
                    openPdf(guide, pageNum);
                    searchResults.classList.remove('active');
                }
            });
        });
    }
    
    searchResults.classList.add('active');
}

// Initialize PDF viewer
function initializePdfViewer() {
    const modal = document.getElementById('pdfModal');
    const closeBtn = document.getElementById('closeModal');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const zoomInBtn = document.getElementById('zoomIn');
    const zoomOutBtn = document.getElementById('zoomOut');
    
    closeBtn.addEventListener('click', closePdfModal);
    prevBtn.addEventListener('click', () => changePage(-1));
    nextBtn.addEventListener('click', () => changePage(1));
    zoomInBtn.addEventListener('click', () => changeZoom(0.1));
    zoomOutBtn.addEventListener('click', () => changeZoom(-0.1));
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closePdfModal();
        }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!modal.classList.contains('active')) return;
        
        if (e.key === 'ArrowLeft') changePage(-1);
        if (e.key === 'ArrowRight') changePage(1);
        if (e.key === 'Escape') closePdfModal();
        if (e.key === '+' || e.key === '=') changeZoom(0.1);
        if (e.key === '-') changeZoom(-0.1);
    });
}

// Open PDF in modal viewer
async function openPdf(guide, startPage = 1) {
    const modal = document.getElementById('pdfModal');
    const titleEl = document.getElementById('pdfTitle');
    
    titleEl.textContent = guide.title;
    modal.classList.add('active');
    
    try {
        // Properly encode the file path, especially for spaces and special characters
        const filePath = guide.file.split('/').map(part => encodeURIComponent(part)).join('/');
        console.log('Loading PDF from:', filePath);
        console.log('Original path:', guide.file);
        
        const loadingTask = pdfjsLib.getDocument({ 
            url: filePath, 
            disableRange: true,
            isEvalSupported: false,
            cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
            cMapPacked: true
        });
        
        // Add progress tracking
        loadingTask.onProgress = function(progress) {
            console.log('Loading progress:', Math.round((progress.loaded / progress.total) * 100) + '%');
        };
        
        currentPdf = await loadingTask.promise;
        totalPages = currentPdf.numPages;
        currentPage = startPage;
        
        console.log('PDF loaded successfully. Pages:', totalPages);
        await renderPage(currentPage);
        updatePageInfo();
    } catch (error) {
        console.error('Error loading PDF:', error);
        console.error('File path attempted:', guide.file);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        showNotification(`Unable to load "${guide.title}". Error: ${error.message}`, 'error');
        closePdfModal();
    }
}

// Render a specific PDF page
async function renderPage(pageNum) {
    if (!currentPdf) return;
    
    const canvas = document.getElementById('pdfCanvas');
    const ctx = canvas.getContext('2d');
    
    // Add transition effect
    canvas.classList.add('page-transition');
    
    const page = await currentPdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: pdfScale });
    
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    const renderContext = {
        canvasContext: ctx,
        viewport: viewport
    };
    
    await page.render(renderContext).promise;
    
    // Remove transition effect
    setTimeout(() => {
        canvas.classList.remove('page-transition');
    }, 300);
}

// Change page
async function changePage(delta) {
    const newPage = currentPage + delta;
    
    if (newPage < 1 || newPage > totalPages) return;
    
    currentPage = newPage;
    await renderPage(currentPage);
    updatePageInfo();
}

// Change zoom level
async function changeZoom(delta) {
    pdfScale += delta;
    pdfScale = Math.max(0.5, Math.min(3, pdfScale)); // Limit between 0.5x and 3x
    
    await renderPage(currentPage);
    updateZoomInfo();
}

// Update page information
function updatePageInfo() {
    document.getElementById('currentPage').textContent = currentPage;
    document.getElementById('totalPages').textContent = totalPages;
    
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    
    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= totalPages;
}

// Update zoom information
function updateZoomInfo() {
    const zoomPercent = Math.round(pdfScale * 100);
    document.getElementById('zoomLevel').textContent = `${zoomPercent}%`;
}

// Close PDF modal
function closePdfModal() {
    const modal = document.getElementById('pdfModal');
    modal.classList.remove('active');
    currentPdf = null;
    currentPage = 1;
}

// Debounce utility function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Show notification toast
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}
