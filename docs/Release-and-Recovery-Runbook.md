# SciMind Education — Release, Verification & Recovery Runbook

**Purpose:** Avoid regressions during routine website updates and provide a practical response when a deployment or enquiry fails.

## Routine website release

1. Start from an up-to-date `main` branch and create a feature branch.
2. Confirm only expected production website and documentation files changed: `git status`, `git diff --stat`, `git diff --check`.
3. Search staged changes for accidental `.env` values, tokens, API keys, original chat screenshots, private emails and personal data. Do not depend on `.gitignore` to remove files already committed.
4. Verify the design contract: header/footer across five pages, mobile navigation, programme imagery, anchor links, CTA routes, hero playback/reduced-motion behavior, image loading, testimonials and relevant form behavior.
5. Verify SEO: page titles/description, canonical URLs, `robots.txt`, `sitemap.xml`, JSON-LD content, `noindex`, broken relative links.
6. Test the preview deployment on Cloudflare Pages, including the **actual** enquiry route if any form/API files changed. Check errors, Turnstile, D1 receipt and notification email with controlled test data.
7. Merge approved changes into `main`; record the Git commit SHA and deployment date.
8. Verify critical pages and both forms at `https://scimind.com.au` after production deployment.

## Launch gate (one-time)

- [ ] Privacy page approved and accurate about D1, anti-spam, forms, email and retention.
- [ ] Public testimonials and achievement content permissioned and attributed accurately.
- [ ] GitHub/Pages preview has all design refinements, media and approved metadata.
- [ ] Pages Function and service binding work with the deployed Worker.
- [ ] Contact and Quick Enquiry forms work from actual production origin.
- [ ] Domain DNS inventory archived privately, then Cloudflare nameservers configured safely.
- [ ] External Workspace mail send/receive and Resend transactional email verified after cutover.
- [ ] HTTPS, canonical/redirect, `robots.txt`, sitemap and indexing verified.
- [ ] Google Search Console and Bing indexing tasks queued after domain is public.

## Incident playbooks

### Site unavailable or layout broken

1. Check Pages deployment status and specific asset requests.
2. Identify last working deployment SHA; roll back the Pages deployment or revert the offending Git commit as appropriate.
3. Re-test all pages, media and forms. Avoid changing DNS when the error is caused by a deployment.

### Forms not working

1. Test both form locations and inspect browser network response and CORS/errors.
2. Check `/api/enquiries` Pages Function route and service binding configuration.
3. Check Worker request validation, allowlisted origin, Turnstile accepted hostnames and token expiration, D1 binding and Resend sending/recipient status.
4. Compare deployments and isolate whether failure is frontend, Pages Function, Worker, D1, Turnstile, Resend or Workspace.
5. Use alternative published contact email/phone while affected, without claiming messages were received when they were not.

### Domain or email breaks after DNS cutover

1. Compare authoritative nameserver results and Cloudflare DNS zone against pre-cutover export.
2. Check specific MX, SPF, DKIM and DMARC entries, priorities and DNS-only settings.
3. Test external inbound/outbound mail and Resend separately. Website and email have distinct DNS requirements.
4. Make only targeted corrections, keep an incident/change log, and confirm recovery from an outside network.

### Privacy/security concern

Restrict access, preserve relevant audit evidence securely, assess exposure and appropriate reporting requirements, rotate compromised credentials, and only then restore normal operations. Avoid copying personal data into public issues or logs.

## Change log template

| Date | Commit / Pages deployment | Change | Verified by | Outcome / rollback note |
| --- | --- | --- | --- | --- |
| TBD | TBD | Initial deployment | TBD | Pending |

Do not record API keys, passwords or identifiable student messages in this file.
