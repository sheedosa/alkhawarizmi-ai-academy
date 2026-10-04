# AlKhwarizmi AI — Website

Libya's first AI academy. Bilingual (English / العربية) site with full right-to-left support.

**Live site:** https://sheedosa.github.io/alkhawarizmi-ai-academy/

## Stack

Static HTML/CSS/JS — no build step, no dependencies.

- `index.html` — Home (English default; the header toggle switches to Arabic and persists)
- `404.html` — shown for any page not published yet
- `styles.css` — design tokens, sections, responsive and touch rules
- `main.js` — language toggle, header dropdowns, mobile menu
- `assets/` — WebP imagery (with smaller mobile variants), logo, flags

Built from the Claude Design "site v2" Home design. Inner pages (Studio, Diploma,
Enterprise & Government, About, Insights, Contact) are not built yet.

## Local preview

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080/.

## Deployment

Served via GitHub Pages from the `main` branch root.
