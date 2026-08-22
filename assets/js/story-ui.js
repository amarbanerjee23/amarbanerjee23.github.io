(() => {
  ['/assets/css/ux-calm-v2.css?v=20260822-flow1'].forEach(href => {
    if (document.querySelector(`link[href="${href}"]`)) return;
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = href;
    document.head.appendChild(stylesheet);
  });

  const body = document.body;
  body.classList.add('ux-calm');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /*
    Academic landing/program pages own their story navigation. Avoid installing a
    second observer/navigation system because competing scrollIntoView calls can
    make manual scrolling feel as if the page is being pulled backwards.
  */
  if (body.classList.contains('academic-future-home') || body.classList.contains('academic-programs-page')) {
    import('/assets/js/story-unfold.js?v=20260822-flow1').catch(error => console.error('Story support failed to load', error));
    return;
  }

  const page = body.classList.contains('workshops-page')
    ? 'workshops'
    : body.classList.contains('gallery-page')
      ? 'gallery'
      : body.classList.contains('academic-page')
        ? 'academic'
        : body.classList.contains('research-page')
          ? 'research'
          : body.classList.contains('profile-page')
            ? 'profile'
            : 'home';

  const stories = {
    home: [
      { selector: '#overview', label: 'Overview' },
      { selector: '#leadership', label: 'Leadership' },
      { selector: '#experience', label: 'Journey' },
      { selector: '#research', label: 'Research & IP' },
      { selector: '#contact', label: 'Contact' }
    ],
    workshops: [
      { selector: '.workshop-hero', id: 'programs-opening', label: 'Programs' },
      { selector: '#corporate', label: 'Organisations' },
      { selector: '#academic', label: 'Academia' },
      { selector: '#facilitator', label: 'Facilitator' },
      { selector: '#downloads', label: 'Brochures' }
    ],
    gallery: [
      { selector: '.gallery-hero', id: 'gallery-opening', label: 'Gallery' },
      { selector: '#posts', label: 'In action' },
      { selector: '#contact', label: 'Contact' }
    ],
    academic: [
      { selector: '#academic-opening', label: 'Institutional focus' },
      { selector: '#diagnose', label: 'Priority' },
      { selector: '#outcomes', label: 'Outcomes' },
      { selector: '#evidence', label: 'Evidence' },
      { selector: '#conversation', label: 'Discuss' }
    ],
    research: [
      { selector: '#research-opening', label: 'Research' },
      { selector: '#themes', label: 'Themes' },
      { selector: '#publications', label: 'Publications' },
      { selector: '#patents', label: 'Patents' },
      { selector: '#engage', label: 'Collaborate' }
    ],
    profile: [
      { selector: '#profile-opening', label: 'About' },
      { selector: '#experience', label: 'Experience' },
      { selector: '#publications', label: 'Publications' },
      { selector: '#patents', label: 'Patents' },
      { selector: '#academic-work', label: 'Academic work' },
      { selector: '#contact', label: 'Contact' }
    ]
  };

  const chapters = stories[page].map((chapter, index) => {
    const element = document.querySelector(chapter.selector);
    if (!element) return null;
    if (!element.id) element.id = chapter.id || `story-chapter-${index + 1}`;
    element.classList.add('story-layer');
    element.dataset.storyIndex = String(index);
    element.dataset.surface = index % 2 === 0 ? 'plain' : 'soft';
    return { ...chapter, element, id: element.id, index };
  }).filter(Boolean);

  if (chapters.length < 2) {
    import('/assets/js/story-unfold.js?v=20260822-flow1').catch(error => console.error('Story support failed to load', error));
    return;
  }

  const nav = document.createElement('nav');
  nav.className = 'story-nav';
  nav.setAttribute('aria-label', 'On this page');
  nav.innerHTML = `
    <div class="story-nav-head">
      <small>On this page</small>
      <span class="story-nav-count">1 / ${chapters.length}</span>
    </div>
    <ol class="story-nav-list">
      ${chapters.map((chapter, index) => `
        <li>
          <a href="#${chapter.id}"${index === 0 ? ' aria-current="step"' : ''}>
            <span class="story-nav-number">${String(index + 1).padStart(2, '0')}</span>
            <span class="story-nav-label">${chapter.label}</span>
          </a>
        </li>`).join('')}
    </ol>
    <div class="story-progress-track" aria-hidden="true"><span class="story-progress-bar"></span></div>`;
  body.appendChild(nav);

  const links = [...nav.querySelectorAll('a')];
  const list = nav.querySelector('.story-nav-list');
  const count = nav.querySelector('.story-nav-count');
  const bar = nav.querySelector('.story-progress-bar');
  let currentIndex = 0;

  /*
    Keep only the horizontal tab strip in view. scrollIntoView() is intentionally
    not used here: browsers are allowed to adjust both axes, which caused the
    page itself to jump during IntersectionObserver updates.
  */
  const keepTabVisible = active => {
    if (!active || !list || list.scrollWidth <= list.clientWidth) return;
    const item = active.closest('li') || active;
    const left = item.offsetLeft;
    const right = left + item.offsetWidth;
    const visibleLeft = list.scrollLeft;
    const visibleRight = visibleLeft + list.clientWidth;
    const padding = 12;
    let next = visibleLeft;
    if (left < visibleLeft + padding) next = Math.max(0, left - padding);
    else if (right > visibleRight - padding) next = Math.min(list.scrollWidth - list.clientWidth, right - list.clientWidth + padding);
    if (Math.abs(next - visibleLeft) > 1) list.scrollTo({ left: next, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  const activate = index => {
    currentIndex = Math.max(0, Math.min(index, chapters.length - 1));
    links.forEach((link, linkIndex) => {
      if (linkIndex === currentIndex) link.setAttribute('aria-current', 'step');
      else link.removeAttribute('aria-current');
    });
    if (count) count.textContent = `${currentIndex + 1} / ${chapters.length}`;
    if (bar) bar.style.width = `${((currentIndex + 1) / chapters.length) * 100}%`;
    keepTabVisible(links[currentIndex]);
  };

  links.forEach((link, index) => {
    link.addEventListener('click', event => {
      event.preventDefault();
      chapters[index].element.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'start'
      });
      history.replaceState(null, '', `#${chapters[index].id}`);
    });
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      activate(Number(visible.target.dataset.storyIndex || 0));
    }, { rootMargin: '-22% 0px -62%', threshold: [0, .08, .2, .4] });
    chapters.forEach(chapter => observer.observe(chapter.element));
  } else {
    const update = () => {
      const marker = innerHeight * .34;
      const index = chapters.reduce(
        (active, chapter, chapterIndex) => chapter.element.getBoundingClientRect().top <= marker ? chapterIndex : active,
        0
      );
      activate(index);
    };
    update();
    addEventListener('scroll', update, { passive: true });
  }

  const hashIndex = chapters.findIndex(chapter => `#${chapter.id}` === location.hash);
  activate(hashIndex >= 0 ? hashIndex : 0);

  import('/assets/js/story-unfold.js?v=20260822-flow1').catch(error => console.error('Story support failed to load', error));
})();
