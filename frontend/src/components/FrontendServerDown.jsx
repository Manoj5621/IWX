// FrontendServerDown.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './FrontendServerDown.css';

const FrontendServerDown = () => {
  const [animationState, setAnimationState] = useState('initial');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    setAnimationState('active');
  }, []);

  const errorDetails = {
    timestamp: new Date().toISOString(),
    errorCode: 'FRONTEND_500',
    component: 'React Application',
    browser: navigator.userAgent,
    suggestedActions: [
      'Clear browser cache and cookies',
      'Try refreshing the page',
      'Check browser console for errors',
      'Try using a different browser',
      'Disable browser extensions temporarily'
    ]
  };

  return (
    <div className="frontend-server-down">
      <motion.div 
        className="frontend-error-container"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        {/* Animated Browser Graphic */}
        <motion.div 
          className="browser-graphic"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="browser-window">
            <div className="browser-header">
              <div className="browser-controls">
                <div className="control red"></div>
                <div className="control yellow"></div>
                <div className="control green"></div>
              </div>
              <div className="browser-url">https://yourapp.com</div>
            </div>
            <div className="browser-content">
              <motion.div
                className="loading-bar"
                animate={{ width: ['0%', '100%', '0%'] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              
              <motion.div
                className="content-glitch"
                animate={{ 
                  opacity: [1, 0.8, 1],
                  x: [0, -2, 2, 0]
                }}
                transition={{ 
                  duration: 0.5,
                  repeat: Infinity
                }}
              >
                <div className="glitch-line"></div>
                <div className="glitch-line"></div>
                <div className="glitch-line"></div>
              </motion.div>
              
              <motion.div
                className="error-symbol"
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity
                }}
              >
                ⚠️
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Error Content */}
        <motion.div 
          className="error-content"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h1 className="error-title">Frontend Application Error</h1>
          <p className="error-message">
            Our web application is experiencing technical difficulties. 
            This might be due to a JavaScript error, failed resource loading, or compatibility issues.
          </p>
          
          <div className="browser-compatibility">
            <h4>Browser Compatibility</h4>
            <div className="browser-list">
              <div className="browser-item compatible">
                <span className="browser-icon">🌐</span>
                <span>Chrome 90+</span>
              </div>
              <div className="browser-item compatible">
                <span className="browser-icon">🌐</span>
                <span>Firefox 88+</span>
              </div>
              <div className="browser-item compatible">
                <span className="browser-icon">🌐</span>
                <span>Safari 14+</span>
              </div>
              <div className="browser-item warning">
                <span className="browser-icon">⚠️</span>
                <span>Edge 90+</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Fixes */}
        <motion.div 
          className="quick-fixes"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h4>Quick Fixes to Try</h4>
          <div className="fixes-grid">
            <motion.button
              className="fix-button"
              onClick={() => window.location.reload()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="fix-icon">🔄</span>
              Hard Refresh
              <small>Ctrl + F5</small>
            </motion.button>
            
            <motion.button
              className="fix-button"
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
                window.location.reload();
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="fix-icon">🧹</span>
              Clear Storage
              <small>Local & Session</small>
            </motion.button>
            
            <motion.button
              className="fix-button"
              onClick={() => window.open(window.location.href, '_blank')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="fix-icon">💻</span>
              New Window
              <small>Fresh Context</small>
            </motion.button>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          className="error-actions"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <motion.button
            className="retry-button primary"
            onClick={() => window.location.reload()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="button-icon">🔄</span>
            Reload Application
          </motion.button>
          
          <motion.button
            className="details-toggle"
            onClick={() => setShowDetails(!showDetails)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="button-icon">
              {showDetails ? '↑' : '↓'}
            </span>
            {showDetails ? 'Hide Details' : 'Technical Details'}
          </motion.button>
        </motion.div>

        {/* Error Details */}
        <motion.div 
          className="error-details-container"
          initial={false}
          animate={{ 
            height: showDetails ? 'auto' : 0,
            opacity: showDetails ? 1 : 0 
          }}
          transition={{ duration: 0.3 }}
        >
          {showDetails && (
            <motion.div 
              className="error-details"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="details-header">
                <h3>Frontend Error Details</h3>
                <p>Technical information for debugging</p>
              </div>
              
              <div className="detail-section">
                <h4>Error Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Error Code:</span>
                    <span className="detail-value">{errorDetails.errorCode}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Timestamp:</span>
                    <span className="detail-value">{errorDetails.timestamp}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Affected Component:</span>
                    <span className="detail-value">{errorDetails.component}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">User Agent:</span>
                    <span className="detail-value truncated">{errorDetails.browser}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Suggested Actions</h4>
                <ul className="suggestions-list">
                  {errorDetails.suggestedActions.map((action, index) => (
                    <li key={index}>{action}</li>
                  ))}
                </ul>
              </div>

              <div className="detail-section">
                <h4>Console Output</h4>
                <pre className="debug-code">
{`React Application Crash Report:
- Error: Application failed to mount
- Stack: TypeError: Cannot read properties of undefined
- Component: AppRouter
- Chunk: main.bundle.js (v2.1.4)
- Environment: production
- Build: #${Math.random().toString(36).substr(2, 8)}`}
                </pre>
              </div>

              <div className="detail-section">
                <h4>Diagnostic Tools</h4>
                <div className="diagnostic-buttons">
                  <button 
                    className="diagnostic-btn"
                    onClick={() => {
                      console.clear();
                      console.error('Manual diagnostic triggered by user');
                      alert('Console cleared. Check for new errors after reload.');
                    }}
                  >
                    Clear Console
                  </button>
                  <button 
                    className="diagnostic-btn"
                    onClick={() => {
                      const performance = window.performance;
                      alert(`Memory: ${performance.memory ? (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + 'MB' : 'N/A'}`);
                    }}
                  >
                    Check Memory
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Support Information */}
        <motion.div 
          className="support-info"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <p>If the problem persists, try these additional steps or contact support.</p>
          <div className="support-links">
            <a href="/contact" className="support-link">Contact Support</a>
            <a href="/help" className="support-link">Help Center</a>
            <a href="/" className="support-link">Home Page</a>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default FrontendServerDown;