// Configuration - List of manually defined PDF guides
// These take precedence over auto-detected PDFs
const manualGuides = [
    {
        id: 'sample-guide',
        title: 'Sample Tutorial Guide',
        description: 'An example guide to demonstrate the PDF viewer',
        file: 'pdfs/sample-guide.pdf',
        icon: '📚'
    }
    // Add more guides here as needed
    // Example:
    // {
    //     id: 'math-guide',
    //     title: 'Mathematics Tutorial',
    //     description: 'Complete guide to algebra and calculus',
    //     file: 'pdfs/math-guide.pdf',
    //     icon: '🔢'
    // }
];

// Global variables
let guides = []; // Will be populated with manual + auto-detected guides
let currentPdf = null;
let currentPage = 1;
let totalPages = 0;
let pdfScale = 1.5;
let searchIndex = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    try {
        await loadPdfManifest();
        loadGuides();
        initializeSearch();
        initializePdfViewer();
        buildSearchIndex();
    } catch (error) {
        console.error('Error initializing application:', error);
        showNotification('Failed to initialize the application. Please refresh the page.', 'error');
    }
});

// Load PDF manifest and merge with manual guides
async function loadPdfManifest() {
    try {
        const response = await fetch('pdf-manifest.json');
        if (response.ok) {
            const manifest = await response.json();
            const autoDetectedGuides = manifest.guides || [];
            
            // Create a map of manual guides by ID for quick lookup
            const manualGuideIds = new Set(manualGuides.map(g => g.id));
            
            // Filter out auto-detected guides that have manual definitions
            const uniqueAutoGuides = autoDetectedGuides.filter(g => !manualGuideIds.has(g.id));
            
            // Merge: manual guides first (they take precedence), then auto-detected
            guides = [...manualGuides, ...uniqueAutoGuides];
            
            console.log(`Loaded ${guides.length} guides (${manualGuides.length} manual, ${uniqueAutoGuides.length} auto-detected)`);
        } else {
            // Manifest not found, use only manual guides
            console.log('PDF manifest not found, using manual guides only');
            guides = [...manualGuides];
        }
    } catch (error) {
        // Error loading manifest, use only manual guides
        console.warn('Could not load PDF manifest:', error.message);
        guides = [...manualGuides];
    }
}

// Load guide cards into the grid
function loadGuides() {
    const guidesGrid = document.getElementById('guidesGrid');
    guidesGrid.innerHTML = '';
    
    guides.forEach(guide => {
        const card = document.createElement('div');
        card.className = 'guide-card';
        card.innerHTML = `
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
            const loadingTask = pdfjsLib.getDocument(guide.file);
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
        const loadingTask = pdfjsLib.getDocument(guide.file);
        currentPdf = await loadingTask.promise;
        totalPages = currentPdf.numPages;
        currentPage = startPage;
        
        await renderPage(currentPage);
        updatePageInfo();
    } catch (error) {
        showNotification(`Unable to load "${guide.title}". Please try again or contact support if the issue persists.`, 'error');
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
