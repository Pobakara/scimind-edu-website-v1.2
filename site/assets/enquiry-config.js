/* Public configuration; NEVER place API keys or Turnstile SECRET here.
   Keep enabled:false until server routing and real website forms pass tests.
   Copy the public Turnstile SITE KEY from your Cloudflare widget. */
window.SCIMIND_ENQUIRY = Object.freeze({
  enabled: true,
  endpoint: 'https://scimind-enquiries.pobakara.workers.dev/api/enquiries',
  turnstileSiteKey: '0x4AAAAAAFf56sT_85uAWCtw',
});
