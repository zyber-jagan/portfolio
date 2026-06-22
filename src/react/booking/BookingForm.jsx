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
  serviceLabel,
  saveBookingLocally,
} from './utils';

const EMPTY = {
  name: '',
  age: '',
  gender: '',
  weight: '',
  height: '',
  email: '',
  mobile: '',
  goal: '',
  service: '',
  date: '',
  terms: false,
  website: '',
};

function validate(data, showErrors) {
  const errors = {};
  const name = sanitizeText(data.name, BOOKING_CONFIG.maxNameLength);
  const ageRaw = String(data.age).trim();
  const gender = data.gender;
  const weightRaw = String(data.weight).trim();
  const heightRaw = String(data.height).trim();
  const mobile = sanitizePhone(data.mobile);
  const email = sanitizeText(data.email, BOOKING_CONFIG.maxEmailLength).toLowerCase();
  const goal = data.goal;

  if (data.website) return { valid: false, errors: { _form: 'Unable to process request.' }, data: null };

  if (!name || name.length < 2) errors.name = 'Enter your full name (at least 2 characters).';

  const age = parseInt(ageRaw, 10);
  if (!ageRaw || Number.isNaN(age) || age < BOOKING_CONFIG.minAge || age > BOOKING_CONFIG.maxAge) {
    errors.age = `Age must be between ${BOOKING_CONFIG.minAge} and ${BOOKING_CONFIG.maxAge}.`;
  }

  if (!gender) errors.gender = 'Select your gender.';

  const weight = parseFloat(weightRaw);
  if (!weightRaw || Number.isNaN(weight) || weight < BOOKING_CONFIG.minWeight || weight > BOOKING_CONFIG.maxWeight) {
    errors.weight = `Weight must be between ${BOOKING_CONFIG.minWeight} and ${BOOKING_CONFIG.maxWeight} kg.`;
  }

  const height = parseFloat(heightRaw);
  if (!heightRaw || Number.isNaN(height) || height < BOOKING_CONFIG.minHeight || height > BOOKING_CONFIG.maxHeight) {
    errors.height = `Height must be between ${BOOKING_CONFIG.minHeight} and ${BOOKING_CONFIG.maxHeight} cm.`;
  }

  if (!isValidIndianMobile(mobile)) errors.mobile = 'Enter a valid 10-digit Indian mobile number.';
  if (!email || !isValidEmail(email)) errors.email = 'Enter a valid email address.';
  if (!goal) errors.goal = 'Select your fitness goal.';
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

  if (!data.terms) errors.terms = 'You must agree to the terms before booking.';

  if (!showErrors) {
    if (Object.keys(errors).length) return { valid: false, errors: {}, data: null };
  }

  if (Object.keys(errors).length) return { valid: false, errors, data: null };

  return {
    valid: true,
    errors: {},
    data: { name, age, gender, weight, height, mobile, email, goal, service: data.service, date: data.date },
  };
}

export default function BookingForm() {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ message: '', type: '' });
  const [rateLimited, setRateLimited] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState('form'); // 'form' | 'summary' | 'success'
  const [savedBooking, setSavedBooking] = useState(null);
  const [whatsappUrl, setWhatsappUrl] = useState('');

  const dateBounds = useMemo(() => getDateBounds(), []);

  const selectedService = useMemo(() => {
    return BOOKING_CONFIG.services.find((s) => s.value === form.service);
  }, [form.service]);

  const update = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  }, [errors]);

  const handleReview = useCallback(
    (e) => {
      e.preventDefault();

      const result = validate(form, true);
      if (!result.valid) {
        setErrors(result.errors);
        setStatus({ message: result.errors._form || 'Please fix the errors below.', type: 'error' });
        return;
      }

      setErrors({});
      setStatus({ message: '', type: '' });
      setStep('summary');
    },
    [form]
  );

  const handleConfirm = useCallback(
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
        setStatus({ message: 'Validation failed. Please edit details and fix errors.', type: 'error' });
        setStep('form');
        return;
      }

      setSubmitting(true);
      setErrors({});
      recordSubmission();

      const ref = generateBookingRef();
      const built = buildWhatsAppMessage(result.data, ref);
      const url = `https://wa.me/${BOOKING_CONFIG.whatsappNumber}?text=${encodeURIComponent(built.message)}`;

      // Store in LocalStorage
      const saved = saveBookingLocally(result.data, ref);
      setSavedBooking(saved);
      setWhatsappUrl(url);

      setStatus({
        message: 'Opening WhatsApp — tap Send there to confirm your booking.',
        type: 'success',
      });

      window.setTimeout(() => {
        window.open(url, '_blank', 'noopener,noreferrer');
        setSubmitting(false);
        setStep('success');
      }, 800);
    },
    [form]
  );

  // Success Step rendering
  if (step === 'success') {
    return (
      <div className="booking-success-step animate-fade-in">
        <div className="success-icon-wrap">
          <div className="success-icon-circle">
            <i className="fas fa-check"></i>
          </div>
        </div>

        <h4 className="success-title">Booking Initiated!</h4>
        <p className="success-subtitle">
          Thank you, <strong>{savedBooking ? savedBooking.name : 'Client'}</strong>! We have initiated your request for <strong>{savedBooking ? serviceLabel(savedBooking.service) : ''}</strong>.
        </p>

        <div className="success-card">
          <div className="success-card-row">
            <span>Booking Ref:</span>
            <strong>{savedBooking ? savedBooking.id : ''}</strong>
          </div>
          <div className="success-card-row">
            <span>Scheduled Date:</span>
            <strong>{savedBooking ? formatDate(savedBooking.date) : ''}</strong>
          </div>
          <div className="success-card-row">
            <span>Status:</span>
            <strong className="status-badge"><i className="fas fa-clock"></i> Awaiting WhatsApp Send</strong>
          </div>
        </div>

        <p className="success-desc">
          We have opened WhatsApp. Please tap <strong>Send</strong> in the chat to confirm your slots.
        </p>

        <div className="success-actions">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="booking-submit-btn whatsapp-manual-btn">
            <i className="fab fa-whatsapp"></i> Manual Send WhatsApp
          </a>
          <button
            type="button"
            className="booking-secondary-btn"
            onClick={() => {
              setForm(EMPTY);
              setStep('form');
              setSavedBooking(null);
              setWhatsappUrl('');
              setStatus({ message: '', type: '' });
            }}
          >
            Book Another Consultation
          </button>
        </div>
      </div>
    );
  }

  // Summary Step rendering
  if (step === 'summary') {
    const result = validate(form, false);
    const tempRef = generateBookingRef();
    const previewMessage = result.data ? buildWhatsAppMessage(result.data, tempRef).message : '';

    return (
      <div className="booking-summary-step animate-fade-in">
        <h4 className="summary-title"><i className="fas fa-file-invoice"></i> Review Your Details</h4>
        <p className="summary-subtitle">Please double-check your fitness details before confirming.</p>

        <div className="summary-details-grid">
          <div className="summary-item">
            <span className="summary-label">Name</span>
            <strong className="summary-value">{form.name}</strong>
          </div>
          <div className="summary-item">
            <span className="summary-label">Age / Gender</span>
            <strong className="summary-value">{form.age} years / {form.gender}</strong>
          </div>
          <div className="summary-item">
            <span className="summary-label">Weight / Height</span>
            <strong className="summary-value">{form.weight} kg / {form.height} cm</strong>
          </div>
          <div className="summary-item">
            <span className="summary-label">Mobile</span>
            <strong className="summary-value">+91 {form.mobile}</strong>
          </div>
          <div className="summary-item">
            <span className="summary-label">Email</span>
            <strong className="summary-value">{form.email}</strong>
          </div>
          <div className="summary-item">
            <span className="summary-label">Fitness Goal</span>
            <strong className="summary-value">{form.goal}</strong>
          </div>
          <div className="summary-item summary-item--full">
            <span className="summary-label">Selected Service</span>
            <strong className="summary-value highlight-green">
              {selectedService ? selectedService.label.split(' — ')[0] : ''} (₹{selectedService ? selectedService.price : ''})
            </strong>
          </div>
          <div className="summary-item">
            <span className="summary-label">Preferred Date</span>
            <strong className="summary-value">{form.date ? formatDate(form.date) : ''}</strong>
          </div>
        </div>

        <div className="booking-preview">
          <strong>WhatsApp Message Preview:</strong>
          <pre className="booking-preview-text">{previewMessage}</pre>
        </div>

        {status.message && (
          <div className={`booking-status booking-status--${status.type}`} role="status" aria-live="polite">
            {status.message}
          </div>
        )}

        <div className="summary-actions">
          <button type="button" className="booking-edit-btn" onClick={() => setStep('form')}>
            <i className="fas fa-edit"></i> Edit Details
          </button>
          <button type="button" className="booking-submit-btn" onClick={handleConfirm} disabled={submitting}>
            {submitting ? (
              <><i className="fas fa-spinner fa-spin" /> Opening WhatsApp…</>
            ) : (
              <><i className="fab fa-whatsapp" /> Confirm & Send</>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Form Entry Step rendering (step === 'form')
  return (
    <form className="booking-form" onSubmit={handleReview} noValidate>
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
          <label htmlFor="booking-gender">Gender <span className="req">*</span></label>
          <select
            id="booking-gender"
            className={errors.gender ? 'input-invalid' : ''}
            value={form.gender}
            onChange={(e) => update('gender', e.target.value)}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          {errors.gender && <span className="field-error">{errors.gender}</span>}
        </div>
      </div>

      <div className="booking-field-row">
        <div className="booking-field">
          <label htmlFor="booking-weight">Weight (kg) <span className="req">*</span></label>
          <input
            type="number"
            id="booking-weight"
            className={errors.weight ? 'input-invalid' : ''}
            min={BOOKING_CONFIG.minWeight}
            max={BOOKING_CONFIG.maxWeight}
            placeholder="70"
            inputMode="decimal"
            step="0.1"
            value={form.weight}
            onChange={(e) => update('weight', e.target.value)}
          />
          {errors.weight && <span className="field-error">{errors.weight}</span>}
        </div>
        <div className="booking-field">
          <label htmlFor="booking-height">Height (cm) <span className="req">*</span></label>
          <input
            type="number"
            id="booking-height"
            className={errors.height ? 'input-invalid' : ''}
            min={BOOKING_CONFIG.minHeight}
            max={BOOKING_CONFIG.maxHeight}
            placeholder="175"
            inputMode="numeric"
            value={form.height}
            onChange={(e) => update('height', e.target.value)}
          />
          {errors.height && <span className="field-error">{errors.height}</span>}
        </div>
      </div>

      <div className="booking-field">
        <label htmlFor="booking-email">Email Address <span className="req">*</span></label>
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

      <div className="booking-field">
        <label htmlFor="booking-goal">Goal <span className="req">*</span></label>
        <select
          id="booking-goal"
          className={errors.goal ? 'input-invalid' : ''}
          value={form.goal}
          onChange={(e) => update('goal', e.target.value)}
        >
          <option value="">Select Goal</option>
          <option value="Weight Gain">Weight Gain</option>
          <option value="Weight Loss">Weight Loss</option>
          <option value="Muscle Building">Muscle Building</option>
          <option value="Fitness">Fitness</option>
        </select>
        {errors.goal && <span className="field-error">{errors.goal}</span>}
      </div>

      <div className="booking-field">
        <label htmlFor="booking-service">Selected Service <span className="req">*</span></label>
        <select
          id="booking-service"
          className={errors.service ? 'input-invalid' : ''}
          value={form.service}
          onChange={(e) => update('service', e.target.value)}
        >
          <option value="">Select a service plan</option>
          {BOOKING_CONFIG.services.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        {errors.service && <span className="field-error">{errors.service}</span>}
      </div>

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

      {selectedService && (
        <div className="selected-service-banner animate-fade-in">
          <div className="selected-service-info">
            <span className="info-label">Selected Plan</span>
            <strong className="info-name">{selectedService.label.split(' — ')[0]}</strong>
          </div>
          <div className="selected-service-price">
            <span className="price-label">Price</span>
            <span className="price-val">₹{selectedService.price}</span>
          </div>
        </div>
      )}

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

      <button type="submit" className="booking-submit-btn">
        <i className="fas fa-file-invoice" /> Review Booking Summary
      </button>

      <p className="booking-form-note">
        <i className="fas fa-info-circle" /> Tap Send in WhatsApp to reach Jagan.
        Your details are stored in your browser history and sent via encrypted WhatsApp.
      </p>
    </form>
  );
}
