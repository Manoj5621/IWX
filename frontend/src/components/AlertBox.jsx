import React, { useEffect, useState } from 'react';
import './AlertBox.css';

const AlertBox = ({ type, message, onClose, autoHide = true, duration = 5000 }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoHide, duration, onClose]);

  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  if (!visible) return null;

  return (
    <div className={`alert-box alert-${type}`}>
      <span className="alert-message">{message}</span>
      <button className="alert-close" onClick={handleClose}>&times;</button>
    </div>
  );
};

export default AlertBox;