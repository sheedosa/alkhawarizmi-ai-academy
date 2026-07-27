/* AlKhwarizmi AI Academy site runtime.
   Language toggle (EN/AR + RTL), story tabs, course filter,
   mobile menu, register-interest form. */
(function () {
  'use strict';

  var LOGO_ALT = { en: 'AlKhwarizmi AI Academy', ar: 'أكاديمية الخوارزمي للذكاء الاصطناعي' };
  var TOGGLE_LABEL = { en: 'التبديل إلى العربية / Switch to Arabic', ar: 'Switch to English / التبديل إلى الإنجليزية' };
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
    // Counts and the status line are JS-composed, so re-render them in the new language.
    updateCounts();
    announce(progCards().filter(function (c) { return !c.hidden; }).length);
  }

  function setTab(t) {
    var k = document.getElementById('wa-panelK'), m = document.getElementById('wa-panelM');
    var bk = document.getElementById('wa-tabK'), bm = document.getElementById('wa-tabM');
    if (!k || !m || !bk || !bm) return;
    // Class-driven state: CSS owns appearance so media queries can restack panels
    k.classList.toggle('off', t !== 'k');
    m.classList.toggle('on', t === 'm');
    bk.classList.toggle('active', t === 'k');
    bm.classList.toggle('active', t === 'm');
    bk.setAttribute('aria-selected', t === 'k' ? 'true' : 'false');
    bm.setAttribute('aria-selected', t === 'm' ? 'true' : 'false');
    bk.tabIndex = t === 'k' ? 0 : -1;
    bm.tabIndex = t === 'm' ? 0 : -1;
  }

  /* ---------- Programs category filter ---------- */

  var AR_DIGITS = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
  function localiseNum(n) {
    var s = String(n);
    return lang === 'ar' ? s.replace(/[0-9]/g, function (d) { return AR_DIGITS[+d]; }) : s;
  }

  function progCards() {
    return [].slice.call(document.querySelectorAll('#prog-grid .card'));
  }

  // Counts are derived from the DOM so they can never go stale when courses are added.
  function updateCounts() {
    var cards = progCards();
    if (!cards.length) return;
    document.querySelectorAll('.cat').forEach(function (btn) {
      var cat = btn.getAttribute('data-cat');
      var n = cat === 'all' ? cards.length : cards.filter(function (c) {
        return c.getAttribute('data-cat') === cat;
      }).length;
      var el = btn.querySelector('.cat-count');
      if (el) el.textContent = localiseNum(n);
    });
  }

  function announce(n) {
    var el = document.getElementById('prog-status');
    if (!el) return;
    // Template lives on data-tpl-* (not data-en) so applyLang cannot overwrite the composed text.
    var tpl = el.getAttribute(lang === 'ar' ? 'data-tpl-ar' : 'data-tpl-en') || '';
    el.textContent = tpl.replace('{n}', localiseNum(n));
  }

  function setCat(cat) {
    var shown = 0;
    progCards().forEach(function (c) {
      var match = cat === 'all' || c.getAttribute('data-cat') === cat;
      c.hidden = !match;
      if (match) shown++;
    });
    document.querySelectorAll('.cat').forEach(function (b) {
      var on = b.getAttribute('data-cat') === cat;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    announce(shown);
  }

  function activeCat() {
    var b = document.querySelector('.cat.active');
    return b ? b.getAttribute('data-cat') : 'all';
  }

  /* ---------- Register-interest form ---------- */

  // Submissions relay through FormSubmit to the academy inbox. Static hosting
  // cannot send mail directly; swapping providers is a one-line change here.
  var FORM_ENDPOINT = 'https://formsubmit.co/ajax/info@alkhawarizmi.ai';

  function fieldVal(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function btnLabel(btn) {
    return btn.getAttribute(lang === 'ar' ? 'data-ar' : 'data-en') || 'Register my interest';
  }

  function showThanks() {
    var form = document.getElementById('reg-form');
    var thanks = document.getElementById('reg-thanks');
    if (form) form.hidden = true;
    if (thanks) { thanks.hidden = false; thanks.focus(); }
  }

  // Course cards link to the form and preselect themselves, so the visitor
  // does not have to re-state which course they were looking at.
  function pickProgram(e) {
    var val = e.currentTarget.getAttribute('data-program');
    var sel = document.getElementById('reg-program');
    if (sel && val) sel.value = val;
  }

  function submitInterest(e) {
    e.preventDefault();
    var form = document.getElementById('reg-form');
    if (!form) return;
    // novalidate is set on the form so we control when messages appear
    if (!form.checkValidity()) { form.reportValidity(); return; }

    var btn = document.getElementById('reg-submit');
    var errEl = document.getElementById('reg-error');
    var sel = document.getElementById('reg-program');
    var program = sel && sel.selectedOptions[0] ? sel.selectedOptions[0].textContent.trim() : '';

    if (errEl) errEl.hidden = true;
    if (btn) {
      btn.disabled = true;
      btn.setAttribute('aria-busy', 'true');
      btn.textContent = lang === 'ar' ? 'جارٍ الإرسال…' : 'Sending…';
    }

    fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        _subject: 'New interest registration from the website',
        _captcha: 'false',
        _template: 'table',
        Name: fieldVal('reg-name'),
        Email: fieldVal('reg-email'),
        Phone: fieldVal('reg-phone'),
        Program: program,
        Message: fieldVal('reg-message'),
        Language: lang === 'ar' ? 'Arabic' : 'English'
      })
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function () {
      showThanks();
    }).catch(function () {
      // Never fail silently: surface the error and offer the direct email route.
      if (errEl) errEl.hidden = false;
      if (btn) {
        btn.disabled = false;
        btn.removeAttribute('aria-busy');
        btn.textContent = btnLabel(btn);
      }
    });
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


  var handlers = {
    toggleLang: function () { applyLang(lang === 'ar' ? 'en' : 'ar'); },
    setTabK: function () { setTab('k'); },
    setTabM: function () { setTab('m'); },
    // One handler serves all category tiles — the listener is bound per element,
    // so currentTarget resolves to the tile that was clicked.
    setCat: function (e) { setCat(e.currentTarget.getAttribute('data-cat')); },
    toggleMenu: toggleMenu,
    pickProgram: pickProgram,
    submitInterest: submitInterest,
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

    // Tablist arrow-key support (LTR/RTL aware enough: two tabs, both arrows cycle)
    var tablist = document.querySelector('[role="tablist"]');
    if (tablist) {
      tablist.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        e.preventDefault();
        var active = document.querySelector('[role="tab"].active');
        var next = active && active.id === 'wa-tabK' ? 'm' : 'k';
        setTab(next);
        document.getElementById(next === 'k' ? 'wa-tabK' : 'wa-tabM').focus();
      });
    }

    // Category tiles: initial counts, plus roving keyboard navigation.
    // Scoped to .cat-row so it cannot collide with the Story tablist listener above.
    updateCounts();
    var catRow = document.querySelector('.cat-row');
    if (catRow) {
      catRow.addEventListener('keydown', function (e) {
        var keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
        if (keys.indexOf(e.key) === -1) return;
        var tiles = [].slice.call(catRow.querySelectorAll('.cat'));
        var i = tiles.indexOf(document.activeElement);
        if (i === -1) return;
        e.preventDefault();
        var next;
        if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = tiles.length - 1;
        else {
          // In RTL, ArrowRight moves to the previous tile.
          var forward = (e.key === 'ArrowRight') !== (document.documentElement.dir === 'rtl');
          next = (i + (forward ? 1 : -1) + tiles.length) % tiles.length;
        }
        tiles[next].focus();
      });
    }

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
