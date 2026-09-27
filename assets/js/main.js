(function () {
  var root = document.documentElement;

  function currentTheme() {
    var set = root.getAttribute('data-theme');
    if (set) return set;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  var toggle = document.querySelector('.theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) { /* ignore */ }
    });
  }

  var navToggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (navToggle && nav) {
    var setOpen = function (open) {
      navToggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('open', open);
    };
    navToggle.addEventListener('click', function () {
      setOpen(navToggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });
  }

  document.querySelectorAll('[data-print]').forEach(function (btn) {
    btn.addEventListener('click', function () { window.print(); });
  });
})();
