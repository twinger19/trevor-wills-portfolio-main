/* ==========================================================================
   Trevor Wills — Portfolio v3 · Shared Scripts
   ========================================================================== */

/* ---------------------------------------------------------- Mobile nav --- */
document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.querySelector('.nav-toggle');
    const menu = document.querySelector('.nav-menu');
    if (!toggle || !menu) return;

    const close = () => { toggle.classList.remove('active'); menu.classList.remove('active'); document.body.style.overflow = ''; toggle.setAttribute('aria-expanded', 'false'); };
    const open  = () => { toggle.classList.add('active'); menu.classList.add('active'); document.body.style.overflow = 'hidden'; toggle.setAttribute('aria-expanded', 'true'); };

    toggle.addEventListener('click', () => toggle.classList.contains('active') ? close() : open());
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { if (window.innerWidth <= 768) close(); }));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    window.addEventListener('resize', () => { if (window.innerWidth > 768) close(); });
});

/* ----------------------------------------------- Duplicate marquee track -- */
/* Clone the contents of each .marquee-track / .ribbon-track so the loop is seamless */
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.marquee-track, .ribbon-track').forEach(track => {
        track.innerHTML += track.innerHTML;
    });
});

/* --------------------------------------------------- Scroll reveal anim --- */
document.addEventListener('DOMContentLoaded', () => {
    const items = document.querySelectorAll('.reveal');
    if (!items.length) return;
    if (!('IntersectionObserver' in window)) { items.forEach(i => i.classList.add('in')); return; }

    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    items.forEach(i => io.observe(i));
});

/* ------------------------------------------------- Animated stat counters -- */
document.addEventListener('DOMContentLoaded', () => {
    const nums = document.querySelectorAll('[data-count]');
    if (!nums.length) return;

    const animate = (el) => {
        const target = parseFloat(el.dataset.count);
        const prefix = el.dataset.prefix || '';
        const suffix = el.dataset.suffix || '';
        const decimals = (el.dataset.decimals ? parseInt(el.dataset.decimals) : 0);
        const dur = 1500;
        const start = performance.now();
        const step = (now) => {
            const p = Math.min((now - start) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            const val = (target * eased).toFixed(decimals);
            el.textContent = prefix + val + suffix;
            if (p < 1) requestAnimationFrame(step);
            else el.textContent = prefix + target.toFixed(decimals) + suffix;
        };
        requestAnimationFrame(step);
    };

    if (!('IntersectionObserver' in window)) { nums.forEach(animate); return; }
    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { animate(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.6 });
    nums.forEach(n => io.observe(n));
});

/* ---------------------------------------------------------- Nav shadow ---- */
document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('.site-nav');
    if (!nav) return;
    const onScroll = () => nav.style.boxShadow = window.scrollY > 12 ? '0 6px 24px rgba(34,28,21,.08)' : 'none';
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
});

/* ===================================================== Carousel =========== */
const carouselStates = {};

function moveCarousel(id, dir) {
    const c = document.querySelector(`[data-carousel="${id}"]`);
    if (!c) return;
    const wrap = c.querySelector('.carousel-wrapper');
    const slides = wrap.querySelectorAll('.carousel-slide');
    const dots = c.querySelectorAll('.carousel-dot');
    const st = carouselStates[id] || (carouselStates[id] = { i: 0 });
    st.i = (st.i + dir + slides.length) % slides.length;
    wrap.style.transform = `translateX(-${st.i * 100}%)`;
    dots.forEach((d, k) => d.classList.toggle('active', k === st.i));
}
function goToSlide(id, i) {
    const c = document.querySelector(`[data-carousel="${id}"]`);
    if (!c) return;
    const wrap = c.querySelector('.carousel-wrapper');
    const dots = c.querySelectorAll('.carousel-dot');
    (carouselStates[id] || (carouselStates[id] = { i: 0 })).i = i;
    wrap.style.transform = `translateX(-${i * 100}%)`;
    dots.forEach((d, k) => d.classList.toggle('active', k === i));
}

/* ===================================================== Lightbox =========== */
/* One page-wide gallery: every case-study image is clickable and opens the
   full, uncropped image. Arrow keys, on-screen arrows, or swipe move through
   all images on the page without ever leaving the popup. */
let lbImages = [], lbIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
    // Init carousel state
    document.querySelectorAll('[data-carousel]').forEach(c => { carouselStates[c.dataset.carousel] = { i: 0 }; });

    const lb = document.getElementById('lightbox');
    if (!lb) return;

    // Build caption + counter UI once, so the HTML files stay untouched
    const im = document.getElementById('lightbox-img');
    const fig = document.createElement('div');
    fig.className = 'lightbox-figure';
    im.parentNode.insertBefore(fig, im);
    fig.appendChild(im);
    const meta = document.createElement('div');
    meta.className = 'lightbox-meta';
    meta.innerHTML = '<span class="lightbox-counter" id="lightbox-counter"></span><span class="lightbox-caption" id="lightbox-caption"></span>';
    fig.appendChild(meta);

    // Collect every gallery image on the page, in document order
    const selector = '.cs-hero-media img, .img-full img, .img-duo img, .img-grid img, .carousel-slide img';
    lbImages = Array.from(document.querySelectorAll(selector));
    lbImages.forEach((el, i) => {
        el.classList.add('zoomable');
        el.addEventListener('click', (e) => { e.preventDefault(); openLightbox(i); });
    });

    // Click the dark backdrop (not the image or buttons) to close
    lb.addEventListener('click', (e) => {
        if (e.target === lb || e.target.classList.contains('lightbox-figure') || e.target.classList.contains('lightbox-meta')) closeLightbox();
    });

    // Touch swipe to move between images
    let x0 = null;
    lb.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', (e) => {
        if (x0 === null) return;
        const dx = e.changedTouches[0].clientX - x0;
        if (Math.abs(dx) > 45) lightboxNav(dx < 0 ? 1 : -1);
        x0 = null;
    }, { passive: true });
});

function renderLightbox() {
    const el = lbImages[lbIndex];
    if (!el) return;
    const lb = document.getElementById('lightbox');
    const im = document.getElementById('lightbox-img');
    const cap = document.getElementById('lightbox-caption');
    const ctr = document.getElementById('lightbox-counter');
    lb.classList.add('is-loading');
    im.onload = () => lb.classList.remove('is-loading');
    im.src = el.currentSrc || el.src;
    im.alt = el.alt || '';
    if (cap) cap.textContent = el.alt || '';
    if (ctr) ctr.textContent = (lbIndex + 1) + ' / ' + lbImages.length;
}
function openLightbox(i) {
    if (!lbImages.length) return;
    lbIndex = (i + lbImages.length) % lbImages.length;
    renderLightbox();
    const lb = document.getElementById('lightbox');
    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
}
function closeLightbox() {
    const lb = document.getElementById('lightbox');
    if (lb) { lb.classList.remove('active'); document.body.style.overflow = ''; }
}
function lightboxNav(dir) {
    if (!lbImages.length) return;
    lbIndex = (lbIndex + dir + lbImages.length) % lbImages.length;
    renderLightbox();
}
document.addEventListener('keydown', e => {
    const lb = document.getElementById('lightbox');
    if (lb && lb.classList.contains('active')) {
        if (e.key === 'ArrowLeft') lightboxNav(-1);
        else if (e.key === 'ArrowRight') lightboxNav(1);
        else if (e.key === 'Escape') closeLightbox();
    }
});
