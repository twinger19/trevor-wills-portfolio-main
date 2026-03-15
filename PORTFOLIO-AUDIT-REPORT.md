# Portfolio Audit & Optimization Report
### Trevor Wills — Creative Strategy Director Portfolio
**Audit Date:** March 15, 2026

---

## Executive Summary

This audit reviewed all code, files, and design decisions across your 9-page portfolio site through the lens of a VP/C-suite hiring manager spending 60 seconds on the site. The good news: the site is well-structured, the writing is strong, and the case studies tell compelling strategic narratives. The changes below focus on the technical and experiential issues that could undermine that strong content.

**What was changed (implemented):** 106 lazy-loading attributes added, 9 canonical URLs added, 9 Open Graph URL tags fixed, all OG image paths converted to absolute URLs, broken carousel JS bug fixed, missing hero CSS added, malformed hero section repaired, duplicate file deleted, "Next Case Study" navigation added to all 6 case studies, sitemap updated, robots.txt improved.

**What needs your attention (recommendations):** Image compression (82MB total is very heavy), unused file cleanup (~12MB of dead images), and a few design-level enhancements detailed below.

---

## Phase 1 — File Structure Audit

### What We Found

**Wins:**
- Clean kebab-case naming across all HTML files and most images
- Logical folder structure with images organized by case study
- Single shared CSS file and single JS file — clean and maintainable

**Issues Found & Fixed:**
- **Duplicate HTML file in wrong location** — `images/heritage-brands/case-study-heritage-brands.html` (43KB) was sitting inside an images folder. **Deleted.**
- **Misplaced file** removed from the images directory

**Issues Found — Needs Your Action:**

- **25 unused images (~12MB)** not referenced by any HTML page. These are dead weight in your repo and deployment. The full list:
  - `images/damen-hastings/product-01b.jpg` (2.6MB)
  - `images/heritage-brands/final-01.jpg`, `final-02.jpg`, `process-01.jpg`, `process-02.jpg` (~5.6MB combined)
  - `images/heritage-brands/campaign-06.jpg` through `campaign-15.jpg` (10 files, ~3.3MB)
  - `images/heritage-brands/design-06.jpg`, `techpack-04.jpg`, `techpack-05.jpg`, `sample-03/04/05.jpg`, `impact-01b.jpg`
  - `images/digital-product-creation/belt-anatomy-large.jpg`, `digital-01a.jpg`, `digital-02b.jpg`, `digital-08.jpg`

- **Image sizes are very large** — Total image weight is ~82MB. Many individual images are 1–3.6MB. For web, most should be under 200KB. Recommendation: Run all images through a compression tool (TinyPNG, Squoosh, or ImageOptim) targeting ~80% quality JPEG. This alone could cut load times by 70%+.

- **`.DS_Store` files** present in the repo — add to `.gitignore`.

- **SS27Trend folder** uses PascalCase (`SS27Trend/`) while everything else is kebab-case. Not critical since it's a separate sub-project, but worth noting.

---

## Phase 2 — Performance Optimization

### What Was Changed

| Fix | Impact | Pages Affected |
|-----|--------|---------------|
| Added `loading="lazy"` to 106 below-fold images | Eliminates unnecessary image downloads on initial page load | All 8 content pages |
| Hero images kept eager-loaded | Ensures above-fold content loads instantly | All pages |

### What's Still Recommended

- **Image compression** — This is the single highest-impact performance improvement available. Your heritage-brands page alone loads 20+ images that are 1–3.6MB each. Compressing to web-optimized sizes could reduce total page weight by 80%.

- **Add `width` and `height` attributes to images** — This prevents Cumulative Layout Shift (CLS) as images load. Browsers can reserve the right amount of space before the image downloads.

- **Consider WebP format** — Modern browsers support WebP which typically delivers 30% smaller files than JPEG at equivalent quality. You can use `<picture>` elements with JPEG fallback for older browsers.

- **Font loading** — You're using system fonts (`-apple-system, BlinkMacSystemFont, 'Segoe UI'`), which is actually great for performance. No external font downloads needed.

- **Google Analytics** — The script uses `async` which is correct. No render-blocking issues here.

---

## Phase 3 — Code Quality & Consistency

### Bugs Fixed

1. **Missing `.hero` CSS class** — Your about.html and contact.html both used `<section class="hero">` but the styles.css had no `.hero` class defined. These hero sections were rendering without proper layout. **Added complete `.hero` styling** with proper centering, spacing, typography, and mobile responsive rules.

2. **Broken hero on Digital Product Creation page** — The `<section class="cs-hero">` had no background-image and no `.hero-content` wrapper, making it render as a blank bar. **Fixed** to match the pattern used by all other case study pages, with the digital-hero.jpg as background and proper subtitle text.

3. **Broken carousel lightbox on Seasonal Trend Development** — All 21 carousel images had `onclick="openLightbox(this)"` but the `openLightbox()` function expects `(carouselId, imageIndex)`. These broken handlers were throwing errors on click. **Removed all 21 broken onclick attributes.** The click-to-lightbox functionality works correctly via the `initCarousel()` function in scripts.js which properly binds click events.

### Consistency Notes

- **Nav and footer** are consistent across all 9 pages ✓
- **Dropdown menu** structure matches everywhere ✓
- **Inline `<style>` blocks** exist on about.html, contact.html, and case-study-ai-trend-presentation.html. These contain page-specific styles. While not ideal for caching, they're reasonable for a small portfolio site and keep styles co-located with their pages.

---

## Phase 4 — Design Director-Level Improvements

### What Was Changed

**"Next Case Study" navigation added to all 6 case study pages.** This is one of the highest-impact UX improvements for your target audience. When a hiring manager finishes reading one case study, they now see a clear, styled prompt to continue to the next. The flow creates a circular journey:

Heritage Brands → Seasonal Trend → Digital Product Creation → Damen + Hastings → Walmart Assessment → AI Trend Presentation → (back to Heritage Brands)

This keeps recruiters engaged and reduces bounce rate between case studies.

### Recommendations (Not Yet Implemented)

**Typography — Consider a more distinctive heading font.** The system font stack is performant but generic. For a Design Director portfolio, consider adding a refined typeface like `'Playfair Display'` or `'Cormorant Garamond'` for headings only. This would add ~50KB but significantly elevate the editorial feel. A single `<link>` to Google Fonts with `display=swap` keeps performance impact minimal.

**Homepage hero — Strengthen the first impression.** The current hero works well — headshot, title, tagline, stats. Two small tweaks would sharpen it:
- Change "Creative Strategy Director" to include your name: "I'm Trevor Wills" as a smaller eyebrow above the main title. This makes the page feel personal and confident rather than generic.
- The subtitle paragraph is strong content but could be more scannable. Consider making the first sentence bolder or slightly larger.

**Case study structure — The Walmart page is the strongest model.** It follows a clear Challenge → Approach → Proof (carousel) → Results → Takeaway arc. The Heritage Brands and Seasonal Trend pages are also strong. The Digital Product Creation page would benefit from a clearer "Results" section with specific metrics placed more prominently (the stats are there but get lost in the scroll). The Damen + Hastings page is the shortest — consider expanding the "Key Results" section into a narrative paragraph rather than a bulleted list.

**Contact page — Add urgency.** The "Current Status: Open to new opportunities" box is good but could be more direct. Consider: "Currently interviewing — let's talk" or similar language that creates gentle urgency without desperation.

**Whitespace** — Generally good. The `padding: 6rem 3rem` on sections provides generous breathing room. The case study pages with `text-block` at `padding: 8rem 3rem` feel appropriately editorial.

---

## Phase 5 — SEO & Metadata

### What Was Changed

| Fix | Details |
|-----|---------|
| **Canonical URLs** | Added `<link rel="canonical">` to all 9 pages |
| **OG image paths** | Converted all relative paths to absolute `https://trevorwills.com/...` URLs |
| **OG URL tags** | Added `<meta property="og:url">` to all 9 pages |
| **Broken OG image** | contact.html referenced non-existent `og-image.jpg` — fixed to use `headshot.jpg` |
| **Sitemap updated** | Added missing `case-study-ai-trend-presentation.html` entry |
| **robots.txt** | Added `Sitemap: https://trevorwills.com/sitemap.xml` reference |

### What's Already Good

- Every page has a unique, descriptive `<title>` tag ✓
- Meta descriptions exist on all pages and are compelling ✓
- Open Graph tags (title, description, type, image) present on all pages ✓
- Google Analytics 4 properly configured ✓

### Recommendations

- **Add structured data (JSON-LD)** — Consider adding `Person` schema to the homepage and `Article` schema to case study pages. This helps search engines understand your professional profile and can improve how your site appears in search results.

- **Create a dedicated OG image** — The headshot works but a designed 1200×630px image with your name, title, and a brand-appropriate background would look much more professional when shared on LinkedIn (critical for someone in a job search).

---

## Priority Action Items (Ranked by Impact)

1. **Compress all images** — This is the #1 thing holding back the site experience. A recruiter on a spotty WiFi connection at a coffee shop will abandon a 3.6MB hero image. Target: every image under 300KB.

2. **Delete the 25 unused images** — Quick cleanup, reduces deploy size by ~12MB.

3. **Consider a heading typeface** — Small investment for a big perception lift in editorial quality.

4. **Expand the Damen + Hastings case study** — It's your entrepreneurial showcase (built a brand from scratch!) but reads as the thinnest case study. This story deserves more room.

5. **Create a LinkedIn-optimized OG image** — Since you're actively job searching, every LinkedIn share of your site should look polished and intentional.

---

*Audit performed March 15, 2026*
