# Photos for the website

The site has **39 photos**, shown in about 50 places. Each one has a file name. Upload a photo with that
exact name to `assets/photos/` and the site shows it everywhere that name is used. No code changes are needed.

## Upload 4K, the site does the rest

Upload the full-quality original: **3840 px wide** (4K) is ideal. JPG at quality 85–90, or PNG. Files up to about
20 MB are fine (GitHub's upload limit is 25 MB).

After each upload, a GitHub Action called **Photos** makes web versions of the photo at 640, 1280, 1920, 2560 and
3840 px wide, as compressed WebP files. Each visitor's browser then downloads only the size its screen needs: a
phone gets the 1280 px version (about 60–120 KB), a laptop 1920 px, and a 4K screen the full 3840 px. The photo
appears on the site **about 3 minutes** after upload. To watch it, open the repository's **Actions** tab; a green
tick on "Photos" means it's done.

## How to upload

1. On GitHub, open the repository and go to the `assets/photos` folder.
2. Click **Add file → Upload files**, drag the photos in, and click **Commit changes**.
3. Wait about three minutes, then refresh the site.

To replace a photo, upload a new file with the same name. To remove one, delete the file; its web versions are
removed automatically.

## Until a photo is uploaded

- **Edge-to-edge bands** and **programme images** show a dark panel with the al-Khwarizmi figure, so the
  layout is visible before the photos arrive. A band is shorter while empty and opens to full 21:9 once
  its photo exists.
- **All other photos** stay hidden, and the page reads as text only.

Add `?photos` to any address (for example `https://sheedosa.github.io/alkhawarizmi-ai-academy/?photos`) to see
every slot labelled with its number, file name, what to photograph and the size. `?photos=0` turns it off.

## Start with these eight

These carry the design; the rest can follow.

1. The five programme images: `prog-studio`, `prog-diploma`, `prog-week`, `prog-custom`, `prog-policy`. Each appears in
   the Home hero row, the programme catalogue and the programme's own page. Until it is uploaded, a drawing of the
   programme shows in its place.
2. `home-room` and `home-concept`: the two photos in "The academy" collage on Home (an arch and a circle). Keep the
   subject in the centre; the shapes crop the edges.
3. `cta-person.png`: one participant, from the waist up, **cut out on a transparent background** and saved as PNG. It
   stands in the closing panel on Home with the head above the panel's top edge, so leave a little space above the
   head and none below the crop. Until it is uploaded, the Studio drawing stands there instead.

## What works best

- **Bands** (21:9) run from screen edge to edge. Wide, calm compositions work: the whole room, a long table, the
  street. On phones they are cropped to 3:2 around the centre, so keep the subject in the middle third.
- **Programme images** (3:2) appear twice: on Home, and on the programme's own page or section. Keep the
  subject centred; the Studio and Diploma page heroes crop them to a portrait shape.
- Real people working in the academy's rooms, hands on keyboards, screens with real work, printed materials.
  Avoid stock photos. Get permission from anyone recognisable.
- Photos are cropped to fill their frame, so leave some space around the subject.

## The slots

| # | File | Page | Section | Type | What to photograph | ما يُصوَّر | Shape | Best size (px) |
|---|---|---|---|---|---|---|---|---|
| 01 | `home-hero.jpg` | Home | Hero background (not used in the current Home design) | Photo | Wide shot of a session at the academy: people at laptops, natural light | لقطة واسعة لجلسة في الأكاديمية: مشاركون أمام حواسيبهم في ضوء طبيعي | wide background | 3840 × 2240 |
| 02 | `home-room.jpg` | Home | Band before the Studio | Edge-to-edge band | The Studio room mid-session, seen from the back | قاعة الاستوديو أثناء الجلسة، من آخر القاعة | 21:9 (wide band) | 3840 × 1646 |
| 03 | `prog-studio.jpg` | Home + Studio | Programme image: the Studio (Home programmes, Studio hero) | Programme image | The Studio: participants building in the room, screens visible | الاستوديو: مشاركون يبنون في القاعة والشاشات ظاهرة | 3:2 | 3840 × 2560 |
| 04 | `prog-diploma.jpg` | Home + Diploma | Programme image: the Diploma (Home programmes, Diploma hero) | Programme image | The Diploma: a practitioner working with data and code | الدبلوم: ممارس يعمل على البيانات والشيفرة | 3:2 | 3840 × 2560 |
| 05 | `prog-week.jpg` | Home + Organisations | Programme image: the AI Strategy Week | Programme image | A leadership team around printed strategy documents | فريق قيادي حول وثائق استراتيجية مطبوعة | 3:2 | 3840 × 2560 |
| 06 | `prog-custom.jpg` | Home + Organisations | Programme image: Custom Training | Programme image | A team training on its own systems and data | فريق يتدرّب على أنظمته وبياناته | 3:2 | 3840 × 2560 |
| 07 | `prog-policy.jpg` | Home + Organisations | Programme image: the Policy Briefing | Programme image | Officials in the seminar room | مسؤولون في قاعة الندوات | 3:2 | 3840 × 2560 |
| 08 | `home-studio.jpg` | Home | The Studio | Photo | A participant showing the app they built on a phone | مشارك يعرض على هاتفه التطبيق الذي بناه | 4:3 | 3840 × 2880 |
| 09 | `home-band-build.jpg` | Home | Band after the Studio | Edge-to-edge band | Close-up: hands on a keyboard, a working app on screen | لقطة قريبة: أيدٍ على لوحة المفاتيح وتطبيق يعمل على الشاشة | 21:9 (wide band) | 3840 × 1646 |
| 10 | `home-week.jpg` | Home | The AI Strategy Week | Photo | A leadership team around a table with a printed roadmap | فريق قيادي حول طاولة وأمامه خريطة طريق مطبوعة | 16:10 | 3840 × 2400 |
| 11 | `home-concept.jpg` | Home | How we teach: Concept | Photo | The instructor explaining one idea at a screen | المدرّب يشرح فكرة واحدة أمام الشاشة | 4:3 | 3840 × 2880 |
| 12 | `home-lab.jpg` | Home | How we teach: Lab | Photo | Participants working on laptops, the instructor between tables | مشاركون يعملون على حواسيبهم والمدرّب بين الطاولات | 4:3 | 3840 × 2880 |
| 13 | `home-show.jpg` | Home | How we teach: Show & feedback | Photo | A participant presenting their work to the group | مشارك يعرض عمله على المجموعة | 4:3 | 3840 × 2880 |
| 14 | `home-band-show.jpg` | Home | Band before Insights | Edge-to-edge band | Presentation day: a participant showing a finished project to the room | يوم العرض: مشارك يعرض مشروعه المكتمل على القاعة | 21:9 (wide band) | 3840 × 1646 |
| 15 | `insight-build.jpg` | Home + Insights | Insight: We built this in twenty minutes | Photo | A still from the twenty-minute build | لقطة من جلسة البناء في عشرين دقيقة | 16:10 | 3840 × 2400 |
| 16 | `insight-arabic.jpg` | Home + Insights | Insight: Why most AI models fail at Arabic | Photo | Printed Arabic text, annotated by hand | نص عربي مطبوع عليه ملاحظات بخط اليد | 16:10 | 3840 × 2400 |
| 17 | `insight-voice.jpg` | Home + Insights | Insight: Can you spot the cloned voice? | Photo | A microphone on a plain table | ميكروفون على طاولة بسيطة | 16:10 | 3840 × 2400 |
| 18 | `studio-room.jpg` | Studio | Band after Who it is for | Edge-to-edge band | The Studio group at work, wide | دفعة الاستوديو أثناء العمل، لقطة واسعة | 21:9 (wide band) | 3840 × 1646 |
| 19 | `studio-kit.jpg` | Studio | What you leave with | Photo | A printed brand kit and the app on a phone | حزمة هوية مطبوعة والتطبيق على هاتف | 4:5 (portrait) | 3072 × 3840 |
| 20 | `studio-band-day.jpg` | Studio | Band before the editions | Edge-to-edge band | A Studio day: the room from behind, everyone building | يوم في الاستوديو: القاعة من الخلف، والجميع يبني | 21:9 (wide band) | 3840 × 1646 |
| 21 | `studio-open.jpg` | Studio | Edition: Studio Open | Photo | Participants from different backgrounds at the academy | مشاركون من خلفيات مختلفة في الأكاديمية | 16:10 | 3840 × 2400 |
| 22 | `studio-founders.jpg` | Studio | Edition: Studio Founders | Photo | A founder presenting a product and its launch | رائد أعمال يعرض منتجه وإطلاقه | 16:10 | 3840 × 2400 |
| 23 | `studio-team.jpg` | Studio | Edition: Studio Team | Photo | A marketing team working together | فريق تسويق يعمل معاً | 16:10 | 3840 × 2400 |
| 24 | `diploma-why.jpg` | Diploma | Why we built it | Photo | A participant at a screen, notebook beside | مشارك أمام شاشة وبجانبه دفتر | 3:4 (portrait) | 2880 × 3840 |
| 25 | `diploma-band-lab.jpg` | Diploma | Band after Why we built it | Edge-to-edge band | A Diploma lab: participants at screens, the instructor at a whiteboard | مختبر الدبلوم: مشاركون أمام الشاشات والمدرّب عند السبورة | 21:9 (wide band) | 3840 × 1646 |
| 26 | `diploma-portfolio.jpg` | Diploma | What you leave with | Photo | A portfolio review with a mentor | مراجعة ملف أعمال مع مرشد | 4:3 | 3840 × 2880 |
| 27 | `diploma-band-cohort.jpg` | Diploma | Band before the form | Edge-to-edge band | The Diploma group together, wide | دفعة الدبلوم معاً، لقطة واسعة | 21:9 (wide band) | 3840 × 1646 |
| 28 | `org-hero.jpg` | Organisations | Hero | Photo | A leadership team in a workshop | فريق قيادي في ورشة عمل | 3:4 (portrait) | 2880 × 3840 |
| 29 | `org-band-boardroom.jpg` | Organisations | Band after the programme index | Edge-to-edge band | A leadership workshop in progress, wide | ورشة قيادية قائمة، لقطة واسعة | 21:9 (wide band) | 3840 × 1646 |
| 30 | `org-band-workshop.jpg` | Organisations | Band before Custom Training | Edge-to-edge band | A team at work on its own data: screens and notes | فريق يعمل على بياناته: شاشات وملاحظات | 21:9 (wide band) | 3840 × 1646 |
| 31 | `about-hero.jpg` | About | Hero | Photo | The seminar room in morning light | قاعة الندوات في ضوء الصباح | 4:5 (portrait) | 3072 × 3840 |
| 32 | `about-khwarizmi.jpg` | About | The name | Photo | A portrait or manuscript page of al-Khwarizmi | صورة أو صفحة مخطوطة للخوارزمي | 3:4 (portrait) | 2880 × 3840 |
| 33 | `about-lab.jpg` | About | Band after How we teach | Edge-to-edge band | A lab session in progress, wide | جلسة مختبر قائمة، لقطة واسعة | 21:9 (wide band) | 3840 × 1646 |
| 34 | `about-building.jpg` | About + Contact | The academy building | Photo | The academy on Zawiat Dahmani Street | مبنى الأكاديمية في شارع زاوية الدهماني | 16:10 | 3840 × 2400 |
| 35 | `about-band-tripoli.jpg` | About | Band before the two routes | Edge-to-edge band | Tripoli: the city or the street outside the academy | طرابلس: المدينة أو الشارع أمام الأكاديمية | 21:9 (wide band) | 3840 × 1646 |
| 36 | `insight-agents.jpg` | Insights | Insight: Agents versus chatbots | Photo | A screen showing an AI agent completing a task | شاشة تعرض وكيل ذكاء اصطناعي يُنجز مهمة | 16:10 | 3840 × 2400 |
| 37 | `insights-band.jpg` | Insights | Band after the lead piece | Edge-to-edge band | A screen close-up: AI output being reviewed | لقطة قريبة لشاشة: مراجعة مخرجات ذكاء اصطناعي | 21:9 (wide band) | 3840 × 1646 |
| 38 | `contact-band.jpg` | Contact | Band below the form | Edge-to-edge band | The academy entrance or reception | مدخل الأكاديمية أو الاستقبال | 21:9 (wide band) | 3840 × 1646 |
| 39 | `cta-person.png` | Home | Closing panel (cut-out) | Photo | One participant from the waist up, holding a laptop or tablet, cut out on a transparent background (PNG) | مشارك من الخصر إلى الأعلى يحمل حاسوباً أو جهازاً لوحياً، مقصوص على خلفية شفافة (PNG) | 4:5 (portrait), transparent | 3072 × 3840 |

Photos marked "Home + …" or "… + Contact" appear in two places; one upload fills both.
