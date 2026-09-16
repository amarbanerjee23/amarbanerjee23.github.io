import config from '/assets/js/analytics-config.js';

(() => {
  const endpoint = String(config.endpoint || '').trim();
  if (!config.enabled || !endpoint) return;

  const consentKey = config.consentStorageKey;
  const visitorKey = config.visitorStorageKey;
  const sessionKey = config.sessionStorageKey;
  const privacyPage = config.privacyPage || 'privacy.html';

  const safeStorage = (storage, action, key, value) => {
    try {
      if (action === 'get') return storage.getItem(key);
      if (action === 'set') storage.setItem(key, value);
      if (action === 'remove') storage.removeItem(key);
    } catch (_) {}
    return null;
  };

  const getConsent = () => safeStorage(localStorage, 'get', consentKey);
  const randomId = prefix => `${prefix}_${crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(36).slice(2)}`}`;

  const getVisitorId = () => {
    let id = safeStorage(localStorage, 'get', visitorKey);
    if (!id) {
      id = randomId('v');
      safeStorage(localStorage, 'set', visitorKey, id);
    }
    return id;
  };

  const getSessionId = () => {
    let id = safeStorage(sessionStorage, 'get', sessionKey);
    if (!id) {
      id = randomId('s');
      safeStorage(sessionStorage, 'set', sessionKey, id);
    }
    return id;
  };

  const referrerDomain = () => {
    if (!document.referrer) return '';
    try { return new URL(document.referrer).hostname.replace(/^www\./, ''); }
    catch (_) { return ''; }
  };

  const deviceClass = () => {
    const width = Math.max(screen.width || 0, innerWidth || 0);
    if (width < 768) return 'mobile';
    if (width < 1100) return 'tablet';
    return 'desktop';
  };

  const browserFamily = () => {
    const ua = navigator.userAgent;
    if (/Edg\//.test(ua)) return 'Edge';
    if (/OPR\//.test(ua)) return 'Opera';
    if (/Chrome\//.test(ua)) return 'Chrome';
    if (/Firefox\//.test(ua)) return 'Firefox';
    if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) return 'Safari';
    return 'Other';
  };

  const osFamily = () => {
    const ua = navigator.userAgent;
    if (/Windows/.test(ua)) return 'Windows';
    if (/Mac OS X/.test(ua) && !/iPhone|iPad/.test(ua)) return 'macOS';
    if (/Android/.test(ua)) return 'Android';
    if (/iPhone|iPad/.test(ua)) return 'iOS/iPadOS';
    if (/Linux/.test(ua)) return 'Linux';
    return 'Other';
  };

  let firstEventSent = false;
  const send = async (eventType, target = '', extra = {}) => {
    if (getConsent() !== 'allow') return;
    const payload = {
      event_type: eventType,
      target: String(target || '').slice(0, 180),
      page: location.pathname || '/',
      title: document.title.slice(0, 180),
      referrer_domain: referrerDomain().slice(0, 120),
      visitor_id: getVisitorId(),
      session_id: getSessionId(),
      device: deviceClass(),
      browser: browserFamily(),
      os: osFamily(),
      language: String(navigator.language || '').slice(0, 24),
      returning_hint: firstEventSent ? 1 : 0,
      ...extra
    };
    firstEventSent = true;

    try {
      // Analytics never needs third-party cookies or HTTP authentication. Using
      // fetch with credentials omitted avoids credentialed cross-origin requests.
      // keepalive preserves delivery for navigations without sendBeacon's
      // credentialed CORS behaviour.
      await fetch(endpoint, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (_) {}
  };

  const addPrivacyLink = () => {
    document.querySelectorAll('footer .social').forEach(container => {
      if (container.querySelector('a[href="privacy.html"]')) return;
      const link = document.createElement('a');
      link.href = privacyPage;
      link.textContent = 'Privacy';
      container.appendChild(link);
    });
  };

  const makeBanner = () => {
    if (getConsent() || document.querySelector('.analytics-consent')) return;
    const banner = document.createElement('aside');
    banner.className = 'analytics-consent';
    banner.setAttribute('aria-label', 'Anonymous analytics choice');
    banner.setAttribute('role', 'region');
    banner.innerHTML = `
      <div>
        <strong>Optional anonymous analytics</strong>
        <p>Help improve the site with anonymous usage data. No raw IP address or Google identity is stored.</p>
      </div>
      <div class="analytics-consent-actions">
        <button type="button" data-analytics-choice="allow">Allow anonymous analytics</button>
        <button type="button" data-analytics-choice="deny">No thanks</button>
        <a href="${privacyPage}">Details</a>
      </div>`;
    document.body.appendChild(banner);

    banner.querySelector('[data-analytics-choice="allow"]')?.addEventListener('click', () => {
      safeStorage(localStorage, 'set', consentKey, 'allow');
      banner.remove();
      send('page_view', location.pathname);
    });
    banner.querySelector('[data-analytics-choice="deny"]')?.addEventListener('click', () => {
      safeStorage(localStorage, 'set', consentKey, 'deny');
      safeStorage(localStorage, 'remove', visitorKey);
      safeStorage(sessionStorage, 'remove', sessionKey);
      banner.remove();
    });
  };

  const injectStyles = () => {
    if (document.getElementById('analytics-consent-style')) return;
    const style = document.createElement('style');
    style.id = 'analytics-consent-style';
    style.textContent = `
      .analytics-consent{position:fixed;left:16px;right:16px;bottom:16px;z-index:10000;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:18px;align-items:center;max-width:820px;margin:auto;padding:14px 16px;border:1px solid var(--editorial-line,#d4d9ce);border-radius:0;background:var(--editorial-paper,#fff);color:var(--editorial-ink,#102a20);box-shadow:0 12px 34px rgba(16,42,32,.12)}
      body .analytics-consent strong{font-size:13px;color:var(--editorial-ink,#102a20)!important}body .analytics-consent p{margin:4px 0 0;max-width:62ch;color:var(--editorial-muted,#5c7167)!important;font-size:10px;line-height:1.5}
      .analytics-consent-actions{display:flex;gap:7px;align-items:center;flex-wrap:wrap;justify-content:flex-end}.analytics-consent button,.analytics-consent a{min-height:36px;padding:8px 11px;border-radius:0;font:inherit;font-size:10px;font-weight:700;cursor:pointer}.analytics-consent button:first-child{border:1px solid var(--editorial-green,#075f3b);background:var(--editorial-green,#075f3b);color:var(--btn-primary-fg,#fff)!important}.analytics-consent button:nth-child(2){border:1px solid var(--editorial-line,#d4d9ce);background:transparent;color:var(--editorial-ink,#102a20)!important}.analytics-consent a{display:inline-flex;align-items:center;color:var(--editorial-muted,#5c7167)!important;text-decoration:underline;text-underline-offset:3px}
      @media(max-width:720px){.analytics-consent{grid-template-columns:1fr;bottom:8px;left:8px;right:8px;gap:12px;padding:13px}.analytics-consent-actions{justify-content:flex-start}.analytics-consent button,.analytics-consent a{min-height:34px}}
    `;
    document.head.appendChild(style);
  };

  const bindClicks = () => {
    document.addEventListener('click', event => {
      const link = event.target.closest('a,button');
      if (!link) return;
      const text = (link.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 100);
      const href = link.getAttribute('href') || '';

      if (link.classList.contains('pdf-download') || /\.pdf(?:\.b64)?$/i.test(href)) {
        send('download', text || href, { href: href.slice(0, 180) });
        return;
      }
      if (/mailto:/i.test(href)) {
        send('contact_click', text || 'email', { href: 'mailto' });
        return;
      }
      if (/linkedin\.com|orcid\.org|github\.com/i.test(href)) {
        send('external_evidence_click', text || href, { href: href.slice(0, 180) });
        return;
      }
      if (link.matches('[data-diagnosis]')) {
        send('diagnosis_choice', link.dataset.diagnosis || text);
        return;
      }
      if (link.matches('.academic-primary-cta,.story-continue,.story-next')) {
        send('cta_click', text || href, { href: href.slice(0, 180) });
      }
    }, { passive: true });
  };

  const observeSections = () => {
    if (!('IntersectionObserver' in window)) return;
    const seen = new Set();
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting || entry.intersectionRatio < .5) return;
        const id = entry.target.id;
        if (!id || seen.has(id)) return;
        seen.add(id);
        send('section_view', id);
      });
    }, { threshold: [.5] });
    document.querySelectorAll('main section[id]').forEach(section => observer.observe(section));
  };

  addPrivacyLink();
  injectStyles();
  bindClicks();
  observeSections();

  if (getConsent() === 'allow') send('page_view', location.pathname);
  else if (!getConsent()) makeBanner();
})();