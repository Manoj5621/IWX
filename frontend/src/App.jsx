import { useState } from 'react'
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
import ProtectedRoute from './routes/ProtectedRoute'
import PublicRoute from './routes/PublicRoute'
import AdminRoute from './routes/AdminRoute'

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/adminDashboard' element={<AdminRoute><Dashboard /></AdminRoute>} />
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
      </Routes>
    </Router>
  )
}

export default App
