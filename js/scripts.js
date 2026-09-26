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
   Mobile nav, image carousel, case-study lightbox, and (at the end) the
   interaction layer. All content is visible on load without JS. */

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
   root only. Whole sequence is budgeted to land at roughly 1600ms end to end.
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
      document.dispatchEvent(new Event('tw:intro-done'));
      setTimeout(() => el.remove(), 220);
    };
    let t = 40;
    [...name].forEach((ch, i) => later(() => { nameT.textContent = name.slice(0, i + 1); }, t += (ch === ' ' ? 36 : 28)));
    later(() => { roleT.parentNode.appendChild(caret); }, t += 100);
    [...role].forEach((ch, i) => later(() => { roleT.textContent = role.slice(0, i + 1); }, t += 8));
    later(() => el.classList.add('is-ruled'), t += 80);
    later(leave, t += 520); /* hold so the full name + role can be read while the red rule draws */
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

/* ==========================================================================
   Interaction layer (Sept 2026). Each piece is progressive: without JS the
   page shows the same content, just static.
   ========================================================================== */
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Tech-pack markup: adds crop marks, dimension lines and a figure label to
   each homepage case study image. The label comes from data-fig. */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.work-media').forEach(m => {
    const row = m.closest('.work-row');
    const idx = row && row.querySelector('.work-idx') ? row.querySelector('.work-idx').textContent.trim() : '';
    const fig = 'Fig. ' + idx + (m.dataset.fig ? ' · ' + m.dataset.fig : '');
    const tp = document.createElement('span');
    tp.className = 'tp';
    tp.setAttribute('aria-hidden', 'true');
    tp.innerHTML = '<i class="tp-c tl"></i><i class="tp-c tr"></i><i class="tp-c bl"></i><i class="tp-c br"></i>' +
      '<span class="tp-w"><b></b></span><span class="tp-h"></span><span class="tp-tag">Open case study →</span>';
    tp.querySelector('b').textContent = fig;
    m.appendChild(tp);
  });
});

/* Before / after compare: drag anywhere on the image, or focus it and use the
   arrow keys (a hidden range input carries the keyboard and screen reader). */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-compare]').forEach(fig => {
    const stage = fig.querySelector('.compare-stage');
    const range = fig.querySelector('.compare-range');
    const set = v => { v = Math.max(0, Math.min(100, v)); stage.style.setProperty('--pos', v + '%'); range.value = v; };
    const fromX = x => { const r = stage.getBoundingClientRect(); return (x - r.left) / r.width * 100; };
    let dragging = false;
    stage.addEventListener('pointerdown', e => { dragging = true; stage.setPointerCapture(e.pointerId); set(fromX(e.clientX)); });
    stage.addEventListener('pointermove', e => { if (dragging) set(fromX(e.clientX)); });
    const stop = () => { dragging = false; };
    stage.addEventListener('pointerup', stop);
    stage.addEventListener('pointercancel', stop);
    range.addEventListener('input', () => set(+range.value));
    set(+range.value || 50);

    /* One gentle sweep the first time it scrolls into view, so people see it moves */
    if (reduceMotion() || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now(), dur = 1400;
      const step = now => {
        if (dragging) return;
        const p = Math.min(1, (now - t0) / dur);
        set(50 + Math.sin(p * Math.PI * 2) * 22 * (1 - p));
        if (p < 1) requestAnimationFrame(step);
      };
      setTimeout(() => requestAnimationFrame(step), 250);
    }), { threshold: 0.6 });
    io.observe(stage);
  });
});

/* Homepage stats: count up the first time the row is in view, with a small
   ruler (one tick per year or brand) or a percent bar underneath. */
document.addEventListener('DOMContentLoaded', () => {
  const spec = document.querySelector('.spec[data-countup-row]');
  if (!spec) return;
  const cells = [...spec.querySelectorAll('[data-countup]')].map(el => {
    const final = el.textContent.trim();
    const to = +el.dataset.countup, pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    el.innerHTML = '<span class="vh"></span><span aria-hidden="true"></span>';
    el.firstChild.textContent = final;
    const shown = el.lastChild;
    const meter = document.createElement('div');
    meter.setAttribute('aria-hidden', 'true');
    if (el.dataset.ticks) {
      meter.className = 'spec-meter spec-meter--ticks';
      for (let i = 0; i < +el.dataset.ticks; i++) meter.insertAdjacentHTML('beforeend', '<i style="--i:' + i + '"></i>');
    } else if (el.dataset.bar) {
      meter.className = 'spec-meter spec-meter--bar';
      meter.innerHTML = '<b style="--v:' + el.dataset.bar + '%"></b>';
    }
    el.after(meter);
    return { to, pre, suf, shown, final };
  });
  const finish = () => { cells.forEach(c => { c.shown.textContent = c.final; }); spec.classList.add('is-counted'); };
  if (reduceMotion() || !('IntersectionObserver' in window)) { finish(); return; }
  cells.forEach(c => { c.shown.textContent = c.pre + '0' + c.suf; });
  const run = () => {
    spec.classList.add('is-counted');
    const t0 = performance.now(), dur = 1100;
    const step = now => {
      const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      cells.forEach(c => { c.shown.textContent = c.pre + Math.round(c.to * e) + c.suf; });
      if (p < 1) requestAnimationFrame(step); else finish();
    };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    io.disconnect();
    /* Wait for the intro splash to leave so the count is actually seen */
    if (document.querySelector('.intro')) document.addEventListener('tw:intro-done', run, { once: true });
    else run();
  }), { threshold: 0.5 });
  io.observe(spec);
});

/* Page transitions: the clicked case study image grows into the next page's
   hero, and shrinks back on the way home. Uses cross-document view
   transitions where the browser supports them; everywhere else pages load
   normally. Case study heroes are named in CSS; here we name the one
   homepage thumbnail involved, and skip any image that is off screen so
   nothing flies in from outside the viewport. */
(function () {
  const page = u => { try { return (new URL(u, location.href).pathname.split('/').pop() || 'index.html').replace(/\.html$/, ''); } catch (e) { return ''; } };
  const here = page(location.href);
  const isCase = p => p.indexOf('case-study-') === 0;
  const thumbFor = p => document.querySelector('.work-media[href="' + p + '.html"] img');
  const onScreen = el => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; };
  const name = (el, vt, n) => { el.style.viewTransitionName = n; vt.finished.finally(() => { el.style.viewTransitionName = ''; }); };
  let lastHref = '';
  document.addEventListener('click', e => { const a = e.target.closest && e.target.closest('a[href]'); if (a) lastHref = a.href; }, true);

  window.addEventListener('pageswap', e => {
    if (!e.viewTransition) return;
    const to = page((e.activation && e.activation.entry && e.activation.entry.url) || lastHref);
    const thumb = isCase(to) && thumbFor(to);
    if (thumb && onScreen(thumb)) name(thumb, e.viewTransition, 'cs-media');
    const hero = document.querySelector('.cs-hero-media img');
    if (hero && !onScreen(hero)) name(hero, e.viewTransition, 'none');
  });
  window.addEventListener('pagereveal', e => {
    if (!e.viewTransition) return;
    const act = window.navigation && navigation.activation;
    const from = page((act && act.from && act.from.url) || document.referrer);
    const thumb = isCase(from) && from !== here && thumbFor(from);
    if (thumb && onScreen(thumb)) name(thumb, e.viewTransition, 'cs-media');
  });
})();
