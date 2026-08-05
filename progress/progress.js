// PackSmart Progress Dashboard Script

document.addEventListener('DOMContentLoaded', () => {
    // Theme Initialization
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }

    // Initial Data
    const initialData = [
        { id: 1, name: 'T-Shirts', category: 'Clothing', qty: 7, packed: false },
        { id: 2, name: 'Shorts', category: 'Clothing', qty: 3, packed: true },
        { id: 3, name: 'Swimwear', category: 'Clothing', qty: 2, packed: false },
        { id: 4, name: 'Smartphone & Charger', category: 'Electronics', qty: 1, packed: true },
        { id: 5, name: 'Power Bank', category: 'Electronics', qty: 1, packed: false },
        { id: 6, name: 'Passport', category: 'Documents', qty: 1, packed: true },
        { id: 7, name: 'Flight Tickets', category: 'Documents', qty: 2, packed: false },
        { id: 8, name: 'Toothbrush & Paste', category: 'Toiletries', qty: 1, packed: false },
        { id: 9, name: 'Sunscreen', category: 'Toiletries', qty: 1, packed: false },
        { id: 10, name: 'Painkillers', category: 'Medicines', qty: 1, packed: false }
    ];

    let items = [...initialData];

    const categories = [
        { id: 'Clothing', icon: 'fa-shirt' },
        { id: 'Electronics', icon: 'fa-plug' },
        { id: 'Documents', icon: 'fa-passport' },
        { id: 'Toiletries', icon: 'fa-pump-soap' },
        { id: 'Medicines', icon: 'fa-pills' }
    ];

    const grid = document.getElementById('categories-grid');
    const totalVal = document.getElementById('total-val');
    const packedVal = document.getElementById('packed-val');
    const remainVal = document.getElementById('remain-val');
    const percentVal = document.getElementById('percent-val');
    const mainProgressFill = document.getElementById('main-progress-fill');

    function renderCards() {
        grid.innerHTML = '';
        
        categories.forEach((cat, index) => {
            const catItems = items.filter(i => i.category === cat.id);
            if (catItems.length === 0) return;

            const packed = catItems.filter(i => i.packed).length;
            const total = catItems.length;

            const card = document.createElement('div');
            card.className = 'cat-card glass-card';
            
            // To remember expanded state between renders
            const existingCard = document.getElementById(`cat-card-${cat.id}`);
            if (existingCard && existingCard.classList.contains('expanded')) {
                card.classList.add('expanded');
            } else if (index === 0 && !existingCard) {
                // Expand first category by default on initial load
                card.classList.add('expanded');
            }
            card.id = `cat-card-${cat.id}`;

            const header = document.createElement('div');
            header.className = 'cat-header';
            header.innerHTML = `
                <div class="cat-title">
                    <i class="fa-solid ${cat.icon}"></i> ${cat.id}
                </div>
                <div class="cat-meta">
                    <span class="cat-progress-text">${packed}/${total} Packed</span>
                    <i class="fa-solid fa-chevron-down expand-icon"></i>
                </div>
            `;

            header.addEventListener('click', () => {
                card.classList.toggle('expanded');
            });

            card.appendChild(header);

            const body = document.createElement('div');
            body.className = 'cat-body';

            catItems.forEach(item => {
                const row = document.createElement('div');
                row.className = `item-row ${item.packed ? 'packed' : ''}`;
                
                row.innerHTML = `
                    <div class="item-left">
                        <label class="custom-checkbox">
                            <input type="checkbox" ${item.packed ? 'checked' : ''} onchange="window.toggleProgressItem(${item.id})">
                            <span class="checkmark"></span>
                        </label>
                        <span class="item-name">${item.name}</span>
                    </div>
                    <div class="item-qty">Qty: ${item.qty}</div>
                `;
                body.appendChild(row);
            });

            card.appendChild(body);
            grid.appendChild(card);
        });

        updateOverallStats();
    }

    function updateOverallStats() {
        const total = items.length;
        const packed = items.filter(i => i.packed).length;
        const remain = total - packed;
        const percent = total === 0 ? 0 : Math.round((packed / total) * 100);

        totalVal.textContent = total;
        packedVal.textContent = packed;
        remainVal.textContent = remain;
        percentVal.textContent = `${percent}%`;
        mainProgressFill.style.width = `${percent}%`;

        // If completed
        if (percent === 100 && total > 0) {
            mainProgressFill.style.background = '#22c55e'; // turn green
            mainProgressFill.style.boxShadow = '0 0 20px rgba(34, 197, 94, 0.4)';
        } else {
            mainProgressFill.style.background = 'var(--gradient-primary)';
            mainProgressFill.style.boxShadow = 'var(--shadow-glow)';
        }
    }

    // Expose toggle to window scope for inline handler
    window.toggleProgressItem = (id) => {
        const item = items.find(i => i.id === id);
        if (item) {
            item.packed = !item.packed;
            renderCards(); // re-render to update all stats and classes
        }
    };

    // Reset list
    document.getElementById('reset-btn').addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all packed items?')) {
            items.forEach(i => i.packed = false);
            renderCards();
        }
    });

    // Export PDF
    document.getElementById('export-pdf').addEventListener('click', function() {
        window.location.href = '../export/';
    });

    // Initial render
    renderCards();
});
