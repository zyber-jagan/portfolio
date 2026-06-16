import { useCallback, useState } from 'react';

const EMAIL = 'sureyasureya001@gmail.com';

function sanitize(value, max = 500) {
  return String(value || '').replace(/[<>"'`\\]/g, '').trim().slice(0, max);
}

function isValidEmail(email) {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const name = sanitize(form.name, 80);
      const email = sanitize(form.email, 120).toLowerCase();
      const subject = sanitize(form.subject, 120);
      const message = sanitize(form.message, 2000);
      const nextErrors = {};

      if (!name) nextErrors.name = 'Enter your name.';
      if (!email || !isValidEmail(email)) nextErrors.email = 'Enter a valid email.';
      if (!subject) nextErrors.subject = 'Enter a subject.';
      if (!message) nextErrors.message = 'Enter your message.';

      if (Object.keys(nextErrors).length) {
        setErrors(nextErrors);
        setStatus('');
        return;
      }

      setSubmitting(true);
      const body = `${message}\n\n— ${name}\n${email}`;
      const mailto = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      window.location.href = mailto;
      setStatus('Opening your email app to send the message.');
      setErrors({});
      setSubmitting(false);
      setForm({ name: '', email: '', subject: '', message: '' });
    },
    [form]
  );

  return (
    <form className="contact-form react-contact-form" onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <input
          type="text"
          placeholder="Your Name"
          className={errors.name ? 'input-invalid' : ''}
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
        />
        {errors.name && <span className="field-error">{errors.name}</span>}
      </div>
      <div className="form-group">
        <input
          type="email"
          placeholder="Your Email"
          className={errors.email ? 'input-invalid' : ''}
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
        />
        {errors.email && <span className="field-error">{errors.email}</span>}
      </div>
      <div className="form-group">
        <input
          type="text"
          placeholder="Subject"
          className={errors.subject ? 'input-invalid' : ''}
          value={form.subject}
          onChange={(e) => update('subject', e.target.value)}
        />
        {errors.subject && <span className="field-error">{errors.subject}</span>}
      </div>
      <div className="form-group">
        <textarea
          placeholder="Your Message"
          rows={5}
          className={errors.message ? 'input-invalid' : ''}
          value={form.message}
          onChange={(e) => update('message', e.target.value)}
        />
        {errors.message && <span className="field-error">{errors.message}</span>}
      </div>
      {status && <p className="contact-form-status">{status}</p>}
      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? 'Opening email…' : 'Send Message'}
      </button>
    </form>
  );
}
