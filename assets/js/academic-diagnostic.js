(() => {
  const form = document.getElementById('innovation-diagnostic-form');
  if (!form) return;

  const status = document.getElementById('diagnostic-status');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const institution = String(data.get('institution') || '').trim();
    const role = String(data.get('role') || '').trim();
    const cohort = String(data.get('cohort') || '').trim();
    const priority = String(data.get('priority') || '').trim();
    const email = String(data.get('email') || '').trim();
    const context = String(data.get('context') || '').trim();

    if (!institution || !role || !cohort || !priority || !email) {
      if (status) status.textContent = 'Please complete the five required fields.';
      return;
    }

    const subject = `20-minute Institutional Innovation Diagnostic - ${institution}`;
    const body = [
      'Hello Dr Amar Banerjee,',
      '',
      'I would like to request a 20-minute Institutional Innovation Diagnostic.',
      '',
      `Institution: ${institution}`,
      `My role: ${role}`,
      `Cohort / department: ${cohort}`,
      `Priority to strengthen: ${priority}`,
      `My email: ${email}`,
      context ? `Additional context: ${context}` : '',
      '',
      'I would like to identify one priority capability, one suitable pilot cohort, one measurable outcome and one practical starting format.',
      '',
      'Regards,'
    ].filter(Boolean).join('\n');

    if (status) status.textContent = 'Opening your email client with the context pre-filled.';
    window.location.href = `mailto:amarbanerjee23@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
})();
