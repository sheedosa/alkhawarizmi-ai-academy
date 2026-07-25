/* AlKhwarizmi AI Academy — site runtime.
   Language toggle (EN/AR + RTL), mobile menu, form submission. */
(function () {
  'use strict';

  var LOGO_ALT = { en: 'AlKhwarizmi AI Academy', ar: 'أكاديمية الخوارزمي للذكاء الاصطناعي' };
  var TOGGLE_LABEL = { en: 'التبديل إلى العربية — Switch to Arabic', ar: 'Switch to English — التبديل إلى الإنجليزية' };
  var lang = 'en';

  function applyLang(l) {
    lang = l;
    var root = document.getElementById('wa-root');
    if (!root) return;
    // Document-level language + direction (screen readers, search engines, scrollbar side)
    document.documentElement.lang = l;
    document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
    root.setAttribute('dir', l === 'ar' ? 'rtl' : 'ltr');
    // NOTE: the translation swap assumes every [data-en] element is a LEAF
    // (text only). Nesting markup inside a [data-en] element would be wiped
    // by the textContent assignment — keep translations on leaf spans.
    root.querySelectorAll('[data-en]').forEach(function (el) {
      if (el.children.length) return; // defensive leaf guard
      var t = el.getAttribute(l === 'ar' ? 'data-ar' : 'data-en');
      if (t != null) el.textContent = t;
    });
    document.querySelectorAll('a.skip[data-en]').forEach(function (el) {
      var t = el.getAttribute(l === 'ar' ? 'data-ar' : 'data-en');
      if (t != null) el.textContent = t;
    });
    root.querySelectorAll('[data-ph-en]').forEach(function (el) {
      el.placeholder = el.getAttribute(l === 'ar' ? 'data-ph-ar' : 'data-ph-en') || '';
    });
    root.querySelectorAll('img[data-logo-en]').forEach(function (img) {
      img.src = img.getAttribute(l === 'ar' ? 'data-logo-ar' : 'data-logo-en');
      if (img.alt) img.alt = LOGO_ALT[l]; // keep decorative alt="" empty
    });
    // Language toggle button semantics: label announces the TARGET language
    var btn = document.querySelector('[data-dc-onclick="toggleLang"]');
    if (btn) {
      btn.setAttribute('aria-label', TOGGLE_LABEL[l]);
      btn.setAttribute('lang', l === 'ar' ? 'en' : 'ar');
    }
    try { localStorage.setItem('wa-lang', l); } catch (e) { /* private mode */ }
  }


  function closeMenu() {
    var header = document.getElementById('wa-nav');
    var btn = document.querySelector('.nav-toggle');
    if (header) header.classList.remove('menu-open');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  function toggleMenu() {
    var header = document.getElementById('wa-nav');
    var btn = document.querySelector('.nav-toggle');
    if (!header || !btn) return;
    var open = header.classList.toggle('menu-open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function submit(e, kind) {
    e.preventDefault();
    var body = [].slice.call(e.target.querySelectorAll('input,select,textarea')).map(function (el) {
      var lb = (el.labels && el.labels[0]) ||
               (el.closest('div') ? el.closest('div').querySelector('label') : null);
      var v = el.tagName === 'SELECT' ? (el.selectedOptions[0] ? el.selectedOptions[0].textContent : '') : el.value;
      return (lb ? lb.textContent + ': ' : '') + v;
    }).join('\n');
    window.location.href = 'mailto:info@alkhawarizmi.ai?subject=' +
      encodeURIComponent(kind + ' — AlKhwarizmi AI Academy') +
      '&body=' + encodeURIComponent(body + '\n');
  }

  var handlers = {
    toggleLang: function () { applyLang(lang === 'ar' ? 'en' : 'ar'); },
    toggleMenu: toggleMenu,
    submitStudent: function (e) { submit(e, 'Student Registration'); },
    submitDiploma: function (e) { submit(e, 'Diploma Application'); },
    submitInstructor: function (e) { submit(e, 'Instructor Application'); }
  };

  function boot() {
    // Restore persisted language
    var saved = null;
    try { saved = localStorage.getItem('wa-lang'); } catch (e) { /* private mode */ }
    if (saved === 'ar') applyLang('ar');

    document.querySelectorAll('[data-dc-onclick]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        var f = handlers[el.getAttribute('data-dc-onclick')]; if (f) f(e);
      });
    });
    document.querySelectorAll('[data-dc-onsubmit]').forEach(function (el) {
      el.addEventListener('submit', function (e) {
        var f = handlers[el.getAttribute('data-dc-onsubmit')]; if (f) f(e);
      });
    });

    // Mobile menu: close on link click, Escape, outside click, desktop resize
    var menu = document.getElementById('wa-menu');
    if (menu) {
      menu.addEventListener('click', function (e) {
        if (e.target.closest('a')) closeMenu();
      });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        var header = document.getElementById('wa-nav');
        if (header && header.classList.contains('menu-open')) {
          closeMenu();
          var btn = document.querySelector('.nav-toggle');
          if (btn) btn.focus();
        }
      }
    });
    document.addEventListener('click', function (e) {
      var header = document.getElementById('wa-nav');
      if (header && header.classList.contains('menu-open') && !e.target.closest('#wa-nav')) closeMenu();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 768) closeMenu();
    });
  }

  if (document.readyState !== 'loading') boot();
  else document.addEventListener('DOMContentLoaded', boot);
})();
