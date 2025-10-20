import { useState, useEffect } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation} from "react-router-dom"
import Home from './pages/Home'
import ProductListing from './pages/ProductListing'
import Profile from './pages/Profile'
import Auth from './pages/Auth'
import About from './pages/About'
import Contact from './pages/Contact'
import FAQ from './pages/FAQ'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import ProductDetails from './pages/ProductDetails'
import ReturnRefund from './pages/ReturnRefund'
import Offers from './pages/Offers'
import ModelViewer from './pages/ModelViewer'
import Status from './pages/Status'
import Dashboard from './pages/admin/Dashboard'
import ErrorPage from './pages/ErrorPage'
import ProtectedRoute from './routes/ProtectedRoute'
import PublicRoute from './routes/PublicRoute'
import AdminRoute from './routes/AdminRoute'
import { useSelector, useDispatch } from 'react-redux'
import { loginSuccess, loginFailure, setLoading } from './redux/slices/authSlice'
import { authAPI } from './api/authAPI'
import { useServerStatus } from './hooks/useServerStatus'
import BackendServerDown from './components/BackendServerDown'
import FrontendServerDown from './components/FrontendServerDown'

function AppContent() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated)
  const loading = useSelector(state => state.auth.loading)
  const { backendStatus, frontendStatus, retryChecks } = useServerStatus()

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const urlParams = new URLSearchParams(window.location.search);
      const googleCode = urlParams.get('code');

      // Handle Google OAuth callback
      if (googleCode && (window.location.pathname === '/auth' || window.location.pathname === '/auth/google/callback')) {
        try {
          const response = await authAPI.googleCallback(googleCode);
          const userRole = response.user?.role || 'user';
          localStorage.setItem('userRole', userRole);
          localStorage.setItem('token', response.access_token);
          dispatch(loginSuccess({
            user: response.user,
            token: response.access_token
          }));
          // Clean up URL
          window.history.replaceState({}, document.title, '/');
          return;
        } catch (error) {
          console.error('Google OAuth callback error:', error);
          dispatch(loginFailure('Google authentication failed'));
        }
      }

      if (token) {
        try {
          const user = await authAPI.getCurrentUser();
          if (user) {
            const userRole = user.role || 'user';
            localStorage.setItem('userRole', userRole);
            dispatch(loginSuccess({ user, token }));
          } else {
            throw new Error('Failed to get user data');
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          dispatch(loginFailure(error.message));
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
        }
      } else {
        dispatch(setLoading(false));
      }
    };
    initAuth();
  }, [dispatch]);

  if (loading) {
    return <div>Loading...</div>
  }

  // Show backend down page if backend is offline
  if (backendStatus === 'offline') {
    return <BackendServerDown onRetry={retryChecks} />
  }

  // Show frontend down page if frontend is offline (network issues)
  if (frontendStatus === 'offline') {
    return <FrontendServerDown onRetry={retryChecks} />
  }

  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/adminDashboard' element={<AdminRoute><Dashboard /></AdminRoute>} />
      <Route path='/productList' element={<ProductListing />} />
      <Route path='/profile' element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path='/auth' element={<PublicRoute><Auth /></PublicRoute>} />
      <Route path='/auth/google/callback' element={<Auth />} />
      <Route path='/about' element={<About />} />
      <Route path='/contact' element={<Contact />} />
      <Route path='/faq' element={<FAQ />} />
      <Route path='/cart' element={<Cart />} />
      <Route path='/checkout' element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
      <Route path='/productDetails' element={<ProductDetails />} />
      <Route path='/returnRefund' element={<ReturnRefund />} />
      <Route path='/offers' element={<Offers />} />
      <Route path='/modelViewer' element={<ModelViewer />} />
      <Route path='/status' element={<Status />} />
      <Route path='/error/404' element={<ErrorPage type="404" />} />
      <Route path='/error/500' element={<ErrorPage type="500" />} />
      <Route path='/error/network' element={<ErrorPage type="network" />} />
      <Route path='/error/timeout' element={<ErrorPage type="timeout" />} />
      <Route path='/error' element={<ErrorPage />} />
      <Route path='*' element={<ErrorPage type="404" />} />
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
