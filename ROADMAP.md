# AlKhwarizmi AI website — analysis and roadmap

_October 2026. Covers the static site in this repository._

## 1. Where the site stands

**Built**
- Eight pages: Home, Studio, Diploma, Enterprise & Government (Strategy Week · Custom Training · Policy
  Briefing · consultation), About, Insights, Contact, Privacy, plus a 404.
- Fully bilingual EN/AR with real RTL; the choice persists and is applied before first paint.
- Two audiences routed from the first screen: Individuals → Studio/Diploma → *Register interest*;
  Enterprise & Government → Organisations → *Book a consultation*; undecided → Contact (routes by radio).
- Lead capture on five forms, stored in Supabase (insert-only from the browser), with a pre-filled email
  fallback until Supabase is configured. Every lead carries programme, audience, language, source page,
  referrer, UTM tags and a session id, so it can be joined to analytics.
- GA4 event model: `view_programme → select_route → cta_click → form_start → generate_lead` (+ `form_error`,
  `lang_toggle`, `filter_insights`). GA4 loads only once an id is set in `config.js`.
- SEO basics: per-page titles/descriptions/canonicals, Open Graph, JSON-LD (`EducationalOrganization`,
  `Course` ×5, `AboutPage`, `ContactPage`, `CollectionPage`), sitemap with 8 URLs.
- Mobile verified 320–1440px in both languages: no horizontal scroll, touch targets, swipe rows, WebP images
  with phone variants (~300 KB total).

**Not yet**
- No real photography (geometric placeholders everywhere); no founder, partner or testimonial proof.
- One URL per page for both languages → Arabic content is not indexable as Arabic pages; no `hreflang`.
- Insights articles are index entries only; there are no article pages.
- No custom domain; canonical URLs point at `sheedosa.github.io/alkhawarizmi-ai-academy/`.
- No email/Slack notification when a lead arrives (dashboard only, by decision).

## 2. The funnels

| Funnel | Steps (GA4 events) | Conversion |
|---|---|---|
| Individuals | `page_view` (Home) → `select_route` (who-card / routes / hero) → `view_programme` (studio\|diploma) → `form_start` → `generate_lead` | `leads.form in ('studio','diploma')` |
| Organisations | `page_view` → `select_route` (routes_week/custom/policy, hero_enterprise) → `view_programme` (organisations) → `cta_click` (org_hero_consult) → `form_start` → `generate_lead` | `leads.form in ('week','custom','policy')` |
| Undecided | `page_view` → `cta_click` (header_contact) → `form_start` → `generate_lead` | `leads.form = 'contact'`, split by `audience` |

Segment every funnel by `lang` (ar/en) and by device. The two numbers to watch weekly: **programme-page →
form_start** (is the page convincing?) and **form_start → generate_lead** (is the form too long?).

## 3. Step-by-step plan

### Step 0 — Go live with capture (day 0–1)
1. Create the Supabase project on the academy's account; run `supabase/001_leads.sql`; copy URL + anon key
   into `config.js` (see `supabase/README.md`).
2. Create a GA4 property for the site; copy the `G-…` id into `config.js`.
3. Push `main`. Submit one test lead per form; confirm rows in Table Editor and events in GA4 DebugView.
4. In GA4 → Admin → Events, mark `generate_lead` as a **key event**.

### Step 1 — Funnels and dashboards (day 1–3)
1. GA4 → Explore → Funnel exploration: build the two funnels above (open funnel, 30-day window).
2. Register custom dimensions for event params `programme`, `form`, `audience`, `lang`, `label`.
3. Supabase: save filtered views in Table Editor (`leads_new`, per `form`). Agree a weekly 20-minute
   lead-review ritual: set `status`, add `notes`.
4. Optional later: Supabase Edge Function → Resend email on insert (if "dashboard only" stops being enough).

### Step 2 — Trust and conversion (week 1–3)
1. Shoot real photography: the room mid-session, hands on keyboards, printed deliverables, the building on
   Zawiat Dahmani Street. Replace `assets/hero-v4.webp`, `v-studio*.webp`, `v-week*.webp`, `building.webp`.
2. Add one credibility line under the Home hero or in About: a founder name, role and one sentence
   (the old site's `assets/drali.jpg` exists in git history `40fc014`).
3. After the first cohort: 2–3 short participant quotes with first name + role, placed on Studio and Home.
4. Keep the brief's rules: no dates, no "seats remaining", no accreditation claims.

### Step 3 — Arabic SEO (week 2–4)
1. Generate two URL trees from the same content — `/` (EN) and `/ar/` (AR) — with a small Node build script
   (the bilingual `data-l` spans make this mechanical). Add `<link rel="alternate" hreflang>` pairs and
   `x-default`.
2. Keep the toggle: it switches between the two URLs instead of flipping classes.
3. Google Search Console: verify, submit the sitemap, request indexing of `/ar/` pages.

### Step 4 — Custom domain (when the DNS owner is available)
1. Add `CNAME` file with `alkhawarizmi.ai` (or `www.`), point DNS at GitHub Pages, enforce HTTPS.
2. Change the single `BASE` constant used for canonicals/OG/sitemap/404 `<base href>`.

### Step 5 — Content engine (month 1–2)
1. Insights articles as Markdown → static pages via the same build script; `Article` JSON-LD; share images.
2. A newsletter capture (`leads.form = 'newsletter'`) at the end of each article and in the footer.
3. One piece per fortnight, in Arabic first — the "Live builds" category is the strongest proof format.

### Step 6 — Performance polish
1. ~~Self-host fonts~~ Done: Outfit, Cairo and Plex Arabic are served from `assets/fonts/` (380 KB of subsets).
2. Target Lighthouse ≥ 95 mobile. Current image budget is ~200 KB; keep it.

### Step 7 — Experiments (month 2+)
1. Use funnel drop-off to pick one test at a time: hero headline (six candidates already drafted), CTA
   wording ("Register interest" vs "Join the next cohort"), price visibility on programme pages.
2. Implement as a URL param (`?v=b`) that flips copy and sends `experiment_variant` on every event. No paid
   tooling needed at this traffic level.

### Step 8 — Governance
- Keep `privacy.html` accurate as tools change.
- Retention: delete leads older than 24 months (`supabase/README.md` has the SQL).
- Supabase: enable daily backups; review RLS with the Security Advisor after any schema change.
- Access: at least two people hold the Supabase and GA4 logins.
