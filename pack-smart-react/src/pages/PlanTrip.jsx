import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './PlanTrip.css';

// Fix for default marker icon in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const PlanTrip = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    travelers: 1,
    travelerDetails: [{ id: 1, name: 'Traveler 1', age: '', gender: '' }],
    tripType: ['beach'],
    activities: []
  });
  const [mapLocation, setMapLocation] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [weatherAnalyzed, setWeatherAnalyzed] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [availableTripTypes, setAvailableTripTypes] = useState(['beach', 'adventure', 'business', 'family', 'camping']);
  const [availableActivities, setAvailableActivities] = useState(['swimming', 'trekking', 'shopping', 'photography', 'hiking']);
  const [analyzingLocation, setAnalyzingLocation] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const handleInputChange = (e) => {
    const { id, name, value, type, checked } = e.target;
    
    if (id === 'travelers' || name === 'travelers') {
      const num = value === '' ? '' : parseInt(value, 10);
      const validNum = (num === '' || isNaN(num) || num < 1) ? 1 : num;
      let newDetails = [...formData.travelerDetails];
      if (validNum > newDetails.length) {
        for (let i = newDetails.length; i < validNum; i++) {
          newDetails.push({ id: i + 1, name: `Traveler ${i + 1}`, age: '', gender: '' });
        }
      } else if (validNum < newDetails.length) {
        newDetails = newDetails.slice(0, validNum);
      }
      setFormData({ ...formData, travelers: num, travelerDetails: newDetails });
      return;
    }

    if (type === 'checkbox') {
      if (name === 'tripType') {
        let updatedTripTypes = [...formData.tripType];
        if (checked) {
          updatedTripTypes.push(value);
        } else {
          updatedTripTypes = updatedTripTypes.filter(t => t !== value);
        }
        setFormData({ ...formData, tripType: updatedTripTypes });
      } else {
        let updatedActivities = [...formData.activities];
        if (checked) {
          updatedActivities.push(value);
        } else {
          updatedActivities = updatedActivities.filter(a => a !== value);
        }
        setFormData({ ...formData, activities: updatedActivities });
      }
    } else if (type === 'radio') {
      setFormData({ ...formData, [name]: value });
    } else {
      setFormData({ ...formData, [id || name]: value });
    }
  };

  const handleTravelerChange = (id, field, value) => {
    const updated = formData.travelerDetails.map(t => 
      t.id === id ? { ...t, [field]: value } : t
    );
    setFormData({ ...formData, travelerDetails: updated });
  };

  // Geocode when destination changes
  const handleDestinationBlur = async () => {
    if (!formData.destination.trim()) {
      setMapLocation(null);
      return;
    }
    
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.destination)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        setMapLocation({
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon)
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAIOptions = async (destinationStr) => {
    try {
      setAnalyzingLocation(true);
      
      const geocodeKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;

      let locationContext = destinationStr;
      
      if (geocodeKey) {
        try {
          const geoRes = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(destinationStr)}&key=${geocodeKey}`);
          const geoData = await geoRes.json();
          if (geoData.results && geoData.results.length > 0) {
             const result = geoData.results[0];
             locationContext = result.formatted_address;
          }
        } catch (e) {
          console.error('Geocoding error:', e);
        }
      }

      if (geminiKey) {
        const prompt = `Given the destination "${locationContext}", provide a JSON object containing an array of exactly 5 relevant "tripTypes" (e.g., beach, adventure, cultural, etc) and an array of exactly 10 relevant "activities" (e.g., swimming, hiking, museum tours, etc). Ensure the keys are exactly "tripTypes" and "activities". Do not include 'romantic' as a tripType. Return only the JSON block without markdown formatting.`;
        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
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
           if (parsed.tripTypes) setAvailableTripTypes(parsed.tripTypes.map(t => t.toLowerCase()));
           if (parsed.activities) setAvailableActivities(parsed.activities.map(a => a.toLowerCase()));
           
           setFormData(prev => ({ ...prev, tripType: [], activities: [] }));
        }
      } else {
        console.warn('No Gemini API key found, using default options.');
      }
    } catch (err) {
      console.error('Error fetching AI options:', err);
    } finally {
      setAnalyzingLocation(false);
      setCurrentStep(3); // Move to Step 3 after AI options
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && !formData.destination.trim()) {
      alert("Please enter a destination.");
      return;
    }
    if (currentStep === 2) {
      fetchAIOptions(formData.destination);
    } else if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const analyzeWeather = async () => {
    if (!mapLocation) {
      alert("Please enter a valid destination to analyze weather.");
      return;
    }
    setLoadingWeather(true);
    
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${mapLocation.lat}&longitude=${mapLocation.lon}&current_weather=true`);
      const data = await res.json();
      
      if (data && data.current_weather) {
        const temp = data.current_weather.temperature;
        const code = data.current_weather.weathercode;
        
        let condition = "Clear";
        if (code >= 1 && code <= 3) condition = "Partly Cloudy";
        else if (code >= 45 && code <= 48) condition = "Foggy";
        else if (code >= 51 && code <= 67) condition = "Rainy";
        else if (code >= 71 && code <= 77) condition = "Snowy";
        else if (code >= 95) condition = "Stormy";

        setWeatherData(`${temp}°C, ${condition}`);
      } else {
        setWeatherData("28°C, Sunny (Estimated)");
      }
    } catch (err) {
      console.error(err);
      setWeatherData("28°C, Sunny (Estimated)");
    } finally {
      setLoadingWeather(false);
      setWeatherAnalyzed(true);
    }
  };

  const generateList = () => {
    navigate('/list', { state: { formData, weatherData } });
  };

  return (
    <div className="plan-body">
      <nav className="navbar scrolled">
          <div className="nav-container">
              <Link to="/dashboard" className="logo">
                  <i className="fa-solid fa-suitcase-rolling"></i>
                  <span>PackSmart</span>
              </Link>
              <div className="nav-actions">
                  <Link to="/dashboard" className="btn btn-outline">
                    <i className="fa-solid fa-arrow-left"></i> Dashboard
                  </Link>
              </div>
          </div>
      </nav>
      <div className="plan-container">
        <div className="glass-card plan-card floating-animation" style={{ animationDelay: '0s' }}>
          
          <div className="plan-header">
              <h2>Plan Your Trip</h2>
              <p>Tell us about your upcoming adventure.</p>
              
              <div className="progress-indicator">
                  <div className={`step ${currentStep > 1 ? 'completed' : currentStep === 1 ? 'active' : ''}`}>1</div>
                  <div className={`line ${currentStep >= 2 ? 'active' : ''}`}></div>
                  <div className={`step ${currentStep > 2 ? 'completed' : currentStep === 2 ? 'active' : ''}`}>2</div>
                  <div className={`line ${currentStep >= 3 ? 'active' : ''}`}></div>
                  <div className={`step ${currentStep > 3 ? 'completed' : currentStep === 3 ? 'active' : ''}`}>3</div>
                  <div className={`line ${currentStep >= 4 ? 'active' : ''}`}></div>
                  <div className={`step ${currentStep === 4 ? 'active' : ''}`}>4</div>
              </div>
          </div>

          <form id="trip-form" onSubmit={e => e.preventDefault()}>
            
            {/* Step 1 */}
            <div className={`form-step ${currentStep === 1 ? 'active' : ''}`}>
              <h3>Where are you going?</h3>
              <div className="input-group">
                  <label htmlFor="destination">Destination</label>
                  <div className="input-wrapper">
                      <i className="fa-solid fa-location-dot"></i>
                      <input 
                        type="text" 
                        id="destination" 
                        value={formData.destination}
                        onChange={handleInputChange}
                        onBlur={handleDestinationBlur}
                        placeholder="e.g., Bali, Indonesia" 
                        required 
                      />
                  </div>
              </div>

              {mapLocation && (
                <div id="map-container" style={{ marginBottom: '1.5rem', height: '250px', borderRadius: '12px', overflow: 'hidden' }}>
                  <MapContainer center={[mapLocation.lat, mapLocation.lon]} zoom={10} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                      attribution='&copy; OpenStreetMap contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[mapLocation.lat, mapLocation.lon]} />
                  </MapContainer>
                </div>
              )}

              <div className="dates-row">
                  <div className="input-group">
                      <label htmlFor="startDate">Start Date</label>
                      <div className="input-wrapper">
                          <i className="fa-regular fa-calendar"></i>
                          <input type="date" id="startDate" value={formData.startDate} onChange={handleInputChange} required />
                      </div>
                  </div>
                  <div className="input-group">
                      <label htmlFor="endDate">End Date</label>
                      <div className="input-wrapper">
                          <i className="fa-regular fa-calendar-check"></i>
                          <input type="date" id="endDate" value={formData.endDate} onChange={handleInputChange} required />
                      </div>
                  </div>
              </div>

              <div className="input-group">
                  <label htmlFor="travelers">Number of Travelers</label>
                  <div className="input-wrapper">
                      <i className="fa-solid fa-user-group"></i>
                      <input type="number" id="travelers" min="1" max="20" value={formData.travelers} onChange={handleInputChange} required />
                  </div>
              </div>

              <div className="step-actions">
                  <div></div>
                  <button type="button" className="btn btn-primary next-btn" onClick={nextStep}>
                    Next Step <i className="fa-solid fa-arrow-right"></i>
                  </button>
              </div>
            </div>

            {/* Step 2 (Traveler Details) */}
            <div className={`form-step ${currentStep === 2 ? 'active' : ''}`}>
              <h3>Traveler Details</h3>
              <p style={{marginBottom: '1.5rem', color: 'var(--text-secondary)'}}>Tell us about each traveler to personalize your packing lists.</p>
              
              <div className="travelers-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
                  {formData.travelerDetails.map((traveler) => (
                    <div key={traveler.id} className="traveler-card" style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <h4 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>{traveler.name}</h4>
                        <div className="dates-row">
                            <div className="input-group">
                                <label>Age</label>
                                <div className="input-wrapper">
                                    <input 
                                      type="number" 
                                      min="0" 
                                      max="120" 
                                      placeholder="Age"
                                      value={traveler.age} 
                                      onChange={(e) => handleTravelerChange(traveler.id, 'age', e.target.value)} 
                                      required 
                                    />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Gender</label>
                                <div className="input-wrapper" style={{ padding: '0 1rem' }}>
                                    <select 
                                      value={traveler.gender} 
                                      onChange={(e) => handleTravelerChange(traveler.id, 'gender', e.target.value)}
                                      required
                                      style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', appearance: 'none', height: '100%', cursor: 'pointer' }}
                                    >
                                        <option value="" disabled style={{ color: '#000' }}>Select Gender</option>
                                        <option value="Male" style={{ color: '#000' }}>Male</option>
                                        <option value="Female" style={{ color: '#000' }}>Female</option>
                                        <option value="Other" style={{ color: '#000' }}>Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                  ))}
              </div>

              <div className="step-actions" style={{ marginTop: '2rem' }}>
                  <button type="button" className="btn btn-outline prev-btn" onClick={prevStep}><i className="fa-solid fa-arrow-left"></i> Back</button>
                  <button type="button" className="btn btn-primary next-btn" onClick={nextStep} disabled={analyzingLocation}>
                    {analyzingLocation ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Analyzing...</> : <>Next Step <i className="fa-solid fa-arrow-right"></i></>}
                  </button>
              </div>
            </div>

            {/* Step 3 */}
            <div className={`form-step ${currentStep === 3 ? 'active' : ''}`}>
              <h3>What kind of trip is this?</h3>
              
              <div className="input-group">
                  <label>Trip Type</label>
                  <div className="options-grid">
                      {availableTripTypes.map(type => (
                        <label className="option-card" key={type}>
                            <input type="checkbox" name="tripType" value={type} checked={formData.tripType.includes(type)} onChange={handleInputChange} />
                            <div className="option-content">
                                <i className={`fa-solid fa-${
                                  type.includes('beach') ? 'umbrella-beach' : 
                                  type.includes('adventure') || type.includes('nature') ? 'mountain' : 
                                  type.includes('business') || type.includes('work') ? 'briefcase' : 
                                  type.includes('family') ? 'children' : 
                                  type.includes('cultural') ? 'landmark' :
                                  'campground'
                                }`}></i>
                                <span style={{textTransform: 'capitalize'}}>{type}</span>
                            </div>
                        </label>
                      ))}
                  </div>
              </div>

              <div className="input-group">
                  <label>Activities (Select all that apply)</label>
                  <div className="options-grid activities-grid">
                      {availableActivities.map(act => (
                        <label className="activity-chip" key={act}>
                            <input type="checkbox" value={act} checked={formData.activities.includes(act)} onChange={handleInputChange} />
                            <span style={{textTransform: 'capitalize'}}>{act}</span>
                        </label>
                      ))}
                  </div>
              </div>

              <div className="step-actions">
                  <button type="button" className="btn btn-outline prev-btn" onClick={prevStep}><i className="fa-solid fa-arrow-left"></i> Back</button>
                  <button type="button" className="btn btn-primary next-btn" onClick={nextStep}>Next Step <i className="fa-solid fa-arrow-right"></i></button>
              </div>
            </div>

            {/* Step 4 */}
            <div className={`form-step ${currentStep === 4 ? 'active' : ''}`}>
              <h3>Ready to generate your list?</h3>
              
              <div className="summary-box">
                  <div className="summary-item">
                      <i className="fa-solid fa-location-dot"></i>
                      <div className="summary-text">
                          <span className="summary-label">Destination</span>
                          <span className="summary-value">{formData.destination || 'Not specified'}</span>
                      </div>
                  </div>
                  <div className="summary-item">
                      <i className="fa-regular fa-calendar"></i>
                      <div className="summary-text">
                          <span className="summary-label">Dates</span>
                          <span className="summary-value">
                            {formData.startDate && formData.endDate ? `${formData.startDate} to ${formData.endDate}` : 'Dates not selected'}
                          </span>
                      </div>
                  </div>
                  <div className="summary-item">
                      <i className="fa-solid fa-tags"></i>
                      <div className="summary-text">
                          <span className="summary-label">Trip Type</span>
                          <span className="summary-value">{formData.tripType.length > 0 ? formData.tripType.join(', ') : 'None'}</span>
                      </div>
                  </div>
              </div>

              {loadingWeather ? (
                <div className="loading-area">
                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                    <p>Analyzing historical weather patterns...</p>
                </div>
              ) : (
                <div className="final-actions">
                    <button 
                      type="button" 
                      style={weatherAnalyzed ? {background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderColor: '#22c55e'} : {}}
                      className={weatherAnalyzed ? "btn btn-outline action-btn" : "btn btn-secondary action-btn"}
                      onClick={weatherAnalyzed ? undefined : analyzeWeather}
                    >
                        {weatherAnalyzed ? <><i className="fa-solid fa-check"></i> Weather Analyzed ({weatherData})</> : <><i className="fa-solid fa-cloud-sun-rain"></i> Analyze Weather</>}
                    </button>
                    <button type="button" className="btn btn-primary action-btn" onClick={generateList}>
                        <i className="fa-solid fa-wand-magic-sparkles"></i> Generate Packing List
                    </button>
                </div>
              )}

              <div className="step-actions">
                  <button type="button" className="btn btn-outline prev-btn" onClick={prevStep}><i className="fa-solid fa-arrow-left"></i> Back</button>
              </div>
            </div>

          </form>
        </div>
        
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>
    </div>
  );
};

export default PlanTrip;
