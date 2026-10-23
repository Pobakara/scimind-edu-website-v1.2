# SciMind Education — Architecture and Code Map

**Status:** Pre-launch reference. Cross-check names against the final local files before maintenance.

## Design and delivery boundaries

- Public site: five-page static HTML/CSS/vanilla JS application in `site/`.
- Styles, navigation, hero video, scientific interior decorations, responsive behaviour, local enquiry client and carousel are browser-side features.
- Backend enquiry handling is **not static**: it depends on a separate Cloudflare Worker, D1, Turnstile and Resend.
- SciMind Connect is **a completely separate system**. Never change its Google Cloud Run, PostgreSQL, SMTP or authentication to modify the public website.
- A `docs/` folder belongs at repository root, outside the published `site/` directory.

## Component orientation

| Feature | Likely entry points | Verify before editing |
| --- | --- | --- |
| Homepage sections | `site/index.html`, `site/assets/home.css`, `site/assets/home.js` | Final files may include later one-off patches |
| Global layout / navigation | `site/assets/styles.css`, `header.css` and shared site JS | Shared changes affect all pages |
| Page-specific hero artwork | `site/assets/interior-heroes.css` plus individual HTML | Keep decoration and meaning aligned |
| Programme descriptions and imagery | `site/programmes.html`, `site/assets/images/` | Transparent WebP assets, no opaque card padding |
| Programme hero subject links | `site/programmes.html` | Modern visible inline link affordance; no boxed CTA buttons |
| Contact and quick enquiry | `site/assets/enquiry-client.js`, `contact-enquiry.js`, `quick-enquiry.js`, `enquiry-config.js`, `enquiry-forms.css` | Both forms, validation, mobile overlay and focus return |
| Testimonials | `site/assets/content/testimonials.json` and homepage carousel JS | Privacy/approval flag, no duplicate apparent reviewers |
| SEO | Every page `<head>`, `robots.txt`, `sitemap.xml`, structured data | Correct titles/canonicals/description, location claims |
| Public privacy | `site/privacy.html` | Legal and operational accuracy and indexation status |

**Important:** Read the live file before modifying it. Historical ZIP versions can have outdated configuration, copy or missing patches. CSS selector order matters: focused overrides late in a stylesheet may supersede earlier rules.

## Major decisions to preserve

1. Homepage is a premium cinematic science experience, but hero text and controls remain accessible real HTML rather than baked into video.
2. Subject imagery can be transparent WebP to blend with backgrounds; do not accidentally restore opaque picture panels or crop illustrations.
3. Programmes include VCE Biology, Chemistry, Psychology, Science Foundation and VCE Science Preparation; confirm units with the owner before publishing changes.
4. Geographic language: Victoria-focused; online across Australia; in-person teaching occurs at Mulgrave, **not throughout Victoria**.
5. Use restrained science linework, teal/sea-green accents, fine separators and readable serif emphasis, not generic button-heavy templates.
6. Testimonial excerpts must be authentic and permissioned; student achievement remains the student's own and must not become a performance guarantee.
7. No secret values in frontend code, docs or Git history.

## Recommended change workflow

1. Identify the page, CSS, JS, content file and shared dependencies; inspect actual references.
2. Make smallest scoped change; record what was modified.
3. Test navigation, mobile width, reduced motion, forms and accessibility keyboard behavior as applicable.
4. Stage a feature branch / PR; use Pages preview only after access and permissions are appropriate.
5. Keep a changelog entry for infrastructure-affecting changes; merge only reviewed work into `main`.

See `SciMind-Design-Guide.md` for full visual specification and `Infrastructure-and-Operations.md` for services.
