// Site configuration. Fill these in once the services exist; leave empty to disable.
// This file is public (it ships to the browser). Only put PUBLIC keys here.
window.AKAA_CONFIG = {
  // Google Sheet receiver (Apps Script Web app URL, see tools/sheet/Code.gs). When set, forms save here.
  SHEET_URL: 'https://script.google.com/macros/s/AKfycbyKCr2HSZKAw1V157caWt_8EX1D_7QKenojwZEsxrIShbQNsaD3HR82PXLfy3tcDYCPLQ/exec',
  // Supabase project on the academy's own account (see supabase/README.md).
  SUPABASE_URL: '',        // e.g. 'https://abcdefghijkl.supabase.co'
  SUPABASE_ANON_KEY: '',   // the "anon" / "publishable" key — safe in the browser because of RLS
  // Google Analytics 4 measurement id.
  GA4_ID: '',              // e.g. 'G-XXXXXXXXXX'
  // Social accounts shown in the footer. Full https:// URLs; leave empty to hide.
  SOCIAL: {
    linkedin: '',
    instagram: '',
    facebook: '',
    x: '',
    youtube: '',
    tiktok: ''
  }
};
