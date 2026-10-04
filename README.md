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
| `styles.css` | Design tokens, sections, components, responsive + touch rules |
| `main.js` | Language toggle, header dropdowns, mobile menu, lead forms, analytics events, Insights filter |
| `config.js` | **Fill this in:** Supabase URL + anon key, GA4 measurement id |
| `supabase/` | `001_leads.sql` (run once in your Supabase project) and setup notes |
| `assets/` | WebP imagery (with smaller mobile variants), logo, flags |

## Language

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

## Local preview

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080/.

## Deployment

Served via GitHub Pages from the `main` branch root. `404.html` uses `<base href="/alkhawarizmi-ai-academy/">`
so it renders correctly at any depth; change it if the site moves to a custom domain.
