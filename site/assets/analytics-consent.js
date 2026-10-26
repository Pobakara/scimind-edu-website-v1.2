(() => {
  'use strict';

  const measurementId = 'G-03MVZRBCM2';
  const preferenceKey = 'scimind-analytics-consent';
  const consent = {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    personalization_storage: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted'
  };
  let preference = null;
  let tagLoaded = false;
  let configured = false;
  let settingsButton = null;
  let returnFocus = false;
  let bannerStatus;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('consent', 'default', consent);
  window.gtag('set', 'ads_data_redaction', true);

  function readPreference() {
    try {
      const stored = window.localStorage.getItem(preferenceKey);
      return stored === 'accepted' || stored === 'rejected' ? stored : null;
    } catch {
      return null;
    }
  }

  function showStatus(message) {
    bannerStatus.textContent = message;
    bannerStatus.hidden = false;
  }

  function removeAnalyticsCookies() {
    const domains = [location.hostname];
    if (location.hostname === 'scimind.com.au' || location.hostname.endsWith('.scimind.com.au')) {
      domains.push('.scimind.com.au');
    }
    const names = document.cookie.split(';').map(cookie => cookie.trim().split('=')[0])
      .filter(name => name === '_ga' || name.startsWith('_ga_'));
    names.forEach(name => {
      document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
      domains.forEach(domain => {
        document.cookie = `${name}=; Max-Age=0; path=/; domain=${domain}; SameSite=Lax`;
      });
    });
  }

  function pageLocation(url = location.href) {
    const page = new URL(url);
    page.search = '';
    page.hash = '';
    return page.href;
  }

  function loadGoogleTag() {
    if (tagLoaded) return;
    tagLoaded = true;
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    script.onerror = () => console.warn('Google Analytics could not be loaded.');
    document.head.append(script);
    window.gtag('js', new Date());
    const pageParameters = { send_page_view: true, page_location: pageLocation() };
    if (document.referrer) pageParameters.page_referrer = pageLocation(document.referrer);
    window.gtag('config', measurementId, pageParameters);
    configured = true;
  }

  function applyPreference(value) {
    preference = value;
    window.gtag('consent', 'update', {
      ...consent,
      analytics_storage: value === 'accepted' ? 'granted' : 'denied'
    });
    if (value === 'accepted') loadGoogleTag();
    else removeAnalyticsCookies();
  }

  const banner = document.createElement('section');
  banner.id = 'sm-analytics-banner';
  banner.className = 'sm-analytics-banner';
  banner.setAttribute('aria-labelledby', 'sm-analytics-title');
  banner.setAttribute('aria-label', 'Analytics cookie preferences');
  banner.hidden = true;

  const bannerContent = document.createElement('div');
  bannerContent.className = 'sm-analytics-content';
  const heading = document.createElement('h2');
  heading.id = 'sm-analytics-title';
  heading.textContent = 'Your privacy matters';
  const description = document.createElement('p');
  description.textContent = 'Allow optional Google Analytics to help us understand how visitors use the site. Analytics stays off unless you choose to accept.';
  const privacyLink = document.createElement('a');
  privacyLink.href = '/privacy#analytics';
  privacyLink.textContent = 'Learn more';
  description.append(' ', privacyLink);
  bannerStatus = document.createElement('p');
  bannerStatus.className = 'sm-analytics-status';
  bannerStatus.setAttribute('role', 'status');
  bannerStatus.hidden = true;
  bannerContent.append(heading, description, bannerStatus);

  const actions = document.createElement('div');
  actions.className = 'sm-analytics-actions';
  const acceptButton = document.createElement('button');
  acceptButton.type = 'button';
  acceptButton.className = 'sm-analytics-choice';
  acceptButton.textContent = 'Accept analytics';
  const rejectButton = document.createElement('button');
  rejectButton.type = 'button';
  rejectButton.className = 'sm-analytics-choice';
  rejectButton.textContent = 'Reject analytics';
  actions.append(rejectButton, acceptButton);
  banner.append(bannerContent, actions);
  document.body.append(banner);

  function openPreferences(fromSettings = false) {
    banner.hidden = false;
    bannerStatus.hidden = true;
    if (settingsButton) settingsButton.setAttribute('aria-expanded', 'true');
    returnFocus = fromSettings;
    if (fromSettings) acceptButton.focus();
  }

  function choose(value) {
    try {
      window.localStorage.setItem(preferenceKey, value);
    } catch {
      if (value === 'rejected') applyPreference('rejected');
      showStatus(value === 'rejected'
        ? 'Analytics is disabled for this visit, but we could not save your choice across pages. Please try again to save it.'
        : 'We could not save your choice in this browser. Analytics has not been enabled; please try again.');
      return;
    }
    applyPreference(value);
    banner.hidden = true;
    if (settingsButton) settingsButton.setAttribute('aria-expanded', 'false');
    if (returnFocus && settingsButton) settingsButton.focus();
    returnFocus = false;
  }

  acceptButton.addEventListener('click', () => choose('accepted'));
  rejectButton.addEventListener('click', () => choose('rejected'));

  const quickLinks = document.querySelector('.site-footer nav[aria-label="Footer quick links"] ul');
  if (quickLinks) {
    const item = document.createElement('li');
    settingsButton = document.createElement('button');
    settingsButton.type = 'button';
    settingsButton.className = 'sm-cookie-settings';
    settingsButton.textContent = 'Cookie settings';
    settingsButton.setAttribute('aria-controls', banner.id);
    settingsButton.setAttribute('aria-expanded', 'false');
    settingsButton.addEventListener('click', () => openPreferences(true));
    item.append(settingsButton);
    quickLinks.append(item);
  }

  window.SciMindAnalytics = Object.freeze({
    generateLead(formType) {
      if (preference !== 'accepted' || !configured || !['contact', 'quick_enquiry'].includes(formType)) return;
      window.gtag('event', 'generate_lead', {
        form_type: formType,
        page_location: pageLocation()
      });
    }
  });

  preference = readPreference();
  if (preference) applyPreference(preference);
  else openPreferences();
})();
