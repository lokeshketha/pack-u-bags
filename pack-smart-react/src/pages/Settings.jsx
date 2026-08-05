import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useTheme } from '../context/ThemeContext';
import './Settings.css';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  const [userName, setUserName] = useState(localStorage.getItem('userName') || 'John Doe');
  const [profilePhoto, setProfilePhoto] = useState(localStorage.getItem('profilePhoto') || '');

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const MAX_WIDTH = 200;
          const MAX_HEIGHT = 200;
          let { width, height } = img;
          if (width > height) {
            if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
          } else {
            if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
          }
          canvas.width = width; canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setProfilePhoto(dataUrl);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = () => {
    localStorage.setItem('userName', userName);
    if (profilePhoto) {
      try {
        localStorage.setItem('profilePhoto', profilePhoto);
      } catch (err) {
        alert('Image is too large to save. Please choose a smaller image.');
      }
    }
    window.dispatchEvent(new Event('profileUpdated'));
    alert('Profile saved!');
  };

  return (
    <div className="settings-body">
      {/* Mobile Navbar for Settings */}
      <nav className="navbar scrolled" style={{ zIndex: 1000 }}>
          <div className="nav-container">
              <Link to="/dashboard" className="logo">
                  <i className="fa-solid fa-suitcase-rolling"></i>
                  <span>PackSmart</span>
              </Link>
              <div className="nav-actions">
                  <button className="menu-toggle" onClick={toggleSidebar} style={{ display: 'none', background: 'none', border: 'none', color: 'var(--text-main)', fontSize: '1.5rem' }}>
                      <i className="fa-solid fa-bars"></i>
                  </button>
                  <Link to="/dashboard" className="btn btn-outline" style={{ display: window.innerWidth > 768 ? 'inline-block' : 'none' }}>
                    <i className="fa-solid fa-arrow-left"></i> Dashboard
                  </Link>
              </div>
          </div>
      </nav>

      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="settings-container">
          <div className="settings-header text-center">
              <h2>Account Settings</h2>
              <p style={{ color: 'var(--text-muted)' }}>Manage your profile, preferences, and security.</p>
          </div>

          <div className="settings-layout">
              
              <div className="settings-sidebar floating-animation" style={{ animationDelay: '0s' }}>
                  <ul className="settings-nav">
                      <li className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
                        <i className="fa-solid fa-user"></i> Profile
                      </li>
                      <li className={activeTab === 'preferences' ? 'active' : ''} onClick={() => setActiveTab('preferences')}>
                        <i className="fa-solid fa-sliders"></i> Preferences
                      </li>
                      <li className={activeTab === 'travel' ? 'active' : ''} onClick={() => setActiveTab('travel')}>
                        <i className="fa-solid fa-plane"></i> Travel Preferences
                      </li>
                      <li className={activeTab === 'security' ? 'active' : ''} onClick={() => setActiveTab('security')}>
                        <i className="fa-solid fa-shield-halved"></i> Security
                      </li>
                  </ul>
              </div>

              <div className="settings-content">
                  
                  {activeTab === 'profile' && (
                    <section className="settings-section active glass-card">
                        <h3>Profile Information</h3>
                        
                        <div className="avatar-section">
                            <div className="avatar-wrapper">
                                <img src={profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=6366f1&color=fff&size=100`} alt="Avatar" />
                                <input type="file" id="avatar-upload" accept="image/jpeg, image/png, image/gif" style={{ display: 'none' }} onChange={handleAvatarChange} />
                                <button className="avatar-edit-btn" title="Change Avatar" onClick={() => document.getElementById('avatar-upload').click()}><i className="fa-solid fa-camera"></i></button>
                            </div>
                            <div className="avatar-info">
                                <h4>Profile Picture</h4>
                                <p>JPG, GIF or PNG. Max size of 2MB.</p>
                            </div>
                        </div>

                        <form className="settings-form" onSubmit={e => e.preventDefault()}>
                            <div className="form-row">
                                <div className="input-group">
                                    <label>Full Name</label>
                                    <div className="input-wrapper">
                                        <i className="fa-solid fa-user"></i>
                                        <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label>Email Address</label>
                                    <div className="input-wrapper">
                                        <i className="fa-solid fa-envelope"></i>
                                        <input type="email" defaultValue="john@example.com" />
                                    </div>
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn btn-primary" onClick={saveProfile}>Save Changes</button>
                            </div>
                        </form>
                    </section>
                  )}

                  {activeTab === 'preferences' && (
                    <section className="settings-section active glass-card">
                        <h3>App Preferences</h3>
                        
                        <div className="preference-item">
                            <div className="pref-info">
                                <h4>Theme Mode</h4>
                                <p>Choose your preferred interface theme.</p>
                            </div>
                            <div className="theme-toggles">
                                <label className={`theme-option ${theme === 'dark' ? 'active' : ''}`} onClick={() => theme !== 'dark' && toggleTheme()}>
                                    <i className="fa-solid fa-moon"></i>
                                    <span>Dark</span>
                                </label>
                                <label className={`theme-option ${theme === 'light' ? 'active' : ''}`} onClick={() => theme !== 'light' && toggleTheme()}>
                                    <i className="fa-solid fa-sun"></i>
                                    <span>Light</span>
                                </label>
                            </div>
                        </div>

                        <div className="preference-item">
                            <div className="pref-info">
                                <h4>Push Notifications</h4>
                                <p>Receive alerts for upcoming trips and packing reminders.</p>
                            </div>
                            <label className="switch">
                                <input type="checkbox" defaultChecked />
                                <span className="slider round"></span>
                            </label>
                        </div>

                        <div className="preference-item">
                            <div className="pref-info">
                                <h4>Email Notifications</h4>
                                <p>Receive marketing emails and feature updates.</p>
                            </div>
                            <label className="switch">
                                <input type="checkbox" />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </section>
                  )}

                  {activeTab === 'travel' && (
                    <section className="settings-section active glass-card">
                        <h3>Travel Preferences</h3>
                        <p className="section-desc" style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>These settings will be used as defaults for new packing lists.</p>
                        
                        <form className="settings-form" onSubmit={e => e.preventDefault()}>
                            <div className="input-group">
                                <label>Preferred Trip Type</label>
                                <div className="input-wrapper select-wrapper">
                                    <i className="fa-solid fa-umbrella-beach"></i>
                                    <select className="custom-select" defaultValue="beach">
                                        <option value="beach">Beach Holiday</option>
                                        <option value="adventure">Adventure & Trekking</option>
                                        <option value="business">Business Trip</option>
                                        <option value="family">Family Vacation</option>
                                        <option value="camping">Camping</option>
                                    </select>
                                </div>
                            </div>

                            <div className="input-group">
                                <label>Default Traveler Count</label>
                                <div className="input-wrapper">
                                    <i className="fa-solid fa-user-group"></i>
                                    <input type="number" defaultValue="2" min="1" max="20" />
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn btn-primary">Save Defaults</button>
                            </div>
                        </form>
                    </section>
                  )}

                  {activeTab === 'security' && (
                    <section className="settings-section active glass-card">
                        <h3>Security</h3>
                        
                        <div className="preference-item security-item" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                            <div className="pref-info">
                                <h4>Two-Factor Authentication (2FA)</h4>
                                <p>Add an extra layer of security to your account.</p>
                            </div>
                            <button className="btn btn-outline btn-sm">Enable 2FA</button>
                        </div>

                        <div className="password-change-box">
                            <h4 style={{ marginBottom: '1.5rem' }}>Change Password</h4>
                            <form className="settings-form" onSubmit={e => e.preventDefault()}>
                                <div className="input-group">
                                    <label>Current Password</label>
                                    <div className="input-wrapper">
                                        <i className="fa-solid fa-lock"></i>
                                        <input type="password" placeholder="Enter current password" />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label>New Password</label>
                                    <div className="input-wrapper">
                                        <i className="fa-solid fa-key"></i>
                                        <input type="password" placeholder="Enter new password" />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label>Confirm New Password</label>
                                    <div className="input-wrapper">
                                        <i className="fa-solid fa-key"></i>
                                        <input type="password" placeholder="Confirm new password" />
                                    </div>
                                </div>
                                <div className="form-actions" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                                    <button type="button" className="btn btn-primary">Update Password</button>
                                </div>
                            </form>
                        </div>
                    </section>
                  )}

              </div>
          </div>
      </div>
      
      <div className="blob blob-1" style={{ top: '-50px', right: '-50px', width: '400px', height: '400px', opacity: 0.2 }}></div>
      <div className="blob blob-2" style={{ bottom: '-150px', left: '-100px', width: '500px', height: '500px', opacity: 0.2 }}></div>
    </div>
  );
};

export default Settings;
