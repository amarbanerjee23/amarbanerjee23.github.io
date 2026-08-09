(async () => {
  const body = document.body;
  body.classList.add('story-unfolding');

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

  document.querySelectorAll('.profile-visual img, .facilitator-photo > img').forEach(image => {
    image.src = 'headshot.png';
    image.removeAttribute('srcset');
    image.loading = image.closest('.premium-hero') ? 'eager' : 'lazy';
    image.decoding = 'async';
  });

  const decisionCard = document.querySelector('.decision-confidence-card');
  if (decisionCard && !decisionCard.querySelector('.academic-profile-mini')) {
    const profile = document.createElement('div');
    profile.className = 'academic-profile-mini';
    profile.innerHTML = '<img src="headshot.png" alt="Dr Amar Banerjee" width="116" height="116"><div><small>YOUR FACILITATOR</small><strong>Dr Amar Banerjee</strong></div>';
    decisionCard.prepend(profile);
  }

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

  const storyNav = document.querySelector('.story-nav');
  const siteHeader = document.querySelector('.site-header');
  if (storyNav && siteHeader) siteHeader.insertAdjacentElement('afterend', storyNav);

  const chapters = [...document.querySelectorAll('.story-layer')];
  const navLinks = [...document.querySelectorAll('.story-nav a')];
  if (!chapters.length || !navLinks.length) return;

  const tones = ['sky','mint','sun','lavender','coral','ice'];
  chapters.forEach((chapter, index) => {
    if (!chapter.matches('.premium-hero,.workshop-hero,.gallery-hero,.academic-hero')) {
      chapter.dataset.storyTone = tones[index % tones.length];
    }

    const nextChapter = chapters[index + 1];
    const nextLink = navLinks[index + 1];
    if (nextChapter && nextLink && !chapter.querySelector(':scope > .story-continue')) {
      const continuation = document.createElement('a');
      continuation.className = 'story-continue';
      continuation.href = `#${nextChapter.id}`;
      continuation.innerHTML = `<span><small>Continue the story</small><strong>${nextLink.querySelector('.story-nav-label')?.textContent || 'Next chapter'}</strong></span><span aria-hidden="true">→</span>`;
      continuation.addEventListener('click', event => {
        event.preventDefault();
        nextChapter.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
        history.replaceState(null, '', continuation.hash);
      });
      chapter.appendChild(continuation);
    }
  });

  const hero = chapters[0];
  if (hero && !document.querySelector('.story-start-map')) {
    const map = document.createElement('section');
    map.className = 'story-start-map';
    const visibleLinks = navLinks.slice(0, Math.min(navLinks.length, 6));
    map.innerHTML = `
      <div class="container story-start-map-shell">
        <div><small>Your path through this page</small><h2>Follow the story or jump directly to what matters.</h2></div>
        <div class="story-start-steps">
          ${visibleLinks.map((link, index) => `<a href="${link.getAttribute('href')}"><span>${String(index + 1).padStart(2,'0')}</span><strong>${link.querySelector('.story-nav-label')?.textContent || link.textContent}</strong></a>`).join('')}
        </div>
      </div>`;
    hero.insertAdjacentElement('afterend', map);
  }

  const syncCurrent = () => {
    const current = navLinks.findIndex(link => link.getAttribute('aria-current') === 'step');
    chapters.forEach((chapter, index) => chapter.classList.toggle('is-story-current', index === current));
  };
  syncCurrent();

  if (storyNav && 'MutationObserver' in window) {
    new MutationObserver(syncCurrent).observe(storyNav, { subtree:true, attributes:true, attributeFilter:['aria-current'] });
  }

  if (body.classList.contains('research-page')) {
    import('./research-supplement.js').catch(error => console.error('Research supplement failed to load', error));
  }
})();
