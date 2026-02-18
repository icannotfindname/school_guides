#!/usr/bin/env python3

import os
import json
from datetime import datetime
from pathlib import Path

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
    import re
    base = filename.replace('.pdf', '')
    # Replace non-alphanumeric with hyphens
    id_str = re.sub(r'[^a-z0-9]+', '-', base.lower())
    # Remove leading/trailing hyphens
    id_str = id_str.strip('-')
    return id_str

def scan_pdfs_directory():
    """Scan pdfs directory and generate manifest"""
    script_dir = Path(__file__).parent
    pdfs_dir = script_dir / 'pdfs'
    manifest_path = script_dir / 'manifest.json'
    
    if not pdfs_dir.exists():
        print('Error: pdfs directory not found!')
        return None
    
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
    
    # Write manifest file
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    
    print(f'✓ Generated manifest with {len(guides)} guides')
    print(f'✓ Manifest saved to {manifest_path}')
    
    return manifest

if __name__ == '__main__':
    scan_pdfs_directory()
