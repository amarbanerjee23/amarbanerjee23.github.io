(async () => {
  const body = document.body;
  body.classList.add('story-unfolding', 'ux-calm');

  ['/assets/css/sticky-nav-fix.css', '/assets/css/academic-offerings.css', '/assets/css/hero-signal-cards.css', '/assets/css/reading-comfort.css?v=20260822-contrast5'].forEach(href => {
    const existing = document.querySelector(`link[href="${href}"]`);
    if (existing) {
      if (href.includes('reading-comfort')) document.head.append(existing);
      return;
    }
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = href;
    document.head.appendChild(stylesheet);
  });

  const bindPdfDownload = link => {
    if (!link || link.dataset.dynamicPdfBound === 'true') return;
    link.dataset.dynamicPdfBound = 'true';
    link.addEventListener('click', async event => {
      event.preventDefault();
      event.stopPropagation();
      if (link.getAttribute('aria-busy') === 'true') return;

      const originalText = link.textContent;
      const complexContent = link.childElementCount > 0;
      link.setAttribute('aria-busy', 'true');
      if (complexContent) link.classList.add('is-preparing');
      else link.textContent = 'Preparing PDF…';

      try {
        const response = await fetch(link.href);
        if (!response.ok) throw new Error(`PDF source could not be loaded (${response.status})`);

        let bytes;
        if (link.href.endsWith('.b64')) {
          const binary = atob((await response.text()).replace(/\s/g, ''));
          bytes = new Uint8Array(binary.length);
          for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
        } else {
          bytes = new Uint8Array(await response.arrayBuffer());
        }

        const objectUrl = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
        const download = document.createElement('a');
        download.href = objectUrl;
        download.download = link.dataset.filename || 'brochure.pdf';
        document.body.appendChild(download);
        download.click();
        download.remove();
        setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
      } catch (error) {
        console.error(error);
        link.classList.add('download-error');
        setTimeout(() => link.classList.remove('download-error'), 2200);
      } finally {
        link.removeAttribute('aria-busy');
        link.classList.remove('is-preparing');
        if (!complexContent) link.textContent = originalText;
      }
    });
  };

  /* Use the committed portrait everywhere without swapping to an external avatar. */
  document.querySelectorAll('.profile-visual img, .facilitator-photo > img').forEach(image => {
    image.src = '/assets/media/portraits/headshot.png';
    image.removeAttribute('srcset');
    image.loading = image.closest('.premium-hero,.workshop-hero,.academic-hero') ? 'eager' : 'lazy';
    image.decoding = 'async';
  });

  const decisionCard = document.querySelector('.decision-confidence-card');
  if (decisionCard && !decisionCard.querySelector('.academic-profile-mini')) {
    const profile = document.createElement('div');
    profile.className = 'academic-profile-mini';
    profile.innerHTML = '<img src="/assets/media/portraits/headshot.png" alt="Dr Amar Banerjee" width="116" height="116"><div><small>YOUR FACILITATOR</small><strong>Dr Amar Banerjee</strong></div>';
    decisionCard.prepend(profile);
  }

  /* Keep brochure access progressive: surface it only when the generated asset exists. */
  const partnershipBrochure = 'downloads/academic-innovation-partnership.pdf.b64';
  let partnershipBrochureAvailable = false;
  try {
    const response = await fetch(partnershipBrochure, { method: 'HEAD', cache: 'no-store' });
    partnershipBrochureAvailable = response.ok;
  } catch (_) {
    partnershipBrochureAvailable = false;
  }

  const downloadGrid = document.querySelector('#downloads .download-grid');
  if (partnershipBrochureAvailable && downloadGrid && !downloadGrid.querySelector('[data-academic-partnership-brochure]')) {
    const card = document.createElement('article');
    card.className = 'download-card gold reveal visible';
    card.dataset.academicPartnershipBrochure = '';
    card.innerHTML = `
      <span>Institutional decision brief</span>
      <h3>Academic Innovation Partnership</h3>
      <p>Research, IP, student readiness and a managed institutional innovation pathway.</p>
      <a class="btn primary pdf-download" href="${partnershipBrochure}" data-filename="Academic-Innovation-Partnership.pdf">Download PDF</a>`;
    downloadGrid.prepend(card);
    bindPdfDownload(card.querySelector('.pdf-download'));
  }

  const evidenceWall = document.querySelector('.academic-page .evidence-wall');
  if (partnershipBrochureAvailable && evidenceWall && !evidenceWall.querySelector('[data-partnership-brochure]')) {
    const card = document.createElement('a');
    card.className = 'evidence-card reveal visible pdf-download';
    card.dataset.partnershipBrochure = '';
    card.href = partnershipBrochure;
    card.dataset.filename = 'Academic-Innovation-Partnership.pdf';
    card.innerHTML = '<span class="evidence-index">05</span><small>LATEX DECISION BRIEF</small><h3>Academic Innovation Partnership</h3><p>A four-page leadership brochure aligned with the institutional story and engagement model.</p><b>Download brochure →</b>';
    evidenceWall.appendChild(card);
    bindPdfDownload(card);
  }

  /* Keep one secondary navigation layer directly beneath the primary header. */
  const storyNav = document.querySelector('.story-nav');
  const siteHeader = document.querySelector('.site-header');
  if (storyNav && siteHeader) siteHeader.insertAdjacentElement('afterend', storyNav);

  /* Measure the real rendered header instead of relying on hard-coded breakpoints. */
  const syncStickyOffset = () => {
    if (!siteHeader) return;
    const height = Math.ceil(siteHeader.getBoundingClientRect().height);
    if (height > 0) document.documentElement.style.setProperty('--live-header-height', `${height}px`);
  };
  syncStickyOffset();
  requestAnimationFrame(syncStickyOffset);
  addEventListener('resize', syncStickyOffset, { passive: true });
  addEventListener('orientationchange', syncStickyOffset, { passive: true });
  if (siteHeader && 'ResizeObserver' in window) {
    new ResizeObserver(syncStickyOffset).observe(siteHeader);
  }

  /* Older cached story layers are explicitly neutralised by ux-calm-v2.css. */
  document.querySelectorAll('.story-layer').forEach((chapter, index) => {
    chapter.dataset.surface = index % 2 === 0 ? 'plain' : 'soft';
  });

  if (body.classList.contains('research-page')) {
    import('/assets/js/research-supplement.js').catch(error => console.error('Research supplement failed to load', error));
  }
})();

const featureImports = [
  import('/assets/js/academic-offerings.js').catch(error => console.error('Academic offerings failed to load', error)),
  import('/assets/js/contact-intake.js').catch(error => console.error('Contact form failed to load', error)),
  import('/assets/js/analytics-bootstrap.js').catch(error => console.error('Analytics bootstrap failed to load', error)),
  import('/assets/js/trust-conversion.js').catch(error => console.error('Trust and conversion layer failed to load', error)),
  import('/assets/js/evidence-expansion.js').catch(error => console.error('Additional evidence layer failed to load', error))
];

Promise.all(featureImports).finally(() => {
  const readability = document.querySelector('link[href*="reading-comfort"]');
  if (readability) document.head.append(readability);
});
