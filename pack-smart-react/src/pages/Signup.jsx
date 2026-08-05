import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Signup.css';

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="login-body">
      <div className="login-container">
          <Link to="/" className="logo login-logo">
              <i className="fa-solid fa-suitcase-rolling"></i>
              <span>PackSmart</span>
          </Link>

          <div className="glass-card login-card floating-animation" style={{ animationDelay: '0s' }}>
              <h2>Create Account</h2>
              <p className="login-subtitle">Join PackSmart for smarter, stress-free travel planning.</p>

              <form onSubmit={handleSignup}>
                  <div className="input-group">
                      <label htmlFor="name">Full Name</label>
                      <div className="input-wrapper">
                          <i className="fa-regular fa-user"></i>
                          <input type="text" id="name" placeholder="John Doe" required />
                      </div>
                  </div>

                  <div className="input-group">
                      <label htmlFor="email">Email</label>
                      <div className="input-wrapper">
                          <i className="fa-regular fa-envelope"></i>
                          <input type="email" id="email" placeholder="name@example.com" required />
                      </div>
                  </div>

                  <div className="input-group">
                      <label htmlFor="password">Password</label>
                      <div className="input-wrapper">
                          <i className="fa-solid fa-lock"></i>
                          <input 
                            type={showPassword ? "text" : "password"} 
                            id="password" 
                            placeholder="Create a strong password" 
                            required 
                          />
                          <button 
                            type="button" 
                            className="toggle-password" 
                            onClick={() => setShowPassword(!showPassword)}
                          >
                              <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                          </button>
                      </div>
                  </div>

                  <button type="submit" className="btn btn-primary login-btn">Sign Up</button>
              </form>

              <div className="divider">
                  <span>Or sign up with</span>
              </div>

              <div className="social-login">
                  <button className="btn btn-secondary social-btn">
                      <i className="fa-brands fa-google"></i> Google
                  </button>
                  <button className="btn btn-secondary social-btn">
                      <i className="fa-brands fa-github"></i> GitHub
                  </button>
              </div>

              <p className="signup-prompt">
                  Already have an account? <Link to="/login">Sign in</Link>
              </p>
          </div>
          
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
      </div>
    </div>
  );
};

export default Signup;
