
/* Homepage enhancements. Shared site.js continues to own the menu and hero video. */
document.addEventListener('DOMContentLoaded',function () {
  var header=document.querySelector('.header');
  var reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  var frame=0;
  function updateHeader(){frame=0;header.classList.toggle('is-scrolled',window.scrollY>12);}
  function onScroll(){if(!frame)frame=window.requestAnimationFrame(updateHeader);}
  function sizeHeader(){
    document.documentElement.style.setProperty('--home-header-offset',(Math.ceil(header.getBoundingClientRect().height)+16)+'px');
  }
  if(header){
    updateHeader();sizeHeader();
    window.addEventListener('scroll',onScroll,{passive:true});
    if('ResizeObserver' in window){var headerSize=new ResizeObserver(sizeHeader);headerSize.observe(header);}
    else window.addEventListener('resize',sizeHeader,{passive:true});
  }
  if(!('IntersectionObserver' in window))return;
  var observer=null;
  var animated=new Set();
  // Observe cohesive groups, not every paragraph. Hero and carousel are excluded.
  var groups=[
    ['.intro',':scope > div'],
    ['.section-head',null],
    ['.collection-heading',null],
    ['.partner-heading',null],
    ['.learning-grid > div:first-child',null],
    ['.learning-steps',null],
    ['.teacher',':scope > div'],
    ['.collab-grid',':scope > div'],
    ['main > .cta > .wrap',null]
  ];
  var targets=new Map();
  groups.forEach(function(group){
    document.querySelectorAll(group[0]).forEach(function(target){
      targets.set(target,group[1]?Array.from(target.querySelectorAll(group[1])):[target]);
    });
  });
  function showImmediately(element){
    element.classList.remove('home-reveal-enter');
    element.style.removeProperty('--home-reveal-delay');
    animated.delete(element);
  }
  function configureMotion(){
    if(observer)observer.disconnect();
    if(reduced.matches){
      animated.forEach(showImmediately);
      return;
    }
    observer=new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(!entry.isIntersecting)return;
        var elements=targets.get(entry.target);
        if(!elements)return;
        // Once per page visit; scroll-back never replays the reveal.
        targets.delete(entry.target);
        observer.unobserve(entry.target);
        elements.forEach(function(element,index){
          if(element.contains(document.activeElement))return;
          element.style.setProperty('--home-reveal-delay',(index*70)+'ms');
          element.classList.add('home-reveal-enter');
          animated.add(element);
          element.addEventListener('animationend',function(){showImmediately(element);},{once:true});
        });
      });
    },{threshold:.06,rootMargin:'0px 0px -24px 0px'});
    targets.forEach(function(_,target){observer.observe(target);});
  }
  document.addEventListener('focusin',function(event){
    animated.forEach(function(element){if(element.contains(event.target))showImmediately(element);});
  });
  reduced.addEventListener('change',configureMotion);
  configureMotion();
});


/* Native horizontal rails keep their links usable even without this enhancement. */
document.addEventListener('DOMContentLoaded', function () {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('[data-rail]').forEach(collection => {
    const rail = collection.querySelector('.program-grid, .partner-grid');
    const controls = collection.querySelector('.rail-controls');
    const previous = controls.querySelector('[data-rail-prev]');
    const next = controls.querySelector('[data-rail-next]');
    const update = () => {
      const overflow = rail.scrollWidth - rail.clientWidth;
      controls.hidden = overflow < 4;
      previous.disabled = rail.scrollLeft < 4;
      next.disabled = rail.scrollLeft >= overflow - 4;
    };
    const move = direction => {
      const card = rail.firstElementChild;
      const gap = parseFloat(getComputedStyle(rail).columnGap) || 0;
      rail.scrollBy({left: direction * (card.getBoundingClientRect().width + gap), behavior: reduced.matches ? 'instant' : 'smooth'});
    };
    previous.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    rail.addEventListener('scroll', update, {passive:true});
    if ('ResizeObserver' in window) new ResizeObserver(update).observe(rail);
    else window.addEventListener('resize', update, {passive:true});
    update();
  });

  const steps = Array.from(document.querySelectorAll('.learning-step'));
  const nodes = Array.from(document.querySelectorAll('.path-node'));
  steps.forEach((step, index) => {
    step.open = index === 0;
    step.addEventListener('toggle', () => {
      if (step.open) steps.forEach(other => { if (other !== step) other.open = false; });
      nodes.forEach((node, i) => node.classList.toggle('is-current', steps[i].open));
    });
  });
});

/* Editable testimonials: only approved content or explicitly labelled previews is shown.
   No analytics, cookies, submissions or third-party services are used here. */
document.addEventListener('DOMContentLoaded', function () {
  const section = document.querySelector('[data-stories]');
  if (!section) return;
  const preview = [
    '[Insert approved parent testimonial]',
    '[Insert approved student feedback]',
    '[Insert a second approved parent testimonial]'
  ].map((quote, index) => ({id:'preview-'+(index+1), quote, attribution:'[Verified attribution, subject to permission]', context:'', image:'', approved:false, placeholder:true}));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const string = (value, maximum) => typeof value === 'string' && value.trim().length > 0 && value.trim().length <= maximum;
  function selectEntries(data) {
    if (!data || !Array.isArray(data.testimonials)) throw new Error('Invalid testimonial content');
    const valid = data.testimonials.filter(item => item && string(item.quote, 2000) && string(item.attribution, 150) &&
      (item.context === undefined || item.context === '' || string(item.context, 200)));
    const approved = valid.filter(item => item.approved === true && item.placeholder !== true);
    // The first approved entry automatically retires ALL development placeholders.
    return approved.length ? approved : valid.filter(item => item.placeholder === true);
  }
  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function initialise(items) {
    const deck = section.querySelector('.story-deck');
    const navigation = section.querySelector('.stories-navigation');
    const dotsContainer = section.querySelector('.story-dots');
    const previous = section.querySelector('[data-story-prev]');
    const next = section.querySelector('[data-story-next]');
    const play = section.querySelector('.story-play');
    const counter = section.querySelector('.story-position');
    const announcement = section.querySelector('[data-story-announcement]');
    const before = section.querySelector('.story-wing-before');
    const after = section.querySelector('.story-wing-after');
    const isPreview = items.some(item => item.placeholder === true);
    section.querySelector('.stories-disclosure').textContent = isPreview
      ? 'Testimonial design preview. Only genuine, approved feedback will appear here at launch.'
      : 'Feedback shared with permission by the SciMind community.';
    const fragment = document.createDocumentFragment();
    const dotFragment = document.createDocumentFragment();
    items.forEach((item, index) => {
      const panel = element('article', 'story-panel');
      panel.setAttribute('role', 'group');
      panel.setAttribute('aria-roledescription', 'slide');
      panel.setAttribute('aria-label', (index+1)+' of '+items.length);
      panel.id = 'story-'+(index+1);
      const kind = element('span', 'story-kind', item.placeholder === true ? 'Design preview · Placeholder testimonial' : 'The SciMind community');
      const mark = element('span', 'story-mark', '“'); mark.setAttribute('aria-hidden', 'true');
      const quote = element('blockquote', '', item.quote.trim());
      const person = element('div', 'story-person');
      // Accept only local photo filenames: never scripts, SVG, remote URLs or traversal paths.
      if (item.placeholder !== true && typeof item.image === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9_-]*\.(webp|png|jpe?g)$/i.test(item.image)) {
        const photo = element('img'); photo.src = 'assets/images/testimonials/'+item.image;
        photo.alt = ''; photo.width = 52; photo.height = 52; photo.loading = 'lazy';
        photo.addEventListener('error', () => photo.remove(), {once:true});
        person.append(photo);
      }
      const identity = element('div');
      identity.append(element('p', 'story-name', item.attribution.trim()));
      identity.append(element('p', 'story-context', item.placeholder === true ? 'Sample placeholder — not a genuine testimonial.' : (item.context || '').trim()));
      person.append(identity); panel.append(kind, mark, quote, person); fragment.append(panel);
      const dot = element('button'); dot.type = 'button';
      dot.setAttribute('aria-label', 'Show '+(item.placeholder === true ? 'placeholder ' : '')+'testimonial '+(index+1));
      dot.setAttribute('aria-controls', panel.id);
      dot.addEventListener('click', () => display(index, true));
      dotFragment.append(dot);
    });
    deck.replaceChildren(fragment); dotsContainer.replaceChildren(dotFragment);
    const panels = Array.from(deck.children), dots = Array.from(dotsContainer.children);
    let active = 0, userStopped = false, timer = null;
    const pauses = new Set();
    const more = items.length > 1;
    section.setAttribute('role', 'region');
    section.setAttribute('aria-roledescription', 'carousel');
    section.classList.add('stories-ready');
    navigation.hidden = !more;
    before.hidden = after.hidden = !more;
    function clearTimer() { if (timer !== null) clearTimeout(timer); timer = null; }
    function schedule() {
      clearTimer();
      if (!more || userStopped || reduced.matches || pauses.size) return;
      timer = setTimeout(() => { timer = null; display(active+1, false); }, 6000);
    }
    function updatePlay() {
      const stopped = userStopped || reduced.matches;
      play.disabled = reduced.matches || !more;
      play.setAttribute('aria-pressed', String(stopped));
      play.setAttribute('aria-label', stopped ? 'Resume automatic testimonials' : 'Pause automatic testimonials');
      play.firstElementChild.textContent = stopped ? '▷' : 'Ⅱ';
      play.querySelector('.story-play-label').textContent = reduced.matches ? 'Motion off' : stopped ? 'Play' : 'Pause';
      play.title = reduced.matches ? 'Automatic movement is disabled for reduced motion' : '';
    }
    function updateWing(wing, index) {
      const item = items[index];
      wing.querySelector('.wing-label').textContent = item.placeholder === true ? 'Design preview' : 'Community feedback';
      wing.querySelector('p').textContent = item.quote;
    }
    function display(index, manual) {
      if (manual) userStopped = true;
      active = (index + items.length) % items.length;
      panels.forEach((panel, i) => {
        panel.classList.toggle('is-active', i === active);
        panel.setAttribute('aria-hidden', String(i !== active));
        dots[i].setAttribute('aria-pressed', String(i === active));
      });
      counter.textContent = String(active+1).padStart(2,'0')+' / '+String(items.length).padStart(2,'0');
      updateWing(before, (active-1+items.length)%items.length);
      updateWing(after, (active+1)%items.length);
      if (manual) announcement.textContent = 'Testimonial '+(active+1)+' of '+items.length+'. '+(isPreview ? 'Placeholder. ' : '')+items[active].quote+' '+items[active].attribution;
      updatePlay(); schedule();
    }
    function pause(reason, value) { if (value) pauses.add(reason); else pauses.delete(reason); schedule(); }
    previous.addEventListener('click', () => display(active-1, true));
    next.addEventListener('click', () => display(active+1, true));
    play.addEventListener('click', () => { userStopped = !userStopped; updatePlay(); schedule(); });
    section.addEventListener('mouseenter', () => pause('hover', true));
    section.addEventListener('mouseleave', () => pause('hover', false));
    section.addEventListener('focusin', () => pause('focus', true));
    section.addEventListener('focusout', event => { if (!section.contains(event.relatedTarget)) pause('focus', false); });
    navigation.addEventListener('keydown', event => {
      if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault();
      display(event.key === 'Home' ? 0 : event.key === 'End' ? items.length-1 : active+(event.key === 'ArrowRight' ? 1 : -1), true);
    });
    let touch = null;
    deck.addEventListener('touchstart', event => {
      if (event.touches.length === 1) { touch = {x:event.touches[0].clientX,y:event.touches[0].clientY}; pause('touch', true); }
    }, {passive:true});
    deck.addEventListener('touchend', event => {
      if (touch && event.changedTouches.length) {
        const dx = event.changedTouches[0].clientX-touch.x, dy = event.changedTouches[0].clientY-touch.y;
        if (Math.abs(dx)>45 && Math.abs(dx)>Math.abs(dy)*1.3) display(active+(dx<0 ? 1 : -1), true);
      }
      touch = null; pause('touch', false);
    }, {passive:true});
    deck.addEventListener('touchcancel', () => { touch = null; pause('touch', false); });
    document.addEventListener('visibilitychange', () => pause('hidden', document.hidden));
    reduced.addEventListener('change', () => { updatePlay(); schedule(); });
    window.addEventListener('pagehide', clearTimer);
    window.addEventListener('pageshow', schedule);
    if (document.hidden) pauses.add('hidden');
    if (section.matches(':hover')) pauses.add('hover');
    if (section.contains(document.activeElement)) pauses.add('focus');
    if ('IntersectionObserver' in window) {
      pauses.add('offscreen');
      const observer = new IntersectionObserver(entries => pause('offscreen', !entries[0].isIntersecting), {threshold:.15});
      observer.observe(section);
    }
    display(0, false);
  }
  async function load() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    let entries = preview;
    try {
      const response = await fetch('assets/content/testimonials.json', {signal:controller.signal, cache:'no-cache', credentials:'same-origin'});
      if (!response.ok) throw new Error('Content unavailable');
      entries = selectEntries(await response.json());
    } catch {
      // The labelled static preview is the only fallback, never fictional feedback.
      entries = preview;
    } finally { clearTimeout(timeout); }
    if (!entries.length) { section.hidden = true; return; }
    initialise(entries);
  }
  load();
});

/* VCE feature motion: set up before first paint where possible; no hidden content if unsupported. */
(function(){
  const section=document.querySelector('.vce-next');
  if(!section || !('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const obs=new IntersectionObserver(entries=>{
    if(entries[0].isIntersecting){section.classList.add('vce-in-view');obs.disconnect();}
  },{threshold:0.12,rootMargin:'0px 0px -25px 0px'});
  section.classList.add('vce-motion-ready');
  obs.observe(section);
})();
