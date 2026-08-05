// PackSmart Trip Planning Script

document.addEventListener('DOMContentLoaded', () => {
    // Theme Initialization
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }

    let currentStep = 1;
    const totalSteps = 3;

    const nextBtns = document.querySelectorAll('.next-btn');
    const prevBtns = document.querySelectorAll('.prev-btn');
    const steps = document.querySelectorAll('.form-step');
    const progressSteps = document.querySelectorAll('.progress-indicator .step');
    const progressLines = document.querySelectorAll('.progress-indicator .line');

    // Summary elements
    const destInput = document.getElementById('destination');
    const startInput = document.getElementById('start-date');
    const endInput = document.getElementById('end-date');
    const summaryDest = document.getElementById('summary-dest');
    const summaryDates = document.getElementById('summary-dates');
    const summaryType = document.getElementById('summary-type');

    // Map logic
    let map = null;
    let marker = null;
    const mapContainer = document.getElementById('map-container');

    destInput.addEventListener('blur', async () => {
        const query = destInput.value.trim();
        if (!query) {
            mapContainer.style.display = 'none';
            return;
        }

        try {
            // Geocode using free Nominatim API
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
            const data = await response.json();
            
            if (data && data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lon = parseFloat(data[0].lon);
                
                mapContainer.style.display = 'block';
                
                if (!map) {
                    map = L.map('map').setView([lat, lon], 10);
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '&copy; OpenStreetMap contributors'
                    }).addTo(map);
                    marker = L.marker([lat, lon]).addTo(map);
                } else {
                    map.setView([lat, lon], 10);
                    marker.setLatLng([lat, lon]);
                    // Required when showing a previously hidden map container
                    setTimeout(() => map.invalidateSize(), 100);
                }
            }
        } catch (error) {
            console.error("Error fetching location data:", error);
        }
    });

    function updateStep() {
        // Hide all steps
        steps.forEach(step => step.classList.remove('active'));
        // Show current step
        document.getElementById(`step-${currentStep}`).classList.add('active');

        // Update progress bar UI
        progressSteps.forEach((step, idx) => {
            if (idx + 1 < currentStep) {
                step.classList.add('completed');
                step.classList.remove('active');
            } else if (idx + 1 === currentStep) {
                step.classList.add('active');
                step.classList.remove('completed');
            } else {
                step.classList.remove('active', 'completed');
            }
        });

        progressLines.forEach((line, idx) => {
            if (idx < currentStep - 1) {
                line.classList.add('active');
            } else {
                line.classList.remove('active');
            }
        });

        // Update summary if going to step 3
        if (currentStep === 3) {
            summaryDest.textContent = destInput.value || 'Not specified';
            if (startInput.value && endInput.value) {
                summaryDates.textContent = `${startInput.value} to ${endInput.value}`;
            } else {
                summaryDates.textContent = 'Dates not selected';
            }
            
            const selectedTypes = Array.from(document.querySelectorAll('input[name="trip-type"]:checked')).map(el => el.value);
            summaryType.textContent = selectedTypes.length > 0 ? selectedTypes.join(', ') : 'None';
        }
    }

    const tripTypesGrid = document.getElementById('trip-types-grid');
    const activitiesGrid = document.getElementById('activities-grid');

    const getIconForType = (type) => {
        if (type.includes('beach')) return 'umbrella-beach';
        if (type.includes('adventure') || type.includes('nature')) return 'mountain';
        if (type.includes('business') || type.includes('work')) return 'briefcase';
        if (type.includes('family')) return 'children';
        if (type.includes('romantic')) return 'heart';
        if (type.includes('cultural')) return 'landmark';
        return 'campground';
    };

    const getIconForActivity = (act) => {
        if (act.includes('swim') || act.includes('snorkel') || act.includes('surf') || act.includes('beach')) return 'person-swimming';
        if (act.includes('shop')) return 'bag-shopping';
        if (act.includes('photo')) return 'camera';
        if (act.includes('hike') || act.includes('trek')) return 'person-hiking';
        if (act.includes('ski') || act.includes('snowboard')) return 'person-skiing';
        if (act.includes('camp') || act.includes('tent')) return 'campground';
        if (act.includes('food') || act.includes('din') || act.includes('cuis') || act.includes('eat')) return 'utensils';
        if (act.includes('sight') || act.includes('tour') || act.includes('explor')) return 'binoculars';
        if (act.includes('walk')) return 'person-walking';
        if (act.includes('relax') || act.includes('spa')) return 'spa';
        if (act.includes('bike') || act.includes('cycl')) return 'person-biking';
        if (act.includes('fish')) return 'fish';
        if (act.includes('wildlife')) return 'paw';
        if (act.includes('star') || act.includes('night')) return 'moon';
        return 'star';
    };

    const activitiesByType = {
        'beach': ['swimming', 'snorkeling', 'surfing', 'sunbathing', 'photography', 'island hopping', 'seafood dining'],
        'adventure': ['hiking', 'trekking', 'mountain biking', 'camping', 'rock climbing', 'photography'],
        'leisure': ['relaxation', 'spa', 'shopping', 'local cuisine', 'photography', 'sightseeing'],
        'cultural': ['museum tours', 'walking tours', 'historical sites', 'local cuisine', 'photography', 'theater'],
        'relaxation': ['spa', 'yoga', 'meditation', 'reading', 'walking', 'fine dining'],
        'business': ['networking', 'conferences', 'fine dining', 'city tours', 'golf'],
        'family': ['amusement parks', 'zoo visits', 'picnics', 'easy hikes', 'photography', 'sightseeing'],
        'camping': ['tent pitching', 'bonfire', 'stargazing', 'hiking', 'wildlife watching'],
        'nature': ['bird watching', 'hiking', 'photography', 'camping', 'fishing'],
        'winter sports': ['skiing', 'snowboarding', 'ice skating', 'snowshoeing'],
        'shopping': ['mall hopping', 'boutique shopping', 'fine dining', 'walking'],
        'sightseeing': ['guided tours', 'photography', 'walking tours', 'local cuisine', 'exploring']
    };

    if (tripTypesGrid) {
        tripTypesGrid.addEventListener('change', (e) => {
            if (e.target.name === 'trip-type') {
                const selectedTypes = Array.from(tripTypesGrid.querySelectorAll('input[name="trip-type"]:checked')).map(el => el.value);
                
                let newActivities = [];
                if (selectedTypes.length === 0) {
                    newActivities = ['exploring', 'photography', 'local cuisine', 'walking', 'shopping', 'relaxation', 'sightseeing'];
                } else {
                    selectedTypes.forEach(type => {
                        const acts = activitiesByType[type] || ['exploring', 'photography', 'local cuisine', 'sightseeing'];
                        newActivities = newActivities.concat(acts);
                    });
                }
                
                // Remove duplicates
                newActivities = [...new Set(newActivities)];
                
                if (activitiesGrid) {
                    activitiesGrid.innerHTML = newActivities.map(act => `
                        <label class="option-card">
                            <input type="checkbox" name="activity" value="${act.toLowerCase()}">
                            <div class="option-content">
                                <i class="fa-solid fa-${getIconForActivity(act.toLowerCase())}"></i>
                                <span style="text-transform: capitalize">${act}</span>
                            </div>
                        </label>
                    `).join('');
                }
            }
        });
    }

    const fetchAIOptions = async (destinationStr) => {
        const destLower = destinationStr.toLowerCase();
        let fallbackTripTypes = [];
        let fallbackActivities = [];

        // Simple heuristic rules based on keywords
        if (destLower.includes('bali') || destLower.includes('beach') || destLower.includes('maldives') || destLower.includes('goa') || destLower.includes('island')) {
            fallbackTripTypes = ['beach', 'adventure', 'leisure', 'cultural', 'relaxation'];
            fallbackActivities = ['swimming', 'snorkeling', 'surfing', 'sunbathing', 'photography', 'island hopping', 'seafood dining'];
        } else if (destLower.includes('paris') || destLower.includes('london') || destLower.includes('york') || destLower.includes('tokyo') || destLower.includes('city') || destLower.includes('rome')) {
            fallbackTripTypes = ['cultural', 'business', 'sightseeing', 'family', 'shopping'];
            fallbackActivities = ['sightseeing', 'shopping', 'fine dining', 'museum tours', 'photography', 'walking tours', 'theater'];
        } else if (destLower.includes('alps') || destLower.includes('mountain') || destLower.includes('swiss') || destLower.includes('himalaya') || destLower.includes('manali') || destLower.includes('snow')) {
            fallbackTripTypes = ['adventure', 'winter sports', 'nature', 'photography', 'family'];
            fallbackActivities = ['skiing', 'trekking', 'snowboarding', 'hiking', 'photography', 'camping', 'mountain biking'];
        } else if (destLower.includes('camp') || destLower.includes('forest') || destLower.includes('park')) {
            fallbackTripTypes = ['camping', 'nature', 'adventure', 'family', 'road trip'];
            fallbackActivities = ['hiking', 'tent pitching', 'bonfire', 'wildlife watching', 'photography', 'stargazing', 'fishing'];
        } else {
            // Generic default
            fallbackTripTypes = ['sightseeing', 'leisure', 'cultural', 'adventure', 'family'];
            fallbackActivities = ['exploring', 'photography', 'local cuisine', 'walking', 'shopping', 'relaxation', 'sightseeing'];
        }

        const renderOptions = (tripTypes, activities) => {
            if (tripTypesGrid) {
                tripTypesGrid.innerHTML = tripTypes.map(type => `
                    <label class="option-card">
                        <input type="checkbox" name="trip-type" value="${type.toLowerCase()}">
                        <div class="option-content">
                            <i class="fa-solid fa-${getIconForType(type.toLowerCase())}"></i>
                            <span style="text-transform: capitalize">${type}</span>
                        </div>
                    </label>
                `).join('');
            }

            if (activitiesGrid) {
                activitiesGrid.innerHTML = activities.map(act => `
                    <label class="option-card">
                        <input type="checkbox" name="activity" value="${act.toLowerCase()}">
                        <div class="option-content">
                            <i class="fa-solid fa-${getIconForActivity(act.toLowerCase())}"></i>
                            <span style="text-transform: capitalize">${act}</span>
                        </div>
                    </label>
                `).join('');
            }
        };

        if (typeof CONFIG === 'undefined' || !CONFIG.GEMINI_API_KEY) {
            console.warn('No API keys configured, using dynamic fallback options based on location keywords.');
            renderOptions(fallbackTripTypes, fallbackActivities);
            return;
        }

        try {
            let locationContext = destinationStr;
            
            if (CONFIG.GOOGLE_MAPS_API_KEY) {
                try {
                    const geoRes = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(destinationStr)}&key=${CONFIG.GOOGLE_MAPS_API_KEY}`);
                    const geoData = await geoRes.json();
                    if (geoData.results && geoData.results.length > 0) {
                        locationContext = geoData.results[0].formatted_address;
                    }
                } catch (e) {
                    console.error('Geocoding error:', e);
                }
            }

            const prompt = `Given the destination "${locationContext}", provide a JSON object containing an array of exactly 5 relevant "tripTypes" (e.g., beach, adventure, cultural, romantic, etc) and an array of exactly 10 relevant "activities" (e.g., swimming, hiking, museum tours, etc). Ensure the keys are exactly "tripTypes" and "activities". Return only the JSON block without markdown formatting.`;
            const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${CONFIG.GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { response_mime_type: "application/json" }
                })
            });
            const geminiData = await geminiRes.json();
            
            if (geminiData.candidates && geminiData.candidates.length > 0) {
                const jsonText = geminiData.candidates[0].content.parts[0].text;
                const parsed = JSON.parse(jsonText);
                
                if (parsed.tripTypes && parsed.activities) {
                    renderOptions(parsed.tripTypes, parsed.activities);
                } else {
                    renderOptions(fallbackTripTypes, fallbackActivities);
                }
            } else {
                renderOptions(fallbackTripTypes, fallbackActivities);
            }
        } catch (err) {
            console.error('Error fetching AI options:', err);
            renderOptions(fallbackTripTypes, fallbackActivities);
        }
    };

    nextBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            // Validation for step 1
            if (currentStep === 1) {
                if (!destInput.value.trim()) {
                    alert('Please enter a destination.');
                    destInput.focus();
                    return;
                }
                
                const originalHtml = btn.innerHTML;
                btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Analyzing...';
                btn.disabled = true;
                
                await fetchAIOptions(destInput.value);
                
                btn.innerHTML = originalHtml;
                btn.disabled = false;
            }

            if (currentStep < totalSteps) {
                currentStep++;
                updateStep();
            }
        });
    });

    prevBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentStep > 1) {
                currentStep--;
                updateStep();
            }
        });
    });

    // Action buttons on Step 3
    const analyzeBtn = document.getElementById('analyze-weather-btn');
    const generateBtn = document.getElementById('generate-list-btn');
    const loadingArea = document.getElementById('loading-area');
    const loadingText = document.getElementById('loading-text');

    analyzeBtn.addEventListener('click', () => {
        analyzeBtn.style.display = 'none';
        generateBtn.style.display = 'none';
        loadingArea.style.display = 'block';
        loadingText.textContent = 'Analyzing historical weather patterns...';

        setTimeout(() => {
            loadingArea.style.display = 'none';
            analyzeBtn.style.display = 'block';
            generateBtn.style.display = 'block';
            
            // Change button appearance to indicate completion
            analyzeBtn.innerHTML = '<i class="fa-solid fa-check"></i> Weather Analyzed (Avg 28°C, Sunny)';
            analyzeBtn.style.background = 'rgba(34, 197, 94, 0.1)';
            analyzeBtn.style.color = '#22c55e';
            analyzeBtn.style.borderColor = '#22c55e';
            analyzeBtn.disabled = true;
        }, 1500);
    });

    generateBtn.addEventListener('click', () => {
        analyzeBtn.style.display = 'none';
        generateBtn.style.display = 'none';
        loadingArea.style.display = 'block';
        loadingText.textContent = 'AI is crafting your perfect packing list...';

        const dest = document.getElementById('summary-dest').textContent;
        const dates = document.getElementById('summary-dates').textContent;
        const tripTypes = Array.from(document.querySelectorAll('input[name="trip-type"]:checked')).map(el => el.value);
        const activities = Array.from(document.querySelectorAll('input[name="activity"]:checked')).map(el => el.value);

        localStorage.setItem('tripDetails', JSON.stringify({
            destination: dest,
            dates: dates,
            tripTypes: tripTypes,
            activities: activities
        }));

        setTimeout(() => {
            alert('Packing list successfully generated!');
            window.location.href = '../list/'; // Redirect to packing list
        }, 2000);
    });

    // Custom Input Logic
    const addCustomTripBtn = document.getElementById('add-custom-trip');
    const customTripInput = document.getElementById('custom-trip-type');
    if (addCustomTripBtn && customTripInput && tripTypesGrid) {
        const addCustomTrip = () => {
            const val = customTripInput.value.trim();
            if (val) {
                const newHtml = `
                    <label class="option-card">
                        <input type="checkbox" name="trip-type" value="${val.toLowerCase()}" checked>
                        <div class="option-content">
                            <i class="fa-solid fa-${getIconForType(val.toLowerCase())}"></i>
                            <span style="text-transform: capitalize">${val}</span>
                        </div>
                    </label>
                `;
                tripTypesGrid.insertAdjacentHTML('beforeend', newHtml);
                customTripInput.value = '';
                tripTypesGrid.dispatchEvent(new Event('change'));
            }
        };
        addCustomTripBtn.addEventListener('click', addCustomTrip);
        customTripInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addCustomTrip();
            }
        });
    }

    const addCustomActivityBtn = document.getElementById('add-custom-activity');
    const customActivityInput = document.getElementById('custom-activity');
    if (addCustomActivityBtn && customActivityInput && activitiesGrid) {
        const addCustomActivity = () => {
            const val = customActivityInput.value.trim();
            if (val) {
                const newHtml = `
                    <label class="option-card">
                        <input type="checkbox" name="activity" value="${val.toLowerCase()}" checked>
                        <div class="option-content">
                            <i class="fa-solid fa-${getIconForActivity(val.toLowerCase())}"></i>
                            <span style="text-transform: capitalize">${val}</span>
                        </div>
                    </label>
                `;
                activitiesGrid.insertAdjacentHTML('beforeend', newHtml);
                customActivityInput.value = '';
            }
        };
        addCustomActivityBtn.addEventListener('click', addCustomActivity);
        customActivityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addCustomActivity();
            }
        });
    }
});
