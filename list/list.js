// PackSmart Packing List Script

document.addEventListener('DOMContentLoaded', () => {
    // Theme Initialization
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }

    // Initial Data Structure fallback
    let items = [];

    const generateFallbackList = (tripDetails) => {
        let list = [];
        let idCounter = 1;
        
        let days = 5; // default
        if (tripDetails.dates) {
            const match = tripDetails.dates.match(/(\d+)\s*Days?/i);
            if (match) days = parseInt(match[1]);
        }

        const add = (name, category, qty) => {
            list.push({ id: idCounter++, name, category, qty, packed: false });
        };

        // Base clothing
        add('T-Shirts / Casual Shirts', 'Clothing', days);
        add('Underwear', 'Clothing', days + 2);
        add('Socks', 'Clothing', days + 2);
        add('Sleepwear', 'Clothing', Math.max(1, Math.ceil(days / 3)));
        
        const acts = tripDetails.activities.join(' ').toLowerCase();
        const types = tripDetails.tripTypes.join(' ').toLowerCase();
        const dest = tripDetails.destination.toLowerCase();

        if (types.includes('beach') || acts.includes('swim') || acts.includes('pool') || acts.includes('snorkel') || acts.includes('surf')) {
            add('Swimwear', 'Clothing', 2);
            add('Beach Towel', 'Accessories', 1);
            add('Flip Flops', 'Clothing', 1);
        }
        
        if (types.includes('wedding') || types.includes('family function') || types.includes('business')) {
            add('Formal Wear / Suit / Dress', 'Clothing', 1);
            add('Dress Shoes', 'Clothing', 1);
        }
        
        if (types.includes('adventure') || acts.includes('hike') || acts.includes('trek')) {
            add('Hiking Boots', 'Clothing', 1);
            add('Activewear Pants', 'Clothing', Math.max(1, Math.ceil(days / 2)));
        }

        if (types.includes('winter') || acts.includes('ski') || dest.includes('mountain') || dest.includes('snow')) {
            add('Heavy Jacket / Coat', 'Clothing', 1);
            add('Thermal Underwear', 'Clothing', 2);
            add('Gloves & Beanie', 'Accessories', 1);
        } else {
            add('Light Jacket / Sweater', 'Clothing', 1);
        }

        // Electronics
        add('Smartphone & Charger', 'Electronics', 1);
        if (acts.includes('photo') || types.includes('sightseeing')) {
            add('Power Bank', 'Electronics', 1);
        }

        // Documents
        add('ID / Passport', 'Documents', 1);
        add('Tickets / Booking Confirmations', 'Documents', 1);

        // Toiletries
        add('Toothbrush & Paste', 'Toiletries', 1);
        add('Deodorant', 'Toiletries', 1);
        if (types.includes('beach') || acts.includes('sunbathing') || acts.includes('hike') || types.includes('adventure')) {
            add('Sunscreen', 'Toiletries', 1);
        }

        // Medicines
        add('Painkillers / Paracetamol', 'Medicines', 1);
        add('Band-Aids / Basic First Aid', 'Medicines', 1);

        // Accessories
        add('Sunglasses', 'Accessories', 1);

        return list;
    };

    const categories = [
        { id: 'Clothing', icon: 'fa-shirt' },
        { id: 'Electronics', icon: 'fa-plug' },
        { id: 'Documents', icon: 'fa-passport' },
        { id: 'Toiletries', icon: 'fa-pump-soap' },
        { id: 'Medicines', icon: 'fa-pills' },
        { id: 'Accessories', icon: 'fa-glasses' }
    ];

    const container = document.getElementById('categories-container');
    const searchInput = document.getElementById('search-item');

    function renderList(filterText = '') {
        container.innerHTML = '';

        categories.forEach(cat => {
            const catItems = items.filter(i =>
                i.category === cat.id &&
                i.name.toLowerCase().includes(filterText.toLowerCase())
            );

            // Create section even if empty to maintain category anchors, but hide list
            const section = document.createElement('div');
            section.className = 'category-section';
            section.id = `cat-${cat.id.toLowerCase()}`;

            const header = document.createElement('h3');
            header.innerHTML = `<i class="fa-solid ${cat.icon}"></i> ${cat.id}`;
            section.appendChild(header);

            if (catItems.length === 0) {
                const emptyMsg = document.createElement('p');
                emptyMsg.style.color = 'var(--text-muted)';
                emptyMsg.style.fontStyle = 'italic';
                emptyMsg.style.padding = '1rem';
                emptyMsg.textContent = 'No items in this category.';
                section.appendChild(emptyMsg);
            } else {
                const list = document.createElement('div');
                list.className = 'item-list';

                catItems.forEach(item => {
                    const itemEl = document.createElement('div');
                    itemEl.className = `packing-item ${item.packed ? 'packed' : ''}`;

                    itemEl.innerHTML = `
                        <div class="item-left">
                            <label class="custom-checkbox">
                                <input type="checkbox" ${item.packed ? 'checked' : ''} onchange="window.toggleItem(${item.id})">
                                <span class="checkmark"></span>
                            </label>
                            <span class="item-name">${item.name}</span>
                        </div>
                        <div class="item-right">
                            <div class="item-qty">Qty: <span class="qty-val">${item.qty}</span></div>
                            <button class="remove-btn" onclick="window.removeItem(${item.id})" title="Remove item">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    `;
                    list.appendChild(itemEl);
                });

                section.appendChild(list);
            }

            container.appendChild(section);
        });

        updateStats();
    }

    function updateStats() {
        const total = items.length;
        const packed = items.filter(i => i.packed).length;

        document.getElementById('total-count').textContent = total;
        document.getElementById('packed-count').textContent = packed;

        // Update category badges
        categories.forEach(cat => {
            const catItems = items.filter(i => i.category === cat.id);
            const catTotal = catItems.length;
            const catPacked = catItems.filter(i => i.packed).length;

            const navLi = document.querySelector(`li[data-target="cat-${cat.id.toLowerCase()}"]`);
            if (navLi) {
                const badge = navLi.querySelector('.badge');
                if (badge) {
                    badge.textContent = `${catPacked}/${catTotal}`;
                }
            }
        });
    }

    // Expose functions to window for inline onclick handlers
    window.toggleItem = (id) => {
        const item = items.find(i => i.id === id);
        if (item) {
            item.packed = !item.packed;
            renderList(searchInput.value);
        }
    };

    window.removeItem = (id) => {
        items = items.filter(i => i.id !== id);
        renderList(searchInput.value);
    };

    // Add new item
    document.getElementById('add-btn').addEventListener('click', () => {
        const nameInput = document.getElementById('new-item-name');
        const catInput = document.getElementById('new-item-category');
        const qtyInput = document.getElementById('new-item-qty');

        if (!nameInput.value.trim()) {
            alert('Please enter an item name');
            return;
        }

        const newItem = {
            id: Date.now(),
            name: nameInput.value.trim(),
            category: catInput.value,
            qty: parseInt(qtyInput.value) || 1,
            packed: false
        };

        items.push(newItem);
        nameInput.value = '';
        qtyInput.value = '1';
        renderList(searchInput.value);

        // Scroll to the category
        document.getElementById(`cat-${newItem.category.toLowerCase()}`).scrollIntoView({ behavior: 'smooth' });
    });

    // Search
    searchInput.addEventListener('input', (e) => {
        renderList(e.target.value);
    });

    // Category Nav Click
    const navItems = document.querySelectorAll('.category-nav li');
    navItems.forEach(nav => {
        nav.addEventListener('click', () => {
            navItems.forEach(n => n.classList.remove('active'));
            nav.classList.add('active');

            const targetId = nav.getAttribute('data-target');
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
                // Offset scroll for sticky header
                const offset = 80;
                const elementPosition = targetEl.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - offset;
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // PDF Export mock
    document.getElementById('export-pdf').addEventListener('click', function () {
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Generating PDF...';
        this.disabled = true;

        setTimeout(() => {
            this.innerHTML = originalText;
            this.disabled = false;
            alert('Your Packing List PDF has been successfully downloaded!');
        }, 1500);
    });

    // Fetch AI Packing List
    const fetchAIPackingList = async () => {
        const tripDetailsStr = localStorage.getItem('tripDetails');
        if (!tripDetailsStr) {
            renderList();
            return;
        }

        const tripDetails = JSON.parse(tripDetailsStr);
        
        // Update context banner
        const titleSpan = document.querySelector('.context-header h2 span');
        if (titleSpan) titleSpan.textContent = tripDetails.destination;
        
        const durationValue = document.querySelector('.context-item i.fa-calendar').nextElementSibling.querySelector('.value');
        if (durationValue) durationValue.textContent = tripDetails.dates;

        const activitiesValue = document.querySelector('.context-item i.fa-person-swimming').nextElementSibling.querySelector('.value');
        if (activitiesValue) activitiesValue.textContent = tripDetails.activities.join(', ') || 'General';

        if (typeof CONFIG === 'undefined' || !CONFIG.GEMINI_API_KEY) {
            console.warn('No API key found. Using dynamic fallback data generator.');
            items = generateFallbackList(tripDetails);
            renderList();
            return;
        }

        try {
            const prompt = `You are an expert, highly logical professional packing assistant. Create a highly optimized and highly relevant packing list for the following trip. 

CRITICAL RULES:
1. DO NOT include unnecessary items. 
2. ABSOLUTELY NO "Swimwear" or "Swimming goggles" unless "beach", "swimming", "snorkeling", "surfing", or "pool" are explicitly mentioned in the Trip Types or Activities. For a "family function", "wedding", or "business" trip, DO NOT include swimwear.
3. Calculate the 'qty' (quantity) of each item logically based on the duration of the trip provided in the Dates. For example, if the trip is 10 days, provide 10-12 underwear and 10 shirts, but only 1 jacket or 1 toothbrush.

Trip Details:
- Destination: ${tripDetails.destination}
- Dates: ${tripDetails.dates} (Use this to determine the exact number of days for quantities)
- Trip Types: ${tripDetails.tripTypes.join(', ')}
- Activities: ${tripDetails.activities.join(', ')}

Return ONLY a valid JSON array of objects. Do not include markdown formatting or backticks.
Each object must have exactly these keys:
- id: a unique integer
- name: item name string
- category: must be one of ["Clothing", "Electronics", "Documents", "Toiletries", "Medicines", "Accessories"]
- qty: integer amount
- packed: boolean false`;

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${CONFIG.GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                })
            });

            const data = await response.json();
            if (data.candidates && data.candidates[0].content.parts[0].text) {
                let aiResponse = data.candidates[0].content.parts[0].text.trim();
                aiResponse = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
                
                const newItems = JSON.parse(aiResponse);
                if (Array.isArray(newItems) && newItems.length > 0) {
                    items = newItems;
                } else {
                    items = generateFallbackList(tripDetails);
                }
            } else {
                items = generateFallbackList(tripDetails);
            }
        } catch (error) {
            console.error('Error fetching packing list from AI:', error);
            items = generateFallbackList(tripDetails);
        }
        
        renderList();
    };

    // Initial render
    fetchAIPackingList();
});
