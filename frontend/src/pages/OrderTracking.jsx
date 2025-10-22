import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import Navbar from '../components/Navbar/Navbar';
import { orderAPI } from '../api/orderAPI';
import { productAPI } from '../api/productAPI';
import './OrderTracking.css';

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [productImages, setProductImages] = useState({});

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('Order ID is required');
        setLoading(false);
        return;
      }

      try {
        const orderData = await orderAPI.getOrderById(orderId);
        setOrder(orderData);

        // Fetch product images for order items
        if (orderData.items && orderData.items.length > 0) {
          const images = {};
          for (const item of orderData.items) {
            const productId = item.product_id || item.id;
            if (productId && !images[productId]) {
              try {
                const productData = await productAPI.getProduct(productId);
                if (productData.images && productData.images.length > 0) {
                  images[productId] = productData.images[0];
                }
              } catch (err) {
                console.warn(`Failed to fetch image for product ${productId}:`, err);
              }
            }
          }
          setProductImages(images);
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffa500',
      confirmed: '#007bff',
      processing: '#17a2b8',
      shipped: '#28a745',
      delivered: '#20c997',
      cancelled: '#dc3545',
      refunded: '#6c757d'
    };
    return colors[status] || '#6c757d';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      confirmed: '✅',
      processing: '⚙️',
      shipped: '🚚',
      delivered: '📦',
      cancelled: '❌',
      refunded: '💰'
    };
    return icons[status] || '📋';
  };

  const getStatusProgress = (status) => {
    const progress = {
      pending: 20,
      confirmed: 40,
      processing: 60,
      shipped: 80,
      delivered: 100,
      cancelled: 0,
      refunded: 100
    };
    return progress[status] || 0;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="order-tracking-container">
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-tracking-container">
        <Navbar />
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Order Not Found</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/profile')} className="back-button">
            Back to Profile
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-tracking-container">
        <Navbar />
        <div className="error-container">
          <div className="error-icon">📦</div>
          <h2>Order Not Found</h2>
          <p>The order you're looking for doesn't exist or you don't have permission to view it.</p>
          <button onClick={() => navigate('/profile')} className="back-button">
            Back to Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-tracking-container">
      <Navbar />

      <div className="order-tracking-header">
        <div className="container">
          <div className="order-header-content">
            <div className="order-title">
              <h1>Order #{order.order_number}</h1>
              <div className="order-status-badge" style={{ backgroundColor: getStatusColor(order.status) }}>
                {getStatusIcon(order.status)} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </div>
            </div>
            <div className="order-meta">
              <div className="meta-item">
                <span className="meta-label">Order Date:</span>
                <span className="meta-value">{formatDate(order.created_at)}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Total:</span>
                <span className="meta-value total-amount">{formatCurrency(order.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="order-tracking-content">
        <div className="container">
          <div className="tracking-tabs">
            <button
              className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`tab-button ${activeTab === 'items' ? 'active' : ''}`}
              onClick={() => setActiveTab('items')}
            >
              Order Items
            </button>
            <button
              className={`tab-button ${activeTab === 'shipping' ? 'active' : ''}`}
              onClick={() => setActiveTab('shipping')}
            >
              Shipping & Delivery
            </button>
            <button
              className={`tab-button ${activeTab === 'payment' ? 'active' : ''}`}
              onClick={() => setActiveTab('payment')}
            >
              Payment Details
            </button>
            <button
              className={`tab-button ${activeTab === 'timeline' ? 'active' : ''}`}
              onClick={() => setActiveTab('timeline')}
            >
              Order Timeline
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="tab-content"
              >
                <div className="overview-grid">
                  <div className="overview-card progress-card">
                    <h3>Order Progress</h3>
                    <div className="progress-container">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${getStatusProgress(order.status)}%`,
                            backgroundColor: getStatusColor(order.status)
                          }}
                        ></div>
                      </div>
                      <div className="progress-steps">
                        <div className={`step ${['pending', 'confirmed', 'processing', 'shipped', 'delivered'].includes(order.status) ? 'completed' : ''}`}>
                          <div className="step-icon">📋</div>
                          <span>Ordered</span>
                        </div>
                        <div className={`step ${['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status) ? 'completed' : ''}`}>
                          <div className="step-icon">✅</div>
                          <span>Confirmed</span>
                        </div>
                        <div className={`step ${['processing', 'shipped', 'delivered'].includes(order.status) ? 'completed' : ''}`}>
                          <div className="step-icon">⚙️</div>
                          <span>Processing</span>
                        </div>
                        <div className={`step ${['shipped', 'delivered'].includes(order.status) ? 'completed' : ''}`}>
                          <div className="step-icon">🚚</div>
                          <span>Shipped</span>
                        </div>
                        <div className={`step ${order.status === 'delivered' ? 'completed' : ''}`}>
                          <div className="step-icon">📦</div>
                          <span>Delivered</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="overview-card summary-card">
                    <h3>Order Summary</h3>
                    <div className="summary-details">
                      <div className="summary-row">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(order.subtotal)}</span>
                      </div>
                      <div className="summary-row">
                        <span>Shipping:</span>
                        <span>{order.shipping_cost === 0 ? 'FREE' : formatCurrency(order.shipping_cost)}</span>
                      </div>
                      <div className="summary-row">
                        <span>Tax:</span>
                        <span>{formatCurrency(order.tax_amount)}</span>
                      </div>
                      <div className="summary-row total">
                        <span>Total:</span>
                        <span>{formatCurrency(order.total_amount)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="overview-card next-steps-card">
                    <h3>Next Steps</h3>
                    <div className="next-steps-content">
                      {order.status === 'pending' && (
                        <div className="next-step">
                          <div className="step-icon">⏳</div>
                          <div className="step-content">
                            <h4>Order Confirmation Pending</h4>
                            <p>We're reviewing your order. You'll receive a confirmation email shortly.</p>
                          </div>
                        </div>
                      )}
                      {order.status === 'confirmed' && (
                        <div className="next-step">
                          <div className="step-icon">⚙️</div>
                          <div className="step-content">
                            <h4>Order Being Processed</h4>
                            <p>We're preparing your items for shipment. This usually takes 1-2 business days.</p>
                          </div>
                        </div>
                      )}
                      {order.status === 'processing' && (
                        <div className="next-step">
                          <div className="step-icon">📦</div>
                          <div className="step-content">
                            <h4>Ready for Shipment</h4>
                            <p>Your order is packed and ready to ship. You'll receive tracking information soon.</p>
                          </div>
                        </div>
                      )}
                      {order.status === 'shipped' && (
                        <div className="next-step">
                          <div className="step-icon">🚚</div>
                          <div className="step-content">
                            <h4>Out for Delivery</h4>
                            <p>Your order is on its way! Track your package using the tracking number below.</p>
                          </div>
                        </div>
                      )}
                      {order.status === 'delivered' && (
                        <div className="next-step">
                          <div className="step-icon">✅</div>
                          <div className="step-content">
                            <h4>Order Delivered</h4>
                            <p>Your order has been successfully delivered. Enjoy your purchase!</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'items' && (
              <motion.div
                key="items"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="tab-content"
              >
                <div className="order-items-section">
                  <h3>Order Items ({order.items?.length || 0})</h3>
                  <div className="order-items-list">
                    {order.items?.map((item, index) => (
                      <div key={index} className="order-item-card">
                        <div className="item-image">
                          <img
                            src={productImages[item.product_id || item.id] ? `data:image/jpeg;base64,${productImages[item.product_id || item.id]}` : item.product?.images?.[0] ? `data:image/jpeg;base64,${item.product?.images?.[0]}` : item.image ? `data:image/jpeg;base64,${item.image}` : '/logo.png'}
                            alt={item.product?.name || item.name || 'Product'}
                            onError={(e) => {
                              e.target.src = '/logo.png';
                            }}
                          />
                        </div>
                        <div className="item-details">
                          <h4>{item.product?.name || item.name || 'Product Name'}</h4>
                          <div className="item-meta">
                            <span className="item-sku">SKU: {item.product?.sku || item.sku || 'N/A'}</span>
                            <span className="item-brand">Brand: {item.product?.brand || item.brand || 'N/A'}</span>
                          </div>
                          <div className="item-variants">
                            {item.size && <span className="variant">Size: {item.size}</span>}
                            {item.color && <span className="variant">Color: {item.color}</span>}
                          </div>
                          <div className="item-pricing">
                            <span className="quantity">Qty: {item.quantity}</span>
                            <span className="price">{formatCurrency(item.price)}</span>
                            <span className="subtotal">{formatCurrency(item.subtotal)}</span>
                          </div>
                        </div>
                        <div className="item-actions">
                          <button
                            className="view-product-btn"
                            onClick={() => navigate(`/productDetails/${item.product_id || item.id}`)}
                          >
                            View Product
                          </button>
                        </div>
                      </div>
                    )) || (
                      <div className="no-items">
                        <p>No items found in this order.</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'shipping' && (
              <motion.div
                key="shipping"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="tab-content"
              >
                <div className="shipping-section">
                  <div className="shipping-grid">
                    <div className="shipping-card">
                      <h3>Shipping Address</h3>
                      <div className="address-details">
                        <p className="address-name">
                          {order.shipping_address?.first_name} {order.shipping_address?.last_name}
                        </p>
                        {order.shipping_address?.company && (
                          <p className="address-company">{order.shipping_address.company}</p>
                        )}
                        <p className="address-street">
                          {order.shipping_address?.address_line_1}
                        </p>
                        {order.shipping_address?.address_line_2 && (
                          <p className="address-street">{order.shipping_address.address_line_2}</p>
                        )}
                        <p className="address-city-state">
                          {order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.postal_code}
                        </p>
                        <p className="address-country">{order.shipping_address?.country}</p>
                        {order.shipping_address?.phone && (
                          <p className="address-phone">📞 {order.shipping_address.phone}</p>
                        )}
                      </div>
                    </div>

                    <div className="shipping-card">
                      <h3>Billing Address</h3>
                      <div className="address-details">
                        <p className="address-name">
                          {order.billing_address?.first_name} {order.billing_address?.last_name}
                        </p>
                        {order.billing_address?.company && (
                          <p className="address-company">{order.billing_address.company}</p>
                        )}
                        <p className="address-street">
                          {order.billing_address?.address_line_1}
                        </p>
                        {order.billing_address?.address_line_2 && (
                          <p className="address-street">{order.billing_address.address_line_2}</p>
                        )}
                        <p className="address-city-state">
                          {order.billing_address?.city}, {order.billing_address?.state} {order.billing_address?.postal_code}
                        </p>
                        <p className="address-country">{order.billing_address?.country}</p>
                        {order.billing_address?.phone && (
                          <p className="address-phone">📞 {order.billing_address.phone}</p>
                        )}
                      </div>
                    </div>

                    <div className="shipping-card">
                      <h3>Shipping Method</h3>
                      <div className="shipping-method-details">
                        <div className="method-name">
                          {order.shipping_method === 'standard' && '🚛 Standard Shipping'}
                          {order.shipping_method === 'express' && '⚡ Express Shipping'}
                          {order.shipping_method === 'overnight' && '🚀 Overnight Shipping'}
                        </div>
                        <div className="method-cost">
                          {order.shipping_cost === 0 ? 'FREE' : formatCurrency(order.shipping_cost)}
                        </div>
                        <div className="method-estimate">
                          {order.shipping_method === 'standard' && '3-5 business days'}
                          {order.shipping_method === 'express' && '1-2 business days'}
                          {order.shipping_method === 'overnight' && 'Next business day'}
                        </div>
                      </div>
                    </div>

                    {order.tracking_number && (
                      <div className="shipping-card">
                        <h3>Tracking Information</h3>
                        <div className="tracking-details">
                          <div className="tracking-number">
                            <span className="tracking-label">Tracking Number:</span>
                            <span className="tracking-value">{order.tracking_number}</span>
                          </div>
                          <div className="tracking-carrier">
                            <span className="tracking-label">Carrier:</span>
                            <span className="tracking-value">UPS</span>
                          </div>
                          <button className="track-package-btn">
                            Track Package
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'payment' && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="tab-content"
              >
                <div className="payment-section">
                  <div className="payment-grid">
                    <div className="payment-card">
                      <h3>Payment Method</h3>
                      <div className="payment-method-details">
                        <div className="payment-type">
                          <span className="payment-icon">
                            {order.payment_method?.includes('credit') && '💳'}
                            {order.payment_method?.includes('paypal') && '🅿️'}
                            {order.payment_method?.includes('apple') && '🍎'}
                          </span>
                          <span className="payment-name">
                            {order.payment_method?.includes('credit') && 'Credit/Debit Card'}
                            {order.payment_method?.includes('paypal') && 'PayPal'}
                            {order.payment_method?.includes('apple') && 'Apple Pay'}
                            {!order.payment_method?.includes('credit') && !order.payment_method?.includes('paypal') && !order.payment_method?.includes('apple') && 'Payment Method'}
                          </span>
                        </div>
                        <div className="payment-status">
                          <span className="status-label">Status:</span>
                          <span className={`status-value ${order.payment_status}`}>
                            {order.payment_status?.charAt(0).toUpperCase() + order.payment_status?.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="payment-card">
                      <h3>Payment Breakdown</h3>
                      <div className="payment-breakdown">
                        <div className="breakdown-row">
                          <span>Items Subtotal:</span>
                          <span>{formatCurrency(order.subtotal)}</span>
                        </div>
                        <div className="breakdown-row">
                          <span>Shipping:</span>
                          <span>{order.shipping_cost === 0 ? 'FREE' : formatCurrency(order.shipping_cost)}</span>
                        </div>
                        <div className="breakdown-row">
                          <span>Tax:</span>
                          <span>{formatCurrency(order.tax_amount)}</span>
                        </div>
                        {order.discount_amount > 0 && (
                          <div className="breakdown-row discount">
                            <span>Discount:</span>
                            <span>-{formatCurrency(order.discount_amount)}</span>
                          </div>
                        )}
                        <div className="breakdown-row total">
                          <span>Total Paid:</span>
                          <span>{formatCurrency(order.total_amount)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="payment-card">
                      <h3>Payment Timeline</h3>
                      <div className="payment-timeline">
                        <div className="timeline-item">
                          <div className="timeline-icon">💳</div>
                          <div className="timeline-content">
                            <h4>Payment Authorized</h4>
                            <p>{formatDate(order.created_at)}</p>
                          </div>
                        </div>
                        {order.payment_status === 'paid' && (
                          <div className="timeline-item">
                            <div className="timeline-icon">✅</div>
                            <div className="timeline-content">
                              <h4>Payment Completed</h4>
                              <p>{formatDate(order.created_at)}</p>
                            </div>
                          </div>
                        )}
                        {order.payment_status === 'refunded' && (
                          <div className="timeline-item">
                            <div className="timeline-icon">💰</div>
                            <div className="timeline-content">
                              <h4>Payment Refunded</h4>
                              <p>{formatDate(order.updated_at)}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'timeline' && (
              <motion.div
                key="timeline"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="tab-content"
              >
                <div className="timeline-section">
                  <h3>Order Timeline</h3>
                  <div className="order-timeline">
                    <div className="timeline-item">
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <div className="timeline-header">
                          <h4>Order Placed</h4>
                          <span className="timeline-date">{formatDate(order.created_at)}</span>
                        </div>
                        <p>Your order has been successfully placed and is being processed.</p>
                      </div>
                    </div>

                    {order.status !== 'pending' && (
                      <div className="timeline-item">
                        <div className="timeline-marker"></div>
                        <div className="timeline-content">
                          <div className="timeline-header">
                            <h4>Order Confirmed</h4>
                            <span className="timeline-date">{formatDate(order.updated_at)}</span>
                          </div>
                          <p>Your order has been confirmed and payment has been processed.</p>
                        </div>
                      </div>
                    )}

                    {(order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered') && (
                      <div className="timeline-item">
                        <div className="timeline-marker"></div>
                        <div className="timeline-content">
                          <div className="timeline-header">
                            <h4>Order Processing</h4>
                            <span className="timeline-date">{formatDate(order.updated_at)}</span>
                          </div>
                          <p>Your order is being prepared for shipment.</p>
                        </div>
                      </div>
                    )}

                    {(order.status === 'shipped' || order.status === 'delivered') && (
                      <div className="timeline-item">
                        <div className="timeline-marker"></div>
                        <div className="timeline-content">
                          <div className="timeline-header">
                            <h4>Order Shipped</h4>
                            <span className="timeline-date">{formatDate(order.shipped_at)}</span>
                          </div>
                          <p>Your order has been shipped and is on its way to you.</p>
                          {order.tracking_number && (
                            <p className="tracking-info">Tracking Number: {order.tracking_number}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {order.status === 'delivered' && (
                      <div className="timeline-item">
                        <div className="timeline-marker completed"></div>
                        <div className="timeline-content">
                          <div className="timeline-header">
                            <h4>Order Delivered</h4>
                            <span className="timeline-date">{formatDate(order.delivered_at)}</span>
                          </div>
                          <p>Your order has been successfully delivered. Thank you for shopping with us!</p>
                        </div>
                      </div>
                    )}

                    {order.status === 'cancelled' && (
                      <div className="timeline-item cancelled">
                        <div className="timeline-marker"></div>
                        <div className="timeline-content">
                          <div className="timeline-header">
                            <h4>Order Cancelled</h4>
                            <span className="timeline-date">{formatDate(order.updated_at)}</span>
                          </div>
                          <p>Your order has been cancelled.</p>
                          {order.notes && <p className="cancellation-notes">Reason: {order.notes}</p>}
                        </div>
                      </div>
                    )}

                    {order.status === 'refunded' && (
                      <div className="timeline-item">
                        <div className="timeline-marker completed"></div>
                        <div className="timeline-content">
                          <div className="timeline-header">
                            <h4>Order Refunded</h4>
                            <span className="timeline-date">{formatDate(order.updated_at)}</span>
                          </div>
                          <p>Your order has been refunded. The amount will be credited to your original payment method.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="order-actions">
        <div className="container">
          <div className="action-buttons">
            <button onClick={() => navigate('/productList')} className="continue-shopping-btn">
              Continue Shopping
            </button>
            <button onClick={() => navigate('/profile')} className="back-to-orders-btn">
              Back to My Orders
            </button>
            {order.status === 'delivered' && (
              <button className="return-order-btn">
                Request Return
              </button>
            )}
            <button onClick={() => window.print()} className="print-order-btn">
              Print Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;