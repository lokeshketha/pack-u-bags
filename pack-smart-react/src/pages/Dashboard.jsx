import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import './Dashboard.css';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState(localStorage.getItem('userName') || 'John Doe');

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'upcoming',
      icon: 'fa-plane',
      color: '#0ea5e9',
      bg: 'rgba(14, 165, 233, 0.1)',
      text: '<strong>Upcoming Trip:</strong> Bali is just 3 days away! Finish packing.',
      time: '2 hours ago',
      unread: true
    },
    {
      id: 2,
      type: 'complete',
      icon: 'fa-check',
      color: '#22c55e',
      bg: 'rgba(34, 197, 94, 0.1)',
      text: '<strong>List Complete:</strong> You fully packed for Goa. Great job!',
      time: '1 day ago',
      unread: true
    }
  ]);

  useEffect(() => {
    const handleUpdate = () => {
      setUserName(localStorage.getItem('userName') || 'John Doe');
    };
    window.addEventListener('profileUpdated', handleUpdate);
    return () => window.removeEventListener('profileUpdated', handleUpdate);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const deleteNotification = (e, id) => {
    e.stopPropagation();
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const firstName = userName.split(' ')[0];
  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="dashboard-body">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <main className="main-content">
        <header className="top-header">
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <button className="menu-toggle" onClick={toggleSidebar}>
                    <i className="fa-solid fa-bars"></i>
                </button>
                <div className="header-title">
                    <h2>Welcome back, {firstName}! 👋</h2>
                    <p>Here is your travel overview.</p>
                </div>
            </div>
            
            <div className="search-container">
                <i className="fa-solid fa-search search-icon"></i>
                <input type="text" className="search-input" placeholder="Search trips..." />
            </div>

            <div className="header-actions" style={{ position: 'relative' }}>
                <button className="icon-btn notification-btn" onClick={toggleNotifications}>
                    <i className="fa-regular fa-bell"></i>
                    {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
                </button>
                
                {showNotifications && (
                    <div className="notifications-dropdown glass-card">
                        <div className="notifications-header">
                            <h4>Notifications</h4>
                            {notifications.length > 0 && <button className="mark-read-btn" onClick={markAllAsRead}>Mark all as read</button>}
                        </div>
                        <div className="notification-list">
                            {notifications.length === 0 ? (
                                <p style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>No new notifications</p>
                            ) : (
                                notifications.map(notif => (
                                    <div key={notif.id} className={`notification-item ${notif.unread ? 'unread' : ''}`}>
                                        <div className="notif-icon" style={{ background: notif.bg, color: notif.color }}>
                                            <i className={`fa-solid ${notif.icon}`}></i>
                                        </div>
                                        <div className="notif-content">
                                            <p dangerouslySetInnerHTML={{ __html: notif.text }}></p>
                                            <span className="notif-time">{notif.time}</span>
                                        </div>
                                        <button className="delete-notif-btn" onClick={(e) => deleteNotification(e, notif.id)} title="Delete notification">
                                            <i className="fa-solid fa-xmark"></i>
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
                
                <Link to="/plan" className="btn btn-primary create-btn">
                    <i className="fa-solid fa-plus"></i> <span>Create New Trip</span>
                </Link>
            </div>
        </header>

        <div className="stats-grid">
            <div className="stat-card glass-card floating-animation" style={{ animationDelay: '0s' }}>
                <div className="stat-icon" style={{ color: '#0ea5e9', background: 'rgba(14, 165, 233, 0.1)' }}>
                    <i className="fa-solid fa-route"></i>
                </div>
                <div className="stat-info">
                    <h3>12</h3>
                    <p>Total Trips</p>
                </div>
            </div>
            
            <div className="stat-card glass-card floating-animation" style={{ animationDelay: '0.2s' }}>
                <div className="stat-icon" style={{ color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.1)' }}>
                    <i className="fa-solid fa-plane-departure"></i>
                </div>
                <div className="stat-info">
                    <h3>2</h3>
                    <p>Upcoming Trips</p>
                </div>
            </div>

            <div className="stat-card glass-card floating-animation" style={{ animationDelay: '0.4s' }}>
                <div className="stat-icon" style={{ color: '#22c55e', background: 'rgba(34, 197, 94, 0.1)' }}>
                    <i className="fa-solid fa-shirt"></i>
                </div>
                <div className="stat-info">
                    <h3>145</h3>
                    <p>Packed Items</p>
                </div>
            </div>

            <div className="stat-card glass-card floating-animation" style={{ animationDelay: '0.6s' }}>
                <div className="stat-icon" style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)' }}>
                    <i className="fa-solid fa-chart-pie"></i>
                </div>
                <div className="stat-info">
                    <h3>85%</h3>
                    <p>Completion Avg</p>
                </div>
            </div>
        </div>

        <div className="dashboard-content">
            <div className="recent-trips glass-card">
                <div className="card-header">
                    <h3>Recent & Upcoming Trips</h3>
                    <a href="#" className="view-all">View All</a>
                </div>
                
                <div className="trip-list">
                    <div className="trip-item">
                        <div className="trip-image" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=150&q=80')" }}>
                            <div className="trip-date">Oct 12</div>
                        </div>
                        <div className="trip-details">
                            <h4>Goa, India</h4>
                            <p>Beach Vacation • 5 Days</p>
                            <div className="trip-progress">
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: '100%', background: '#22c55e' }}></div>
                                </div>
                                <span>100% Packed</span>
                            </div>
                        </div>
                        <div className="trip-actions">
                            <button className="btn btn-outline btn-sm">View List</button>
                        </div>
                    </div>

                    <div className="trip-item">
                        <div className="trip-image" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=150&q=80')" }}>
                            <div className="trip-date">Nov 05</div>
                        </div>
                        <div className="trip-details">
                            <h4>Bali, Indonesia</h4>
                            <p>Adventure • 10 Days</p>
                            <div className="trip-progress">
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: '65%' }}></div>
                                </div>
                                <span>65% Packed</span>
                            </div>
                        </div>
                        <div className="trip-actions">
                            <button className="btn btn-primary btn-sm">Resume</button>
                        </div>
                    </div>

                    <div className="trip-item">
                        <div className="trip-image" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=150&q=80')" }}>
                            <div className="trip-date">Dec 20</div>
                        </div>
                        <div className="trip-details">
                            <h4>Manali, India</h4>
                            <p>Winter Sports • 7 Days</p>
                            <div className="trip-progress">
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: '10%' }}></div>
                                </div>
                                <span>10% Packed</span>
                            </div>
                        </div>
                        <div className="trip-actions">
                            <button className="btn btn-primary btn-sm">Resume</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="chart-section glass-card">
                <div className="card-header">
                    <h3>Packing Analytics</h3>
                </div>
                <div className="chart-container">
                    <p style={{ color: 'var(--text-muted)' }}>Chart.js canvas will go here</p>
                </div>
            </div>
        </div>
      </main>

      {/* Decorative Elements */}
      <div className="blob blob-1" style={{ top: '-50px', left: '-50px', width: '400px', height: '400px', opacity: 0.3 }}></div>
      <div className="blob blob-2" style={{ bottom: '-100px', right: '-50px', width: '500px', height: '500px', opacity: 0.3 }}></div>
    </div>
  );
};

export default Dashboard;
