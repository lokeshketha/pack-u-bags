import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleLogin = (e) => {
    e.preventDefault();
    // Simulate login
    localStorage.setItem('isAuthenticated', 'true');
    navigate(from, { replace: true });
  };

  return (
    <div className="login-body">
      <div className="login-container">
          <Link to="/" className="logo login-logo">
              <i className="fa-solid fa-suitcase-rolling"></i>
              <span>PackSmart</span>
          </Link>

          <div className="glass-card login-card floating-animation" style={{ animationDelay: '0s' }}>
              <h2>Welcome Back</h2>
              <p className="login-subtitle">Sign in to access your smart packing lists.</p>

              <form onSubmit={handleLogin}>
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
                            placeholder="••••••••" 
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

                  <div className="login-options">
                      <label className="remember-me">
                          <input type="checkbox" id="remember" />
                          <span>Remember me</span>
                      </label>
                      <a href="#" className="forgot-password">Forgot password?</a>
                  </div>

                  <button type="submit" className="btn btn-primary login-btn">Sign In</button>
              </form>

              <div className="divider">
                  <span>Or continue with</span>
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
                  Don't have an account? <Link to="/signup">Sign up</Link>
              </p>
          </div>
          
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
      </div>
    </div>
  );
};

export default Login;
