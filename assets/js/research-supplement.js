(() => {
  if (!document.body.classList.contains('research-page')) return;
  const grid = document.querySelector('.publication-grid');
  if (!grid) return;

  const records = [
    {
      key: 'mc-domain-map-maker',
      year: '2016',
      venue: 'SPIE',
      title: 'M&C Domain Map Maker: an Environment Complementing MDE with M&C Knowledge and Ensuring Solution Completeness',
      simple: 'captures monitoring-and-control domain knowledge inside a modelling environment so engineers can reuse vocabulary, validate solutions and reduce missing design information.'
    },
    {
      key: 'data-driven-simulation-framework',
      year: '2015',
      venue: 'ICALEPCS',
      title: 'Data Driven Simulation Framework',
      simple: 'replaces one-off control-system simulators with a reusable engine driven by structured simulation descriptions, reducing repeated development work.'
    },
    {
      key: 'reusability-control-systems-journey',
      year: '2015',
      venue: 'ICALEPCS',
      title: 'Towards Building Reusability in Control Systems - A Journey',
      simple: 'describes a progression from reusable control architecture to shared domain vocabulary, modelling and simulation so similar control systems do not need to be engineered from zero.'
    }
  ];

  records.forEach(record => {
    if (grid.querySelector(`[data-publication-key="${record.key}"]`)) return;
    const article = document.createElement('article');
    article.className = 'publication-card reveal visible';
    article.dataset.publicationKey = record.key;
    article.innerHTML = `<div class="publication-meta"><span>${record.year}</span><b>${record.venue}</b></div><h3>${record.title}</h3><p><strong>In simple terms:</strong> ${record.simple}</p>`;
    grid.appendChild(article);
  });
})();
