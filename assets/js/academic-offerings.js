(() => {
  const body = document.body;
  if (!body) return;

  const programs = [
    {
      number: '01',
      title: 'Innovation in Academia',
      audience: 'Faculty, research scholars, academic leaders and innovation cells',
      description: 'A research-and-innovation program focused on identifying consequential problems, testing novelty, building stronger publication directions, recognising patent potential and connecting academic work with real relevance.',
      brochure: 'downloads/innovation-in-academia.pdf.b64',
      filename: 'Innovation-in-Academia.pdf',
      detail: 'workshops.html#research-excellence'
    },
    {
      number: '02',
      title: 'The Modern-Day Professional',
      audience: 'Undergraduate, postgraduate and early-career student cohorts',
      description: 'A future-readiness program that develops problem-finding, innovative thinking, communication, responsible AI judgement and the ability to translate academic work into credible professional value.',
      brochure: 'downloads/modern-day-professional.pdf.b64',
      filename: 'The-Modern-Day-Professional.pdf',
      detail: 'workshops.html#student-innovation'
    },
    {
      number: '03',
      title: 'Connecting Technology to Emotions',
      audience: 'Interdisciplinary students, faculty, design, AI and human-centred technology cohorts',
      description: 'A human-centred innovation program that uses trust, emotion, inclusion, ethics and lived experience as signals for discovering better technology problems and designing more meaningful solutions.',
      brochure: 'downloads/technology-to-emotions.pdf.b64',
      filename: 'Connecting-Technology-to-Emotions.pdf',
      detail: 'workshops.html#formats'
    },
    {
      number: '04',
      title: 'Institutional Innovation Partnership',
      audience: 'Vice-Chancellors, Principals, Deans, HoDs and institutional innovation leaders',
      description: 'A broader institutional journey that connects student innovation, research quality, publication ambition, patent thinking and follow-through into a visible capability-building pathway rather than a one-off event.',
      brochure: 'downloads/academic-innovation-partnership.pdf.b64',
      filename: 'Academic-Innovation-Partnership.pdf',
      detail: 'academic-partnerships.html'
    }
  ];

  const pageKind = body.classList.contains('academic-future-home') ? 'home'
    : body.classList.contains('academic-programs-page') ? 'programs'
      : body.classList.contains('profile-page') ? 'profile'
        : body.classList.contains('academic-future-institution') || body.classList.contains('academic-page') ? 'institution'
          : '';
  if (!pageKind || document.querySelector('.academic-offerings')) return;

  const section = document.createElement('section');
  section.className = 'section academic-offerings';
  section.id = 'four-programs';
  section.innerHTML = `
    <div class="container">
      <div class="section-head reveal visible">
        <span>Four academic innovation programs</span>
        <h2>Different starting points. One goal: students who can think, research and invent with greater independence.</h2>
        <p>Institutions can begin with a focused student or faculty program, or connect multiple cohorts through a broader institutional innovation partnership. Each option has a downloadable brochure for internal discussion.</p>
      </div>
      <div class="academic-offerings-grid">
        ${programs.map(program => `
          <article class="academic-offering-card reveal visible">
            <small>${program.number} · Academic innovation program</small>
            <h3>${program.title}</h3>
            <p>${program.description}</p>
            <span class="offering-audience"><strong>Best for:</strong> ${program.audience}</span>
            <div class="academic-offering-actions">
              <a class="btn primary brochure-download" href="${program.brochure}" data-filename="${program.filename}">Download brochure</a>
              <a class="btn secondary" href="${program.detail}">Explore context</a>
            </div>
          </article>`).join('')}
      </div>
      <div class="academic-offerings-note reveal visible">
        <strong>Research ambition is built in.</strong>
        <span>For research-oriented cohorts, the emphasis is not merely on completing a paper. Students learn to identify important and timely problems, study what strong venues expect, test novelty, design evidence and make better paper-versus-patent decisions.</span>
      </div>
    </div>`;

  const insertionTarget = pageKind === 'home'
    ? document.querySelector('#institutional')
    : pageKind === 'programs'
      ? document.querySelector('#student-innovation')
      : pageKind === 'profile'
        ? document.querySelector('#academic-work')
        : document.querySelector('#programs');

  if (insertionTarget) insertionTarget.insertAdjacentElement('beforebegin', section);
  else document.querySelector('main')?.appendChild(section);

  const downloadBase64Pdf = async link => {
    if (link.getAttribute('aria-busy') === 'true') return;
    const original = link.textContent;
    link.setAttribute('aria-busy', 'true');
    link.textContent = 'Preparing PDF…';
    try {
      const response = await fetch(link.href, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Brochure could not be loaded (${response.status})`);
      const encoded = (await response.text()).replace(/\s/g, '');
      const binary = atob(encoded);
      const bytes = new Uint8Array(binary.length);
      for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
      const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = link.dataset.filename || 'Academic-Innovation-Program.pdf';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1800);
    } catch (error) {
      console.error(error);
      link.textContent = 'Download unavailable — retry';
      setTimeout(() => { link.textContent = original; }, 2400);
    } finally {
      link.removeAttribute('aria-busy');
      if (!link.textContent.includes('unavailable')) link.textContent = original;
    }
  };

  section.querySelectorAll('.brochure-download').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      downloadBase64Pdf(link);
    });
  });
})();
