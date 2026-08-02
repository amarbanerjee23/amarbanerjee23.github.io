(() => {
  const filters = [...document.querySelectorAll('.gallery-filter')];
  const cards = [...document.querySelectorAll('.linkedin-card')];
  const count = document.querySelector('.gallery-count');
  const preview = document.getElementById('linkedin-preview');
  const previewFrame = preview?.querySelector('iframe');
  const previewTitle = document.getElementById('linkedin-preview-title');
  const previewClose = preview?.querySelector('.preview-close');

  const applyFilter = category => {
    let visible = 0;
    cards.forEach(card => {
      const show = category === 'all' || card.dataset.category === category;
      card.hidden = !show;
      if (show) visible += 1;
    });
    filters.forEach(button => {
      const active = button.dataset.filter === category;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    if (count) count.textContent = `${visible} ${visible === 1 ? 'post' : 'posts'}`;
  };

  filters.forEach(button => button.addEventListener('click', () => applyFilter(button.dataset.filter || 'all')));

  const closePreview = () => {
    if (!preview) return;
    if (typeof preview.close === 'function') preview.close();
    else preview.removeAttribute('open');
    preview.classList.remove('loaded');
    if (previewFrame) previewFrame.src = 'about:blank';
  };

  document.querySelectorAll('.post-preview-button').forEach(button => {
    button.addEventListener('click', () => {
      if (!preview || !previewFrame) return;
      const postId = button.dataset.post;
      if (!postId) return;
      if (previewTitle) previewTitle.textContent = button.dataset.title || 'LinkedIn post';
      preview.classList.remove('loaded');
      previewFrame.src = `https://www.linkedin.com/embed/feed/update/urn:li:share:${postId}`;
      previewFrame.addEventListener('load', () => preview.classList.add('loaded'), { once: true });
      if (typeof preview.showModal === 'function') preview.showModal();
      else preview.setAttribute('open', '');
    });
  });

  previewClose?.addEventListener('click', closePreview);
  preview?.addEventListener('click', event => {
    if (event.target === preview) closePreview();
  });
  addEventListener('keydown', event => {
    if (event.key === 'Escape' && preview?.open) closePreview();
  });
})();
