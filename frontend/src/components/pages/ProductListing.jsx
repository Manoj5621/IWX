// ProductListing.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ProductListing.css';

const ProductListing = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState('recommended');
  const [activeFilters, setActiveFilters] = useState({
    category: [],
    size: [],
    color: [],
    price: []
  });
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);
  const [loading, setLoading] = useState(true);
  const filterRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
        setIsSortOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate mock product data
  useEffect(() => {
    const generateProducts = () => {
      const categories = ['Woman', 'Man', 'Kids', 'Accessories'];
      const sizes = ['XS', 'S', 'M', 'L', 'XL'];
      const colors = ['Black', 'White', 'Navy', 'Beige', 'Green', 'Red', 'Yellow', 'Gray'];
      
      return Array.from({ length: 48 }, (_, i) => {
        const category = categories[Math.floor(Math.random() * categories.length)];
        const isNew = Math.random() > 0.7;
        const isSustainable = Math.random() > 0.8;
        const isTrending = Math.random() > 0.6;
        const onSale = Math.random() > 0.9;
        
        const originalPrice = Math.floor(Math.random() * 100) + 30;
        const salePrice = onSale ? Math.floor(originalPrice * 0.7) : null;
        
        return {
          id: i + 1,
          name: `${category} Product ${i + 1}`,
          category,
          price: originalPrice,
          salePrice,
          image: `https://images.unsplash.com/photo-15${i % 9}3456789-abcde${i % 9}fghijk?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80`,
          sizes: sizes.slice(0, Math.floor(Math.random() * 3) + 2),
          color: colors[Math.floor(Math.random() * colors.length)],
          isNew,
          isSustainable,
          isTrending,
          onSale,
          rating: (Math.random() * 5).toFixed(1),
          reviewCount: Math.floor(Math.random() * 100)
        };
      });
    };

    setProducts(generateProducts());
    setFilteredProducts(generateProducts());
    setLoading(false);
  }, []);

  // Filter products based on active filters
  useEffect(() => {
    let filtered = [...products];
    
    // Category filter
    if (activeFilters.category.length > 0) {
      filtered = filtered.filter(product => 
        activeFilters.category.includes(product.category.toLowerCase())
      );
    }
    
    // Size filter
    if (activeFilters.size.length > 0) {
      filtered = filtered.filter(product => 
        product.sizes.some(size => activeFilters.size.includes(size.toLowerCase()))
      );
    }
    
    // Color filter
    if (activeFilters.color.length > 0) {
      filtered = filtered.filter(product => 
        activeFilters.color.includes(product.color.toLowerCase())
      );
    }
    
    // Price filter
    if (activeFilters.price.length > 0) {
      if (activeFilters.price.includes('under50')) {
        filtered = filtered.filter(product => product.price < 50);
      }
      if (activeFilters.price.includes('50to100')) {
        filtered = filtered.filter(product => product.price >= 50 && product.price < 100);
      }
      if (activeFilters.price.includes('100to150')) {
        filtered = filtered.filter(product => product.price >= 100 && product.price < 150);
      }
      if (activeFilters.price.includes('over150')) {
        filtered = filtered.filter(product => product.price >= 150);
      }
    }
    
    // Sort products
    switch(selectedSort) {
      case 'priceLowHigh':
        filtered.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
        break;
      case 'priceHighLow':
        filtered.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
        break;
      case 'newest':
        filtered.sort((a, b) => b.id - a.id);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      default:
        // Recommended (default order)
        break;
    }
    
    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [activeFilters, selectedSort, products]);

  // Handle filter toggle
  const handleFilterToggle = (filterType, value) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      if (newFilters[filterType].includes(value)) {
        newFilters[filterType] = newFilters[filterType].filter(item => item !== value);
      } else {
        newFilters[filterType] = [...newFilters[filterType], value];
      }
      return newFilters;
    });
  };

  // Clear all filters
  const clearAllFilters = () => {
    setActiveFilters({
      category: [],
      size: [],
      color: [],
      price: []
    });
    setSelectedSort('recommended');
  };

  // Get current products for pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Render star ratings
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < Math.floor(rating) ? "star filled" : "star"}>★</span>
    ));
  };

  // Filter options
  const filterOptions = {
    category: [
      { label: 'Woman', value: 'woman' },
      { label: 'Man', value: 'man' },
      { label: 'Kids', value: 'kids' },
      { label: 'Accessories', value: 'accessories' }
    ],
    size: [
      { label: 'XS', value: 'xs' },
      { label: 'S', value: 's' },
      { label: 'M', value: 'm' },
      { label: 'L', value: 'l' },
      { label: 'XL', value: 'xl' }
    ],
    color: [
      { label: 'Black', value: 'black' },
      { label: 'White', value: 'white' },
      { label: 'Navy', value: 'navy' },
      { label: 'Beige', value: 'beige' },
      { label: 'Green', value: 'green' },
      { label: 'Red', value: 'red' }
    ],
    price: [
      { label: 'Under $50', value: 'under50' },
      { label: '$50 - $100', value: '50to100' },
      { label: '$100 - $150', value: '100to150' },
      { label: 'Over $150', value: 'over150' }
    ]
  };

  const sortOptions = [
    { label: 'Recommended', value: 'recommended' },
    { label: 'Price: Low to High', value: 'priceLowHigh' },
    { label: 'Price: High to Low', value: 'priceHighLow' },
    { label: 'Newest', value: 'newest' },
    { label: 'Rating', value: 'rating' }
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="product-listing-page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="container">
          <a href="#/">Home</a> / <a href="#/">Women</a> / <span>All Clothing</span>
        </div>
      </div>

      {/* Banner */}
      <section className="plp-banner">
        <div className="container">
          <h1>Women's Collection</h1>
          <p>Discover the latest trends in women's fashion</p>
        </div>
      </section>

      {/* Filters and Sorting Bar */}
      <div className="filters-bar">
        <div className="container">
          <div className="filters-left">
            <button 
              className="filter-toggle"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              Filters
              <span className="filter-count">
                {Object.values(activeFilters).flat().length > 0 ? Object.values(activeFilters).flat().length : ''}
              </span>
            </button>
            
            <div className="active-filters">
              {activeFilters.category.map(filter => (
                <span key={filter} className="active-filter">
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  <button onClick={() => handleFilterToggle('category', filter)}>×</button>
                </span>
              ))}
              {activeFilters.size.map(filter => (
                <span key={filter} className="active-filter">
                  Size: {filter.toUpperCase()}
                  <button onClick={() => handleFilterToggle('size', filter)}>×</button>
                </span>
              ))}
              {activeFilters.color.map(filter => (
                <span key={filter} className="active-filter">
                  Color: {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  <button onClick={() => handleFilterToggle('color', filter)}>×</button>
                </span>
              ))}
              {activeFilters.price.map(filter => (
                <span key={filter} className="active-filter">
                  {filterOptions.price.find(opt => opt.value === filter)?.label}
                  <button onClick={() => handleFilterToggle('price', filter)}>×</button>
                </span>
              ))}
              {Object.values(activeFilters).flat().length > 0 && (
                <button className="clear-filters" onClick={clearAllFilters}>
                  Clear all
                </button>
              )}
            </div>
          </div>

          <div className="filters-right">
            <p className="results-count">{filteredProducts.length} products</p>
            
            <div className="sort-dropdown" ref={filterRef}>
              <button 
                className="sort-toggle"
                onClick={() => setIsSortOpen(!isSortOpen)}
              >
                Sort: {sortOptions.find(opt => opt.value === selectedSort)?.label}
              </button>
              
              <AnimatePresence>
                {isSortOpen && (
                  <motion.div 
                    className="sort-options"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {sortOptions.map(option => (
                      <button
                        key={option.value}
                        className={selectedSort === option.value ? 'active' : ''}
                        onClick={() => {
                          setSelectedSort(option.value);
                          setIsSortOpen(false);
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="plp-container">
        <div className="container">
          {/* Filters Sidebar */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div 
                className="filters-sidebar"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="filter-group">
                  <h3>Category</h3>
                  {filterOptions.category.map(option => (
                    <label key={option.value} className="filter-checkbox">
                      <input
                        type="checkbox"
                        checked={activeFilters.category.includes(option.value)}
                        onChange={() => handleFilterToggle('category', option.value)}
                      />
                      <span className="checkmark"></span>
                      {option.label}
                    </label>
                  ))}
                </div>

                <div className="filter-group">
                  <h3>Size</h3>
                  <div className="size-filters">
                    {filterOptions.size.map(option => (
                      <button
                        key={option.value}
                        className={`size-filter ${activeFilters.size.includes(option.value) ? 'active' : ''}`}
                        onClick={() => handleFilterToggle('size', option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="filter-group">
                  <h3>Color</h3>
                  {filterOptions.color.map(option => (
                    <label key={option.value} className="filter-checkbox">
                      <input
                        type="checkbox"
                        checked={activeFilters.color.includes(option.value)}
                        onChange={() => handleFilterToggle('color', option.value)}
                      />
                      <span className="checkmark"></span>
                      {option.label}
                    </label>
                  ))}
                </div>

                <div className="filter-group">
                  <h3>Price</h3>
                  {filterOptions.price.map(option => (
                    <label key={option.value} className="filter-checkbox">
                      <input
                        type="checkbox"
                        checked={activeFilters.price.includes(option.value)}
                        onChange={() => handleFilterToggle('price', option.value)}
                      />
                      <span className="checkmark"></span>
                      {option.label}
                    </label>
                  ))}
                </div>

                <div className="filter-group">
                  <h3>Sustainability</h3>
                  <label className="filter-checkbox">
                    <input type="checkbox" />
                    <span className="checkmark"></span>
                    Sustainable materials
                  </label>
                </div>

                <button className="apply-filters" onClick={() => setIsFilterOpen(false)}>
                  Apply Filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Products Grid */}
          <div className="products-grid-container">
            {currentProducts.length > 0 ? (
              <>
                <div className="products-grid">
                  {currentProducts.map(product => (
                    <motion.div 
                      key={product.id} 
                      className="product-card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ y: -5 }}
                    >
                      <div className="product-image">
                        <img src={product.image} alt={product.name} />
                        <button className="wishlist-btn">♥</button>
                        
                        {product.onSale && (
                          <span className="sale-badge">SALE</span>
                        )}
                        {product.isNew && (
                          <span className="new-badge">NEW</span>
                        )}
                        {product.isSustainable && (
                          <span className="eco-badge">ECO</span>
                        )}
                        
                        <div className="product-actions">
                          <button className="quick-view">Quick View</button>
                          <button className="add-to-bag">Add to Bag</button>
                        </div>
                      </div>
                      
                      <div className="product-info">
                        <div className="product-meta">
                          {product.isTrending && (
                            <span className="trending">Trending</span>
                          )}
                          <span className="product-name">{product.name}</span>
                        </div>
                        
                        <div className="product-price">
                          {product.onSale ? (
                            <>
                              <span className="sale-price">${product.salePrice}</span>
                              <span className="original-price">${product.price}</span>
                            </>
                          ) : (
                            <span>${product.price}</span>
                          )}
                        </div>
                        
                        <div className="product-colors">
                          <span className="color-dot" style={{ backgroundColor: product.color.toLowerCase() }}></span>
                          <span>+{Math.floor(Math.random() * 5) + 1} colors</span>
                        </div>
                        
                        <div className="product-rating">
                          {renderStars(product.rating)}
                          <span>({product.reviewCount})</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination">
                    <button 
                      className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
                      onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                        onClick={() => paginate(page)}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button 
                      className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`}
                      onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="no-products">
                <h2>No products found</h2>
                <p>Try adjusting your filters to see more results</p>
                <button className="clear-filters-btn" onClick={clearAllFilters}>
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <section className="plp-newsletter">
        <div className="container">
          <h2>Stay Updated</h2>
          <p>Subscribe to our newsletter for exclusive updates and offers</p>
          <div className="newsletter-form">
            <input type="email" placeholder="Your email address" />
            <button>Subscribe</button>
          </div>
        </div>
      </section>

      {/* Recently Viewed */}
      <section className="recently-viewed">
        <div className="container">
          <h2>Recently Viewed</h2>
          <div className="viewed-products">
            {products.slice(0, 5).map(product => (
              <div key={`recent-${product.id}`} className="viewed-product">
                <img src={product.image} alt={product.name} />
                <div>
                  <p>{product.name}</p>
                  <span>${product.onSale ? product.salePrice : product.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductListing;