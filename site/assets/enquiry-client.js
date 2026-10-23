/* Shared public form transport: no secrets; used by both enquiry forms. */
(() => {
  'use strict';
  const cfg = () => window.SCIMIND_ENQUIRY || {};
  const isLocal = () => ['localhost','127.0.0.1'].includes(location.hostname);
  function endpoint() {
    const c = cfg();

    if (!c.enabled || !c.turnstileSiteKey || !c.endpoint) {
      throw new Error('configuration');
    }

    const u = new URL(c.endpoint, location.href);

    const sameOrigin =
      u.origin === location.origin &&
      (u.protocol === 'https:' || isLocal());

    // Explicitly allow SciMind's existing Cloudflare Worker.
    const trustedWorker =
      u.protocol === 'https:' &&
      u.hostname === 'scimind-enquiries.pobakara.workers.dev' &&
      u.origin === 'https://scimind-enquiries.pobakara.workers.dev';

    if (!(sameOrigin || trustedWorker) || u.pathname !== '/api/enquiries') {
      throw new Error('configuration');
    }

    return u.href;
  }
  let turnstilePromise;
  function loadTurnstile() {
    if(window.turnstile) return Promise.resolve();
    if(turnstilePromise) return turnstilePromise;
    turnstilePromise=new Promise((resolve,reject)=>{
      const s=document.createElement('script');s.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      s.async=true;s.onload=()=>window.turnstile?resolve():reject(new Error('turnstile'));
      s.onerror=()=>reject(new Error('turnstile'));document.head.append(s);
    });
    return turnstilePromise;
  }
  async function setup(target) {
    if(!cfg().enabled) return null;
    if(!cfg().turnstileSiteKey) throw new Error('configuration');
    await loadTurnstile();
    const id=window.turnstile.render(target,{sitekey:cfg().turnstileSiteKey,theme:'auto',
      'error-callback':()=>{target.dataset.challengeError='true';},
      'expired-callback':()=>{target.dataset.challengeError='true';},
      'success-callback':()=>{target.dataset.challengeError='false';}
    });
    return {token:()=>window.turnstile.getResponse(id),reset:()=>window.turnstile.reset(id)};
  }
  async function submit(data, token, requestId, signal) {
    const url=endpoint();
    if(!token) return {kind:'challenge'};
    if(!crypto?.randomUUID) throw new Error('configuration');
    const payload={schemaVersion:2,parentName:data.parentName,email:data.email,
      phone:data.phone||'',yearLevel:data.yearLevel,programme:data.programme,
      format:data.format||'',message:data.message||'',privacy:true,
      website:data.website||'',requestId,turnstileToken:token};
    const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},
      credentials:new URL(url).origin===location.origin?'same-origin':'omit',body:JSON.stringify(payload),signal});
    if(r.status===429) return {kind:'rate-limited'};
    if(r.status===422) return {kind:'invalid'};
    if(!r.ok) throw new Error('unconfirmed');
    const json=await r.json();
    if(json.accepted!==true || typeof json.reference!=='string' || !/^[\w-]{1,100}$/.test(json.reference)) throw new Error('unconfirmed');
    return {kind:'accepted',reference:json.reference};
  }
  window.SciMindEnquiryClient=Object.freeze({config:cfg,setup,submit});
})();
