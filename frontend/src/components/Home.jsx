// Home.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Home.css';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Toggle search box
  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setTimeout(() => {
        document.querySelector('.search-input')?.focus();
      }, 100);
    }
  };

  // Toggle category dropdown
  const toggleCategory = (category) => {
    setActiveCategory(activeCategory === category ? null : category);
  };

  const slides = [
    {
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
      title: "SUMMER COLLECTION 2025",
      subtitle: "Discover the new essentials",
      cta: "Shop Now"
    },
    {
      image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1744&q=80",
      title: "ELEGANCE REDEFINED",
      subtitle: "Timeless pieces for modern living",
      cta: "Explore"
    },
    {
      image: "https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
      title: "EXCLUSIVE ONLINE OFFERS",
      subtitle: "Limited time only",
      cta: "View Offers"
    }
  ];

  const categories = [
    { 
      name: "WOMAN", 
      image: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80",
      subcategories: ["Dresses", "Tops", "Bottoms", "Outerwear", "Accessories"]
    },
    { 
      name: "MAN", 
      image: "https://images.unsplash.com/photo-1617137968429-3c386e5a2b0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
      subcategories: ["Shirts", "Pants", "Suits", "Outerwear", "Accessories"]
    },
    { 
      name: "KIDS", 
      image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
      subcategories: ["Girls", "Boys", "Baby", "Shoes", "Accessories"]
    },
    { 
      name: "BEAUTY", 
      image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1180&q=80",
      subcategories: ["Skincare", "Makeup", "Fragrance", "Haircare", "Bodycare"]
    }
  ];

  const products = [
    {
      image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
      name: "Oversized Blazer",
      price: "89.99 €",
      category: "Woman"
    },
    {
      image: "https://images.unsplash.com/photo-1583744946564-b52ae1c3c559?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
      name: "Leather Tote Bag",
      price: "59.99 €",
      category: "Accessories"
    },
    {
      image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
      name: "Slim Fit Jeans",
      price: "49.99 €",
      category: "Man"
    },
    {
      image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1036&q=80",
      name: "Classic Heels",
      price: "79.99 €",
      category: "Woman"
    },
    {
      image: "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
      name: "Winter Parka",
      price: "129.99 €",
      category: "Man"
    },
    {
      image: "https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
      name: "Silk Scarf",
      price: "39.99 €",
      category: "Accessories"
    },
    {
      image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1160&q=80",
      name: "Casual Sneakers",
      price: "69.99 €",
      category: "Footwear"
    },
    {
      image: "https://images.unsplash.com/photo-1591369822096-ffd140ec948a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
      name: "Evening Gown",
      price: "159.99 €",
      category: "Woman"
    }
  ];

  const testimonials = [
    {
      name: "Alex Johnson",
      role: "Fashion Designer",
      comment: "IWX has transformed my design process. The quality and attention to detail is unmatched.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
      rating: 5
    },
    {
      name: "Sophia Martinez",
      role: "Style Influencer",
      comment: "The timeless elegance of IWX pieces makes them staples in my wardrobe season after season.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Creative Director",
      comment: "Working with IWX has elevated our brand aesthetic. Their vision is truly forward-thinking.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
      rating: 4
    }
  ];

  const blogs = [
    {
      title: "The Future of Sustainable Fashion",
      excerpt: "How IWX is leading the charge in eco-conscious design without compromising on style.",
      image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
      date: "May 15, 2025"
    },
    {
      title: "Timeless Pieces for Your Wardrobe",
      excerpt: "Invest in these classic items that will never go out of style.",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
      date: "April 28, 2025"
    },
    {
      title: "Behind the Design: The IWX Process",
      excerpt: "A look at how our creative team brings visions to life.",
      image: "https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1604&q=80",
      date: "April 10, 2025"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? "star filled" : "star"}>★</span>
    ));
  };

  return (
    <div className="home-container">
      {/* Header */}
      <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-left">
          <button 
            className="menu-button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span></span>
            <span></span>
          </button>
          <nav className={`main-nav ${isMenuOpen ? 'open' : ''}`}>
            {categories.map((category) => (
              <div 
                key={category.name} 
                className="nav-item"
                onMouseEnter={() => setActiveCategory(category.name)}
                onMouseLeave={() => setActiveCategory(null)}
              >
                <a href="#/" className="nav-link">{category.name}</a>
                <AnimatePresence>
                  {activeCategory === category.name && (
                    <motion.div 
                      className="dropdown-menu"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {category.subcategories.map((subcat) => (
                        <a key={subcat} href="#/">{subcat}</a>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>
        </div>
        
        <div className="logo">
          <h1>IWX</h1>
          <p className="slogan">Designing Tomorrow, Today</p>
        </div>
        
        <div className="header-right">
          <div className="search-container" ref={searchRef}>
            <button className="search-btn" onClick={toggleSearch}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M12.5 11H11.71L11.43 10.73C12.41 9.59 13 8.11 13 6.5C13 2.91 10.09 0 6.5 0C2.91 0 0 2.91 0 6.5C0 10.09 2.91 13 6.5 13C8.11 13 9.59 12.41 10.73 11.43L11 11.71V12.5L16 17.49L17.49 16L12.5 11ZM6.5 11C4.01 11 2 8.99 2 6.5C2 4.01 4.01 2 6.5 2C8.99 2 11 4.01 11 6.5C11 8.99 8.99 11 6.5 11Z" fill="black"/>
              </svg>
            </button>
            <AnimatePresence>
              {isSearchOpen && (
                <motion.div 
                  className="search-box"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 250, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <input 
                    type="text" 
                    className="search-input"
                    placeholder="Search products..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button className="user-btn">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 0C4.03 0 0 4.03 0 9C0 13.97 4.03 18 9 18C13.97 18 18 13.97 18 9C18 4.03 13.97 0 9 0ZM9 4C10.66 4 12 5.34 12 7C12 8.66 10.66 10 9 10C7.34 10 6 8.66 6 7C6 5.34 7.34 4 9 4ZM9 16C6.67 16 4.61 14.94 3.33 13.33C3.94 12.01 5.59 11 7.5 11H10.5C12.41 11 14.06 12.01 14.67 13.33C13.39 14.94 11.33 16 9 16Z" fill="black"/>
            </svg>
          </button>
          <button className="cart-btn">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M0 0H3.27L5.09 10.91H15.09L17 4H4.45L4.18 2H17V4H19L17.64 11.19C17.44 12.09 16.64 12.73 15.73 12.73H5.45C4.54 12.73 3.74 12.09 3.54 11.19L1.36 1.09L0 0ZM5.45 14C4.45 14 3.64 14.81 3.64 15.81C3.64 16.81 4.45 17.62 5.45 17.62C6.45 17.62 7.26 16.81 7.26 15.81C7.26 14.81 6.45 14 5.45 14ZM14.45 14C13.45 14 12.64 14.81 12.64 15.81C12.64 16.81 13.45 17.62 14.45 17.62C15.45 17.62 16.26 16.81 16.26 15.81C16.26 14.81 15.45 14 14.45 14Z" fill="black"/>
            </svg>
            <span className="cart-count">3</span>
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <motion.div 
        className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: isMenuOpen ? 1 : 0, x: isMenuOpen ? 0 : -100 }}
        transition={{ duration: 0.3 }}
      >
        <nav>
          {categories.map((category) => (
            <div key={category.name} className="mobile-nav-item">
              <a href="#/" onClick={() => toggleCategory(category.name)}>
                {category.name}
                <span className="dropdown-arrow">{activeCategory === category.name ? '▲' : '▼'}</span>
              </a>
              {activeCategory === category.name && (
                <div className="mobile-dropdown">
                  {category.subcategories.map((subcat) => (
                    <a key={subcat} href="#/">{subcat}</a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </motion.div>

      {/* Hero Slider */}
      <section className="hero-slider">
        {slides.map((slide, index) => (
          <div 
            key={index} 
            className={`slide ${index === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <motion.div 
              className="slide-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: index === currentSlide ? 1 : 0, y: index === currentSlide ? 0 : 20 }}
              transition={{ duration: 0.5 }}
            >
              <h2>{slide.title}</h2>
              <p>{slide.subtitle}</p>
              <button className="cta-button">{slide.cta}</button>
            </motion.div>
          </div>
        ))}
        
        <div className="slider-dots">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            ></button>
          ))}
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="brand-story">
        <div className="container">
          <motion.div 
            className="brand-content"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <h2>InfiniteWaveX</h2>
            <h3>Shaping Dreams with Timeless Waves</h3>
            <p>
              At IWX, we believe in the power of design to transform not just spaces and products, 
              but lives. Our mission is to create pieces that stand the test of time, blending 
              innovative design with timeless elegance. Each creation tells a story of craftsmanship, 
              passion, and vision for a better tomorrow.
            </p>
            <div className="brand-stats">
              <div className="stat">
                <h4>15+</h4>
                <p>Years of Excellence</p>
              </div>
              <div className="stat">
                <h4>500+</h4>
                <p>Design Collections</p>
              </div>
              <div className="stat">
                <h4>2M+</h4>
                <p>Satisfied Clients</p>
              </div>
            </div>
          </motion.div>
          <motion.div 
            className="brand-image"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80" alt="IWX Brand" />
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section">
        <h2>SHOP BY CATEGORY</h2>
        <p className="section-subtitle">Discover our curated collections</p>
        <div className="categories-grid">
          {categories.map((category, index) => (
            <motion.div 
              key={index} 
              className="category-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
            >
              <div 
                className="category-image"
                style={{ backgroundImage: `url(${category.image})` }}
              >
                <div className="overlay"></div>
                <h3>{category.name}</h3>
                <button className="category-btn">Explore</button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-products">
        <div className="container">
          <div className="section-header">
            <h2>FEATURED PRODUCTS</h2>
            <p className="section-subtitle">Our most popular items this season</p>
            <a href="#/" className="view-all">VIEW ALL</a>
          </div>
          
          <div className="products-grid">
            {products.slice(0, 4).map((product, index) => (
              <motion.div 
                key={index} 
                className="product-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="product-image">
                  <img src={product.image} alt={product.name} />
                  <button className="quick-add">QUICK ADD</button>
                  <span className="product-category">{product.category}</span>
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p>{product.price}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="new-arrivals">
        <div className="container">
          <div className="section-header">
            <h2>NEW ARRIVALS</h2>
            <p className="section-subtitle">Fresh styles just arrived</p>
            <a href="#/" className="view-all">VIEW ALL</a>
          </div>
          
          <div className="products-grid">
            {products.slice(4, 8).map((product, index) => (
              <motion.div 
                key={index} 
                className="product-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="product-image">
                  <img src={product.image} alt={product.name} />
                  <button className="quick-add">QUICK ADD</button>
                  <span className="product-category">{product.category}</span>
                  <span className="new-badge">NEW</span>
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p>{product.price}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <div className="container">
          <h2>WHAT OUR CUSTOMERS SAY</h2>
          <p className="section-subtitle">Hear from those who have experienced IWX</p>
          
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={index} 
                className="testimonial-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="testimonial-content">
                  <div className="rating">
                    {renderStars(testimonial.rating)}
                  </div>
                  <p>"{testimonial.comment}"</p>
                </div>
                <div className="testimonial-author">
                  <img src={testimonial.avatar} alt={testimonial.name} />
                  <div>
                    <h4>{testimonial.name}</h4>
                    <p>{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="blog-section">
        <div className="container">
          <div className="section-header">
            <h2>FROM THE BLOG</h2>
            <p className="section-subtitle">Insights, trends, and inspiration</p>
            <a href="#/" className="view-all">VIEW ALL</a>
          </div>
          
          <div className="blog-grid">
            {blogs.map((blog, index) => (
              <motion.div 
                key={index} 
                className="blog-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="blog-image">
                  <img src={blog.image} alt={blog.title} />
                  <div className="blog-date">{blog.date}</div>
                </div>
                <div className="blog-content">
                  <h3>{blog.title}</h3>
                  <p>{blog.excerpt}</p>
                  <a href="#/" className="read-more">Read More</a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Instagram Feed */}
      <section className="instagram-feed">
        <h2>FOLLOW US ON INSTAGRAM</h2>
        <p className="section-subtitle">@InfiniteWaveX</p>
        <div className="instagram-grid">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <motion.div 
              key={item} 
              className="instagram-item"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: item * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              <img src={`https://images.unsplash.com/photo-15${item}3456789-abcde${item}fghijk?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80`} alt={`Instagram post ${item}`} />
              <div className="instagram-overlay">
                <span>❤️ 2.{item}K</span>
                <span>💬 {item * 23}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="newsletter">
        <motion.div 
          className="newsletter-content"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2>JOIN THE IWX COMMUNITY</h2>
          <p>Subscribe to receive updates, access to exclusive deals, and be the first to know about new collections.</p>
          <div className="newsletter-form">
            <input type="email" placeholder="Enter your email address" />
            <button>SUBSCRIBE</button>
          </div>
          <p className="newsletter-note">By subscribing, you agree to our Terms and Privacy Policy.</p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>IWX</h3>
              <p className="footer-slogan">Designing Tomorrow, Today</p>
              <p className="footer-tagline">Shaping Dreams with Timeless Waves</p>
              <div className="social-icons">
                <a href="#/" aria-label="Instagram">IG</a>
                <a href="#/" aria-label="Facebook">FB</a>
                <a href="#/" aria-label="Twitter">TW</a>
                <a href="#/" aria-label="Pinterest">PT</a>
                <a href="#/" aria-label="YouTube">YT</a>
              </div>
            </div>
            
            <div className="footer-section">
              <h4>SHOP</h4>
              <ul>
                <li><a href="#/">Women</a></li>
                <li><a href="#/">Men</a></li>
                <li><a href="#/">Kids</a></li>
                <li><a href="#/">Beauty</a></li>
                <li><a href="#/">Accessories</a></li>
                <li><a href="#/">New Arrivals</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>HELP</h4>
              <ul>
                <li><a href="#/">Shipping & Returns</a></li>
                <li><a href="#/">Payment Methods</a></li>
                <li><a href="#/">Track Order</a></li>
                <li><a href="#/">FAQ</a></li>
                <li><a href="#/">Contact Us</a></li>
                <li><a href="#/">Size Guide</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>COMPANY</h4>
              <ul>
                <li><a href="#/">About Us</a></li>
                <li><a href="#/">Stores</a></li>
                <li><a href="#/">Careers</a></li>
                <li><a href="#/">Sustainability</a></li>
                <li><a href="#/">Privacy Policy</a></li>
                <li><a href="#/">Terms of Service</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>CONTACT</h4>
              <ul>
                <li>123 Design Street</li>
                <li>Fashion District, FD 10001</li>
                <li>contact@infinitewavex.com</li>
                <li>+1 (555) 123-IWX</li>
              </ul>
              <div className="payment-methods">
                <span>We accept:</span>
                <div className="payment-icons">
                  <span>Visa</span>
                  <span>MC</span>
                  <span>Amex</span>
                  <span>PayPal</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>© 2025 InfiniteWaveX. ALL RIGHTS RESERVED.</p>
            <div className="footer-links">
              <a href="#/">Privacy Policy</a>
              <a href="#/">Terms of Service</a>
              <a href="#/">Accessibility</a>
              <a href="#/">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;