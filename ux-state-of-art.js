(() => {
  const body = document.body;
  const root = document.documentElement;
  const nav = document.querySelector('.nav');
  const navButton = document.querySelector('.nav-toggle');
  const themeButton = document.querySelector('.theme-toggle');
  const searchDialog = document.getElementById('site-search');
  const searchTrigger = document.querySelector('.site-search-trigger');
  const searchInput = document.getElementById('site-search-input');
  const searchResults = document.querySelector('.search-results');
  const mobileQuery = matchMedia('(max-width: 960px)');

  const liveRegion = document.createElement('div');
  liveRegion.className = 'ux-live-region';
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('aria-atomic', 'true');
  body.appendChild(liveRegion);

  const toast = document.createElement('div');
  toast.className = 'ux-toast';
  toast.setAttribute('role', 'status');
  body.appendChild(toast);
  let toastTimer;

  const announce = message => {
    liveRegion.textContent = '';
    requestAnimationFrame(() => { liveRegion.textContent = message; });
  };

  const showToast = message => {
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 2600);
  };

  const backdrop = document.createElement('button');
  backdrop.type = 'button';
  backdrop.className = 'mobile-nav-backdrop';
  backdrop.setAttribute('aria-label', 'Close navigation');
  backdrop.tabIndex = -1;
  document.querySelector('.site-header')?.insertAdjacentElement('afterend', backdrop);

  const navFocusable = () => [...(nav?.querySelectorAll('a[href],button:not([disabled])') || [])].filter(element => !element.hidden);

  const syncNavState = ({ moveFocus = false } = {}) => {
    const open = Boolean(nav?.classList.contains('open'));
    body.classList.toggle('nav-open', open && mobileQuery.matches);
    navButton?.setAttribute('aria-expanded', String(open));
    if (open && moveFocus && mobileQuery.matches) requestAnimationFrame(() => navFocusable()[0]?.focus());
  };

  navButton?.addEventListener('click', () => queueMicrotask(() => syncNavState({ moveFocus: nav?.classList.contains('open') })));
  backdrop.addEventListener('click', () => navButton?.click());
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => queueMicrotask(syncNavState)));

  addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav?.classList.contains('open') && mobileQuery.matches) {
      event.preventDefault();
      navButton?.click();
      navButton?.focus();
      return;
    }

    if (event.key !== 'Tab' || !nav?.classList.contains('open') || !mobileQuery.matches) return;
    const focusable = navFocusable();
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  mobileQuery.addEventListener?.('change', () => {
    if (!mobileQuery.matches && nav?.classList.contains('open')) {
      nav.classList.remove('open');
      syncNavState();
    }
  });

  const normalizePath = pathname => pathname.replace(/\/index\.html$/, '/').replace(/\/$/, '/') || '/';
  const currentPath = normalizePath(location.pathname);
  document.querySelectorAll('.nav a[href]').forEach(link => {
    const url = new URL(link.href, location.href);
    const isPageLink = !url.hash && normalizePath(url.pathname) === currentPath;
    if (isPageLink) link.setAttribute('aria-current', 'page');
    else if (link.getAttribute('aria-current') === 'page') link.removeAttribute('aria-current');
  });

  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const syncThemeControl = () => {
    const dark = root.dataset.theme === 'dark';
    if (themeButton) {
      themeButton.textContent = dark ? '☀' : '☾';
      themeButton.setAttribute('aria-label', dark ? 'Use light theme' : 'Use dark theme');
      themeButton.setAttribute('title', dark ? 'Use light theme' : 'Use dark theme');
      themeButton.setAttribute('aria-pressed', String(dark));
    }
    themeMeta?.setAttribute('content', dark ? '#071521' : '#102a43');
  };
  syncThemeControl();
  themeButton?.addEventListener('click', () => queueMicrotask(syncThemeControl));

  let lastSearchFocus = null;
  let keyboardIndex = -1;
  if (searchResults && !searchResults.querySelector('.search-empty')) {
    const empty = document.createElement('p');
    empty.className = 'search-empty';
    empty.textContent = 'No matching section found. Try a broader term such as AI, leadership, workshop or research.';
    searchResults.insertAdjacentElement('afterend', empty);

    const count = document.createElement('p');
    count.className = 'search-result-count';
    count.setAttribute('aria-live', 'polite');
    searchResults.insertAdjacentElement('afterend', count);
  }

  const searchItems = () => [...document.querySelectorAll('[data-search-item]')];
  const visibleSearchItems = () => searchItems().filter(item => !item.hidden);

  const refreshSearchState = () => {
    const visible = visibleSearchItems();
    const query = searchInput?.value.trim() || '';
    document.querySelector('.search-empty')?.classList.toggle('visible', Boolean(query) && visible.length === 0);
    const count = document.querySelector('.search-result-count');
    if (count) count.textContent = query ? `${visible.length} matching ${visible.length === 1 ? 'result' : 'results'}` : `${visible.length} available destinations`;
    keyboardIndex = -1;
    searchItems().forEach(item => item.classList.remove('keyboard-active'));
  };

  searchInput?.addEventListener('input', () => queueMicrotask(refreshSearchState));
  refreshSearchState();

  searchTrigger?.addEventListener('click', () => { lastSearchFocus = searchTrigger; }, { capture: true });
  addEventListener('keydown', event => {
    const active = document.activeElement;
    const typing = active?.matches?.('input,textarea,[contenteditable="true"]');
    if (event.key === '/' && !typing && searchDialog && !searchDialog.open) lastSearchFocus = active;
  }, true);

  searchDialog?.addEventListener('close', () => {
    body.classList.remove('dialog-open');
    keyboardIndex = -1;
    lastSearchFocus?.focus?.();
  });
  searchDialog?.addEventListener('cancel', () => body.classList.remove('dialog-open'));
  searchTrigger?.addEventListener('click', () => queueMicrotask(() => body.classList.toggle('dialog-open', Boolean(searchDialog?.open))));

  searchInput?.addEventListener('keydown', event => {
    if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
    const visible = visibleSearchItems();
    if (!visible.length) return;
    event.preventDefault();
    keyboardIndex = event.key === 'ArrowDown' ? (keyboardIndex + 1) % visible.length : (keyboardIndex - 1 + visible.length) % visible.length;
    searchItems().forEach(item => item.classList.remove('keyboard-active'));
    visible[keyboardIndex].classList.add('keyboard-active');
    visible[keyboardIndex].focus();
  });

  searchResults?.addEventListener('keydown', event => {
    if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
    const visible = visibleSearchItems();
    if (!visible.length) return;
    event.preventDefault();
    const activeIndex = Math.max(0, visible.indexOf(document.activeElement));
    keyboardIndex = event.key === 'ArrowDown' ? (activeIndex + 1) % visible.length : (activeIndex - 1 + visible.length) % visible.length;
    visible.forEach(item => item.classList.remove('keyboard-active'));
    visible[keyboardIndex].classList.add('keyboard-active');
    visible[keyboardIndex].focus();
  });

  const addBreadcrumb = () => {
    if (document.querySelector('.breadcrumb-shell')) return;
    let items;
    if (body.classList.contains('premium-facilitation-page')) {
      items = [{ label: 'Portfolio', href: 'index.html' }, { label: 'Facilitation programs' }];
    } else if (body.classList.contains('gallery-page')) {
      items = [{ label: 'Portfolio', href: 'index.html' }, { label: 'Facilitation programs', href: 'workshops.html' }, { label: 'Gallery' }];
    } else return;

    const shell = document.createElement('div');
    shell.className = 'breadcrumb-shell';
    const breadcrumb = document.createElement('nav');
    breadcrumb.className = 'container breadcrumb';
    breadcrumb.setAttribute('aria-label', 'Breadcrumb');
    const list = document.createElement('ol');
    items.forEach((item, index) => {
      const listItem = document.createElement('li');
      if (item.href) {
        const link = document.createElement('a');
        link.href = item.href;
        link.textContent = item.label;
        listItem.appendChild(link);
      } else {
        listItem.textContent = item.label;
        listItem.setAttribute('aria-current', 'page');
      }
      if (index === items.length - 1) listItem.setAttribute('aria-current', 'page');
      list.appendChild(listItem);
    });
    breadcrumb.appendChild(list);
    shell.appendChild(breadcrumb);
    document.querySelector('.page-subnav-wrap, main')?.insertAdjacentElement('beforebegin', shell);
  };
  addBreadcrumb();

  const profileImage = document.querySelector('.premium-profile img');
  if (profileImage) {
    profileImage.loading = 'eager';
    profileImage.decoding = 'async';
    profileImage.fetchPriority = 'high';
  }
  document.querySelectorAll('img').forEach(image => {
    image.decoding = 'async';
    image.addEventListener('load', () => image.classList.add('is-loaded'), { once: true });
    if (image.complete) image.classList.add('is-loaded');
  });

  document.querySelectorAll('details').forEach(details => {
    const summary = details.querySelector('summary');
    const sync = () => summary?.setAttribute('aria-expanded', String(details.open));
    details.addEventListener('toggle', sync);
    sync();
  });

  document.querySelectorAll('[data-expand-programs]').forEach(button => {
    button.addEventListener('click', () => {
      const opening = button.dataset.expandPrograms === 'open';
      announce(opening ? 'All learning journeys expanded.' : 'All learning journeys collapsed.');
      showToast(opening ? 'All learning journeys expanded' : 'All learning journeys collapsed');
    });
  });

  document.querySelectorAll('.pdf-download').forEach(link => {
    const observer = new MutationObserver(() => {
      const busy = link.getAttribute('aria-busy') === 'true';
      if (busy) {
        announce('Preparing PDF brochure.');
        showToast('Preparing PDF brochure…');
      } else {
        announce('PDF preparation finished.');
      }
    });
    observer.observe(link, { attributes: true, attributeFilter: ['aria-busy'] });
  });

  const prefetched = new Set();
  const prefetch = href => {
    if (!href || prefetched.has(href)) return;
    const url = new URL(href, location.href);
    if (url.origin !== location.origin || !url.pathname.endsWith('.html')) return;
    prefetched.add(href);
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url.href;
    document.head.appendChild(link);
  };
  document.querySelectorAll('a[href]').forEach(link => {
    let timer;
    link.addEventListener('pointerenter', () => { timer = setTimeout(() => prefetch(link.getAttribute('href')), 90); }, { passive: true });
    link.addEventListener('pointerleave', () => clearTimeout(timer), { passive: true });
    link.addEventListener('focus', () => prefetch(link.getAttribute('href')), { passive: true });
  });
})();
