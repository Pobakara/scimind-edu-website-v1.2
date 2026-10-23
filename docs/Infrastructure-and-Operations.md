# SciMind Education — Infrastructure, DNS & Enquiry Operations

**Updated:** 23 October 2026  
**Status:** Pre-launch configuration reference; not a declaration that production is live.  
**Owner action required:** Record actual DNS values, dashboard IDs, Pages hostname, deployed Worker version, dates and outcomes after each infrastructure change. Never put secrets in Git.

## 1. System ownership and separation

| Component | Known role | Current / intended state |
| --- | --- | --- |
| Domain: `scimind.com.au` | Public brand domain | Registered through GoDaddy; production website not yet cut over |
| DNS | Resolves website, Workspace, Resend | DNS migration to Cloudflare must be planned and verified; current records need a live inventory |
| GitHub repository | Public-site source/version history | Planned: `scimind-education-website`, private, `main` branch |
| Cloudflare Pages | Hosts static website | Git-connected deployment planned; build output `site` |
| Cloudflare Worker `scimind-enquiries` | Server-side enquiry validation, Turnstile, D1, email | Existing Worker tested successfully with local site; production integration pending |
| Cloudflare D1 `scimind-enquiries-db` | Enquiry persistence / audit backend | Existing database; binding and migration state must be checked in Cloudflare |
| Cloudflare Turnstile | Anti-bot protection | Local form tests successful; allow-list production/preview hostnames deliberately |
| Resend | Sends transactional enquiry notifications | Sending domain `send.scimind.com.au` reported verified; check current domain dashboard before DNS change |
| Google Workspace | Mailbox and business aliases | Mail currently working; primary public inbox `info@scimind.com.au` |
| SciMind Connect | Separate administration portal | Flask, Google Cloud Run/Cloud SQL; **never modify as part of website hosting** |

**Email path:** browser → frontend enquiry JS → (currently test Worker endpoint; intended production `/api/enquiries`) → Pages Function / service binding → Worker → Turnstile verification → D1 / email operations → Resend → `info@scimind.com.au` with parent email as Reply-To. Exact ordering and error states must be checked against the current Worker source. No parent auto-reply is currently required.

## 2. Public configuration vs secrets

**Can be kept in Git:** public domain, public contact address, Turnstile *site* key, relative API endpoint, static HTML/assets, page metadata, safe Worker binding names and documentation.

**Must never be committed:** `RESEND_API_KEY`, `TURNSTILE_SECRET`, Google Workspace app passwords, Cloudflare API tokens, any private D1 content, original testimonial messages, backup exports containing personal information, `.env`/`.dev.vars`, recovery codes. Do not place secrets in screenshots, repository issues, or commit messages.

| Setting | Expected / known value | Where to verify |
| --- | --- | --- |
| Page project | `scimind-education` (proposed) | Cloudflare Pages dashboard after creation |
| Pages project build | GitHub, `main`, output `site`, no framework | Pages > Settings > Builds and deployments |
| Production host | `https://scimind.com.au` | Pages custom domain + DNS + HTTPS |
| Optional secondary host | `https://www.scimind.com.au` | Decide redirect policy before launch |
| Public frontend endpoint | `/api/enquiries` (intended) | `site/assets/enquiry-config.js` in final repository |
| Existing Worker | `scimind-enquiries` | Workers & Pages > Worker |
| D1 database | `scimind-enquiries-db` | D1 dashboard and Worker binding (commonly `DB`; verify actual) |
| Worker server secrets | `RESEND_API_KEY`, `TURNSTILE_SECRET` (expected names) | Worker Settings > Variables and Secrets; names only |
| Notification recipient | `info@scimind.com.au` | Current deployed Worker |
| Verified Resend sender | `enquiries@send.scimind.com.au` | Resend domain & Worker |
| Public Turnstile key | Existing site key, value intentionally omitted | Turnstile dashboard and final JS |
| Allowed origins | Production apex / www; localhost during local tests | Actual deployed Worker source/config |
| Future Pages service binding | Name TBD, target `scimind-enquiries` | Pages > Settings > Bindings |

**Beware of historical archives:** older site ZIPs contain `enabled: false` and empty Turnstile keys, while a later locally tested site used a `workers.dev` testing endpoint. Always inspect the **final local repository** rather than copying a historical archive's settings.

## 3. GitHub → Cloudflare Pages deployment

1. Push the static site with `site/index.html` and other HTML/pages under `site/`. Keep `README.md`, `docs/` and `.gitignore` at the repository root.
2. Create a Pages project using **Git integration**, not Direct Upload. Select `main` as production branch, framework None, output folder `site`; use `exit 0` for build command if a command is required.
3. Test the assigned `*.pages.dev` hostname; verify page paths, image/video size and responsiveness. Treat preview URLs as potentially accessible unless protected.
4. **Build the enquiry integration deliberately**: a `functions/api/enquiries.js` file at repository root (not `site/functions`) can delegate to the existing Worker using a Pages **Service binding**. Choose a binding name, configure it for both preview and production as needed, redeploy and test. Do not assume a static Pages deployment automatically creates `/api/enquiries`.
5. Set the frontend endpoint to `/api/enquiries` and supply only the Turnstile *public* site key in browser JS. Check actual request schema against Worker: `schemaVersion`, year/programme values, request ID and Turnstile token.
6. Test both Contact and Quick Enquiry forms on preview (including error cases) without spamming parents or leaving personal information in test requests. If origin verification or Turnstile hostname checks reject `pages.dev`, configure limited, deliberate preview support rather than broad wildcard access.
7. Connect production custom domain **only after** full DNS record inventory and email continuity checks.

Cloudflare references: [Pages Functions](https://developers.cloudflare.com/pages/functions/get-started/), [Pages service bindings](https://developers.cloudflare.com/pages/functions/bindings/), [Pages configuration](https://developers.cloudflare.com/pages/functions/wrangler-configuration/).

**Configuration authority:** Pages bindings can live in dashboard or Wrangler config. If you adopt a Wrangler config in Git, it may become the source of truth for deployed configuration. Before doing so, download and reconcile current dashboard config. Do not casually introduce `wrangler.toml` or `wrangler.jsonc`.

## 4. GoDaddy → Cloudflare DNS cutover (production)

The domain registration can stay with GoDaddy. Serving the **apex** `scimind.com.au` through Cloudflare Pages requires the domain as a Cloudflare zone and nameservers pointing to Cloudflare. Treat this as a DNS migration, not merely a website toggle.

**Before changing nameservers:**

1. Export/screenshot the current authoritative GoDaddy DNS zone and collect *all* A, AAAA, CNAME, MX, TXT, CAA, SRV and any other records, including subdomains and verification records.
2. Build a private DNS inventory: `type | host | value | priority | TTL | purpose | expected proxy status | verified date`. Store sensitive or internal-only values in a secure private record, not publicly.
3. Copy required DNS records into the Cloudflare zone, then independently compare the record sets. Pay special attention to Google Workspace MX, SPF, DKIM, DMARC, Resend sending-domain DKIM/SPF/return-path and third-party domain ownership verifications. **Do not create multiple conflicting SPF TXT records at the same hostname.**
4. Keep email-related DNS records **DNS-only**, not proxied through Cloudflare's orange cloud. Consult each provider's canonical setup if record format is unclear; preserve valid existing entries rather than reconstructing from assumptions.
5. In Cloudflare Pages, add `scimind.com.au` under Custom domains, decide how `www` should resolve/redirect, and inspect issued HTTPS certificates.
6. Change nameservers **at GoDaddy only when ready**. Allow DNS propagation and repeatedly check website, external inbound email, outbound Workspace email, transactional Resend delivery, SPF/DKIM/DMARC authentication and forms. Record the cutover date/time and resolved nameservers.
7. Remove temporary localhost origins / allow-list entries after confirmed production tests. Retain the ability to roll back DNS or application changes.

Do **not** invent specific MX hosts, priorities, SPF includes, DKIM selector names, Cloudflare nameserver values or verification tokens. Capture them from authoritative dashboards **on migration day**. [Cloudflare Pages custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/).

### DNS inventory template (fill using live records)

| Provider / record | Host | Actual type/value/priority | Verified | Notes |
| --- | --- | --- | --- | --- |
| Workspace MX | TBD | **To inventory** | ☐ | Preserve inbound email |
| Workspace SPF | TBD | **To inventory** | ☐ | Avoid conflicting records |
| Workspace DKIM | TBD | **To inventory** | ☐ | Selector may vary |
| DMARC | `_dmarc` or as configured | **To inventory** | ☐ | Preserve policy/report destination |
| Resend verified domain | `send` / as configured | **To inventory** | ☐ | Check Resend dashboard |
| Search / Meta verification | As configured | **To inventory** | ☐ | Preserve domain ownership proof |
| Existing web host | Apex/www | **To inventory** | ☐ | Replace only when cutover ready |

## 5. Production enquiry test and monitoring

- Send one controlled test submission from Contact, one from Quick Enquiry, and one invalid/empty/Turnstile-failure case. Confirm appropriate success/error UI and accessible status text.
- Confirm one genuine notification email per accepted test reaches `info@scimind.com.au`, with correct reply-to. Review D1 records and Worker logs using safe/test-only data.
- Verify the user is not shown “success” for a rejected request or upstream failure. Check duplicate prevention/rate-limiting by reading current Worker logic rather than guessing.
- Do not store or expose parents' messages in browser telemetry, screenshots, public logs, Git or website source. Review retention and access controls in the approved privacy policy.
- Check Worker errors, Resend sending status, D1 binding, domain verification and free-tier limits periodically.

**Troubleshooting order:** frontend console/network status → `/api/enquiries` Pages Function deployment → Pages service binding name → Worker validation/origin checks → Turnstile verification → D1 binding → Resend provider status → Workspace delivery/spam. Each has distinct owners and failure modes.

## 6. Email and rollback safety

For website rollback, revert or redeploy a known-good Pages commit/deployment. Do not touch MX or other email records. For a DNS cutover error, compare authoritative DNS answers and records against the pre-cutover inventory before changing anything. For enquiry failure, preserve messages already received, investigate failed requests and avoid telling parents a submission was accepted if it was not. Any privacy/security incident needs restricted access and a documented response.

## 7. Post-launch operational record (complete after going live)

- GitHub repository URL: `TBD`
- Cloudflare Pages project URL and `pages.dev` hostname: `TBD`
- Production deployment commit SHA and date: `TBD`
- Domain cutover and HTTPS verification date: `TBD`
- Authoritative Cloudflare nameservers: `TBD (record privately)`
- Worker currently deployed version/date: `TBD`
- Service binding name and Pages Function path: `TBD`
- D1 binding verified: `TBD`
- Resend sender + DNS verification date: `TBD`
- Google Workspace inbound/outbound test date: `TBD`
- Last successful production submission / monitoring owner: `TBD`
- Owner-approved backup and rollback process: `TBD`

**This guide intentionally documents architecture and safe verification steps, not credentials or a fictitious final DNS zone.**
