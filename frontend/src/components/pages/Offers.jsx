// Offers.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Offers.css';

const Offers = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 300]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const filtersRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };

    const handleClickOutside = (event) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target)) {
        setIsFiltersOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filters = [
    { id: 'all', label: 'All Offers' },
    { id: 'women', label: 'Women' },
    { id: 'men', label: 'Men' },
    { id: 'kids', label: 'Kids' },
    { id: 'accessories', label: 'Accessories' },
    { id: 'beauty', label: 'Beauty' }
  ];

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const colors = ['Black', 'White', 'Red', 'Blue', 'Green', 'Beige', 'Gray'];

  const deals = [
    {
      id: 1,
      name: "Summer Essentials Sale",
      discount: "UP TO 50% OFF",
      category: "women",
      image: "https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
      description: "Refresh your wardrobe with our summer collection",
      expiry: "2025-07-15T23:59:59",
      featured: true
    },
    {
      id: 2,
      name: "Men's Formal Wear",
      discount: "UP TO 40% OFF",
      category: "men",
      image: "https://images.unsplash.com/photo-1617137968429-3c386e5a2b0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
      description: "Elevate your style with premium formal wear",
      expiry: "2025-07-10T23:59:59",
      featured: true
    },
    {
      id: 3,
      name: "Kids Collection",
      discount: "UP TO 30% OFF",
      category: "kids",
      image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
      description: "Adorable styles for the little ones",
      expiry: "2025-07-20T23:59:59",
      featured: false
    },
    {
      id: 4,
      name: "Beauty Bonanza",
      discount: "BUY 2 GET 1 FREE",
      category: "beauty",
      image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1180&q=80",
      description: "Pamper yourself with our premium beauty products",
      expiry: "2025-07-05T23:59:59",
      featured: true
    },
    {
      id: 5,
      name: "Accessory Special",
      discount: "UP TO 35% OFF",
      category: "accessories",
      image: "https://images.unsplash.com/photo-1583744946564-b52ae1c3c559?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
      description: "Complete your look with our accessory collection",
      expiry: "2025-07-12T23:59:59",
      featured: false
    },
    {
      id: 6,
      name: "Weekend Flash Sale",
      discount: "UP TO 60% OFF",
      category: "women",
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
      description: "Don't miss out on our weekend specials",
      expiry: "2025-07-03T23:59:59",
      featured: true
    },
    {
      id: 7,
      name: "Men's Casual Wear",
      discount: "UP TO 45% OFF",
      category: "men",
      image: "https://images.unsplash.com/photo-1556906781-2f0520405b71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
      description: "Comfortable and stylish casual outfits",
      expiry: "2025-07-18T23:59:59",
      featured: false
    },
    {
      id: 8,
      name: "Back to School",
      discount: "UP TO 50% OFF",
      category: "kids",
      image: "https://images.unsplash.com/photo-1540479859555-17af45c78602?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
      description: "Get ready for school with style",
      expiry: "2025-07-25T23:59:59",
      featured: true
    }
  ];

  const products = [
    {
      id: 1,
      name: "Linen Blend Dress",
      price: 59.99,
      originalPrice: 99.99,
      discount: 40,
      category: "women",
      image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
      sizes: ['XS', 'S', 'M', 'L'],
      colors: ['Black', 'White', 'Blue'],
      rating: 4.5,
      reviews: 128,
      limitedStock: true
    },
    {
      id: 2,
      name: "Slim Fit Suit",
      price: 129.99,
      originalPrice: 199.99,
      discount: 35,
      category: "men",
      image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1036&q=80",
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Black', 'Gray', 'Navy'],
      rating: 4.8,
      reviews: 89,
      limitedStock: false
    },
    {
      id: 3,
      name: "Kids Summer Set",
      price: 34.99,
      originalPrice: 49.99,
      discount: 30,
      category: "kids",
      image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
      sizes: ['XS', 'S', 'M'],
      colors: ['Red', 'Blue', 'Yellow'],
      rating: 4.3,
      reviews: 67,
      limitedStock: true
    },
    {
      id: 4,
      name: "Premium Skincare Kit",
      price: 49.99,
      originalPrice: 79.99,
      discount: 38,
      category: "beauty",
      image: "https://images.unsplash.com/photo-1591369822096-ffd140ec948a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
      sizes: ['One Size'],
      colors: ['White'],
      rating: 4.7,
      reviews: 204,
      limitedStock: false
    },
    {
      id: 5,
      name: "Designer Handbag",
      price: 79.99,
      originalPrice: 129.99,
      discount: 39,
      category: "accessories",
      image: "https://images.unsplash.com/photo-1583744946564-b52ae1c3c559?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
      sizes: ['One Size'],
      colors: ['Black', 'Brown', 'Beige'],
      rating: 4.6,
      reviews: 156,
      limitedStock: true
    },
    {
      id: 6,
      name: "Casual Summer Shirt",
      price: 35.99,
      originalPrice: 59.99,
      discount: 40,
      category: "men",
      image: "https://images.unsplash.com/photo-1556906781-2f0520405b71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['White', 'Blue', 'Green'],
      rating: 4.4,
      reviews: 98,
      limitedStock: false
    },
    {
      id: 7,
      name: "Evening Gown",
      price: 89.99,
      originalPrice: 149.99,
      discount: 40,
      category: "women",
      image: "https://images.unsplash.com/photo-1591369822096-ffd140ec948a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
      sizes: ['XS', 'S', 'M'],
      colors: ['Black', 'Red', 'Navy'],
      rating: 4.9,
      reviews: 112,
      limitedStock: true
    },
    {
      id: 8,
      name: "Children's Backpack",
      price: 24.99,
      originalPrice: 39.99,
      discount: 38,
      category: "kids",
      image: "https://images.unsplash.com/photo-1540479859555-17af45c78602?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
      sizes: ['One Size'],
      colors: ['Blue', 'Pink', 'Green'],
      rating: 4.2,
      reviews: 76,
      limitedStock: false
    },
    {
      id: 9,
      name: "Sunglasses Collection",
      price: 45.99,
      originalPrice: 79.99,
      discount: 43,
      category: "accessories",
      image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1180&q=80",
      sizes: ['One Size'],
      colors: ['Black', 'Brown', 'Tortoise'],
      rating: 4.5,
      reviews: 143,
      limitedStock: true
    },
    {
      id: 10,
      name: "Men's Watch",
      price: 99.99,
      originalPrice: 159.99,
      discount: 38,
      category: "accessories",
      image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
      sizes: ['One Size'],
      colors: ['Silver', 'Black', 'Gold'],
      rating: 4.7,
      reviews: 187,
      limitedStock: false
    },
    {
      id: 11,
      name: "Women's Perfume",
      price: 59.99,
      originalPrice: 89.99,
      discount: 34,
      category: "beauty",
      image: "https://images.unsplash.com/photo-1595425970377-2f8ded7c7b19?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
      sizes: ['50ml', '100ml'],
      colors: ['Pink', 'Clear'],
      rating: 4.6,
      reviews: 132,
      limitedStock: true
    },
    {
      id: 12,
      name: "Athletic Shoes",
      price: 69.99,
      originalPrice: 119.99,
      discount: 42,
      category: "men",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
      sizes: ['7', '8', '9', '10', '11'],
      colors: ['Black', 'White', 'Blue'],
      rating: 4.4,
      reviews: 201,
      limitedStock: false
    }
  ];

  const filteredProducts = products.filter(product => {
    if (activeFilter !== 'all' && product.category !== activeFilter) return false;
    if (selectedSizes.length > 0 && !product.sizes.some(size => selectedSizes.includes(size))) return false;
    if (selectedColors.length > 0 && !product.colors.some(color => selectedColors.includes(color))) return false;
    if (product.price < priceRange[0] || product.price > priceRange[1]) return false;
    return true;
  });

  const filteredDeals = deals.filter(deal => {
    return activeFilter === 'all' || deal.category === activeFilter;
  });

  const toggleSize = (size) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter(s => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  const toggleColor = (color) => {
    if (selectedColors.includes(color)) {
      setSelectedColors(selectedColors.filter(c => c !== color));
    } else {
      setSelectedColors([...selectedColors, color]);
    }
  };

  const CountdownTimer = ({ expiryDate }) => {
    const [timeLeft, setTimeLeft] = useState({});

    useEffect(() => {
      const calculateTimeLeft = () => {
        const difference = new Date(expiryDate) - new Date();
        let timeLeft = {};

        if (difference > 0) {
          timeLeft = {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60)
          };
        }

        return timeLeft;
      };

      const timer = setInterval(() => {
        setTimeLeft(calculateTimeLeft());
      }, 1000);

      return () => clearInterval(timer);
    }, [expiryDate]);

    const timerComponents = [];

    Object.keys(timeLeft).forEach(interval => {
      if (!timeLeft[interval]) {
        return;
      }

      timerComponents.push(
        <span key={interval} className="time-unit">
          {timeLeft[interval]} {interval}{" "}
        </span>
      );
    });

    return (
      <div className="countdown-timer">
        {timerComponents.length ? (
          <p>Ends in: {timerComponents}</p>
        ) : (
          <p>Offer has ended</p>
        )}
      </div>
    );
  };

  const ProductCard = ({ product }) => {
    return (
      <motion.div 
        className="product-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -5 }}
      >
        <div className="product-image">
          <img src={product.image} alt={product.name} />
          <div className="product-badges">
            {product.discount && <span className="discount-badge">-{product.discount}%</span>}
            {product.limitedStock && <span className="stock-badge">Limited Stock</span>}
          </div>
          <button className="quick-add">QUICK ADD</button>
        </div>
        <div className="product-info">
          <h3>{product.name}</h3>
          <div className="price">
            <span className="current-price">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="original-price">${product.originalPrice.toFixed(2)}</span>
            )}
          </div>
          <div className="rating">
            <div className="stars">
              {'★'.repeat(Math.floor(product.rating))}
              {'☆'.repeat(5 - Math.floor(product.rating))}
            </div>
            <span className="review-count">({product.reviews})</span>
          </div>
        </div>
      </motion.div>
    );
  };

  const DealCard = ({ deal }) => {
    return (
      <motion.div 
        className="deal-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -5 }}
      >
        <div className="deal-image">
          <img src={deal.image} alt={deal.name} />
          {deal.featured && <span className="featured-badge">FEATURED</span>}
        </div>
        <div className="deal-content">
          <h3>{deal.name}</h3>
          <p className="discount">{deal.discount}</p>
          <p className="description">{deal.description}</p>
          <CountdownTimer expiryDate={deal.expiry} />
          <button className="shop-now-btn">SHOP NOW</button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="offers-container">
      {/* Header Banner */}
      <section className="offers-banner">
        <div className="banner-content">
          <h1>SPECIAL OFFERS & DEALS</h1>
          <p>Enjoy incredible discounts on our premium collections</p>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="filter-bar">
        <div className="container">
          <div className="filter-tabs">
            {filters.map(filter => (
              <button
                key={filter.id}
                className={`filter-tab ${activeFilter === filter.id ? 'active' : ''}`}
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <div className="filter-controls">
            <div className="sort-by">
              <label>Sort by:</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="discount">Discount</option>
                <option value="newest">Newest</option>
              </select>
            </div>
            <button 
              className="filter-toggle"
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            >
              Filters
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="offers-content">
        <div className="container">
          {/* Filters Sidebar */}
          <AnimatePresence>
            {isFiltersOpen && (
              <motion.div 
                className="filters-sidebar"
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ type: "spring", damping: 25 }}
                ref={filtersRef}
              >
                <div className="filter-group">
                  <h4>Price Range</h4>
                  <div className="price-slider">
                    <input 
                      type="range" 
                      min="0" 
                      max="300" 
                      value={priceRange[0]} 
                      onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                    />
                    <input 
                      type="range" 
                      min="0" 
                      max="300" 
                      value={priceRange[1]} 
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    />
                  </div>
                  <div className="price-values">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>

                <div className="filter-group">
                  <h4>Size</h4>
                  <div className="size-filters">
                    {sizes.map(size => (
                      <button
                        key={size}
                        className={`size-filter ${selectedSizes.includes(size) ? 'active' : ''}`}
                        onClick={() => toggleSize(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="filter-group">
                  <h4>Color</h4>
                  <div className="color-filters">
                    {colors.map(color => (
                      <button
                        key={color}
                        className={`color-filter ${selectedColors.includes(color) ? 'active' : ''}`}
                        onClick={() => toggleColor(color)}
                        aria-label={color}
                        style={{ backgroundColor: color.toLowerCase() }}
                      />
                    ))}
                  </div>
                </div>

                <div className="filter-group">
                  <h4>Discount</h4>
                  <div className="discount-filters">
                    <label>
                      <input type="checkbox" />
                      <span>30% and above</span>
                    </label>
                    <label>
                      <input type="checkbox" />
                      <span>40% and above</span>
                    </label>
                    <label>
                      <input type="checkbox" />
                      <span>50% and above</span>
                    </label>
                  </div>
                </div>

                <button className="apply-filters">Apply Filters</button>
                <button className="clear-filters">Clear All</button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Products Grid */}
          <div className="products-section">
            {/* Featured Deals */}
            <section className="featured-deals">
              <h2>FEATURED DEALS</h2>
              <div className="deals-grid">
                {filteredDeals.filter(deal => deal.featured).map(deal => (
                  <DealCard key={deal.id} deal={deal} />
                ))}
              </div>
            </section>

            {/* All Deals */}
            <section className="all-deals">
              <h2>ALL DEALS</h2>
              <div className="deals-grid">
                {filteredDeals.map(deal => (
                  <DealCard key={deal.id} deal={deal} />
                ))}
              </div>
            </section>

            {/* Products Grid */}
            <section className="products-grid-section">
              <div className="section-header">
                <h2>ON SALE NOW</h2>
                <p>{filteredProducts.length} products</p>
              </div>
              <div className="products-grid">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>

            {/* Limited Time Offers */}
            <section className="limited-offers">
              <div className="limited-offers-header">
                <h2>LIMITED TIME OFFERS</h2>
                <CountdownTimer expiryDate="2025-07-07T23:59:59" />
              </div>
              <div className="products-grid">
                {products.filter(p => p.limitedStock).map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>

            {/* Newsletter */}
            <section className="offers-newsletter">
              <div className="newsletter-content">
                <h2>GET EXCLUSIVE DEALS</h2>
                <p>Subscribe to our newsletter and be the first to know about special offers and promotions</p>
                <div className="newsletter-form">
                  <input type="email" placeholder="Enter your email address" />
                  <button>SUBSCRIBE</button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button 
            className="scroll-top-btn"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={scrollToTop}
          >
            ↑
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Offers;
