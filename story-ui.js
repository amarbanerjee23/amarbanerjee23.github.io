(() => {
  const body = document.body;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const page = body.classList.contains('workshops-page')
    ? 'workshops'
    : body.classList.contains('gallery-page')
      ? 'gallery'
      : 'home';

  const stories = {
    home: [
      { selector: '#overview', label: 'Opening' },
      { selector: '#leadership', label: 'How I create value' },
      { selector: '#experience', label: 'The journey' },
      { selector: '#facilitation-preview', label: 'Turning insight into capability' },
      { selector: '#research', label: 'Research and IP' },
      { selector: '#about', label: 'The philosophy' },
      { selector: '#contact', label: 'Start a conversation' }
    ],
    workshops: [
      { selector: '.workshop-hero', id: 'programs-opening', label: 'Choose the outcome' },
      { selector: '#approach', label: 'The method' },
      { selector: '#corporate', label: 'For organisations' },
      { selector: '#academic', label: 'For academia' },
      { selector: '#modules', label: 'Build the experience' },
      { selector: '#facilitator', label: 'Who facilitates' },
      { selector: '#downloads', label: 'Take the next step' }
    ],
    gallery: [
      { selector: '.gallery-hero', id: 'gallery-opening', label: 'Opening' },
      { selector: '#posts', label: 'Facilitation in action' },
      { selector: '.gallery-next', id: 'gallery-programs', label: 'From moments to programs' },
      { selector: '#contact', label: 'Start a conversation' }
    ]
  };

  const chapters = stories[page].map((chapter, index) => {
    const element = document.querySelector(chapter.selector);
    if (!element) return null;
    if (!element.id) element.id = chapter.id || `story-chapter-${index + 1}`;
    element.classList.add('story-layer');
    element.dataset.storyIndex = String(index);

    if (!element.querySelector(':scope > .story-chapter-marker')) {
      const marker = document.createElement('span');
      marker.className = 'story-chapter-marker';
      marker.textContent = `Chapter ${String(index + 1).padStart(2, '0')}`;
      marker.setAttribute('aria-hidden', 'true');
      element.prepend(marker);
    }

    return { ...chapter, element, id: element.id, index };
  }).filter(Boolean);

  if (chapters.length < 2) return;

  const nav = document.createElement('aside');
  nav.className = 'story-nav';
  nav.setAttribute('aria-label', 'Story chapters');
  nav.innerHTML = `
    <div class="story-nav-head">
      <small>Story flow</small>
      <span class="story-nav-count">01 / ${String(chapters.length).padStart(2, '0')}</span>
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

  const next = document.createElement('a');
  next.className = 'story-next';
  next.href = `#${chapters[1].id}`;
  next.innerHTML = `
    <span class="story-next-copy"><small>Next chapter</small><strong>${chapters[1].label}</strong></span>
    <span class="story-next-arrow" aria-hidden="true">→</span>`;
  body.appendChild(next);

  const links = [...nav.querySelectorAll('a')];
  const count = nav.querySelector('.story-nav-count');
  const bar = nav.querySelector('.story-progress-bar');
  let currentIndex = 0;

  const activate = index => {
    currentIndex = Math.max(0, Math.min(index, chapters.length - 1));
    links.forEach((link, linkIndex) => {
      if (linkIndex === currentIndex) link.setAttribute('aria-current', 'step');
      else link.removeAttribute('aria-current');
    });

    if (count) count.textContent = `${String(currentIndex + 1).padStart(2, '0')} / ${String(chapters.length).padStart(2, '0')}`;
    if (bar) bar.style.width = `${((currentIndex + 1) / chapters.length) * 100}%`;

    const nextChapter = chapters[currentIndex + 1];
    if (nextChapter) {
      next.hidden = false;
      next.href = `#${nextChapter.id}`;
      next.querySelector('strong').textContent = nextChapter.label;
    } else {
      next.hidden = true;
    }

    links[currentIndex]?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });
  };

  const scrollToChapter = (event, chapter) => {
    event.preventDefault();
    chapter.element.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    history.replaceState(null, '', `#${chapter.id}`);
  };

  links.forEach((link, index) => link.addEventListener('click', event => scrollToChapter(event, chapters[index])));
  next.addEventListener('click', event => {
    const chapter = chapters[currentIndex + 1];
    if (chapter) scrollToChapter(event, chapter);
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const index = Number(visible.target.dataset.storyIndex || 0);
      activate(index);
    }, { rootMargin: '-25% 0px -58%', threshold: [0, .08, .2, .45] });
    chapters.forEach(chapter => observer.observe(chapter.element));
  } else {
    const update = () => {
      const marker = innerHeight * .36;
      const index = chapters.reduce((active, chapter, chapterIndex) => chapter.element.getBoundingClientRect().top <= marker ? chapterIndex : active, 0);
      activate(index);
    };
    update();
    addEventListener('scroll', update, { passive: true });
  }

  const hashIndex = chapters.findIndex(chapter => `#${chapter.id}` === location.hash);
  activate(hashIndex >= 0 ? hashIndex : 0);
})();
