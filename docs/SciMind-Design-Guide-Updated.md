# SciMind Education — Design System, Website Architecture & Maintenance Guide

**Revision:** 23 October 2026  
**Document type:** Living design and implementation reference  
**Scope:** SciMind Education's five-page public website, shared design system, enquiry experience, SEO and launch workflow  
**Status:** Pre-launch. Final local website is maintained separately; verify its actual files before making any change.

> **Document authority:** This guide explains approved design decisions and recent implementation work. It is **not** a substitute for the actual HTML/CSS/JS in the latest local production folder. Details identified as *planned*, *locally tested* or *pending* must not be represented as live production features. It does not certify accessibility, legal compliance, live indexing or advertising claims.

---

## 1. Design vision and visitor journey

### Brand idea — science, understood

SciMind is designed to feel like a **premium, approachable science education brand**, rather than a generic tuition listing. The website starts with scientific curiosity, establishes subject relevance, introduces the teacher and teaching philosophy, offers authentic reassurance and ends with a clear enquiry pathway.

**Voice:** clear, thoughtful, human, academically credible and encouraging. Avoid exaggerated results, artificial urgency, promises of marks or claims unsupported by evidence.

The core emotional progression is **curiosity → understanding → confidence**. This phrase is also used as the concise brand tagline: **CURIOSITY · UNDERSTANDING · CONFIDENCE**.

### Geographic positioning — important approved decision

- **Primary audience:** students and families throughout **Victoria**.
- **Online lessons:** accessible across **Australia**.
- **Face-to-face delivery:** at the teaching location in **Mulgrave, Victoria**; students travel from other areas. Mulgrave is **not** the principal geographic identity or SEO focus.
- Preferred explanatory sentence: **“Online science tutoring across Australia, with face-to-face classes in Mulgrave, Victoria.”**
- Never imply there are multiple face-to-face locations throughout Victoria or that programmes cover units not offered.

### Site narrative

1. **Cinematic science hero:** create intrigue without compromising legibility.
2. **Welcome / introduction:** concise summary of what SciMind offers.
3. **Science-to-VCE progression:** an editorial bridge from foundational science through VCE confidence and achievement.
4. **Programme discovery:** easy access to real subject offerings.
5. **Teaching approach:** explain the structured, supportive method.
6. **Meet Nisa / partnership:** human credibility and collaboration with Vinsara.
7. **Testimonials:** genuine source-derived feedback only, presented carefully.
8. **Enquiry call to action:** quick, accessible contact routes.

The planned parent and student portals remain explicitly **coming soon**, separate from the current public site. They are not live services.

### Visual signature

- Alternating navy cinematic sections and warm/light reading sections.
- Clear editorial headings, modest serif italic highlights, generous but purposeful whitespace.
- Science-inspired decorative linework, transparent scientific subject imagery and gentle transitions.
- Restrained fine lines and dividers instead of heavy boxed UI.
- A high-end appearance with **no invented awards, star ratings, testimonials or outcome guarantees**.

---

## 2. Identity, colour and logo principles

Use the supplied SciMind artwork and actual approved logo variants. Do not stretch, redraw, recolour or recreate Vinsara's mark. The horizontal SciMind identity is preferred in the shared header; the light variant belongs on dark footers. Keep logo image filenames referenced by the live HTML unless changes are coordinated across all pages.

**Reference asset locations** (verify against the final local folder):

- `site/assets/logo/scimind-header.svg` — shared header identity.
- `site/assets/logo/white-and-color.svg` — light footer mark.
- `site/assets/logo/icon.svg` — favicon source.
- `site/assets/logo/vinsara.png` — approved partner artwork.
- Additional image assets may exist for vertical variants; do not delete referenced files.

### Core palette

| Token / role | Colour | Usage |
| --- | --- | --- |
| `--navy` | `#003A7D` | Brand navy, major sections and dark buttons |
| `--night` | `#041E36` | Cinematic hero, header, footer and dark CTA |
| `--teal` | `#0B81A2` | Science details, Chemistry accents and links |
| `--green` | `#59A89C` | Sea-green identity, Psychology accents |
| `--mint` | `#B9E6D7` | Primary action on dark backgrounds |
| `--ink` | `#102E47` | Main type on light sections |
| `--paper` | `#F6F7F2` | Warm off-white surface |
| `--muted` | `#516775` | Supporting copy |
| `--line` | `#D7E0DD` | Fine separators |

Additional reference colours: deep editorial green `#367E75`, light editorial mint `#A9DFD0`, supporting text on navy `#BECDD9`, Vinsara collaboration surface `#EDF0E7`, supporting gold `#B49B5A`, focus highlight `#D79E30`, input focus `#BD913B`, validation error `#8B2727`.

**Accessibility rule:** colour role does not itself guarantee contrast; check specific foreground/background/size combinations. Teal or mint should not be used for small text on similarly light backgrounds without verification.

---

## 3. Typography, grid and responsive behaviour

### Typography

- **Main interface and body:** `Arial, Helvetica, sans-serif`.
- **Editorial italics and testimonial quotation:** `Georgia, serif`.
- **Small programme numbers / scientific markers:** optional monospace accents.
- Keep headings readable, with italic emphasis on only a short phrase. No remote webfont or bundled licensed font is necessary for the established design.

**Original design baselines** (later page-specific CSS may override):

| Element | Reference styling |
| --- | --- |
| H1 | `clamp(48px, 5.9vw, 88px)`, weight 500, line-height ~1.04 |
| H2 | `clamp(35px, 4.3vw, 62px)`, weight 500, line-height ~1.12 |
| H3 | ~26px, weight 500 |
| Body intro | ~16px with generous line-height |
| Supporting text | ~13–15px |
| Navigation and buttons | ~13px |
| Eyebrow | ~11px, uppercase with tracked letters |

The compact testimonial design introduced later intentionally uses smaller quotation type and reduced vertical padding. Inspect `home.css` for its final effective rules rather than assuming the original large 25–38px quote scale still applies.

### Layout

Shared wrapper baseline:

```css
.wrap {
  width: min(1240px, 88%);
  margin: auto;
}
```

Original section vertical-padding reference: approximately 105px desktop, 80px tablet, 65px mobile. The current home hero, VCE progression feature, testimonials and internal page heroes may use their own overrides.

Reference responsive thresholds in the original design: **1050px**, **760px**, and **380px**. Navigation collapses on mobile; major two-column arrangements stack. Maintain meaningful whitespace and avoid fixed heights that clip translated copy or small-device layouts.

### Accessibility and motion

Keep a skip link, correct H1/H2/H3 order, visible keyboard focus, labelled form controls, meaningful image alternatives, logical tap targets and usable mobile navigation. Respect `prefers-reduced-motion` for video, scroll reveals and carousel autoplay. Motion is enhancement, not a prerequisite for reading or navigating.

---

## 4. Homepage visual composition

### Cinematic / Living Science hero

This is **not a rectangular video card**. The composition combines a dark-night stage, a poster/video or latest hybrid scientific media layer, controlled overlays, and independent real HTML headline/CTA content. The left copy remains readable while more detailed imagery appears toward the centre/right.

Original hero media pattern:

1. Navy fallback stage.
2. Immediate static poster.
3. Muted, inline, looping video where supported.
4. Overlay/edge masks to blend media into the site.
5. Readable HTML content with independent controls.
6. Pause or still-image fallback for reduced-motion users.

Reference paths: `site/assets/video/hero.mp4`, `hero-poster.jpg`; supplemental `living-science.css`, `living-science.js` and associated image assets may provide additional science animation. **Preserve the exact currently approved implementation.** Do not reintroduce old alternative hero prototypes over the final hybrid version.

The original horizontal navy mask was roughly 99% at 0%, 96% at 36%, 92% at 48%, 40% at 64%, and 8% at 100%. Treat these as the **design rationale**, not guaranteed final computed CSS after later refinements.

Avoid embedding the heading or CTA words inside video/image assets. A static fallback must remain usable.

### Welcome and progression section

The Welcome section was deliberately shortened so visitors quickly see the programmes. The later **Science Foundations to VCE Excellence** section uses an editorial three-stage progression:

- **Explore:** general science foundations.
- **Understand:** deeper VCE subject knowledge and structured learning.
- **Achieve:** SAC readiness, study-score aspiration and future pathways.

The preferred outcome language is **“Aim for 40+ study scores and a higher ATAR”**, not “40+ ATAR.” A VCE study score and ATAR are different measures. Never describe aspirational copy as guaranteed achievement or advertise an unverified individual outcome.

### Teaching, teacher and partnership

- Describe Nisa's teaching approach factually: clear explanation, guided practice, confidence building and personal feedback.
- **Use Nisa's actual approved portrait** where the current implementation references it; older monogram/portrait-placeholder guidance is obsolete.
- Retain the Vinsara partnership as a supporting section, with its existing green/gold identity and accurate, owner-approved collaboration copy.
- Preserve the current header, footer, tagline, phone numbers, contact routes and enquiry callouts across pages.

---

## 5. Programmes and scientific image system

### Current programme offering

| Programme | Positioning | Notes |
| --- | --- | --- |
| VCE Biology | Units 1–2 and 3–4 | Year 11–12 |
| VCE Chemistry | Units 1–2 | Do not imply Units 3–4 without confirmation |
| VCE Psychology | VCE Psychology | Check exact active unit offerings against final programme copy |
| General Science / Science Foundation | Primary and lower secondary years | Current broader product description has included Years 4–8 |
| General Science / VCE preparation | Years 9–10 | Prep for advanced secondary/VCE science |

The programme content must match **the final live HTML**, not an older marketing draft. Avoid adding unsupported subject units, session times, results or pricing.

### Image treatments — October refinements

The detailed Programmes page uses **transparent-background WebP illustrations** instead of opaque cards with their own coloured backplates. The surrounding image-holder padding/frame was removed and image fitting adjusted so the artwork blends into the section surface. Keep transparency and check images on both light and coloured responsive surfaces. Converting an opaque image to `.webp` does **not** create transparency; the source asset must have an alpha channel.

The current set includes individual visual treatments for Biology, Chemistry, Psychology, foundation science and VCE-preparation science. Original asset paths included:

- `assets/images/vce-biology.webp`
- `assets/images/vce-chemistry.webp`
- `assets/images/vce-psychology.webp`
- `assets/images/general-science.webp`
- `assets/images/vce-preparation.webp`

**Retain these filenames unless you also update every reference.** Image dimension/orientation varies with component; preserve cropping and responsive composition rather than forcing a common aspect ratio.

### Programmes hero subject navigation

The hero provides subject anchors that scroll to the related programme sections. The latest refinement deliberately avoids bordered pills/buttons: **visible fine underline, subtle teal directional-arrow cue, animated hover treatment and keyboard focus indication** communicate clickability even at rest. Keep anchor targets functional and keyboard reachable.

---

## 6. Internal pages and header/footer conventions

| Page | Design intent |
| --- | --- |
| `index.html` | Cinematic hero, welcome, science-to-VCE progression, programme overview, teaching, teacher, partnership, testimonials, enquiry |
| `programmes.html` | Direct subject anchors, detailed subject sections and transparent scientific visuals |
| `about.html` | Brand purpose, teaching philosophy, real teacher portrait, collaboration and future portals |
| `contact.html` | Contact options, teaching location and main enquiry form |
| `privacy.html` | Privacy practices; must reflect actual data handling and be approved before launch |

All pages use a **consistent shared header**, preferred horizontal logo treatment, one-line brand tagline, navigation, mobile behaviour, footer and persistent enquiry access.

Later internal-hero visual enhancements use `assets/interior-heroes.css` and restrained SVG linework: molecular motifs for Programmes, connected network for About, orbital motif for Contact and privacy/security motif for Privacy. Those decorations are not primary content and must remain accessible and performant.

The Contact page lists both numbers as provided in current site copy: **0490 090 701** and **0494 147 205**. Keep `tel:` links accurate. The public email is **info@scimind.com.au**.

---

## 7. Testimonial system — authenticity and approval

### Design

The homepage uses a **compact editorial carousel** with restrained quote typography and transitions. Testimonial treatment is intentionally smaller than the main programme and teacher storytelling sections. The latest refinement integrates the **Junior Science Olympiad achievement into its own carousel card** rather than using a large standalone achievement panel; that card has a distinct student-achievement eyebrow/title.

### Content model

Source: genuine feedback messages received by Nisa from students/parents. Recent working material selected **five distinct source voices**, with the Olympiad preparation/achievement incorporated into one associated parent's card rather than double-counting it as a separate independent review.

Reference content path: `site/assets/content/testimonials.json`. Fields in the staged data include `id`, `quote`, `attribution`, `context`, `image`, `approved`, and `placeholder`. The current script's rendering and rotation behaviour must be verified against the final `assets/home.js`; do not infer it from the JSON alone.

### Safeguards

- Anonymous excerpts must remain attributable to **real messages**; don't fabricate, overstate or splice wording so the meaning changes.
- Private messages from students, particularly minors, **should not be published as endorsements without appropriate permission**. Anonymity reduces privacy risk but does not itself grant publication permission.
- **`approved: false`** is the safe pre-publication state. `approved: true` is acceptable for temporary private/local layout testing only; restore to false before pushing unless consent is confirmed.
- Do not commit original screenshots, names, phone numbers, school IDs, chat headers or certificate scans to GitHub.
- Claims such as the **2026 Junior Science Olympiad Credit Award** must retain precise attribution to an individual student, with appropriate permission, and must not become a promise of future results.
- Don't add fake stars, invented review counts or decorative “verified” badges.

---

## 8. Forms, enquiries and integration boundaries

### Front-end behaviour

Two enquiry entry points exist:

1. **Contact page enquiry form**.
2. **Quick Enquiry popup**, reachable from major CTAs and floating enquiry access.

Data fields vary by form but include a parent/guardian contact, student year, intended programme, format preferences and optionally a message. Preserve validation, visible loading/error/success states, privacy acknowledgement and accessible feedback. Do not collect unnecessary student personal information.

Relevant front-end files (verify against final folder):

```text
site/assets/enquiry-config.js
site/assets/enquiry-client.js
site/assets/contact-enquiry.js
site/assets/quick-enquiry.js
site/assets/enquiry-forms.css
site/assets/quick-enquiry.css
```

### Backend — important updated status

**Locally tested:** both enquiry forms successfully submitted from localhost through Cloudflare Turnstile and the existing deployed Cloudflare Worker, with receipt delivered via Resend to `info@scimind.com.au`. This supersedes the original 15 October guide's statement that delivery was disabled.

**Still pending:** production hosting, custom-domain routing and end-to-end revalidation. Some working front-end versions still point directly to a **temporary `workers.dev` endpoint**; that is not the intended final same-origin production configuration.

Existing backend boundary:

- Cloudflare Worker: **`scimind-enquiries`**.
- Public eventual website endpoint: **`/api/enquiries`** (requires actual routing/function integration; Pages does **not** forward automatically).
- D1 database and Resend integration remain behind the Worker.
- Cloudflare Turnstile protects form submission; public Site Key may be in the client, **secret key must never be committed**.
- Notifications go to the business inbox; replies should route to the parent's email where implemented.

**Production plan:** use an appropriately configured Cloudflare Pages Function or equivalent route/service binding to the existing Worker, test hosted preview origin allowlisting and Turnstile, and then validate same-origin production traffic. Do not alter SciMind Connect or recreate the Worker from scratch during the website launch.

No Resend API keys, Turnstile secret, Cloudflare keys, Google Workspace passwords, private student messages or `.env` files belong in Git.

---

## 9. SEO, discoverability and content integrity

### Approved page-title positioning (October 2026)

| Page | Preferred SEO title |
| --- | --- |
| Home | `VCE & General Science Tutoring Victoria \| SciMind Education` |
| Programmes | `VCE Biology, Chemistry & Psychology \| SciMind Education` |
| About | `About SciMind Education \| Our Teaching Approach` |
| Contact | `Contact SciMind Education \| Science & VCE Tutoring` |
| Privacy | `Privacy Policy \| SciMind Education` |

**Content focus:** Victoria as principal audience; Australia-wide online availability; Mulgrave reserved for actual in-person location details. Do not position SciMind as principally serving only Mulgrave.

Implemented/planned launch SEO checks:

- Unique useful title and meta description per page.
- Canonical URLs pointing to the correct `https://scimind.com.au/` paths.
- Consistent Open Graph title/description, useful sharing previews where appropriate.
- Accurate structured data for organisation/services; do not invent reviews or credentials.
- `site/robots.txt` (**plural `robots`**) and `site/sitemap.xml` present and valid, correct domain and public URLs.
- Public pages indexable; privacy indexing status requires the final publication decision.
- Clear actual H1/H2 structure, useful image alternatives and internal linking.
- Performance checks for hero media, WebP imagery, mobile layout and Core Web Vitals.

**After launch:** verify ownership in Google Search Console, submit the sitemap, inspect indexed pages, and set up Google Business Profile and Bing Webmaster Tools. Google Analytics or ad-conversion tracking should be implemented only with appropriate privacy/consent consideration and actual measurement needs.

SEO titles/descriptions are *targets*; search engines may generate different snippets. Do not promise rankings.

---

## 10. Project layout and repository rules

### Source of truth

The modern public site is maintained as **static HTML/CSS/vanilla JavaScript directly**, not regenerated from the obsolete Python `build.py` workflow. Old scripts, experiments and progress logs belong in a **local archive outside the production Git repository**.

```text
scimind-education-website/
├── README.md
├── .gitignore
└── site/                          # Cloudflare Pages output directory
    ├── index.html
    ├── programmes.html
    ├── about.html
    ├── contact.html
    ├── privacy.html
    ├── robots.txt
    ├── sitemap.xml
    └── assets/
        ├── styles.css
        ├── header.css
        ├── home.css
        ├── home.js
        ├── site.js
        ├── interior-heroes.css
        ├── enquiry-*.js / .css   # Existing exact filenames
        ├── quick-enquiry.*
        ├── living-science.*
        ├── content/testimonials.json
        ├── images/
        ├── logo/
        └── video/
```

The above is a **conceptual map**, not a license to rename working files or a claim that every wildcard is a literal file. Preserve the filenames that the actual HTML imports.

**Repository:** `scimind-education-website` (separate from SciMind Connect). Preferred initial visibility: private. Future maintenance through Git commits and Cloudflare preview deployments.

**Deployment target:** Cloudflare Pages with GitHub integration; `main` production branch, repo root as root directory, output directory **`site`**, static site/no framework. A build step is not necessary for vanilla HTML, subject to Cloudflare's UI requirements.

**Planned extension:** `functions/api/enquiries.js` at **repository root** (sibling to `site/`) if using Pages Functions to route the existing Worker. Add only when implemented and tested. The repository may initially omit `functions/`.

**Git hygiene:** exclude credentials, `.env`, `.dev.vars`, local notes, test archives, student screenshots and unneeded Python build scripts. Don't include a second nested `site/site/` directory or copy `.git` into `site/`.

---

## 11. Release and launch safeguards

### Before committing the final website

1. Back up the current working local folder.
2. Confirm the latest approved pages are present, including the **transparent Programmes images**, **visible subject hero links**, **compact testimonial layout** and **Olympiad card label**.
3. Confirm no earlier patch accidentally replaced a newer `home.js`, `home.css` or `programmes.html`.
4. Inspect `testimonials.json`: publish only permissioned excerpts; use safe approval settings in the launch commit.
5. Confirm privacy content is approved and matches actual enquiry/storage/analytics practices.
6. Search the repository for secrets, contact screenshots, `.env` files, temporary test notes and unnecessary scripts.
7. Verify titles, descriptions, canonical links, robots, sitemap, all internal anchors and mobile layout.
8. Maintain the tested enquiry files but recognise production routing still requires setup.

### Cloudflare Pages and domain release

1. Push to GitHub and connect the repository to a Pages project.
2. Test on `*.pages.dev` without changing production DNS.
3. Configure and test `/api/enquiries` with the existing Worker, hosted-page origin and Turnstile.
4. Preserve Google Workspace and Resend DNS records (MX, SPF, DKIM, DMARC, any verification records) when moving DNS authority from GoDaddy to Cloudflare for the apex domain.
5. Connect `scimind.com.au`, enable HTTPS and check any `www` handling.
6. Repeat hosted tests: actual Contact and Quick Enquiry form delivery, navigation, smartphone layout, 404s, images, hero and accessibility essentials.
7. Remove temporary localhost testing allowances as appropriate.
8. Verify Google Search Console and sitemap after the public site is live.

**Never:** change DNS, email records, Worker secrets, production database, Cloud Run or SciMind Connect merely because a front-end design change was requested.

---

## 12. Future development rules and reusable handoff

### Safe change process

- **Small requested change → small patch.** Prefer only affected files with preserved relative paths; avoid distributing the full ~27 MB website for one styling adjustment.
- Respect the most recently approved local version: changes can be layered across `index.html`, `programmes.html`, `home.css`, `home.js` and shared CSS. Older packages may be stale.
- Read existing CSS selectors and JavaScript interactions before overriding; many styles are layered in later rules.
- Keep subject anchors, header, footer, responsive behaviour, CTA routes and enquiry handlers intact.
- Verify loaded CSS/JS/image paths, page title/meta, reduced-motion behaviour and small-screen presentation.
- State what was actually tested (static inspection, syntax check, localhost browser test, hosted test) separately.
- Update this guide **when an approved design or architectural decision materially changes**; do not rewrite all design decisions for each tiny adjustment.

### Future enhancements (not part of this release)

- Individually optimised VCE subject landing pages, only with accurate real programme content.
- Approved parent/student portal integration via SciMind Connect without exposing private systems.
- Performance and Core Web Vitals optimisation with real hosted measurement.
- Search Console, Google Business Profile, Bing and analytics/conversion tracking once privacy-ready.
- Continued testimonial collection with permission, accurate attribution and safeguarding.

### Reusable brief for a future developer or AI assistant

> Continue the current SciMind Education website, preserving the approved navy/teal/sea-green palette, Georgia editorial italics, airy structured layout, hybrid cinematic science hero, transparent scientific WebP illustrations, clear internal subject links, compact genuine-testimonial carousel, and consistent header/footer/enquiry experience. Position the business for Victoria-wide interest and Australia-wide online lessons; Mulgrave is the physical class location, not the primary search-market identity. Maintain the five-page static HTML/CSS/JS architecture and working asset paths. Make only the requested change and return only modified files when possible. Protect private student communications, secrets and email DNS. Distinguish localhost-tested enquiry delivery from untested Pages/custom-domain routing. Never advertise unsupported results, publish unapproved private feedback or modify SciMind Connect without explicit instruction.

---

## 13. Revision history and verification notes

| Date | Milestone |
| --- | --- |
| 15 Oct 2026 | Original design story and cinematic website reference drafted; forms then described as disabled; original build-script workflow documented |
| 16–19 Oct 2026 | Image assets, teacher portrait, site SEO foundations, shared navigation/footer and staged enquiry integration advanced |
| 23 Oct 2026 | Victoria-wide SEO positioning, transparent programme illustrations, programme-hero navigation cues, compact testimonials and Olympiad card considered in updated launch design |

### Important limits of this revision

This edition reconciles the **uploaded original guide**, **recent project decisions**, **available website ZIPs** and **recent patch files**. It does **not** prove that the user's final local folder contains every patch, nor that the latest testimonial content is permissioned or that Cloudflare Pages is deployed. The final directory and live implementation must be inspected during launch audit.

**Maintainer principle:** *Design intentionality, content accuracy and operational safety come before unnecessary visual complexity.*
