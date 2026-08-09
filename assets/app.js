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
    labelMonths();
    updateMonths();
    updateTeasers();
    // Offline banners are JS-composed too, so re-render them in the new language.
    if (!SITE_ENDPOINT || campCounts === null) offlineMsg('camp-status', true);
    if (!SITE_ENDPOINT || sponsorMonths === null) offlineMsg('sponsor-status', true);
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
        Month: selText('sponsor-month'),
        Audience: fieldVal('sponsor-audience'),
        Language: lang === 'ar' ? 'Arabic' : 'English'
      }
    });
  }

  /* ---------- Live availability (camp seats + sponsorship months) ---------- */

  // TODO: set SITE_ENDPOINT to the Apps Script Web App URL (see camp-backend.gs).
  // One URL serves both features. While it is empty both widgets show an honest
  // "unknown" state and the forms fall back to the email relay, so nothing is lost.
  var SITE_ENDPOINT = '';

  // One request feeds both widgets. Two independent pollers would double the
  // Apps Script executions per visitor, and the daily runtime budget is finite.
  var availPollTimer = null;
  var availInView = false;        // true while EITHER live section is on screen
  var availPolls = 0;
  var AVAIL_POLL_MS = 45000;
  var AVAIL_MAX_POLLS = 40;       // stop after ~30 min

  var SEATS_PER_DAY = 40;
  var campCounts = null;          // null means "we genuinely do not know"
  var sponsorMonths = null;       // null means the same

  function els(sel) {
    return [].slice.call(document.querySelectorAll(sel));
  }

  function campDayEls() {
    return els('.camp-day');
  }

  // Shared tri-state label renderer. Picks the right data-tpl-* variant for the
  // current language and state, then substitutes tokens. Used by both widgets.
  function renderStateLabel(label, state, tokens) {
    if (!label) return;
    var ar = lang === 'ar';
    var attr = state === 'normal'
      ? (ar ? 'data-tpl-ar' : 'data-tpl-en')
      : 'data-tpl-' + state + (ar ? '-ar' : '-en');
    var tpl = label.getAttribute(attr) || '';
    for (var k in tokens) {
      if (tokens.hasOwnProperty(k)) {
        // split/join, not replace: replace() with a string only swaps the first hit
        tpl = tpl.split('{' + k + '}').join(localiseNum(tokens[k]));
      }
    }
    label.textContent = tpl;
  }

  function offlineMsg(id, on) {
    var el = document.getElementById(id);
    if (!el) return;
    el.textContent = on
      ? (el.getAttribute(lang === 'ar' ? 'data-tpl-offline-ar' : 'data-tpl-offline-en') || '')
      : '';
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
        var state = !known ? 'unknown' : (left === 0 ? 'full' : 'normal');
        renderStateLabel(label, state, { n: left, total: SEATS_PER_DAY });
      }
      if (pick) pick.disabled = !!(known && left === 0);
    });
  }

  /* ---------- Sponsorship months ---------- */

  var MONTHS = {
    en: ['January','February','March','April','May','June',
         'July','August','September','October','November','December'],
    // Forms most widely understood in Libya. Owner to confirm.
    ar: ['يناير','فبراير','مارس','أبريل','مايو','يونيو',
         'يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']
  };

  function monthCellEls() {
    return els('.mon-cell');
  }

  var MONTH_WINDOW = 12;

  // Rolling window of n months from the current month, so nothing ever goes
  // stale. Keys are YYYY-MM to match the sheet. Deliberately DOM-free: the
  // homepage teaser has to count open months with no .mon-cell grid to read.
  function monthKeys(n) {
    var now = new Date(), out = [];
    for (var i = 0; i < n; i++) {
      var d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      var mm = d.getMonth() + 1;
      out.push({
        key: d.getFullYear() + '-' + (mm < 10 ? '0' + mm : mm),
        mindex: d.getMonth(),
        year: d.getFullYear()
      });
    }
    return out;
  }

  // Stamp the rolling window onto the grid; labels are looked up per language.
  function buildMonths() {
    var cells = monthCellEls();
    if (!cells.length) return;
    var months = monthKeys(cells.length);
    cells.forEach(function (cell, i) {
      cell.setAttribute('data-month', months[i].key);
      cell.setAttribute('data-mindex', months[i].mindex);
      cell.setAttribute('data-year', months[i].year);
    });
    labelMonths();
  }

  // Month names are language-dependent, so this re-runs on every toggle.
  function labelMonths() {
    var names = MONTHS[lang === 'ar' ? 'ar' : 'en'];
    monthCellEls().forEach(function (cell) {
      var idx = parseInt(cell.getAttribute('data-mindex'), 10);
      var yr = cell.getAttribute('data-year');
      var nameEl = cell.querySelector('.mon-name');
      var yrEl = cell.querySelector('.mon-year');
      if (nameEl && !isNaN(idx)) nameEl.textContent = names[idx];
      if (yrEl && yr) yrEl.textContent = localiseNum(yr);
    });

    // Keep the form's month select in step with the grid, preserving any choice.
    var sel = document.getElementById('sponsor-month');
    if (!sel) return;
    var chosen = sel.value;
    while (sel.options.length > 1) sel.remove(1);   // keep the "No preference" option
    monthCellEls().forEach(function (cell) {
      var idx = parseInt(cell.getAttribute('data-mindex'), 10);
      var yr = cell.getAttribute('data-year');
      var opt = document.createElement('option');
      opt.value = cell.getAttribute('data-month');
      opt.textContent = names[idx] + ' ' + localiseNum(yr);
      sel.appendChild(opt);
    });
    if (chosen) sel.value = chosen;
  }

  function updateMonths() {
    var open = 0, known = 0;
    monthCellEls().forEach(function (cell) {
      var key = cell.getAttribute('data-month');
      var status = sponsorMonths ? (sponsorMonths[key] || 'available') : null;
      var label = cell.querySelector('.mon-state');
      var pick = cell.querySelector('.mon-pick');

      cell.classList.toggle('is-taken', status === 'taken');
      cell.classList.toggle('is-reserved', status === 'reserved');
      cell.classList.toggle('is-open', status === 'available');
      cell.classList.toggle('is-unknown', status === null);

      if (status !== null) { known++; if (status === 'available') open++; }
      renderStateLabel(label, status === null ? 'unknown' : status, {});
      if (pick) pick.disabled = (status === 'taken');
    });

    // ONE aggregate live region. Announcing 12 cells individually would flood
    // a screen reader on every poll.
    var sum = document.getElementById('sponsor-avail');
    if (sum) {
      renderStateLabel(sum, known ? 'normal' : 'unknown', { n: open, total: monthCellEls().length });
    }
  }

  /* ---------- Homepage teasers ---------- */

  // The homepage carries one live figure per teaser instead of the full widget.
  // When availability is unknown the line is HIDDEN rather than left on
  // "Checking…": here it is a hook, not the content, and a teaser stuck on
  // "Checking" reads worse than one that simply omits the line. The dedicated
  // pages, where availability IS the content, keep the honest unknown state.
  function updateTeasers() {
    var campLine = document.getElementById('camp-teaser-live');
    if (campLine) {
      // Day count comes from the payload, never a hard-coded 5: the teaser must
      // not claim a total the backend has not actually reported.
      var days = 0, taken = 0;
      if (campCounts) {
        for (var k in campCounts) {
          if (!campCounts.hasOwnProperty(k)) continue;
          if (typeof campCounts[k] !== 'number') continue;
          days++;
          taken += Math.max(0, Math.min(SEATS_PER_DAY, campCounts[k]));
        }
      }
      var total = days * SEATS_PER_DAY;
      var left = total - taken;
      campLine.hidden = !days;
      if (days) renderStateLabel(campLine, left > 0 ? 'normal' : 'full', { n: left, total: total });
    }

    var sponLine = document.getElementById('sponsor-teaser-live');
    if (sponLine) {
      var months = monthKeys(MONTH_WINDOW), open = 0;
      if (sponsorMonths) {
        months.forEach(function (m) {
          if ((sponsorMonths[m.key] || 'available') === 'available') open++;
        });
      }
      sponLine.hidden = !sponsorMonths;
      if (sponsorMonths) {
        renderStateLabel(sponLine, open > 0 ? 'normal' : 'full', { n: open, total: months.length });
      }
    }
  }

  /* ---------- Shared transport + poll ---------- */

  function applyAvailability(d, animate) {
    if (d && d.camp && d.camp.counts) {
      if (typeof d.camp.capacity === 'number' && d.camp.capacity > 0) SEATS_PER_DAY = d.camp.capacity;
      campCounts = d.camp.counts;
    }
    if (d && d.sponsor && d.sponsor.months) sponsorMonths = d.sponsor.months;
    updateSeats(!!animate);
    updateMonths();
    updateTeasers();
    offlineMsg('camp-status', false);
    offlineMsg('sponsor-status', false);
  }

  function clearAvailability() {
    // Never invent availability. Fall back to the unknown state on both widgets.
    campCounts = null;
    sponsorMonths = null;
    updateSeats(false);
    updateMonths();
    updateTeasers();
    offlineMsg('camp-status', true);
    offlineMsg('sponsor-status', true);
  }

  function loadAvailability(animate) {
    if (!SITE_ENDPOINT) { clearAvailability(); return; }
    fetch(SITE_ENDPOINT + '?action=counts', { method: 'GET' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (d) {
        if (!d || (!d.camp && !d.sponsor)) throw new Error('bad payload');
        applyAvailability(d, animate);
      })
      .catch(clearAvailability);
  }

  function availPollStart() {
    if (availPollTimer || !SITE_ENDPOINT) return;
    availPollTimer = setInterval(function () {
      if (document.hidden || !availInView) return;   // idle while unseen
      if (++availPolls > AVAIL_MAX_POLLS) { availPollStop(); return; }
      loadAvailability(true);
    }, AVAIL_POLL_MS);
  }

  function availPollStop() {
    if (availPollTimer) { clearInterval(availPollTimer); availPollTimer = null; }
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

  function pickMonth(e) {
    var key = e.currentTarget.closest('.mon-cell').getAttribute('data-month');
    monthCellEls().forEach(function (cell) {
      var on = cell.getAttribute('data-month') === key;
      cell.classList.toggle('sel', on);
      var b = cell.querySelector('.mon-pick');
      if (b) b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    var sel = document.getElementById('sponsor-month');
    if (sel) sel.value = key;
    var wrap = document.getElementById('sponsor-form-wrap');
    if (wrap) wrap.scrollIntoView({ block: 'start' });
    var first = document.getElementById('sponsor-org');
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
    if (!SITE_ENDPOINT) {
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
    fetch(SITE_ENDPOINT, {
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
      if (d && d.counts) { campCounts = d.counts; updateSeats(true); offlineMsg('camp-status', false); }
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
    pickMonth: pickMonth,
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

    // Live availability, in one of two modes.
    //
    // The camp and sponsor PAGES carry the full widgets: load immediately, then
    // poll while a widget is on screen. The HOMEPAGE carries only teaser lines,
    // so it loads once on first scroll-into-view and never starts an interval.
    // That is one request per homepage visit instead of one every 45 seconds
    // against a page with no widget to paint, and visitors who bounce at the
    // hero cost nothing at all.
    buildSeats();
    buildMonths();
    updateSeats(false);
    updateMonths();
    updateTeasers();
    var liveSections = [document.getElementById('camp'), document.getElementById('sponsor')]
      .filter(Boolean);
    var teasers = [document.getElementById('camp-teaser'), document.getElementById('sponsor-teaser')]
      .filter(Boolean);
    if (liveSections.length) {
      loadAvailability(false);
      if (window.IntersectionObserver) {
        var seen = {};
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) { seen[en.target.id] = en.isIntersecting; });
          // In view if EITHER live section is showing.
          availInView = liveSections.some(function (el) { return seen[el.id]; });
          if (availInView) availPollStart(); else availPollStop();
        }, { rootMargin: '200px' });
        liveSections.forEach(function (el) { io.observe(el); });
      } else {
        availInView = true;
        availPollStart();
      }
      document.addEventListener('visibilitychange', function () {
        if (!document.hidden && availInView) loadAvailability(true);
      });
    } else if (teasers.length) {
      if (window.IntersectionObserver) {
        var tio = new IntersectionObserver(function (entries) {
          if (!entries.some(function (en) { return en.isIntersecting; })) return;
          tio.disconnect();          // one shot: the teasers never poll
          loadAvailability(false);
        }, { rootMargin: '200px' });
        teasers.forEach(function (el) { tio.observe(el); });
      } else {
        loadAvailability(false);
      }
    }

    // Category tiles: initial counts, plus roving keyboard navigation.
    // Scoped to .cat-row so it cannot collide with the Story tablist listener above.
    updateCounts();
    // ?cat=<slug> deep-links into a filtered catalogue, so the homepage and the
    // footer can point straight at a track. Unknown slugs fall through to "All".
    try {
      var wanted = new URLSearchParams(window.location.search).get('cat');
      if (wanted && document.querySelector('.cat[data-cat="' + wanted + '"]')) setCat(wanted);
    } catch (e) { /* no URLSearchParams, stay on All */ }
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
