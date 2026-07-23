# AlKhwarizmi AI Academy — Website

Libya's first AI academy. A bilingual (English / العربية) single-page marketing site
with practical, accredited AI programs for kids, professionals, executives, and policymakers.

**Live site:** https://sheedosa.github.io/alkhawarizmi-ai-academy/

## Stack

Static HTML/CSS/JS — no build step, no dependencies.

- `index.html` — page markup (semantic landmarks, SEO meta, JSON-LD, ARIA)
- `assets/styles.css` — design tokens, components, responsive layer
- `assets/app.js` — language toggle (EN ⇄ AR + RTL), story tabs, mobile menu, mailto forms
- `assets/*.svg` / `*.jpg` — logos, favicon, portraits, social-share image

## Features

- **Bilingual** English / Arabic with full right-to-left mirroring; choice persists across visits
- **Responsive** from 320 px phones to desktop, with an accessible hamburger menu
- **Accessible** — WCAG 2.1 AA: semantic landmarks, labeled forms, keyboard-navigable tabs,
  visible focus rings, AA color contrast, reduced-motion support
- **SEO** — Open Graph + Twitter cards, canonical URL, and `EducationalOrganization` structured data

## Local preview

Any static server works, e.g.:

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080/.

## Deployment

Served via GitHub Pages from the `main` branch root. The `_headers` file sets asset
cache policy on Netlify (ignored by GitHub Pages).
