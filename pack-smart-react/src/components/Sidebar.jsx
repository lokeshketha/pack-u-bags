import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const [userName, setUserName] = useState(localStorage.getItem('userName') || 'John Doe');
  const [profilePhoto, setProfilePhoto] = useState(localStorage.getItem('profilePhoto') || '');

  useEffect(() => {
    const handleUpdate = () => {
      setUserName(localStorage.getItem('userName') || 'John Doe');
      setProfilePhoto(localStorage.getItem('profilePhoto') || '');
    };
    window.addEventListener('profileUpdated', handleUpdate);
    return () => window.removeEventListener('profileUpdated', handleUpdate);
  }, []);
  
  return (
    <aside className={`sidebar ${isOpen ? 'active' : ''}`} id="sidebar">
      <div className="sidebar-header">
        <Link to="/" className="logo">
          <i className="fa-solid fa-suitcase-rolling"></i>
          <span>PackSmart</span>
        </Link>
        <button className="close-sidebar" onClick={toggleSidebar}>
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>
      
      <div className="user-profile" style={{cursor: 'pointer', transition: 'var(--transition)'}}>
        <div className="avatar">
          <img src={profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=6366f1&color=fff`} alt="User Avatar" />
        </div>
        <div className="user-info">
          <h4>{userName}</h4>
          <span>Pro Member</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <Link to="/dashboard" className={`nav-item ${currentPath === '/dashboard' ? 'active' : ''}`}>
          <i className="fa-solid fa-border-all"></i>
          <span>Dashboard</span>
        </Link>
        <Link to="/trips" className={`nav-item ${currentPath === '/trips' ? 'active' : ''}`}>
          <i className="fa-solid fa-plane"></i>
          <span>My Trips</span>
        </Link>
        <Link to="/list" className={`nav-item ${currentPath === '/list' ? 'active' : ''}`}>
          <i className="fa-solid fa-list-check"></i>
          <span>Packing Lists</span>
        </Link>
        <Link to="/settings" className={`nav-item ${currentPath === '/settings' ? 'active' : ''}`}>
          <i className="fa-solid fa-gear"></i>
          <span>Settings</span>
        </Link>
      </nav>

      <div className="sidebar-footer">
        <Link 
          to="/login" 
          className="nav-item logout"
          onClick={() => localStorage.removeItem('isAuthenticated')}
        >
          <i className="fa-solid fa-arrow-right-from-bracket"></i>
          <span>Logout</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
