# Lead storage (Supabase)

Website forms write one row per submission to a `leads` table. The browser holds only the
**anon/publishable** key and may only *insert*; reading is done in the Supabase dashboard.

## One-time setup (≈10 minutes)

1. Sign in to https://supabase.com with the **academy's** account and create a project
   (e.g. `alkhwarizmi-ai`, region `eu-central-1`). Note the database password somewhere safe.
2. Open **SQL Editor → New query**, paste the contents of `001_leads.sql`, and **Run**.
3. Go to **Project Settings → API**. Copy:
   - **Project URL** (`https://xxxx.supabase.co`)
   - **anon public** key (under *Project API keys*; on newer projects it is called *publishable*)
4. Edit `config.js` at the site root and fill `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
5. Commit + push. Submit a test form on the live site.
6. Open **Table Editor → leads** (or the `leads_new` view). The test row should be there.

Until step 4 is done, forms fall back to opening the visitor's email client with the details
pre-filled, addressed to info@alkhawarizmi.ai — so no enquiry is lost.

## Day-to-day

- **Dashboard:** Table Editor → `leads_new` shows untouched leads; set `status` to
  `contacted` / `qualified` / `enrolled` / `declined` / `spam` as you work them. `notes` is free text.
- **Export:** Table Editor → `…` → *Export as CSV* (or SQL Editor → run a query → download).
- **Counts:** the `leads_daily` view gives leads per day per form.

## Data stored

name, email, phone, organisation, role, message, edition, which form, language, source page,
referrer, UTM parameters, a per-tab random session id, browser user agent, timestamp.
See `/privacy.html` on the site. Suggested retention: delete rows older than 24 months
(`delete from leads where created_at < now() - interval '24 months';`).
