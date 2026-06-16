import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import ContactForm from './ContactForm';

const root = document.getElementById('contact-react-root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <ContactForm />
    </StrictMode>
  );
}
