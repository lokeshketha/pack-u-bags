import { auth } from "../firebase-config.js";
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// PackSmart Signup Page Script

document.addEventListener('DOMContentLoaded', () => {
    // Theme Initialization
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }

    const signupForm = document.getElementById('signup-form');
    const fullnameInput = document.getElementById('fullname');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirm-password');
    const termsInput = document.getElementById('terms');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const strengthFill = document.getElementById('strength-fill');
    const strengthText = document.getElementById('strength-text');

    // Toggle Password Visibility
    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            // Optionally toggle confirm password as well for convenience
            confirmInput.setAttribute('type', type);
            
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

    // Password Strength Logic
    passwordInput.addEventListener('input', () => {
        const val = passwordInput.value;
        let strength = 0;
        
        if (val.length >= 8) strength += 25;
        if (val.match(/[A-Z]/)) strength += 25;
        if (val.match(/[0-9]/)) strength += 25;
        if (val.match(/[^a-zA-Z0-9]/)) strength += 25;

        strengthFill.style.width = strength + '%';

        if (val.length === 0) {
            strengthFill.style.width = '0%';
            strengthText.textContent = 'Strength';
            strengthFill.style.backgroundColor = 'transparent';
        } else if (strength <= 25) {
            strengthFill.style.backgroundColor = '#ef4444'; // Red - Weak
            strengthText.textContent = 'Weak';
        } else if (strength <= 50) {
            strengthFill.style.backgroundColor = '#eab308'; // Yellow - Fair
            strengthText.textContent = 'Fair';
        } else if (strength <= 75) {
            strengthFill.style.backgroundColor = '#3b82f6'; // Blue - Good
            strengthText.textContent = 'Good';
        } else {
            strengthFill.style.backgroundColor = '#22c55e'; // Green - Strong
            strengthText.textContent = 'Strong';
        }
    });

    // Validation Functions
    const showError = (input, message, errorId) => {
        const formGroup = input.closest('.input-group') || input.parentElement;
        if(formGroup.classList.contains('input-group')) {
            formGroup.classList.add('error');
        }
        const errorEl = document.getElementById(errorId);
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
        }
    };

    const clearError = (input, errorId) => {
        const formGroup = input.closest('.input-group') || input.parentElement;
        if(formGroup.classList.contains('input-group')) {
            formGroup.classList.remove('error');
        }
        const errorEl = document.getElementById(errorId);
        if (errorEl) {
            errorEl.style.display = 'none';
        }
    };

    // Form Submit Handler
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        let isValid = true;

        // Reset previous errors
        clearError(fullnameInput, 'name-error');
        clearError(emailInput, 'email-error');
        clearError(passwordInput, 'password-error');
        clearError(confirmInput, 'confirm-error');
        document.getElementById('terms-error').style.display = 'none';

        // Validate Full Name
        if (fullnameInput.value.trim() === '') {
            showError(fullnameInput, 'Full name is required', 'name-error');
            isValid = false;
        }

        // Validate Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value.trim())) {
            showError(emailInput, 'Please enter a valid email address', 'email-error');
            isValid = false;
        }

        // Validate Password length
        if (passwordInput.value.length < 8) {
            showError(passwordInput, 'Password must be at least 8 characters long', 'password-error');
            isValid = false;
        }

        // Validate Confirm Password
        if (passwordInput.value !== confirmInput.value) {
            showError(confirmInput, 'Passwords do not match', 'confirm-error');
            isValid = false;
        }

        // Validate Terms
        if (!termsInput.checked) {
            document.getElementById('terms-error').textContent = 'You must agree to the Terms & Conditions';
            document.getElementById('terms-error').style.display = 'block';
            isValid = false;
        }

        if (isValid) {
            const btn = document.getElementById('signup-btn');
            const originalText = btn.innerHTML;
            
            btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Creating account...';
            btn.style.opacity = '0.8';
            btn.disabled = true;

            const name = fullnameInput.value.trim();
            const email = emailInput.value.trim();
            const password = passwordInput.value;

            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                
                await updateProfile(user, { displayName: name });

                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('userEmail', email);
                localStorage.setItem('userName', name);

                btn.innerHTML = originalText;
                btn.style.opacity = '1';
                btn.disabled = false;
                
                window.location.href = '../dashboard/';
            } catch (error) {
                btn.innerHTML = originalText;
                btn.style.opacity = '1';
                btn.disabled = false;
                console.error('Signup Error:', error);

                let msg = error.message;
                if (error.code === 'auth/email-already-in-use') {
                    msg = 'This email is already registered. Please go to Login.';
                } else if (error.code === 'auth/weak-password') {
                    msg = 'Password is too weak. Please use a stronger password.';
                } else if (error.code === 'auth/unauthorized-domain') {
                    msg = 'This domain is not authorized in your Firebase project. Please add your Vercel URL under Firebase Console -> Authentication -> Settings -> Authorized Domains.';
                }
                alert(`Signup Failed: ${msg}`);
            }
        }
    });

    // Google Sign-Up
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
                    console.error('Google Sign-Up Error:', err);
                    let msg = err.message;
                    if (err.code === 'auth/unauthorized-domain') {
                        msg = 'This domain is not authorized in your Firebase project. Please add your Vercel URL under Firebase Console -> Authentication -> Settings -> Authorized Domains.';
                    } else if (err.code === 'auth/popup-closed-by-user') {
                        return;
                    }
                    alert(`Google Sign-Up Failed: ${msg}`);
                }
            });
        }
    });
});
