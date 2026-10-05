/**
 * AlKhwarizmi AI — website enquiries receiver.
 * Paste into the enquiries sheet: Extensions > Apps Script. Then Deploy > New deployment > Web app,
 * Execute as: Me, Who has access: Anyone. Put the Web app URL in config.js as SHEET_URL.
 *
 * Each form submission becomes one row in the "Enquiries" tab (columns matched by header name)
 * and an alert email to NOTIFY_EMAIL. Returns JSON {ok: true} to the website.
 */

var SHEET_NAME = 'Enquiries';
var NOTIFY_EMAIL = 'info@alkhawarizmi.ai';   // leave '' to turn the alert emails off
var TIME_ZONE = 'Africa/Tripoli';

// Sheet header -> field sent by the website (main.js leadPayload)
var COLUMNS = {
  'Form': 'form', 'Programme': 'programme', 'Audience': 'audience', 'Name': 'name', 'Email': 'email',
  'Phone': 'phone', 'Organisation': 'organisation', 'Job title': 'role', 'Edition': 'edition',
  'Message': 'message', 'Language': 'lang', 'Page': 'source_page', 'Referrer': 'referrer',
  'UTM source': 'utm_source', 'UTM medium': 'utm_medium', 'UTM campaign': 'utm_campaign', 'Session': 'session_id'
};
var FORM_NAMES = {
  studio: 'The Studio', diploma: 'The Diploma', week: 'The AI Strategy Week', custom: 'Custom Training',
  policy: 'The Policy Briefing', contact: 'Contact form', newsletter: 'Insights newsletter'
};
var MAX_LEN = 2000;

function doPost(e) {
  var data;
  try { data = JSON.parse((e && e.postData && e.postData.contents) || '{}'); }
  catch (err) { return reply({ ok: false, error: 'bad-json' }); }

  // Bots: a filled honeypot or a form sent faster than a person can type. Answer "ok" so they learn nothing.
  if (data.website || (data.elapsed_ms && Number(data.elapsed_ms) < 2000)) return reply({ ok: true });

  var name = clean(data.name), email = clean(data.email).toLowerCase();
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply({ ok: false, error: 'invalid' });

  // Flood limits: 5 per email address per 10 minutes, 60 per minute in total.
  var cache = CacheService.getScriptCache();
  var perEmail = Number(cache.get('e:' + email) || 0), perMinute = Number(cache.get('all') || 0);
  if (perEmail >= 5 || perMinute >= 60) return reply({ ok: false, error: 'rate-limited' });
  cache.put('e:' + email, String(perEmail + 1), 600);
  cache.put('all', String(perMinute + 1), 60);

  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var now = new Date();
    var row = headers.map(function (h) {
      h = String(h).trim();
      if (h === 'Received') return now;
      if (h === 'Status') return 'New';
      if (h === 'Name') return safe(name);
      if (h === 'Email') return safe(email);
      return COLUMNS[h] ? safe(clean(data[COLUMNS[h]])) : '';
    });
    sheet.appendRow(row);
    var r = sheet.getLastRow(), c = headers.indexOf('Received') + 1;
    if (c > 0) sheet.getRange(r, c).setNumberFormat('yyyy-mm-dd hh:mm');
  } finally {
    lock.releaseLock();
  }

  if (NOTIFY_EMAIL) {
    try { notify(data, name, email); } catch (err) { console.error('alert email failed: ' + err); }
  }
  return reply({ ok: true });
}

// Opening the Web app URL in a browser shows this, which confirms the deployment works.
function doGet() {
  return ContentService.createTextOutput('AlKhwarizmi AI enquiries receiver is running.');
}

function notify(data, name, email) {
  var form = FORM_NAMES[data.form] || data.form || 'Website';
  var lines = [
    'New enquiry from the website.', '',
    'Form: ' + form,
    'Name: ' + name,
    'Email: ' + email
  ];
  [['Phone', 'phone'], ['Organisation', 'organisation'], ['Job title', 'role'], ['Edition', 'edition'],
   ['Audience', 'audience'], ['Language', 'lang'], ['Page', 'source_page']].forEach(function (p) {
    var v = clean(data[p[1]]);
    if (v) lines.push(p[0] + ': ' + v);
  });
  var msg = clean(data.message);
  if (msg) lines.push('', 'Message:', msg);
  lines.push('', 'All enquiries: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl());
  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    replyTo: email,
    subject: '[Website] ' + form + ' — ' + name,
    body: lines.join('\n')
  });
}

function clean(v) {
  if (v === null || v === undefined) return '';
  return String(v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, MAX_LEN);
}

// Text that starts like a formula is stored as text, so the sheet never runs it.
function safe(v) {
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Run once from the editor (select testSetup > Run) to check access and send yourself a sample alert.
function testSetup() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('No tab named ' + SHEET_NAME);
  if (NOTIFY_EMAIL) MailApp.sendEmail(NOTIFY_EMAIL, '[Website] Enquiry alerts are set up', 'Alerts for new website enquiries will arrive here.');
  console.log('OK: tab found, alert email ' + (NOTIFY_EMAIL ? 'sent to ' + NOTIFY_EMAIL : 'off'));
}
