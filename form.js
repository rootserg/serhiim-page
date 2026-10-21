<script>
(() => {
  const form = document.getElementById("hosted-form-01a038dc-a3ca-75b4-a84e-0d6e312ed189");
  const endpoint = "https://forms-api-d.aimix.io/v1/submissions";
  const status = form.querySelector('.hosted-form__status');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    const data = new FormData(form);
    const controls = [...form.querySelectorAll('[data-field-type]')];
    const emailControl = controls.find(control => control.type === 'email' || control.name === 'email');
    const phoneControl = controls.find(control => control.type === 'tel' || control.name === 'phone');
    const email = emailControl ? String(data.get(emailControl.name) || '').trim() : '';
    const phone = phoneControl ? String(data.get(phoneControl.name) || '').trim() : '';

    if (!email && !phone) {
      status.textContent = 'This form requires an email or phone field.';
      status.dataset.state = 'error';
      return;
    }

    const consents = [...form.querySelectorAll('[data-consent-types]:checked')].flatMap(control =>
      control.dataset.consentTypes.split(',').filter(Boolean).map(consentType => ({
        consentType,
        status: 'granted',
        grantedAt: new Date().toISOString(),
        consentText: control.parentElement.innerText.trim(),
      }))
    );
    const payload = {
      formId: "01a038dc-a3ca-75b4-a84e-0d6e312ed189",
      contact: email ? { email } : { phone: { number: phone, country: 'ZZ' } },
      formData: { fields: controls.map(control => ({
        fieldId: control.name,
        fieldType: control.dataset.fieldType,
        value: control.type === 'checkbox' ? control.checked : String(data.get(control.name) || ''),
      })) },
      consents,
    };

    button.disabled = true;
    status.textContent = 'Sending…';
    delete status.dataset.state;
    try {
      const response = await window['fetch'](endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error((await response.json().catch(() => null))?.message || 'Submission failed');
      form.reset();
      status.textContent = 'Thank you. Your response has been received.';
    } catch (error) {
      status.textContent = error instanceof Error ? error.message : 'Submission failed';
      status.dataset.state = 'error';
    } finally {
      button.disabled = false;
    }
  });
})();
</script>
