import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ErrorPage.css';

const ErrorPage = ({ type = 'unexpected', message, details }) => {
  const navigate = useNavigate();

  const getErrorContent = () => {
    switch (type) {
      case '404':
        return {
          code: '404',
          title: 'Page Not Found',
          message: 'The page you are looking for does not exist.',
          icon: '🔍'
        };
      case '500':
        return {
          code: '500',
          title: 'Server Error',
          message: 'Something went wrong on our end. Please try again later.',
          icon: '⚠️'
        };
      case 'network':
        return {
          code: 'NETWORK',
          title: 'Connection Error',
          message: 'Unable to connect to the server. Please check your internet connection.',
          icon: '📡'
        };
      case 'timeout':
        return {
          code: 'TIMEOUT',
          title: 'Request Timeout',
          message: 'The request took too long to complete. Please try again.',
          icon: '⏱️'
        };
      default:
        return {
          code: 'ERROR',
          title: 'Unexpected Error',
          message: message || 'An unexpected error occurred.',
          icon: '❌'
        };
    }
  };

  const errorContent = getErrorContent();

  return (
    <div className="error-page">
      <div className="error-container">
        <div className="error-icon">
          {errorContent.icon}
        </div>
        <h1 className="error-code">{errorContent.code}</h1>
        <h2 className="error-title">{errorContent.title}</h2>
        <p className="error-message">{errorContent.message}</p>

        {details && (
          <details className="error-details">
            <summary>Technical Details</summary>
            <pre>{details}</pre>
          </details>
        )}

        <div className="error-actions">
          <button
            className="btn-primary"
            onClick={() => navigate('/')}
          >
            Go Home
          </button>
          <button
            className="btn-secondary"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;