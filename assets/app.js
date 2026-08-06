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
    updateSeats(false);
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

  /* ---------- Lead forms (register interest, sponsor a cohort) ---------- */

  // Both forms relay through FormSubmit to the academy inbox. Static hosting
  // cannot send mail directly; swapping providers is a one-line change here.
  var FORM_ENDPOINT = 'https://formsubmit.co/ajax/info@alkhawarizmi.ai';

  function fieldVal(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function btnLabel(btn) {
    return btn.getAttribute(lang === 'ar' ? 'data-ar' : 'data-en') || 'Send';
  }

  function selText(id) {
    var sel = document.getElementById(id);
    return sel && sel.selectedOptions[0] ? sel.selectedOptions[0].textContent.trim() : '';
  }

  // Where the visitor came from, for attributing enquiries.
  function leadSource() {
    try {
      var q = new URLSearchParams(window.location.search);
      var utm = ['utm_source', 'utm_medium', 'utm_campaign']
        .map(function (k) { return q.get(k); })
        .filter(Boolean).join(' / ');
      return utm || document.referrer || 'direct';
    } catch (e) { return 'direct'; }
  }

  function swapToThanks(form, thanks) {
    if (form) form.hidden = true;
    if (thanks) { thanks.hidden = false; thanks.focus(); }
  }

  // Shared transport for every lead form: validation, busy state, POST,
  // success swap and error recovery. Callers supply their own nodes + payload.
  function sendLead(o) {
    var form = o.form;
    if (!form) return;
    // novalidate is set on the forms so we control when messages appear
    if (!form.checkValidity()) { form.reportValidity(); return; }

    var btn = o.btn, errEl = o.err, thanks = o.thanks;
    if (errEl) errEl.hidden = true;
    if (btn) {
      btn.disabled = true;
      btn.setAttribute('aria-busy', 'true');
      btn.textContent = lang === 'ar' ? 'جارٍ الإرسال…' : 'Sending…';
    }

    fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(o.payload)
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function () {
      swapToThanks(form, thanks);
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

  // Course cards link to the form and preselect themselves, so the visitor
  // does not have to re-state which course they were looking at.
  function pickProgram(e) {
    var val = e.currentTarget.getAttribute('data-program');
    var sel = document.getElementById('reg-program');
    if (sel && val) sel.value = val;
  }

  function submitInterest(e) {
    e.preventDefault();
    sendLead({
      form: document.getElementById('reg-form'),
      btn: document.getElementById('reg-submit'),
      err: document.getElementById('reg-error'),
      thanks: document.getElementById('reg-thanks'),
      payload: {
        _subject: 'New interest registration from the website',
        _captcha: 'false',
        _template: 'table',
        form_type: 'interest',
        source: leadSource(),
        Name: fieldVal('reg-name'),
        Email: fieldVal('reg-email'),
        Phone: fieldVal('reg-phone'),
        Program: selText('reg-program'),
        Message: fieldVal('reg-message'),
        Language: lang === 'ar' ? 'Arabic' : 'English'
      }
    });
  }

  function submitSponsor(e) {
    e.preventDefault();
    var form = document.getElementById('sponsor-form');
    if (!form) return;
    // Honeypot: a real visitor never sees this field, so anything in it is a bot.
    // Behave exactly like success so the bot learns nothing, but send nothing.
    if (fieldVal('sponsor-company-website')) {
      swapToThanks(form, document.getElementById('sponsor-thanks'));
      return;
    }
    sendLead({
      form: form,
      btn: document.getElementById('sponsor-submit'),
      err: document.getElementById('sponsor-error'),
      thanks: document.getElementById('sponsor-thanks'),
      payload: {
        _subject: 'New sponsorship enquiry from the website',
        _captcha: 'false',
        _template: 'table',
        form_type: 'sponsor',
        source: leadSource(),
        Organisation: fieldVal('sponsor-org'),
        Contact: fieldVal('sponsor-contact'),
        Phone: fieldVal('sponsor-phone'),
        Email: fieldVal('sponsor-email'),
        Tier: selText('sponsor-tier'),
        Audience: fieldVal('sponsor-audience'),
        Language: lang === 'ar' ? 'Arabic' : 'English'
      }
    });
  }

  /* ---------- Summer camp: live seat map ---------- */

  // TODO: set CAMP_ENDPOINT to the Apps Script Web App URL (see camp-backend.gs).
  // While it is empty the seat map shows an honest "unknown" state and the
  // booking form falls back to the email relay, so no booking is ever lost.
  var CAMP_ENDPOINT = '';

  var SEATS_PER_DAY = 40;
  var campCounts = null;          // null means "we genuinely do not know"
  var campPollTimer = null;
  var campInView = false;
  var campPolls = 0;
  var CAMP_POLL_MS = 45000;
  var CAMP_MAX_POLLS = 40;        // stop after ~30 min; Apps Script has daily quotas

  function campDayEls() {
    return [].slice.call(document.querySelectorAll('.camp-day'));
  }

  // Build the seat dots once. They are decorative (container is aria-hidden),
  // so they are safe to generate after boot without event wiring.
  function buildSeats() {
    campDayEls().forEach(function (day) {
      var grid = day.querySelector('.camp-seats');
      if (!grid || grid.childNodes.length) return;
      var frag = document.createDocumentFragment();
      for (var i = 0; i < SEATS_PER_DAY; i++) {
        var s = document.createElement('span');
        s.className = 'camp-seat unknown';
        frag.appendChild(s);
      }
      grid.appendChild(frag);
    });
  }

  // Paint seats + counts from campCounts. Derived from state each time, so it is
  // idempotent and safe to re-run on language switch.
  function updateSeats(animateNew) {
    campDayEls().forEach(function (day) {
      var key = day.getAttribute('data-day');
      var seats = [].slice.call(day.querySelectorAll('.camp-seat'));
      var label = day.querySelector('.camp-left');
      var pick = day.querySelector('.camp-pick');
      var known = campCounts && typeof campCounts[key] === 'number';
      var taken = known ? Math.max(0, Math.min(SEATS_PER_DAY, campCounts[key])) : 0;
      var left = SEATS_PER_DAY - taken;

      seats.forEach(function (s, i) {
        var cls = !known ? 'unknown' : (i < taken ? 'taken' : 'free');
        var was = s.className.indexOf('taken') !== -1;
        if (s.className.indexOf(cls) === -1) {
          s.className = 'camp-seat ' + cls;
          if (animateNew && cls === 'taken' && !was) {
            s.classList.add('just-taken');
          }
        }
      });

      if (label) {
        label.classList.toggle('is-unknown', !known);
        label.classList.toggle('is-full', known && left === 0);
        var tpl;
        if (!known) tpl = label.getAttribute(lang === 'ar' ? 'data-tpl-unknown-ar' : 'data-tpl-unknown-en');
        else if (left === 0) tpl = label.getAttribute(lang === 'ar' ? 'data-tpl-full-ar' : 'data-tpl-full-en');
        else tpl = label.getAttribute(lang === 'ar' ? 'data-tpl-ar' : 'data-tpl-en');
        label.textContent = (tpl || '')
          .replace('{n}', localiseNum(left))
          .replace('{total}', localiseNum(SEATS_PER_DAY));
      }
      if (pick) pick.disabled = !!(known && left === 0);
    });
  }

  function campOffline(on) {
    var el = document.getElementById('camp-status');
    if (!el) return;
    el.textContent = on
      ? (el.getAttribute(lang === 'ar' ? 'data-tpl-offline-ar' : 'data-tpl-offline-en') || '')
      : '';
  }

  function loadSeatCounts(animate) {
    if (!CAMP_ENDPOINT) { campCounts = null; updateSeats(false); campOffline(true); return; }
    fetch(CAMP_ENDPOINT + '?action=counts', { method: 'GET' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (d) {
        if (!d || !d.counts) throw new Error('bad payload');
        if (typeof d.seatsPerDay === 'number' && d.seatsPerDay > 0) SEATS_PER_DAY = d.seatsPerDay;
        campCounts = d.counts;
        updateSeats(!!animate);
        campOffline(false);
      })
      .catch(function () {
        // Never invent availability. Fall back to the unknown state.
        campCounts = null;
        updateSeats(false);
        campOffline(true);
      });
  }

  function campPollStart() {
    if (campPollTimer || !CAMP_ENDPOINT) return;
    campPollTimer = setInterval(function () {
      if (document.hidden || !campInView) return;   // idle while unseen
      if (++campPolls > CAMP_MAX_POLLS) { campPollStop(); return; }
      loadSeatCounts(true);
    }, CAMP_POLL_MS);
  }

  function campPollStop() {
    if (campPollTimer) { clearInterval(campPollTimer); campPollTimer = null; }
  }

  function pickDay(e) {
    var key = e.currentTarget.getAttribute('data-day');
    campDayEls().forEach(function (day) {
      var on = day.getAttribute('data-day') === key;
      day.classList.toggle('sel', on);
      var b = day.querySelector('.camp-pick');
      if (b) b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    var sel = document.getElementById('camp-day');
    if (sel) sel.value = key;
    var wrap = document.getElementById('camp-form-wrap');
    if (wrap) wrap.scrollIntoView({ block: 'start' });
    var first = document.getElementById('camp-attendee');
    if (first) first.focus();
  }

  function submitBooking(e) {
    e.preventDefault();
    var form = document.getElementById('camp-form');
    if (!form) return;
    if (fieldVal('camp-company-website')) {
      swapToThanks(form, document.getElementById('camp-thanks'));
      return;
    }
    if (!form.checkValidity()) { form.reportValidity(); return; }

    var btn = document.getElementById('camp-submit');
    var errEl = document.getElementById('camp-error');
    var fullEl = document.getElementById('camp-full');
    var thanks = document.getElementById('camp-thanks');
    var day = document.getElementById('camp-day');

    // No booking backend yet: fall back to the email relay so the lead still lands.
    if (!CAMP_ENDPOINT) {
      sendLead({
        form: form, btn: btn, err: errEl, thanks: thanks,
        payload: {
          _subject: 'New summer camp booking from the website',
          _captcha: 'false',
          _template: 'table',
          form_type: 'camp',
          source: leadSource(),
          Day: selText('camp-day'),
          Attendee: fieldVal('camp-attendee'),
          Age: fieldVal('camp-age'),
          Guardian: fieldVal('camp-guardian'),
          Phone: fieldVal('camp-phone'),
          Email: fieldVal('camp-email'),
          Notes: fieldVal('camp-notes'),
          Language: lang === 'ar' ? 'Arabic' : 'English'
        }
      });
      return;
    }

    if (errEl) errEl.hidden = true;
    if (fullEl) fullEl.hidden = true;
    if (btn) {
      btn.disabled = true;
      btn.setAttribute('aria-busy', 'true');
      btn.textContent = lang === 'ar' ? 'جارٍ الإرسال…' : 'Sending…';
    }

    // text/plain keeps this a simple request: Apps Script cannot answer a CORS preflight.
    fetch(CAMP_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        day: day ? day.value : '',
        attendee: fieldVal('camp-attendee'),
        age: fieldVal('camp-age'),
        guardian: fieldVal('camp-guardian'),
        phone: fieldVal('camp-phone'),
        email: fieldVal('camp-email'),
        notes: fieldVal('camp-notes'),
        source: leadSource(),
        language: lang === 'ar' ? 'Arabic' : 'English'
      })
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (d) {
      if (d && d.counts) { campCounts = d.counts; updateSeats(true); campOffline(false); }
      if (d && d.error === 'full') {
        // The day filled while they were typing. Say so; do not fake a success.
        if (fullEl) fullEl.hidden = false;
        if (btn) {
          btn.disabled = false;
          btn.removeAttribute('aria-busy');
          btn.textContent = btnLabel(btn);
        }
        if (day) { day.value = ''; day.focus(); }
        return;
      }
      if (!d || !d.ok) throw new Error(d && d.error ? d.error : 'unknown');
      swapToThanks(form, thanks);
    }).catch(function () {
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
    submitSponsor: submitSponsor,
    pickDay: pickDay,
    submitBooking: submitBooking,
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

    // Summer camp seat map. Counts load once unconditionally so they always
    // appear; the observer only gates the ongoing poll, which is the expensive part.
    buildSeats();
    updateSeats(false);
    var campSection = document.getElementById('camp');
    if (campSection) {
      loadSeatCounts(false);
      if (window.IntersectionObserver) {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            campInView = en.isIntersecting;
            if (en.isIntersecting) campPollStart();
          });
        }, { rootMargin: '200px' }).observe(campSection);
      } else {
        campInView = true;
        campPollStart();
      }
      document.addEventListener('visibilitychange', function () {
        if (!document.hidden && campInView) loadSeatCounts(true);
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
      if (window.innerWidth > 900) closeMenu(); // must match the hamburger breakpoint in styles.css
    });
  }

  if (document.readyState !== 'loading') boot();
  else document.addEventListener('DOMContentLoaded', boot);
})();
