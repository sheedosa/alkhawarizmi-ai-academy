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
      var finish = function (via) {
        form.classList.remove('is-busy'); form.classList.add('is-sent');
        var sent = (via === 'mailto' && sentMail) ? sentMail : sentOk;
        if (sent) { sent.classList.add('is-visible'); sent.setAttribute('tabindex', '-1'); sent.focus(); }
        AKAA.track('generate_lead', { form: row.form, programme: row.programme, audience: row.audience, via: via });
      };
      var save = cfg.SHEET_URL ? sheetInsert(row).then(function () { return 'sheet'; })
        : supabaseInsert(row).then(function () { return 'supabase'; });
      save.then(finish).catch(function (err) {
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
  var enquire = document.getElementById('enquire');
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
    var target = document.querySelector(bar.getAttribute('data-target'));
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
  var DIR = 'assets/photos/';
  var q = new URLSearchParams(location.search), show = false;
  try {
    if (q.has('photos')) { if (q.get('photos') === '0') localStorage.removeItem('akaa-photos'); else localStorage.setItem('akaa-photos', '1'); }
    show = localStorage.getItem('akaa-photos') === '1';
  } catch (e) { show = q.has('photos') && q.get('photos') !== '0'; }
  if (show) root.classList.add('show-photo-slots');

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

/* The academy in numbers: each figure counts up once when its card scrolls into view.
   The real number is in the HTML (search engines, no-JS, reduced motion); the width is locked first so nothing shifts. */
(function () {
  var els = document.querySelectorAll('[data-count]');
  if (!els.length || !('IntersectionObserver' in window)) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var run = function (el, delay) {
    var to = parseInt(el.getAttribute('data-count'), 10), t0 = null, dur = to > 99 ? 1400 : 900;
    var step = function (t) {
      if (t0 === null) t0 = t + delay;
      var k = Math.min(Math.max((t - t0) / dur, 0), 1), e = 1 - Math.pow(1 - k, 3);
      el.textContent = String(Math.round(to * e));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      run(en.target, Array.prototype.indexOf.call(els, en.target) % 4 * 90);
    });
  }, { threshold: 0.6 });
  els.forEach(function (el) {
    var r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) return;     // already on screen at load: leave it as is
    el.style.minWidth = el.offsetWidth + 'px';
    el.style.display = 'inline-block';
    el.textContent = '0';
    io.observe(el);
  });
})();
