/* Flipbook for the Levi's Slippers and Damen + Hastings case studies.
   Page size, size labels and chapters can be set per book with data-page-w,
   data-page-h, data-size-single, data-size-spread and data-chapters (JSON).
   Uses StPageFlip (page-flip@2.0.7, loaded before this file) for the page turn.
   If that library doesn't load, the pages fall back to a swipeable strip. */
(function () {
  var book = document.querySelector('[data-book]');
  if (!book) return;

  var pagesEl = book.querySelector('.book-pages');
  var stage = book.querySelector('.book-stage');
  var pages = Array.prototype.slice.call(pagesEl.querySelectorAll('.book-page'));
  var total = pages.length;
  var prev = book.querySelector('[data-book-prev]');
  var next = book.querySelector('[data-book-next]');
  var countEl = book.querySelector('.book-count');
  var chapterEl = book.querySelector('.book-chapter');
  var dim = book.querySelector('.book-dim');
  var dimLabel = dim ? dim.querySelector('b') : null;
  var shadow = book.querySelector('.book-shadow');
  var tocButtons = Array.prototype.slice.call(document.querySelectorAll('[data-book-go]'));
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var pageW = +book.dataset.pageW || 500, pageH = +book.dataset.pageH || 500;
  var sizeSingle = book.dataset.sizeSingle || '8 × 8 in page';
  var sizeSpread = book.dataset.sizeSpread || '16 × 8 in open spread';

  /* Chapter for every page index (0-based), read from the book's own contents page */
  var chapters = book.dataset.chapters ? JSON.parse(book.dataset.chapters) : [
    [0, 0, 'Cover'], [1, 2, 'Levi’s + Randa'], [3, 4, 'The Slipper'],
    [5, 6, 'Sundries, branding & linings'], [7, 8, 'Outsole design'],
    [9, 10, 'Downtime Convertible'], [11, 12, 'Coastal Convertible'], [13, 14, 'Double Up Glide'],
    [15, 16, 'Sidewalk Slip On'], [17, 18, 'Sidewalk Loafer'], [19, 20, 'Vintage Mid Rise'],
    [21, 22, 'Midtop Wanderer'], [23, 24, 'Laidback Wanderer'], [25, 26, 'Premium Crafted'],
    [27, 28, 'Packaging'], [29, 29, 'Gifting'], [30, 31, 'Back cover']
  ];
  function chapterOf(i) {
    for (var c = 0; c < chapters.length; c++) if (i >= chapters[c][0] && i <= chapters[c][1]) return chapters[c][2];
    return '';
  }

  if (typeof window.St === 'undefined' || !window.St.PageFlip) {
    book.classList.add('is-static');
    var bar = book.querySelector('.book-bar');
    if (bar) bar.hidden = true;
    tocButtons.forEach(function (b) {
      b.addEventListener('click', function () {
        var p = pages[+b.dataset.bookGo];
        if (p) p.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });
      });
    });
    return;
  }

  pages[0].classList.add('is-cover');
  pages[total - 1].classList.add('is-cover');

  var pf = new window.St.PageFlip(pagesEl, {
    width: pageW, height: pageH, size: 'stretch',
    minWidth: Math.round(pageW * 0.48), maxWidth: Math.round(pageW * 1.04),
    minHeight: Math.round(pageH * 0.48), maxHeight: Math.round(pageH * 1.04),
    showCover: true, usePortrait: true, autoSize: true,
    maxShadowOpacity: 0.45, flippingTime: reduced ? 1 : 800,
    mobileScrollSupport: true, showPageCorners: !reduced, startZIndex: 1
  });
  pf.loadFromHTML(pages);

  function isPortrait() { return pf.getOrientation() === 'portrait'; }

  /* In a spread, report the left-hand page so counts read "Pages 10-11" */
  function current() {
    var i = pf.getCurrentPageIndex();
    if (!isPortrait() && i > 0 && i % 2 === 0) i -= 1;
    return i;
  }

  function update() {
    var i = current();
    var portrait = isPortrait();
    book.classList.toggle('is-portrait', portrait);
    var single = portrait || i === 0 || i === total - 1;
    var label;
    if (portrait || i === 0 || i === total - 1) label = (i === 0 ? 'Cover' : i === total - 1 ? 'Back cover' : 'Page ' + (i + 1)) + ' of ' + total;
    else label = 'Pages ' + (i + 1) + '–' + (i + 2) + ' of ' + total;
    if (countEl) countEl.textContent = label;
    var ch = chapterOf(i);
    if (!single && chapterOf(i + 1) !== ch && chapterOf(i + 1)) ch = ch + ' / ' + chapterOf(i + 1);
    if (chapterEl) chapterEl.textContent = ch;

    if (prev) prev.disabled = i <= 0;
    if (next) next.disabled = portrait ? i >= total - 1 : i >= total - 1;

    /* Active contents entry: the last chapter start at or before this page */
    var active = null;
    tocButtons.forEach(function (b) { if (+b.dataset.bookGo <= (single ? i : i + 1)) active = b; });
    tocButtons.forEach(function (b) { b.setAttribute('aria-current', b === active ? 'true' : 'false'); });

    /* Dimension line and floor shadow follow what is open */
    var r = pf.getBoundsRect();
    if (!r || !dim) return;
    /* A closed book slides to the center of the stage instead of sitting
       on one half of an empty spread */
    var shift = 0;
    if (!portrait && i === 0) shift = -r.pageWidth / 2;
    else if (!portrait && i === total - 1) shift = r.pageWidth / 2;
    pagesEl.style.transform = shift ? 'translateX(' + shift + 'px)' : '';
    var off = pagesEl.offsetLeft + pagesEl.parentNode.offsetLeft;
    var left = r.left, width = r.width;
    if (!portrait && i === 0) { left = r.left + r.pageWidth + shift; width = r.pageWidth; }
    else if (!portrait && i === total - 1) { left = r.left + shift; width = r.pageWidth; }
    else if (portrait) { width = r.pageWidth; }
    stage.style.setProperty('--dim-l', (off + left) + 'px');
    stage.style.setProperty('--dim-w', width + 'px');
    if (dimLabel) dimLabel.textContent = (single ? sizeSingle : sizeSpread);
  }

  function go(i) {
    i = Math.max(0, Math.min(total - 1, i));
    if (reduced) { pf.turnToPage(i); update(); }
    else pf.flip(i);
  }

  if (prev) prev.addEventListener('click', function () { reduced ? go(current() - (isPortrait() ? 1 : 2)) : pf.flipPrev(); });
  if (next) next.addEventListener('click', function () { reduced ? go(current() + (isPortrait() ? 1 : (current() === 0 ? 1 : 2))) : pf.flipNext(); });
  tocButtons.forEach(function (b) { b.addEventListener('click', function () { go(+b.dataset.bookGo); }); });

  stage.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); next.click(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); prev.click(); }
  });

  /* Slide back to the open position as soon as a closed cover starts to turn */
  pf.on('changeState', function (e) {
    if (e.data === 'flipping' || e.data === 'user_fold') {
      var i = pf.getCurrentPageIndex();
      if (!isPortrait() && (i === 0 || i === total - 1)) {
        pagesEl.style.transform = '';
        stage.style.setProperty('--dim-l', (pagesEl.offsetLeft + pagesEl.parentNode.offsetLeft + pf.getBoundsRect().left) + 'px');
        stage.style.setProperty('--dim-w', pf.getBoundsRect().width + 'px');
        if (dimLabel) dimLabel.textContent = sizeSpread;
      }
    } else if (e.data === 'read') update();
  });
  pf.on('flip', update);
  pf.on('changeOrientation', function () { setTimeout(update, 0); });
  pf.on('init', update);
  window.addEventListener('resize', function () { setTimeout(update, 60); });
  setTimeout(update, 0);
})();
