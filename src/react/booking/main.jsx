import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import BookingForm from './BookingForm';

const root = document.getElementById('booking-react-root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <BookingForm />
    </StrictMode>
  );
}
