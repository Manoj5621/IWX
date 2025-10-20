import React from 'react';
import { motion } from 'framer-motion';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      showDetails: false
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // You can also log to an external service here
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      showDetails: false 
    });
  };

  toggleDetails = () => {
    this.setState(prevState => ({ 
      showDetails: !prevState.showDetails 
    }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <motion.div 
            className="error-boundary-content"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
          >
            {/* Animated Error Graphic */}
            <motion.div 
              className="error-graphic"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="error-orb">
                <motion.div 
                  className="error-pulse"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 0.3, 0.7]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <div className="error-icon">⚠️</div>
              </div>
              
              <motion.div 
                className="error-particles"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {[0, 1, 2, 3].map(i => (
                  <motion.div
                    key={i}
                    className="error-particle"
                    animate={{
                      y: [0, -30, 0],
                      x: [0, (i % 2 === 0 ? 20 : -20), 0],
                      opacity: [0, 1, 0]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.3
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>

            {/* Error Content */}
            <motion.div 
              className="error-text"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <h1 className="error-title">Something Went Wrong</h1>
              <p className="error-description">
                We apologize, but something unexpected happened. Our team has been notified 
                and we're working to fix it. In the meantime, you can try refreshing the page.
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div 
              className="error-actions"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <motion.button
                className="retry-button primary"
                onClick={this.handleRetry}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="button-icon">🔄</span>
                Try Again
              </motion.button>
              
              <motion.button
                className="retry-button secondary"
                onClick={() => window.location.reload()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="button-icon">↻</span>
                Refresh Page
              </motion.button>
              
              <motion.button
                className="details-toggle"
                onClick={this.toggleDetails}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="button-icon">
                  {this.state.showDetails ? '↑' : '↓'}
                </span>
                {this.state.showDetails ? 'Hide Details' : 'Show Details'}
              </motion.button>
            </motion.div>

            {/* Error Details */}
            <motion.div 
              className="error-details-container"
              initial={false}
              animate={{ 
                height: this.state.showDetails ? 'auto' : 0,
                opacity: this.state.showDetails ? 1 : 0 
              }}
              transition={{ duration: 0.3 }}
            >
              {this.state.showDetails && (
                <motion.div 
                  className="error-details"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="details-header">
                    <h3>Error Details</h3>
                    <p>This information is only visible in development mode.</p>
                  </div>
                  
                  {this.state.error && (
                    <div className="error-section">
                      <h4>Error</h4>
                      <pre className="error-code">
                        {this.state.error.toString()}
                      </pre>
                    </div>
                  )}
                  
                  {this.state.errorInfo?.componentStack && (
                    <div className="error-section">
                      <h4>Component Stack</h4>
                      <pre className="error-code">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>

            {/* Support Information */}
            <motion.div 
              className="support-info"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <p>If the problem persists, please contact our support team.</p>
              <div className="support-links">
                <a href="/contact" className="support-link">Contact Support</a>
                <a href="/" className="support-link">Go Home</a>
              </div>
            </motion.div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;