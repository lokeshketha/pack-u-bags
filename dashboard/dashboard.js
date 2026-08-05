// PackSmart Dashboard Script

document.addEventListener('DOMContentLoaded', () => {
    // Theme Initialization
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }

    // Load User Profile Data
    const savedName = localStorage.getItem('userName');
    const savedAvatar = localStorage.getItem('profilePhoto');
    
    if (savedName) {
        const firstName = savedName.split(' ')[0];
        
        // Update Welcome Message
        const welcomeHeader = document.querySelector('.header-title h2');
        if (welcomeHeader) {
            welcomeHeader.innerHTML = `Welcome back, ${firstName}! 👋`;
        }

        // Update Sidebar Info
        const sidebarName = document.querySelector('.user-info h4');
        if (sidebarName) {
            sidebarName.textContent = savedName;
        }
    }

    const sidebarAvatar = document.querySelector('.user-profile .avatar img');
    if (sidebarAvatar) {
        if (savedAvatar) {
            sidebarAvatar.src = savedAvatar;
        } else if (savedName) {
            sidebarAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(savedName)}&background=6366f1&color=fff`;
        }
    }

    // Sidebar Toggle Logic for Mobile
    const menuToggle = document.getElementById('menu-toggle');
    const closeSidebar = document.getElementById('close-sidebar');
    const sidebar = document.getElementById('sidebar');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.add('active');
        });
    }

    if (closeSidebar && sidebar) {
        closeSidebar.addEventListener('click', () => {
            sidebar.classList.remove('active');
        });
    }
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            if (sidebar && sidebar.classList.contains('active') && !sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        }
    });

    // Trip Search Logic
    const tripSearchInput = document.getElementById('trip-search');
    const tripItems = document.querySelectorAll('.trip-item');

    if (tripSearchInput) {
        tripSearchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();

            tripItems.forEach(item => {
                const title = item.querySelector('.trip-details h4').textContent.toLowerCase();
                const description = item.querySelector('.trip-details p').textContent.toLowerCase();

                if (title.includes(searchTerm) || description.includes(searchTerm)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }

    // Chart.js Initialization
    const ctx = document.getElementById('packingChart');
    
    if (ctx && typeof Chart !== 'undefined') {
        Chart.defaults.color = '#94a3b8';
        Chart.defaults.font.family = "'Outfit', sans-serif";
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Packed', 'To Pack', 'Shopping List'],
                datasets: [{
                    data: [145, 42, 12],
                    backgroundColor: [
                        '#22c55e', // Green
                        '#6366f1', // Indigo
                        '#f59e0b'  // Amber
                    ],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(10, 15, 28, 0.9)',
                        titleFont: { size: 14 },
                        bodyFont: { size: 14 },
                        padding: 12,
                        cornerRadius: 8,
                        displayColors: true,
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderWidth: 1
                    }
                }
            }
        });
    }

    // Notification Dropdown Logic
    const notificationBtn = document.getElementById('notification-btn');
    const notificationDropdown = document.getElementById('notification-dropdown');
    const markAllRead = document.getElementById('mark-all-read');

    if (notificationBtn && notificationDropdown) {
        notificationBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            notificationDropdown.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!notificationDropdown.contains(e.target) && !notificationBtn.contains(e.target)) {
                notificationDropdown.classList.remove('show');
            }
        });
    }

    if (markAllRead) {
        markAllRead.addEventListener('click', () => {
            const unreadItems = document.querySelectorAll('.notification-item.unread');
            unreadItems.forEach(item => {
                item.classList.remove('unread');
            });
            const badge = document.querySelector('.notification-btn .badge');
            if (badge) {
                badge.style.display = 'none';
            }
        });
    }

    // Delete Notification Logic
    const notificationList = document.getElementById('notification-list');
    if (notificationList) {
        notificationList.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.delete-notif-btn');
            if (deleteBtn) {
                e.stopPropagation(); // Prevent closing dropdown or other clicks
                const notifItem = deleteBtn.closest('.notification-item');
                if (notifItem) {
                    notifItem.style.opacity = '0';
                    notifItem.style.transform = 'translateX(20px)';
                    setTimeout(() => {
                        notifItem.remove();
                        // Check if list is empty
                        const remainingItems = notificationList.querySelectorAll('.notification-item');
                        if (remainingItems.length === 0) {
                            notificationList.innerHTML = '<div class="no-notifications">No new notifications</div>';
                            const badge = document.querySelector('.notification-btn .badge');
                            if (badge) {
                                badge.style.display = 'none';
                            }
                        }
                    }, 300); // match transition duration
                }
            }
        });
    }

    // Voice Search Logic
    const micBtn = document.getElementById('mic-btn');
    if (micBtn && tripSearchInput) {
        // Check for SpeechRecognition support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;

            recognition.onstart = () => {
                micBtn.classList.add('recording');
                tripSearchInput.placeholder = 'Listening...';
            };

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                tripSearchInput.value = transcript;
                // Trigger the input event to perform search
                tripSearchInput.dispatchEvent(new Event('input'));
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                micBtn.classList.remove('recording');
                tripSearchInput.placeholder = 'Search trips...';
                if (event.error === 'not-allowed') {
                    alert('Microphone access was denied. Please make sure you are using http://127.0.0.1:8080 and allow microphone permissions.');
                } else if (event.error !== 'no-speech') {
                    alert('Microphone error: ' + event.error + '. Try using Google Chrome.');
                }
            };

            recognition.onend = () => {
                micBtn.classList.remove('recording');
                tripSearchInput.placeholder = 'Search trips...';
            };

            micBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (micBtn.classList.contains('recording')) {
                    recognition.stop();
                } else {
                    try {
                        recognition.start();
                    } catch (err) {
                        console.error(err);
                        alert('Could not start microphone. Try reloading the page.');
                    }
                }
            });
        } else {
            // Browser doesn't support Speech API
            micBtn.addEventListener('click', (e) => {
                e.preventDefault();
                alert('Voice search is not supported in your current browser. Please try Google Chrome or Edge.');
            });
        }
    }
});
