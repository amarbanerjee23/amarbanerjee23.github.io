(() => {
  if (!document.body) return;

  if (!document.querySelector('link[href="/assets/css/contact-intake.css"]')) {
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = '/assets/css/contact-intake.css';
    document.head.appendChild(stylesheet);
  }

  const shells = document.querySelectorAll('.future-contact-shell,.profile-contact-shell,.academic-conversation-shell');
  if (!shells.length) return;

  shells.forEach((shell, index) => {
    if (shell.querySelector('.contact-intake')) return;

    const previousActions = shell.querySelector('.actions');
    const form = document.createElement('form');
    form.className = 'contact-intake';
    form.setAttribute('aria-label', 'Send an academic enquiry');
    form.innerHTML = `
      <div class="contact-intake-head">
        <small>Request an exploratory conversation</small>
        <h3>Tell me which students you want to think differently.</h3>
        <p>A short note is enough. The first conversation is about fit, cohort and desired capability, not a sales pitch.</p>
      </div>
      <div class="contact-intake-fields">
        <div class="contact-intake-field">
          <label for="institution-${index}">Institution name</label>
          <input id="institution-${index}" name="institution" type="text" autocomplete="organization" required placeholder="e.g. ABC University">
        </div>
        <div class="contact-intake-field">
          <label for="email-${index}">Email ID</label>
          <input id="email-${index}" name="email" type="email" inputmode="email" autocomplete="email" required placeholder="name@institution.edu">
        </div>
        <div class="contact-intake-field full">
          <label for="message-${index}">Message</label>
          <textarea id="message-${index}" name="message" required placeholder="Tell me about the student cohort, research group or innovation capability you would like to develop."></textarea>
        </div>
      </div>
      <div class="contact-intake-actions">
        <button class="contact-intake-submit" type="submit">Prepare enquiry email</button>
        <a class="contact-intake-direct" href="mailto:amarbanerjee23@gmail.com">amarbanerjee23@gmail.com</a>
      </div>
      <p class="contact-intake-privacy">Nothing typed here is stored by this website. Submitting opens your email application so you can review and send the message.</p>
      <p class="contact-intake-status" role="status" aria-live="polite"></p>`;

    if (previousActions) previousActions.replaceWith(form);
    else shell.appendChild(form);

    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.reportValidity()) return;

      const data = new FormData(form);
      const institution = String(data.get('institution') || '').trim();
      const email = String(data.get('email') || '').trim();
      const message = String(data.get('message') || '').trim();
      const subject = `Academic innovation enquiry - ${institution}`;
      const body = [
        `Institution: ${institution}`,
        `Email ID: ${email}`,
        '',
        'Message:',
        message,
        '',
        `Sent from: ${location.href}`
      ].join('\n');

      const status = form.querySelector('.contact-intake-status');
      if (status) status.textContent = 'Opening your email application…';
      location.href = `mailto:amarbanerjee23@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      setTimeout(() => { if (status) status.textContent = 'Your email app should now be ready with the message.'; }, 700);
    });
  });
})();
