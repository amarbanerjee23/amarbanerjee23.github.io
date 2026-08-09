(() => {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const primary = [
    ['Home', 'index.html'],
    ['Student innovation', '#student-innovation'],
    ['Research excellence', '#research-excellence'],
    ['Patents', '#patent-thinking'],
    ['Formats', '#formats'],
    ['Contact', '#contact']
  ];
  const story = [
    ['#programs-opening', 'Programs'],
    ['#student-innovation', 'Innovation'],
    ['#research-excellence', 'Research'],
    ['#patent-thinking', 'Patents'],
    ['#formats', 'Formats'],
    ['#contact', 'Contact']
  ];

  const updateHeaderMetric = () => {
    const header = document.querySelector('.site-header');
    if (!header) return;
    document.documentElement.style.setProperty('--live-header-height', `${Math.ceil(header.getBoundingClientRect().height)}px`);
  };

  const bindSmooth = (link, target) => {
    link.addEventListener('click', event => {
      event.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      history.replaceState(null, '', link.getAttribute('href'));
      document.querySelector('#nav')?.classList.remove('open');
      document.body.classList.remove('nav-open');
      document.querySelector('.nav-toggle')?.setAttribute('aria-expanded', 'false');
    });
  };

  const resetPrimary = () => {
    const nav = document.querySelector('#nav');
    if (!nav) return;
    nav.innerHTML = primary.map(([label, href]) => `<a href="${href}">${label}</a>`).join('');
    nav.querySelectorAll('a[href^="#"]').forEach(link => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) bindSmooth(link, target);
    });
  };

  const resetStory = () => {
    document.querySelectorAll('.story-nav').forEach(node => node.remove());
    const available = story.map(([selector, label]) => {
      const element = document.querySelector(selector);
      return element ? { selector, label, element } : null;
    }).filter(Boolean);
    if (available.length < 2) return;

    const nav = document.createElement('nav');
    nav.className = 'story-nav academic-story-nav';
    nav.setAttribute('aria-label', 'On this page');
    nav.innerHTML = `<div class="story-nav-head"><small>On this page</small><span class="story-nav-count">1 / ${available.length}</span></div><ol class="story-nav-list">${available.map((item,index)=>`<li><a href="${item.selector}"${index===0?' aria-current="step"':''}><span class="story-nav-number">${String(index+1).padStart(2,'0')}</span><span class="story-nav-label">${item.label}</span></a></li>`).join('')}</ol><div class="story-progress-track" aria-hidden="true"><span class="story-progress-bar"></span></div>`;
    document.querySelector('.site-header')?.insertAdjacentElement('afterend', nav);

    const links = [...nav.querySelectorAll('a')];
    const count = nav.querySelector('.story-nav-count');
    const bar = nav.querySelector('.story-progress-bar');
    const activate = index => {
      const safe = Math.max(0, Math.min(index, available.length - 1));
      links.forEach((link,i)=>i===safe?link.setAttribute('aria-current','step'):link.removeAttribute('aria-current'));
      if (count) count.textContent = `${safe + 1} / ${available.length}`;
      if (bar) bar.style.width = `${((safe + 1) / available.length) * 100}%`;
      links[safe]?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest', inline: 'nearest' });
    };
    links.forEach((link,index)=>bindSmooth(link,available[index].element));
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        const visible = entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
        if (!visible) return;
        const index = available.findIndex(item=>item.element===visible.target);
        if (index >= 0) activate(index);
      }, { rootMargin:'-24% 0px -64%', threshold:[0,.08,.2,.4] });
      available.forEach(item=>observer.observe(item.element));
    }
    const hashIndex = available.findIndex(item=>item.selector===location.hash);
    activate(hashIndex >= 0 ? hashIndex : 0);
  };

  const init = () => {
    document.querySelector('.academic-decision-strip')?.remove();
    resetPrimary();
    updateHeaderMetric();
    resetStory();
    const header = document.querySelector('.site-header');
    if ('ResizeObserver' in window && header) new ResizeObserver(updateHeaderMetric).observe(header);
    addEventListener('resize', updateHeaderMetric, { passive:true });
    addEventListener('orientationchange', updateHeaderMetric, { passive:true });
  };

  addEventListener('load', () => setTimeout(init, 80), { once:true });
})();
