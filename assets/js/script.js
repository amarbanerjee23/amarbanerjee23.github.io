(() => {
  const root = document.documentElement;
  const body = document.body;

  [
    '/assets/css/ux-state-of-art.css',
    '/assets/css/ai-background.css',
    '/assets/css/story-ui.css',
    '/assets/css/academic-partnerships.css',
    '/assets/css/research-ip.css'
  ].forEach(href => {
    if (document.querySelector(`link[href="${href}"]`)) return;
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = href;
    document.head.appendChild(stylesheet);
  });

  const preferredName = 'Dr Amar Banerjee';
  const legacyName = 'Dr. Amar Banerjee';
  const replaceLegacyName = value => typeof value === 'string' ? value.split(legacyName).join(preferredName) : value;

  document.title = replaceLegacyName(document.title);
  document.querySelectorAll('meta[content]').forEach(meta => {
    if (meta.content.includes(legacyName)) meta.content = replaceLegacyName(meta.content);
  });
  document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
    if (script.textContent.includes(legacyName)) script.textContent = replaceLegacyName(script.textContent);
  });
  document.querySelectorAll('[aria-label],[alt],[title]').forEach(element => {
    ['aria-label','alt','title'].forEach(attribute => {
      const value = element.getAttribute(attribute);
      if (value?.includes(legacyName)) element.setAttribute(attribute, replaceLegacyName(value));
    });
  });
  const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, {
    acceptNode: node => node.nodeValue?.includes(legacyName) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
  });
  const legacyTextNodes = [];
  while (walker.nextNode()) legacyTextNodes.push(walker.currentNode);
  legacyTextNodes.forEach(node => { node.nodeValue = replaceLegacyName(node.nodeValue); });
  document.querySelectorAll('.brand strong,.profile-name,.academic-profile-mini strong').forEach(element => { element.textContent = preferredName; });

  const pageName = location.pathname.split('/').pop() || 'index.html';
  const page = pageName === 'workshops.html'
    ? 'workshops'
    : pageName === 'facilitation-gallery.html'
      ? 'gallery'
      : pageName === 'academic-partnerships.html'
        ? 'academic'
        : pageName === 'research-ip.html'
          ? 'research'
          : 'home';

  const nav = document.querySelector('.nav');
  const navButton = document.querySelector('.nav-toggle');
  const themeButton = document.querySelector('.theme-toggle');
  const progress = document.getElementById('progress-bar');
  const backToTop = document.querySelector('.back-to-top');
  const year = document.getElementById('year');

  const navigation = {
    home: [
      ['Home', '#overview'],
      ['Leadership', '#leadership'],
      ['Research & IP', 'research-ip.html'],
      ['Academic Leaders', 'academic-partnerships.html'],
      ['Programs', 'workshops.html'],
      ['Contact', '#contact']
    ],
    workshops: [
      ['Home', 'index.html'],
      ['Research & IP', 'research-ip.html'],
      ['Academic Leaders', 'academic-partnerships.html'],
      ['Programs', '#finder'],
      ['Gallery', 'facilitation-gallery.html'],
      ['Brochures', '#downloads']
    ],
    gallery: [
      ['Home', 'index.html'],
      ['Research & IP', 'research-ip.html'],
      ['Programs', 'workshops.html'],
      ['Gallery', 'facilitation-gallery.html'],
      ['Academic Leaders', 'academic-partnerships.html'],
      ['Contact', '#contact']
    ],
    academic: [
      ['Home', 'index.html'],
      ['Research & IP', 'research-ip.html'],
      ['Diagnose', '#diagnose'],
      ['Evidence', '#evidence'],
      ['Programs', '#programs'],
      ['Discuss priority', '#conversation']
    ],
    research: [
      ['Home', 'index.html'],
      ['Themes', '#themes'],
      ['Publications', '#publications'],
      ['Patents', '#patents'],
      ['Programs', 'workshops.html'],
      ['Collaborate', '#engage']
    ]
  };

  if (nav) {
    nav.innerHTML = navigation[page].map(([label, href]) => {
      const current = (page === 'gallery' && href === 'facilitation-gallery.html')
        || (page === 'workshops' && href === '#finder')
        || (page === 'academic' && href === '#diagnose')
        || (page === 'research' && href === '#themes');
      return `<a href="${href}"${current ? ' aria-current="page"' : ''}>${label}</a>`;
    }).join('');
  }

  document.querySelectorAll('.site-search-trigger,.site-search').forEach(element => element.remove());
  document.querySelectorAll('.post-preview-button').forEach(element => element.remove());
  document.getElementById('linkedin-preview')?.remove();

  if (page === 'home') {
    document.querySelectorAll('a[href="#research"]').forEach(link => { link.href = 'research-ip.html'; });
    const researchSection = document.querySelector('#research .research-list');
    if (researchSection && !researchSection.querySelector('.full-research-link')) {
      const link = document.createElement('a');
      link.className = 'btn primary btn-arrow full-research-link';
      link.href = 'research-ip.html';
      link.innerHTML = 'Explore the full research & IP portfolio <span>→</span>';
      researchSection.appendChild(link);
    }
  }

  if (page === 'home' && !document.querySelector('.academic-leader-invite')) {
    const target = document.querySelector('.quick-paths');
    const invite = document.createElement('section');
    invite.className = 'section academic-leader-invite';
    invite.innerHTML = `
      <div class="container academic-invite-shell reveal">
        <div>
          <small>For Vice-Chancellors, Principals, Deans and HoDs</small>
          <h2>Build a visible innovation pipeline, not another isolated academic event.</h2>
          <p>Connect faculty research, student readiness, responsible AI and industry relevance through an outcome-led institutional engagement.</p>
        </div>
        <div class="academic-invite-points">
          <span>Research and IP opportunity map</span>
          <span>Student industry-readiness sprint</span>
          <span>30, 60 or 90-day action plan</span>
        </div>
        <div class="actions">
          <a class="btn light btn-arrow" href="academic-partnerships.html#conversation">Discuss an institutional priority <span>→</span></a>
          <a class="btn outline pdf-download" href="downloads/institutional-innovation-readiness-canvas.pdf.b64" data-filename="Institutional-Innovation-Readiness-Canvas.pdf">Download readiness canvas</a>
        </div>
      </div>`;
    target?.insertAdjacentElement('beforebegin', invite);
  }

  if (page === 'workshops' && !document.querySelector('.academic-decision-strip')) {
    const academicContainer = document.querySelector('#academic .container');
    const academicHead = academicContainer?.querySelector('.section-head');
    const strip = document.createElement('aside');
    strip.className = 'academic-decision-strip reveal';
    strip.innerHTML = `
      <div>
        <small>For academic decision-makers</small>
        <h3>Start with the institutional outcome before comparing formats or scope.</h3>
        <p>Use the self-diagnosis, decision brief and evidence wall to identify the most credible starting point.</p>
      </div>
      <a class="btn primary btn-arrow" href="academic-partnerships.html#conversation">Discuss an institutional priority <span>→</span></a>`;
    academicHead?.insertAdjacentElement('afterend', strip);
  }

  const toast = document.createElement('div');
  toast.className = 'ux-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  body.appendChild(toast);
  let toastTimer;
  const showToast = message => {
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 2600);
  };

  const savedTheme = localStorage.getItem('portfolio-theme');
  root.dataset.theme = savedTheme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  const updateThemeButton = () => {
    if (!themeButton) return;
    const dark = root.dataset.theme === 'dark';
    themeButton.textContent = dark ? '☀' : '☾';
    themeButton.setAttribute('aria-label', dark ? 'Use light theme' : 'Use dark theme');
    themeButton.setAttribute('title', dark ? 'Use light theme' : 'Use dark theme');
  };
  updateThemeButton();

  themeButton?.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('portfolio-theme', root.dataset.theme);
    updateThemeButton();
  });

  const mobileQuery = matchMedia('(max-width: 960px)');
  const backdrop = document.createElement('button');
  backdrop.type = 'button';
  backdrop.className = 'mobile-nav-backdrop';
  backdrop.setAttribute('aria-label', 'Close navigation');
  backdrop.tabIndex = -1;
  document.querySelector('.site-header')?.insertAdjacentElement('afterend', backdrop);

  const closeNav = ({ returnFocus = false } = {}) => {
    nav?.classList.remove('open');
    navButton?.setAttribute('aria-expanded', 'false');
    navButton?.setAttribute('aria-label', 'Open navigation');
    body.classList.remove('nav-open');
    if (returnFocus) navButton?.focus();
  };

  const openNav = () => {
    nav?.classList.add('open');
    navButton?.setAttribute('aria-expanded', 'true');
    navButton?.setAttribute('aria-label', 'Close navigation');
    if (mobileQuery.matches) body.classList.add('nav-open');
  };

  navButton?.addEventListener('click', () => {
    if (nav?.classList.contains('open')) closeNav();
    else openNav();
  });
  backdrop.addEventListener('click', () => closeNav({ returnFocus: true }));
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeNav()));

  addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav?.classList.contains('open')) {
      event.preventDefault();
      closeNav({ returnFocus: true });
      return;
    }
    if (event.key !== 'Tab' || !mobileQuery.matches || !nav?.classList.contains('open')) return;
    const links = [...nav.querySelectorAll('a[href]')];
    if (!links.length) return;
    const first = links[0];
    const last = links[links.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  mobileQuery.addEventListener?.('change', () => {
    if (!mobileQuery.matches) closeNav();
  });

  const updateScrollUI = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const percentage = max > 0 ? Math.min(100, scrollY / max * 100) : 0;
    if (progress) progress.style.width = `${percentage}%`;
    backToTop?.classList.toggle('visible', scrollY > 700);
  };
  updateScrollUI();
  addEventListener('scroll', updateScrollUI, { passive: true });
  backToTop?.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -35px' });
    revealElements.forEach(element => revealObserver.observe(element));
  } else {
    revealElements.forEach(element => element.classList.add('visible'));
  }

  const sectionLinks = [...(nav?.querySelectorAll('a[href^="#"]') || [])];
  const sectionEntries = sectionLinks.map(link => {
    const section = document.querySelector(link.getAttribute('href'));
    return section ? { link, section } : null;
  }).filter(Boolean);

  if ('IntersectionObserver' in window && sectionEntries.length) {
    const sectionObserver = new IntersectionObserver(entries => {
      const current = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!current) return;
      sectionEntries.forEach(({ link, section }) => link.classList.toggle('active', section === current.target));
    }, { rootMargin: '-30% 0px -58%', threshold: [0, .12, .3] });
    sectionEntries.forEach(({ section }) => sectionObserver.observe(section));
  }

  document.querySelectorAll('[data-expand-programs]').forEach(button => {
    button.addEventListener('click', () => {
      const open = button.dataset.expandPrograms === 'open';
      document.querySelectorAll('.workshop-program details').forEach(details => { details.open = open; });
      showToast(open ? 'All learning journeys expanded.' : 'Learning journeys collapsed.');
    });
  });

  document.querySelectorAll('.pdf-download').forEach(link => {
    link.addEventListener('click', async event => {
      event.preventDefault();
      const originalText = link.textContent;
      const complexContent = link.childElementCount > 0;
      link.setAttribute('aria-busy', 'true');
      if (complexContent) link.classList.add('is-preparing');
      else link.textContent = 'Preparing PDF…';
      try {
        const response = await fetch(link.href);
        if (!response.ok) throw new Error(`PDF source could not be loaded (${response.status})`);
        const base64 = (await response.text()).replace(/\s/g, '');
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
        const objectUrl = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
        const download = document.createElement('a');
        download.href = objectUrl;
        download.download = link.dataset.filename || 'workshop-brochure.pdf';
        document.body.appendChild(download);
        download.click();
        download.remove();
        setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
        showToast('PDF download started.');
      } catch (error) {
        console.error(error);
        showToast('The PDF could not be prepared. Please try again.');
      } finally {
        link.removeAttribute('aria-busy');
        link.classList.remove('is-preparing');
        if (!complexContent) link.textContent = originalText;
      }
    });
  });

  if (year) year.textContent = new Date().getFullYear();
})();

import('/assets/js/story-ui.js?v=20260822-flow1').catch(error => console.error('Story navigation failed to load', error));
