// AddressForm.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../../pages/Profile.css';

const AddressForm = ({ isOpen, onClose, onSave, editAddress = null }) => {
  const [formData, setFormData] = useState({
    name: editAddress?.name || '',
    street: editAddress?.street_address || '',
    city: editAddress?.city || '',
    state: editAddress?.state || '',
    postal_code: editAddress?.postal_code || '',
    country: editAddress?.country || '',
    is_default: editAddress?.is_default || false,
    phone: editAddress?.phone || ''
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Address name is required';
    if (!formData.street.trim()) newErrors.street = 'Street address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.postal_code.trim()) newErrors.postal_code = 'Postal code is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  const countries = ['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France'];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="modal-content"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>{editAddress ? 'Edit Address' : 'Add New Address'}</h3>
              <button className="modal-close" onClick={onClose}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="address-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Address Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Home, Work"
                    className={errors.name ? 'error' : ''}
                  />
                  {errors.name && <span className="error-message">{errors.name}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <label>Street Address *</label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    placeholder="123 Main Street"
                    className={errors.street ? 'error' : ''}
                  />
                  {errors.street && <span className="error-message">{errors.street}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="New York"
                    className={errors.city ? 'error' : ''}
                  />
                  {errors.city && <span className="error-message">{errors.city}</span>}
                </div>
                <div className="form-group">
                  <label>State/Province *</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="NY"
                    className={errors.state ? 'error' : ''}
                  />
                  {errors.state && <span className="error-message">{errors.state}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Postal Code *</label>
                  <input
                    type="text"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleInputChange}
                    placeholder="10001"
                    className={errors.postal_code ? 'error' : ''}
                  />
                  {errors.postal_code && <span className="error-message">{errors.postal_code}</span>}
                </div>
                <div className="form-group">
                  <label>Country *</label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className={errors.country ? 'error' : ''}
                  >
                    <option value="">Select Country</option>
                    {countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                  {errors.country && <span className="error-message">{errors.country}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="is_default"
                      checked={formData.is_default}
                      onChange={handleInputChange}
                    />
                    <span className="checkmark"></span>
                    Set as default address
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  {editAddress ? 'Update Address' : 'Add Address'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddressForm;