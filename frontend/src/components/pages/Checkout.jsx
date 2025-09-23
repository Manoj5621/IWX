// Checkout.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Checkout.css';

const Checkout = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Premium Leather Jacket',
      price: 199.99,
      originalPrice: 249.99,
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80',
      size: 'M',
      color: 'Black',
      quantity: 1,
      inStock: true
    },
    {
      id: 2,
      name: 'Designer Silk Dress',
      price: 149.99,
      image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
      size: 'S',
      color: 'Navy',
      quantity: 2,
      inStock: true
    },
    {
      id: 3,
      name: 'Limited Edition Sneakers',
      price: 129.99,
      image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1160&q=80',
      size: 'US 8',
      color: 'White',
      quantity: 1,
      inStock: true
    }
  ]);

  const [customerInfo, setCustomerInfo] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    saveInfo: false
  });

  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('creditCard');
  const [giftCardCode, setGiftCardCode] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [isGiftCardApplied, setIsGiftCardApplied] = useState(false);
  const [isPromoApplied, setIsPromoApplied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState('contact');

  // Calculate order totals
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shippingCost = shippingMethod === 'express' ? 9.99 : 4.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shippingCost + tax;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCartItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const applyGiftCard = () => {
    if (giftCardCode.trim() !== '') {
      setIsGiftCardApplied(true);
      // In a real app, you would validate the gift card code with your backend
    }
  };

  const applyPromoCode = () => {
    if (promoCode.trim() !== '') {
      setIsPromoApplied(true);
      // In a real app, you would validate the promo code with your backend
    }
  };

  const handleSubmitOrder = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setOrderComplete(true);
    }, 2000);
  };

  const toggleAccordion = (section) => {
    setActiveAccordion(activeAccordion === section ? '' : section);
  };

  if (orderComplete) {
    return (
      <div className="checkout-container">
        <div className="order-confirmation">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="confirmation-content"
          >
            <div className="confirmation-icon">✓</div>
            <h1>Order Confirmed!</h1>
            <p>Thank you for your purchase. Your order number is <strong>IWX-{Math.floor(Math.random() * 10000)}</strong></p>
            <p>We've sent a confirmation email to {customerInfo.email}</p>
            
            <div className="order-summary">
              <h2>Order Summary</h2>
              <div className="summary-details">
                <div className="summary-row">
                  <span>Items:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping:</span>
                  <span>${shippingCost.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Tax:</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="summary-row total">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="shipping-info">
              <h2>Shipping Information</h2>
              <p>{customerInfo.firstName} {customerInfo.lastName}</p>
              <p>{customerInfo.address}</p>
              <p>{customerInfo.city}, {customerInfo.state} {customerInfo.zipCode}</p>
              <p>{customerInfo.country}</p>
            </div>

            <div className="confirmation-actions">
              <button className="continue-shopping">Continue Shopping</button>
              <button className="track-order">Track Your Order</button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <h1>InfiniteWaveX</h1>
        <p className="slogan">Designing Tomorrow, Today</p>
        <p className="checkout-progress">Checkout</p>
      </div>

      <div className="checkout-content">
        <div className="checkout-main">
          <div className="checkout-steps">
            <div className={`step ${activeAccordion === 'contact' ? 'active' : ''}`}>
              <div className="step-header" onClick={() => toggleAccordion('contact')}>
                <span className="step-number">1</span>
                <span className="step-title">Contact Information</span>
                <span className="step-toggle">{activeAccordion === 'contact' ? '−' : '+'}</span>
              </div>
              <AnimatePresence>
                {activeAccordion === 'contact' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="step-content"
                  >
                    <div className="form-group">
                      <label>Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={customerInfo.email}
                        onChange={handleInputChange}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    <div className="form-checkbox">
                      <input
                        type="checkbox"
                        id="emailUpdates"
                        name="emailUpdates"
                      />
                      <label htmlFor="emailUpdates">Email me with news and offers</label>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className={`step ${activeAccordion === 'shipping' ? 'active' : ''}`}>
              <div className="step-header" onClick={() => toggleAccordion('shipping')}>
                <span className="step-number">2</span>
                <span className="step-title">Shipping Address</span>
                <span className="step-toggle">{activeAccordion === 'shipping' ? '−' : '+'}</span>
              </div>
              <AnimatePresence>
                {activeAccordion === 'shipping' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="step-content"
                  >
                    <div className="form-row">
                      <div className="form-group">
                        <label>First Name</label>
                        <input
                          type="text"
                          name="firstName"
                          value={customerInfo.firstName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Last Name</label>
                        <input
                          type="text"
                          name="lastName"
                          value={customerInfo.lastName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={customerInfo.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Address</label>
                      <input
                        type="text"
                        name="address"
                        value={customerInfo.address}
                        onChange={handleInputChange}
                        placeholder="Street address"
                        required
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>City</label>
                        <input
                          type="text"
                          name="city"
                          value={customerInfo.city}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>State</label>
                        <select
                          name="state"
                          value={customerInfo.state}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select state</option>
                          <option value="AL">Alabama</option>
                          <option value="AK">Alaska</option>
                          <option value="AZ">Arizona</option>
                          <option value="AR">Arkansas</option>
                          <option value="CA">California</option>
                          <option value="CO">Colorado</option>
                          <option value="CT">Connecticut</option>
                          <option value="DE">Delaware</option>
                          <option value="FL">Florida</option>
                          <option value="GA">Georgia</option>
                          <option value="HI">Hawaii</option>
                          <option value="ID">Idaho</option>
                          <option value="IL">Illinois</option>
                          <option value="IN">Indiana</option>
                          <option value="IA">Iowa</option>
                          <option value="KS">Kansas</option>
                          <option value="KY">Kentucky</option>
                          <option value="LA">Louisiana</option>
                          <option value="ME">Maine</option>
                          <option value="MD">Maryland</option>
                          <option value="MA">Massachusetts</option>
                          <option value="MI">Michigan</option>
                          <option value="MN">Minnesota</option>
                          <option value="MS">Mississippi</option>
                          <option value="MO">Missouri</option>
                          <option value="MT">Montana</option>
                          <option value="NE">Nebraska</option>
                          <option value="NV">Nevada</option>
                          <option value="NH">New Hampshire</option>
                          <option value="NJ">New Jersey</option>
                          <option value="NM">New Mexico</option>
                          <option value="NY">New York</option>
                          <option value="NC">North Carolina</option>
                          <option value="ND">North Dakota</option>
                          <option value="OH">Ohio</option>
                          <option value="OK">Okla homa</option>
                          <option value="OR">Oregon</option>
                          <option value="PA">Pennsylvania</option>
                          <option value="RI">Rhode Island</option>
                          <option value="SC">South Carolina</option>
                          <option value="SD">South Dakota</option>
                          <option value="TN">Tennessee</option>
                          <option value="TX">Texas</option>
                          <option value="UT">Utah</option>
                          <option value="VT">Vermont</option>
                          <option value="VA">Virginia</option>
                          <option value="WA">Washington</option>
                          <option value="WV">West Virginia</option>
                          <option value="WI">Wisconsin</option>
                          <option value="WY">Wyoming</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>ZIP Code</label>
                        <input
                          type="text"
                          name="zipCode"
                          value={customerInfo.zipCode}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Country</label>
                        <select
                          name="country"
                          value={customerInfo.country}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="United States">United States</option>
                          <option value="Canada">Canada</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Australia">Australia</option>
                          <option value="Germany">Germany</option>
                          <option value="France">France</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-checkbox">
                      <input
                        type="checkbox"
                        id="saveInfo"
                        name="saveInfo"
                        checked={customerInfo.saveInfo}
                        onChange={handleInputChange}
                      />
                      <label htmlFor="saveInfo">Save this information for next time</label>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className={`step ${activeAccordion === 'method' ? 'active' : ''}`}>
              <div className="step-header" onClick={() => toggleAccordion('method')}>
                <span className="step-number">3</span>
                <span className="step-title">Shipping Method</span>
                <span className="step-toggle">{activeAccordion === 'method' ? '−' : '+'}</span>
              </div>
              <AnimatePresence>
                {activeAccordion === 'method' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="step-content"
                  >
                    <div className="shipping-options">
                      <label className="shipping-option">
                        <input
                          type="radio"
                          name="shipping"
                          value="standard"
                          checked={shippingMethod === 'standard'}
                          onChange={(e) => setShippingMethod(e.target.value)}
                        />
                        <div className="option-content">
                          <span className="option-name">Standard Shipping</span>
                          <span className="option-details">3-5 business days</span>
                          <span className="option-price">$4.99</span>
                        </div>
                      </label>
                      <label className="shipping-option">
                        <input
                          type="radio"
                          name="shipping"
                          value="express"
                          checked={shippingMethod === 'express'}
                          onChange={(e) => setShippingMethod(e.target.value)}
                        />
                        <div className="option-content">
                          <span className="option-name">Express Shipping</span>
                          <span className="option-details">1-2 business days</span>
                          <span className="option-price">$9.99</span>
                        </div>
                      </label>
                      <label className="shipping-option free">
                        <input
                          type="radio"
                          name="shipping"
                          value="free"
                          checked={shippingMethod === 'free'}
                          onChange={(e) => setShippingMethod(e.target.value)}
                          disabled={subtotal < 100}
                        />
                        <div className="option-content">
                          <span className="option-name">Free Shipping</span>
                          <span className="option-details">5-7 business days</span>
                          <span className="option-price">Free</span>
                          {subtotal < 100 && (
                            <span className="option-note">Add ${(100 - subtotal).toFixed(2)} more for free shipping</span>
                          )}
                        </div>
                      </label>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className={`step ${activeAccordion === 'payment' ? 'active' : ''}`}>
              <div className="step-header" onClick={() => toggleAccordion('payment')}>
                <span className="step-number">4</span>
                <span className="step-title">Payment Method</span>
                <span className="step-toggle">{activeAccordion === 'payment' ? '−' : '+'}</span>
              </div>
              <AnimatePresence>
                {activeAccordion === 'payment' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="step-content"
                  >
                    <div className="payment-options">
                      <label className="payment-option">
                        <input
                          type="radio"
                          name="payment"
                          value="creditCard"
                          checked={paymentMethod === 'creditCard'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <span>Credit Card</span>
                      </label>
                      <label className="payment-option">
                        <input
                          type="radio"
                          name="payment"
                          value="paypal"
                          checked={paymentMethod === 'paypal'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <span>PayPal</span>
                      </label>
                      <label className="payment-option">
                        <input
                          type="radio"
                          name="payment"
                          value="applePay"
                          checked={paymentMethod === 'applePay'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <span>Apple Pay</span>
                      </label>
                    </div>

                    {paymentMethod === 'creditCard' && (
                      <div className="credit-card-form">
                        <div className="form-group">
                          <label>Card Number</label>
                          <input
                            type="text"
                            placeholder="1234 5678 9012 3456"
                            maxLength="19"
                          />
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Expiration Date</label>
                            <input
                              type="text"
                              placeholder="MM/YY"
                              maxLength="5"
                            />
                          </div>
                          <div className="form-group">
                            <label>Security Code</label>
                            <input
                              type="text"
                              placeholder="CVV"
                              maxLength="3"
                            />
                          </div>
                        </div>
                        <div className="form-group">
                          <label>Name on Card</label>
                          <input
                            type="text"
                            placeholder="Full name"
                          />
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'paypal' && (
                      <div className="paypal-info">
                        <p>You will be redirected to PayPal to complete your payment.</p>
                      </div>
                    )}

                    {paymentMethod === 'applePay' && (
                      <div className="apple-pay-info">
                        <p>Complete your purchase using Apple Pay for a faster checkout experience.</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="order-notes">
            <h3>Order Notes</h3>
            <textarea placeholder="Add special instructions for your order..."></textarea>
          </div>

          <div className="gift-options">
            <h3>Gift Options</h3>
            <div className="gift-checkbox">
              <input type="checkbox" id="giftWrapping" />
              <label htmlFor="giftWrapping">Add gift wrapping - $5.99</label>
            </div>
            <div className="gift-message">
              <label>Gift Message (optional)</label>
              <textarea placeholder="Add a personal message..."></textarea>
            </div>
          </div>
        </div>

        <div className="checkout-sidebar">
          <div className="order-summary">
            <h2>Order Summary</h2>
            
            <div className="cart-items">
              {cartItems.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="item-image">
                    <img src={item.image} alt={item.name} />
                    <span className="item-quantity">{item.quantity}</span>
                  </div>
                  <div className="item-details">
                    <h4>{item.name}</h4>
                    <p>{item.color} / {item.size}</p>
                    <div className="item-price">${item.price.toFixed(2)}</div>
                  </div>
                  <button 
                    className="remove-item"
                    onClick={() => removeItem(item.id)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="summary-details">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>${shippingCost.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              
              <div className="promo-section">
                <div className="promo-input">
                  <input
                    type="text"
                    placeholder="Gift card or discount code"
                    value={giftCardCode}
                    onChange={(e) => setGiftCardCode(e.target.value)}
                    disabled={isGiftCardApplied}
                  />
                  <button 
                    onClick={applyGiftCard}
                    disabled={isGiftCardApplied || giftCardCode.trim() === ''}
                  >
                    {isGiftCardApplied ? 'Applied' : 'Apply'}
                  </button>
                </div>
                
                <div className="promo-input">
                  <input
                    type="text"
                    placeholder="Promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    disabled={isPromoApplied}
                  />
                  <button 
                    onClick={applyPromoCode}
                    disabled={isPromoApplied || promoCode.trim() === ''}
                  >
                    {isPromoApplied ? 'Applied' : 'Apply'}
                  </button>
                </div>
              </div>

              <div className="summary-row total">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button 
              className="place-order-btn"
              onClick={handleSubmitOrder}
              disabled={isLoading || cartItems.length === 0}
            >
              {isLoading ? 'Processing...' : `Place Order - $${total.toFixed(2)}`}
            </button>

            <div className="security-notice">
              <p>🔒 Your payment information is secure and encrypted</p>
            </div>

            <div className="return-policy">
              <h3>Return Policy</h3>
              <p>Free returns within 30 days of delivery. Items must be unworn with original tags attached.</p>
            </div>

            <div className="customer-support">
              <h3>Need Help?</h3>
              <p>Contact our customer support team at support@infinitewavex.com or call +1 (555) 123-IWX</p>
            </div>
          </div>
        </div>
      </div>

      <div className="checkout-features">
        <h2>Why Shop With IWX?</h2>
        <div className="features-grid">
          <div className="feature">
            <div className="feature-icon">🚚</div>
            <h3>Free Shipping</h3>
            <p>On all orders over $100</p>
          </div>
          <div className="feature">
            <div className="feature-icon">↩️</div>
            <h3>Easy Returns</h3>
            <p>30-day return policy</p>
          </div>
          <div className="feature">
            <div className="feature-icon">🔒</div>
            <h3>Secure Payment</h3>
            <p>Your data is protected</p>
          </div>
          <div className="feature">
            <div className="feature-icon">💎</div>
            <h3>Quality Guarantee</h3>
            <p>Premium materials & craftsmanship</p>
          </div>
        </div>
      </div>

      <div className="recently-viewed-checkout">
        <h2>Complete Your Look</h2>
        <div className="viewed-products">
          <div className="viewed-product">
            <img src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1180&q=80" alt="Product" />
            <div>
              <p>Luxury Watch</p>
              <span>$249.99</span>
            </div>
          </div>
          <div className="viewed-product">
            <img src="https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80" alt="Product" />
            <div>
              <p>Silk Scarf</p>
              <span>$39.99</span>
            </div>
          </div>
          <div className="viewed-product">
            <img src="https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1160&q=80" alt="Product" />
            <div>
              <p>Casual Sneakers</p>
              <span>$89.99</span>
            </div>
          </div>
          <div className="viewed-product">
            <img src="https://images.unsplash.com/photo-1583744946564-b52ae1c3c559?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80" alt="Product" />
            <div>
              <p>Leather Tote</p>
              <span>$129.99</span>
            </div>
          </div>
          <div className="viewed-product">
            <img src="https://images.unsplash.com/photo-1556306535-0f09a537f0a3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80" alt="Product" />
            <div>
              <p>Winter Parka</p>
              <span>$199.99</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;