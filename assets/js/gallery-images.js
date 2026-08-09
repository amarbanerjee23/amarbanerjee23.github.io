(() => {
  const dialog = document.getElementById('image-preview');
  const previewImage = dialog?.querySelector('.image-preview-stage img');
  const previewTitle = document.getElementById('image-preview-title');
  const previewLink = dialog?.querySelector('.image-preview-actions a');
  const closeButton = dialog?.querySelector('.image-preview-close');
  const imageButtons = [...document.querySelectorAll('.gallery-image-button')];

  const closeDialog = () => {
    if (!dialog) return;
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
    dialog.classList.remove('loaded');
    if (previewImage) previewImage.removeAttribute('src');
  };

  imageButtons.forEach(button => {
    const image = button.querySelector('img');
    if (!image) return;

    image.addEventListener('error', () => {
      button.classList.add('image-failed');
      button.setAttribute('aria-label', 'LinkedIn image is temporarily unavailable');
    });

    button.addEventListener('click', () => {
      if (!dialog || !previewImage) return;
      const source = image.currentSrc || image.src;
      if (!source || button.classList.contains('image-failed')) return;

      dialog.classList.remove('loaded');
      previewImage.src = source;
      previewImage.alt = image.alt;
      if (previewTitle) previewTitle.textContent = button.dataset.imageTitle || image.alt || 'Facilitation image';
      if (previewLink) previewLink.href = button.dataset.postUrl || '#';
      previewImage.addEventListener('load', () => dialog.classList.add('loaded'), { once: true });

      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    });
  });

  closeButton?.addEventListener('click', closeDialog);
  dialog?.addEventListener('click', event => {
    if (event.target === dialog) closeDialog();
  });
  addEventListener('keydown', event => {
    if (event.key === 'Escape' && dialog?.open) closeDialog();
  });
})();
