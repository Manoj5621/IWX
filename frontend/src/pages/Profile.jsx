import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { logout, updateUser } from '../redux/slices/authSlice';
import { authAPI } from '../api/authAPI';
import { orderAPI } from '../api/orderAPI';
import { addressAPI } from '../api/addressAPI';
import { paymentAPI } from '../api/paymentAPI';
import { wishlistAPI } from '../api/wishlistAPI';
import { notificationAPI } from '../api/notificationAPI';
import { securityAPI } from '../api/securityAPI';
import './Profile.css';

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState('profile');
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    birthDate: '',
    gender: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });
  const [preferences, setPreferences] = useState({
    emailNewsletter: true,
    smsNotifications: false,
    promotions: true,
    orderUpdates: true,
    stockAlerts: true
  });

  // Real data states
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notificationPreferences, setNotificationPreferences] = useState({
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
    order_updates: true,
    payment_updates: true,
    shipping_updates: true,
    promotional_emails: true,
    product_alerts: true,
    security_alerts: true,
    system_notifications: true
  });
  const [securitySettings, setSecuritySettings] = useState({});
  const [billingHistory, setBillingHistory] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);
  const [connectedDevices, setConnectedDevices] = useState([]);

  // Loading states for each section
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [loadingSecurity, setLoadingSecurity] = useState(false);


  useEffect(() => {
    if (user) {
      setUserData(user);
      setFormData({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        phone: user.phone || '',
        birthDate: user.birth_date || '',
        gender: user.gender || '',
        address: user.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        }
      });

      if (user.preferences) {
        setPreferences(user.preferences);
      }

      // Load real data for all sections
      loadOrders();
      loadAddresses();
      loadPaymentMethods();
      loadWishlist();
      loadNotifications();
      loadSecurityData();
    }
  }, [user]);

  // Data loading functions
  const loadOrders = async () => {
    try {
      setLoadingOrders(true);
      const response = await orderAPI.getOrders();
      setOrders(response.orders || []);
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const response = await addressAPI.getAddresses();
      setAddresses(response.addresses || []);
    } catch (err) {
      console.error('Error loading addresses:', err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const loadPaymentMethods = async () => {
    try {
      setLoadingPayments(true);
      const response = await paymentAPI.getPaymentMethods();
      setPaymentMethods(response.payments || []);
      setBillingHistory(response.billing_history || []);
    } catch (err) {
      console.error('Error loading payment methods:', err);
    } finally {
      setLoadingPayments(false);
    }
  };

  const loadWishlist = async () => {
    try {
      setLoadingWishlist(true);
      const response = await wishlistAPI.getWishlist();
      setWishlist(response.items || []);
    } catch (err) {
      console.error('Error loading wishlist:', err);
    } finally {
      setLoadingWishlist(false);
    }
  };

  const loadNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const [notificationsResponse, preferencesResponse] = await Promise.all([
        notificationAPI.getNotifications(),
        notificationAPI.getNotificationPreferences()
      ]);
      setNotifications(notificationsResponse.notifications || []);
      if (preferencesResponse) {
        setNotificationPreferences(preferencesResponse);
      }
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const loadSecurityData = async () => {
    try {
      setLoadingSecurity(true);
      const [settingsResponse, loginHistoryResponse, devicesResponse] = await Promise.all([
        securityAPI.getSecuritySettings(),
        securityAPI.getLoginHistory(),
        securityAPI.getConnectedDevices()
      ]);
      setSecuritySettings(settingsResponse);
      setLoginHistory(loginHistoryResponse);
      setConnectedDevices(devicesResponse);
    } catch (err) {
      console.error('Error loading security data:', err);
    } finally {
      setLoadingSecurity(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePreferenceChange = async (preference) => {
    const newPreferences = {
      ...preferences,
      [preference]: !preferences[preference]
    };
    setPreferences(newPreferences);

    try {
      const updatedUser = await authAPI.updateCurrentUser({ preferences: newPreferences });
      dispatch(updateUser(updatedUser));
    } catch (err) {
      console.error('Error updating preferences:', err);
      // Revert on error
      setPreferences(preferences);
      setError('Failed to update preferences. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleSave = async () => {
    try {
      setError('');
      setSuccess('');
      setLoading(true);

      const updateData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        birth_date: formData.birthDate,
        gender: formData.gender,
        address: formData.address,
        preferences: preferences
      };

      const updatedUser = await authAPI.updateCurrentUser(updateData);

      if (updatedUser) {
        dispatch(updateUser(updatedUser));
        setUserData(updatedUser);
        setSuccess('Profile updated successfully!');

        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    if (userData) {
      setFormData({
        firstName: userData.first_name || '',
        lastName: userData.last_name || '',
        phone: userData.phone || '',
        birthDate: userData.birth_date || '',
        gender: userData.gender || '',
        address: userData.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        }
      });
      setPreferences(userData.preferences || {
        emailNewsletter: true,
        smsNotifications: false,
        promotions: true,
        orderUpdates: true,
        stockAlerts: true
      });
    }
    setIsEditing(false);
    setError('');
  };

  // CRUD operation handlers
  const handleSetDefaultAddress = async (addressId) => {
    try {
      await addressAPI.setDefaultAddress(addressId);
      loadAddresses(); // Reload addresses
      setSuccess('Default address updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error setting default address:', err);
      setError('Failed to update default address. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      await addressAPI.deleteAddress(addressId);
      loadAddresses(); // Reload addresses
      setSuccess('Address deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting address:', err);
      setError('Failed to delete address. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleSetDefaultPayment = async (paymentId) => {
    try {
      await paymentAPI.setDefaultPaymentMethod(paymentId);
      loadPaymentMethods(); // Reload payment methods
      setSuccess('Default payment method updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error setting default payment:', err);
      setError('Failed to update default payment method. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeletePaymentMethod = async (paymentId) => {
    if (!confirm('Are you sure you want to delete this payment method?')) return;

    try {
      await paymentAPI.deletePaymentMethod(paymentId);
      loadPaymentMethods(); // Reload payment methods
      setSuccess('Payment method deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting payment method:', err);
      setError('Failed to delete payment method. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleRemoveFromWishlist = async (itemId) => {
    try {
      await wishlistAPI.removeFromWishlist(itemId);
      loadWishlist(); // Reload wishlist
      setSuccess('Item removed from wishlist!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      setError('Failed to remove item from wishlist. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleNotificationPreferenceChange = async (preferenceKey, value) => {
    try {
      const updatedPreferences = {
        ...notificationPreferences,
        [preferenceKey]: value
      };
      setNotificationPreferences(updatedPreferences);

      await notificationAPI.updateNotificationPreferences(updatedPreferences);
      setSuccess('Notification preferences updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating notification preferences:', err);
      // Revert on error
      setNotificationPreferences(notificationPreferences);
      setError('Failed to update notification preferences. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return '#4caf50';
      case 'processing': return '#ff9800';
      case 'shipped': return '#2196f3';
      case 'cancelled': return '#f44336';
      default: return '#666';
    }
  };

  const getInitials = () => {
    if (!userData) return 'U';
    return `${userData.first_name?.[0] || ''}${userData.last_name?.[0] || ''}`.toUpperCase() || 'U';
  };

  if (!userData) {
    return (
      <div className="profile-container">
        <div className="loading-spinner">Loading user data...</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Header */}
      <div className="profile-header">
        <h1>My Account</h1>
        <p>Manage your profile, orders, and preferences</p>
      </div>

      {/* Success/Error Messages */}
      {error && (
        <div className="error-message" style={{color: 'red', marginBottom: '20px', padding: '10px', background: '#ffe6e6', borderRadius: '4px'}}>
          {error}
        </div>
      )}
      {success && (
        <div className="success-message" style={{color: 'green', marginBottom: '20px', padding: '10px', background: '#e6ffe6', borderRadius: '4px'}}>
          {success}
        </div>
      )}

      <div className="profile-content">
        {/* Sidebar */}
        <div className="profile-sidebar">
          {/* User Summary */}
          <div className="user-summary">
            <div className="user-avatar">
              {getInitials()}
            </div>
            <h2>{userData ? `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'User' : 'User'}</h2>
            <p>{userData?.email || 'user@example.com'}</p>
            <p>Member since {userData ? new Date(userData.created_at).getFullYear() : '2024'}</p>
          </div>

          {/* Navigation */}
          <div className="profile-nav">
            {[
              { id: 'profile', label: 'Profile', icon: '👤' },
              { id: 'orders', label: 'Orders', icon: '📦' },
              { id: 'addresses', label: 'Addresses', icon: '🏠' },
              { id: 'payments', label: 'Payments', icon: '💳' },
              { id: 'wishlist', label: 'Wishlist', icon: '❤️' },
              { id: 'notifications', label: 'Notifications', icon: '🔔' },
              { id: 'security', label: 'Security', icon: '🔒' }
            ].map(item => (
              <button
                key={item.id}
                className={activeTab === item.id ? 'active' : ''}
                onClick={() => setActiveTab(item.id)}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
            <button
              className="logout-btn"
              onClick={() => dispatch(logout())}
              style={{ marginTop: '20px', backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer' }}
            >
              <span>🚪</span>
              Logout
            </button>
          </div>

          {/* Account Stats */}
          <div className="account-stats">
            <h3>Account Stats</h3>
            <div className="stat-item">
              <span className="stat-label">Orders</span>
              <span className="stat-value">{orders.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Wishlist</span>
              <span className="stat-value">{wishlist.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Addresses</span>
              <span className="stat-value">{addresses.length}</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="profile-main">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="tab-content">
                  <div className="tab-header">
                    <h2>Personal Information</h2>
                    {!isEditing ? (
                      <button className="edit-btn" onClick={() => setIsEditing(true)}>
                        Edit Profile
                      </button>
                    ) : (
                      <div>
                        <button className="cancel-btn" onClick={handleCancel}>
                          Cancel
                        </button>
                        <button className="save-btn" onClick={handleSave} disabled={loading}>
                          {loading ? 'Saving...' : 'Save Changes'}
                        </button>
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
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="form-group">
                        <label>Last Name</label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Email Address</label>
                        <input
                          type="email"
                          value={userData?.email || 'user@example.com'}
                          disabled
                          style={{background: '#f5f5f5', color: '#666'}}
                        />
                        <small style={{color: '#666', fontSize: '12px'}}>Email cannot be changed</small>
                      </div>
                      <div className="form-group">
                        <label>Phone Number</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Birth Date</label>
                        <input
                          type="date"
                          name="birthDate"
                          value={formData.birthDate}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="form-group">
                        <label>Gender</label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer-not-to-say">Prefer not to say</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <h3>Address Information</h3>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Street Address</label>
                        <input
                          type="text"
                          name="address.street"
                          value={formData.address.street}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>City</label>
                        <input
                          type="text"
                          name="address.city"
                          value={formData.address.city}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="form-group">
                        <label>State</label>
                        <input
                          type="text"
                          name="address.state"
                          value={formData.address.state}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="form-group">
                        <label>ZIP Code</label>
                        <input
                          type="text"
                          name="address.zipCode"
                          value={formData.address.zipCode}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Country</label>
                        <input
                          type="text"
                          name="address.country"
                          value={formData.address.country}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="preferences-section">
                    <h3>Communication Preferences</h3>
                    <p>Manage how we communicate with you</p>

                    <div className="preference-item">
                      <div>
                        <h4>Email Newsletter</h4>
                        <p>Receive updates about new products and promotions</p>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={preferences.emailNewsletter}
                          onChange={() => handlePreferenceChange('emailNewsletter')}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>

                    <div className="preference-item">
                      <div>
                        <h4>SMS Notifications</h4>
                        <p>Get order updates via text message</p>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={preferences.smsNotifications}
                          onChange={() => handlePreferenceChange('smsNotifications')}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>

                    <div className="preference-item">
                      <div>
                        <h4>Promotional Emails</h4>
                        <p>Receive special offers and discounts</p>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={preferences.promotions}
                          onChange={() => handlePreferenceChange('promotions')}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>

                    <div className="preference-item">
                      <div>
                        <h4>Order Updates</h4>
                        <p>Get notified about your order status</p>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={preferences.orderUpdates}
                          onChange={() => handlePreferenceChange('orderUpdates')}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>

                    <div className="preference-item">
                      <div>
                        <h4>Stock Alerts</h4>
                        <p>Get notified when out-of-stock items are available</p>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={preferences.stockAlerts}
                          onChange={() => handlePreferenceChange('stockAlerts')}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Other tabs remain the same... */}
              {activeTab === 'orders' && (
                <div className="tab-content">
                  <div className="tab-header">
                    <h2>Order History</h2>
                  </div>
                  <div className="orders-list">
                    {loadingOrders ? (
                      <div className="loading-spinner">Loading orders...</div>
                    ) : orders.length === 0 ? (
                      <div className="empty-state">
                        <p>No orders found. Start shopping to see your order history!</p>
                      </div>
                    ) : (
                      orders.map(order => (
                        <div key={order.id} className="order-card">
                          <div className="order-header">
                            <div>
                              <h3>Order #{order.order_number}</h3>
                              <p>Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                            </div>
                            <span
                              className="status-badge"
                              style={{backgroundColor: getStatusColor(order.status)}}
                            >
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                          <div className="order-details">
                            <div className="order-info">
                              <div className="info-item">
                                <span className="label">Items</span>
                                <span className="value">{order.items.length}</span>
                              </div>
                              <div className="info-item">
                                <span className="label">Total</span>
                                <span className="value">${order.total_amount}</span>
                              </div>
                              <div className="info-item">
                                <span className="label">Tracking</span>
                                <span className="value">{order.tracking_number || 'Not available'}</span>
                              </div>
                            </div>
                            <div className="order-actions">
                              <button className="action-btn">View Details</button>
                              <button className="action-btn">Track Order</button>
                              <button className="action-btn">Reorder</button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="returns-section">
                    <h3>Returns & Refunds</h3>
                    <p>Manage your returns and refund requests</p>
                    <div className="returns-info">
                      <div className="returns-card">
                        <h4>Easy Returns</h4>
                        <p>30-day return policy for all items</p>
                      </div>
                      <div className="returns-card">
                        <h4>Free Shipping</h4>
                        <p>Free return shipping on all orders</p>
                      </div>
                      <div className="returns-card">
                        <h4>Quick Refunds</h4>
                        <p>Refunds processed within 3-5 business days</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Addresses Tab */}
              {activeTab === 'addresses' && (
                <div className="tab-content">
                  <div className="tab-header">
                    <h2>Saved Addresses</h2>
                    <button className="add-address-btn">Add New Address</button>
                  </div>

                  <div className="addresses-grid">
                    {loadingAddresses ? (
                      <div className="loading-spinner">Loading addresses...</div>
                    ) : addresses.length === 0 ? (
                      <div className="empty-state">
                        <p>No addresses saved. Add your first address to make checkout faster!</p>
                        <button className="add-address-btn">Add New Address</button>
                      </div>
                    ) : (
                      addresses.map(address => (
                        <div key={address.id} className="address-card">
                          <div className="address-header">
                            <h3>{address.name}</h3>
                            {address.is_default && <span className="default-badge">Default</span>}
                          </div>
                          <div className="address-details">
                            <p>{address.street_address}</p>
                            <p>{address.city}, {address.state} {address.postal_code}</p>
                            <p>{address.country}</p>
                          </div>
                          <div className="address-actions">
                            {!address.is_default && (
                              <button
                                className="set-default-btn"
                                onClick={() => handleSetDefaultAddress(address.id)}
                              >
                                Set as Default
                              </button>
                            )}
                            <button
                              className="remove-btn"
                              onClick={() => handleDeleteAddress(address.id)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="shipping-info">
                    <h3>Shipping Options</h3>
                    <p>Available shipping methods for your location</p>
                    <div className="shipping-options">
                      <div className="shipping-option">
                        <h4>Standard Shipping</h4>
                        <p>5-7 business days • Free</p>
                      </div>
                      <div className="shipping-option">
                        <h4>Express Shipping</h4>
                        <p>2-3 business days • $9.99</p>
                      </div>
                      <div className="shipping-option">
                        <h4>Next Day Delivery</h4>
                        <p>1 business day • $19.99</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Payments Tab */}
              {activeTab === 'payments' && (
                <div className="tab-content">
                  <div className="tab-header">
                    <h2>Payment Methods</h2>
                    <button className="add-payment-btn">Add Payment Method</button>
                  </div>

                  <div className="payment-methods-list">
                    {loadingPayments ? (
                      <div className="loading-spinner">Loading payment methods...</div>
                    ) : paymentMethods.length === 0 ? (
                      <div className="empty-state">
                        <p>No payment methods saved. Add a payment method for faster checkout!</p>
                        <button className="add-payment-btn">Add Payment Method</button>
                      </div>
                    ) : (
                      paymentMethods.map(payment => (
                        <div key={payment.id} className="payment-card">
                          <div className="payment-header">
                            <div className="payment-type">
                              <div className="card-icon">💳</div>
                              <div>
                                <h3>{payment.display_name}</h3>
                                {payment.credit_card && (
                                  <p>Expires {payment.credit_card.expiry_month}/{payment.credit_card.expiry_year}</p>
                                )}
                              </div>
                            </div>
                            <div className="payment-actions">
                              <button className="action-btn">Edit</button>
                              {!payment.is_default && (
                                <button
                                  className="set-default-btn"
                                  onClick={() => handleSetDefaultPayment(payment.id)}
                                >
                                  Set Default
                                </button>
                              )}
                              <button
                                className="remove-btn"
                                onClick={() => handleDeletePaymentMethod(payment.id)}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="billing-history">
                    <h3>Billing History</h3>
                    <div className="billing-table">
                      <div className="billing-header">
                        <div>Date</div>
                        <div>Description</div>
                        <div>Amount</div>
                        <div>Status</div>
                      </div>
                      <div className="billing-row">
                        <div>Jan 15, 2024</div>
                        <div>Order #ORD-001</div>
                        <div>$149.99</div>
                        <div className="paid">Paid</div>
                      </div>
                      <div className="billing-row">
                        <div>Jan 10, 2024</div>
                        <div>Order #ORD-002</div>
                        <div>$79.99</div>
                        <div className="pending">Pending</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Wishlist Tab */}
              {activeTab === 'wishlist' && (
                <div className="tab-content">
                  <div className="tab-header">
                    <h2>My Wishlist</h2>
                  </div>

                  <div className="wishlist-grid">
                    {loadingWishlist ? (
                      <div className="loading-spinner">Loading wishlist...</div>
                    ) : wishlist.length === 0 ? (
                      <div className="empty-state">
                        <p>Your wishlist is empty. Start browsing and save items you love!</p>
                      </div>
                    ) : (
                      wishlist.map(item => (
                        <div key={item.id} className="wishlist-item">
                          <div className="wishlist-image">
                            <img src={item.product?.images?.[0] || '/api/placeholder/300/300'} alt={item.product?.name || 'Product'} />
                            {item.product && item.product.inventory_quantity === 0 && <div className="out-of-stock">Out of Stock</div>}
                            <button
                              className="wishlist-remove"
                              onClick={() => handleRemoveFromWishlist(item.id)}
                            >
                              ×
                            </button>
                          </div>
                          <div className="wishlist-details">
                            <h3>{item.product?.name || 'Product'}</h3>
                            <div className="wishlist-price">${item.product?.price || 'N/A'}</div>
                            <div className="wishlist-size">Size: {item.size || 'N/A'}</div>
                            <div className="wishlist-actions">
                              {item.product && item.product.inventory_quantity > 0 ? (
                                <button className="add-to-cart-btn">Add to Cart</button>
                              ) : (
                                <button className="notify-btn">Notify When Available</button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="wishlist-recommendations">
                    <h3>You Might Also Like</h3>
                    <div className="recommendations-grid">
                      <div className="recommendation-item">
                        <img src="/api/placeholder/200/200" alt="Product" />
                        <h4>Wireless Earbuds</h4>
                        <p>$129.99</p>
                      </div>
                      <div className="recommendation-item">
                        <img src="/api/placeholder/200/200" alt="Product" />
                        <h4>Phone Case</h4>
                        <p>$24.99</p>
                      </div>
                      <div className="recommendation-item">
                        <img src="/api/placeholder/200/200" alt="Product" />
                        <h4>Charging Cable</h4>
                        <p>$19.99</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="tab-content">
                  <div className="tab-header">
                    <h2>Notification Settings</h2>
                  </div>

                  <div className="notifications-settings">
                    <div className="notification-category">
                      <h3>Email Notifications</h3>
                      <div className="notification-item">
                        <div>
                          <h4>Order Updates</h4>
                          <p>Get notified about your order status</p>
                        </div>
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={notificationPreferences.order_updates || false}
                            onChange={(e) => handleNotificationPreferenceChange('order_updates', e.target.checked)}
                          />
                          <span className="slider"></span>
                        </label>
                      </div>
                      <div className="notification-item">
                        <div>
                          <h4>Promotional Emails</h4>
                          <p>Receive special offers and discounts</p>
                        </div>
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={notificationPreferences.promotional_emails || false}
                            onChange={(e) => handleNotificationPreferenceChange('promotional_emails', e.target.checked)}
                          />
                          <span className="slider"></span>
                        </label>
                      </div>
                      <div className="notification-item">
                        <div>
                          <h4>Payment Updates</h4>
                          <p>Get notified about payment status</p>
                        </div>
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={notificationPreferences.payment_updates || false}
                            onChange={(e) => handleNotificationPreferenceChange('payment_updates', e.target.checked)}
                          />
                          <span className="slider"></span>
                        </label>
                      </div>
                      <div className="notification-item">
                        <div>
                          <h4>Shipping Updates</h4>
                          <p>Get notified about shipping status</p>
                        </div>
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={notificationPreferences.shipping_updates || false}
                            onChange={(e) => handleNotificationPreferenceChange('shipping_updates', e.target.checked)}
                          />
                          <span className="slider"></span>
                        </label>
                      </div>
                    </div>

                    <div className="notification-category">
                      <h3>Push Notifications</h3>
                      <div className="notification-item">
                        <div>
                          <h4>Order Alerts</h4>
                          <p>Get push notifications for order updates</p>
                        </div>
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={notificationPreferences.push_notifications || false}
                            onChange={(e) => handleNotificationPreferenceChange('push_notifications', e.target.checked)}
                          />
                          <span className="slider"></span>
                        </label>
                      </div>
                      <div className="notification-item">
                        <div>
                          <h4>Product Alerts</h4>
                          <p>Notify me about product updates and restocks</p>
                        </div>
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={notificationPreferences.product_alerts || false}
                            onChange={(e) => handleNotificationPreferenceChange('product_alerts', e.target.checked)}
                          />
                          <span className="slider"></span>
                        </label>
                      </div>
                      <div className="notification-item">
                        <div>
                          <h4>Security Alerts</h4>
                          <p>Get notified about account security events</p>
                        </div>
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={notificationPreferences.security_alerts || false}
                            onChange={(e) => handleNotificationPreferenceChange('security_alerts', e.target.checked)}
                          />
                          <span className="slider"></span>
                        </label>
                      </div>
                    </div>

                    <div className="notification-category">
                      <h3>SMS Notifications</h3>
                      <div className="notification-item">
                        <div>
                          <h4>SMS Updates</h4>
                          <p>Receive important updates via SMS</p>
                        </div>
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={notificationPreferences.sms_notifications || false}
                            onChange={(e) => handleNotificationPreferenceChange('sms_notifications', e.target.checked)}
                          />
                          <span className="slider"></span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="tab-content">
                  <div className="tab-header">
                    <h2>Security Settings</h2>
                  </div>

                  <div className="security-settings">
                    <div className="security-item">
                      <div>
                        <h3>Password</h3>
                        <p>Last changed 2 months ago</p>
                      </div>
                      <button className="change-password-btn">Change Password</button>
                    </div>
                    <div className="security-item">
                      <div>
                        <h3>Two-Factor Authentication</h3>
                        <p>Add an extra layer of security to your account</p>
                      </div>
                      <button className="change-password-btn">Enable 2FA</button>
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
                        <h4>Data Export</h4>
                        <p>Download a copy of your personal data</p>
                      </div>
                      <button className="download-data-btn">Download Data</button>
                    </div>
                    <div className="privacy-item">
                      <div>
                        <h4>Account Deactivation</h4>
                        <p>Temporarily disable your account</p>
                      </div>
                      <button className="deactivate-btn">Deactivate Account</button>
                    </div>
                    <div className="privacy-item">
                      <div>
                        <h4>Account Deletion</h4>
                        <p>Permanently delete your account and all data</p>
                      </div>
                      <button className="delete-account-btn">Delete Account</button>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Profile;