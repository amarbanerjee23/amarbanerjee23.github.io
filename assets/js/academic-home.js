(() => {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const sections = [
    ['#overview', 'Why now'],
    ['#innovation', 'Student innovation'],
    ['#research', 'Research excellence'],
    ['#patents', 'Patents'],
    ['#institutional', 'For institutions'],
    ['#contact', 'Contact']
  ];

  const primaryLinks = [
    ['Why now', '#overview'],
    ['Student innovation', '#innovation'],
    ['Research', '#research'],
    ['Programs', 'workshops.html'],
    ['About & work', 'profile.html'],
    ['Contact', '#contact']
  ];

  const promoteStyles = () => {
    ['/assets/css/academic-future.css', '/assets/css/sticky-nav-fix.css', '/assets/css/academic-contrast.css'].forEach(href => {
      let link = document.querySelector(`link[href="${href}"]`);
      if (!link) {
        link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
      }
      document.head.appendChild(link);
    });
  };

  const updateHeaderMetric = () => {
    const header = document.querySelector('.site-header');
    if (!header) return;
    const height = Math.ceil(header.getBoundingClientRect().height);
    document.documentElement.style.setProperty('--live-header-height', `${height}px`);
  };

  const resetPrimaryNav = () => {
    const nav = document.querySelector('#nav');
    if (!nav) return;
    nav.innerHTML = primaryLinks.map(([label, href]) => `<a href="${href}">${label}</a>`).join('');
    nav.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', event => {
        const target = document.querySelector(link.getAttribute('href'));
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        history.replaceState(null, '', link.getAttribute('href'));
        nav.classList.remove('open');
        document.body.classList.remove('nav-open');
        document.querySelector('.nav-toggle')?.setAttribute('aria-expanded', 'false');
      });
    });
  };

  const installStoryNav = () => {
    document.querySelectorAll('.story-nav').forEach(node => node.remove());
    const available = sections.map(([selector, label]) => {
      const element = document.querySelector(selector);
      return element ? { selector, label, element } : null;
    }).filter(Boolean);
    if (available.length < 2) return;

    const nav = document.createElement('nav');
    nav.className = 'story-nav academic-story-nav';
    nav.setAttribute('aria-label', 'On this page');
    nav.innerHTML = `
      <div class="story-nav-head"><small>On this page</small><span class="story-nav-count">1 / ${available.length}</span></div>
      <ol class="story-nav-list">
        ${available.map((item, index) => `<li><a href="${item.selector}"${index === 0 ? ' aria-current="step"' : ''}><span class="story-nav-number">${String(index + 1).padStart(2, '0')}</span><span class="story-nav-label">${item.label}</span></a></li>`).join('')}
      </ol>
      <div class="story-progress-track" aria-hidden="true"><span class="story-progress-bar"></span></div>`;

    const header = document.querySelector('.site-header');
    header?.insertAdjacentElement('afterend', nav);
    const links = [...nav.querySelectorAll('a')];
    const list = nav.querySelector('.story-nav-list');
    const count = nav.querySelector('.story-nav-count');
    const bar = nav.querySelector('.story-progress-bar');

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
      const safeIndex = Math.max(0, Math.min(index, available.length - 1));
      links.forEach((link, i) => i === safeIndex ? link.setAttribute('aria-current', 'step') : link.removeAttribute('aria-current'));
      if (count) count.textContent = `${safeIndex + 1} / ${available.length}`;
      if (bar) bar.style.width = `${((safeIndex + 1) / available.length) * 100}%`;
      keepTabVisible(links[safeIndex]);
    };

    links.forEach((link, index) => link.addEventListener('click', event => {
      event.preventDefault();
      available[index].element.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      history.replaceState(null, '', available[index].selector);
      activate(index);
    }));

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const index = available.findIndex(item => item.element === visible.target);
        if (index >= 0) activate(index);
      }, { rootMargin: '-24% 0px -64%', threshold: [0, .08, .2, .4] });
      available.forEach(item => observer.observe(item.element));
    }

    const hashIndex = available.findIndex(item => item.selector === location.hash);
    activate(hashIndex >= 0 ? hashIndex : 0);
  };

  const addVenueAmbition = () => {
    const note = document.querySelector('.integrity-note p');
    if (!note || note.querySelector('.venue-ambition')) return;
    const extra = document.createElement('span');
    extra.className = 'venue-ambition';
    extra.textContent = ' For Indian student research in particular, the aim should not be to treat Q2 or Q3 as the automatic stopping point. Students should understand what Q1 journals and leading conferences demand, then decide whether the problem, contribution and evidence are strong enough to compete there.';
    note.appendChild(extra);
  };

  const init = () => {
    document.querySelector('.academic-leader-invite')?.remove();
    promoteStyles();
    resetPrimaryNav();
    updateHeaderMetric();
    installStoryNav();
    addVenueAmbition();

    const header = document.querySelector('.site-header');
    if ('ResizeObserver' in window && header) new ResizeObserver(updateHeaderMetric).observe(header);
    addEventListener('resize', updateHeaderMetric, { passive: true });
    addEventListener('orientationchange', updateHeaderMetric, { passive: true });
  };

  addEventListener('load', () => setTimeout(init, 80), { once: true });
})();
