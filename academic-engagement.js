(() => {
  const page = document.body;
  if (!page.classList.contains('academic-page')) return;

  const content = {
    research: {
      kicker: 'RESEARCH AND IP',
      title: 'Turn publication activity into distinct, defensible contribution.',
      gap: 'Faculty expertise exists, but problem selection, novelty testing, IP decisions and industry pathways are not connected through one repeatable method.',
      program: "Innovation in Academia, shaped around the institution's research themes and strategic priorities.",
      outputs: 'Research problem portfolio, novelty and non-obviousness canvas, IP opportunity map and 30-day experiment plan.',
      link: 'workshops.html#innovation-academia',
      subject: 'Institutional Priority: Research and IP'
    },
    students: {
      kicker: 'STUDENT READINESS',
      title: 'Translate academic work into professional and employer value.',
      gap: 'Students may know tools and complete projects, but often struggle to frame problems, show contribution, exercise responsible AI judgement and communicate value.',
      program: 'The Modern-Day Professional, adapted to the student cohort, disciplines and placement priorities.',
      outputs: 'Capability map, employer-ready professional story, applied problem-solving output and 60-day readiness sprint.',
      link: 'workshops.html#modern-professional',
      subject: 'Institutional Priority: Student Readiness'
    },
    system: {
      kicker: 'INNOVATION SYSTEM',
      title: 'Move from isolated events to a managed opportunity pipeline.',
      gap: 'Innovation cells and departments conduct activities, but themes, selection criteria, owners, experiments and review points may not form one visible operating path.',
      program: 'A tailored institutional innovation lab combining opportunity mapping, prioritisation and action planning.',
      outputs: 'Institutional opportunity portfolio, prioritisation criteria, experiment backlog and 90-day leadership review plan.',
      link: 'academic-partnerships.html#mechanism',
      subject: 'Institutional Priority: Innovation System'
    }
  };

  const result = document.getElementById('diagnosis-result');
  const kicker = document.getElementById('diagnosis-kicker');
  const title = document.getElementById('diagnosis-title');
  const gap = document.getElementById('diagnosis-gap');
  const program = document.getElementById('diagnosis-program');
  const outputs = document.getElementById('diagnosis-outputs');
  const cta = document.getElementById('diagnosis-cta');
  const link = document.getElementById('diagnosis-link');
  const buttons = [...document.querySelectorAll('[data-diagnosis]')];

  const buildMailto = item => {
    const body = [
      'Institution:',
      'Role:',
      `Selected priority: ${item.kicker.replace(/\b\w/g, letter => letter.toUpperCase())}`,
      'What would success look like in 6 months:'
    ].join('\n');
    return `mailto:amarbanerjee23@gmail.com?subject=${encodeURIComponent(item.subject)}&body=${encodeURIComponent(body)}`;
  };

  const select = key => {
    const item = content[key];
    if (!item) return;
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.diagnosis === key)));
    result?.classList.remove('is-changing');
    void result?.offsetWidth;
    result?.classList.add('is-changing');

    if (kicker) kicker.textContent = item.kicker;
    if (title) title.textContent = item.title;
    if (gap) gap.textContent = item.gap;
    if (program) program.textContent = item.program;
    if (outputs) outputs.textContent = item.outputs;
    if (cta) cta.href = buildMailto(item);
    if (link) link.href = item.link;
  };

  buttons.forEach(button => button.addEventListener('click', () => select(button.dataset.diagnosis)));

  const evidence = document.getElementById('evidence');
  if ('IntersectionObserver' in window && evidence) {
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      page.classList.add('evidence-seen');
      observer.disconnect();
    }, { threshold: .35 });
    observer.observe(evidence);
  }

  const resourceDownload = document.querySelector('.evidence-card.pdf-download');
  resourceDownload?.addEventListener('click', async event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    const label = resourceDownload.querySelector('b');
    const originalLabel = label?.textContent || '';
    resourceDownload.setAttribute('aria-busy', 'true');
    if (label) label.textContent = 'Preparing the canvas…';
    try {
      const response = await fetch(resourceDownload.href);
      if (!response.ok) throw new Error(`Canvas source could not be loaded (${response.status})`);
      const binary = atob((await response.text()).replace(/\s/g, ''));
      const bytes = new Uint8Array(binary.length);
      for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
      const objectUrl = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
      const download = document.createElement('a');
      download.href = objectUrl;
      download.download = resourceDownload.dataset.filename || 'Institutional-Innovation-Readiness-Canvas.pdf';
      document.body.appendChild(download);
      download.click();
      download.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
    } catch (error) {
      console.error(error);
      if (label) label.textContent = 'Please try the download again';
      setTimeout(() => { if (label) label.textContent = originalLabel; }, 2400);
    } finally {
      resourceDownload.removeAttribute('aria-busy');
      if (label && label.textContent !== 'Please try the download again') label.textContent = originalLabel;
    }
  }, true);

  document.querySelectorAll('.academic-primary-cta').forEach(link => {
    link.addEventListener('click', () => {
      try {
        sessionStorage.setItem('academic-conversation-source', location.hash || 'academic-opening');
      } catch (_) {}
    });
  });
})();