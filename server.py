#!/usr/bin/env python3
"""
Simple HTTP server with auto-scan API for School Guides
Run with: python3 server.py
"""

import http.server
import socketserver
import json
import os
import re
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse, parse_qs

PORT = 8080

def get_icon_for_file(filename):
    """Icon mapping based on keywords in filename"""
    lower = filename.lower()
    if 'admission' in lower:
        return '📄'
    if 'math' in lower:
        return '🔢'
    if 'science' in lower:
        return '🔬'
    if 'history' in lower:
        return '📜'
    if 'english' in lower or 'writing' in lower:
        return '✍️'
    if 'art' in lower:
        return '🎨'
    if 'music' in lower:
        return '🎵'
    if 'computer' in lower or 'coding' in lower:
        return '💻'
    if 'guide' in lower:
        return '📚'
    return '📖'

def get_description_for_file(filename):
    """Generate description from filename"""
    base_name = filename.replace('.pdf', '')
    return f'Guide for {base_name}'

def generate_id(filename):
    """Generate ID from filename"""
    base = filename.replace('.pdf', '')
    # Replace non-alphanumeric with hyphens
    id_str = re.sub(r'[^a-z0-9]+', '-', base.lower())
    # Remove leading/trailing hyphens
    id_str = id_str.strip('-')
    return id_str

def scan_pdfs_directory():
    """Scan pdfs directory and return manifest"""
    script_dir = Path(__file__).parent
    pdfs_dir = script_dir / 'pdfs'
    
    if not pdfs_dir.exists():
        raise Exception('pdfs directory not found')
    
    # Get all PDF files
    pdf_files = sorted([f for f in os.listdir(pdfs_dir) if f.lower().endswith('.pdf')])
    
    guides = []
    for pdf_file in pdf_files:
        file_path = pdfs_dir / pdf_file
        stats = file_path.stat()
        base_name = pdf_file.replace('.pdf', '')
        
        guide = {
            'id': generate_id(pdf_file),
            'title': base_name,
            'description': get_description_for_file(pdf_file),
            'file': f'pdfs/{pdf_file}',
            'icon': get_icon_for_file(pdf_file),
            'dateAdded': datetime.fromtimestamp(stats.st_ctime).isoformat(),
            'dateModified': datetime.fromtimestamp(stats.st_mtime).isoformat()
        }
        guides.append(guide)
    
    manifest = {
        'lastUpdated': datetime.now().isoformat(),
        'guides': guides
    }
    
    return manifest

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Custom HTTP handler with API endpoints"""
    
    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def do_GET(self):
        parsed_path = urlparse(self.path)
        
        # API endpoint to scan pdfs folder
        if parsed_path.path == '/api/scan':
            try:
                manifest = scan_pdfs_directory()
                
                # Save to manifest.json
                manifest_path = Path(__file__).parent / 'manifest.json'
                with open(manifest_path, 'w', encoding='utf-8') as f:
                    json.dump(manifest, f, indent=2, ensure_ascii=False)
                
                print(f'✓ Scanned and found {len(manifest["guides"])} guides')
                
                # Send JSON response
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(manifest).encode())
            except Exception as e:
                print(f'Error scanning pdfs: {e}')
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                error_response = {'error': str(e)}
                self.wfile.write(json.dumps(error_response).encode())
            return
        
        # API endpoint to get current manifest
        elif parsed_path.path == '/api/manifest':
            try:
                manifest_path = Path(__file__).parent / 'manifest.json'
                
                if manifest_path.exists():
                    with open(manifest_path, 'r', encoding='utf-8') as f:
                        manifest = json.load(f)
                else:
                    # Generate manifest if it doesn't exist
                    manifest = scan_pdfs_directory()
                    with open(manifest_path, 'w', encoding='utf-8') as f:
                        json.dump(manifest, f, indent=2, ensure_ascii=False)
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(manifest).encode())
            except Exception as e:
                print(f'Error reading manifest: {e}')
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                error_response = {'error': str(e)}
                self.wfile.write(json.dumps(error_response).encode())
            return
        
        # Serve static files for all other requests
        else:
            super().do_GET()
    
    def log_message(self, format, *args):
        # Customize logging
        if self.path.startswith('/api/'):
            print(f'API: {self.path}')
        # Suppress logging for static files to reduce noise
        return

def run_server():
    """Start the HTTP server"""
    os.chdir(Path(__file__).parent)
    
    with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
        print(f"""
🚀 School Guides Server Running!

   Local:            http://localhost:{PORT}
   
   📚 Open the above URL in your browser
   🔄 Click "Refresh" button to auto-scan pdfs folder
   
   Press Ctrl+C to stop the server
        """)
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n👋 Server stopped")

if __name__ == '__main__':
    run_server()
