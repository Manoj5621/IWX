import { useState, useEffect } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route} from "react-router-dom"
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
import Dashboard from './pages/admin/Dashboard'
import ErrorPage from './pages/ErrorPage'
import ProtectedRoute from './routes/ProtectedRoute'
import PublicRoute from './routes/PublicRoute'
import AdminRoute from './routes/AdminRoute'
import { useSelector, useDispatch } from 'react-redux'
import { loginSuccess, loginFailure, setLoading } from './redux/slices/authSlice'
import { authAPI } from './api/authAPI'

function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated)
  const loading = useSelector(state => state.auth.loading)

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const user = await authAPI.getCurrentUser();
          dispatch(loginSuccess({ user, token }));
        } catch (error) {
          dispatch(loginFailure(error.message));
          localStorage.removeItem('token');
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

  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/adminDashboard' element={<AdminRoute><Dashboard /></AdminRoute>} />
        {/* <Route path='/adminDashboard' element={<Dashboard />} /> */}
        <Route path='/productList' element={<ProductListing />} />
        <Route path='/profile' element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path='/auth' element={<PublicRoute><Auth /></PublicRoute>} />
        <Route path='/about' element={<About />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/faq' element={<FAQ />} />
        <Route path='/cart' element={<Cart />} />
        <Route path='/checkout' element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path='/productDetails' element={<ProductDetails />} />
        <Route path='/returnRefund' element={<ReturnRefund />} />
        <Route path='/offers' element={<Offers />} />
        <Route path='/modelViewer' element={<ModelViewer />} />
        <Route path='/error/404' element={<ErrorPage type="404" />} />
        <Route path='/error/500' element={<ErrorPage type="500" />} />
        <Route path='/error/network' element={<ErrorPage type="network" />} />
        <Route path='/error/timeout' element={<ErrorPage type="timeout" />} />
        <Route path='/error' element={<ErrorPage />} />
        <Route path='*' element={<ErrorPage type="404" />} />
      </Routes>
    </Router>
  )
}

export default App
