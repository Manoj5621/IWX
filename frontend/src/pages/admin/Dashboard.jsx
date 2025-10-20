// AdminDashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminAPI } from '../../api/adminAPI';
import Navbar from '../../components/Navbar/Navbar';
import websocketService from '../../services/websocket';
import './Dashboard.css';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const sidebarRef = useRef(null);
  const [editingUser, setEditingUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userFormData, setUserFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: 'customer',
    status: 'active'
  });
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    revenue: 0,
    visitors: 0,
    conversionRate: 0
  });
  const [loading, setLoading] = useState(true);

  const [performanceData, setPerformanceData] = useState({
    pageLoadTime: 2.3,
    bounceRate: 42.1,
    avgSession: 8.5
    });

    const [satisfactionData, setSatisfactionData] = useState({
    overall: 4.7,
    support: 4.9,
    product: 4.6,
    delivery: 4.5
    });

   const [inventoryAlerts, setInventoryAlerts] = useState([
    { product: 'Premium Leather Jacket', stock: 12, threshold: 20, type: 'low' },
    { product: 'Designer Silk Dress', stock: 45, threshold: 50, type: 'warning' },
    { product: 'Limited Edition Sneakers', stock: 3, threshold: 10, type: 'low' },
    { product: 'Winter Parka', stock: 78, threshold: 30, type: 'info' }
    ]);

    const [campaigns, setCampaigns] = useState([
    { name: 'Summer Sale', progress: 75, budget: 5000, spent: 3750, status: 'active' },
    { name: 'New Collection', progress: 30, budget: 10000, spent: 3000, status: 'active' },
    { name: 'Email Newsletter', progress: 100, budget: 2000, spent: 2000, status: 'completed' },
    { name: 'Social Media Ads', progress: 45, budget: 8000, spent: 3600, status: 'active' }
    ]);

    // Line chart data for revenue trend
    const lineChartData = [
    { day: '1', value: 12000 },
    { day: '2', value: 18000 },
    { day: '3', value: 15000 },
    { day: '4', value: 22000 },
    { day: '5', value: 19000 },
    { day: '6', value: 25000 },
    { day: '7', value: 21000 },
    { day: '8', value: 28000 },
    { day: '9', value: 24000 },
    { day: '10', value: 31000 },
    { day: '11', value: 27000 },
    { day: '12', value: 35000 },
    { day: '13', value: 32000 },
    { day: '14', value: 38000 }
    ];

    const [inventoryItems, setInventoryItems] = useState([
  { name: 'Premium Leather Jacket', stock: 12, total: 100, category: 'Clothing' },
  { name: 'Designer Silk Dress', stock: 45, total: 150, category: 'Clothing' },
  { name: 'Limited Edition Sneakers', stock: 3, total: 50, category: 'Footwear' },
  { name: 'Winter Parka', stock: 78, total: 100, category: 'Clothing' },
  { name: 'Casual Sneakers', stock: 156, total: 200, category: 'Footwear' },
  { name: 'Luxury Handbag', stock: 23, total: 75, category: 'Accessories' }
]);

const [marketingData, setMarketingData] = useState({
  roi: 245,
  clickRate: 3.7,
  impressions: 125000,
  engagements: 12450
});

const [settings, setSettings] = useState({
  emailNotifications: true,
  smsAlerts: false,
  autoBackup: true,
  twoFactorAuth: true,
  darkMode: false
});

const [users, setUsers] = useState([]);
const [loadingUsers, setLoadingUsers] = useState(true);

const [financeData, setFinanceData] = useState({
  revenue: 125430,
  expenses: 89450,
  profit: 35980,
  growth: 12.5
});

const [systemStatus, setSystemStatus] = useState([
  { service: 'Web Server', status: 'online', uptime: '99.9%' },
  { service: 'Database', status: 'online', uptime: '99.8%' },
  { service: 'Payment Gateway', status: 'warning', uptime: '98.7%' },
  { service: 'Email Service', status: 'online', uptime: '99.5%' }
]);

  // Load dashboard data and set up real-time updates
  useEffect(() => {
    loadDashboardData();
    loadUsersData();

    // Connect to WebSocket for real-time updates
    const wsConnection = websocketService.connect('dashboard',
      (data) => {
        // Handle real-time updates
        if (data.type === 'stats_update') {
          setStats(prev => ({ ...prev, ...data.data }));
        } else if (data.type === 'user_update') {
          // Handle user updates (create, update, delete)
          handleUserUpdate(data.data);
        }
      },
      (error) => console.error('WebSocket error:', error),
      () => console.log('WebSocket disconnected')
    );

    return () => {
      websocketService.disconnect('dashboard');
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      const dashboardStats = await adminAPI.getDashboardStats();
      setStats({
        totalSales: dashboardStats.orders.total_revenue,
        totalOrders: dashboardStats.orders.total_orders,
        totalCustomers: dashboardStats.users.total_users,
        totalProducts: dashboardStats.products.total_products,
        revenue: dashboardStats.revenue.total,
        visitors: 0, // Would come from analytics
        conversionRate: 0 // Would be calculated
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Keep existing mock data as fallback
    } finally {
      setLoading(false);
    }
  };

  const capitalizeName = (name) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  const loadUsersData = async () => {
    try {
      const usersData = await adminAPI.getUsers();
      setUsers(usersData.map(user => ({
        id: user.id,
        name: `${capitalizeName(user.first_name || '')} ${capitalizeName(user.last_name || '')}`.trim() || user.email,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        role: user.role,
        email: user.email,
        lastActive: user.last_login ? new Date(user.last_login).toLocaleString() : 'Never',
        status: user.status,
        created_at: user.created_at
      })));
    } catch (error) {
      console.error('Failed to load users data:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleUserUpdate = (data) => {
    if (data.action === 'create') {
      const newUser = {
        id: data.user.id,
        first_name: data.user.first_name || '',
        last_name: data.user.last_name || '',
        role: data.user.role,
        email: data.user.email,
        lastActive: data.user.last_login ? new Date(data.user.last_login).toLocaleString() : 'Never',
        status: data.user.status,
        created_at: data.user.created_at,
        name: `${capitalizeName(data.user.first_name || '')} ${capitalizeName(data.user.last_name || '')}`.trim() || data.user.email
      };
      setUsers(prev => [newUser, ...prev]);
    } else if (data.action === 'update') {
      setUsers(prev => prev.map(user =>
        user.id === data.user.id ? {
          ...user,
          first_name: data.user.first_name || user.first_name,
          last_name: data.user.last_name || user.last_name,
          role: data.user.role || user.role,
          email: data.user.email || user.email,
          lastActive: data.user.last_login ? new Date(data.user.last_login).toLocaleString() : user.lastActive,
          status: data.user.status || user.status,
          name: `${capitalizeName(data.user.first_name || user.first_name)} ${capitalizeName(data.user.last_name || user.last_name)}`.trim() || (data.user.email || user.email)
        } : user
      ));
    } else if (data.action === 'delete') {
      setUsers(prev => prev.filter(user => user.id !== data.user_id));
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      role: user.role || 'customer',
      status: user.status || 'active'
    });
    setShowUserModal(true);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminAPI.deleteUser(userId);
        setUsers(prev => prev.filter(user => user.id !== userId));
      } catch (error) {
        console.error('Failed to delete user:', error);
        alert('Failed to delete user');
      }
    }
  };

  const handleSaveUser = async (userData) => {
    try {
      // Trim email to remove any spaces
      const cleanedUserData = {
        ...userData,
        email: userData.email.trim()
      };

      console.log('Saving user with data:', cleanedUserData); // Debug log
      if (editingUser) {
        await adminAPI.updateUser(editingUser.id, cleanedUserData);
        setUsers(prev => prev.map(user =>
          user.id === editingUser.id ? {
            ...user,
            ...cleanedUserData,
            name: `${capitalizeName(cleanedUserData.first_name || user.first_name)} ${capitalizeName(cleanedUserData.last_name || user.last_name)}`.trim() || cleanedUserData.email
          } : user
        ));
      } else {
        const newUser = await adminAPI.createUser(cleanedUserData);
        console.log('Created user response:', newUser); // Debug log
        const formattedUser = {
          ...newUser,
          name: `${capitalizeName(newUser.first_name || '')} ${capitalizeName(newUser.last_name || '')}`.trim() || newUser.email
        };
        setUsers(prev => [formattedUser, ...prev]);
      }
      setShowUserModal(false);
      setEditingUser(null);
      setUserFormData({
        first_name: '',
        last_name: '',
        email: '',
        role: 'customer',
        status: 'active'
      });
    } catch (error) {
      console.error('Failed to save user:', error);
      alert('Failed to save user');
    }
  };

  // Drag functionality
  const handleMouseDown = (e) => {
    if (!sidebarOpen) return;
    setIsDragging(true);
    const startX = e.clientX - dragOffset;
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const newOffset = e.clientX - startX;
      // Limit drag range to -50px to +50px
      const clampedOffset = Math.max(-50, Math.min(50, newOffset));
      setDragOffset(clampedOffset);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      // Reset to center after drag ends
      setDragOffset(0);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  };

  // Sample data for charts
  const salesData = [
    { month: 'Jan', sales: 12000, orders: 240 },
    { month: 'Feb', sales: 19000, orders: 320 },
    { month: 'Mar', sales: 15000, orders: 280 },
    { month: 'Apr', sales: 22000, orders: 380 },
    { month: 'May', sales: 18000, orders: 310 },
    { month: 'Jun', sales: 25000, orders: 420 },
    { month: 'Jul', sales: 21000, orders: 360 },
    { month: 'Aug', sales: 28000, orders: 470 },
    { month: 'Sep', sales: 24000, orders: 410 },
    { month: 'Oct', sales: 31000, orders: 520 },
    { month: 'Nov', sales: 27000, orders: 450 },
    { month: 'Dec', sales: 35000, orders: 580 }
  ];

  const topProducts = [
    { name: 'Premium Leather Jacket', sales: 1243, revenue: 248600 },
    { name: 'Designer Silk Dress', sales: 987, revenue: 147825 },
    { name: 'Limited Edition Sneakers', sales: 856, revenue: 110928 },
    { name: 'Winter Parka', sales: 743, revenue: 96470 },
    { name: 'Casual Sneakers', sales: 689, revenue: 48230 }
  ];

  const recentOrders = [
    { id: 'IWX789012', customer: 'Emma Wilson', date: '2025-01-15', amount: 247.50, status: 'Delivered' },
    { id: 'IWX789011', customer: 'James Brown', date: '2025-01-15', amount: 149.99, status: 'Shipped' },
    { id: 'IWX789010', customer: 'Sophia Garcia', date: '2025-01-14', amount: 89.99, status: 'Processing' },
    { id: 'IWX789009', customer: 'Michael Chen', date: '2025-01-14', amount: 325.75, status: 'Delivered' },
    { id: 'IWX789008', customer: 'Olivia Martinez', date: '2025-01-13', amount: 159.98, status: 'Shipped' }
  ];

  const trafficSources = [
    { source: 'Direct', visitors: 12450, percentage: 35 },
    { source: 'Organic Search', visitors: 9870, percentage: 28 },
    { source: 'Social Media', visitors: 6540, percentage: 18 },
    { source: 'Email', visitors: 4320, percentage: 12 },
    { source: 'Referral', visitors: 2460, percentage: 7 }
  ];

  // Function to render animated value
  const AnimatedValue = ({ value, prefix = '', suffix = '' }) => {
    return (
      <motion.span
        key={value}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {prefix}{value.toLocaleString()}{suffix}
      </motion.span>
    );
  };

  const LineChart = ({ data, width = '100%', height = 200 }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    
    const getX = (index) => (index / (data.length - 1)) * 100;
    const getY = (value) => 100 - ((value - minValue) / (maxValue - minValue)) * 100;

    const points = data.map((d, i) => `${getX(i)},${getY(d.value)}`).join(' ');
    const areaPoints = `0,100 ${points} 100,100`;

    return (
        <svg width={width} height={height} viewBox="0 0 100 100" className="line-chart-container">
        <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2196f3" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#2196f3" stopOpacity="0" />
            </linearGradient>
        </defs>
        
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((y) => (
            <line
            key={y}
            x1="0"
            y1={y}
            x2="100"
            y2={y}
            className="line-chart-grid"
            />
        ))}
        
        {/* Area */}
        <polygon points={areaPoints} className="line-chart-area" />
        
        {/* Line */}
        <polyline points={points} className="line-chart-path" />
        
        {/* Dots */}
        {data.map((d, i) => (
            <motion.circle
            key={i}
            cx={getX(i)}
            cy={getY(d.value)}
            className="line-chart-dot"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            />
        ))}
        </svg>
    );
  };

  const CalendarWidget = () => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dates = Array.from({ length: 31 }, (_, i) => i + 1);
  const events = [5, 12, 18, 25]; // Dates with events
  
  return (
    <div className="calendar-widget">
      <div className="calendar-header">
        <h4>January 2025</h4>
        <button className="primary-btn" style={{ padding: '5px 10px', fontSize: '12px' }}>
          View All
        </button>
      </div>
      <div className="calendar-grid">
        {days.map(day => (
          <div key={day} className="calendar-day header">{day}</div>
        ))}
        {dates.map(date => (
          <div 
            key={date} 
            className={`calendar-day ${
              events.includes(date) ? 'event' : ''
            } ${date === 15 ? 'today' : ''}`}
          >
            {date}
          </div>
        ))}
      </div>
    </div>
  );
};

  return (
    <div className="admin-dashboard">
      <Navbar />

      {/* Header */}
      <header className="admin-header">
        <div className="header-left">
          <button
            className="menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <h1>IWX Admin Dashboard</h1>
        </div>
        <div className="header-right">
          <div className="admin-search">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button>🔍</button>
          </div>
          <div className="admin-notifications">
            <button className="notification-btn">🔔</button>
            <span className="notification-count">3</span>
          </div>
          <div className="admin-profile">
            <div className="profile-avatar">AJ</div>
            <span>Admin Johnson</span>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}
        style={{
          transform: sidebarOpen ? `translateX(${dragOffset}px)` : 'translateX(-100%)',
          transition: isDragging ? 'none' : 'transform var(--transition-normal)',
          cursor: sidebarOpen ? (isDragging ? 'grabbing' : 'grab') : 'default'
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Desktop Navigation - Visible on large screens */}
        <nav className="desktop-nav">
          <button
            className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveSection('dashboard')}
          >
            📊 Dashboard
          </button>
          <button
            className={`nav-item ${activeSection === 'products' ? 'active' : ''}`}
            onClick={() => setActiveSection('products')}
          >
            🛍️ Products
          </button>
          <button
            className={`nav-item ${activeSection === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveSection('orders')}
          >
            📦 Orders
          </button>
          <button
            className={`nav-item ${activeSection === 'customers' ? 'active' : ''}`}
            onClick={() => setActiveSection('customers')}
          >
            👥 Customers
          </button>
          <button
            className={`nav-item ${activeSection === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveSection('analytics')}
          >
            📈 Analytics
          </button>
          <button
            className={`nav-item ${activeSection === 'marketing' ? 'active' : ''}`}
            onClick={() => setActiveSection('marketing')}
          >
            🎯 Marketing
          </button>
          <button
            className={`nav-item ${activeSection === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveSection('inventory')}
          >
            📋 Inventory
          </button>
          <button
            className={`nav-item ${activeSection === 'users' ? 'active' : ''}`}
            onClick={() => setActiveSection('users')}
          >
            👥 User Management
          </button>
          <button
            className={`nav-item ${activeSection === 'finance' ? 'active' : ''}`}
            onClick={() => setActiveSection('finance')}
          >
            💰 Finance
          </button>
          <button
            className={`nav-item ${activeSection === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveSection('reports')}
          >
            📋 Reports
          </button>
          <button
            className={`nav-item ${activeSection === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveSection('notifications')}
          >
            🔔 Notifications
          </button>
          <button
            className={`nav-item ${activeSection === 'security' ? 'active' : ''}`}
            onClick={() => setActiveSection('security')}
          >
            🔒 Security
          </button>
          <button
            className={`nav-item ${activeSection === 'integrations' ? 'active' : ''}`}
            onClick={() => setActiveSection('integrations')}
          >
            🔗 Integrations
          </button>
          <button
            className={`nav-item ${activeSection === 'backups' ? 'active' : ''}`}
            onClick={() => setActiveSection('backups')}
          >
            💾 Backups
          </button>
          <button
            className={`nav-item ${activeSection === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveSection('logs')}
          >
            📝 Logs
          </button>
          <button
            className={`nav-item ${activeSection === 'help' ? 'active' : ''}`}
            onClick={() => setActiveSection('help')}
          >
            ❓ Help & Support
          </button>
          <button
            className={`nav-item ${activeSection === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveSection('settings')}
          >
            ⚙️ Settings
          </button>
        </nav>

        {/* Mobile Navigation - Only in sidebar */}
        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('dashboard');
              setSidebarOpen(false);
            }}
          >
            📊 Dashboard
          </button>
          <button
            className={`nav-item ${activeSection === 'products' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('products');
              setSidebarOpen(false);
            }}
          >
            🛍️ Products
          </button>
          <button
            className={`nav-item ${activeSection === 'orders' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('orders');
              setSidebarOpen(false);
            }}
          >
            📦 Orders
          </button>
          <button
            className={`nav-item ${activeSection === 'customers' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('customers');
              setSidebarOpen(false);
            }}
          >
            👥 Customers
          </button>
          <button
            className={`nav-item ${activeSection === 'analytics' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('analytics');
              setSidebarOpen(false);
            }}
          >
            📈 Analytics
          </button>
          <button
            className={`nav-item ${activeSection === 'marketing' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('marketing');
              setSidebarOpen(false);
            }}
          >
            🎯 Marketing
          </button>
          <button
            className={`nav-item ${activeSection === 'inventory' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('inventory');
              setSidebarOpen(false);
            }}
          >
            📋 Inventory
          </button>
          <button
            className={`nav-item ${activeSection === 'users' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('users');
              setSidebarOpen(false);
            }}
          >
            👥 User Management
          </button>
          <button
            className={`nav-item ${activeSection === 'finance' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('finance');
              setSidebarOpen(false);
            }}
          >
            💰 Finance
          </button>
          <button
            className={`nav-item ${activeSection === 'reports' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('reports');
              setSidebarOpen(false);
            }}
          >
            📋 Reports
          </button>
          <button
            className={`nav-item ${activeSection === 'notifications' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('notifications');
              setSidebarOpen(false);
            }}
          >
            🔔 Notifications
          </button>
          <button
            className={`nav-item ${activeSection === 'security' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('security');
              setSidebarOpen(false);
            }}
          >
            🔒 Security
          </button>
          <button
            className={`nav-item ${activeSection === 'integrations' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('integrations');
              setSidebarOpen(false);
            }}
          >
            🔗 Integrations
          </button>
          <button
            className={`nav-item ${activeSection === 'backups' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('backups');
              setSidebarOpen(false);
            }}
          >
            💾 Backups
          </button>
          <button
            className={`nav-item ${activeSection === 'logs' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('logs');
              setSidebarOpen(false);
            }}
          >
            📝 Logs
          </button>
          <button
            className={`nav-item ${activeSection === 'help' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('help');
              setSidebarOpen(false);
            }}
          >
            ❓ Help & Support
          </button>
          <button
            className={`nav-item ${activeSection === 'settings' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('settings');
              setSidebarOpen(false);
            }}
          >
            ⚙️ Settings
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Dashboard Section */}
        <AnimatePresence mode="wait">
          {activeSection === 'dashboard' && (
            <motion.section 
              className="dashboard-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="section-header">
                <h2>Dashboard Overview</h2>
                <div className="date-filter">
                  <select>
                    <option>Today</option>
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                    <option>This Year</option>
                    <option>Custom Range</option>
                  </select>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-icon">💰</div>
                  <div className="metric-content">
                    <h3>Total Revenue</h3>
                    <p className="metric-value">
                      ${loading ? '...' : <AnimatedValue value={stats.totalSales + stats.revenue} />}
                    </p>
                    <div className="metric-trend up">
                      <span>↑ 12.5%</span> from last month
                    </div>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon">📦</div>
                  <div className="metric-content">
                    <h3>Total Orders</h3>
                    <p className="metric-value">
                      {loading ? '...' : <AnimatedValue value={stats.totalOrders} />}
                    </p>
                    <div className="metric-trend up">
                      <span>↑ 8.3%</span> from last month
                    </div>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon">👥</div>
                  <div className="metric-content">
                    <h3>Total Customers</h3>
                    <p className="metric-value">
                      {loading ? '...' : <AnimatedValue value={stats.totalCustomers} />}
                    </p>
                    <div className="metric-trend up">
                      <span>↑ 5.7%</span> from last month
                    </div>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon">📊</div>
                  <div className="metric-content">
                    <h3>Conversion Rate</h3>
                    <p className="metric-value">
                      {loading ? '...' : <AnimatedValue value={(3.2 + stats.conversionRate).toFixed(1)} suffix="%" />}
                    </p>
                    <div className="metric-trend down">
                      <span>↓ 0.3%</span> from last month
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts Row */}
              <div className="charts-row">
                <div className="chart-card">
                  <h3>Sales Overview</h3>
                  <div className="chart-container">
                    {salesData.map((item, index) => (
                      <div key={index} className="chart-bar-container">
                        <motion.div 
                          className="chart-bar"
                          initial={{ height: 0 }}
                          animate={{ height: `${(item.sales / 35000) * 100}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                        >
                          <div className="bar-value">${(item.sales / 1000).toFixed(0)}k</div>
                        </motion.div>
                        <span className="bar-label">{item.month}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="chart-card">
                  <h3>Revenue vs Orders</h3>
                  <div className="dual-chart-container">
                    {salesData.map((item, index) => (
                      <div key={index} className="dual-chart-bar-container">
                        <div className="dual-bars">
                          <motion.div 
                            className="revenue-bar"
                            initial={{ height: 0 }}
                            animate={{ height: `${(item.sales / 35000) * 100}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                          ></motion.div>
                          <motion.div 
                            className="orders-bar"
                            initial={{ height: 0 }}
                            animate={{ height: `${(item.orders / 600) * 100}%` }}
                            transition={{ duration: 1, delay: index * 0.1 + 0.2 }}
                          ></motion.div>
                        </div>
                        <span className="bar-label">{item.month}</span>
                      </div>
                    ))}
                  </div>
                  <div className="chart-legend">
                    <div className="legend-item">
                      <span className="legend-color revenue"></span>
                      Revenue
                    </div>
                    <div className="legend-item">
                      <span className="legend-color orders"></span>
                      Orders
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity & Top Products */}
              <div className="activity-row">
                <div className="activity-card">
                  <h3>Recent Orders</h3>
                  <div className="activity-list">
                    {recentOrders.map((order, index) => (
                      <div key={index} className="activity-item">
                        <div className="activity-info">
                          <strong>#{order.id}</strong>
                          <span>{order.customer}</span>
                        </div>
                        <div className="activity-details">
                          <span>${order.amount}</span>
                          <span className={`status ${order.status.toLowerCase()}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="view-all-btn">View All Orders</button>
                </div>

                <div className="activity-card">
                  <h3>Top Products</h3>
                  <div className="products-list">
                    {topProducts.map((product, index) => (
                      <div key={index} className="product-item">
                        <div className="product-rank">{index + 1}</div>
                        <div className="product-info">
                          <strong>{product.name}</strong>
                          <span>{product.sales} sales</span>
                        </div>
                        <div className="product-revenue">
                          ${product.revenue.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="view-all-btn">View All Products</button>
                </div>
              </div>

              {/* Traffic Sources */}
              <div className="traffic-card">
                <h3>Traffic Sources</h3>
                <div className="traffic-sources">
                  {trafficSources.map((source, index) => (
                    <div key={index} className="traffic-item">
                      <div className="traffic-source">
                        <span>{source.source}</span>
                        <span>{source.visitors.toLocaleString()} visitors</span>
                      </div>
                      <div className="traffic-bar-container">
                        <motion.div 
                          className="traffic-bar"
                          initial={{ width: 0 }}
                          animate={{ width: `${source.percentage}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                        ></motion.div>
                      </div>
                      <span className="traffic-percentage">{source.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>

            {/* Quick Stats */}
            <div className="quick-stats-grid">
            <div className="quick-stat-card" style={{borderLeftColor: '#4caf50'}}>
                <div className="quick-stat-value">98.7%</div>
                <div className="quick-stat-label">Uptime</div>
            </div>
            <div className="quick-stat-card" style={{borderLeftColor: '#2196f3'}}>
                <div className="quick-stat-value">24h</div>
                <div className="quick-stat-label">Avg. Response Time</div>
            </div>
            <div className="quick-stat-card" style={{borderLeftColor: '#ff9800'}}>
                <div className="quick-stat-value">156</div>
                <div className="quick-stat-label">Pending Tasks</div>
            </div>
            <div className="quick-stat-card" style={{borderLeftColor: '#9c27b0'}}>
                <div className="quick-stat-value">12</div>
                <div className="quick-stat-label">New Messages</div>
            </div>
            </div>

            {/* Revenue Trend Line Chart */}
            <div className="chart-card">
            <h3>Revenue Trend (14 Days)</h3>
            <LineChart data={lineChartData} />
            </div>

            {/* Performance Metrics */}
            <div className="performance-metrics">
            <div className="performance-card">
                <h4>Page Load Time</h4>
                <div className="metric-value">{performanceData.pageLoadTime}s</div>
                <div className="progress-bar">
                <motion.div 
                    className="progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${(performanceData.pageLoadTime / 5) * 100}%` }}
                    transition={{ duration: 1 }}
                ></motion.div>
                </div>
                <span>Target: {'<'}3s</span>
            </div>
            
            <div className="performance-card">
                <h4>Bounce Rate</h4>
                <div className="metric-value">{performanceData.bounceRate}%</div>
                <div className="progress-bar">
                <motion.div 
                    className="progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${performanceData.bounceRate}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    style={{background: performanceData.bounceRate > 50 ? '#f44336' : '#4caf50'}}
                ></motion.div>
                </div>
                <span>Industry avg: 45%</span>
            </div>
            
            <div className="performance-card">
                <h4>Avg. Session Duration</h4>
                <div className="metric-value">{performanceData.avgSession}m</div>
                <div className="progress-bar">
                <motion.div 
                    className="progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${(performanceData.avgSession / 15) * 100}%` }}
                    transition={{ duration: 1, delay: 0.4 }}
                ></motion.div>
                </div>
                <span>Goal: 10m</span>
            </div>
            </div>

            {/* Customer Satisfaction */}
            <div className="satisfaction-metrics">
            <div className="satisfaction-card">
                <h4>Overall Satisfaction</h4>
                <div className="satisfaction-score">{satisfactionData.overall}/5</div>
                <div className="satisfaction-stars">★★★★★</div>
                <p>Based on 1,247 reviews</p>
            </div>
            
            <div className="satisfaction-card">
                <h4>Support Rating</h4>
                <div className="satisfaction-score" style={{color: '#2196f3'}}>{satisfactionData.support}/5</div>
                <div className="satisfaction-stars">★★★★★</div>
                <p>98% positive feedback</p>
            </div>
            
            <div className="satisfaction-card">
                <h4>Product Quality</h4>
                <div className="satisfaction-score" style={{color: '#4caf50'}}>{satisfactionData.product}/5</div>
                <div className="satisfaction-stars">★★★★☆</div>
                <p>94% satisfaction rate</p>
            </div>
            </div>

            {/* Inventory Alerts */}
            <div className="inventory-alerts">
            <h3>Inventory Alerts</h3>
            <div className="alert-list">
                {inventoryAlerts.map((alert, index) => (
                <motion.div 
                    key={index}
                    className={`alert-item ${alert.type}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                    <div className="alert-icon">
                    {alert.type === 'low' ? '⚠️' : alert.type === 'warning' ? '🔔' : 'ℹ️'}
                    </div>
                    <div style={{flex: 1}}>
                    <strong>{alert.product}</strong>
                    <div>Stock: {alert.stock} units (Threshold: {alert.threshold})</div>
                    </div>
                    <button className="primary-btn" style={{padding: '5px 10px', fontSize: '12px'}}>
                    Restock
                    </button>
                </motion.div>
                ))}
            </div>
            </div>

            {/* Marketing Campaigns */}
            <div className="campaigns-grid">
            <h3 style={{gridColumn: '1 / -1', marginBottom: '0'}}>Marketing Campaigns</h3>
            {campaigns.map((campaign, index) => (
                <div key={index} className="campaign-card">
                <h4>{campaign.name}</h4>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                    <span>Progress</span>
                    <span>{campaign.progress}%</span>
                </div>
                <div className="campaign-progress">
                    <motion.div 
                    className="campaign-progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${campaign.progress}%` }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                    style={{
                        background: campaign.status === 'completed' ? '#4caf50' : 
                                campaign.progress > 75 ? '#ff9800' : '#2196f3'
                    }}
                    ></motion.div>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#666'}}>
                    <span>${campaign.spent.toLocaleString()}</span>
                    <span>${campaign.budget.toLocaleString()}</span>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '12px'}}>
                    <span>Spent</span>
                    <span>Budget</span>
                </div>
                </div>
            ))}
            </div>

              {/* Real-time Monitoring */}
              <div className="monitoring-section">
                <h3>Real-time Monitoring</h3>
                <div className="monitoring-grid">
                  <div className="monitor-card">
                    <h4>Live Visitors</h4>
                    <div className="monitor-value">
                      <AnimatedValue value={Math.round(1245 + stats.visitors)} />
                    </div>
                    <div className="monitor-graph">
                      {[...Array(20)].map((_, i) => (
                        <motion.div 
                          key={i}
                          className="graph-bar"
                          animate={{ 
                            height: `${20 + Math.random() * 60}%`,
                            opacity: [0.5, 1, 0.5]
                          }}
                          transition={{ 
                            duration: 2, 
                            repeat: Infinity,
                            delay: i * 0.1
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="monitor-card">
                    <h4>Active Sessions</h4>
                    <div className="monitor-value">
                      <AnimatedValue value={Math.round(87 + stats.visitors / 10)} />
                    </div>
                    <div className="session-dots">
                      {[...Array(50)].map((_, i) => (
                        <motion.div 
                          key={i}
                          className="session-dot"
                          animate={{ 
                            scale: [0.5, 1, 0.5],
                            opacity: [0.3, 1, 0.3]
                          }}
                          transition={{ 
                            duration: 2 + Math.random(), 
                            repeat: Infinity,
                            delay: Math.random() * 2
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="monitor-card">
                    <h4>Server Status</h4>
                    <div className="status-indicator online">
                      <div className="status-dot"></div>
                      <span>All Systems Operational</span>
                    </div>
                    <div className="server-stats">
                      <div className="server-stat">
                        <span>CPU Usage</span>
                        <div className="stat-bar">
                          <motion.div 
                            className="stat-fill"
                            initial={{ width: '45%' }}
                            animate={{ width: `${45 + Math.random() * 10}%` }}
                            transition={{ duration: 2, repeat: Infinity }}
                          ></motion.div>
                        </div>
                      </div>
                      <div className="server-stat">
                        <span>Memory</span>
                        <div className="stat-bar">
                          <motion.div 
                            className="stat-fill"
                            initial={{ width: '62%' }}
                            animate={{ width: `${62 + Math.random() * 8}%` }}
                            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                          ></motion.div>
                        </div>
                      </div>
                      <div className="server-stat">
                        <span>Disk</span>
                        <div className="stat-bar">
                          <motion.div 
                            className="stat-fill"
                            initial={{ width: '28%' }}
                            animate={{ width: `${28 + Math.random() * 5}%` }}
                            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                          ></motion.div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {/* Products Section */}
          {activeSection === 'products' && (
            <motion.section 
              className="products-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="section-header">
                <h2>Product Management</h2>
                <button className="primary-btn">+ Add New Product</button>
              </div>
              <p>Product management content goes here...</p>
            </motion.section>
          )}

          {/* Orders Section */}
        {activeSection === 'orders' && (
            <motion.section 
                className="orders-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
            >
                <div className="section-header">
                <h2>Order Management</h2>
                <div>
                    <button className="primary-btn" style={{marginRight: '10px'}}>Export Orders</button>
                    <button className="primary-btn">+ New Order</button>
                </div>
                </div>
                <div className="quick-stats-grid">
                <div className="quick-stat-card" style={{borderLeftColor: '#4caf50'}}>
                    <div className="quick-stat-value">2847</div>
                    <div className="quick-stat-label">Total Orders</div>
                </div>
                <div className="quick-stat-card" style={{borderLeftColor: '#2196f3'}}>
                    <div className="quick-stat-value">156</div>
                    <div className="quick-stat-label">Pending</div>
                </div>
                <div className="quick-stat-card" style={{borderLeftColor: '#ff9800'}}>
                    <div className="quick-stat-value">98.3%</div>
                    <div className="quick-stat-label">Success Rate</div>
                </div>
                <div className="quick-stat-card" style={{borderLeftColor: '#9c27b0'}}>
                    <div className="quick-stat-value">$125,430</div>
                    <div className="quick-stat-label">Total Revenue</div>
                </div>
                </div>
                <p>Order management content goes here...</p>
            </motion.section>
            )}

            {/* Customers Section */}
            {activeSection === 'customers' && (
            <motion.section 
                className="customers-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
            >
                <div className="section-header">
                <h2>Customer Management</h2>
                <button className="primary-btn">+ Add Customer</button>
                </div>
                <div className="performance-metrics">
                <div className="performance-card">
                    <h4>Customer Growth</h4>
                    <div className="metric-value">+12.5%</div>
                    <p>Monthly growth rate</p>
                </div>
                <div className="performance-card">
                    <h4>Retention Rate</h4>
                    <div className="metric-value">87.3%</div>
                    <p>Customer retention</p>
                </div>
                <div className="performance-card">
                    <h4>Lifetime Value</h4>
                    <div className="metric-value">$1,247</div>
                    <p>Average LTV</p>
                </div>
                </div>
                <p>Customer management content goes here...</p>
            </motion.section>
            )}

            {/* Analytics Section */}
            {activeSection === 'analytics' && (
            <motion.section 
                className="analytics-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
            >
                <div className="section-header">
                <h2>Advanced Analytics</h2>
                <div className="date-filter">
                    <select>
                    <option>Real-time</option>
                    <option>Last 24 Hours</option>
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                    </select>
                </div>
                </div>
                <div className="charts-row">
                <div className="chart-card">
                    <h3>User Engagement</h3>
                    <LineChart data={lineChartData.map((d, i) => ({ day: d.day, value: d.value / 1000 }))} />
                </div>
                <div className="chart-card">
                    <h3>Conversion Funnel</h3>
                    <div className="chart-container">
                    {/* Conversion funnel visualization would go here */}
                    </div>
                </div>
                </div>
                <p>Advanced analytics content goes here...</p>
            </motion.section>
            )}
{/* Marketing Section */}
{activeSection === 'marketing' && (
  <motion.section 
    className="marketing-section"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    <div className="section-header">
      <h2>Marketing Campaigns</h2>
      <button className="primary-btn">+ New Campaign</button>
    </div>

    <div className="marketing-stats">
      <div className="marketing-stat-card">
        <div className="marketing-stat-value">{marketingData.roi}%</div>
        <div className="marketing-stat-label">ROI</div>
        <div className="finance-trend trend-positive">↑ 15.2%</div>
      </div>
      <div className="marketing-stat-card">
        <div className="marketing-stat-value">{marketingData.clickRate}%</div>
        <div className="marketing-stat-label">Click Rate</div>
        <div className="finance-trend trend-positive">↑ 3.1%</div>
      </div>
      <div className="marketing-stat-card">
        <div className="marketing-stat-value">{(marketingData.impressions / 1000).toFixed(0)}K</div>
        <div className="marketing-stat-label">Impressions</div>
        <div className="finance-trend trend-positive">↑ 8.7%</div>
      </div>
      <div className="marketing-stat-card">
        <div className="marketing-stat-value">{marketingData.engagements.toLocaleString()}</div>
        <div className="marketing-stat-label">Engagements</div>
        <div className="finance-trend trend-positive">↑ 12.3%</div>
      </div>
    </div>

    <div className="campaigns-grid">
      <h3 style={{gridColumn: '1 / -1', marginBottom: '0'}}>Active Campaigns</h3>
      {campaigns.filter(c => c.status === 'active').map((campaign, index) => (
        <div key={index} className="campaign-card">
          <h4>{campaign.name}</h4>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
            <span>Progress</span>
            <span>{campaign.progress}%</span>
          </div>
          <div className="campaign-progress">
            <motion.div 
              className="campaign-progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${campaign.progress}%` }}
              transition={{ duration: 1, delay: index * 0.2 }}
              style={{ background: '#2196f3' }}
            ></motion.div>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginTop: '10px'}}>
            <span>Spent: ${campaign.spent.toLocaleString()}</span>
            <span>Budget: ${campaign.budget.toLocaleString()}</span>
          </div>
        </div>
      ))}
    </div>

    <div className="chart-card">
      <h3>Campaign Performance</h3>
      <LineChart data={lineChartData.map((d, i) => ({ day: d.day, value: d.value / 500 }))} />
    </div>
  </motion.section>
)}

{/* Inventory Section */}
{activeSection === 'inventory' && (
  <motion.section 
    className="inventory-section"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    <div className="section-header">
      <h2>Inventory Management</h2>
      <button className="primary-btn">+ Add Product</button>
    </div>

    <div className="inventory-grid">
      {inventoryItems.map((item, index) => (
        <motion.div 
          key={index}
          className={`inventory-item ${
            item.stock < 10 ? 'low-stock' : 
            item.stock < 50 ? 'medium-stock' : ''
          }`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <h4>{item.name}</h4>
          <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#666'}}>
            <span>Category: {item.category}</span>
            <span>Stock: {item.stock}/{item.total}</span>
          </div>
          <div className="stock-level">
            <motion.div 
              className="stock-fill"
              initial={{ width: 0 }}
              animate={{ width: `${(item.stock / item.total) * 100}%` }}
              transition={{ duration: 1, delay: index * 0.2 }}
              style={{
                background: item.stock < 10 ? '#f44336' : 
                           item.stock < 50 ? '#ff9800' : '#4caf50'
              }}
            ></motion.div>
          </div>
          <button className="primary-btn" style={{width: '100%', marginTop: '10px', padding: '8px'}}>
            {item.stock < 10 ? 'Urgent Restock' : 'Manage Stock'}
          </button>
        </motion.div>
      ))}
    </div>

    <div className="inventory-alerts">
      <h3>Stock Alerts</h3>
      <div className="alert-list">
        {inventoryAlerts.map((alert, index) => (
          <div key={index} className={`alert-item ${alert.type}`}>
            <div className="alert-icon">
              {alert.type === 'low' ? '⚠️' : '🔔'}
            </div>
            <div style={{flex: 1}}>
              <strong>{alert.product}</strong>
              <div>Only {alert.stock} units left (min: {alert.threshold})</div>
            </div>
            <button className="primary-btn" style={{padding: '5px 10px', fontSize: '12px'}}>
              Order Now
            </button>
          </div>
        ))}
      </div>
    </div>
  </motion.section>
)}

{/* Settings Section */}
{activeSection === 'settings' && (
  <motion.section 
    className="settings-section"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    <div className="section-header">
      <h2>System Settings</h2>
      <button className="primary-btn">Save Changes</button>
    </div>

    <div className="settings-grid">
      <div className="setting-card">
        <h4>Notification Preferences</h4>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '15px 0'}}>
          <span>Email Notifications</span>
          <label className="toggle-switch">
            <input type="checkbox" checked={settings.emailNotifications} onChange={() => {}} />
            <span className="toggle-slider"></span>
          </label>
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '15px 0'}}>
          <span>SMS Alerts</span>
          <label className="toggle-switch">
            <input type="checkbox" checked={settings.smsAlerts} onChange={() => {}} />
            <span className="toggle-slider"></span>
          </label>
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '15px 0'}}>
          <span>Auto Backup</span>
          <label className="toggle-switch">
            <input type="checkbox" checked={settings.autoBackup} onChange={() => {}} />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      <div className="setting-card">
        <h4>Security Settings</h4>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '15px 0'}}>
          <span>Two-Factor Authentication</span>
          <label className="toggle-switch">
            <input type="checkbox" checked={settings.twoFactorAuth} onChange={() => {}} />
            <span className="toggle-slider"></span>
          </label>
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '15px 0'}}>
          <span>Dark Mode</span>
          <label className="toggle-switch">
            <input type="checkbox" checked={settings.darkMode} onChange={() => {}} />
            <span className="toggle-slider"></span>
          </label>
        </div>
        <button className="primary-btn" style={{width: '100%', marginTop: '20px'}}>
          Change Password
        </button>
      </div>

      <div className="setting-card">
        <h4>System Information</h4>
        <div style={{margin: '15px 0'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', margin: '10px 0'}}>
            <span>Version</span>
            <span>v2.1.4</span>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', margin: '10px 0'}}>
            <span>Last Update</span>
            <span>2025-01-10</span>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', margin: '10px 0'}}>
            <span>Database Size</span>
            <span>245 MB</span>
          </div>
        </div>
      </div>
    </div>

    <div className="system-health">
      <h3 style={{gridColumn: '1 / -1'}}>System Health</h3>
      {systemStatus.map((service, index) => (
        <div key={index} className="health-card">
          <div className={`health-status status-${service.status}`}></div>
          <h5>{service.service}</h5>
          <div style={{fontSize: '14px', color: '#666'}}>Uptime: {service.uptime}</div>
        </div>
      ))}
    </div>
  </motion.section>
)}

        {/* Users Section */}
        {activeSection === 'users' && (
        <motion.section
            className="users-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <div className="section-header">
            <h2>User Management</h2>
            <button className="primary-btn" onClick={() => {
              setEditingUser(null);
              setUserFormData({
                first_name: '',
                last_name: '',
                email: '',
                role: 'customer',
                status: 'active'
              });
              setShowUserModal(true);
            }}>+ Add User</button>
            </div>

            <div className="users-grid">
            {loadingUsers ? (
                <div style={{textAlign: 'center', padding: '40px'}}>Loading users...</div>
            ) : users.length === 0 ? (
                <div style={{textAlign: 'center', padding: '40px'}}>No users found</div>
            ) : (
                users.map((user, index) => (
                    <div key={user.id || index} className="user-card">
                    <div className="user-avatar">
                        {user.name && user.name.split(' ').map(n => n[0]).join('') || user.email.charAt(0).toUpperCase()}
                    </div>
                    <h4>{user.name}</h4>
                    <p style={{color: '#666', margin: '5px 0'}}>{user.email}</p>
                    <div className={`user-role role-${user.role}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </div>
                    <div className={`user-status status-${user.status}`}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </div>
                    <p style={{fontSize: '12px', color: '#999', marginTop: '10px'}}>
                        Last active: {user.lastActive}
                    </p>
                    <div style={{display: 'flex', gap: '5px', marginTop: '15px'}}>
                        <button
                            className="primary-btn"
                            style={{flex: 1, padding: '8px', fontSize: '12px'}}
                            onClick={() => handleEditUser(user)}
                        >
                            Edit
                        </button>
                        <button
                            className="secondary-btn"
                            style={{flex: 1, padding: '8px', fontSize: '12px'}}
                            onClick={() => handleDeleteUser(user.id)}
                        >
                            Delete
                        </button>
                    </div>
                    </div>
                ))
            )}
            </div>

            {/* User Modal */}
            {showUserModal && (
                <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>{editingUser ? 'Edit User' : 'Add User'}</h3>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            handleSaveUser(userFormData);
                        }}>
                            <div style={{marginBottom: '15px'}}>
                                <label>First Name:</label>
                                <input
                                    type="text"
                                    value={userFormData.first_name}
                                    onChange={(e) => setUserFormData(prev => ({ ...prev, first_name: capitalizeName(e.target.value) }))}
                                    required
                                />
                            </div>
                            <div style={{marginBottom: '15px'}}>
                                <label>Last Name:</label>
                                <input
                                    type="text"
                                    value={userFormData.last_name}
                                    onChange={(e) => setUserFormData(prev => ({ ...prev, last_name: capitalizeName(e.target.value) }))}
                                    required
                                />
                            </div>
                            <div style={{marginBottom: '15px'}}>
                                <label>Email:</label>
                                <input
                                    type="email"
                                    value={userFormData.email}
                                    onChange={(e) => setUserFormData(prev => ({ ...prev, email: e.target.value.trim() }))}
                                    required
                                />
                            </div>
                            <div style={{marginBottom: '15px'}}>
                                <label>Role:</label>
                                <select
                                    value={userFormData.role}
                                    onChange={(e) => setUserFormData(prev => ({ ...prev, role: e.target.value }))}
                                    required
                                >
                                    <option value="customer">Customer</option>
                                    <option value="editor">Editor</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div style={{marginBottom: '15px'}}>
                                <label>Status:</label>
                                <select
                                    value={userFormData.status}
                                    onChange={(e) => setUserFormData(prev => ({ ...prev, status: e.target.value }))}
                                    required
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="suspended">Suspended</option>
                                </select>
                            </div>
                            <div style={{display: 'flex', gap: '10px'}}>
                                <button type="submit" className="primary-btn">Save</button>
                                <button type="button" className="secondary-btn" onClick={() => setShowUserModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </motion.section>
        )}

        {/* Finance Section */}
        {activeSection === 'finance' && (
        <motion.section 
            className="finance-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <div className="section-header">
            <h2>Financial Overview</h2>
            <button className="primary-btn">Download Report</button>
            </div>

            <div className="finance-metrics">
            <div className="finance-card">
                <h4>Total Revenue</h4>
                <div className="metric-value">${financeData.revenue.toLocaleString()}</div>
                <div className="finance-trend trend-positive">↑ {financeData.growth}%</div>
            </div>
            <div className="finance-card">
                <h4>Expenses</h4>
                <div className="metric-value">${financeData.expenses.toLocaleString()}</div>
                <div className="finance-trend trend-negative">↑ 8.2%</div>
            </div>
            <div className="finance-card">
                <h4>Net Profit</h4>
                <div className="metric-value">${financeData.profit.toLocaleString()}</div>
                <div className="finance-trend trend-positive">↑ 15.7%</div>
            </div>
            <div className="finance-card">
                <h4>Profit Margin</h4>
                <div className="metric-value">{((financeData.profit / financeData.revenue) * 100).toFixed(1)}%</div>
                <div className="finance-trend trend-positive">↑ 2.3%</div>
            </div>
            </div>

            <div className="charts-row">
            <div className="chart-card">
                <h3>Revenue Trend</h3>
                <LineChart data={lineChartData} />
            </div>
            <div className="chart-card">
                <h3>Expense Breakdown</h3>
                <div className="chart-container">
                {/* Pie chart would go here */}
                <div style={{textAlign: 'center', padding: '40px'}}>
                    <div style={{fontSize: '48px'}}>📊</div>
                    <p>Expense chart visualization</p>
                </div>
                </div>
            </div>
            </div>
        </motion.section>
        )}

        {/* Notifications Section */}
        {activeSection === 'notifications' && (
        <motion.section
            className="notifications-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <div className="section-header">
            <h2>Notifications Center</h2>
            <button className="primary-btn">Mark All Read</button>
            </div>

            <div className="notifications-list">
            <div className="notification-item unread">
                <div className="notification-icon">🔔</div>
                <div className="notification-content">
                <h4>Low Stock Alert</h4>
                <p>Premium Leather Jacket is running low on stock (12 units remaining)</p>
                <span className="notification-time">2 minutes ago</span>
                </div>
                <button className="notification-action">View</button>
            </div>
            <div className="notification-item">
                <div className="notification-icon">📦</div>
                <div className="notification-content">
                <h4>New Order Received</h4>
                <p>Order #IWX789012 has been placed for $247.50</p>
                <span className="notification-time">15 minutes ago</span>
                </div>
                <button className="notification-action">Process</button>
            </div>
            <div className="notification-item">
                <div className="notification-icon">👥</div>
                <div className="notification-content">
                <h4>New Customer Registration</h4>
                <p>Sarah Johnson has created a new account</p>
                <span className="notification-time">1 hour ago</span>
                </div>
                <button className="notification-action">Welcome</button>
            </div>
            </div>
        </motion.section>
        )}

        {/* Security Section */}
        {activeSection === 'security' && (
        <motion.section
            className="security-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <div className="section-header">
            <h2>Security Center</h2>
            <button className="primary-btn">Run Security Scan</button>
            </div>

            <div className="security-grid">
            <div className="security-card">
                <h4>Login Attempts</h4>
                <div className="security-metric">1,247</div>
                <p>Successful logins today</p>
                <div className="security-status safe">All Clear</div>
            </div>
            <div className="security-card">
                <h4>Failed Attempts</h4>
                <div className="security-metric">3</div>
                <p>Blocked suspicious attempts</p>
                <div className="security-status warning">Monitor</div>
            </div>
            <div className="security-card">
                <h4>Active Sessions</h4>
                <div className="security-metric">24</div>
                <p>Current active sessions</p>
                <div className="security-status safe">Normal</div>
            </div>
            <div className="security-card">
                <h4>Security Score</h4>
                <div className="security-metric">98%</div>
                <p>Overall security rating</p>
                <div className="security-status excellent">Excellent</div>
            </div>
            </div>

            <div className="recent-activity">
            <h3>Recent Security Events</h3>
            <div className="activity-list">
                <div className="activity-item">
                <span className="activity-time">10:30 AM</span>
                <span>Password changed for admin@iwx.com</span>
                </div>
                <div className="activity-item">
                <span className="activity-time">9:15 AM</span>
                <span>Two-factor authentication enabled</span>
                </div>
                <div className="activity-item">
                <span className="activity-time">8:45 AM</span>
                <span>New device login from Chrome on Windows</span>
                </div>
            </div>
            </div>
        </motion.section>
        )}

        {/* Integrations Section */}
        {activeSection === 'integrations' && (
        <motion.section
            className="integrations-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <div className="section-header">
            <h2>API Integrations</h2>
            <button className="primary-btn">+ Add Integration</button>
            </div>

            <div className="integrations-grid">
            <div className="integration-card active">
                <div className="integration-icon">💳</div>
                <h4>Stripe Payments</h4>
                <p>Payment processing integration</p>
                <div className="integration-status active">Connected</div>
                <button className="secondary-btn">Configure</button>
            </div>
            <div className="integration-card active">
                <div className="integration-icon">📧</div>
                <h4>SendGrid Email</h4>
                <p>Email delivery service</p>
                <div className="integration-status active">Connected</div>
                <button className="secondary-btn">Configure</button>
            </div>
            <div className="integration-card">
                <div className="integration-icon">📦</div>
                <h4>Shippo Shipping</h4>
                <p>Shipping and tracking</p>
                <div className="integration-status inactive">Not Connected</div>
                <button className="primary-btn">Connect</button>
            </div>
            <div className="integration-card">
                <div className="integration-icon">📊</div>
                <h4>Google Analytics</h4>
                <p>Website analytics</p>
                <div className="integration-status inactive">Not Connected</div>
                <button className="primary-btn">Connect</button>
            </div>
            </div>
        </motion.section>
        )}

        {/* Backups Section */}
        {activeSection === 'backups' && (
        <motion.section
            className="backups-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <div className="section-header">
            <h2>Data Backups</h2>
            <button className="primary-btn">Create Backup</button>
            </div>

            <div className="backup-stats">
            <div className="backup-stat-card">
                <div className="backup-stat-value">24</div>
                <div className="backup-stat-label">Total Backups</div>
            </div>
            <div className="backup-stat-card">
                <div className="backup-stat-value">2.4GB</div>
                <div className="backup-stat-label">Storage Used</div>
            </div>
            <div className="backup-stat-card">
                <div className="backup-stat-value">98.7%</div>
                <div className="backup-stat-label">Success Rate</div>
            </div>
            <div className="backup-stat-card">
                <div className="backup-stat-value">Daily</div>
                <div className="backup-stat-label">Auto Backup</div>
            </div>
            </div>

            <div className="recent-backups">
            <h3>Recent Backups</h3>
            <div className="backup-list">
                <div className="backup-item">
                <div className="backup-info">
                    <h4>Full System Backup</h4>
                    <p>Database + Files + Configuration</p>
                    <span className="backup-size">1.2GB</span>
                </div>
                <div className="backup-status success">Completed</div>
                <span className="backup-time">2 hours ago</span>
                <button className="secondary-btn">Download</button>
                </div>
                <div className="backup-item">
                <div className="backup-info">
                    <h4>Database Only</h4>
                    <p>All tables and data</p>
                    <span className="backup-size">856MB</span>
                </div>
                <div className="backup-status success">Completed</div>
                <span className="backup-time">1 day ago</span>
                <button className="secondary-btn">Download</button>
                </div>
            </div>
            </div>
        </motion.section>
        )}

        {/* Logs Section */}
        {activeSection === 'logs' && (
        <motion.section
            className="logs-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <div className="section-header">
            <h2>System Logs</h2>
            <div style={{display: 'flex', gap: '10px'}}>
                <select style={{padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd'}}>
                <option>All Logs</option>
                <option>Errors Only</option>
                <option>Warnings</option>
                <option>Info</option>
                </select>
                <button className="primary-btn">Export Logs</button>
            </div>
            </div>

            <div className="logs-container">
            <div className="log-entry error">
                <span className="log-time">14:32:15</span>
                <span className="log-level error">ERROR</span>
                <span className="log-message">Failed to connect to payment gateway</span>
            </div>
            <div className="log-entry warning">
                <span className="log-time">14:28:42</span>
                <span className="log-level warning">WARN</span>
                <span className="log-message">High memory usage detected (87%)</span>
            </div>
            <div className="log-entry info">
                <span className="log-time">14:25:18</span>
                <span className="log-level info">INFO</span>
                <span className="log-message">User admin@iwx.com logged in</span>
            </div>
            <div className="log-entry success">
                <span className="log-time">14:20:33</span>
                <span className="log-level success">SUCCESS</span>
                <span className="log-message">Order IWX789012 processed successfully</span>
            </div>
            </div>
        </motion.section>
        )}

        {/* Reports Section */}
        {activeSection === 'reports' && (
        <motion.section
            className="reports-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <div className="section-header">
            <h2>Reports & Analytics</h2>
            <button className="primary-btn">Generate New Report</button>
            </div>

            <div className="reports-grid">
            <div className="report-card">
                <div className="report-icon">📈</div>
                <h4>Sales Report</h4>
                <p>Detailed analysis of sales performance and trends</p>
                <div style={{fontSize: '12px', color: '#666', marginTop: '10px'}}>Last updated: Today</div>
            </div>
            <div className="report-card">
                <div className="report-icon">👥</div>
                <h4>Customer Insights</h4>
                <p>Customer behavior and demographic analysis</p>
                <div style={{fontSize: '12px', color: '#666', marginTop: '10px'}}>Last updated: 2 days ago</div>
            </div>
            <div className="report-card">
                <div className="report-icon">📊</div>
                <h4>Financial Summary</h4>
                <p>Revenue, expenses, and profit analysis</p>
                <div style={{fontSize: '12px', color: '#666', marginTop: '10px'}}>Last updated: 1 week ago</div>
            </div>
            <div className="report-card">
                <div className="report-icon">🛒</div>
                <h4>Inventory Report</h4>
                <p>Stock levels and inventory turnover analysis</p>
                <div style={{fontSize: '12px', color: '#666', marginTop: '10px'}}>Last updated: 3 days ago</div>
            </div>
            </div>

            <CalendarWidget />
        </motion.section>
        )}

        {/* Help Section */}
        {activeSection === 'help' && (
        <motion.section
            className="help-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <div className="section-header">
            <h2>Help & Support</h2>
            <button className="primary-btn">Contact Support</button>
            </div>

            <div className="support-grid">
            <div className="support-card">
                <div className="support-icon">📚</div>
                <h4>Documentation</h4>
                <p>Complete guide to using the admin dashboard</p>
            </div>
            <div className="support-card">
                <div className="support-icon">🎓</div>
                <h4>Tutorials</h4>
                <p>Step-by-step video tutorials</p>
            </div>
            <div className="support-card">
                <div className="support-icon">❓</div>
                <h4>FAQ</h4>
                <p>Frequently asked questions</p>
            </div>
            <div className="support-card">
                <div className="support-icon">💬</div>
                <h4>Live Chat</h4>
                <p>24/7 customer support</p>
            </div>
            </div>

            <div className="setting-card" style={{marginTop: '30px'}}>
            <h4>Quick Actions</h4>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '20px'}}>
                <button className="primary-btn" style={{padding: '10px'}}>Reset Password</button>
                <button className="primary-btn" style={{padding: '10px'}}>System Diagnostics</button>
                <button className="primary-btn" style={{padding: '10px'}}>Export Data</button>
                <button className="primary-btn" style={{padding: '10px'}}>Backup System</button>
            </div>
            </div>
        </motion.section>
        )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AdminDashboard;