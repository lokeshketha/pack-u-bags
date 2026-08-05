import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import './Trips.css';

const Trips = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="trips-body">
      {/* Mobile Navbar */}
      <nav className="navbar scrolled" style={{ zIndex: 1000 }}>
          <div className="nav-container">
              <Link to="/" className="logo">
                  <i className="fa-solid fa-suitcase-rolling"></i>
                  <span>PackSmart</span>
              </Link>
              <div className="nav-actions">
                  <button className="menu-toggle" onClick={toggleSidebar} style={{ display: 'none', background: 'none', border: 'none', color: 'var(--text-main)', fontSize: '1.5rem' }}>
                      <i className="fa-solid fa-bars"></i>
                  </button>
                  <Link to="/plan" className="btn btn-primary" style={{ display: window.innerWidth > 768 ? 'inline-block' : 'none' }}>
                    <i className="fa-solid fa-plus"></i> New Trip
                  </Link>
              </div>
          </div>
      </nav>

      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <main className="main-content">
        <header className="top-header">
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <button className="menu-toggle" onClick={toggleSidebar}>
                    <i className="fa-solid fa-bars"></i>
                </button>
                <div className="header-title">
                    <h2>My Trips</h2>
                    <p>Manage all your past and upcoming adventures.</p>
                </div>
            </div>
            <div className="header-actions">
                <Link to="/plan" className="btn btn-primary create-btn">
                    <i className="fa-solid fa-plus"></i> <span>Create New Trip</span>
                </Link>
            </div>
        </header>

        <div className="trips-container">
            <div className="recent-trips glass-card" style={{ padding: '2rem' }}>
                <div className="trip-list" style={{ gap: '1.5rem' }}>
                    <div className="trip-item">
                        <div className="trip-image" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=300&q=80')", width: '120px', height: '120px' }}>
                            <div className="trip-date">Oct 12, 2024</div>
                        </div>
                        <div className="trip-details">
                            <h4 style={{ fontSize: '1.3rem' }}>Goa, India</h4>
                            <p style={{ fontSize: '1rem' }}>Beach Vacation • 5 Days</p>
                            <div className="trip-progress">
                                <div className="progress-bar" style={{ maxWidth: '200px' }}>
                                    <div className="progress-fill" style={{ width: '100%', background: '#22c55e' }}></div>
                                </div>
                                <span>100% Packed</span>
                            </div>
                        </div>
                        <div className="trip-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                            <Link to="/list" className="btn btn-outline btn-sm"><i className="fa-solid fa-eye"></i> View List</Link>
                        </div>
                    </div>

                    <div className="trip-item">
                        <div className="trip-image" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=300&q=80')", width: '120px', height: '120px' }}>
                            <div className="trip-date">Nov 05, 2024</div>
                        </div>
                        <div className="trip-details">
                            <h4 style={{ fontSize: '1.3rem' }}>Bali, Indonesia</h4>
                            <p style={{ fontSize: '1rem' }}>Adventure • 10 Days</p>
                            <div className="trip-progress">
                                <div className="progress-bar" style={{ maxWidth: '200px' }}>
                                    <div className="progress-fill" style={{ width: '65%' }}></div>
                                </div>
                                <span>65% Packed</span>
                            </div>
                        </div>
                        <div className="trip-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                            <Link to="/list" className="btn btn-primary btn-sm"><i className="fa-solid fa-play"></i> Resume</Link>
                        </div>
                    </div>

                    <div className="trip-item">
                        <div className="trip-image" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=300&q=80')", width: '120px', height: '120px' }}>
                            <div className="trip-date">Dec 20, 2024</div>
                        </div>
                        <div className="trip-details">
                            <h4 style={{ fontSize: '1.3rem' }}>Manali, India</h4>
                            <p style={{ fontSize: '1rem' }}>Winter Sports • 7 Days</p>
                            <div className="trip-progress">
                                <div className="progress-bar" style={{ maxWidth: '200px' }}>
                                    <div className="progress-fill" style={{ width: '10%' }}></div>
                                </div>
                                <span>10% Packed</span>
                            </div>
                        </div>
                        <div className="trip-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                            <Link to="/list" className="btn btn-primary btn-sm"><i className="fa-solid fa-play"></i> Resume</Link>
                        </div>
                    </div>
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

export default Trips;
