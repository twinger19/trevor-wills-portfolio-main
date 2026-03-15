#!/usr/bin/env python3
"""
Script to add width and height attributes to img tags in HTML files.
Skips images with empty src, external URLs, and images that already have dimensions.
"""

import os
import re
from pathlib import Path
from PIL import Image

def get_image_dimensions(image_path):
    """Get image dimensions using Pillow. Returns (width, height) or None if failed."""
    try:
        if os.path.exists(image_path):
            with Image.open(image_path) as img:
                return img.size
    except Exception as e:
        print(f"  Warning: Could not read {image_path} - {e}")
    return None

def process_html_file(file_path):
    """Process a single HTML file and add width/height to img tags."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Find all img tags
    # Match: <img followed by attributes including src, optionally with width/height
    img_pattern = r'<img\s+([^>]*?)>'

    def replace_img_tag(match):
        tag_content = match.group(1)

        # Skip if already has both width and height
        if re.search(r'\bwidth\s*=', tag_content, re.IGNORECASE) and \
           re.search(r'\bheight\s*=', tag_content, re.IGNORECASE):
            return match.group(0)

        # Extract src attribute
        src_match = re.search(r'\bsrc\s*=\s*["\']([^"\']+)["\']', tag_content)
        if not src_match:
            return match.group(0)

        src = src_match.group(1)

        # Skip empty src
        if not src or src.strip() == '':
            return match.group(0)

        # Skip external URLs
        if src.startswith('http://') or src.startswith('https://'):
            return match.group(0)

        # Construct full path to image
        image_path = os.path.join(os.path.dirname(file_path), src)
        image_path = os.path.normpath(image_path)

        # Get dimensions
        dimensions = get_image_dimensions(image_path)
        if not dimensions:
            return match.group(0)

        width, height = dimensions

        # Add width and height if not present
        if not re.search(r'\bwidth\s*=', tag_content, re.IGNORECASE):
            tag_content = tag_content.rstrip() + f' width="{width}"'

        if not re.search(r'\bheight\s*=', tag_content, re.IGNORECASE):
            tag_content = tag_content.rstrip() + f' height="{height}"'

        return f'<img {tag_content}>'

    content = re.sub(img_pattern, replace_img_tag, content)

    # Write back if changed
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    # Get root directory
    root_dir = os.path.dirname(os.path.abspath(__file__))

    # Find all HTML files in root directory only (not subdirectories, but we'll check)
    html_files = []

    # Get HTML files from root
    for file in os.listdir(root_dir):
        if file.endswith('.html'):
            full_path = os.path.join(root_dir, file)
            if os.path.isfile(full_path):
                html_files.append(full_path)

    if not html_files:
        print("No HTML files found in root directory.")
        return

    print(f"Found {len(html_files)} HTML files in root directory")
    print()

    modified_count = 0
    for html_file in sorted(html_files):
        file_name = os.path.basename(html_file)
        print(f"Processing: {file_name}")

        if process_html_file(html_file):
            print(f"  ✓ Modified")
            modified_count += 1
        else:
            print(f"  - No changes needed")

    print()
    print(f"Total files modified: {modified_count}")

if __name__ == '__main__':
    main()
