// Profile.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './Profile.css';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [editMode, setEditMode] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    promotions: true,
    orderUpdates: true,
    stockAlerts: true
  });

  // User data (would typically come from an API)
  const [userData, setUserData] = useState({
    firstName: 'Alex',
    lastName: 'Johnson',
    email: 'alex.johnson@example.com',
    phone: '+1 (555) 123-4567',
    birthDate: '1990-05-15',
    gender: 'female',
    addresses: [
      {
        id: 1,
        name: 'Home',
        street: '123 Fashion Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'United States',
        isDefault: true
      },
      {
        id: 2,
        name: 'Work',
        street: '456 Design Avenue',
        city: 'New York',
        state: 'NY',
        zipCode: '10002',
        country: 'United States',
        isDefault: false
      }
    ],
    paymentMethods: [
      {
        id: 1,
        type: 'creditCard',
        lastFour: '1234',
        expiry: '12/25',
        cardName: 'Visa',
        isDefault: true
      },
      {
        id: 2,
        type: 'paypal',
        email: 'alex.johnson@example.com',
        isDefault: false
      }
    ],
    orders: [
      {
        id: 'IWX123456',
        date: '2025-05-10',
        status: 'delivered',
        items: 3,
        total: 247.50,
        trackingNumber: 'TRK78901234'
      },
      {
        id: 'IWX123455',
        date: '2025-04-28',
        status: 'shipped',
        items: 2,
        total: 149.99,
        trackingNumber: 'TRK56789012'
      },
      {
        id: 'IWX123454',
        date: '2025-04-15',
        status: 'processing',
        items: 1,
        total: 89.99,
        trackingNumber: null
      },
      {
        id: 'IWX123453',
        date: '2025-03-22',
        status: 'delivered',
        items: 4,
        total: 325.75,
        trackingNumber: 'TRK12345678'
      },
      {
        id: 'IWX123452',
        date: '2025-02-10',
        status: 'delivered',
        items: 2,
        total: 159.98,
        trackingNumber: 'TRK34567890'
      }
    ],
    wishlist: [
      {
        id: 1,
        name: 'Premium Leather Jacket',
        price: 199.99,
        image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80',
        size: 'M',
        inStock: true
      },
      {
        id: 2,
        name: 'Designer Silk Dress',
        price: 149.99,
        image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
        size: 'S',
        inStock: true
      },
      {
        id: 3,
        name: 'Limited Edition Sneakers',
        price: 129.99,
        image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1160&q=80',
        size: 'US 8',
        inStock: false
      }
    ]
  });

  const [formData, setFormData] = useState({ ...userData });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSave = () => {
    setUserData({ ...formData });
    setEditMode(false);
  };

  const handleNotificationToggle = (type) => {
    setNotifications({
      ...notifications,
      [type]: !notifications[type]
    });
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'delivered': return '#4caf50';
      case 'shipped': return '#2196f3';
      case 'processing': return '#ff9800';
      case 'cancelled': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const addNewAddress = () => {
    const newAddress = {
      id: Date.now(),
      name: 'New Address',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      isDefault: false
    };
    setFormData({
      ...formData,
      addresses: [...formData.addresses, newAddress]
    });
  };

  const setDefaultAddress = (id) => {
    const updatedAddresses = formData.addresses.map(address => ({
      ...address,
      isDefault: address.id === id
    }));
    setFormData({
      ...formData,
      addresses: updatedAddresses
    });
  };

  const removeAddress = (id) => {
    const updatedAddresses = formData.addresses.filter(address => address.id !== id);
    setFormData({
      ...formData,
      addresses: updatedAddresses
    });
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Account</h1>
        <p>Welcome back, {userData.firstName}</p>
      </div>

      <div className="profile-content">
        <div className="profile-sidebar">
          <div className="user-summary">
            <div className="user-avatar">
              {userData.firstName.charAt(0)}{userData.lastName.charAt(0)}
            </div>
            <h2>{userData.firstName} {userData.lastName}</h2>
            <p>{userData.email}</p>
            <p>Member since January 2023</p>
          </div>

          <nav className="profile-nav">
            <button 
              className={activeTab === 'profile' ? 'active' : ''}
              onClick={() => setActiveTab('profile')}
            >
              <span>👤</span> Personal Information
            </button>
            <button 
              className={activeTab === 'orders' ? 'active' : ''}
              onClick={() => setActiveTab('orders')}
            >
              <span>📦</span> Orders & Returns
            </button>
            <button 
              className={activeTab === 'addresses' ? 'active' : ''}
              onClick={() => setActiveTab('addresses')}
            >
              <span>🏠</span> Addresses
            </button>
            <button 
              className={activeTab === 'payment' ? 'active' : ''}
              onClick={() => setActiveTab('payment')}
            >
              <span>💳</span> Payment Methods
            </button>
            <button 
              className={activeTab === 'wishlist' ? 'active' : ''}
              onClick={() => setActiveTab('wishlist')}
            >
              <span>❤️</span> Wishlist
            </button>
            <button 
              className={activeTab === 'notifications' ? 'active' : ''}
              onClick={() => setActiveTab('notifications')}
            >
              <span>🔔</span> Notifications
            </button>
            <button 
              className={activeTab === 'security' ? 'active' : ''}
              onClick={() => setActiveTab('security')}
            >
              <span>🔒</span> Security
            </button>
          </nav>

          <div className="account-stats">
            <h3>Account Summary</h3>
            <div className="stat-item">
              <span className="stat-value">{userData.orders.length}</span>
              <span className="stat-label">Orders</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{userData.wishlist.length}</span>
              <span className="stat-label">Wishlist Items</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">2</span>
              <span className="stat-label">Addresses</span>
            </div>
          </div>
        </div>

        <div className="profile-main">
          {/* Personal Information Tab */}
          {activeTab === 'profile' && (
            <motion.div 
              className="tab-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="tab-header">
                <h2>Personal Information</h2>
                {!editMode ? (
                  <button className="edit-btn" onClick={() => setEditMode(true)}>Edit</button>
                ) : (
                  <div>
                    <button className="cancel-btn" onClick={() => { setEditMode(false); setFormData({ ...userData }); }}>Cancel</button>
                    <button className="save-btn" onClick={handleSave}>Save Changes</button>
                  </div>
                )}
              </div>

              <div className="form-section">
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input 
                      type="text" 
                      name="firstName"
                      value={formData.firstName} 
                      onChange={handleInputChange}
                      disabled={!editMode}
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input 
                      type="text" 
                      name="lastName"
                      value={formData.lastName} 
                      onChange={handleInputChange}
                      disabled={!editMode}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email} 
                      onChange={handleInputChange}
                      disabled={!editMode}
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone} 
                      onChange={handleInputChange}
                      disabled={!editMode}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Date of Birth</label>
                    <input 
                      type="date" 
                      name="birthDate"
                      value={formData.birthDate} 
                      onChange={handleInputChange}
                      disabled={!editMode}
                    />
                  </div>
                  <div className="form-group">
                    <label>Gender</label>
                    <select 
                      name="gender"
                      value={formData.gender} 
                      onChange={handleInputChange}
                      disabled={!editMode}
                    >
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="preferences-section">
                <h3>Communication Preferences</h3>
                <p>Manage how we contact you and what information you receive</p>
                <div className="preference-item">
                  <div>
                    <h4>Email Newsletter</h4>
                    <p>Receive updates about new products, promotions and exclusive offers</p>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={notifications.email}
                      onChange={() => handleNotificationToggle('email')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="preference-item">
                  <div>
                    <h4>SMS Notifications</h4>
                    <p>Get order updates and promotional messages via text</p>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={notifications.sms}
                      onChange={() => handleNotificationToggle('sms')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </motion.div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <motion.div 
              className="tab-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="tab-header">
                <h2>Order History</h2>
                <p>You have {userData.orders.length} orders</p>
              </div>

              <div className="orders-list">
                {userData.orders.map(order => (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <div>
                        <h3>Order #{order.id}</h3>
                        <p>Placed on {formatDate(order.date)}</p>
                      </div>
                      <div className="order-status">
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getOrderStatusColor(order.status) }}
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div className="order-details">
                      <div className="order-info">
                        <div className="info-item">
                          <span className="label">Items:</span>
                          <span className="value">{order.items}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">Total:</span>
                          <span className="value">${order.total.toFixed(2)}</span>
                        </div>
                        {order.trackingNumber && (
                          <div className="info-item">
                            <span className="label">Tracking:</span>
                            <span className="value">{order.trackingNumber}</span>
                          </div>
                        )}
                      </div>

                      <div className="order-actions">
                        <button className="action-btn">View Details</button>
                        <button className="action-btn">Reorder</button>
                        {order.status === 'delivered' && (
                          <button className="action-btn">Return Items</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="returns-section">
                <h3>Returns & Exchanges</h3>
                <p>Need to return an item? We make it easy.</p>
                <div className="returns-info">
                  <div className="returns-card">
                    <h4>30-Day Return Policy</h4>
                    <p>Return any item within 30 days of delivery for a full refund or exchange.</p>
                  </div>
                  <div className="returns-card">
                    <h4>Free Returns</h4>
                    <p>We provide free return shipping for all orders.</p>
                  </div>
                  <div className="returns-card">
                    <h4>Easy Process</h4>
                    <p>Initiate returns directly from your order history.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <motion.div 
              className="tab-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="tab-header">
                <h2>Saved Addresses</h2>
                <button className="add-address-btn" onClick={addNewAddress}>+ Add New Address</button>
              </div>

              <div className="addresses-grid">
                {formData.addresses.map(address => (
                  <div key={address.id} className="address-card">
                    <div className="address-header">
                      <h3>{address.name}</h3>
                      {address.isDefault && <span className="default-badge">Default</span>}
                    </div>
                    <div className="address-details">
                      <p>{address.street}</p>
                      <p>{address.city}, {address.state} {address.zipCode}</p>
                      <p>{address.country}</p>
                    </div>
                    <div className="address-actions">
                      {!address.isDefault && (
                        <button 
                          className="set-default-btn"
                          onClick={() => setDefaultAddress(address.id)}
                        >
                          Set as Default
                        </button>
                      )}
                      <button className="edit-btn">Edit</button>
                      {!address.isDefault && (
                        <button 
                          className="remove-btn"
                          onClick={() => removeAddress(address.id)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="shipping-info">
                <h3>Shipping Information</h3>
                <p>We ship to most countries worldwide. Standard shipping takes 3-5 business days, express shipping is available for an additional fee.</p>
                <div className="shipping-options">
                  <div className="shipping-option">
                    <h4>Standard Shipping</h4>
                    <p>$4.99 • 3-5 business days</p>
                  </div>
                  <div className="shipping-option">
                    <h4>Express Shipping</h4>
                    <p>$9.99 • 1-2 business days</p>
                  </div>
                  <div className="shipping-option">
                    <h4>Free Shipping</h4>
                    <p>Free on orders over $100</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Payment Methods Tab */}
          {activeTab === 'payment' && (
            <motion.div 
              className="tab-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="tab-header">
                <h2>Payment Methods</h2>
                <button className="add-payment-btn">+ Add Payment Method</button>
              </div>

              <div className="payment-methods-list">
                {userData.paymentMethods.map(payment => (
                  <div key={payment.id} className="payment-card">
                    <div className="payment-header">
                      <div className="payment-type">
                        {payment.type === 'creditCard' ? (
                          <>
                            <div className="card-icon">💳</div>
                            <div>
                              <h3>{payment.cardName} ending in {payment.lastFour}</h3>
                              <p>Expires {payment.expiry}</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="card-icon">📱</div>
                            <div>
                              <h3>PayPal</h3>
                              <p>Connected as {payment.email}</p>
                            </div>
                          </>
                        )}
                      </div>
                      {payment.isDefault && <span className="default-badge">Default</span>}
                    </div>
                    <div className="payment-actions">
                      {!payment.isDefault && (
                        <button className="set-default-btn">Set as Default</button>
                      )}
                      <button className="edit-btn">Edit</button>
                      {!payment.isDefault && (
                        <button className="remove-btn">Remove</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="billing-history">
                <h3>Billing History</h3>
                <div className="billing-table">
                  <div className="billing-header">
                    <span>Date</span>
                    <span>Description</span>
                    <span>Amount</span>
                    <span>Status</span>
                  </div>
                  <div className="billing-row">
                    <span>May 10, 2025</span>
                    <span>Order IWX123456</span>
                    <span>$247.50</span>
                    <span className="paid">Paid</span>
                  </div>
                  <div className="billing-row">
                    <span>Apr 28, 2025</span>
                    <span>Order IWX123455</span>
                    <span>$149.99</span>
                    <span className="paid">Paid</span>
                  </div>
                  <div className="billing-row">
                    <span>Apr 15, 2025</span>
                    <span>Order IWX123454</span>
                    <span>$89.99</span>
                    <span className="pending">Pending</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Wishlist Tab */}
          {activeTab === 'wishlist' && (
            <motion.div 
              className="tab-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="tab-header">
                <h2>Your Wishlist</h2>
                <p>{userData.wishlist.length} items</p>
              </div>

              <div className="wishlist-grid">
                {userData.wishlist.map(item => (
                  <div key={item.id} className="wishlist-item">
                    <div className="wishlist-image">
                      <img src={item.image} alt={item.name} />
                      {!item.inStock && <div className="out-of-stock">Out of Stock</div>}
                      <button className="wishlist-remove">×</button>
                    </div>
                    <div className="wishlist-details">
                      <h3>{item.name}</h3>
                      <p className="wishlist-price">${item.price.toFixed(2)}</p>
                      <p className="wishlist-size">Size: {item.size}</p>
                      <div className="wishlist-actions">
                        {item.inStock ? (
                          <button className="add-to-cart-btn">Add to Cart</button>
                        ) : (
                          <button className="notify-btn">Notify When Available</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="wishlist-recommendations">
                <h3>You Might Also Like</h3>
                <div className="recommendations-grid">
                  <div className="recommendation-item">
                    <img src="https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1036&q=80" alt="Recommended" />
                    <h4>Elegant Heels</h4>
                    <p>$79.99</p>
                  </div>
                  <div className="recommendation-item">
                    <img src="https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80" alt="Recommended" />
                    <h4>Slim Fit Jeans</h4>
                    <p>$49.99</p>
                  </div>
                  <div className="recommendation-item">
                    <img src="https://images.unsplash.com/photo-1583744946564-b52ae1c3c559?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80" alt="Recommended" />
                    <h4>Leather Tote Bag</h4>
                    <p>$59.99</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <motion.div 
              className="tab-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="tab-header">
                <h2>Notification Preferences</h2>
                <p>Manage how we contact you and what information you receive</p>
              </div>

              <div className="notifications-settings">
                <div className="notification-category">
                  <h3>Email Notifications</h3>
                  <div className="notification-item">
                    <div>
                      <h4>Promotional Emails</h4>
                      <p>Receive updates about new products, promotions and exclusive offers</p>
                    </div>
                    <label className="switch">
                      <input 
                        type="checkbox" 
                        checked={notifications.promotions}
                        onChange={() => handleNotificationToggle('promotions')}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="notification-item">
                    <div>
                      <h4>Order Updates</h4>
                      <p>Get important information about your orders</p>
                    </div>
                    <label className="switch">
                      <input 
                        type="checkbox" 
                        checked={notifications.orderUpdates}
                        onChange={() => handleNotificationToggle('orderUpdates')}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="notification-item">
                    <div>
                      <h4>Stock Alerts</h4>
                      <p>Be notified when wishlist items are back in stock</p>
                    </div>
                    <label className="switch">
                      <input 
                        type="checkbox" 
                        checked={notifications.stockAlerts}
                        onChange={() => handleNotificationToggle('stockAlerts')}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>

                <div className="notification-category">
                  <h3>Push Notifications</h3>
                  <div className="notification-item">
                    <div>
                      <h4>Order Updates</h4>
                      <p>Get notified about your order status</p>
                    </div>
                    <label className="switch">
                      <input type="checkbox" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="notification-item">
                    <div>
                      <h4>Promotions</h4>
                      <p>Receive alerts about sales and special offers</p>
                    </div>
                    <label className="switch">
                      <input type="checkbox" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>

                <div className="notification-category">
                  <h3>SMS Notifications</h3>
                  <div className="notification-item">
                    <div>
                      <h4>Order Updates</h4>
                      <p>Get order updates via text message</p>
                    </div>
                    <label className="switch">
                      <input 
                        type="checkbox" 
                        checked={notifications.sms}
                        onChange={() => handleNotificationToggle('sms')}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="notification-item">
                    <div>
                      <h4>Promotional Messages</h4>
                      <p>Receive offers and updates via text message</p>
                    </div>
                    <label className="switch">
                      <input type="checkbox" />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <motion.div 
              className="tab-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="tab-header">
                <h2>Security Settings</h2>
                <p>Manage your account security and privacy</p>
              </div>

              <div className="security-settings">
                <div className="security-item">
                  <div>
                    <h3>Change Password</h3>
                    <p>Last changed 3 months ago</p>
                  </div>
                  <button className="change-password-btn">Change Password</button>
                </div>

                <div className="security-item">
                  <div>
                    <h3>Two-Factor Authentication</h3>
                    <p>Add an extra layer of security to your account</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="security-item">
                  <div>
                    <h3>Login Activity</h3>
                    <p>Review your recent account activity</p>
                  </div>
                  <button className="view-activity-btn">View Activity</button>
                </div>

                <div className="security-item">
                  <div>
                    <h3>Connected Devices</h3>
                    <p>Manage devices that have access to your account</p>
                  </div>
                  <button className="manage-devices-btn">Manage Devices</button>
                </div>
              </div>

              <div className="privacy-settings">
                <h3>Privacy Settings</h3>
                <div className="privacy-item">
                  <div>
                    <h4>Data Sharing</h4>
                    <p>Allow us to use your data to improve your shopping experience</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="privacy-item">
                  <div>
                    <h4>Personalized Ads</h4>
                    <p>See ads that are more relevant to your interests</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>

              <div className="account-actions">
                <h3>Account Actions</h3>
                <button className="download-data-btn">Download Your Data</button>
                <button className="deactivate-btn">Deactivate Account</button>
                <button className="delete-account-btn">Delete Account</button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;