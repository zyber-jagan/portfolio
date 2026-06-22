import { BOOKING_CONFIG } from './config';

export function sanitizeText(value, maxLen) {
  return String(value || '')
    .replace(/[<>"'`\\]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

export function sanitizePhone(value) {
  return String(value || '').replace(/\D/g, '').slice(0, 10);
}

export function isValidEmail(email) {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}

export function isValidIndianMobile(digits) {
  return /^[6-9]\d{9}$/.test(digits);
}

export function formatDate(isoDate) {
  const parts = isoDate.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${parts[2]} ${months[parseInt(parts[1], 10) - 1]} ${parts[0]}`;
}

export function serviceLabel(value) {
  const match = BOOKING_CONFIG.services.find((s) => s.value === value);
  return match ? match.label.replace(' (Most Popular)', '') : value;
}

function paymentNoteForService(service) {
  if (service === 'workout') return '_I will share UPI payment screenshot (₹99) if applicable._';
  if (service === 'diet') return '_I will share UPI payment screenshot (₹199) if applicable._';
  if (service === 'training') return '_I will share UPI payment screenshot (₹499) if applicable._';
  if (service === 'combo') return '_I will share UPI payment screenshot (₹399) if applicable._';
  return '_Payment details to be discussed._';
}

export function slotLabel(value) {
  const match = BOOKING_CONFIG.timeSlots.find((s) => s.value === value);
  return match ? match.label : value;
}

export function generateBookingRef() {
  return 'FH' + Date.now().toString(36).toUpperCase().slice(-6);
}

export function getDateBounds() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const max = new Date(today);
  max.setDate(max.getDate() + BOOKING_CONFIG.maxBookingDaysAhead);
  const toIso = (d) => d.toISOString().split('T')[0];
  return { min: toIso(today), max: toIso(max), today, maxDate: max };
}

export function buildWhatsAppMessage(data, ref) {
  const bookingRef = ref || generateBookingRef();
  const lines = [
    '🏋️ *FitHub Booking Request*',
    `Ref: ${bookingRef}`,
    '',
    `*Service:* ${serviceLabel(data.service)}`,
    `*Name:* ${data.name}`,
    `*Age:* ${data.age}`,
    `*Gender:* ${data.gender}`,
    `*Weight:* ${data.weight} kg`,
    `*Height:* ${data.height} cm`,
    `*Mobile:* +91 ${data.mobile}`,
    `*Email:* ${data.email}`,
    `*Goal:* ${data.goal}`,
    `*Preferred Date:* ${formatDate(data.date)}`,
    '',
    '_Legitimate fitness coaching booking only._',
    paymentNoteForService(data.service),
  ];
  return { ref: bookingRef, message: lines.join('\n') };
}

export function checkRateLimit() {
  try {
    const key = 'fithub_booking_submissions';
    const now = Date.now();
    const windowMs = 60 * 60 * 1000;
    let stored = JSON.parse(localStorage.getItem(key) || '[]');
    stored = stored.filter((t) => now - t < windowMs);
    localStorage.setItem(key, JSON.stringify(stored));
    return stored.length < BOOKING_CONFIG.maxSubmissionsPerHour;
  } catch {
    return true;
  }
}

export function recordSubmission() {
  try {
    const key = 'fithub_booking_submissions';
    const stored = JSON.parse(localStorage.getItem(key) || '[]');
    stored.push(Date.now());
    localStorage.setItem(key, JSON.stringify(stored));
  } catch {
    /* ignore */
  }
}

export function saveBookingLocally(bookingData, ref) {
  try {
    const key = 'fithub_booking_history';
    const stored = JSON.parse(localStorage.getItem(key) || '[]');
    const newBooking = {
      id: ref || generateBookingRef(),
      timestamp: Date.now(),
      ...bookingData
    };
    stored.push(newBooking);
    localStorage.setItem(key, JSON.stringify(stored));
    return newBooking;
  } catch (error) {
    console.error('Failed to save booking locally:', error);
    return null;
  }
}

