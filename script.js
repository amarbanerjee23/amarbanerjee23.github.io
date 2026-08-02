(() => {
  const root = document.documentElement;
  const themeButton = document.querySelector('.theme-toggle');
  const navButton = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  const searchResults = document.querySelector('.search-results');

  if (nav && !nav.querySelector('a[href="facilitation-gallery.html"]')) {
    const galleryLink = document.createElement('a');
    galleryLink.href = 'facilitation-gallery.html';
    galleryLink.textContent = 'Gallery';
    const facilitationLink = nav.querySelector('a[href="workshops.html"]');
    if (facilitationLink) facilitationLink.insertAdjacentElement('afterend', galleryLink);
    else nav.appendChild(galleryLink);
  }

  if (searchResults && !searchResults.querySelector('a[href="facilitation-gallery.html"]')) {
    const galleryResult = document.createElement('a');
    galleryResult.href = 'facilitation-gallery.html';
    galleryResult.dataset.searchItem = '';
    galleryResult.dataset.keywords = 'gallery linkedin posts facilitation workshop panel mentoring';
    galleryResult.innerHTML = '<span>Facilitation gallery</span><small>Selected LinkedIn posts from workshops, panels and mentoring</small>';
    searchResults.appendChild(galleryResult);
  }

  const navLinks = [...document.querySelectorAll('.nav a')];
  const progress = document.getElementById('progress-bar');
  const year = document.getElementById('year');
  const backToTop = document.querySelector('.back-to-top');
  const searchDialog = document.getElementById('site-search');
  const searchTrigger = document.querySelector('.site-search-trigger');
  const searchClose = document.querySelector('.search-close');
  const searchInput = document.getElementById('site-search-input');
  const searchItems = [...document.querySelectorAll('[data-search-item]')];

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

  navLinks.forEach(link => link.addEventListener('click', () => {
    nav?.classList.remove('open');
    navButton?.setAttribute('aria-expanded', 'false');
  }));

  const updateScrollUI = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const value = max > 0 ? Math.min(100, scrollY / max * 100) : 0;
    if (progress) progress.style.width = `${value}%`;
    backToTop?.classList.toggle('visible', scrollY > 700);
  };
  updateScrollUI();
  addEventListener('scroll', updateScrollUI, { passive: true });

  backToTop?.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px' });
    revealElements.forEach(element => observer.observe(element));
  } else {
    revealElements.forEach(element => element.classList.add('visible'));
  }

  const allSectionLinks = [...document.querySelectorAll('.nav a[href^="#"], .page-subnav a[href^="#"]')];
  const sectionMap = new Map();
  allSectionLinks.forEach(link => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    const key = target.id;
    if (!sectionMap.has(key)) sectionMap.set(key, { target, links: [] });
    sectionMap.get(key).links.push(link);
  });

  if ('IntersectionObserver' in window && sectionMap.size) {
    const sectionObserver = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      sectionMap.forEach(({ links }, key) => links.forEach(link => link.classList.toggle('active', key === visible.target.id)));
      const activeSubnav = document.querySelector('.page-subnav a.active');
      activeSubnav?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }, { rootMargin: '-28% 0px -60%', threshold: [0, 0.1, 0.25] });
    sectionMap.forEach(({ target }) => sectionObserver.observe(target));
  }

  const openSearch = () => {
    if (!searchDialog) return;
    if (typeof searchDialog.showModal === 'function') searchDialog.showModal();
    else searchDialog.setAttribute('open', '');
    requestAnimationFrame(() => searchInput?.focus());
  };

  const closeSearch = () => {
    if (!searchDialog) return;
    if (typeof searchDialog.close === 'function') searchDialog.close();
    else searchDialog.removeAttribute('open');
  };

  searchTrigger?.addEventListener('click', openSearch);
  searchClose?.addEventListener('click', closeSearch);
  searchDialog?.addEventListener('click', event => {
    if (event.target === searchDialog) closeSearch();
  });

  searchInput?.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();
    searchItems.forEach(item => {
      const haystack = `${item.textContent} ${item.dataset.keywords || ''}`.toLowerCase();
      item.hidden = query.length > 0 && !haystack.includes(query);
    });
  });

  searchItems.forEach(item => item.addEventListener('click', () => {
    closeSearch();
    searchInput.value = '';
    searchItems.forEach(entry => { entry.hidden = false; });
  }));

  addEventListener('keydown', event => {
    const activeTag = document.activeElement?.tagName?.toLowerCase();
    const typing = activeTag === 'input' || activeTag === 'textarea' || document.activeElement?.isContentEditable;
    if (event.key === '/' && !typing && searchDialog && !searchDialog.open) {
      event.preventDefault();
      openSearch();
    }
  });

  document.querySelectorAll('[data-expand-programs]').forEach(button => {
    button.addEventListener('click', () => {
      const shouldOpen = button.dataset.expandPrograms === 'open';
      document.querySelectorAll('.workshop-program details').forEach(details => { details.open = shouldOpen; });
    });
  });

  document.querySelectorAll('.pdf-download').forEach(link => {
    link.addEventListener('click', async event => {
      event.preventDefault();
      const originalText = link.textContent;
      link.setAttribute('aria-busy', 'true');
      if (link.classList.contains('btn')) link.textContent = 'Preparing PDF...';
      try {
        const response = await fetch(link.href);
        if (!response.ok) throw new Error(`PDF source could not be loaded (${response.status})`);
        const base64 = (await response.text()).replace(/\s/g, '');
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
        const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = link.dataset.filename || 'workshop-brochure.pdf';
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1500);
      } catch (error) {
        console.error(error);
        alert('The PDF could not be prepared. Please try again or contact amarbanerjee23@gmail.com.');
      } finally {
        link.removeAttribute('aria-busy');
        if (link.classList.contains('btn')) link.textContent = originalText;
      }
    });
  });

  if (year) year.textContent = new Date().getFullYear();
})();

const enhancedStyles = document.createElement('link');
enhancedStyles.rel = 'stylesheet';
enhancedStyles.href = 'ux-state-of-art.css';
document.head.appendChild(enhancedStyles);

import('./ux-state-of-art.js').catch(error => console.error('Enhanced UX layer failed to load', error));
