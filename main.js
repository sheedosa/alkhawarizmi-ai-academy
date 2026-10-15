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
    document.querySelectorAll('img[data-alt-en]').forEach(function (el) { el.alt = el.getAttribute('data-alt-' + lang); });
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

  // Pages built with an Arabic twin (a hreflang link is present) switch language by going to the twin, so the
  // URL always says which language the page is in. Pages without one (404, old previews) switch in place.
  var twinUrl = function () {
    if (!document.querySelector('link[rel="alternate"][hreflang]')) return null;
    var inAr = /\/ar\/[^\/]*$/.test(location.pathname);
    return (inAr ? '../' : 'ar/') + location.pathname.split('/').pop() + location.search + location.hash;
  };
  document.querySelectorAll('[data-lang-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var next = root.lang === 'ar' ? 'en' : 'ar';
      var twin = twinUrl();
      if (twin) { try { localStorage.setItem(STORAGE_KEY, next); } catch (e) {} location.href = twin; return; }
      setLang(next);
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
    var closeTimer = null, lastPointer = '';
    // Hover only for a real mouse: on touch, pointerenter + click would open then instantly close.
    // Closing waits a moment, so moving diagonally from the trigger to an option doesn't shut the menu.
    group.addEventListener('pointerenter', function (e) {
      if (e.pointerType !== 'mouse') return;
      clearTimeout(closeTimer);
      closeAll(group); setOpen(group, true);
    });
    group.addEventListener('pointerleave', function (e) {
      if (e.pointerType !== 'mouse') return;
      clearTimeout(closeTimer);
      closeTimer = setTimeout(function () { setOpen(group, false); }, 250);
    });
    trigger.addEventListener('pointerdown', function (e) { lastPointer = e.pointerType; });
    trigger.addEventListener('click', function () {
      // With a mouse the menu is already open from hovering; a click should keep it open, not close it.
      if (lastPointer === 'mouse' && group.classList.contains('is-open')) { lastPointer = ''; return; }
      lastPointer = '';
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

  // Header: a soft shadow once the page has scrolled
  var header = document.querySelector('.site-header');
  if (header) {
    var ticking = false;
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { header.classList.toggle('is-scrolled', window.scrollY > 8); ticking = false; });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

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
    // The privacy notice describes analytics only while it runs
    document.querySelectorAll('[data-if-analytics]').forEach(function (el) { el.removeAttribute('hidden'); });
    document.querySelectorAll('[data-if-no-analytics]').forEach(function (el) { el.setAttribute('hidden', ''); });
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
    b.addEventListener('click', function () { AKAA.track('lang_toggle', { to: root.lang === 'ar' ? 'en' : 'ar' }); }, true);
  });

  // ---- Lead forms: <form data-lead="studio|diploma|week|custom|policy|contact">
  var FORM_AUDIENCE = { studio: 'individual', diploma: 'individual', week: 'organisation', custom: 'organisation', policy: 'organisation', demo: 'organisation' };

  function leadPayload(form) {
    var fd = new FormData(form), data = {};
    fd.forEach(function (v, k) { if (k !== 'website') data[k] = String(v).trim(); }); // 'website' is the honeypot
    var kind = form.getAttribute('data-lead');
    var att = attribution();
    return Object.assign({
      form: (data.programme && FORM_AUDIENCE[data.programme] && data.programme !== 'demo') ? data.programme : kind,
      audience: data.audience || FORM_AUDIENCE[data.programme] || FORM_AUDIENCE[kind] || null,
      programme: data.programme || kind,
      edition: data.edition || null,
      name: data.name, email: data.email, phone: data.phone || null,
      organisation: data.organisation || null, role: data.role || null, message: data.message || null,
      lang: root.lang, source_page: location.pathname + location.hash, referrer: document.referrer || null,
      session_id: sessionId(), user_agent: navigator.userAgent.slice(0, 200),
      elapsed_ms: Math.round(performance.now())     // time on the page; the receiver ignores bot-fast submissions
    }, att);
  }

  // Google Sheet receiver (Apps Script). Sent as text/plain so the browser makes no CORS preflight.
  function sheetInsert(row) {
    return fetch(cfg.SHEET_URL, {
      method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(row)
    }).then(function (r) { if (!r.ok) throw new Error('http-' + r.status); return r.json(); })
      .then(function (res) { if (!res || !res.ok) throw new Error((res && res.error) || 'not-saved'); });
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
      // The button says what is happening while the request is in flight, in both languages
      var btn = form.querySelector('button[type="submit"]'), labels = btn ? btn.querySelectorAll('[data-l]') : [];
      var saved = Array.prototype.map.call(labels, function (el) { return el.textContent; });
      var SENDING = { en: 'Sending', ar: 'جارٍ الإرسال' };
      labels.forEach(function (el) { el.textContent = SENDING[el.getAttribute('data-l')] || el.textContent; });
      var restore = function () { labels.forEach(function (el, i) { el.textContent = saved[i]; }); };
      var finish = function (via) {
        restore(); form.classList.remove('is-busy'); form.classList.add('is-sent');
        var sent = (via === 'mailto' && sentMail) ? sentMail : sentOk;
        if (sent) { sent.classList.add('is-visible'); sent.setAttribute('tabindex', '-1'); sent.focus(); }
        AKAA.track('generate_lead', { form: row.form, programme: row.programme, audience: row.audience, via: via });
      };
      var save = cfg.SHEET_URL ? sheetInsert(row).then(function () { return 'sheet'; })
        : supabaseInsert(row).then(function () { return 'supabase'; });
      save.then(finish).catch(function (err) {
        if (err.message === 'not-configured') { mailtoFallback(row); finish('mailto'); return; }
        restore(); form.classList.remove('is-busy'); form.classList.add('is-error');
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

  // ---- Category filters (Insights index, Home programme catalogue): each tab row filters the items in its own section
  document.querySelectorAll('.filter-tabs').forEach(function (row) {
    var tabs = row.querySelectorAll('button[data-cat]');
    if (!tabs.length) return;
    var scope = row.closest('section') || document;
    var cards = scope.querySelectorAll('[data-cat-item]');
    if (!cards.length) cards = document.querySelectorAll('[data-cat-item]');
    var notes = scope.querySelectorAll('[data-note-for]');
    var count = document.getElementById('index-count');
    var name = row.getAttribute('data-filter-name') || 'insights';
    var current = 'all';
    var apply = function (cat, track) {
      var n = 0;
      cards.forEach(function (c) { var show = cat === 'all' || (' ' + c.getAttribute('data-cat-item') + ' ').indexOf(' ' + cat + ' ') > -1; c.classList.toggle('is-hidden', !show); if (show) n++; });
      notes.forEach(function (el) { el.hidden = el.getAttribute('data-note-for') !== cat; });
      tabs.forEach(function (t) { t.setAttribute('aria-pressed', String(t.getAttribute('data-cat') === cat)); });
      if (count && name === 'insights') {
        var label = row.querySelector('button[data-cat="' + cat + '"]');
        var txt = function (l) { var el = label && label.querySelector('[data-l="' + l + '"]'); return el ? el.textContent : ''; };
        var en = (n === 1 ? '1 piece' : n + ' pieces') + ' · ' + txt('en');
        var ar = (n === 1 ? 'مقالة واحدة' : n === 2 ? 'مقالتان' : (n >= 3 && n <= 10) ? n + ' مقالات' : n + ' مقالة') + ' · ' + txt('ar');
        count.innerHTML = '<span data-l="en">' + en + '</span><span data-l="ar">' + ar + '</span>';
      }
      current = cat;
      if (track) AKAA.track('filter_' + name, { category: cat });
    };
    tabs.forEach(function (t) { t.addEventListener('click', function () { apply(t.getAttribute('data-cat'), true); }); });
    row.__apply = apply;
    apply('all', false);
    document.addEventListener('akaa:lang', function () { apply(current, false); });
  });

  // ---- Links that land on the catalogue with a filter already applied (Home hero buttons)
  document.querySelectorAll('a[data-filter-go]').forEach(function (a) {
    a.addEventListener('click', function () {
      var target = document.querySelector(a.getAttribute('href'));
      var row = target && target.querySelector('.filter-tabs');
      if (row && row.__apply) row.__apply(a.getAttribute('data-filter-go'), true);
    });
  });

  // ---- Links that open the Home enquiry form with a programme already chosen
  // The page's enquiry form: Home's #enquire, or the organisation pages' #consult
  var enquire = document.getElementById('enquire') || document.getElementById('consult');
  if (enquire) {
    var enqSel = enquire.querySelector('select[name="programme"]');
    document.querySelectorAll('a[data-enquire]').forEach(function (a) {
      a.addEventListener('click', function () {
        var v = a.getAttribute('data-enquire');
        if (enqSel && enqSel.querySelector('option[value="' + v + '"]')) enqSel.value = v;
        var nameField = enquire.querySelector('input[name="name"]');
        if (nameField) setTimeout(function () { nameField.focus({ preventScroll: true }); }, 450);
      });
    });
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
    // The hero's own button is the anchor: once it has scrolled away the bar takes over, however tall the hero is.
    var anchor = hero ? (hero.querySelector('.hero__ctas') || hero) : null;
    var target = document.querySelector(bar.getAttribute('data-target'));   // null when the bar leads to another page: then it never hides
    var ticking = false;
    var update = function () {
      ticking = false;
      var pastHero = anchor ? anchor.getBoundingClientRect().bottom < 0 : true;
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

  // Social accounts (config.js SOCIAL): rendered as badges wherever the page has [data-social]; icons only, or icon + name (data-social="pills").
  // LinkedIn, Facebook, Instagram and TikTok always show; each becomes a link once it has a real https:// URL, and those URLs go into the
  // organisation's structured data. X and YouTube show only when they have a URL.
  var NAMES = { linkedin: 'LinkedIn', facebook: 'Facebook', instagram: 'Instagram', tiktok: 'TikTok', x: 'X', youtube: 'YouTube' };
  var ICONS = {
    linkedin: '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8 10.5v6"/><circle cx="8" cy="7.6" r="1" fill="currentColor" stroke="none"/><path d="M12 16.5v-6"/><path d="M12 13.2c0-1.6 1-2.7 2.3-2.7 1.3 0 2.2 1 2.2 2.6v3.4"/>',
    facebook: '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M13.4 21v-7.3h2.4l.4-2.8h-2.8V9.2c0-.8.4-1.4 1.5-1.4h1.4V5.3c-.3 0-1.1-.1-2-.1-2.1 0-3.6 1.3-3.6 3.7v2H8.3v2.8h2.4V21"/>',
    instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none"/>',
    tiktok: '<path d="M13.6 3.5v10.9a3.4 3.4 0 1 1-2.8-3.3"/><path d="M13.6 3.5c.2 2.8 2.1 4.8 4.9 5"/>',
    x: '<path d="M5 4l14 16M19 4L5 20"/>',
    youtube: '<rect x="3" y="6" width="18" height="12" rx="4"/><path d="M10.5 9.5v5l4.2-2.5z" fill="currentColor" stroke="none"/>'
  };
  var CORE = { linkedin: 1, facebook: 1, instagram: 1, tiktok: 1 };
  var social = cfg.SOCIAL || {}, sameAs = [];
  Object.keys(NAMES).forEach(function (k) { if (social[k] && /^https:\/\//.test(social[k])) sameAs.push(social[k]); });
  document.querySelectorAll('[data-social]').forEach(function (el) {
    var pills = el.getAttribute('data-social') === 'pills';
    Object.keys(NAMES).forEach(function (k) {
      var url = social[k], live = !!url && /^https:\/\//.test(url);
      if (!live && !CORE[k]) return;
      var a = document.createElement(live ? 'a' : 'span');
      a.className = 'social__link' + (live ? '' : ' social__link--static');
      if (live) { a.href = url; a.target = '_blank'; a.rel = 'noopener'; a.setAttribute('data-track', 'cta_click:social_' + k); }
      else a.setAttribute('role', 'img');
      a.setAttribute('aria-label', NAMES[k]); a.title = NAMES[k];
      a.innerHTML = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + ICONS[k] + '</svg>' + (pills ? '<span>' + NAMES[k] + '</span>' : '');
      el.appendChild(a);
    });
    if (el.querySelector('.social__link')) el.hidden = false;
  });
  // The same accounts as sameAs on the organisation entity, so search engines connect the profiles to the academy
  if (sameAs.length) {
    document.querySelectorAll('script[type="application/ld+json"]').forEach(function (sc) {
      try {
        var d = JSON.parse(sc.textContent), changed = false;
        (d['@graph'] || [d]).forEach(function (n) { if (n && n['@type'] === 'EducationalOrganization' && n.logo) { n.sameAs = sameAs; changed = true; } });
        if (changed) sc.textContent = JSON.stringify(d);
      } catch (e) {}
    });
  }
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


/* Photo slots: <figure data-photo="id">.
   The Photos GitHub Action turns each original assets/photos/<id>.jpg into WebP sizes (640–3840px) listed in
   assets/photos/manifest.json; slots in the manifest get a srcset so each screen downloads only the width it needs.
   Ids not in the manifest make no request at all. Without a manifest (file:// preview) the original .jpg is probed.
   Loading starts when a slot's section nears the viewport. ?photos labels every slot; ?photos=0 turns that off. */
(function () {
  var root = document.documentElement;
  // Asset paths are relative to the site root, which main.js is loaded from ('../' on the /ar/ pages)
  var ROOT = (function () { var s = document.querySelector('script[src$="main.js"]'); return s ? s.getAttribute('src').replace(/main\.js$/, '') : ''; })();
  var DIR = ROOT + 'assets/photos/';
  var q = new URLSearchParams(location.search), show = false;
  try {
    if (q.has('photos')) { if (q.get('photos') === '0') localStorage.removeItem('akaa-photos'); else localStorage.setItem('akaa-photos', '1'); }
    show = localStorage.getItem('akaa-photos') === '1';
  } catch (e) { show = q.has('photos') && q.get('photos') !== '0'; }
  if (show) {
    root.classList.add('show-photo-slots');
    // Slot labels exist only in this preview mode, built from the slot's attributes (nothing crawlable in the markup)
    document.querySelectorAll('.photo[data-photo]:not(.is-filled)').forEach(function (f) {
      if (f.querySelector('.photo__label')) return;
      var l = document.createElement('span'); l.className = 'photo__label';
      var b = document.createElement('b'); b.dir = 'ltr'; b.textContent = 'PHOTO ' + f.getAttribute('data-tag');
      var en = document.createElement('span'); en.setAttribute('data-l', 'en'); en.textContent = f.getAttribute('data-alt-en') || '';
      var ar = document.createElement('span'); ar.setAttribute('data-l', 'ar'); ar.textContent = f.getAttribute('data-alt-ar') || '';
      var i = document.createElement('i'); i.dir = 'ltr'; i.textContent = f.getAttribute('data-size') || '';
      l.appendChild(b); l.appendChild(en); l.appendChild(ar); l.appendChild(i); f.appendChild(l);
    });
  }

  var lang = function () { return root.lang === 'ar' ? 'ar' : 'en'; };
  var manifest = null;
  var webUrl = function (id, w) { return DIR + 'web/' + id + '-' + w + '.webp?v=' + manifest[id].v; };

  function fill(el) {
    if (el.getAttribute('data-probed')) return;
    var id = el.getAttribute('data-photo'), entry = manifest && manifest[id];
    if (manifest && !entry) return;                       // no photo uploaded for this slot yet
    el.setAttribute('data-probed', '1');
    var img = new Image();
    img.decoding = 'async';
    img.onload = function () {
      img.alt = el.getAttribute('data-alt-' + lang()) || '';
      el.appendChild(img);
      el.removeAttribute('aria-hidden');
      requestAnimationFrame(function () { el.classList.add('is-filled'); });
    };
    if (entry) {
      img.width = entry.w; img.height = entry.h;
      img.sizes = el.getAttribute('data-sizes') || '100vw';
      img.srcset = entry.widths.map(function (w) { return webUrl(id, w) + ' ' + w + 'w'; }).join(', ');
      img.src = webUrl(id, entry.widths.filter(function (w) { return w <= 1280; }).pop() || entry.widths[0]);
    } else {
      img.src = DIR + id + '.jpg';
    }
  }

  function start() {
    var slots = document.querySelectorAll('[data-photo]');
    // Reserve the final shape of slots that have a photo, before it loads
    if (manifest) slots.forEach(function (el) { if (manifest[el.getAttribute('data-photo')]) el.classList.add('has-src'); });
    if ('IntersectionObserver' in window) {
      // Empty slots can be display:none, so watch the section around each one instead.
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          io.unobserve(e.target);
          e.target.__slots.forEach(fill);
        });
      }, { rootMargin: '600px 0px' });
      slots.forEach(function (el) {
        var anchor = el.closest('section, article') || el.parentNode;
        if (!anchor.__slots) { anchor.__slots = []; io.observe(anchor); }
        anchor.__slots.push(el);
      });
    } else { slots.forEach(fill); }

    var bg = document.querySelector('[data-photo-bg]');
    if (bg) {
      var id = bg.getAttribute('data-photo-bg'), entry = manifest && manifest[id];
      if (manifest && !entry) return;
      var b = new Image();
      b.onload = function () { bg.style.setProperty('--hero-photo', 'url("' + b.src + '")'); bg.classList.add('has-photo'); };
      if (entry) {
        var need = Math.min(window.innerWidth * (window.devicePixelRatio || 1), 3840);
        b.src = webUrl(id, entry.widths.filter(function (w) { return w >= need; })[0] || entry.widths[entry.widths.length - 1]);
      } else {
        b.src = DIR + id + '.jpg';
      }
    }
  }

  if (/^https?:$/.test(location.protocol) && window.fetch) {
    fetch(DIR + 'manifest.json', { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (m) { manifest = m; }, function () {})
      .then(start);
  } else {
    start();
  }

  document.addEventListener('akaa:lang', function () {
    document.querySelectorAll('.photo.is-filled img').forEach(function (img) {
      img.alt = img.parentNode.getAttribute('data-alt-' + lang()) || '';
    });
  });
})();
/* Video band: config.js VIDEO_URL is a YouTube or Vimeo page link. Nothing loads until the visitor presses play;
   without a link the poster and the "coming soon" pill stay and there is no control. */
(function () {
  var frame = document.querySelector('[data-video]');
  if (!frame) return;
  var url = (window.AKAA_CONFIG && window.AKAA_CONFIG.VIDEO_URL) || '', embed = null, m;
  if ((m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/))) embed = 'https://www.youtube-nocookie.com/embed/' + m[1] + '?autoplay=1&rel=0';
  else if ((m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/))) embed = 'https://player.vimeo.com/video/' + m[1] + '?autoplay=1';
  if (!embed) return;
  var note = frame.parentNode.querySelector('.video__note');
  if (note) note.remove();
  var mark = frame.querySelector('.video__play'), ar = document.documentElement.lang === 'ar';
  var btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'video__play'; btn.innerHTML = mark.innerHTML;
  btn.setAttribute('aria-label', ar ? 'شغّل الفيديو' : 'Play the video');
  btn.setAttribute('data-aria-en', 'Play the video'); btn.setAttribute('data-aria-ar', 'شغّل الفيديو');
  btn.setAttribute('data-track', 'cta_click:video_play');
  mark.replaceWith(btn);
  btn.addEventListener('click', function () {
    var f = document.createElement('iframe');
    f.src = embed; f.title = ar ? 'الأكاديمية في دقيقتين' : 'The academy in two minutes';
    f.allow = 'autoplay; fullscreen; picture-in-picture'; f.setAttribute('allowfullscreen', ''); f.setAttribute('loading', 'lazy');
    frame.appendChild(f); frame.classList.add('is-playing');
  });
})();


/* The square (al-Khwarizmi's completing-the-square figure) draws itself once it is in view.
   Under reduced motion, or without observers, it is simply shown drawn. */
(function () {
  var figs = document.querySelectorAll('.jabr[data-draw]');
  if (!figs.length) return;
  var still = (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) || !('IntersectionObserver' in window);
  if (still) { figs.forEach(function (f) { f.classList.add('is-drawn'); }); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (!en.isIntersecting) return; io.unobserve(en.target); en.target.classList.add('is-drawn'); });
  }, { threshold: 0.3 });
  figs.forEach(function (f) { io.observe(f); });
})();

/* Chapter openers settle into place the first time they are seen; rows inside a revealed group follow in order */
(function () {
  var GROUPS = '.rlist, .ptable, .next-steps, .figures__row, .faq__list, .card-grid, .practical, .day-cards, .arc__stages, .method-fig__steps, .principles, .history, .article-grid, .ruled-list';
  var ITEMS = ':scope > li, :scope > .ptable__row, :scope > .ptable__group, :scope > div, :scope > details, :scope > .card, :scope > article';
  document.querySelectorAll(GROUPS).forEach(function (g) {
    if (g.closest('.hero')) return;
    var items = g.querySelectorAll(ITEMS); if (!items.length) return;
    g.classList.add('reveal', 'reveal--group');
    items.forEach(function (it, i) { it.classList.add('stagger'); it.style.setProperty('--i', String(Math.min(i, 14))); });
  });
  var els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  var still = (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) || !('IntersectionObserver' in window);
  if (still) { els.forEach(function (el) { el.classList.add('is-in'); var sec = el.closest('.chapter-sec'); if (sec) sec.classList.add('is-in'); }); return; }
  var list = Array.prototype.slice.call(els);
  // Revealing one opener also reveals every opener above it, so a jump down the page (an anchor link, a reload
  // mid-page) never leaves an earlier section blank on the way back up.
  function upTo(i) { for (var k = 0; k <= i; k++) { if (!list[k].classList.contains('is-in')) { list[k].classList.add('is-in'); io.unobserve(list[k]); var sec = list[k].closest('.chapter-sec'); if (sec) sec.classList.add('is-in'); } } }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) upTo(list.indexOf(en.target)); });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  list.forEach(function (el, i) {
    var r = el.getBoundingClientRect();
    if (r.top < window.innerHeight) { upTo(i); return; }
    io.observe(el);
  });
})();


/* The headline's words rise into place once the page is ready */
(function () {
  var root = document.documentElement;
  var h1 = document.querySelector('main .hero h1');
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (h1 && !still) {
    var lang = root.lang === 'ar' ? 'ar' : 'en';
    var span = h1.querySelector('[data-l="' + lang + '"]') || h1;
    var plain = Array.prototype.every.call(span.childNodes, function (n) { return n.nodeType === 3; });
    if (plain) {
      var words = span.textContent.split(/(\s+)/), i = 0, frag = document.createDocumentFragment();
      words.forEach(function (w) {
        if (!w) return;
        if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(' ')); return; }
        var outer = document.createElement('span'), inner = document.createElement('span');
        outer.className = 'w'; inner.textContent = w; inner.style.setProperty('--i', String(i++));
        outer.appendChild(inner); frag.appendChild(outer);
      });
      span.textContent = ''; span.appendChild(frag);
    }
  }
  requestAnimationFrame(function () { requestAnimationFrame(function () { root.classList.add('is-ready'); }); });
})();

/* One scroll loop: the gradient progress line in the header and the slow drift of the art layers */
(function () {
  var header = document.querySelector('.site-header');
  var layers = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && window.matchMedia('(pointer: fine)').matches && !('ontouchstart' in window);
  var drift = !still && fine && layers.length;
  var ticking = false;
  var update = function () {
    ticking = false;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (header) header.style.setProperty('--progress', String(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0));
    if (!drift) return;
    var vh = window.innerHeight;
    layers.forEach(function (el) {
      var host = el.parentElement, r = host.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      var f = parseFloat(el.getAttribute('data-parallax')) || 0;
      var py = Math.max(-40, Math.min(40, (vh / 2 - (r.top + r.height / 2)) * f));
      el.style.setProperty('--py', py.toFixed(1) + 'px');
    });
  };
  var onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();

/* Inertia scrolling for mouse wheels: the page eases toward where the wheel asked for, instead of jumping.
   Off on touch devices, under reduced motion, while the menu is open, and inside anything that scrolls itself.
   Any other scroll (keyboard, scrollbar, an anchor link, a script) simply resets the target. */
(function () {
  var root = document.documentElement;
  if (!(window.matchMedia && window.matchMedia('(pointer: fine)').matches) || ('ontouchstart' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var target = window.scrollY, current = target, running = false, pausedUntil = 0;
  var scrollsItself = function (el) {
    for (; el && el !== document.body; el = el.parentElement) {
      if (el.tagName === 'SELECT' || el.tagName === 'TEXTAREA') return true;
      var o = getComputedStyle(el).overflowY;
      if ((o === 'auto' || o === 'scroll') && el.scrollHeight > el.clientHeight + 1) return true;
    }
    return false;
  };
  var step = function () {
    var d = target - current;
    if (Math.abs(d) < 0.5) { current = target; window.scrollTo({ top: current, behavior: 'instant' }); running = false; return; }
    current += d * 0.12;
    window.scrollTo({ top: current, behavior: 'instant' });   // 'instant' so the page's smooth scroll-behavior does not animate each frame
    requestAnimationFrame(step);
  };
  window.addEventListener('wheel', function (e) {
    if (e.ctrlKey || e.defaultPrevented) return;
    if (root.classList.contains('menu-open') || Date.now() < pausedUntil) return;
    if (scrollsItself(e.target)) return;
    var dy = e.deltaY;
    if (e.deltaMode === 1) dy *= 16; else if (e.deltaMode === 2) dy *= window.innerHeight;
    if (!dy) return;
    e.preventDefault();
    var max = root.scrollHeight - window.innerHeight;
    if (!running) { current = window.scrollY; target = current; }
    target = Math.max(0, Math.min(max, target + dy));
    if (!running) { running = true; requestAnimationFrame(step); }
  }, { passive: false });
  window.addEventListener('scroll', function () {
    // the scroll event arrives after our own scrollTo: it is ours when the page is where we put it
    if (Math.abs(window.scrollY - current) < 1.5) return;
    // someone else moved the page (keyboard, scrollbar, an anchor, a script): follow it
    current = target = window.scrollY; running = false;
  }, { passive: true });
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (a) { pausedUntil = Date.now() + 1200; running = false; }
  }, true);
})();
