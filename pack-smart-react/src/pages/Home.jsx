import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Home = () => {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="hero" id="home">
          <div className="hero-content">
            <div className="badge">✨ New: AI Trip Planner</div>
            <h1 className="hero-title">Pack Smarter,<br/><span className="gradient-text">Travel Better</span></h1>
            <p className="hero-subtitle">
                AI-generated packing lists based on destination, weather, and trip type. Never forget an essential item again.
            </p>
            <div className="hero-buttons">
                <Link to="/plan" className="btn btn-primary">Start Packing <i className="fa-solid fa-arrow-right"></i></Link>
                <a href="#" className="btn btn-secondary"><i className="fa-solid fa-play"></i> Watch Demo</a>
            </div>
          </div>
          <div className="hero-visual">
            <div className="glass-card mockup-card floating-animation" style={{ animationDelay: '0s' }}>
                <div className="mockup-header">
                    <div className="mockup-dest">
                        <i className="fa-solid fa-location-dot"></i> Bali, Indonesia
                    </div>
                    <div className="mockup-weather">
                        <i className="fa-solid fa-sun"></i> 28°C
                    </div>
                </div>
                <div className="progress-container">
                    <div className="progress-info">
                        <span>Packing Progress</span>
                        <span>45%</span>
                    </div>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: '45%' }}></div>
                    </div>
                </div>
                <ul className="mockup-list">
                    <li className="checked"><i className="fa-regular fa-circle-check"></i> Passport & ID</li>
                    <li className="checked"><i className="fa-regular fa-circle-check"></i> Swimwear (x3)</li>
                    <li><i className="fa-regular fa-circle"></i> Sunscreen SPF 50+</li>
                    <li><i className="fa-regular fa-circle"></i> Universal Adapter</li>
                    <li><i className="fa-regular fa-circle"></i> Snorkeling Gear</li>
                </ul>
            </div>
            {/* Decorative Blobs */}
            <div className="blob blob-1"></div>
            <div className="blob blob-2"></div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features" id="features">
            <div className="section-header">
                <h2>Why Choose PackSmart?</h2>
                <p>Everything you need to pack efficiently and travel with peace of mind.</p>
            </div>
            <div className="features-grid">
                <div className="glass-card feature-card">
                    <div className="feature-icon gradient-bg">
                        <i className="fa-solid fa-robot"></i>
                    </div>
                    <h3>AI-Powered Lists</h3>
                    <p>Our intelligent system generates personalized packing lists based on your specific destination, travel dates, and trip type.</p>
                </div>
                <div className="glass-card feature-card">
                    <div className="feature-icon gradient-bg">
                        <i className="fa-solid fa-cloud-sun"></i>
                    </div>
                    <h3>Weather Integration</h3>
                    <p>Real-time historical weather data ensures you're packing exactly what you need for the conditions you'll face.</p>
                </div>
                <div className="glass-card feature-card">
                    <div className="feature-icon gradient-bg">
                        <i className="fa-solid fa-users-gear"></i>
                    </div>
                    <h3>Collaborative Packing</h3>
                    <p>Share lists with family or travel companions. Sync progress in real-time so nothing gets packed twice or forgotten.</p>
                </div>
            </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
            <div className="footer-brand">
                <div className="logo">
                    <i className="fa-solid fa-suitcase-rolling"></i>
                    <span>PackSmart</span>
                </div>
                <p>Your intelligent travel companion for stress-free packing and planning.</p>
                <div className="social-links">
                    <a href="#"><i className="fa-brands fa-twitter"></i></a>
                    <a href="#"><i className="fa-brands fa-instagram"></i></a>
                    <a href="#"><i className="fa-brands fa-tiktok"></i></a>
                </div>
            </div>
        </div>
        <div className="footer-bottom">
            <p>&copy; 2026 PackSmart. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
};

export default Home;
