import { useState } from 'react';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    sendEmail(formData, 'template_4ypwa9f') // 👈 Your template ID here
      .then(() => {
        alert('Email sent!');
      })
      .catch((err) => {
        console.error(err);
        alert('Failed to send email');
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" onChange={handleChange} placeholder="Your Name" required />
      <input name="email" type="email" onChange={handleChange} placeholder="Your Email" required />
      <textarea name="message" onChange={handleChange} placeholder="Your Message" required />
      <button type="submit">Send</button>
    </form>
  );
};

export default ContactForm;
