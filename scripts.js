/* ==========================================================================
   Trevor Wills Portfolio — Shared Scripts
   ========================================================================== */

// --- Mobile Hamburger Menu ---
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.nav-hamburger');
    const navLinks = document.querySelector('.nav-links');
    const dropdown = document.querySelector('.nav-links .dropdown');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // On mobile, tapping "Work" toggles the dropdown
        if (dropdown) {
            const dropdownToggle = dropdown.querySelector(':scope > a');
            dropdownToggle.addEventListener('click', (e) => {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    dropdown.classList.toggle('active');
                }
            });
        }

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                // Don't close if it's the dropdown toggle on mobile
                if (window.innerWidth <= 768 && link.parentElement.classList.contains('dropdown') && link === link.parentElement.querySelector(':scope > a')) {
                    return;
                }
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }
});


// --- Heritage-style Carousel ---
const carouselStates = {};

function initCarousel(carouselId) {
    const container = document.querySelector(`[data-carousel="${carouselId}"]`);
    if (!container) return;

    carouselStates[carouselId] = { currentIndex: 0 };

    const slides = container.querySelectorAll('.carousel-slide');
    slides.forEach((slide, index) => {
        slide.addEventListener('click', () => openLightbox(carouselId, index));
    });
}

function moveCarousel(carouselId, direction) {
    const state = carouselStates[carouselId];
    if (!state) return;
    const container = document.querySelector(`[data-carousel="${carouselId}"]`);
    const wrapper = container.querySelector('.carousel-wrapper');
    const slides = wrapper.querySelectorAll('.carousel-slide');
    const dots = container.querySelectorAll('.carousel-dot');

    state.currentIndex += direction;

    if (state.currentIndex < 0) {
        state.currentIndex = slides.length - 1;
    } else if (state.currentIndex >= slides.length) {
        state.currentIndex = 0;
    }

    wrapper.style.transform = `translateX(-${state.currentIndex * 100}%)`;

    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === state.currentIndex);
    });
}

function goToSlide(carouselId, slideIndex) {
    const state = carouselStates[carouselId];
    if (!state) return;
    const container = document.querySelector(`[data-carousel="${carouselId}"]`);
    const wrapper = container.querySelector('.carousel-wrapper');
    const dots = container.querySelectorAll('.carousel-dot');

    state.currentIndex = slideIndex;
    wrapper.style.transform = `translateX(-${slideIndex * 100}%)`;

    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === slideIndex);
    });
}

// Auto-init all carousels on page
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-carousel]').forEach(container => {
        const id = parseInt(container.dataset.carousel);
        initCarousel(id);
    });
});


// --- Lightbox ---
let currentLightboxCarousel = 1;
let lightboxImages = [];

function openLightbox(carouselId, imageIndex) {
    currentLightboxCarousel = carouselId;

    const container = document.querySelector(`[data-carousel="${carouselId}"]`);
    const slides = container.querySelectorAll('.carousel-slide img');
    lightboxImages = Array.from(slides).map(img => ({
        src: img.src,
        alt: img.alt
    }));

    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');

    lightboxImg.src = lightboxImages[imageIndex].src;
    lightboxImg.alt = lightboxImages[imageIndex].alt;

    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';

    lightbox.dataset.currentIndex = imageIndex;
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function lightboxNavigate(direction) {
    const lightbox = document.getElementById('lightbox');
    let idx = parseInt(lightbox.dataset.currentIndex);

    idx += direction;

    if (idx < 0) idx = lightboxImages.length - 1;
    else if (idx >= lightboxImages.length) idx = 0;

    const lightboxImg = document.getElementById('lightbox-img');
    lightboxImg.src = lightboxImages[idx].src;
    lightboxImg.alt = lightboxImages[idx].alt;

    lightbox.dataset.currentIndex = idx;
}

// Keyboard navigation for lightbox
document.addEventListener('keydown', (e) => {
    const lightbox = document.getElementById('lightbox');
    if (lightbox && lightbox.classList.contains('active')) {
        if (e.key === 'ArrowLeft') lightboxNavigate(-1);
        if (e.key === 'ArrowRight') lightboxNavigate(1);
        if (e.key === 'Escape') closeLightbox();
    }
});


// --- Image Flipper Carousel (Digital Product Creation page) ---
document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.getElementById('carousel');
    if (!carousel) return;

    const images = carousel.querySelectorAll('img');
    const prevBtn = carousel.querySelector('.carousel-prev');
    const nextBtn = carousel.querySelector('.carousel-next');
    const indicators = carousel.querySelectorAll('.carousel-indicator');
    let currentIndex = 0;

    function showSlide(index) {
        images.forEach(img => img.classList.remove('active'));
        indicators.forEach(ind => ind.classList.remove('active'));
        images[index].classList.add('active');
        indicators[index].classList.add('active');
        currentIndex = index;
    }

    if (nextBtn) nextBtn.addEventListener('click', () => showSlide((currentIndex + 1) % images.length));
    if (prevBtn) prevBtn.addEventListener('click', () => showSlide((currentIndex - 1 + images.length) % images.length));

    indicators.forEach((ind, i) => {
        ind.addEventListener('click', () => showSlide(i));
    });
});


// --- Intersection Observer for Scroll Animations ---
document.addEventListener('DOMContentLoaded', () => {
    const animatedSelectors = '.image-fullscreen, .split-half, .stat-large, .asymmetric-grid > *, .offset-pair';
    const animated = document.querySelectorAll(animatedSelectors);

    if (animated.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px 0px -100px 0px'
    });

    animated.forEach(el => observer.observe(el));
});
