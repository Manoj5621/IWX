import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar/Navbar';
import './ProductDetails.css';

const ProductDetail = () => {
  const [selectedColor, setSelectedColor] = useState('black');
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isZoomed, setIsZoomed] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const product = {
    id: 1,
    name: 'Premium Leather Jacket',
    brand: 'InfiniteWaveX',
    price: 199.99,
    originalPrice: 249.99,
    description: 'Crafted from the finest genuine leather, this premium jacket combines timeless style with modern sophistication. Designed for those who appreciate quality and attention to detail.',
    details: '100% genuine leather. Lining: 100% cotton. Imported. Button closure. Dry clean only.',
    colors: [
      { name: 'Black', value: 'black', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80' },
      { name: 'Brown', value: 'brown', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=869&q=80' },
      { name: 'Navy', value: 'navy', image: 'https://images.unsplash.com/photo-1551110376-6d9bd77c76c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=869&q=80',
      'https://images.unsplash.com/photo-1551110376-6d9bd77c76c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80',
      'https://images.unsplash.com/photo-1551110376-6d9bd77c76c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80'
    ],
    features: [
      'Genuine leather construction',
      'Soft cotton lining',
      'Classic biker style',
      'Multiple pocket options',
      'Adjustable cuffs and waist'
    ],
    materials: [
      { name: 'Leather', percentage: 100 },
      { name: 'Cotton', percentage: 100 }
    ],
    rating: 4.8,
    reviews: 142,
    inStock: true,
    sku: 'IWX-LJ-001',
    delivery: 'Free delivery on orders over $100'
  };

  const relatedProducts = [
    {
      id: 2,
      name: 'Designer Silk Dress',
      price: 149.99,
      image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
      category: 'Dresses'
    },
    {
      id: 3,
      name: 'Limited Edition Sneakers',
      price: 129.99,
      image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1160&q=80',
      category: 'Footwear'
    },
    {
      id: 4,
      name: 'Cashmere Sweater',
      price: 89.99,
      image: 'https://images.unsplash.com/photo-1593030103066-0093718efeb9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1160&q=80',
      category: 'Knitwear'
    },
    {
      id: 5,
      name: 'Designer Handbag',
      price: 179.99,
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1035&q=80',
      category: 'Accessories'
    }
  ];

  const reviews = [
    {
      id: 1,
      user: 'Sarah Johnson',
      rating: 5,
      date: '2025-05-15',
      comment: 'Absolutely love this jacket! The quality is exceptional and it fits perfectly. I get compliments every time I wear it.',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80'
    },
    {
      id: 2,
      user: 'Michael Chen',
      rating: 4,
      date: '2025-05-10',
      comment: 'Great jacket overall. The leather is high quality and it has a nice weight to it. Runs slightly large, so consider sizing down.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80'
    },
    {
      id: 3,
      user: 'Emma Rodriguez',
      rating: 5,
      date: '2025-05-05',
      comment: 'Worth every penny! The craftsmanship is outstanding and it gets better with wear. Perfect for both casual and dressed-up occasions.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80'
    }
  ];

  const sizeGuide = {
    measurements: ['Chest', 'Length', 'Sleeve'],
    sizes: {
      XS: [38, 26, 24],
      S: [40, 27, 25],
      M: [42, 28, 26],
      L: [44, 29, 27],
      XL: [46, 30, 28]
    }
  };

  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  const handleAddToCart = () => {
    // In a real app, this would add the product to the cart
    setShowNotification(true);
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < Math.floor(rating) ? "star filled" : "star"}>★</span>
    ));
  };

  const shareOptions = [
    { name: 'Facebook', icon: '📘' },
    { name: 'Twitter', icon: '🐦' },
    { name: 'Pinterest', icon: '📌' },
    { name: 'Email', icon: '✉️' },
    { name: 'Copy Link', icon: '🔗' }
  ];

  return (
    <div className="product-detail-container">
      <Navbar />

      {/* Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            className="notification"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
          >
            <p>Item added to your bag!</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="container">
          <a href="#/">Home</a> / <a href="#/">Men</a> / <a href="#/">Jackets</a> / <span>{product.name}</span>
        </div>
      </div>

      <div className="product-detail-content">
        <div className="container">
          <div className="product-main">
            {/* Product Images */}
            <div className="product-images">
              <div className="main-image">
                <img 
                  src={product.images[currentImage]} 
                  alt={product.name}
                  className={isZoomed ? 'zoomed' : ''}
                  onClick={() => setIsZoomed(!isZoomed)}
                />
                <button 
                  className="wishlist-btn"
                  onClick={handleWishlist}
                >
                  {isWishlisted ? '❤️' : '♡'}
                </button>
                {product.originalPrice > product.price && (
                  <span className="sale-badge">SALE</span>
                )}
              </div>
              <div className="image-thumbnails">
                {product.images.map((image, index) => (
                  <div 
                    key={index} 
                    className={`thumbnail ${currentImage === index ? 'active' : ''}`}
                    onClick={() => setCurrentImage(index)}
                  >
                    <img src={image} alt={`${product.name} view ${index + 1}`} />
                  </div>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="product-info">
              <div className="brand-header">
                <h1>{product.brand}</h1>
                <p className="slogan">Designing Tomorrow, Today</p>
              </div>
              
              <h2>{product.name}</h2>
              
              <div className="price-section">
                {product.originalPrice > product.price ? (
                  <>
                    <span className="current-price">${product.price.toFixed(2)}</span>
                    <span className="original-price">${product.originalPrice.toFixed(2)}</span>
                    <span className="discount">({Math.round((1 - product.price / product.originalPrice) * 100)}% OFF)</span>
                  </>
                ) : (
                  <span className="current-price">${product.price.toFixed(2)}</span>
                )}
              </div>

              <div className="rating-section">
                <div className="stars">
                  {renderStars(product.rating)}
                  <span>({product.reviews})</span>
                </div>
                <span className="sku">SKU: {product.sku}</span>
              </div>

              <div className="color-section">
                <h3>Color: {selectedColor}</h3>
                <div className="color-options">
                  {product.colors.map(color => (
                    <div 
                      key={color.value}
                      className={`color-option ${selectedColor === color.value ? 'active' : ''}`}
                      onClick={() => setSelectedColor(color.value)}
                    >
                      <img src={color.image} alt={color.name} />
                      <span>{color.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="size-section">
                <div className="size-header">
                  <h3>Size: {selectedSize}</h3>
                  <button 
                    className="size-guide-btn"
                    onClick={() => setShowSizeGuide(!showSizeGuide)}
                  >
                    Size Guide
                  </button>
                </div>
                
                <div className="size-options">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      className={`size-option ${selectedSize === size ? 'active' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>

                <AnimatePresence>
                  {showSizeGuide && (
                    <motion.div 
                      className="size-guide"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <h4>Size Guide (inches)</h4>
                      <table>
                        <thead>
                          <tr>
                            <th>Size</th>
                            {sizeGuide.measurements.map(m => (
                              <th key={m}>{m}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(sizeGuide.sizes).map(([size, measurements]) => (
                            <tr key={size}>
                              <td>{size}</td>
                              {measurements.map((m, i) => (
                                <td key={i}>{m}"</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="quantity-section">
                <h3>Quantity</h3>
                <div className="quantity-selector">
                  <button onClick={decrementQuantity}>-</button>
                  <span>{quantity}</span>
                  <button onClick={incrementQuantity}>+</button>
                </div>
              </div>

              <div className="action-buttons">
                <button 
                  className="add-to-cart-btn"
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                >
                  {product.inStock ? 'Add to Bag' : 'Out of Stock'}
                </button>
                <button className="buy-now-btn">
                  Buy Now
                </button>
              </div>

              <div className="delivery-info">
                <p>🚚 {product.delivery}</p>
                <p>📦 Free returns within 30 days</p>
              </div>

              <div className="share-section">
                <button 
                  className="share-btn"
                  onClick={() => setShowShareMenu(!showShareMenu)}
                >
                  Share
                </button>
                
                <AnimatePresence>
                  {showShareMenu && (
                    <motion.div 
                      className="share-menu"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                    >
                      {shareOptions.map(option => (
                        <button key={option.name} className="share-option">
                          <span className="share-icon">{option.icon}</span>
                          {option.name}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="product-tabs">
            <div className="tab-headers">
              <button 
                className={activeTab === 'description' ? 'active' : ''}
                onClick={() => setActiveTab('description')}
              >
                Description
              </button>
              <button 
                className={activeTab === 'details' ? 'active' : ''}
                onClick={() => setActiveTab('details')}
              >
                Details & Care
              </button>
              <button 
                className={activeTab === 'reviews' ? 'active' : ''}
                onClick={() => setActiveTab('reviews')}
              >
                Reviews ({product.reviews})
              </button>
              <button 
                className={activeTab === 'shipping' ? 'active' : ''}
                onClick={() => setActiveTab('shipping')}
              >
                Shipping & Returns
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'description' && (
                <div className="tab-pane">
                  <h3>Product Description</h3>
                  <p>{product.description}</p>
                  
                  <div className="features-list">
                    <h4>Features</h4>
                    <ul>
                      {product.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'details' && (
                <div className="tab-pane">
                  <h3>Details & Care</h3>
                  <p>{product.details}</p>
                  
                  <div className="materials-list">
                    <h4>Materials</h4>
                    <ul>
                      {product.materials.map((material, index) => (
                        <li key={index}>
                          {material.name}: {material.percentage}%
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="care-instructions">
                    <h4>Care Instructions</h4>
                    <ul>
                      <li>Dry clean only</li>
                      <li>Do not bleach</li>
                      <li>Iron on low heat</li>
                      <li>Line dry only</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="tab-pane">
                  <h3>Customer Reviews</h3>
                  
                  <div className="review-summary">
                    <div className="average-rating">
                      <span className="rating-number">{product.rating}</span>
                      <div className="stars">{renderStars(product.rating)}</div>
                      <span>{product.reviews} reviews</span>
                    </div>
                    
                    <div className="rating-bars">
                      {[5, 4, 3, 2, 1].map(rating => (
                        <div key={rating} className="rating-bar">
                          <span>{rating} ★</span>
                          <div className="bar">
                            <div 
                              className="fill" 
                              style={{ width: `${(rating / 5) * 100}%` }}
                            ></div>
                          </div>
                          <span>{Math.round((rating / 5) * product.reviews)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="reviews-list">
                    {reviews.map(review => (
                      <div key={review.id} className="review">
                        <div className="review-header">
                          <div className="user-info">
                            <img src={review.avatar} alt={review.user} />
                            <div>
                              <h4>{review.user}</h4>
                              <div className="stars">{renderStars(review.rating)}</div>
                            </div>
                          </div>
                          <span className="review-date">{new Date(review.date).toLocaleDateString()}</span>
                        </div>
                        <p>{review.comment}</p>
                      </div>
                    ))}
                  </div>
                  
                  <button className="load-more-reviews">
                    Load More Reviews
                  </button>
                </div>
              )}

              {activeTab === 'shipping' && (
                <div className="tab-pane">
                  <h3>Shipping & Returns</h3>
                  
                  <div className="shipping-info">
                    <h4>Shipping Options</h4>
                    <div className="shipping-options">
                      <div className="shipping-option">
                        <h5>Standard Shipping</h5>
                        <p>$4.99 - 3-5 business days</p>
                      </div>
                      <div className="shipping-option">
                        <h5>Express Shipping</h5>
                        <p>$9.99 - 1-2 business days</p>
                      </div>
                      <div className="shipping-option">
                        <h5>Free Shipping</h5>
                        <p>Free on orders over $100 - 5-7 business days</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="returns-info">
                    <h4>Returns Policy</h4>
                    <p>We offer free returns within 30 days of delivery. Items must be unworn with original tags attached and in original packaging.</p>
                    
                    <h5>How to Return:</h5>
                    <ol>
                      <li>Initiate a return through your account page</li>
                      <li>Print the prepaid shipping label</li>
                      <li>Package your return securely</li>
                      <li>Drop off at any shipping carrier location</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Related Products */}
          <div className="related-products">
            <h2>You Might Also Like</h2>
            <div className="products-grid">
              {relatedProducts.map(product => (
                <div key={product.id} className="product-card">
                  <div className="product-image">
                    <img src={product.image} alt={product.name} />
                    <button className="quick-view">Quick View</button>
                  </div>
                  <div className="product-info">
                    <span className="product-category">{product.category}</span>
                    <h3>{product.name}</h3>
                    <p>${product.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Brand Story */}
          <div className="brand-story">
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
          </div>

          {/* Sustainability */}
          <div className="sustainability">
            <h2>Our Commitment to Sustainability</h2>
            <div className="sustainability-grid">
              <div className="sustainability-item">
                <div className="icon">🌱</div>
                <h3>Eco-Friendly Materials</h3>
                <p>We use sustainable and recycled materials in our products whenever possible.</p>
              </div>
              <div className="sustainability-item">
                <div className="icon">♻️</div>
                <h3>Recycling Program</h3>
                <p>Return your old IWX products for recycling and get 15% off your next purchase.</p>
              </div>
              <div className="sustainability-item">
                <div className="icon">🌍</div>
                <h3>Carbon Neutral Shipping</h3>
                <p>All our shipments are carbon neutral through our partnership with environmental organizations.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;