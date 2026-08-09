(() => {
  if (!document.body) return;

  if (!document.querySelector('link[href="/assets/css/evidence-expansion.css"]')) {
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = '/assets/css/evidence-expansion.css';
    document.head.appendChild(stylesheet);
  }

  const evidenceLinks = [
    'https://www.linkedin.com/feed/update/urn:li:activity:7268852145574006784/',
    'https://www.linkedin.com/feed/update/urn:li:activity:7380138629051891713/',
    'https://www.linkedin.com/feed/update/urn:li:activity:7230413268245217280/',
    'https://www.linkedin.com/feed/update/urn:li:activity:7248378394126471169/',
    'https://www.linkedin.com/feed/update/urn:li:activity:7244406386774753283/'
  ];

  const mount = () => {
    const section = document.getElementById('evidence');
    const container = section?.querySelector('.container');
    if (!container || container.querySelector('.tc-evidence-more')) return false;

    const more = document.createElement('div');
    more.className = 'tc-evidence-more';
    more.innerHTML = `
      <div class="tc-evidence-more-head">
        <div>
          <small>More public evidence</small>
          <h3>Additional academic and professional engagements</h3>
        </div>
        <p>These are additional LinkedIn posts selected as source evidence. Open the original post for the complete context, photographs and discussion.</p>
      </div>
      <div class="tc-evidence-link-grid">
        ${evidenceLinks.map((href, index) => `
          <a class="tc-evidence-link" href="${href}" target="_blank" rel="noopener" aria-label="Open selected LinkedIn evidence ${index + 4}">
            <span class="tc-evidence-link-number">${String(index + 4).padStart(2, '0')}</span>
            <span class="tc-evidence-link-copy"><small>Selected LinkedIn evidence</small><strong>Open original engagement</strong></span>
            <span class="tc-evidence-link-arrow" aria-hidden="true">↗</span>
          </a>`).join('')}
      </div>`;

    container.appendChild(more);
    return true;
  };

  if (mount()) return;

  const observer = new MutationObserver(() => {
    if (!mount()) return;
    observer.disconnect();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  setTimeout(() => observer.disconnect(), 8000);
})();
