// PackSmart Settings Logic

document.addEventListener('DOMContentLoaded', () => {

    // Sidebar Navigation Logic
    const navItems = document.querySelectorAll('.settings-nav li');
    const sections = document.querySelectorAll('.settings-section');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active classes
            navItems.forEach(nav => nav.classList.remove('active'));
            sections.forEach(sec => sec.classList.remove('active'));

            // Add active class to clicked item
            item.classList.add('active');

            // Show corresponding section
            const targetId = item.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // Theme Initialization
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        const lightOption = document.querySelector('.theme-option input[value="light"]');
        if (lightOption) {
            lightOption.checked = true;
            document.querySelectorAll('.theme-option').forEach(opt => opt.classList.remove('active'));
            lightOption.closest('.theme-option').classList.add('active');
        }
    } else {
        document.documentElement.removeAttribute('data-theme');
        const darkOption = document.querySelector('.theme-option input[value="dark"]');
        if (darkOption) {
            darkOption.checked = true;
            document.querySelectorAll('.theme-option').forEach(opt => opt.classList.remove('active'));
            darkOption.closest('.theme-option').classList.add('active');
        }
    }

    // Theme Options Logic
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove active from all
            themeOptions.forEach(opt => opt.classList.remove('active'));
            // Add to clicked
            option.classList.add('active');
            
            // Check the radio button inside
            const radio = option.querySelector('input[type="radio"]');
            radio.checked = true;

            // Apply the theme
            if(radio.value === 'light') {
                document.documentElement.setAttribute('data-theme', 'light');
            } else {
                document.documentElement.removeAttribute('data-theme');
            }
            
            // Save to localStorage so it persists across pages
            localStorage.setItem('theme', radio.value);
        });
    });

    // Load User Profile Data
    const savedName = localStorage.getItem('userName');
    const savedAvatar = localStorage.getItem('profilePhoto');
    const profileAvatar = document.getElementById('user-avatar');
    
    if (savedName) {
        const nameInput = document.querySelector('#section-profile input[type="text"]');
        if (nameInput) nameInput.value = savedName;
    }
    
    if (profileAvatar) {
        if (savedAvatar) {
            profileAvatar.src = savedAvatar;
        } else if (savedName) {
            profileAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(savedName)}&background=6366f1&color=fff&size=100`;
        }
    }

    // Avatar Upload Logic
    const avatarUpload = document.getElementById('avatar-upload');
    if (avatarUpload) {
        avatarUpload.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const img = new Image();
                    img.onload = function() {
                        // Create a canvas to resize the image
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        
                        // Set maximum dimensions for the avatar
                        const MAX_WIDTH = 200;
                        const MAX_HEIGHT = 200;
                        let width = img.width;
                        let height = img.height;
                        
                        if (width > height) {
                            if (width > MAX_WIDTH) {
                                height *= MAX_WIDTH / width;
                                width = MAX_WIDTH;
                            }
                        } else {
                            if (height > MAX_HEIGHT) {
                                width *= MAX_HEIGHT / height;
                                height = MAX_HEIGHT;
                            }
                        }
                        
                        canvas.width = width;
                        canvas.height = height;
                        
                        // Draw resized image onto canvas
                        ctx.drawImage(img, 0, 0, width, height);
                        
                        // Convert back to base64 Data URL with lower quality for smaller size
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                        
                        if (profileAvatar) profileAvatar.src = dataUrl;
                        try {
                            localStorage.setItem('profilePhoto', dataUrl);
                        } catch (err) {
                            alert('Image is too large to save. Please choose a smaller image.');
                        }
                    };
                    img.src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Save buttons simulate saving action
    const saveBtns = document.querySelectorAll('.save-btn');
    saveBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent form submission
            
            // Profile saving logic
            if (this.closest('#section-profile')) {
                const nameInput = document.querySelector('#section-profile input[type="text"]');
                if (nameInput && nameInput.value.trim() !== '') {
                    const newName = nameInput.value.trim();
                    localStorage.setItem('userName', newName);
                    
                    const profileAvatar = document.getElementById('user-avatar');
                    // Only overwrite with ui-avatar if they haven't uploaded a custom photo
                    if (profileAvatar && !localStorage.getItem('profilePhoto')) {
                        profileAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(newName)}&background=6366f1&color=fff&size=100`;
                    }
                }
            }
            
            const originalText = this.innerText;
            this.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Saving...';
            this.disabled = true;

            setTimeout(() => {
                this.innerHTML = '<i class="fa-solid fa-check"></i> Saved!';
                this.style.background = '#22c55e';
                
                setTimeout(() => {
                    this.innerHTML = originalText;
                    this.disabled = false;
                    this.style.background = ''; // reset to default CSS
                }, 2000);
            }, 1000);
        });
    });

    // Enable 2FA Button
    const enable2FABtn = document.getElementById('enable-2fa');
    if (enable2FABtn) {
        enable2FABtn.addEventListener('click', function() {
            if (this.innerText === 'Enable 2FA') {
                this.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Processing...';
                setTimeout(() => {
                    alert('2FA Setup Instructions sent to your email.');
                    this.innerText = 'Disable 2FA';
                    this.classList.remove('btn-outline');
                    this.classList.add('btn-primary');
                }, 1000);
            } else {
                if(confirm('Are you sure you want to disable Two-Factor Authentication?')) {
                    this.innerText = 'Enable 2FA';
                    this.classList.remove('btn-primary');
                    this.classList.add('btn-outline');
                }
            }
        });
    }

});
