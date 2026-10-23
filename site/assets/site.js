/* Dependency-free enhancements. No analytics, cookies or persistent browser storage. */
const PROGRAMMES = ['bio', 'chem', 'psych', 'foundations', 'private', 'unsure'];
function validateEnquiry(data) {
  const errors = {};
  if (!data.parentName || data.parentName.length > 100) errors.parentName = 'Enter your name (up to 100 characters).';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email || '') || data.email.length > 254) errors.email = 'Enter a valid email address.';
  if (data.phone && (data.phone.length > 30 || !/^[+\d\s().-]{6,30}$/.test(data.phone))) errors.phone = 'Enter a valid phone number, or leave this blank.';
  if (!/^(4|5|6|7|8|9|10|11|12)$/.test(data.yearLevel || '')) errors.yearLevel = 'Choose a year level from Year 4 to Year 12.';
  if (!PROGRAMMES.includes(data.programme)) errors.programme = 'Choose a programme, or select Not sure yet.';
  if (data.format && !['Online', 'Face-to-face', 'Either'].includes(data.format)) errors.format = 'Choose one of the listed formats.';
  if (!data.message || data.message.length < 10 || data.message.length > 3000) errors.message = 'Enter a message between 10 and 3,000 characters.';
  if (data.privacy !== true) errors.privacy = 'Please read and acknowledge the Privacy Policy.';
  return errors;
}
function programmeFromLocation(location) {
  // The offline review file carries the same query inside its hash route.
  const query = location.hash.startsWith('#/') ? (location.hash.split('?')[1] || '') : location.search.slice(1);
  const value = new URLSearchParams(query).get('programme');
  return PROGRAMMES.includes(value) ? value : '';
}
async function submitEnquiry(data, config, fetcher, signal, origin) {
  if (!config?.enabled) return { kind: 'unavailable' };
  if (!config.endpoint || !config.endpoint.startsWith('/') || config.endpoint.startsWith('//') || config.endpoint.includes('\\')) throw new Error('configuration');
  const endpoint = new URL(config.endpoint, origin);
  if (endpoint.origin !== new URL(origin).origin || endpoint.protocol !== 'https:') throw new Error('configuration');
  const response = await fetcher(endpoint.href, { method: 'POST', headers: {'Content-Type':'application/json', 'Accept':'application/json'}, body: JSON.stringify(data), signal, credentials: 'same-origin' });
  if (response.status === 429) return {kind: 'rate-limited'};
  if (!response.ok) throw new Error('unconfirmed');
  const result = await response.json();
  // Only an explicit receipt from a configured backend is success. Never mock this in production.
  if (result.accepted !== true || typeof result.reference !== 'string' || !/^[\w-]{1,100}$/.test(result.reference)) throw new Error('unconfirmed');
  return {kind: 'accepted', reference: result.reference};
}
function rotationClock(advance, timers = globalThis, delay = 5500) {
  const reasons = new Set(); let timer = null; let disposed = false;
  const schedule = () => { if (disposed || reasons.size || timer !== null) return; timer = timers.setTimeout(() => { timer = null; advance(); schedule(); }, delay); };
  return {
    pause(reason, paused) { if(paused) reasons.add(reason); else reasons.delete(reason); if(timer !== null) timers.clearTimeout(timer); timer = null; schedule(); },
    start: schedule,
    dispose() { disposed = true; if(timer !== null) timers.clearTimeout(timer); timer = null; },
    get paused() { return reasons.size > 0; }
  };
}
function initSciMind() {
  // Dispose old listeners, media and timers before an offline-preview route changes.
  if (window.sciMindCleanup) window.sciMindCleanup();
  const cleanups = [];
  const listen = (el, type, fn, options) => { if(!el)return; el.addEventListener(type, fn, options); cleanups.push(()=>el.removeEventListener(type, fn, options)); };
  const $ = selector => document.querySelector(selector);
  // The footer remains meaningful without JavaScript: © SciMind Education.
  document.querySelectorAll('[data-footer-year]').forEach(node => {
    node.textContent = String(new Date().getFullYear()) + ' ';
  });
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const headerLogo = $('.header-logo');
  if(headerLogo) {
    const fitLogo = () => headerLogo.classList.toggle('is-horizontal', headerLogo.naturalWidth > headerLogo.naturalHeight * 1.5);
    listen(headerLogo, 'load', fitLogo);
    if(headerLogo.complete) fitLogo();
  }
  const menu = $('.menu-toggle'), nav = $('.navlinks');
  const closeMenu = () => { menu.setAttribute('aria-expanded','false'); nav.classList.remove('open'); };
  if(menu && nav) {
    listen(menu,'click',()=>{ const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open); });
    listen(nav,'click',e=>{if(e.target.closest('a'))closeMenu();});
    listen(nav,'keydown',e=>{if(e.key==='Escape'){closeMenu();menu.focus();}});
    listen(menu,'keydown',e=>{if(e.key==='Escape')closeMenu();});
  }
  const video = $('.hero-video'), film = $('.hero-film'), toggle = $('.scene-toggle');
  if(video && film && toggle) {
    let userPaused = false, visible = true, failed = false;
    const updateButton = () => { toggle.textContent=video.paused?'▷':'Ⅱ';toggle.setAttribute('aria-pressed',String(video.paused));toggle.setAttribute('aria-label',video.paused?'Play hero video':'Pause hero video'); };
    const playback = () => {
      toggle.hidden = reduced.matches || failed;
      if(reduced.matches || userPaused || document.hidden || !visible || failed) {
        video.pause(); if(reduced.matches || failed)film.classList.remove('video-ready'); updateButton();return;
      }
      if(!video.getAttribute('src')) { video.muted=true;video.src=video.dataset.src; }
      video.play().catch(()=>{updateButton();});
    };
    listen(video,'playing',()=>{film.classList.add('video-ready');updateButton();});
    listen(video,'pause',updateButton);
    listen(video,'error',()=>{failed=true;playback();});
    listen(toggle,'click',()=>{userPaused=!video.paused;if(userPaused)video.pause();else playback();updateButton();});
    listen(reduced,'change',playback);listen(document,'visibilitychange',playback);
    if('IntersectionObserver' in window) {const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;playback();},{threshold:.1});observer.observe(film);cleanups.push(()=>observer.disconnect());}
    // Text and poster are already in HTML; defer starting the video until after initial layout.
    const start = window.setTimeout(playback, 100);cleanups.push(()=>{clearTimeout(start);video.pause();});
  }
  const section=$('.testimonials'), card=$('.quote-card');
  if(section && card) {
    const quotes=['[Insert approved parent testimonial]','[Insert approved student feedback]','[Insert a second approved parent testimonial]'];
    const dots=[...section.querySelectorAll('.quote-dot')], play=$('.quote-play');
    let active=0, userStopped=false, transition=null, visible=true;
    const display=(next,manual=false)=>{
      if(transition!==null)clearTimeout(transition);
      if(manual){userStopped=true;clock.pause('user',true);}
      card.setAttribute('aria-live',manual?'polite':'off');
      const update=()=>{active=(next+quotes.length)%quotes.length;card.querySelector('blockquote').textContent=quotes[active];$('.quote-count').textContent=String(active+1).padStart(2,'0')+' / 03';dots.forEach((dot,i)=>dot.setAttribute('aria-pressed',String(i===active)));card.classList.remove('quote-out');card.classList.remove('change');void card.offsetWidth;card.classList.add('change');transition=null;};
      if(reduced.matches)update();else{card.classList.add('quote-out');transition=setTimeout(update,200);}
      updatePlay();
    };
    const clock=rotationClock(()=>display(active+1));
    const updatePlay=()=>{const stopped=userStopped||reduced.matches;play.textContent=stopped?'▷':'Ⅱ';play.setAttribute('aria-label',stopped?'Resume automatic testimonials':'Pause automatic testimonials');play.setAttribute('aria-pressed',String(stopped));play.disabled=reduced.matches;play.title=reduced.matches?'Automatic movement is off for reduced motion':'';};
    listen($('.quote-prev'),'click',()=>display(active-1,true));listen($('.quote-next'),'click',()=>display(active+1,true));
    dots.forEach((dot,i)=>listen(dot,'click',()=>display(i,true)));
    listen(play,'click',()=>{userStopped=!userStopped;clock.pause('user',userStopped);updatePlay();});
    listen(section,'mouseenter',()=>clock.pause('hover',true));listen(section,'mouseleave',()=>clock.pause('hover',false));
    listen(section,'focusin',()=>clock.pause('focus',true));listen(section,'focusout',e=>{if(!section.contains(e.relatedTarget))clock.pause('focus',false);});
    listen(document,'visibilitychange',()=>clock.pause('hidden',document.hidden));
    listen(reduced,'change',()=>{clock.pause('reduced',reduced.matches);if(reduced.matches&&transition!==null){clearTimeout(transition);transition=null;card.classList.remove('quote-out');}updatePlay();});
    let touch=null;
    listen(card,'touchstart',e=>{if(e.touches.length===1)touch={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});
    listen(card,'touchend',e=>{if(!touch||!e.changedTouches.length)return;const dx=e.changedTouches[0].clientX-touch.x,dy=e.changedTouches[0].clientY-touch.y;touch=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.2)display(active+(dx<0?1:-1),true);},{passive:true});
    listen(card,'touchcancel',()=>{touch=null;});
    if('IntersectionObserver' in window){visible=false;const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;clock.pause('offscreen',!visible);},{threshold:.1});observer.observe(section);cleanups.push(()=>observer.disconnect());}
    clock.pause('reduced',reduced.matches);clock.pause('hidden',document.hidden);clock.pause('offscreen',!visible);clock.start();updatePlay();
    cleanups.push(()=>{clock.dispose();if(transition!==null)clearTimeout(transition);});
  }
  const form=$('#enquiry-form');
  if(form) {
    const config=window.SCIMIND_ENQUIRY||{enabled:false};
    const status=$('#form-status'), summary=$('#form-errors'), submit=form.querySelector('[type=submit]');
    submit.disabled=false;
    const selected=programmeFromLocation(window.location);if(selected)$('#programme').value=selected;
    if(config.enabled)$('#delivery-notice').hidden=true;
    const read=()=>{const data={};for(const name of ['parentName','email','phone','yearLevel','programme','format','message','website'])data[name]=form.elements[name].value.trim();data.privacy=form.elements.privacy.checked;return data;};
    const fieldError=(name,error)=>{const field=form.elements[name];field.setAttribute('aria-invalid',String(!!error));document.getElementById(name+'-error').textContent=error||'';};
    for(const name of ['parentName','email','phone','yearLevel','programme','format','message','privacy']) {
      const field=form.elements[name];
      listen(field,'blur',()=>fieldError(name,validateEnquiry(read())[name]));
      listen(field,'input',()=>{if(field.getAttribute('aria-invalid')==='true')fieldError(name,validateEnquiry(read())[name]);});
      listen(field,'change',()=>{if(field.getAttribute('aria-invalid')==='true')fieldError(name,validateEnquiry(read())[name]);});
    }
    let sending=false,controller=null,requestId='',lastPayload='';
    listen(form,'submit',async event=>{
      event.preventDefault();if(sending)return;
      status.textContent='';status.className='';summary.hidden=true;
      const data=read(),errors=validateEnquiry(data);
      for(const name of ['parentName','email','phone','yearLevel','programme','format','message','privacy'])fieldError(name,errors[name]);
      if(Object.keys(errors).length){summary.textContent='Please check the highlighted fields before sending your enquiry.';summary.hidden=false;form.elements[Object.keys(errors)[0]].focus();return;}
      if(!config.enabled){status.textContent='Online enquiries are not connected yet. Your enquiry has not been sent. Please email info@scimind.com.au or call 0490 090 701.';status.className='form-failure';status.focus();return;}
      if(data.website){status.textContent='We could not submit this enquiry. Please contact us by email or phone.';status.className='form-failure';return;}
      const payload=JSON.stringify(data);if(payload!==lastPayload){requestId=crypto.randomUUID();lastPayload=payload;}
      data.requestId=requestId;
      sending=true;submit.disabled=true;submit.textContent='Sending enquiry…';form.setAttribute('aria-busy','true');status.textContent='Sending your enquiry. Please wait.';
      controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),15000);
      try {
        const result=await submitEnquiry(data,config,window.fetch.bind(window),controller.signal,window.location.href);
        if(result.kind==='accepted'){status.textContent='Thank you. Your enquiry has been received. Reference: '+result.reference+'.';status.className='form-success';form.reset();lastPayload='';requestId='';}
        else if(result.kind==='rate-limited'){status.textContent='Too many attempts. Please wait before trying again, or contact us by email or phone. Your details are still here.';status.className='form-failure';}
        else {status.textContent='Online enquiries are not connected yet. Your enquiry has not been sent. Please email or call us.';status.className='form-failure';}
      } catch {status.textContent='We could not confirm receipt of your enquiry. Your details are still here. Please contact info@scimind.com.au or 0490 090 701 before retrying if you are unsure whether it arrived.';status.className='form-failure';}
      finally{clearTimeout(timeout);sending=false;submit.disabled=false;submit.innerHTML='Send enquiry <span aria-hidden="true">↗</span>';form.setAttribute('aria-busy','false');status.focus();}
    });
    cleanups.push(()=>controller?.abort());
  }
  window.sciMindCleanup=()=>cleanups.forEach(fn=>fn());
}
if(typeof module!=='undefined'&&module.exports)module.exports={validateEnquiry,programmeFromLocation,submitEnquiry,rotationClock};
if(typeof document!=='undefined')initSciMind();

/* Load the isolated quick-enquiry enhancement without replacing page HTML.
   Keep the original contact link usable if either new asset cannot load. */
(() => {
  if(typeof document==='undefined' || document.querySelector('[data-sm-quick-loader]'))return;
  const source=document.currentScript;
  if(!source || !source.src)return;
  const base=new URL('.',source.src);
  const style=document.createElement('link');
  style.rel='stylesheet';style.href=new URL('quick-enquiry.css',base).href;
  style.setAttribute('data-sm-quick-loader','');
  style.addEventListener('load',()=>{
    const script=document.createElement('script');
    script.src=new URL('quick-enquiry.js',base).href;
    document.head.append(script);
  },{once:true});
  document.head.append(style);
})();

/* Shared sticky/glass header. Isolated from page CSS and existing menu handlers. */
(() => {
  if(typeof document==='undefined' || document.querySelector('[data-sm-header-loader]'))return;
  const source=document.currentScript;
  if(!source || !source.src)return;
  const stylesheet=document.createElement('link');
  stylesheet.rel='stylesheet';
  stylesheet.href=new URL('header.css',source.src).href;
  stylesheet.setAttribute('data-sm-header-loader','');
  document.head.append(stylesheet);
  function initHeader(){
    const header=document.querySelector('.header');
    if(!header || header.classList.contains('sm-glass-header'))return;
    header.classList.add('sm-glass-header');
    document.documentElement.classList.add('sm-sticky-header');
    let frame=0;
    function updateScroll(){frame=0;header.classList.toggle('sm-header-scrolled',window.scrollY>12);}
    function measure(){
      const height=Math.ceil(header.getBoundingClientRect().height);
      document.documentElement.style.setProperty('--sm-header-height',height+'px');
      document.documentElement.style.setProperty('--sm-header-offset',(height+16)+'px');
    }
    window.addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(updateScroll);},{passive:true});
    window.addEventListener('pageshow',()=>{updateScroll();measure();});
    if('ResizeObserver' in window)new ResizeObserver(measure).observe(header);
    else window.addEventListener('resize',measure,{passive:true});
    stylesheet.addEventListener('load',measure,{once:true});
    updateScroll();measure();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initHeader,{once:true});
  else initHeader();
})();
