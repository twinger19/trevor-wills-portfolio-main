#!/bin/bash
# Run this script to refactor the remaining HTML files that had filesystem lock issues.
# Usage: bash refactor-remaining.sh

NAV_BLOCK='    <nav>
        <div class="nav-content">
            <a href="index.html" class="nav-brand">Trevor Wills<\/a>
            <button class="nav-hamburger" aria-label="Toggle navigation">
                <span><\/span>
                <span><\/span>
                <span><\/span>
            <\/button>
            <div class="nav-links">
                <div class="dropdown">
                    <a href="index.html#work">Work<\/a>
                    <div class="dropdown-content">
                        <a href="case-study-heritage-brands.html">Creative Direction for Heritage Brands<\/a>
                        <a href="case-study-seasonal-trend-development.html">Seasonal Trend Development<\/a>
                        <a href="case-study-digital-product-creation.html">Pioneering Digital Product Creation<\/a>
                        <a href="case-study-damen-hastings.html">Building a Vertical Brand<\/a>
                        <a href="case-study-walmart-assessment.html">Strategic Brand Assessment for Walmart<\/a>
                    <\/div>
                <\/div>
                <a href="about.html">About<\/a>
                <a href="contact.html">Contact<\/a>
            <\/div>
        <\/div>
    <\/nav>'

FILES=(
    "about.html"
    "contact.html"
    "case-study-heritage-brands.html"
    "case-study-digital-product-creation.html"
)

for file in "${FILES[@]}"; do
    filepath="./$file"

    if [ ! -f "$filepath" ]; then
        echo "SKIP: $file not found"
        continue
    fi

    echo "Processing $file..."

    # Create temp file
    tmpfile=$(mktemp)

    python3 << PYEOF
import re

with open("$filepath", "r") as f:
    content = f.read()

# 1. Remove inline <style>...</style>
content = re.sub(r'<style>.*?</style>\s*', '', content, flags=re.DOTALL)

# 2. Remove inline <script> at bottom (not GA script)
# Remove script tags that don't contain gtag
content = re.sub(r'<script>\s*//.*?</script>\s*', '', content, flags=re.DOTALL)
content = re.sub(r'<script>\s*(?!.*dataLayer)(?!.*gtag).*?</script>\s*', '', content, flags=re.DOTALL)

# 3. Add stylesheet link before </head>
if 'styles.css' not in content:
    content = content.replace('</head>', '    <link rel="stylesheet" href="styles.css">\n</head>')

# 4. Add favicon before </head>
if 'favicon.svg' not in content:
    content = content.replace('</head>', '    <link rel="icon" type="image/svg+xml" href="favicon.svg">\n</head>')

# 5. Add scripts.js before </body>
if 'scripts.js' not in content:
    content = content.replace('</body>', '    <script src="scripts.js"></script>\n</body>')

# 6. Replace old nav with class-based brand link
content = content.replace('style="font-weight: 600;"', 'class="nav-brand"')

# 7. Rename .hero to .cs-hero for case studies
if 'case-study' in "$file":
    content = content.replace('class="hero"', 'class="cs-hero"')

with open("$tmpfile", "w") as f:
    f.write(content)
PYEOF

    if [ -f "$tmpfile" ] && [ -s "$tmpfile" ]; then
        cp "$tmpfile" "$filepath"
        echo "  DONE: $file refactored"
    else
        echo "  ERROR: Failed to process $file"
    fi
    rm -f "$tmpfile"
done

echo ""
echo "Refactoring complete! Open each file to verify the changes look correct."
