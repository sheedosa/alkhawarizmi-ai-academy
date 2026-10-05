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

- Forms (`<form data-lead="…">`) POST to the Supabase `leads` table using the anon key; RLS allows
  insert only. Until `config.js` is filled in, submitting opens a pre-filled email to
  info@alkhawarizmi.ai instead, so nothing is lost. Setup: see `supabase/README.md`.
- GA4 loads only when `GA4_ID` is set. Events: `view_programme`, `select_route`, `cta_click`,
  `form_start`, `generate_lead` (mark as key event), `form_error`, `lang_toggle`, `filter_insights`.
  Roadmap and funnel definitions: `ROADMAP.md`.

## Design

Deep purple and technical. Dark purple grounds (`.tone-1`, `.tone-2`, `.tone-3`) with lavender `.paper` sections
for forms and long reading; lilac for links; cyan as the single accent, kept for the primary button, focus
outlines and the figure. Components read semantic variables (`--bg`, `--fg`, `--fg-soft`, `--muted`, `--rule`,
`--link`), so a surface class only swaps values. Type is one family: IBM Plex Sans and Plex Sans Arabic for
headings and text, Plex Mono for small labels. Content sits on 1px rules rather than in boxed cards, with numbers
only where there is a real sequence. No glows, blurs or gradient fills.

The recurring figure (`assets/motif/`) is al-Khwarizmi's own: the completing-the-square diagram from his book of
algebra, which solves x² + 10x = 39. The SVGs are plain files and can be edited by hand.

## Photos

Every image slot is a `<figure data-photo="id">`. Upload `assets/photos/<id>.jpg` and it appears; until then the
slot is hidden and the layout falls back to text. The full list of slots, file names and sizes is in `PHOTOS.md`. Add `?photos` to any URL to
see each slot labelled.

## Local preview

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080/.

## Deployment

Served via GitHub Pages from the `main` branch root. `404.html` uses `<base href="/alkhawarizmi-ai-academy/">`
so it renders correctly at any depth; change it if the site moves to a custom domain.
