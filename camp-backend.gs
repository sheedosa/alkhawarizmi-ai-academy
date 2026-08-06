/**
 * AlKhwarizmi AI Academy — website backend
 * ========================================
 * One Google Apps Script Web App serving BOTH live-availability features:
 *   • Summer camp seat counts  (visitors book, seats are consumed)
 *   • Sponsorship month status (you curate; enquiries never consume a month)
 *
 * ----------------------------------------------------------------------
 * SETUP (about 5 minutes, once)
 * ----------------------------------------------------------------------
 * 1. Create a Google Sheet with these tabs (they are auto-created if missing):
 *       Bookings        — camp bookings land here
 *       SponsorMonths   — YOU control this one, see below
 * 2. Extensions > Apps Script. Delete the placeholder code.
 * 3. Paste this whole file in. Save.
 * 4. Deploy > New deployment > type "Web app".
 *       Execute as:        Me
 *       Who has access:    Anyone        <-- must be "Anyone", not "Anyone with Google account"
 * 5. Authorise when prompted (it warns the app is unverified; it is your own script).
 * 6. Copy the Web app URL (…/exec) and send it to be pasted into assets/app.js
 *    as SITE_ENDPOINT. One URL covers both features.
 *
 * ----------------------------------------------------------------------
 * MANAGING SPONSORSHIP MONTHS
 * ----------------------------------------------------------------------
 * The SponsorMonths tab has two columns:  Month | Status
 *   Month  = YYYY-MM   e.g. 2026-09
 *   Status = available | reserved | taken
 *
 * A month NOT listed is treated as available, so an empty sheet is correct on
 * day one. Sponsorship is negotiated, not checked out, so an enquiry never
 * changes a status: you set it yourself when a deal is actually agreed. That
 * keeps the website honest about what is genuinely still open.
 * ----------------------------------------------------------------------
 */

var CACHE_TTL_SECS = 20;   // keeps polling cheap; a booking busts the cache immediately

/** Camp: rows are bookings, one seat each. Capacity is enforced. */
var CAMP = {
  sheet:    'Bookings',
  keys:     ['d1', 'd2', 'd3', 'd4', 'd5'],
  capacity: 40,
  keyCol:   2,                       // column B holds the day key
  cacheKey: 'camp_counts_v1',
  headers:  ['Timestamp', 'Day', 'Attendee', 'Age', 'Guardian',
             'Phone', 'Email', 'Notes', 'Source', 'Language']
};

/** Sponsorship: rows are month statuses you maintain by hand. Read-only here. */
var SPONSOR = {
  sheet:    'SponsorMonths',
  keyCol:   1,                       // column A = month (YYYY-MM)
  statusCol: 2,                      // column B = status
  cacheKey: 'sponsor_months_v1',
  headers:  ['Month', 'Status', 'Sponsor', 'Note']
};

/* ---------------------------------------------------------------- read */

/**
 * Returns BOTH resources in a single response. Deliberate: two independent
 * pollers would double the script executions per visitor, and Apps Script has
 * a daily runtime budget. One request, one cache warm-up, two widgets fed.
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'counts';
  if (action !== 'counts') return json({ error: 'unknown_action' });

  return json({
    camp:    { capacity: CAMP.capacity, counts: getCampCounts() },
    sponsor: { months: getSponsorMonths() }
  });
}

/** Booked seats per camp day, cached so polling does not re-read the Sheet. */
function getCampCounts(skipCache) {
  var cache = CacheService.getScriptCache();
  if (!skipCache) {
    var hit = cache.get(CAMP.cacheKey);
    if (hit) { try { return JSON.parse(hit); } catch (err) { /* recount */ } }
  }
  var counts = {};
  for (var i = 0; i < CAMP.keys.length; i++) counts[CAMP.keys[i]] = 0;

  var sheet = getSheet(CAMP);
  var last = sheet.getLastRow();
  if (last >= 2) {
    var rows = sheet.getRange(2, CAMP.keyCol, last - 1, 1).getValues();
    for (var r = 0; r < rows.length; r++) {
      var key = String(rows[r][0]).trim();
      if (counts.hasOwnProperty(key)) counts[key]++;
    }
  }
  cache.put(CAMP.cacheKey, JSON.stringify(counts), CACHE_TTL_SECS);
  return counts;
}

/** Month -> status map. Months absent from the sheet are simply available. */
function getSponsorMonths() {
  var cache = CacheService.getScriptCache();
  var hit = cache.get(SPONSOR.cacheKey);
  if (hit) { try { return JSON.parse(hit); } catch (err) { /* re-read */ } }

  var months = {};
  var sheet = getSheet(SPONSOR);
  var last = sheet.getLastRow();
  if (last >= 2) {
    var rows = sheet.getRange(2, 1, last - 1, 2).getValues();
    for (var r = 0; r < rows.length; r++) {
      var m = normaliseMonth(rows[r][SPONSOR.keyCol - 1]);
      var s = String(rows[r][SPONSOR.statusCol - 1] || '').trim().toLowerCase();
      if (!m) continue;
      months[m] = (s === 'taken' || s === 'reserved') ? s : 'available';
    }
  }
  cache.put(SPONSOR.cacheKey, JSON.stringify(months), CACHE_TTL_SECS);
  return months;
}

/** Accepts a real Date cell or a "YYYY-MM" string; returns "YYYY-MM" or ''. */
function normaliseMonth(v) {
  if (v instanceof Date) {
    var mm = v.getMonth() + 1;
    return v.getFullYear() + '-' + (mm < 10 ? '0' + mm : mm);
  }
  var s = String(v || '').trim();
  return /^\d{4}-\d{2}$/.test(s) ? s : '';
}

/* --------------------------------------------------------------- write */

/**
 * Camp bookings only. Sponsorship enquiries deliberately do NOT write here:
 * they go to the email relay and never consume a month.
 */
function doPost(e) {
  var data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return json({ error: 'bad_request' });
  }

  // Honeypot: the browser also guards this, but never trust the client.
  if (data.company_website) return json({ ok: true, counts: getCampCounts() });

  var day = String(data.day || '').trim();
  if (CAMP.keys.indexOf(day) === -1) return json({ error: 'bad_day' });
  if (!String(data.attendee || '').trim()) return json({ error: 'missing_name' });
  if (!String(data.phone || '').trim())    return json({ error: 'missing_phone' });

  // Serialise the capacity check with the append. Without this lock two people
  // can both read "39 booked" and both take the last seat.
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (err) {
    return json({ error: 'busy' });
  }

  try {
    var counts = getCampCounts(true);                // authoritative read inside the lock
    if (counts[day] >= CAMP.capacity) {
      return json({ error: 'full', counts: counts });
    }

    getSheet(CAMP).appendRow([
      new Date(), day,
      str(data.attendee), str(data.age), str(data.guardian),
      str(data.phone), str(data.email), str(data.notes),
      str(data.source), str(data.language)
    ]);

    counts[day] = counts[day] + 1;
    CacheService.getScriptCache().put(CAMP.cacheKey, JSON.stringify(counts), CACHE_TTL_SECS);
    return json({ ok: true, counts: counts });
  } finally {
    lock.releaseLock();
  }
}

/* -------------------------------------------------------------- helpers */

function getSheet(cfg) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(cfg.sheet);
  if (!sheet) {
    sheet = ss.insertSheet(cfg.sheet);
    sheet.appendRow(cfg.headers);
  } else if (sheet.getLastRow() === 0) {
    sheet.appendRow(cfg.headers);
  }
  return sheet;
}

function str(v) {
  return v === undefined || v === null ? '' : String(v).slice(0, 500);
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
