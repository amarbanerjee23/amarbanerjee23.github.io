/* Sends enquiries to the hosted backend, which stores them and commits a
   copy into this repository. Falls back to email if the backend is
   unreachable, so the form never becomes a dead end. */
(() => {
  const ENDPOINT = 'https://project--7374d8c4-7bb8-40ff-942c-f335a72309bd.lovable.app/api/public/enquiries';
  const MAIL = 'amarbanerjee23@gmail.com';

  const form = document.getElementById('innovation-diagnostic-form');
  if (!form) return;

  const status = document.getElementById('diagnostic-status');
  const say = (text) => { if (status) status.textContent = text; };

  // Honeypot: invisible to people, tempting to bots.
  if (!form.querySelector('input[name="website"]')) {
    const trap = document.createElement('input');
    trap.type = 'text';
    trap.name = 'website';
    trap.tabIndex = -1;
    trap.autocomplete = 'off';
    trap.setAttribute('aria-hidden', 'true');
    trap.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;opacity:0';
    form.appendChild(trap);
  }

  const mailtoFallback = (fields) => {
    const subject = `20-minute Institutional Innovation Diagnostic - ${fields.institution}`;
    const body = [
      'Hello Dr Amar Banerjee,',
      '',
      'I would like to request a 20-minute Institutional Innovation Diagnostic.',
      '',
      `Institution: ${fields.institution}`,
      `My role: ${fields.role}`,
      `Cohort / department: ${fields.cohort}`,
      `Priority to strengthen: ${fields.priority}`,
      `My email: ${fields.email}`,
      fields.context ? `Additional context: ${fields.context}` : '',
      '',
      'Regards,'
    ].filter(Boolean).join('\n');
    window.location.href = `mailto:${MAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  document.addEventListener('submit', (event) => {
    if (event.target !== form) return;
    event.preventDefault();
    event.stopPropagation();

    const data = new FormData(form);
    const value = (name) => String(data.get(name) || '').trim();
    const fields = {
      institution: value('institution'),
      role: value('role'),
      cohort: value('cohort'),
      priority: value('priority'),
      email: value('email'),
      context: value('context'),
      website: value('website')
    };

    if (!fields.institution || !fields.role || !fields.cohort || !fields.priority || !fields.email) {
      say('Please complete the five required fields.');
      return;
    }

    const button = form.querySelector('button[type="submit"]');
    if (button) button.disabled = true;
    say('Sending your request…');

    const message = [
      `Role: ${fields.role}`,
      `Cohort / department: ${fields.cohort}`,
      `Priority to strengthen: ${fields.priority}`,
      fields.context ? `Context: ${fields.context}` : ''
    ].filter(Boolean).join('\n');

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        institution: fields.institution,
        email: fields.email,
        message,
        source: 'academic-partnerships diagnostic form',
        website: fields.website
      })
    })
      .then((response) => {
        if (!response.ok) throw new Error(`Request failed: ${response.status}`);
        return response.json();
      })
      .then(() => {
        form.reset();
        say('Thank you. Your diagnostic request has been received and you will hear back by email.');
      })
      .catch((error) => {
        console.error(error);
        say('The form could not send just now, so your email client is opening with the details.');
        mailtoFallback(fields);
      })
      .finally(() => {
        if (button) button.disabled = false;
      });
  }, true);
})();
