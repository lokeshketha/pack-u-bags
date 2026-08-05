import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import './Signup.css';

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;
      
      await updateProfile(user, { displayName: name.trim() });

      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userName', name.trim());

      navigate('/dashboard');
    } catch (err) {
      console.error('Firebase Signup Error:', err);
      let msg = err.message;
      if (err.code === 'auth/email-already-in-use') {
        msg = 'This email is already registered. Please go to Sign in.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password is too weak. Please use at least 6 characters.';
      } else if (err.code === 'auth/unauthorized-domain') {
        msg = 'Domain not authorized in Firebase. Please add this domain in Firebase Console -> Auth -> Settings -> Authorized Domains.';
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
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

      navigate('/dashboard');
    } catch (err) {
      console.error('Google Sign-up Error:', err);
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
              <h2>Create Account</h2>
              <p className="login-subtitle">Join PackSmart for smarter, stress-free travel planning.</p>

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

              <form onSubmit={handleSignup}>
                  <div className="input-group">
                      <label htmlFor="name">Full Name</label>
                      <div className="input-wrapper">
                          <i className="fa-regular fa-user"></i>
                          <input 
                            type="text" 
                            id="name" 
                            placeholder="John Doe" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required 
                          />
                      </div>
                  </div>

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
                            placeholder="Create a strong password" 
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

                  <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
                    {loading ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Creating account...</> : 'Sign Up'}
                  </button>
              </form>

              <div className="divider">
                  <span>Or sign up with</span>
              </div>

              <div className="social-login">
                  <button 
                    type="button" 
                    className="btn btn-secondary social-btn" 
                    onClick={handleGoogleSignup}
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
