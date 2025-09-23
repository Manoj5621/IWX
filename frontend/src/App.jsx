import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route} from "react-router-dom"
import Home from './components/pages/Home'
import ProductListing from './components/pages/ProductListing'
import Profile from './components/pages/Profile'
import Auth from './components/pages/Auth'
import About from './components/pages/About'
import Contact from './components/pages/Contact'
import FAQ from './components/pages/FAQ'
import Cart from './components/pages/Cart'
import Checkout from './components/pages/Checkout'
import ProductDetails from './components/pages/ProductDetail'
import ReturnRefund from './components/pages/ReturnRefund'
import Offers from './components/pages/Offers'
import ModelViewer from './components/pages/ModelViewer'
import AdminDashboard from './components/pages/AdminDashboard'

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/adminDashboard' element={<AdminDashboard />} />
        <Route path='/productList' element={<ProductListing />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/auth' element={<Auth />} />
        <Route path='/about' element={<About />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/faq' element={<FAQ />} />
        <Route path='/cart' element={<Cart />} />
        <Route path='/checkout' element={<Checkout />} />
        <Route path='/productDetails' element={<ProductDetails />} />
        <Route path='/returnRefund' element={<ReturnRefund />} />
        <Route path='/offers' element={<Offers />} />
        <Route path='/modelViewer' element={<ModelViewer />} />
      </Routes>
    </Router>
  )
}

export default App
