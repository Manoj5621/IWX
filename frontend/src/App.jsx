import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route} from "react-router-dom"
import Home from './components/Home'
import ProductListing from './components/ProductListing'
import Profile from './components/Profile'
import Auth from './components/Auth'
import About from './components/About'
import Contact from './components/Contact'
import FAQ from './components/FAQ'
import Cart from './components/Cart'
import Checkout from './components/Checkout'
import ProductDetails from './components/ProductDetail'

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/productList' element={<ProductListing />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/auth' element={<Auth />} />
        <Route path='/about' element={<About />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/faq' element={<FAQ />} />
        <Route path='/cart' element={<Cart />} />
        <Route path='/checkout' element={<Checkout />} />
        <Route path='/productDetails' element={<ProductDetails />} />
      </Routes>
    </Router>
  )
}

export default App
