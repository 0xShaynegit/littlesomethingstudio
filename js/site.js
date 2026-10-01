(function () {
  var root = document.documentElement;

  var toggle = document.querySelector('.theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var dark = root.dataset.theme
        ? root.dataset.theme === 'dark'
        : matchMedia('(prefers-color-scheme: dark)').matches;
      root.dataset.theme = dark ? 'light' : 'dark';
      try { localStorage.setItem('tlss-theme', root.dataset.theme); } catch (e) {}
    });
  }

  var header = document.querySelector('.site-header');
  if (header && !header.classList.contains('solid')) {
    var onScroll = function () { header.dataset.scrolled = String(scrollY > 40); };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  var nav = document.getElementById('site-nav');
  var scrim = document.querySelector('.scrim-menu');
  var openBtn = document.querySelector('.menu-toggle');
  function setMenu(open) {
    nav.classList.toggle('open', open);
    scrim.classList.toggle('open', open);
    openBtn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if (nav && openBtn) {
    openBtn.addEventListener('click', function () { setMenu(true); });
    scrim.addEventListener('click', function () { setMenu(false); });
    nav.querySelector('.menu-close').addEventListener('click', function () { setMenu(false); });
    addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  }

  if ('IntersectionObserver' in window) {
    root.classList.add('js');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.rv').forEach(function (el) { io.observe(el); });
  }

  var params = new URLSearchParams(location.search);

  var grid = document.querySelector('[data-filter-grid]');
  if (grid) {
    var chips = document.querySelectorAll('[data-filter]');
    var apply = function (cat) {
      chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c.dataset.filter === cat)); });
      grid.querySelectorAll('[data-cats]').forEach(function (card) {
        card.hidden = cat !== 'all' && card.dataset.cats.split(' ').indexOf(cat) === -1;
      });
      var empty = document.querySelector('[data-filter-empty]');
      if (empty) empty.hidden = !!grid.querySelector('[data-cats]:not([hidden])');
    };
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        apply(c.dataset.filter);
        var u = new URL(location.href);
        c.dataset.filter === 'all' ? u.searchParams.delete('cat') : u.searchParams.set('cat', c.dataset.filter);
        history.replaceState(null, '', u);
      });
    });
    apply(params.get('cat') || 'all');
  }

  var galleryImgs = Array.prototype.slice.call(document.querySelectorAll('.gallery img'));
  if (galleryImgs.length) {
    var lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.innerHTML = '<button class="lb-close" type="button" aria-label="Close">'
      + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6 6 18"/></svg></button>'
      + '<button class="lb-prev" type="button" aria-label="Previous">'
      + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg></button>'
      + '<img alt="">'
      + '<button class="lb-next" type="button" aria-label="Next">'
      + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg></button>';
    document.body.appendChild(lb);
    var lbImg = lb.querySelector('img');
    var idx = 0;
    var show = function (i) {
      idx = (i + galleryImgs.length) % galleryImgs.length;
      lbImg.src = galleryImgs[idx].src;
      lbImg.alt = galleryImgs[idx].alt || '';
    };
    var open = function (i) {
      show(i);
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
    };
    var close = function () {
      lb.classList.remove('open');
      document.body.style.overflow = '';
    };
    galleryImgs.forEach(function (img, i) {
      img.addEventListener('click', function () { open(i); });
    });
    lb.querySelector('.lb-close').addEventListener('click', close);
    lb.querySelector('.lb-prev').addEventListener('click', function () { show(idx - 1); });
    lb.querySelector('.lb-next').addEventListener('click', function () { show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

  document.querySelectorAll('form[data-ajax]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      f.querySelector('button[type="submit"]').disabled = true;
      var d = new FormData(f);
      var done = function () {
        f.hidden = true;
        var msg = document.getElementById(f.dataset.done);
        msg.hidden = false;
        msg.scrollIntoView({ block: 'center' });
      };
      fetch(f.action, { method: 'POST', headers: { Accept: 'application/json' }, body: d })
        .then(function (r) { if (!r.ok) throw new Error(r.status); done(); })
        .catch(function () {
          var body = [];
          d.forEach(function (v, k) { if (k.charAt(0) !== '_' && v) body.push(k + ': ' + v); });
          location.href = 'mailto:thelittlesomething.studio@gmail.com?subject=' + encodeURIComponent(d.get('_subject')) + '&body=' + encodeURIComponent(body.join('\n'));
          done();
        });
    });
  });
})();
