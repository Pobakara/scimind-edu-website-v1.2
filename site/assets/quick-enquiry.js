/* Quick enquiry: same version-2 API contract as contact.html.
   Enable only after the server endpoint and mailbox delivery have been tested.
   No credentials belong in this file. */
(() => {
  'use strict';
  const API = window.SciMindEnquiryClient;
  const DELIVERY = API.config();
  function init() {
    const original = document.querySelector('.floating-enquiry');
    if (!original || document.getElementById('sm-quick-dialog') || !window.HTMLDialogElement || !HTMLDialogElement.prototype.showModal) return;
    const programmes = ['foundations','bio','chem','psych','unsure'];
    const dialog = document.createElement('dialog');
    dialog.id = 'sm-quick-dialog'; dialog.className = 'sm-quick-dialog';
    dialog.setAttribute('aria-labelledby','sm-quick-title');
    dialog.setAttribute('aria-describedby','sm-quick-intro');
    dialog.innerHTML = `
      <div class="sm-quick-heading"><div><span class="sm-quick-kicker">SciMind Education</span><h2 id="sm-quick-title">Let’s talk science.</h2></div><button type="button" class="sm-quick-close" aria-label="Close quick enquiry">×</button></div>
      <p id="sm-quick-intro">Tell us a little about your child’s learning needs.</p>
      <p class="sm-quick-notice">Online enquiry delivery is not connected yet. This form cannot send your enquiry at present.</p>
      <form id="sm-quick-form" novalidate>
        <p class="sm-quick-required">* Required fields</p>
        <div class="sm-quick-errors" role="alert" hidden></div>
        <div class="sm-quick-grid">
          <div class="sm-quick-field"><label for="sm-q-name">Parent/guardian name *</label><input id="sm-q-name" name="parentName" required autocomplete="name" maxlength="100" aria-describedby="sm-q-name-error"><span id="sm-q-name-error" class="sm-quick-error"></span></div>
          <div class="sm-quick-field"><label for="sm-q-email">Email address *</label><input id="sm-q-email" name="email" type="email" required autocomplete="email" maxlength="254" aria-describedby="sm-q-email-error"><span id="sm-q-email-error" class="sm-quick-error"></span></div>
          <div class="sm-quick-field"><label for="sm-q-year">Student year level *</label><select id="sm-q-year" name="yearLevel" required aria-describedby="sm-q-year-error"><option value="">Please select</option>${Array.from({length:9},(_,i)=>`<option value="${i+4}">Year ${i+4}</option>`).join('')}<option value="other">Other / Not sure</option></select><span id="sm-q-year-error" class="sm-quick-error"></span></div>
          <div class="sm-quick-field"><label for="sm-q-programme">Programme of interest *</label><select id="sm-q-programme" name="programme" required aria-describedby="sm-q-programme-error"><option value="">Please select</option><option value="foundations">General Science (Years 4–10)</option><option value="bio">VCE Biology</option><option value="chem">VCE Chemistry</option><option value="psych">VCE Psychology</option><option value="unsure">Not sure / Need guidance</option></select><span id="sm-q-programme-error" class="sm-quick-error"></span></div>
        </div>
        <div class="sm-quick-field"><label for="sm-q-message">Message <span>(optional)</span></label><textarea id="sm-q-message" name="message" maxlength="3000" rows="3" placeholder="Which topics or learning goals would you like support with? Please avoid sensitive student information." aria-describedby="sm-q-message-error"></textarea><span id="sm-q-message-error" class="sm-quick-error"></span></div>
        <div class="sm-quick-trap" aria-hidden="true"><label for="sm-q-website">Leave blank</label><input id="sm-q-website" name="website" tabindex="-1" autocomplete="off" maxlength="200"></div>
        <p class="sm-quick-privacy">Your information will be used to respond to your enquiry. See our <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.</p>
        <label class="sm-form-consent"><input type="checkbox" name="privacy" required> I have read the Privacy Policy and agree to SciMind using these details to respond to my enquiry.</label>
        <div class="sm-turnstile" id="quick-turnstile" aria-label="Security verification"></div>
        <button type="submit" class="sm-quick-submit">Send enquiry <span aria-hidden="true"><svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7M7 7h10v10"/></svg></span></button>
        <p class="sm-quick-status" role="status" aria-live="polite" aria-atomic="true" tabindex="-1"></p>
      </form>
      <p class="sm-quick-alternative">Or email <a href="mailto:info@scimind.com.au">info@scimind.com.au</a><br>Prefer to call? <a href="tel:+61490090701">0490 090 701</a> or <a href="tel:+61494147205">0494 147 205</a></p>`;
    const trigger = document.createElement('button');
    trigger.type = 'button'; trigger.className = 'sm-quick-trigger';
    trigger.setAttribute('aria-label','Open quick enquiry'); trigger.title = 'Quick enquiry';
    trigger.setAttribute('aria-haspopup','dialog'); trigger.setAttribute('aria-controls',dialog.id);
    trigger.innerHTML = '<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" focusable="false"><path d="M20.5 11.4c0 4.5-3.8 8-8.5 8-1.2 0-2.3-.2-3.3-.6L4 20l1.2-4.2a7.7 7.7 0 0 1-1.7-4.8c0-4.5 3.8-8 8.5-8s8.5 3.9 8.5 8.4Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><circle cx="8" cy="11.5" r="1" fill="currentColor"/><circle cx="12" cy="11.5" r="1" fill="currentColor"/><circle cx="16" cy="11.5" r="1" fill="currentColor"/></svg>';
    document.body.append(dialog); original.replaceWith(trigger);
    const form = dialog.querySelector('form'), submit = form.querySelector('[type=submit]');
    const status = dialog.querySelector('.sm-quick-status'), summary = dialog.querySelector('.sm-quick-errors');
    const fields = ['parentName','email','yearLevel','programme','message'];
    let widget=null, widgetLoading=false;
    async function ensureChallenge() {
      if(!DELIVERY.enabled || widget || widgetLoading)return;
      widgetLoading=true;
      try {widget=await API.setup(dialog.querySelector('#quick-turnstile'));dialog.querySelector('.sm-quick-notice').hidden=true;}
      catch {dialog.querySelector('.sm-quick-notice').textContent='Security verification is unavailable. Please email info@scimind.com.au.';}
      finally {widgetLoading=false;}
    }
    let sending = false, lastPayload = '', requestId = '';
    function read() {
      const data = {schemaVersion:2, format:''};
      [...fields,'website'].forEach(name => data[name]=form.elements[name].value.trim());
      return data;
    }
    function validate(data) {
      const errors = {};
      if (!data.parentName || data.parentName.length>100 || /[\r\n]/.test(data.parentName)) errors.parentName='Enter your name (up to 100 characters).';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || data.email.length>254 || /[\r\n]/.test(data.email)) errors.email='Enter a valid email address.';
      if (!/^(4|5|6|7|8|9|10|11|12|other)$/.test(data.yearLevel)) errors.yearLevel='Choose a year level or Other / Not sure.';
      if (!programmes.includes(data.programme)) errors.programme='Choose a programme or Not sure / Need guidance.';
      if (data.message.length>3000) errors.message='Keep your message within 3,000 characters.';
      return errors;
    }
    function fieldError(name,error) {
      const input=form.elements[name]; input.setAttribute('aria-invalid',String(!!error));
      document.getElementById(input.id+'-error').textContent=error || '';
    }
    fields.forEach(name => {
      const input=form.elements[name];
      input.addEventListener('blur',()=>fieldError(name,validate(read())[name]));
      ['input','change'].forEach(event=>input.addEventListener(event,()=>{if(input.getAttribute('aria-invalid')==='true')fieldError(name,validate(read())[name]);}));
    });
    trigger.addEventListener('click',()=>{
      if (dialog.open) return;
      if (!form.elements.programme.value) {
        const query=new URLSearchParams(location.search).get('programme');
        const hash=location.hash.slice(1);
        const selected=programmes.includes(query)?query:programmes.includes(hash)?hash:'';
        form.elements.programme.value=selected;
      }
      dialog.showModal(); document.body.classList.add('sm-quick-open'); ensureChallenge();
      if (sending) status.focus(); else form.elements.parentName.focus();
    });
    dialog.querySelector('.sm-quick-close').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('close',()=>{document.body.classList.remove('sm-quick-open');trigger.focus({preventScroll:true});});
    // Escape uses native dialog behaviour. Closing preserves all unsent values.
    function feedback(text,success=false) {
      status.textContent=text; status.classList.toggle('sm-quick-success',success);
      if (dialog.open) status.focus();
    }
    form.addEventListener('submit',async event=>{
      event.preventDefault(); if(sending)return;
      summary.hidden=true; status.textContent=''; status.classList.remove('sm-quick-success');
      const data=read(),errors=validate(data); fields.forEach(name=>fieldError(name,errors[name]));
      if(Object.keys(errors).length){summary.textContent='Please check the highlighted fields.';summary.hidden=false;form.elements[Object.keys(errors)[0]].focus();return;}
      if(!DELIVERY.enabled){feedback('Your enquiry has not been sent. Online delivery is not connected yet. Please email info@scimind.com.au.');return;}
      if(data.website){feedback('We could not submit this enquiry. Please contact us by email.');return;}
      if(!form.elements.privacy.checked){feedback('Please acknowledge the Privacy Policy.');form.elements.privacy.focus();return;}
      if(!widget){feedback('Security verification is unavailable. Please email info@scimind.com.au.');return;}
      const token=widget.token();if(!token){feedback('Please complete the security verification first.');return;}
      const payload=JSON.stringify(data);
      if(payload!==lastPayload){requestId=crypto.randomUUID();lastPayload=payload;}
      sending=true; submit.disabled=true; submit.textContent='Sending…'; form.setAttribute('aria-busy','true');
      fields.forEach(name=>form.elements[name].disabled=true);
      status.textContent='Sending your enquiry. Please wait.';
      const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);
      try {
        const result=await API.submit(data,token,requestId,controller.signal);
        if(result.kind==='rate-limited'){feedback('Too many attempts. Please wait before retrying or email SciMind.');return;}
        if(result.kind==='invalid'){feedback('The service could not accept these details. Please review them or contact us by email.');return;}
        if(result.kind!=='accepted')throw new Error('unconfirmed');
        window.SciMindAnalytics?.generateLead('quick_enquiry');
        form.reset();lastPayload='';requestId='';
        feedback('Thank you. Your enquiry has been received by SciMind. Reference: '+result.reference+'.',true);
      } catch {feedback('We could not confirm receipt. Your details are still here. Please email info@scimind.com.au before retrying if uncertain whether it arrived.');}
      finally {clearTimeout(timeout);widget.reset();sending=false;submit.disabled=false;fields.forEach(name=>form.elements[name].disabled=false);submit.innerHTML='Send enquiry <span aria-hidden="true"><svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7M7 7h10v10"/></svg></span>';form.setAttribute('aria-busy','false');}
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
