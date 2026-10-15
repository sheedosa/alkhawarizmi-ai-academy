# Details to fill in

The programme pages now have a **Practical details** section. These facts are not on the site yet, so their rows
are hidden. Answer below (English and Arabic if you can; I can translate), send it back, and they appear on the page.

Nothing here is published until you confirm it.

**Arabic copy to sign off:** the October copy pass rewrote many lines in both languages. `COPY-REVIEW.md` lists every
changed line (old English, new English, new Arabic) so the Arabic can be checked before it goes live.

**Two more things the programme pages would benefit from:** a day-by-day plan for the Strategy Week and the Policy
Briefing (AI Productivity already has one), and the names of the certificate levels, so "the level you reached" can be
stated rather than implied.

## AI Productivity (`ai-productivity.html`, formerly the Studio)

- **Days and times** (الأيام والأوقات): Which days, and what hours? e.g. Sunday–Thursday, 5–8 pm, over two weeks
  - Answer: 
- **Group size** (حجم الدفعة): Maximum participants per group, e.g. 14
  - Answer: 
- **Payment** (الدفع): How and when people pay: bank transfer, cash at the academy, instalments, deposit to hold a place
  - Answer: 
- **Instructors** (المدرّبون): Who teaches: names and one line each, or 'Practitioners from …'
  - Answer: 

## The Diploma (`diploma.html`)

- **Weekly schedule** (الجدول الأسبوعي): How many sessions a week, which days, what hours; daytime or evenings
  - Answer: 
- **Entry requirements** (شروط القبول): Any requirement: age, education, English level, a short interview, or 'none'
  - Answer: 
- **Payment and instalments** (الدفع والأقساط): Full payment or instalments (how many, when); any deposit
  - Answer: 
- **Instructors** (المدرّبون): Who teaches and supervises the projects
  - Answer: 

## The AI Strategy Week (`strategy-week.html`)

- **Places per organisation** (عدد المقاعد لكل مؤسسة): How many people one organisation can send to an Open Week
  - Answer: 
- **Invoicing and payment** (الفوترة والدفع): Invoiced to the organisation? Payment terms (e.g. 30 days)?
  - Answer: 

## Custom Training (`custom-training.html`)

- **Group size** (حجم المجموعة): Typical or maximum team size per group
  - Answer: 
- **Time from consultation to start** (المدة من الاستشارة إلى البدء): How soon training can start after the consultation, e.g. 2–4 weeks
  - Answer: 

## The Policy Briefing (`policy-briefing.html`)

- **Invoicing and payment** (الفوترة والدفع): Invoiced to the ministry? Payment terms?
  - Answer: 

## Dates for the next groups

Shown in each programme page's At a glance card and in the forms. Until they are set the pages say "Not yet scheduled.
Register and you hear first", and every form promises a reply within two working days; the three "what happens next"
steps beside each form come from `JOIN` in the content file. Once a date is known it replaces that line everywhere.

- **AI Productivity** (ai-productivity.html): start date
  - Answer: 
- **The Diploma** (diploma.html): start date
  - Answer: 
- **The AI Strategy Week** (strategy-week.html): start date
  - Answer: 

## Who teaches (About page)

The About page has a "Who teaches" section that stays hidden until there are real people in it. For each person:

- **Name** (English and Arabic)
  - Answer: 
- **Role**, e.g. "Lead instructor, AI Productivity"
  - Answer: 
- **One line** about them, e.g. what they have built or taught
  - Answer: 
- **Portrait photo**: upload to `assets/photos/` as `team-1.jpg`, `team-2.jpg` … (up to six), portrait shape, plain background
  - Answer: 

## Optional, when you have them

- **Testimonials**: real quotes with the person's name and role, and their permission. The section stays hidden until there are some.
- **Partner logos**: organisations you work with, with permission to show their logo.
- **Google Analytics 4 Measurement ID** (`G-XXXXXXX`), so enquiries and drop-offs can be measured. Until it is set,
  nothing is measured and the Privacy page says so; once set, the page switches to the analytics paragraph by itself.

## Partner pitch (organisations)

The organisation pages now follow the partner-pitch rules: the position line, the four moves, a free demonstration as
the first step, then a consultation with a one-page draft roadmap, then the programme the roadmap points to. Before
the next items can go on the site, please confirm:

- **The employer edition of AI for Public** (staff count per cohort, the institution's name on the certificate, the
  hands-on share): it is not on the site until these are confirmed; HR audiences are pointed at Custom Training.
  - Answer: 
- **The weekly cadence after Custom Training** ("the weekly hour": a short weekly session, written playbooks, a
  published rubric): named on the Custom Training page as part of how it works; confirm the name and whether it is
  priced separately.
  - Answer: 
- **The demonstrations** (cloned-voice drill; a classifier built and broken in twenty minutes; an assistant or
  dashboard built live): who runs them and where they can be booked. No person is named on the site.
  - Answer: 
- **The figures** "58% hands-on", "50 teaching hours" and "62 labs": the site does not use them until confirmed.
  - Answer: 
- **Dr Ali's written yes** for the founder block (portrait, his words, "Dr Ali Abusnina, founder") on Home and About.
  - Answer: 
- **One email address**: the website uses info@alkhawarizmi.ai; the deck says consultant@aiswat.ai and the catalogue
  admin@alkhawarizmi.ai. Which one stands?
  - Answer: 

## Social accounts

Full links to the academy's profiles. They appear as badges in the footer, on the Contact page and on About, and are
added to the site's search data as the academy's official profiles. An empty one is simply not shown.

- LinkedIn: 
- Facebook: 
- Instagram: 
- TikTok: 
- X and YouTube (if the academy has them): 

These go into `config.js` under `SOCIAL`.

## The founder (Home and About)

Home now leads with Dr. Ali Abusnina: his portrait from the previous site, his own words ("I spent years working with AI
outside Libya…") and "From Libya, for Libya." Nothing else about him is published yet. Two slots are ready and stay
hidden until filled:

1. **A biography paragraph** (`FOUNDER["bio"]`, English and Arabic): his degree and field, the awarding university, the
   years he worked with AI and where, and one or two achievements worth a line each. About shows the whole paragraph
   under his quote; Home shows its first sentence.
   - Answer: 
2. **Where he has worked** (`FOUNDER_PLACES`): employers or institutions, each with his role and the years. They appear
   as a row of named badges under the quote; send logo files (SVG or PNG, with permission) and the badge carries the logo.
   - Answer: 

## The Home video

The band under the hero shows a poster with "Video coming soon" until a link is set. Send a YouTube or Vimeo page link for
`VIDEO_URL` in `config.js`. Nothing loads until a visitor presses play. A two-minute cut works best: who you are, how a
session runs, what participants leave with.
