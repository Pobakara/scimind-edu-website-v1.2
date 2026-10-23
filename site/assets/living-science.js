/* Living Science hero: bounded scroll transforms, gentle subject rail cycling, motion control.
   Shared site.js still owns the menu, forms and header scroll state. */
(() => {
  'use strict';
  const hero = document.querySelector('.living-hero');
  if (!hero) return;
  const art = hero.querySelector('.ls-art');
  const svg = hero.querySelector('.hx-sculpture');
  const intro = document.querySelector('.living-intro');
  const control = hero.querySelector('.ls-motion');
  const railLinks = [...hero.querySelectorAll('.hx-rail a')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1000px)');
  let paused = false, frame = 0, visible = true, railHold = false, railIndex = 0, railTimer = 0;
  const clamp = n => Math.min(1, Math.max(0, n));
  const still = () => reduced.matches || paused;

  /* Hero-to-Welcome: scroll-synchronised handoff without scroll hijacking.
     Keep content available even if animation is paused or JS is disabled. */
  function draw() {
    frame = 0;
    const rect = hero.getBoundingClientRect();
    const mobile = innerWidth <= 760;
    const progress = still() ? 0 : clamp((-rect.top) / Math.max(1, rect.height * .78));
    const ease = t => t * t * (3 - 2 * t);
    const p = ease(progress);
    const wash = ease(clamp((progress - .15) / .75));
    hero.style.setProperty('--ls-text-y', `${mobile ? 0 : -p * 55}px`);
    hero.style.setProperty('--ls-art-y', `${mobile ? 0 : p * 65}px`);
    hero.style.setProperty('--ls-scale', String(1 - p * .09));
    hero.style.setProperty('--hx-image-y', `${mobile ? 0 : -p * 32}px`);
    hero.style.setProperty('--hx-image-scale', String(1 - p * .09));
    hero.style.setProperty('--sc-copy-opacity', String(1 - p * .72));
    hero.style.setProperty('--sc-art-opacity', String(1 - p * .63));
    hero.style.setProperty('--sc-lines-y', `${p * 100}px`);
    hero.style.setProperty('--sc-transition-wash', String(still() ? 0 : wash));
    hero.style.setProperty('--sc-wave-x', `${still() ? 0 : p * 12}px`);
    if (intro) {
      const top = intro.getBoundingClientRect().top;
      const entry = ease(clamp((innerHeight * .95 - top) / Math.max(1,innerHeight * .43)));
      intro.style.setProperty('--ls-intro-y', `${still() || mobile ? 0 : (1 - entry) * 44}px`);
      intro.style.setProperty('--sc-intro-opacity', String(still() || mobile ? 1 : .82 + entry * .18));
    }
    if (still() || !fine.matches) {
      art.style.setProperty('--ls-pointer-x', '0px');
      art.style.setProperty('--ls-pointer-y', '0px');
    }
  }
  const schedule = () => { if (!frame) frame = requestAnimationFrame(draw); };

  /* Subject rail: highlight moves softly every 5s; stops on hover/focus */
  function setActive(i) {
    railIndex = (i + railLinks.length) % railLinks.length;
    railLinks.forEach((a, n) => a.classList.toggle('is-active', n === railIndex));
  }
  function railLoop() {
    clearInterval(railTimer);
    if (still() || !visible || document.hidden || railLinks.length < 2) return;
    railTimer = setInterval(() => { if (!railHold) setActive(railIndex + 1); }, 5000);
  }
  railLinks.forEach((a, n) => {
    a.addEventListener('pointerenter', () => { railHold = true; setActive(n); });
    a.addEventListener('pointerleave', () => { railHold = false; });
    a.addEventListener('focus', () => { railHold = true; setActive(n); });
    a.addEventListener('blur', () => { railHold = false; });
  });

  function state() {
    hero.classList.toggle('ls-paused', still());
    hero.classList.toggle('ls-offscreen', !visible || document.hidden);
    /* SVG orbit electrons use SMIL; pause them alongside CSS loops */
    if (svg && svg.pauseAnimations) {
      (still() || !visible || document.hidden) ? svg.pauseAnimations() : svg.unpauseAnimations();
    }
    if (control) {
      control.hidden = reduced.matches;
      control.textContent = paused ? 'Resume motion' : 'Pause motion';
      control.setAttribute('aria-pressed', String(paused));
    }
    railLoop();
    schedule();
  }

  if (control) control.addEventListener('click', () => { paused = !paused; state(); });
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  addEventListener('pageshow', schedule);
  reduced.addEventListener('change', state);
  fine.addEventListener('change', schedule);
  document.addEventListener('visibilitychange', state);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(e => { visible = e[0].isIntersecting; state(); }, { rootMargin: '80px' }).observe(hero);
  }

  /* Pointer: subtle depth on large screens only */
  art.addEventListener('pointermove', e => {
    if (!fine.matches || still()) return;
    const b = art.getBoundingClientRect();
    art.style.setProperty('--ls-pointer-x', `${((e.clientX - b.left) / b.width - .5) * 12}px`);
    art.style.setProperty('--ls-pointer-y', `${((e.clientY - b.top) / b.height - .5) * 9}px`);
  }, { passive: true });
  art.addEventListener('pointerleave', () => {
    art.style.setProperty('--ls-pointer-x', '0px');
    art.style.setProperty('--ls-pointer-y', '0px');
  });

  /* Smooth scroll cue (respects reduced motion) */
  const cue = hero.querySelector('.hx-scroll');
  if (cue) cue.addEventListener('click', e => {
    const target = document.querySelector('#welcome');
    if (!target) return;
    e.preventDefault();
    const y = target.getBoundingClientRect().top + scrollY - 80;
    scrollTo({ top: y, behavior: reduced.matches ? 'auto' : 'smooth' });
  });

  /* Menu dismissal (kept from previous version) */
  const menu = document.querySelector('.menu-toggle'), nav = document.querySelector('#navigation');
  if (menu && nav) {
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
        menu.setAttribute('aria-expanded', 'false'); nav.classList.remove('open'); menu.focus();
      }
    });
    document.addEventListener('click', e => {
      if (menu.getAttribute('aria-expanded') === 'true' && !nav.contains(e.target) && !menu.contains(e.target)) {
        menu.setAttribute('aria-expanded', 'false'); nav.classList.remove('open');
      }
    });
  }
  state();
})();

/* Homepage programme cards: subtle one-time stagger. The cards remain fully accessible
   and visible without JS or when motion reduction is requested. */
(() => {
  const grid = document.querySelector('.home-programmes .program-grid');
  if (!grid || !('IntersectionObserver' in window)) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const cards = Array.from(grid.querySelectorAll('.program-card'));
  if (reduce.matches) return;
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.disconnect();
      cards.forEach((card, index) => {
        if (card.contains(document.activeElement)) return;
        card.style.setProperty('--sc-card-delay', `${Math.min(index,5)*85}ms`);
        card.classList.add('sc-card-arrive');
        card.addEventListener('animationend', () => {
          card.classList.remove('sc-card-arrive');
          card.style.removeProperty('--sc-card-delay');
        }, {once:true});
      });
    }
  }, {threshold:.07,rootMargin:'0px 0px -30px 0px'});
  observer.observe(grid);
})();
