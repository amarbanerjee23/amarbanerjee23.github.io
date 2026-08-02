(() => {
  const root = document.documentElement;
  const themeButton = document.querySelector('.theme-toggle');
  const navButton = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  const links = [...document.querySelectorAll('.nav a')];
  const progress = document.getElementById('progress-bar');
  const year = document.getElementById('year');

  const savedTheme = localStorage.getItem('portfolio-theme');
  const initialTheme = savedTheme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  root.dataset.theme = initialTheme;

  themeButton?.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    localStorage.setItem('portfolio-theme', next);
  });

  navButton?.addEventListener('click', () => {
    const open = navButton.getAttribute('aria-expanded') === 'true';
    navButton.setAttribute('aria-expanded', String(!open));
    navButton.setAttribute('aria-label', open ? 'Open navigation' : 'Close navigation');
    nav?.classList.toggle('open', !open);
  });

  links.forEach(link => link.addEventListener('click', () => {
    nav?.classList.remove('open');
    navButton?.setAttribute('aria-expanded', 'false');
  }));

  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const value = max > 0 ? Math.min(100, scrollY / max * 100) : 0;
    if (progress) progress.style.width = `${value}%`;
  };
  updateProgress();
  addEventListener('scroll', updateProgress, { passive: true });

  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealElements.forEach(element => observer.observe(element));
  } else {
    revealElements.forEach(element => element.classList.add('visible'));
  }

  const sections = links.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        links.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
      });
    }, { rootMargin: '-35% 0px -55%' });
    sections.forEach(section => sectionObserver.observe(section));
  }

  if (year) year.textContent = new Date().getFullYear();
})();
