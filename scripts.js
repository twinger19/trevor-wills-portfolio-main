/* Trevor Wills · Portfolio · scripts.js
   Mobile nav, image carousel, and the case-study lightbox. Nothing else:
   all content is visible on load, no scroll animations. */

document.addEventListener('DOMContentLoaded', () => {
  /* Mobile nav */
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.nav-menu');
  if (toggle && menu) {
    const close = () => { menu.classList.remove('active'); document.body.style.overflow = ''; toggle.setAttribute('aria-expanded', 'false'); };
    const open = () => { menu.classList.add('active'); document.body.style.overflow = 'hidden'; toggle.setAttribute('aria-expanded', 'true'); };
    toggle.addEventListener('click', () => menu.classList.contains('active') ? close() : open());
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    window.addEventListener('resize', () => { if (window.innerWidth > 768) close(); });
  }

  /* Carousels */
  document.querySelectorAll('[data-carousel]').forEach(c => { carouselStates[c.dataset.carousel] = { i: 0 }; });

  /* Lightbox */
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  const im = document.getElementById('lightbox-img');
  const fig = document.createElement('div');
  fig.className = 'lightbox-figure';
  im.parentNode.insertBefore(fig, im);
  fig.appendChild(im);
  const meta = document.createElement('div');
  meta.className = 'lightbox-meta';
  meta.innerHTML = '<span id="lightbox-counter"></span><span id="lightbox-caption"></span>';
  fig.appendChild(meta);

  lbImages = Array.from(document.querySelectorAll('.cs-hero-media img, .img-full img, .img-duo img, .img-grid img, .carousel-slide img'));
  lbImages.forEach((el, i) => {
    el.classList.add('zoomable');
    el.addEventListener('click', e => { e.preventDefault(); openLightbox(i); });
  });
  lb.addEventListener('click', e => { if (e.target === lb || e.target === fig || e.target === meta) closeLightbox(); });
  let x0 = null;
  lb.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 45) lightboxNav(dx < 0 ? 1 : -1);
    x0 = null;
  }, { passive: true });
});

const carouselStates = {};
function setSlide(id, i) {
  const c = document.querySelector(`[data-carousel="${id}"]`);
  if (!c) return;
  const slides = c.querySelectorAll('.carousel-slide');
  const st = carouselStates[id] || (carouselStates[id] = { i: 0 });
  st.i = (i + slides.length) % slides.length;
  c.querySelector('.carousel-wrapper').style.transform = `translateX(-${st.i * 100}%)`;
  c.querySelectorAll('.carousel-dot').forEach((d, k) => d.classList.toggle('active', k === st.i));
}
function moveCarousel(id, dir) { setSlide(id, ((carouselStates[id] || { i: 0 }).i) + dir); }
function goToSlide(id, i) { setSlide(id, i); }

let lbImages = [], lbIndex = 0;
function renderLightbox() {
  const el = lbImages[lbIndex];
  if (!el) return;
  const lb = document.getElementById('lightbox');
  const im = document.getElementById('lightbox-img');
  lb.classList.add('is-loading');
  im.onload = () => lb.classList.remove('is-loading');
  im.src = el.currentSrc || el.src;
  im.alt = el.alt || '';
  document.getElementById('lightbox-caption').textContent = el.alt || '';
  document.getElementById('lightbox-counter').textContent = (lbIndex + 1) + ' / ' + lbImages.length;
}
function openLightbox(i) {
  if (!lbImages.length) return;
  lbIndex = (i + lbImages.length) % lbImages.length;
  renderLightbox();
  document.getElementById('lightbox').classList.add('active');
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
