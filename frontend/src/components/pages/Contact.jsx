// Contact.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [activeTab, setActiveTab] = useState('general');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Form submission logic would go here
    alert('Thank you for your message. We will get back to you soon!');
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };

  const contactMethods = [
    {
      icon: "📧",
      title: "Email Us",
      details: "contact@infinitewavex.com",
      description: "Send us an email anytime and we'll respond within 24 hours"
    },
    {
      icon: "📞",
      title: "Call Us",
      details: "+1 (555) 123-IWX",
      description: "Mon-Fri from 8am to 6pm EST"
    },
    {
      icon: "💬",
      title: "Chat With Us",
      details: "Start Live Chat",
      description: "Get immediate help from our support team"
    },
    {
      icon: "📍",
      title: "Visit Us",
      details: "123 Design Street, Fashion District",
      description: "FD 10001. Open Mon-Sat 10am-8pm"
    }
  ];

  const faqs = [
    {
      question: "How can I track my order?",
      answer: "Once your order ships, you'll receive a confirmation email with a tracking number and link to track your package."
    },
    {
      question: "What is your return policy?",
      answer: "We offer 30-day returns on all unworn items with original tags attached. Sale items may have different return conditions."
    },
    {
      question: "Do you ship internationally?",
      answer: "Yes, we ship to over 50 countries worldwide. Shipping costs and delivery times vary by location."
    }
  ];

  return (
    <div className="contact-container">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="contact-hero-content">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            Get In Touch
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            We'd love to hear from you. Reach out to us through any of these channels.
          </motion.p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="contact-methods">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            How Can We Help You?
          </motion.h2>
          <div className="methods-grid">
            {contactMethods.map((method, index) => (
              <motion.div 
                key={index}
                className="method-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="method-icon">{method.icon}</div>
                <h3>{method.title}</h3>
                <p className="method-details">{method.details}</p>
                <p className="method-description">{method.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="contact-form-section">
        <div className="container">
          <div className="form-container">
            <motion.div 
              className="form-intro"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <h2>Send Us a Message</h2>
              <p>
                Have a question, suggestion, or need assistance? Fill out the form below and our team 
                will get back to you as soon as possible.
              </p>
              <div className="form-tabs">
                <button 
                  className={activeTab === 'general' ? 'tab-active' : ''}
                  onClick={() => setActiveTab('general')}
                >
                  General Inquiry
                </button>
                <button 
                  className={activeTab === 'support' ? 'tab-active' : ''}
                  onClick={() => setActiveTab('support')}
                >
                  Customer Support
                </button>
                <button 
                  className={activeTab === 'wholesale' ? 'tab-active' : ''}
                  onClick={() => setActiveTab('wholesale')}
                >
                  Wholesale Inquiry
                </button>
              </div>
            </motion.div>

            <motion.form 
              className="contact-form"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              onSubmit={handleSubmit}
            >
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                ></textarea>
              </div>

              <button type="submit" className="submit-button">Send Message</button>
            </motion.form>
          </div>
        </div>
      </section>

      {/* FAQ Preview Section */}
      <section className="faq-preview">
        <div className="container">
          <motion.div 
            className="faq-preview-content"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <h2>Common Questions</h2>
            <div className="faq-list">
              {faqs.map((faq, index) => (
                <motion.div 
                  key={index}
                  className="faq-item"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <h4>{faq.question}</h4>
                  <p>{faq.answer}</p>
                </motion.div>
              ))}
            </div>
            <a href="#faq" className="view-all-faq">View All FAQs →</a>
          </motion.div>
        </div>
      </section>

      {/* Store Locations */}
      <section className="store-locations">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            Visit Our Stores
          </motion.h2>
          <motion.p 
            className="section-subtitle"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Experience IWX in person at our flagship locations
          </motion.p>

          <div className="stores-list">
            {[
              {
                city: "New York Flagship",
                address: "123 Design Street, Fashion District, NY 10001",
                hours: "Mon-Sat: 10am-8pm, Sun: 11am-7pm",
                phone: "+1 (555) 123-NYC",
                image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"
              },
              {
                city: "Paris Boutique",
                address: "45 Avenue de la Mode, 75001 Paris, France",
                hours: "Mon-Sat: 10am-8pm, Sun: Closed",
                phone: "+33 (0) 1 42 86 13 57",
                image: "https://images.unsplash.com/photo-1502602898536-47ad22581b52?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"
              },
              {
                city: "Tokyo Showroom",
                address: "1-5-6 Ginza, Chuo-ku, Tokyo 104-0061, Japan",
                hours: "Mon-Sun: 10am-9pm",
                phone: "+81 3-3571-8654",
                image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1794&q=80"
              }
            ].map((store, index) => (
              <motion.div 
                key={index}
                className="store-detail-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="store-image">
                  <img src={store.image} alt={store.city} />
                </div>
                <div className="store-info">
                  <h3>{store.city}</h3>
                  <p className="store-address">{store.address}</p>
                  <p className="store-hours">{store.hours}</p>
                  <p className="store-phone">{store.phone}</p>
                  <button className="store-direction">Get Directions</button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Media Connect */}
      <section className="social-connect">
        <div className="container">
          <motion.div 
            className="social-content"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <h2>Connect With Us</h2>
            <p>Follow along for the latest updates, style inspiration, and behind-the-scenes content</p>
            <div className="social-icons">
              <a href="#" className="social-icon">Instagram</a>
              <a href="#" className="social-icon">Facebook</a>
              <a href="#" className="social-icon">Twitter</a>
              <a href="#" className="social-icon">Pinterest</a>
              <a href="#" className="social-icon">TikTok</a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Contact;