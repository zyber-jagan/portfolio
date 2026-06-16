import { useCallback, useMemo, useState } from 'react';
import { BOOKING_CONFIG } from './config';
import {
  buildWhatsAppMessage,
  checkRateLimit,
  formatDate,
  generateBookingRef,
  getDateBounds,
  isValidEmail,
  isValidIndianMobile,
  recordSubmission,
  sanitizePhone,
  sanitizeText,
  slotLabel,
} from './utils';

const EMPTY = {
  name: '',
  age: '',
  mobile: '',
  email: '',
  service: '',
  date: '',
  slot: '',
  terms: false,
  website: '',
};

function validate(data, showErrors) {
  const errors = {};
  const name = sanitizeText(data.name, BOOKING_CONFIG.maxNameLength);
  const ageRaw = String(data.age).trim();
  const mobile = sanitizePhone(data.mobile);
  const email = sanitizeText(data.email, BOOKING_CONFIG.maxEmailLength).toLowerCase();

  if (data.website) return { valid: false, errors: { _form: 'Unable to process request.' }, data: null };

  if (!name || name.length < 2) errors.name = 'Enter your full name (at least 2 characters).';

  const age = parseInt(ageRaw, 10);
  if (!ageRaw || Number.isNaN(age) || age < BOOKING_CONFIG.minAge || age > BOOKING_CONFIG.maxAge) {
    errors.age = `Age must be between ${BOOKING_CONFIG.minAge} and ${BOOKING_CONFIG.maxAge}.`;
  }

  if (!isValidIndianMobile(mobile)) errors.mobile = 'Enter a valid 10-digit Indian mobile number.';
  if (!email || !isValidEmail(email)) errors.email = 'Enter a valid email address.';
  if (!data.service) errors.service = 'Please select a service.';

  if (!data.date) {
    errors.date = 'Pick your preferred date.';
  } else {
    const { today, maxDate } = getDateBounds();
    const picked = new Date(`${data.date}T00:00:00`);
    if (picked < today || picked > maxDate) {
      errors.date = `Date must be within the next ${BOOKING_CONFIG.maxBookingDaysAhead} days.`;
    }
  }

  const enabledSlots = BOOKING_CONFIG.timeSlots.filter((s) => s.enabled !== false);
  if (!data.slot || !enabledSlots.some((s) => s.value === data.slot)) {
    errors.slot = 'Choose a valid time slot.';
  }

  if (!data.terms) errors.terms = 'You must agree to the terms before booking.';

  if (!showErrors) {
    if (Object.keys(errors).length) return { valid: false, errors: {}, data: null };
  }

  if (Object.keys(errors).length) return { valid: false, errors, data: null };

  return {
    valid: true,
    errors: {},
    data: { name, age, mobile, email, service: data.service, date: data.date, slot: data.slot },
  };
}

export default function BookingForm() {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ message: '', type: '' });
  const [rateLimited, setRateLimited] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewRef, setPreviewRef] = useState('');

  const dateBounds = useMemo(() => getDateBounds(), []);
  const enabledSlots = useMemo(
    () => BOOKING_CONFIG.timeSlots.filter((s) => s.enabled !== false),
    []
  );

  const preview = useMemo(() => {
    const result = validate(form, false);
    if (!result.data) return null;
    const ref = previewRef || generateBookingRef();
    return buildWhatsAppMessage(result.data, ref);
  }, [form, previewRef]);

  const update = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setPreviewRef('');
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  }, [errors]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();

      if (!checkRateLimit()) {
        setRateLimited(true);
        setStatus({ message: 'Too many attempts. Please wait an hour and try again.', type: 'error' });
        return;
      }

      const result = validate(form, true);
      if (!result.valid) {
        setErrors(result.errors);
        setStatus({ message: result.errors._form || 'Please fix the errors below.', type: 'error' });
        return;
      }

      setSubmitting(true);
      setErrors({});
      recordSubmission();

      const ref = generateBookingRef();
      const built = buildWhatsAppMessage(result.data, ref);
      const url = `https://wa.me/${BOOKING_CONFIG.whatsappNumber}?text=${encodeURIComponent(built.message)}`;

      setStatus({
        message: 'Opening WhatsApp — tap Send there to confirm your booking.',
        type: 'success',
      });

      window.setTimeout(() => {
        window.open(url, '_blank', 'noopener,noreferrer');
        setSubmitting(false);
        setPreviewRef('');
      }, 400);
    },
    [form]
  );

  return (
    <form className="booking-form" onSubmit={handleSubmit} noValidate>
      <div className="booking-honeypot" aria-hidden="true">
        <label htmlFor="booking-website">Website</label>
        <input
          type="text"
          id="booking-website"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={(e) => update('website', e.target.value)}
        />
      </div>

      <div className="booking-field">
        <label htmlFor="booking-name">Full Name <span className="req">*</span></label>
        <input
          type="text"
          id="booking-name"
          className={errors.name ? 'input-invalid' : ''}
          maxLength={60}
          placeholder="Your full name"
          autoComplete="name"
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
        />
        {errors.name && <span className="field-error">{errors.name}</span>}
      </div>

      <div className="booking-field-row">
        <div className="booking-field">
          <label htmlFor="booking-age">Age <span className="req">*</span></label>
          <input
            type="number"
            id="booking-age"
            className={errors.age ? 'input-invalid' : ''}
            min={BOOKING_CONFIG.minAge}
            max={BOOKING_CONFIG.maxAge}
            placeholder="25"
            inputMode="numeric"
            value={form.age}
            onChange={(e) => update('age', e.target.value)}
          />
          {errors.age && <span className="field-error">{errors.age}</span>}
        </div>
        <div className="booking-field">
          <label htmlFor="booking-mobile">Mobile Number <span className="req">*</span></label>
          <div className="phone-input-wrap">
            <span className="phone-prefix">+91</span>
            <input
              type="tel"
              id="booking-mobile"
              className={errors.mobile ? 'input-invalid' : ''}
              maxLength={10}
              placeholder="9876543210"
              inputMode="numeric"
              autoComplete="tel-national"
              value={form.mobile}
              onChange={(e) => update('mobile', e.target.value)}
            />
          </div>
          {errors.mobile && <span className="field-error">{errors.mobile}</span>}
        </div>
      </div>

      <div className="booking-field">
        <label htmlFor="booking-email">Email ID <span className="req">*</span></label>
        <input
          type="email"
          id="booking-email"
          className={errors.email ? 'input-invalid' : ''}
          maxLength={120}
          placeholder="you@email.com"
          autoComplete="email"
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
        />
        {errors.email && <span className="field-error">{errors.email}</span>}
      </div>

      <div className="booking-field">
        <label htmlFor="booking-service">Service <span className="req">*</span></label>
        <select
          id="booking-service"
          className={errors.service ? 'input-invalid' : ''}
          value={form.service}
          onChange={(e) => update('service', e.target.value)}
        >
          <option value="">Select a service</option>
          {BOOKING_CONFIG.services.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        {errors.service && <span className="field-error">{errors.service}</span>}
      </div>

      <div className="booking-field-row">
        <div className="booking-field">
          <label htmlFor="booking-date">Preferred Date <span className="req">*</span></label>
          <input
            type="date"
            id="booking-date"
            className={errors.date ? 'input-invalid' : ''}
            min={dateBounds.min}
            max={dateBounds.max}
            value={form.date}
            onChange={(e) => update('date', e.target.value)}
          />
          {errors.date && <span className="field-error">{errors.date}</span>}
        </div>
        <div className="booking-field">
          <label htmlFor="booking-slot">Time Slot <span className="req">*</span></label>
          <select
            id="booking-slot"
            className={errors.slot ? 'input-invalid' : ''}
            value={form.slot}
            onChange={(e) => update('slot', e.target.value)}
          >
            <option value="">Choose a slot</option>
            {enabledSlots.map((slot) => (
              <option key={slot.value} value={slot.value}>{slot.label}</option>
            ))}
          </select>
          {errors.slot && <span className="field-error">{errors.slot}</span>}
        </div>
      </div>

      <div className="booking-terms">
        <label className="terms-label">
          <input
            type="checkbox"
            checked={form.terms}
            onChange={(e) => update('terms', e.target.checked)}
          />
          <span>
            I confirm this is a <strong>legitimate fitness coaching</strong> request only. I will not use
            this form for spam, fraud, or illegal activity. I agree to share payment proof only via
            WhatsApp after UPI payment to the verified ID above.
          </span>
        </label>
        {errors.terms && <span className="field-error">{errors.terms}</span>}
      </div>

      {preview && (
        <div className="booking-preview">
          <strong>Preview — this goes to Jagan on WhatsApp:</strong>
          <pre className="booking-preview-text">{preview.message}</pre>
        </div>
      )}

      {status.message && (
        <div className={`booking-status booking-status--${status.type}`} role="status" aria-live="polite">
          {status.message}
        </div>
      )}

      {rateLimited && (
        <p className="booking-rate-limit">
          <i className="fas fa-clock" /> Rate limit reached. Try again in about an hour.
        </p>
      )}

      <button type="submit" className="booking-submit-btn" disabled={submitting}>
        {submitting ? (
          <><i className="fas fa-spinner fa-spin" /> Opening WhatsApp…</>
        ) : (
          <><i className="fab fa-whatsapp" /> Send Booking to WhatsApp</>
        )}
      </button>

      <p className="booking-form-note">
        <i className="fas fa-info-circle" /> Tap Send in WhatsApp to reach <strong>+91 7358097322</strong>.
        Your details are not stored on this website.
      </p>
    </form>
  );
}
