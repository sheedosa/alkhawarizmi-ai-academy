// AlKhwarizmi AI — Home: language toggle, header dropdowns, mobile menu.
(function () {
  var root = document.documentElement;
  var STORAGE_KEY = 'akaa-lang';
  var TITLES = {
    en: "AlKhwarizmi AI — Libya's first AI academy",
    ar: 'الخوارزمي للذكاء الاصطناعي — أول أكاديمية للذكاء الاصطناعي في ليبيا',
  };

  function setLang(lang) {
    root.lang = lang;
    root.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.title = TITLES[lang];
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
  }

  document.title = TITLES[root.lang === 'ar' ? 'ar' : 'en'];

  document.querySelectorAll('[data-lang-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      setLang(root.lang === 'ar' ? 'en' : 'ar');
    });
  });

  // Dropdowns: open on hover (pointer devices) and on click; close on Escape or outside click.
  var groups = Array.prototype.slice.call(document.querySelectorAll('[data-dropdown]'));

  function setOpen(group, open) {
    group.classList.toggle('is-open', open);
    group.querySelector('.nav__trigger').setAttribute('aria-expanded', String(open));
  }
  function closeAll(except) {
    groups.forEach(function (g) { if (g !== except) setOpen(g, false); });
  }

  groups.forEach(function (group) {
    var trigger = group.querySelector('.nav__trigger');
    // Hover only for a real mouse: on touch, pointerenter + click would open then instantly close.
    group.addEventListener('pointerenter', function (e) {
      if (e.pointerType === 'mouse') { closeAll(group); setOpen(group, true); }
    });
    group.addEventListener('pointerleave', function (e) {
      if (e.pointerType === 'mouse') setOpen(group, false);
    });
    trigger.addEventListener('click', function () {
      var open = !group.classList.contains('is-open');
      closeAll(group);
      setOpen(group, open);
    });
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('[data-dropdown]')) closeAll();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var open = groups.filter(function (g) { return g.classList.contains('is-open'); })[0];
    closeAll();
    if (open) open.querySelector('.nav__trigger').focus();
  });

  // Mobile menu
  var menuBtn = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.getElementById('mobile-nav');
  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', function () {
      var open = !mobileNav.classList.contains('is-open');
      mobileNav.classList.toggle('is-open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
    });
    var closeMenu = function () {
      mobileNav.classList.remove('is-open');
      menuBtn.setAttribute('aria-expanded', 'false');
    };
    mobileNav.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileNav.classList.contains('is-open')) { closeMenu(); menuBtn.focus(); }
    });
    // Leaving the mobile layout (rotation, resize) closes the panel.
    window.matchMedia('(min-width: 1101px)').addEventListener('change', function (mq) {
      if (mq.matches) closeMenu();
    });
  }
})();
