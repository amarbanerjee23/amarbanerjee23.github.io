import config from './analytics-config.js';

(() => {
  const privacyPage = config.privacyPage || 'privacy.html';
  document.querySelectorAll('footer .social').forEach(container => {
    if (container.querySelector('a[href="privacy.html"]')) return;
    const link = document.createElement('a');
    link.href = privacyPage;
    link.textContent = 'Privacy';
    container.appendChild(link);
  });

  if (!config.enabled || !String(config.endpoint || '').trim()) return;
  import('./analytics.js').catch(error => console.error('Analytics client failed to load', error));
})();
