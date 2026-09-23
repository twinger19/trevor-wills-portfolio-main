/* Draft view: image slots and "to add" notes show only when previewing locally
   (file:// or localhost) or with ?draft in the URL. The live site hides them. */
(function () {
  var local = location.protocol === 'file:' || /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  if (local || /[?&]draft\b/.test(location.search)) {
    document.documentElement.classList.add('show-drafts');
    document.addEventListener('DOMContentLoaded', function () {
      if (!document.querySelector('.draft-only')) return;
      var bar = document.createElement('div');
      bar.className = 'draft-bar';
      bar.textContent = 'Draft view: image slots and notes to add are hidden on the live site';
      document.body.appendChild(bar);
    });
  }
})();

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

  const lbAll = Array.from(document.querySelectorAll('.cs-hero-media img, .img-full img, .img-duo img, .img-grid img, .carousel-slide img, .img-slot img'));
  const isShown = el => { const s = el.closest('.img-slot'); return (!s || s.classList.contains('is-real')) && el.getClientRects().length > 0; };
  lbAll.forEach(el => {
    if (!el.closest('.img-slot')) el.classList.add('zoomable');
    el.addEventListener('click', e => {
      if (!isShown(el)) return;
      e.preventDefault();
      const scope = el.closest('.guide-viewer'); /* guide pages open as their own set */
      lbImages = lbAll.filter(x => isShown(x) && (!scope || scope.contains(x)));
      openLightbox(lbImages.indexOf(el));
    });
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


/* Image spots: placeholder files are generated at exactly 1200x901 or 1680x641.
   Any other image in that spot is a real one, so it is shown on the live site. */
function checkImageSlots() {
  document.querySelectorAll('.img-slot img').forEach(img => {
    const check = () => {
      const w = img.naturalWidth, h = img.naturalHeight;
      const placeholder = (w === 1200 && h === 901) || (w === 1680 && h === 641);
      if (w > 0 && !placeholder) {
        img.closest('.img-slot').classList.add('is-real');
        img.classList.add('zoomable');
        const group = img.closest('.slot-group');
        if (group) group.classList.add('has-real');
      }
    };
    if (img.complete) check(); else img.addEventListener('load', check);
  });
}
document.addEventListener('DOMContentLoaded', checkImageSlots);

/* Guide animation: plays only while its slide is in view. With reduced motion on, it shows controls instead. */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('video[data-inview]').forEach(v => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { v.controls = true; v.style.pointerEvents = 'auto'; return; }
    if (!('IntersectionObserver' in window)) { v.play().catch(() => {}); return; }
    new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) v.play().catch(() => {}); else v.pause(); }), { threshold: 0.6 }).observe(v);
  });
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
  const cnt = c.querySelector('[data-count]');
  if (cnt) cnt.textContent = (st.i + 1) + ' / ' + slides.length;
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

/* Intro splash: types the name like a typewriter, once per session, homepage
   root only. Whole sequence is budgeted to land at roughly 800ms end to end.
   Only runs when the homepage head script sets .intro-pending. Click, key, or Skip to jump. */
(function () {
  const html = document.documentElement;
  const done = () => html.classList.remove('intro-pending');
  if (!html.classList.contains('intro-pending')) return;
  const start = () => {
    const name = 'Trevor Wills', role = 'Creative & Design Director · Chicago';
    const el = document.createElement('div');
    el.className = 'intro';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<div class="intro__sheet"><div class="intro__tag"><span>Portfolio</span><span>2026</span></div>' +
      '<div class="intro__name"><span class="t"></span><span class="intro__caret"></span></div>' +
      '<div class="intro__role"><span class="t"></span></div><div class="intro__rule"></div></div>' +
      '<button class="intro__skip" type="button">Skip</button>';
    document.body.appendChild(el);
    done();
    const nameT = el.querySelector('.intro__name .t'), roleT = el.querySelector('.intro__role .t');
    const caret = el.querySelector('.intro__caret');
    let timers = [], finished = false;
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));
    const leave = () => {
      if (finished) return; finished = true;
      timers.forEach(clearTimeout);
      try { sessionStorage.setItem('tw-intro', '1'); } catch (e) {}
      el.classList.add('is-leaving');
      setTimeout(() => el.remove(), 220);
    };
    let t = 20;
    [...name].forEach((ch, i) => later(() => { nameT.textContent = name.slice(0, i + 1); }, t += (ch === ' ' ? 18 : 14)));
    later(() => { roleT.parentNode.appendChild(caret); }, t += 50);
    [...role].forEach((ch, i) => later(() => { roleT.textContent = role.slice(0, i + 1); }, t += 5));
    later(() => el.classList.add('is-ruled'), t += 50);
    later(leave, t += 80);
    el.addEventListener('click', leave);
    window.addEventListener('keydown', leave, { once: true });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();

/* Live site / slides toggle */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-viewer]').forEach(v => {
    const tabs = v.querySelectorAll('.viewer-tabs button'), panes = v.querySelectorAll('.viewer-pane');
    tabs.forEach(t => t.addEventListener('click', () => {
      tabs.forEach(x => { const on = x === t; x.classList.toggle('active', on); x.setAttribute('aria-selected', on ? 'true' : 'false'); });
      panes.forEach(p => { p.hidden = p.dataset.pane !== t.dataset.pane; });
    }));
  });
});

/* Arrow keys move a focused carousel that opts in */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.carousel--clear').forEach(c => {
    c.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); moveCarousel(c.dataset.carousel, -1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); moveCarousel(c.dataset.carousel, 1); }
    });
  });
});
