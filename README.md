# SciMind Education — Official Website

Official website source for **SciMind Education**, offering science tutoring for primary, secondary and VCE students.

**Production domain:** https://scimind.com.au/  
**Public contact:** info@scimind.com.au  
**Deployment:** GitHub → Cloudflare Pages  
**Website stack:** HTML, CSS and vanilla JavaScript (no framework or build process)

## Programmes and delivery

SciMind Education provides:

- VCE Biology (Units 1–4)
- VCE Chemistry (Units 1–2)
- VCE Psychology
- General Science / Science Foundation (Years 4–8)
- General Science / VCE preparation (Years 9–10)

Online tutoring is available across Australia. Face-to-face sessions take place in Mulgrave, Victoria; **the business is not restricted to Mulgrave-based students**.

Check the current website content before changing programme availability, unit coverage, pricing or session times.

## Repository layout

```text
scimind-education-website/
├── site/
│   ├── index.html
│   ├── programmes.html
│   ├── about.html
│   ├── contact.html
│   ├── privacy.html
│   ├── robots.txt
│   ├── sitemap.xml
│   └── assets/
│       └── ... existing production CSS, JS, WebP images, logos and media
├── README.md
└── .gitignore
```

The **`site/` folder is the publish directory**. Its `index.html` must remain directly under `site/`, not nested in another folder.

Keep the existing `assets/` filenames and directory structure unless all references have been updated and tested.

## Local development

1. Clone the repository or open the local repository folder in VS Code.
2. Open `site/index.html` with VS Code Live Server, or serve the directory using a local static HTTP server.
3. Confirm that navigation works for all pages and that CSS, JavaScript, images and videos load.
4. After changes, hard-refresh and test desktop and mobile layouts.

The site is static; no Python or Node.js runtime is required to run the public-facing pages.

> **Important:** The enquiry forms call a hosted Cloudflare service. Their configuration depends on the environment and must be verified separately. A localhost success does not prove production routing is ready.

## Cloudflare Pages deployment

Connect this GitHub repository using Cloudflare Pages **Git integration**.

| Setting | Value |
| --- | --- |
| Framework preset | None |
| Production branch | `main` |
| Repository/root directory | Repository root |
| Build command | `exit 0` (or blank if permitted by dashboard) |
| Build output directory | `site` |

A push to the production branch triggers an automated deployment once integration is enabled. Use preview branches or pull requests for changes you wish to review before merging into `main`.

**The first GitHub push is not the same as the public-domain launch.** Test the `*.pages.dev` deployment, API route and security settings before changing the custom domain.

## Enquiry forms and integrations

The website includes a contact enquiry form and quick enquiry form. The established backend is a **separate Cloudflare Worker** (`scimind-enquiries`) using Resend, Cloudflare Turnstile and a D1 database.

- Public site configuration belongs in the existing `site/assets/` frontend configuration files.
- Do not commit **Resend API keys, Cloudflare secrets, Turnstile secret keys, Google Workspace credentials, or `.dev.vars` / `.env` files**.
- The public Turnstile site key is not a secret; its corresponding secret key must remain server-side.
- Final production endpoint is intended to be `/api/enquiries` at the website origin; it must be explicitly connected to the existing Worker before launch.
- Keep the existing backend application, production email settings and D1 data unchanged unless a specific change is planned and tested.
- Remove unnecessary localhost origins or test permissions after production validation.

**SciMind Connect** is a separate Flask/Cloud Run application and is **not part of this repository**.

## Search visibility and SEO

The website includes per-page titles, descriptions, canonical URLs and other SEO metadata. Public search files are under `site/`:

- `robots.txt` — crawler directives and sitemap location
- `sitemap.xml` — indexable public pages

Brand positioning: **Victoria-focused science tutoring, online across Australia**, with face-to-face lessons in Mulgrave. Avoid suggesting that the service is limited to Mulgrave or that face-to-face teaching operates at locations throughout Victoria.

Before publishing, review:

- Accurate page titles, meta descriptions, headings and structured data
- Canonical URLs pointing to the preferred `https://scimind.com.au/` host
- Valid `robots.txt` and `sitemap.xml`
- Approved Privacy Policy and correct indexing directives
- Meaningful image alternative text and optimised media
- Correct internal links and forms, including on mobile

After domain launch:

1. Verify site ownership in Google Search Console and Bing Webmaster Tools.
2. Submit `https://scimind.com.au/sitemap.xml`.
3. Use URL inspection to check indexing status.
4. Test the production website with PageSpeed Insights and monitor performance.
5. Configure analytics only after reviewing its privacy and consent implications.

## Testimonials, achievements and privacy

The website may contain feedback excerpts from students or parents, including minors. Treat original private messages as confidential.

- Do **not** add original chat screenshots or identifying student/parent information to this repository.
- Only publish excerpts or achievements that have suitable publication permission and have been reviewed for accuracy.
- Maintain the distinction between a student's individual achievement and an outcome guaranteed or caused by tutoring.
- Testimonial approval flags and placeholder states in `assets/content/testimonials.json` must be checked **before every production release**.
- A testimonial can be previewed locally without being approved for public publication; do not accidentally commit local-only preview changes.

## DNS, domain and email

The domain is `scimind.com.au`; Cloudflare Pages will serve the production site after the domain has been correctly connected.

**Do not casually change MX, SPF, DKIM, DMARC or Resend DNS records.** These are important to SciMind's Google Workspace and transactional email delivery. Preserve and verify all current records before nameserver or DNS migration.

## Release checklist

- [ ] Confirm all five HTML pages load from the deployed site.
- [ ] Confirm the latest approved programme WebP images and hero/navigation refinements are present.
- [ ] Check mobile and desktop visual presentation.
- [ ] Verify both enquiry forms end-to-end from the hosted origin.
- [ ] Check anti-bot validation and server-side email delivery.
- [ ] Ensure no secrets, personal messages, private data or temporary files are tracked.
- [ ] Ensure testimonial and achievement content is approved for publication.
- [ ] Review the published Privacy Policy.
- [ ] Confirm expected `robots.txt`, `sitemap.xml` and canonical URLs.
- [ ] Confirm Cloudflare Pages preview is correct before custom-domain DNS changes.
- [ ] Preserve Google Workspace and Resend DNS/email functionality.
- [ ] Check HTTPS and `scimind.com.au` after domain connection.
- [ ] Submit the live sitemap to search engines.

## Maintenance workflow

1. Create a change on a feature branch where appropriate.
2. Preview/test locally and through Cloudflare Pages preview deployments.
3. Check responsive layouts, content, SEO and enquiry behaviour.
4. Merge approved changes to `main` for deployment.
5. Verify the live site after deployment.

Development-stage progress Markdown files, scratch Python utilities, backups and original private testimonial messages are intentionally kept in a **separate local archive**, not this production repository.

## Ownership

SciMind Education operates as a sole-trader tutoring business. Use approved wording from the website's legal and privacy materials for any formal legal-entity references; this README is not a substitute for the Privacy Policy.

© SciMind Education. All rights reserved.
