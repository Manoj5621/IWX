import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || '/api';

export const useServerStatus = () => {
  const [backendStatus, setBackendStatus] = useState('checking');
  const [frontendStatus, setFrontendStatus] = useState('online');
  const [lastChecked, setLastChecked] = useState(null);
  const [storedPath, setStoredPath] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const checkBackendStatus = async () => {
    const previousStatus = backendStatus;

    try {
      const response = await axios.get(`${API_BASE_URL}/health`, {
        timeout: 5000,
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      if (response.status === 200 && response.data.status === 'healthy') {
        setBackendStatus('online');

        // If backend just came online and we have a stored path, redirect
        if (previousStatus === 'offline' && storedPath && storedPath !== '/status') {
          console.log('Backend is back online, redirecting to:', storedPath);
          navigate(storedPath);
          setStoredPath(null); // Clear stored path after redirect
        }
      } else {
        setBackendStatus('offline');
      }
    } catch (error) {
      console.log('Backend health check failed:', error.message);
      setBackendStatus('offline');

      // Store current path if backend goes offline and we're not already on status page
      if (previousStatus === 'online' && location.pathname !== '/status') {
        setStoredPath(location.pathname);
        console.log('Backend went offline, stored path:', location.pathname);
      }
    }
    setLastChecked(new Date());
  };

  const checkFrontendStatus = () => {
    // Check if we can reach the frontend server itself
    if (navigator.onLine) {
      // Try to fetch a static asset to verify frontend connectivity
      fetch('/vite.svg', { method: 'HEAD', cache: 'no-cache' })
        .then(response => {
          if (response.ok) {
            setFrontendStatus('online');
          } else {
            setFrontendStatus('offline');
          }
        })
        .catch(() => {
          setFrontendStatus('offline');
        });
    } else {
      setFrontendStatus('offline');
    }
  };

  useEffect(() => {
    // Initial checks
    checkBackendStatus();
    checkFrontendStatus();

    // Set up periodic checks
    const interval = setInterval(() => {
      checkBackendStatus();
    }, 30000); // Check every 30 seconds

    // Check immediately when coming back online
    const handleOnline = () => {
      checkBackendStatus();
      checkFrontendStatus();
    };

    const handleOffline = () => {
      setFrontendStatus('offline');
      setBackendStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Manual retry function
  const retryChecks = () => {
    checkBackendStatus();
    checkFrontendStatus();
  };

  return {
    backendStatus,
    frontendStatus,
    lastChecked,
    retryChecks,
    storedPath
  };
};