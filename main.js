// AlKhwarizmi AI — Home: language toggle, header dropdowns, mobile menu.
(function () {
  var root = document.documentElement;
  var STORAGE_KEY = 'akaa-lang';
  // Bilingual <title data-en="…" data-ar="…">; falls back to the current text.
  var titleEl = document.querySelector('title');
  var TITLES = {
    en: (titleEl && titleEl.getAttribute('data-en')) || document.title,
    ar: (titleEl && titleEl.getAttribute('data-ar')) || document.title,
  };

  // Text that CSS cannot switch (option labels, placeholders, meta, aria) carries data-en / data-ar.
  function applyLang(lang) {
    document.title = TITLES[lang];
    document.querySelectorAll('option[data-en]').forEach(function (o) { o.textContent = o.getAttribute('data-' + lang); });
    document.querySelectorAll('[data-ph-en]').forEach(function (el) { el.placeholder = el.getAttribute('data-ph-' + lang); });
    document.querySelectorAll('[data-aria-en]').forEach(function (el) { el.setAttribute('aria-label', el.getAttribute('data-aria-' + lang)); });
    var md = document.querySelector('meta[name="description"][data-ar]');
    if (md) md.setAttribute('content', md.getAttribute('data-' + lang) || md.getAttribute('content'));
    document.dispatchEvent(new CustomEvent('akaa:lang', { detail: { lang: lang } }));
  }
  function setLang(lang) {
    root.lang = lang;
    root.dir = lang === 'ar' ? 'rtl' : 'ltr';
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    applyLang(lang);
  }
  var md0 = document.querySelector('meta[name="description"]');
  if (md0 && !md0.hasAttribute('data-en')) md0.setAttribute('data-en', md0.getAttribute('content'));
  applyLang(root.lang === 'ar' ? 'ar' : 'en');

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
      document.documentElement.classList.toggle('menu-open', open);  // lock the page behind the open menu
      menuBtn.setAttribute('aria-expanded', String(open));
    });
    var closeMenu = function () {
      mobileNav.classList.remove('is-open');
      document.documentElement.classList.remove('menu-open');
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

/* =====================================================================
   Inner pages: active nav, analytics, lead forms, Insights filter, Contact
   ===================================================================== */
(function () {
  var root = document.documentElement;
  var cfg = window.AKAA_CONFIG || {};
  var AKAA = (window.AKAA = window.AKAA || {});

  // ---- Active nav item (from <body data-active="individuals|enterprise|about|insights|contact">)
  var active = document.body.getAttribute('data-active');
  if (active) {
    document.querySelectorAll('[data-nav]').forEach(function (el) {
      if (el.getAttribute('data-nav') === active) el.classList.add('is-active');
    });
  }

  // ---- Session id (no cookies; lives for the tab) and attribution
  function sessionId() {
    try {
      var k = 'akaa-sid', v = sessionStorage.getItem(k);
      if (!v) { v = Math.random().toString(36).slice(2) + Date.now().toString(36); sessionStorage.setItem(k, v); }
      return v;
    } catch (e) { return ''; }
  }
  function attribution() {
    var q = new URLSearchParams(location.search), out = {};
    ['utm_source', 'utm_medium', 'utm_campaign'].forEach(function (k) {
      var v = q.get(k);
      if (v) { out[k] = v; try { sessionStorage.setItem('akaa-' + k, v); } catch (e) {} }
      else { try { out[k] = sessionStorage.getItem('akaa-' + k) || null; } catch (e) { out[k] = null; } }
    });
    return out;
  }
  attribution(); // persist UTMs on landing

  // ---- Google Analytics 4 (loaded only when an id is configured)
  if (cfg.GA4_ID) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    var s = document.createElement('script');
    s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(cfg.GA4_ID);
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', cfg.GA4_ID, { anonymize_ip: true, language: root.lang });
  }
  AKAA.track = function (name, params) {
    var p = Object.assign({ lang: root.lang, page: location.pathname.split('/').pop() || 'index.html' }, params || {});
    if (typeof window.gtag === 'function') window.gtag('event', name, p);
    if (AKAA.debug) console.log('[track]', name, p);
  };
  var programme = document.body.getAttribute('data-programme');
  if (programme) AKAA.track('view_programme', { programme: programme });
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-track]');
    if (!el) return;
    var parts = el.getAttribute('data-track').split(':');
    AKAA.track(parts[0], { label: parts[1] || el.textContent.trim().slice(0, 60) });
  });
  document.querySelectorAll('[data-lang-toggle]').forEach(function (b) {
    b.addEventListener('click', function () { AKAA.track('lang_toggle', { to: root.lang }); });
  });

  // ---- Lead forms: <form data-lead="studio|diploma|week|custom|policy|contact">
  var FORM_AUDIENCE = { studio: 'individual', diploma: 'individual', week: 'organisation', custom: 'organisation', policy: 'organisation' };

  function leadPayload(form) {
    var fd = new FormData(form), data = {};
    fd.forEach(function (v, k) { if (k !== 'website') data[k] = String(v).trim(); }); // 'website' is the honeypot
    var kind = form.getAttribute('data-lead');
    var att = attribution();
    return Object.assign({
      form: (data.programme && FORM_AUDIENCE[data.programme]) ? data.programme : kind,
      audience: data.audience || FORM_AUDIENCE[kind] || null,
      programme: data.programme || kind,
      edition: data.edition || null,
      name: data.name, email: data.email, phone: data.phone || null,
      organisation: data.organisation || null, role: data.role || null, message: data.message || null,
      lang: root.lang, source_page: location.pathname + location.hash, referrer: document.referrer || null,
      session_id: sessionId(), user_agent: navigator.userAgent.slice(0, 200)
    }, att);
  }

  function supabaseInsert(row) {
    if (!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY) return Promise.reject(new Error('not-configured'));
    return fetch(cfg.SUPABASE_URL.replace(/\/$/, '') + '/rest/v1/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: cfg.SUPABASE_ANON_KEY, Authorization: 'Bearer ' + cfg.SUPABASE_ANON_KEY, Prefer: 'return=minimal' },
      body: JSON.stringify(row)
    }).then(function (r) { if (!r.ok) throw new Error('http-' + r.status); });
  }

  function mailtoFallback(row) {
    var lines = Object.keys(row).filter(function (k) { return row[k] && !/^(session_id|user_agent|referrer)$/.test(k); })
      .map(function (k) { return k + ': ' + row[k]; });
    var subject = '[Website] ' + row.form + ' — ' + row.name;
    location.href = 'mailto:info@alkhawarizmi.ai?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
  }

  document.querySelectorAll('form[data-lead]').forEach(function (form) {
    var started = false;
    form.addEventListener('input', function () {
      if (!started) { started = true; AKAA.track('form_start', { form: form.getAttribute('data-lead') }); }
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var hp = form.querySelector('[name="website"]');
      if (hp && hp.value) return; // bot
      var row = leadPayload(form);
      var sentOk = document.getElementById(form.getAttribute('data-sent'));
      var sentMail = document.getElementById(form.getAttribute('data-sent-mailto'));
      form.classList.remove('is-error'); form.classList.add('is-busy');
      var finish = function (via) {
        form.classList.remove('is-busy'); form.classList.add('is-sent');
        var sent = (via === 'mailto' && sentMail) ? sentMail : sentOk;
        if (sent) { sent.classList.add('is-visible'); sent.setAttribute('tabindex', '-1'); sent.focus(); }
        AKAA.track('generate_lead', { form: row.form, programme: row.programme, audience: row.audience, via: via });
      };
      supabaseInsert(row).then(function () { finish('supabase'); }).catch(function (err) {
        if (err.message === 'not-configured') { mailtoFallback(row); finish('mailto'); return; }
        form.classList.remove('is-busy'); form.classList.add('is-error');
        AKAA.track('form_error', { form: row.form, error: err.message });
      });
    });
  });

  // ---- Contact: show Organisation field only for organisations
  var who = document.querySelectorAll('input[name="audience"]');
  if (who.length) {
    var orgField = document.getElementById('field-organisation');
    var sync = function () {
      var v = document.querySelector('input[name="audience"]:checked');
      var isOrg = v && v.value === 'organisation';
      if (orgField) { orgField.hidden = !isOrg; orgField.querySelector('input').required = !!isOrg; }
    };
    who.forEach(function (r) { r.addEventListener('change', sync); });
    sync();
  }

  // ---- Organisations: preselect programme from the anchor the visitor arrived by
  var progSel = document.querySelector('select[name="programme"]');
  if (progSel) {
    var pick = function () {
      var h = location.hash.replace('#', '');
      if (h && progSel.querySelector('option[value="' + h + '"]')) progSel.value = h;
    };
    pick(); window.addEventListener('hashchange', pick);
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function () { var h = a.getAttribute('href').slice(1); if (progSel.querySelector('option[value="' + h + '"]')) progSel.value = h; });
    });
  }

  // ---- Insights: category filter
  var tabs = document.querySelectorAll('.filter-tabs button[data-cat]');
  if (tabs.length) {
    var cards = document.querySelectorAll('[data-cat-item]');
    var count = document.getElementById('index-count');
    var current = 'all';
    var apply = function (cat) {
      var n = 0;
      cards.forEach(function (c) { var show = cat === 'all' || c.getAttribute('data-cat-item') === cat; c.classList.toggle('is-hidden', !show); if (show) n++; });
      tabs.forEach(function (t) { t.setAttribute('aria-pressed', String(t.getAttribute('data-cat') === cat)); });
      if (count) {
        var label = document.querySelector('.filter-tabs button[data-cat="' + cat + '"]');
        var name = function (l) { var el = label && label.querySelector('[data-l="' + l + '"]'); return el ? el.textContent : ''; };
        var en = (n === 1 ? '1 piece' : n + ' pieces') + ' · ' + name('en');
        var ar = (n === 1 ? 'مقالة واحدة' : n === 2 ? 'مقالتان' : (n >= 3 && n <= 10) ? n + ' مقالات' : n + ' مقالة') + ' · ' + name('ar');
        count.innerHTML = '<span data-l="en">' + en + '</span><span data-l="ar">' + ar + '</span>';
      }
      current = cat;
      AKAA.track('filter_insights', { category: cat });
    };
    tabs.forEach(function (t) { t.addEventListener('click', function () { apply(t.getAttribute('data-cat')); }); });
    apply('all');
    document.addEventListener('akaa:lang', function () { apply(current); });
  }
})();


/* =====================================================================
   Phase A — sticky action bar, footer social links
   ===================================================================== */
(function () {
  var cfg = window.AKAA_CONFIG || {};

  // Action bar: shown once the hero has scrolled away, hidden again when the form is on screen.
  var bar = document.querySelector('[data-action-bar]');
  if (bar) {
    var hero = document.querySelector('main .hero');
    var target = document.querySelector(bar.getAttribute('data-target'));
    var ticking = false;
    var update = function () {
      ticking = false;
      var pastHero = hero ? hero.getBoundingClientRect().bottom < 0 : true;
      var formReached = target ? target.getBoundingClientRect().top < window.innerHeight * 0.85 : false;
      var show = pastHero && !formReached;
      if (show !== bar.classList.contains('is-visible')) {
        bar.classList.toggle('is-visible', show);
        if (show) bar.removeAttribute('inert'); else bar.setAttribute('inert', '');
      }
    };
    var onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }

  // Footer social links: rendered only for accounts set in config.js
  var NAMES = { linkedin: 'LinkedIn', instagram: 'Instagram', facebook: 'Facebook', x: 'X', youtube: 'YouTube', tiktok: 'TikTok' };
  var social = cfg.SOCIAL || {};
  document.querySelectorAll('[data-social]').forEach(function (el) {
    Object.keys(NAMES).forEach(function (k) {
      var url = social[k];
      if (!url || !/^https:\/\//.test(url)) return;
      var a = document.createElement('a');
      a.href = url; a.textContent = NAMES[k]; a.target = '_blank'; a.rel = 'noopener';
      a.setAttribute('data-track', 'cta_click:social_' + k);
      el.appendChild(a);
    });
    if (el.children.length) el.hidden = false;
  });
})();


/* Home hero: outputs card tabs (click or arrow keys; no autoplay) */
(function () {
  var card = document.querySelector('[data-hero-tabs]');
  if (!card) return;
  var tabs = Array.prototype.slice.call(card.querySelectorAll('[role="tab"]'));
  function select(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
    if (window.AKAA && AKAA.track) AKAA.track('cta_click', { label: 'hero_tab_' + (tab.id === 'hero-tab-org' ? 'organisations' : 'individuals') });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { select(t, false); });
    t.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      if (document.documentElement.dir === 'rtl') d = -d;
      e.preventDefault();
      select(tabs[(i + d + tabs.length) % tabs.length], true);
    });
  });
})();


/* Photo slots: <figure data-photo="id"> shows assets/photos/id.jpg if it exists.
   Probed only when the slot's section nears the viewport; empty slots stay hidden. ?photos shows labelled slots; ?photos=0 hides them. */
(function () {
  var root = document.documentElement;
  var DIR = 'assets/photos/';
  var q = new URLSearchParams(location.search), show = false;
  try {
    if (q.has('photos')) { if (q.get('photos') === '0') localStorage.removeItem('akaa-photos'); else localStorage.setItem('akaa-photos', '1'); }
    show = localStorage.getItem('akaa-photos') === '1';
  } catch (e) { show = q.has('photos') && q.get('photos') !== '0'; }
  if (show) root.classList.add('show-photo-slots');

  var lang = function () { return root.lang === 'ar' ? 'ar' : 'en'; };
  function fill(el) {
    if (el.getAttribute('data-probed')) return;
    el.setAttribute('data-probed', '1');
    var img = new Image();
    img.decoding = 'async';
    img.onload = function () {
      img.alt = el.getAttribute('data-alt-' + lang()) || '';
      el.appendChild(img);
      el.removeAttribute('aria-hidden');
      requestAnimationFrame(function () { el.classList.add('is-filled'); });
    };
    img.src = DIR + el.getAttribute('data-photo') + '.jpg';
  }
  var slots = document.querySelectorAll('[data-photo]');
  if ('IntersectionObserver' in window) {
    // Empty slots are display:none for visitors, so watch the section around each one instead.
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        e.target.__slots.forEach(fill);
      });
    }, { rootMargin: '400px 0px' });
    slots.forEach(function (el) {
      var anchor = el.closest('section, article') || el.parentNode;
      if (!anchor.__slots) { anchor.__slots = []; io.observe(anchor); }
      anchor.__slots.push(el);
    });
  } else { slots.forEach(fill); }

  var bg = document.querySelector('[data-photo-bg]');
  if (bg) {
    var b = new Image();
    b.onload = function () { bg.style.setProperty('--hero-photo', 'url("' + b.src + '")'); bg.classList.add('has-photo'); };
    b.src = DIR + bg.getAttribute('data-photo-bg') + '.jpg';
  }
  document.addEventListener('akaa:lang', function () {
    document.querySelectorAll('.photo.is-filled img').forEach(function (img) {
      img.alt = img.parentNode.getAttribute('data-alt-' + lang()) || '';
    });
  });
})();
