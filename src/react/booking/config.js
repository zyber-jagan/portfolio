export const BOOKING_CONFIG = {
  whatsappNumber: '917358097322',
  maxSubmissionsPerHour: 5,
  minAge: 12,
  maxAge: 100,
  minWeight: 30,
  maxWeight: 250,
  minHeight: 100,
  maxHeight: 250,
  maxNameLength: 60,
  maxEmailLength: 120,
  maxBookingDaysAhead: 30,
  timeSlots: [
    { value: '6-8', label: 'Early Morning (6:00 AM – 8:00 AM)', enabled: true },
    { value: '9-11', label: 'Morning (9:00 AM – 11:00 AM)', enabled: true },
    { value: '14-16', label: 'Afternoon (2:00 PM – 4:00 PM)', enabled: true },
    { value: '17-19', label: 'Evening (5:00 PM – 7:00 PM)', enabled: true },
    { value: '20-21', label: 'Night (8:00 PM – 9:00 PM)', enabled: true },
  ],
  services: [
    { value: 'diet', label: 'Personalized Diet Plan — ₹199', price: 199 },
    { value: 'workout', label: 'Weekly Workout Plan — ₹99', price: 99 },
    { value: 'training', label: '1-on-1 Personal Training — ₹499', price: 499 },
    { value: 'combo', label: 'Diet + Workout Combo Plan — ₹399 (Most Popular)', price: 399, popular: true },
  ],
};

