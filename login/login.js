import { auth } from "../firebase-config.js";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// PackSmart Login Page Script

document.addEventListener('DOMContentLoaded', () => {
    // Theme Initialization
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }

    const togglePasswordBtn = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('password');
    const loginForm = document.getElementById('login-form');

    // Toggle Password Visibility
    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Toggle Icon
            const icon = togglePasswordBtn.querySelector('i');
            if (type === 'text') {
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    }

    // Email/Password Login
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = loginForm.querySelector('.login-btn');
            const originalText = btn.innerHTML;
            
            btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Signing in...';
            btn.style.opacity = '0.8';
            btn.disabled = true;

            const email = document.getElementById('email').value.trim();
            const password = passwordInput.value;

            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                
                const displayName = user.displayName || email.split('@')[0];
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('userEmail', user.email);
                localStorage.setItem('userName', displayName);
                if (user.photoURL) {
                    localStorage.setItem('profilePhoto', user.photoURL);
                }

                btn.innerHTML = originalText;
                btn.style.opacity = '1';
                btn.disabled = false;
                
                window.location.href = '../dashboard/';
            } catch (error) {
                btn.innerHTML = originalText;
                btn.style.opacity = '1';
                btn.disabled = false;
                console.error('Firebase Auth Error:', error);
                
                let msg = error.message;
                if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                    msg = 'Invalid email or password. If you do not have an account, please sign up first.';
                } else if (error.code === 'auth/unauthorized-domain') {
                    msg = 'This domain is not authorized in your Firebase project. Please add your Vercel URL under Firebase Console -> Authentication -> Settings -> Authorized Domains.';
                } else if (error.code === 'auth/operation-not-allowed') {
                    msg = 'Email/Password sign-in is disabled. Please enable it in your Firebase Console under Authentication -> Sign-in method.';
                }
                alert(`Login Failed: ${msg}`);
            }
        });
    }

    // Google Sign-In
    const socialBtns = document.querySelectorAll('.social-login .social-btn');
    socialBtns.forEach(btn => {
        if (btn.textContent.includes('Google')) {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const provider = new GoogleAuthProvider();
                try {
                    const result = await signInWithPopup(auth, provider);
                    const user = result.user;
                    const displayName = user.displayName || user.email.split('@')[0];
                    localStorage.setItem('isAuthenticated', 'true');
                    localStorage.setItem('userEmail', user.email);
                    localStorage.setItem('userName', displayName);
                    if (user.photoURL) {
                        localStorage.setItem('profilePhoto', user.photoURL);
                    }
                    window.location.href = '../dashboard/';
                } catch (err) {
                    console.error('Google Sign-In Error:', err);
                    let msg = err.message;
                    if (err.code === 'auth/unauthorized-domain') {
                        msg = 'This domain is not authorized in your Firebase project. Please add your Vercel URL under Firebase Console -> Authentication -> Settings -> Authorized Domains.';
                    } else if (err.code === 'auth/popup-closed-by-user') {
                        return; // User closed popup, no need to alert
                    }
                    alert(`Google Sign-In Failed: ${msg}`);
                }
            });
        }
    });
});
