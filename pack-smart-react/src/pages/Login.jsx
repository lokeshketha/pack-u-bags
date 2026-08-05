import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import './Login.css';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;
      
      const displayName = user.displayName || user.email.split('@')[0];
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userName', displayName);
      if (user.photoURL) {
        localStorage.setItem('profilePhoto', user.photoURL);
      }

      navigate(from, { replace: true });
    } catch (err) {
      console.error('Firebase Login Error:', err);
      let msg = err.message;
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        msg = 'Invalid email or password. Please check your credentials or sign up.';
      } else if (err.code === 'auth/unauthorized-domain') {
        msg = 'Domain not authorized in Firebase. Please add this domain in Firebase Console -> Auth -> Settings -> Authorized Domains.';
      } else if (err.code === 'auth/operation-not-allowed') {
        msg = 'Email/Password login is not enabled in Firebase Console.';
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const displayName = user.displayName || user.email.split('@')[0];
      
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userName', displayName);
      if (user.photoURL) {
        localStorage.setItem('profilePhoto', user.photoURL);
      }

      navigate(from, { replace: true });
    } catch (err) {
      console.error('Google Login Error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        let msg = err.message;
        if (err.code === 'auth/unauthorized-domain') {
          msg = 'Domain not authorized in Firebase. Please add this domain in Firebase Console -> Auth -> Settings -> Authorized Domains.';
        }
        setErrorMsg(msg);
      }
    } finally {
      setLoading(false);
    }
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

              {errorMsg && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid #ef4444',
                  color: '#fca5a5',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  marginBottom: '1rem'
                }}>
                  <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '6px' }}></i>
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleLogin}>
                  <div className="input-group">
                      <label htmlFor="email">Email</label>
                      <div className="input-wrapper">
                          <i className="fa-regular fa-envelope"></i>
                          <input 
                            type="email" 
                            id="email" 
                            placeholder="name@example.com" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                          />
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
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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

                  <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
                    {loading ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Signing in...</> : 'Sign In'}
                  </button>
              </form>

              <div className="divider">
                  <span>Or continue with</span>
              </div>

              <div className="social-login">
                  <button 
                    type="button" 
                    className="btn btn-secondary social-btn" 
                    onClick={handleGoogleLogin}
                    disabled={loading}
                  >
                      <i className="fa-brands fa-google"></i> Google
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary social-btn" 
                    disabled={loading}
                    onClick={() => alert("GitHub sign-in is not configured yet. Please use Email or Google.")}
                  >
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
