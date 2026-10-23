(() => {
  'use strict';
  async function init() {
    const form=document.querySelector('#contact-enquiry-form');if(!form)return;
    const api=window.SciMindEnquiryClient, cfg=api.config();
    const notice=document.querySelector('#delivery-notice'),status=document.querySelector('#form-status'),
      summary=document.querySelector('#form-errors'),btn=form.querySelector('[type=submit]');
    const fieldNames=['parentName','email','yearLevel','programme','format','message'];
    const value=name=>form.elements[name].value.trim();
    const selected=new URLSearchParams(location.search).get('programme');
    if(['foundations','bio','chem','psych','unsure'].includes(selected)) form.elements.programme.value=selected;
    if(selected==='private')form.elements.programme.value='unsure';
    let widget=null,sending=false,requestId='',lastData='';
    const feedback=(msg,good=false)=>{status.textContent=msg;status.className=good?'form-success':'form-failure';status.focus();};
    function read(){const d={};for(const n of [...fieldNames,'website'])d[n]=value(n);return d;}
    function validate(d){const e={};
      if(!d.parentName||d.parentName.length>100||/[\r\n]/.test(d.parentName))e.parentName='Enter your name (up to 100 characters).';
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)||d.email.length>254)e.email='Enter a valid email address.';
      if(!/^(?:[4-9]|1[0-2]|other)$/.test(d.yearLevel))e.yearLevel='Choose a year level.';
      if(!['foundations','bio','chem','psych','unsure'].includes(d.programme))e.programme='Choose a programme.';
      if(!['','Online','Face-to-face','Not sure yet'].includes(d.format))e.format='Choose one of the listed formats.';
      if(d.message.length>3000)e.message='Keep the message within 3,000 characters.';
      if(!form.elements.privacy.checked)e.privacy='Please acknowledge the Privacy Policy.';
      return e;
    }
    function errors(err){for(const n of fieldNames){form.elements[n].setAttribute('aria-invalid',String(!!err[n]));
      const slot=document.getElementById(n+'-error');if(slot)slot.textContent=err[n]||'';}
      summary.hidden=!Object.keys(err).length;summary.textContent=Object.keys(err).length?'Please check the highlighted fields and privacy acknowledgement.':'';
    }
    if(!cfg.enabled){notice.hidden=false;notice.textContent='Online enquiry delivery is not connected yet. Please contact us by email or WhatsApp.';btn.disabled=false;}
    else {
      try{widget=await api.setup(document.getElementById('contact-turnstile'));notice.hidden=true;btn.disabled=false;}
      catch{notice.hidden=false;notice.textContent='Security verification is unavailable. Please contact info@scimind.com.au.';btn.disabled=false;}
    }
    form.addEventListener('submit',async event=>{
      event.preventDefault();if(sending)return;status.textContent='';
      const data=read(),err=validate(data);errors(err);
      if(Object.keys(err).length){if(err.privacy)form.elements.privacy.focus();else form.elements[Object.keys(err)[0]].focus();return;}
      if(!cfg.enabled||!widget){feedback('Your enquiry has not been sent. Please email info@scimind.com.au.');return;}
      if(data.website){feedback('We could not submit this enquiry. Please contact us by email.');return;}
      const token=widget.token();if(!token){feedback('Please complete the security verification before sending.');return;}
      const signature=JSON.stringify(data);if(signature!==lastData){requestId=crypto.randomUUID();lastData=signature;}
      sending=true;btn.disabled=true;form.setAttribute('aria-busy','true');status.textContent='Sending your enquiry…';
      const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);
      try{const result=await api.submit(data,token,requestId,controller.signal);
        if(result.kind==='accepted'){form.reset();requestId='';lastData='';feedback('Thank you! SciMind has received your enquiry. Reference: '+result.reference+'.',true);}
        else if(result.kind==='rate-limited')feedback('Too many attempts. Please try later or email SciMind.');
        else feedback('The enquiry could not be accepted. Please check the details or contact us by email.');
      }catch{feedback('We could not confirm receipt. Please email info@scimind.com.au before retrying if uncertain whether it arrived.');}
      finally{clearTimeout(timeout);widget.reset();sending=false;btn.disabled=false;form.setAttribute('aria-busy','false');}
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
