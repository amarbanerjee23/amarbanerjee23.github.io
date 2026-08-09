(() => {
  if (!document.body) return;

  if (!document.querySelector('link[href="/assets/css/trust-conversion.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/assets/css/trust-conversion.css';
    document.head.appendChild(link);
  }

  const pageName = location.pathname.split('/').pop() || 'index.html';
  const isHome = pageName === 'index.html' || pageName === '';
  const isAcademic = pageName === 'academic-partnerships.html';
  const isGallery = pageName === 'facilitation-gallery.html';
  const isResearch = pageName === 'research-ip.html';

  const preferredName = 'Dr Amar Banerjee';
  document.querySelectorAll('.brand strong').forEach(node => { node.textContent = preferredName; });
  document.querySelectorAll('.brand small').forEach(node => { node.textContent = 'Innovation · Research · Future Readiness'; });

  const nav = document.querySelector('.nav');
  const setNav = items => {
    if (!nav) return;
    nav.innerHTML = items.map(([label, href]) => `<a href="${href}">${label}</a>`).join('');
  };

  if (isHome) {
    setNav([
      ['Why now', '#overview'],
      ['Student innovation', '#innovation'],
      ['Evidence', '#evidence'],
      ['Programs', 'workshops.html'],
      ['About & work', 'profile.html'],
      ['For institutions', 'academic-partnerships.html']
    ]);
  } else if (pageName === 'workshops.html') {
    setNav([
      ['Home', 'index.html'],
      ['Innovation', '#student-innovation'],
      ['Research', '#research-excellence'],
      ['Patents', '#patent-thinking'],
      ['Brochures', '#downloads'],
      ['Discuss', 'academic-partnerships.html#conversation']
    ]);
  } else if (isAcademic) {
    setNav([
      ['Home', 'index.html'],
      ['Opportunity', '#diagnose'],
      ['Outcomes', '#outcomes'],
      ['Decision view', '#decision'],
      ['Evidence', '#evidence'],
      ['Discuss', '#conversation']
    ]);
  } else if (isGallery) {
    setNav([
      ['Home', 'index.html'],
      ['Programs', 'workshops.html'],
      ['Evidence', '#posts'],
      ['Research & IP', 'research-ip.html'],
      ['About & work', 'profile.html'],
      ['Discuss', 'academic-partnerships.html#conversation']
    ]);
  } else if (isResearch) {
    setNav([
      ['Home', 'index.html'],
      ['Themes', '#themes'],
      ['Selected work', '#publications'],
      ['Patents', '#patents'],
      ['About & work', 'profile.html'],
      ['Discuss', 'academic-partnerships.html#conversation']
    ]);
  }

  document.querySelector('.academic-leader-invite')?.remove();

  if (isHome) {
    const thesis = document.querySelector('.hero-thesis');
    if (thesis && !document.querySelector('.tc-positioning')) {
      const line = document.createElement('p');
      line.className = 'tc-positioning';
      line.innerHTML = '<strong>I help universities build innovation-ready students</strong> through structured programs in problem discovery, research excellence and patent thinking.';
      thesis.insertAdjacentElement('afterend', line);
    }

    const innovation = document.getElementById('innovation');
    if (innovation && !document.getElementById('evidence')) {
      const evidence = document.createElement('section');
      evidence.className = 'section tc-evidence-section';
      evidence.id = 'evidence';
      evidence.innerHTML = `
        <div class="container">
          <div class="tc-section-head reveal">
            <small>Evidence in action</small>
            <h2>See the work before reading another claim.</h2>
            <p>Selected public engagements show how complex ideas are turned into dialogue, participation and practical next steps for learners.</p>
          </div>
          <div class="tc-evidence-grid reveal">
            <a class="tc-evidence-card" href="facilitation-gallery.html#tech-healthcare">
              <div class="tc-evidence-media"><img src="https://media.licdn.com/dms/image/v2/D5622AQGIRaPV-XNpCA/feedshare-shrink_800/B56ZmFjV7dJsAo-/0/1758882259584?e=2147483647&amp;t=swxKCnT9FVvLAzwiKhPvhTDuYfFUvHs4SMyWkRnW-dM&amp;v=beta" alt="Tech-Enabled Healthcare workshop" loading="lazy" referrerpolicy="no-referrer"></div>
              <div class="tc-evidence-copy"><small>Workshop</small><h3>Tech-Enabled Healthcare</h3><p>Practical AI and healthcare innovation explained through memorable decision principles rather than technical overload.</p><b>View evidence →</b></div>
            </a>
            <a class="tc-evidence-card" href="facilitation-gallery.html#ai-summit">
              <div class="tc-evidence-media"><img src="https://media.licdn.com/dms/image/v2/D4D22AQHLTybhaFswuQ/feedshare-shrink_800/feedshare-shrink_800/0/1714328220512?e=2147483647&amp;t=_sYsSAHBPQMbTHpi55IjALrokVO8E_uYYnjh1ymjM60&amp;v=beta" alt="AI-Industry Summit panel" loading="lazy" referrerpolicy="no-referrer"></div>
              <div class="tc-evidence-copy"><small>Academic dialogue</small><h3>AI and education conversation</h3><p>A public discussion connecting emerging technology with education, readiness and the changing expectations around learners.</p><b>View evidence →</b></div>
            </a>
            <a class="tc-evidence-card" href="facilitation-gallery.html#ieee-mentoring">
              <div class="tc-evidence-media"><img src="/assets/media/portraits/headshot.png" alt="Dr Amar Banerjee" loading="lazy"></div>
              <div class="tc-evidence-copy"><small>Student mentoring</small><h3>Scientific mindset and career thinking</h3><p>Mentoring students to connect curiosity, evidence, research thinking and professional direction rather than chasing credentials alone.</p><b>View evidence →</b></div>
            </a>
          </div>
        </div>`;
      innovation.insertAdjacentElement('afterend', evidence);
    }

    const institutional = document.getElementById('institutional');
    if (institutional && !document.querySelector('.tc-diagnostic-section')) {
      const diagnostic = document.createElement('section');
      diagnostic.className = 'section soft tc-diagnostic-section';
      diagnostic.innerHTML = `
        <div class="container">
          <div class="tc-section-head reveal"><small>Start with the problem</small><h2>Which capability is currently hardest for your students?</h2><p>You do not need to choose a program first. Choose the academic problem you want to change.</p></div>
          <div class="tc-diagnostic-grid reveal">
            <a class="tc-diagnostic-card" href="workshops.html#student-innovation"><small>If students...</small><h3>wait for problem statements</h3><p>Build problem sensing, framing, structured creativity and evidence-backed innovation.</p><span>Innovation Thinking Lab →</span></a>
            <a class="tc-diagnostic-card" href="workshops.html#research-excellence"><small>If research...</small><h3>exists but novelty or rigor is inconsistent</h3><p>Strengthen problem choice, venue-aware reading, reviewer thinking and evidence architecture.</p><span>Research Excellence Track →</span></a>
            <a class="tc-diagnostic-card" href="workshops.html#patent-thinking"><small>If projects...</small><h3>are strong but IP potential is unclear</h3><p>Develop prior-art, novelty, non-obviousness and paper-versus-patent judgement.</p><span>Patent Thinking Lab →</span></a>
          </div>
        </div>`;
      institutional.insertAdjacentElement('beforebegin', diagnostic);
    }
  }

  if (isAcademic && !document.getElementById('decision')) {
    const programs = document.getElementById('programs');
    if (programs) {
      const decision = document.createElement('section');
      decision.className = 'section tc-executive-section';
      decision.id = 'decision';
      decision.innerHTML = `
        <div class="container">
          <div class="tc-section-head reveal"><small>Executive decision view</small><h2>A low-risk way to begin.</h2><p>This is the institutional proposition in one screen: who it is for, what changes, what students produce and how the first engagement begins.</p></div>
          <div class="tc-executive-grid reveal">
            <div class="tc-executive-table">
              <div class="tc-executive-row"><b>For whom</b><span>Undergraduate, postgraduate, research, project, innovation-cell and interdisciplinary cohorts.</span></div>
              <div class="tc-executive-row"><b>Current gap</b><span>Students execute assigned work but need stronger problem discovery, research judgement or invention thinking.</span></div>
              <div class="tc-executive-row"><b>Intervention</b><span>A contextualised innovation, research or patent-thinking program using the cohort's discipline and real problems.</span></div>
              <div class="tc-executive-row"><b>Formats</b><span>90–120 minute provocation, half/full-day applied lab, 3–6 session series, or a mentored cohort journey.</span></div>
              <div class="tc-executive-row"><b>Tangible outputs</b><span>Problem maps, reframed challenges, evidence plans, research questions, novelty maps, invention canvases and next-step reviews.</span></div>
              <div class="tc-executive-row"><b>Success signal</b><span>Students can explain what problem matters, why their direction is non-obvious, what evidence is needed and what should happen next.</span></div>
            </div>
            <aside class="tc-next-step"><small>What happens next</small><h3>No generic sales call.</h3><ol><li>20-minute exploratory conversation.</li><li>Clarify cohort, discipline and desired capability.</li><li>Recommend the smallest credible starting format.</li><li>Share a no-obligation engagement proposal.</li></ol><a class="btn primary btn-arrow" href="#conversation">Request an exploratory conversation <span>→</span></a><p>Start with one cohort. Expand only if the first engagement creates value.</p></aside>
          </div>
        </div>`;
      programs.insertAdjacentElement('beforebegin', decision);
    }
  }

  if (isResearch) {
    const section = document.getElementById('publications');
    const cards = section?.querySelectorAll('.publication-card');
    if (section && cards && cards.length > 6 && !section.querySelector('.tc-research-toggle')) {
      section.classList.add('tc-collapsed');
      const grid = section.querySelector('.publication-grid');
      const controls = document.createElement('div');
      controls.className = 'tc-research-toggle';
      controls.innerHTML = '<button type="button" aria-expanded="false">View complete publication list</button>';
      grid?.insertAdjacentElement('afterend', controls);
      controls.querySelector('button')?.addEventListener('click', event => {
        const collapsed = section.classList.toggle('tc-collapsed');
        event.currentTarget.setAttribute('aria-expanded', String(!collapsed));
        event.currentTarget.textContent = collapsed ? 'View complete publication list' : 'Show selected publications only';
      });
    }
  }

  const contactShells = document.querySelectorAll('.future-contact-shell,.profile-contact-shell,.academic-conversation-shell');
  contactShells.forEach(shell => {
    const intro = shell.firstElementChild;
    if (!intro || intro.querySelector('.tc-contact-process')) return;
    const process = document.createElement('div');
    process.className = 'tc-contact-process';
    process.setAttribute('aria-label', 'What happens after you get in touch');
    process.innerHTML = '<div><small>01 · Explore</small><span>Clarify the cohort and the capability you want to build.</span></div><div><small>02 · Recommend</small><span>Choose the smallest format that can create a meaningful change.</span></div><div><small>03 · Decide</small><span>Review a clear, no-obligation engagement proposal.</span></div>';
    intro.appendChild(process);
  });
})();
