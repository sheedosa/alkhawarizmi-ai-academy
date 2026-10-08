# AlKhwarizmi AI Academy — Website

Libya's first AI academy. Bilingual (English / العربية) site with full right-to-left support.

**Live site:** https://sheedosa.github.io/alkhawarizmi-ai-academy/

## Stack

Static HTML/CSS/JS — no build step, no dependencies.

| File | What it is |
|---|---|
| `index.html` | Home |
| `studio.html`, `diploma.html` | Individuals route (register-interest forms) |
| `organisations.html` | Enterprise & Government: Strategy Week `#week`, Custom Training `#custom`, Policy Briefing `#policy`, consultation form `#consult` |
| `about.html`, `insights.html`, `contact.html`, `privacy.html` | Academy pages |
| `404.html` | Shown for any unknown URL |
| `styles.css` | Design tokens, sections, components, responsive + touch rules, Arabic typography resets |
| `fonts.css`, `assets/fonts/` | Self-hosted Outfit, IBM Plex Sans, Tajawal (Arabic) and Plex Mono (woff2 subsets, OFL). No Google Fonts request. |
| `main.js` | Language toggle, header dropdowns, mobile menu, lead forms, analytics events, Insights filter |
| `config.js` | **Fill this in:** Supabase URL + anon key, GA4 measurement id |
| `supabase/` | `001_leads.sql` (run once in your Supabase project) and setup notes |
| `assets/` | Logo (`mark.svg` vector mark used in the header, footer and favicon; `mark.png` fallback; `logo.png`), share image `og-logo.png`, the identity's line art in `brand/`, the al-Jabr figure in `motif/` (About only), drop-in photos in `photos/` |

## Language

Text the CSS cannot switch (dropdown options, form placeholders, meta description, aria labels)
carries `data-en` / `data-ar` (or `data-ph-en` / `data-ph-ar`) and is set by `main.js` on load and on toggle.
Number ranges inside Arabic text are wrapped in `<span class="num">` so they read left-to-right.


English is the default. The header toggle switches the whole page to Arabic (RTL) and the choice
persists in `localStorage` (`akaa-lang`). Every piece of copy exists twice in the markup:
`<span data-l="en">…</span><span data-l="ar">…</span>`; CSS shows the one matching `<html lang>`.

## Leads and analytics

- **Current backend: a Google Sheet.** Forms (`<form data-lead="…">`) POST to a Google Apps Script web app
  (`tools/sheet/Code.gs`, pasted into the sheet via Extensions > Apps Script) whose URL is `SHEET_URL` in
  `config.js`. Each enquiry becomes a row in the sheet's Enquiries tab (Status starts as New) and an alert email
  goes to info@alkhawarizmi.ai. The script drops honeypot and bot-fast submissions, limits floods and stores
  formula-like text as plain text. The sheet's "How it works" tab explains the columns and how to redeploy.
- **Later: Supabase.** With `SHEET_URL` empty and the Supabase keys set, forms write to the `leads` table instead
  (see `supabase/README.md`). With neither set, submitting opens a pre-filled email to info@alkhawarizmi.ai, so
  nothing is lost.
- GA4 loads only when `GA4_ID` is set. Events: `view_programme`, `select_route`, `cta_click`,
  `form_start`, `generate_lead` (mark as key event), `form_error`, `lang_toggle`, `filter_insights`.
  Roadmap and funnel definitions: `ROADMAP.md`.

## Design

An academy look modelled on a course-platform layout: light lavender and white pages with soft corner glows, cards
with 16px corners, and deep purple for the stats band, the Studio feature, the closing panel and the footer. Purple is
the brand colour; amber (`--amber`) is the warm accent for secondary buttons, badges and the short bar before each
section label. Components read semantic variables (`--bg`, `--fg`, `--fg-soft`, `--muted`, `--rule`, `--link`,
`--surface`, `--card-border`, `--badge-bg`, `--btn-bg`), so a surface class only swaps values.

Type: headings and card titles in Outfit, text and labels in IBM Plex Sans. Arabic uses one family, Tajawal, for
everything (chosen for its large, open letter shapes at small sizes): weight 400 is served by Tajawal Medium because the
regular cut is thin on screens, `size-adjust: 106%` keeps Arabic the same visual size as the Latin text, Arabic lines get
more leading (1.75 for text, 1.4 to 1.5 for headings) for the dots and vowel marks, and Arabic labels never go below
14.5px. All fonts are self-hosted in `assets/fonts/`; three are preloaded (Plex Sans, Outfit, Tajawal Medium). Headings
carry no closing full stop. Labels are sentence case with an amber bar, tags are coloured text separated by dots, and
each page has one title in the reader's language.

Home runs: hero (centred title, two buttons, a row of programme frames with a stat card) · next groups · programme
catalogue with filter tabs · the academy (photo collage, badge, checklist) · who it's for (3 × 2 cards) · the academy in
numbers · how we teach · the Studio · the Strategy Week · how to join · testimonials · FAQ · from the academy · closing
panel with a cut-out photo. Inner-page heroes are light with an at-a-glance card; a hero photo turns them dark.

Home is six sections: hero (two buttons that preset the programme filter) → the five programme cards with
All / Individuals / Organisations tabs → why us (four points and the numbers band) → how to join (three steps) →
four common questions → the enquiry form at `#enquire`, which every "enquire" link opens with the programme
preselected; a sticky bar offers it once the hero has scrolled away. The form posts to the Google Sheet like the
other forms (Form column = the chosen programme, or `contact` for "Not sure yet"; Page column = `/index.html#enquire`).
Nothing on Home repeats a programme page: the day-by-day plan, the nine documents and the teaching method live on
their own pages and on About.

Programme pages share one structure, ordered by the questions a visitor asks: hero with an at-a-glance card → who
it's for (one short passage) → what you do (the Studio's day-by-day plan, the Diploma's eight months, the Week's nine
documents, Custom Training's five steps) → what you leave with → editions → practical details → four questions (also
published as FAQPage data) → the form → other programmes as one line of links. The five programme pages are
`studio.html`, `diploma.html`, `strategy-week.html`, `custom-training.html` and `policy-briefing.html`;
`organisations.html` is a short overview with one consultation form for organisations that are not sure yet. Old links
to `organisations.html#week`, `#custom` and `#policy` redirect to the new pages. Practical details that are not known
yet are kept in `content.py` as `None` and stay off the page; `DETAILS.md` lists them for the academy to fill in.
Copy rules: headings of at most eight words, intros of at most two sentences, one call to action per section.

The About page tells the academy's story visually: an at-a-glance card, a four-step timeline from al-Khwarizmi to AI,
the site's figure explained in three drawn steps (how x² + 10x = 39 is solved by completing the square), the teaching
method as a session bar and icon tiles, a visit card with a drawn street map, the numbers band and a line of links to the programmes. A "Who teaches" section appears once `TEAM` in `content.py` has real people.

Brand: the site follows the 2026 visual identity. Colours are Emerald Teal `#09C98E`, Royal Indigo `#534CB6` and
Midnight Navy `#111128` (tokens `--teal`, `--indigo`/`--violet`, `--night-3`, gradient `--grad`); teal is never used for
small text on white (its contrast is too low), only for bars, buttons on navy, icons and large text on navy, with
`--teal-ink` for text. Fonts, all free and self-hosted in `assets/fonts/`: Aileron (CC0) for English headlines and
the wordmark, Oxygen (OFL) for English text, Alexandria (OFL, the nearest free face to the identity's Noor) for
Arabic headlines and the wordmark, Noto Naskh Arabic (OFL, a Naskh text face like Greta Arabic) for Arabic text.
`assets/brand/` holds the identity's devices as SVG: the geometric-expansion line art of the map, the K and the خ
(`expand-*.svg`, drawn behind navy sections), the dot marker (`dots.svg`, section openers) and the K pattern strip
(`k-pattern.svg`). The al-Jabr figure now appears only in the About story. The logo lockup is the mark beside the
two-line name (ALKHWARIZMI / AI ACADEMY, أكاديمية الخوارزمي / للذكاء الاصطناعي).

Search and sharing: every page has a title under 65 characters, a description under 160, a canonical URL, Open Graph
and X/Twitter tags, and structured data (the organisation and website on Home; Course, FAQPage and BreadcrumbList on
programme pages; BreadcrumbList on the rest). Links shared on WhatsApp, Facebook, LinkedIn or X show `og-logo.png`, the
logo on white (1200×630). If a platform still shows an old preview, re-scrape the URL in its debugger (Facebook Sharing
Debugger, LinkedIn Post Inspector). Submit `sitemap.xml` in Google Search Console: on a `github.io` project address
`robots.txt` is not read from this folder, so the sitemap must be submitted by hand until the site has its own domain.

Analytics: every button and link carries a `data-track` event (`select_route`, `cta_click`, `filter_programmes`,
`form_start`, `generate_lead`). They are sent to GA4 once `GA4_ID` is set in `config.js`; mark `generate_lead` as a
key event in GA4 to measure enquiries.

Content lives in the scratchpad generators: `content.py` holds the next-group dates (`NEXT_GROUPS`), the numbers
(`STATS`), the FAQ, and `TESTIMONIALS` / `PARTNERS`. The testimonials section and the partner logos stay hidden
until those lists contain real quotes and real partners. Every number on the site is a real programme fact.

The recurring figure (`assets/motif/`) is al-Khwarizmi's own: the completing-the-square diagram from his book of
algebra, which solves x² + 10x = 39. Programme drawings (`icons.py`) use the same 1.5px line.

## Photos

Every image slot is a `<figure data-photo="id">`. Upload the original `assets/photos/<id>.jpg` (4K welcome): the
`Photos` workflow (`.github/workflows/photos.yml`, script `tools/photos.mjs`, using sharp) writes WebP sizes from
640 to 3840 px to `assets/photos/web/` and lists them in `assets/photos/manifest.json`. `main.js` reads the manifest
and gives each slot a `srcset`, so browsers download only the width they need; ids not in the manifest make no
request. Bands and programme images show a framed placeholder while empty (a light frame where a dark one would merge with a neighbouring purple section); other slots stay hidden. The full list
of slots, file names and sizes is in `PHOTOS.md`. Add `?photos` to any URL to see each slot labelled.

## Local preview

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080/.

## Deployment

Served via GitHub Pages from the `main` branch root. `404.html` uses `<base href="/alkhawarizmi-ai-academy/">`
so it renders correctly at any depth; change it if the site moves to a custom domain.
