(() => {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const primary = [
    ['Home', 'index.html'],
    ['About', '#profile-opening'],
    ['Experience', '#experience'],
    ['Publications', '#publications'],
    ['Patents', '#patents'],
    ['Contact', '#contact']
  ];

  const updateHeaderMetric = () => {
    const header = document.querySelector('.site-header');
    if (!header) return;
    document.documentElement.style.setProperty('--live-header-height', `${Math.ceil(header.getBoundingClientRect().height)}px`);
  };

  const resetPrimary = () => {
    const nav = document.querySelector('#nav');
    if (!nav) return;
    nav.innerHTML = primary.map(([label, href]) => `<a href="${href}">${label}</a>`).join('');
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

  const promoteStyles = () => {
    ['academic-future.css', 'profile-page.css', 'sticky-nav-fix.css'].forEach(href => {
      const link = document.querySelector(`link[href="${href}"]`);
      if (link) document.head.appendChild(link);
    });
  };

  const init = () => {
    promoteStyles();
    resetPrimary();
    updateHeaderMetric();
  };

  init();

  addEventListener('load', () => {
    init();
    const header = document.querySelector('.site-header');
    if ('ResizeObserver' in window && header) new ResizeObserver(updateHeaderMetric).observe(header);
  }, { once:true });

  addEventListener('resize', updateHeaderMetric, { passive:true });
  addEventListener('orientationchange', updateHeaderMetric, { passive:true });
})();
