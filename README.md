# AlKhwarizmi AI — Website

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
| `fonts.css`, `assets/fonts/` | Self-hosted IBM Plex Sans, Plex Sans Arabic and Plex Mono (woff2 subsets, OFL). No Google Fonts request. |
| `main.js` | Language toggle, header dropdowns, mobile menu, lead forms, analytics events, Insights filter |
| `config.js` | **Fill this in:** Supabase URL + anon key, GA4 measurement id |
| `supabase/` | `001_leads.sql` (run once in your Supabase project) and setup notes |
| `assets/` | Logo, share image `og.png`, the al-Jabr figure in `motif/`, drop-in photos in `photos/` |

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

An academy look: mostly light pages with cards, and deep purple kept for accents. White (`.tone-1`) and soft
lavender (`.tone-2`, `.paper`) carry most sections; deep purple (`.tone-3`) is used for heroes, the Studio feature,
quote bands, the consultation form and the footer. On light grounds violet `#5B21B6` is the link and button colour;
on purple, cyan is the single accent (primary button, focus outlines, the figure). Components read semantic
variables (`--bg`, `--fg`, `--fg-soft`, `--muted`, `--rule`, `--link`, `--surface`, `--card-border`, `--badge-bg`,
`--btn-bg`), so a surface class only swaps values and every card works on both grounds.

Content sits in cards (radius 16px, hairline border, soft shadow; a 2px lift on hover with a mouse): audience cards,
programme cards with a photo on top, badges, details and price, day cards for the Studio, numbered document cards,
and checklists held in a single card. The header is white with a shadow once the page scrolls; the language switch
is a sliding pill (EN | ع) whose thumb follows the page language. Type is one family: IBM Plex Sans and Plex Sans
Arabic for headings and text, Plex Mono for small labels. No glows, blurs or gradient fills. All text meets WCAG AA
contrast.

The recurring figure (`assets/motif/`) is al-Khwarizmi's own: the completing-the-square diagram from his book of
algebra, which solves x² + 10x = 39. The SVGs are plain files and can be edited by hand.

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
