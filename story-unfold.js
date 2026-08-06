(() => {
  const body = document.body;
  body.classList.add('story-unfolding');

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
    profile.innerHTML = '<img src="headshot.png" alt="Dr. Amar Banerjee" width="116" height="116"><div><small>YOUR FACILITATOR</small><strong>Dr. Amar Banerjee</strong></div>';
    decisionCard.prepend(profile);
  }

  const downloadGrid = document.querySelector('#downloads .download-grid');
  if (downloadGrid && !downloadGrid.querySelector('[data-academic-partnership-brochure]')) {
    const card = document.createElement('article');
    card.className = 'download-card gold reveal visible';
    card.dataset.academicPartnershipBrochure = '';
    card.innerHTML = `
      <span>Institutional decision brief</span>
      <h3>Academic Innovation Partnership</h3>
      <p>Research, IP, student readiness and a managed institutional innovation pathway.</p>
      <a class="btn primary pdf-download" href="downloads/academic-innovation-partnership.pdf.b64" data-filename="Academic-Innovation-Partnership.pdf">Download PDF</a>`;
    downloadGrid.prepend(card);
  }

  const evidenceWall = document.querySelector('.academic-page .evidence-wall');
  if (evidenceWall && !evidenceWall.querySelector('[data-partnership-brochure]')) {
    const card = document.createElement('a');
    card.className = 'evidence-card reveal visible pdf-download';
    card.dataset.partnershipBrochure = '';
    card.href = 'downloads/academic-innovation-partnership.pdf.b64';
    card.dataset.filename = 'Academic-Innovation-Partnership.pdf';
    card.innerHTML = '<span class="evidence-index">05</span><small>LATEX DECISION BRIEF</small><h3>Academic Innovation Partnership</h3><p>A four-page leadership brochure aligned with the institutional story and engagement model.</p><b>Download brochure →</b>';
    evidenceWall.appendChild(card);
  }

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

  const nav = document.querySelector('.story-nav');
  if (nav && 'MutationObserver' in window) {
    new MutationObserver(syncCurrent).observe(nav, { subtree:true, attributes:true, attributeFilter:['aria-current'] });
  }
})();
