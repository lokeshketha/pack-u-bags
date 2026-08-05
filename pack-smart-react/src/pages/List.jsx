import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './List.css';

const defaultCategories = [
  {
    id: 'cat-clothing',
    title: 'Clothing',
    items: [
      { id: 1, name: 'T-Shirts', qty: 5, checked: false },
      { id: 2, name: 'Shorts', qty: 3, checked: false },
      { id: 3, name: 'Swimwear', qty: 2, checked: false },
      { id: 4, name: 'Underwear', qty: 7, checked: false },
      { id: 5, name: 'Socks', qty: 7, checked: false },
    ]
  },
  {
    id: 'cat-electronics',
    title: 'Electronics',
    items: [
      { id: 6, name: 'Smartphone', qty: 1, checked: false },
      { id: 7, name: 'Charger & Cables', qty: 2, checked: false },
      { id: 8, name: 'Power Bank', qty: 1, checked: false },
      { id: 9, name: 'Universal Adapter', qty: 1, checked: false },
    ]
  },
  {
    id: 'cat-documents',
    title: 'Documents',
    items: [
      { id: 10, name: 'Passport / ID', qty: 1, checked: false },
      { id: 11, name: 'Flight Tickets', qty: 1, checked: false },
      { id: 12, name: 'Hotel Reservations', qty: 1, checked: false },
      { id: 13, name: 'Travel Insurance', qty: 1, checked: false },
    ]
  },
  {
    id: 'cat-toiletries',
    title: 'Toiletries',
    items: [
      { id: 14, name: 'Toothbrush & Paste', qty: 1, checked: false },
      { id: 15, name: 'Deodorant', qty: 1, checked: false },
      { id: 16, name: 'Sunscreen', qty: 1, checked: false },
      { id: 17, name: 'Shampoo & Conditioner', qty: 1, checked: false },
    ]
  }
];

const List = () => {
  const location = useLocation();
  const { formData, weatherData } = location.state || {};
  
  const [memberLists, setMemberLists] = useState([]);
  const [activeTravelerId, setActiveTravelerId] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [apiError, setApiError] = useState(false);

  const [activeCategory, setActiveCategory] = useState('cat-clothing');
  const [searchQuery, setSearchQuery] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Clothing');
  const [newItemQty, setNewItemQty] = useState(1);

  useEffect(() => {
    if (!formData || !formData.travelerDetails) return;
    
    const fallbackToDefault = (isError = true) => {
        if (isError) setApiError(true);
        const initial = formData.travelerDetails.map(t => ({
          travelerId: t.id,
          name: t.name,
          categories: JSON.parse(JSON.stringify(defaultCategories))
        }));
        setMemberLists(initial);
        if (initial.length > 0) setActiveTravelerId(initial[0].travelerId);
    };

    const initializeLists = async () => {
      const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (geminiKey) {
        setLoadingAI(true);
        try {
          const travelerInfo = formData.travelerDetails.map(t => `Traveler ID ${t.id}: ${t.age} year old ${t.gender}`).join('\n');
          const prompt = `Generate a personalized travel packing list for the following travelers traveling to ${formData.destination} from ${formData.startDate} to ${formData.endDate}. 
Trip type: ${formData.tripType.join(', ')}. Activities: ${formData.activities.join(', ')}. Weather context: ${weatherData || 'unknown'}.

Travelers:
${travelerInfo}

Return ONLY a JSON array without markdown formatting. Each object in the array MUST have:
1. "travelerId": matching the Traveler ID provided above (number)
2. "categories": an array of exactly 4 category objects. Each category object should have:
   - "id": a unique string (e.g. "cat-clothing")
   - "title": category title (e.g. "Clothing", "Electronics", "Documents", "Toiletries")
   - "items": an array of item objects with "id" (unique number), "name" (string), "qty" (number), "checked" (boolean set to false)

Generate at least 4 items per category, highly customized for EACH specific traveler's age, gender, and the trip details.`;

          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               contents: [{ parts: [{ text: prompt }] }],
               generationConfig: { response_mime_type: "application/json" }
            })
          });
          const data = await res.json();
          
          if (data.error) {
              console.error("Gemini API Error:", data.error);
              fallbackToDefault();
              return;
          }

          if (data.candidates && data.candidates.length > 0) {
            try {
              const jsonText = data.candidates[0].content.parts[0].text;
              const parsedData = JSON.parse(jsonText);
              
              const results = formData.travelerDetails.map(traveler => {
                 const generated = parsedData.find(d => d.travelerId === traveler.id);
                 let categories = generated ? generated.categories : JSON.parse(JSON.stringify(defaultCategories));
                 
                 categories.forEach(cat => {
                   cat.items.forEach((item, idx) => {
                     if (!item.id) item.id = Math.random() * 100000 + idx;
                   });
                 });
                 
                 return { travelerId: traveler.id, name: traveler.name, categories };
              });
              
              setMemberLists(results);
              if (results.length > 0) setActiveTravelerId(results[0].travelerId);

            } catch(e) {
              console.error("Failed to parse AI output", e);
              fallbackToDefault();
            }
          } else {
             fallbackToDefault();
          }
        } catch(e) {
          console.error("AI List generation failed:", e);
          fallbackToDefault();
        } finally {
          setLoadingAI(false);
        }
      } else {
        fallbackToDefault(false);
      }
    };

    initializeLists();
  }, [formData, weatherData]);

  const toggleItem = (categoryId, itemId) => {
    setMemberLists(memberLists.map(member => {
      if (member.travelerId === activeTravelerId) {
        return {
          ...member,
          categories: member.categories.map(cat => {
            if (cat.id === categoryId) {
              return {
                ...cat,
                items: cat.items.map(item => 
                  item.id === itemId ? { ...item, checked: !item.checked } : item
                )
              };
            }
            return cat;
          })
        };
      }
      return member;
    }));
  };

  const addItem = () => {
    if (!newItemName.trim() || !activeTravelerId) return;

    setMemberLists(memberLists.map(member => {
      if (member.travelerId === activeTravelerId) {
        return {
          ...member,
          categories: member.categories.map(cat => {
            if (cat.title === newItemCategory) {
              return {
                ...cat,
                items: [...cat.items, {
                  id: Date.now(),
                  name: newItemName,
                  qty: newItemQty,
                  checked: false
                }]
              };
            }
            return cat;
          })
        };
      }
      return member;
    }));

    setNewItemName('');
    setNewItemQty(1);
  };

  const currentMember = memberLists.find(m => m.travelerId === activeTravelerId);
  const categories = currentMember ? currentMember.categories : [];

  let overallTotalItems = 0;
  let overallPackedItems = 0;
  memberLists.forEach(member => {
    member.categories.forEach(cat => {
      overallTotalItems += cat.items.length;
      overallPackedItems += cat.items.filter(i => i.checked).length;
    });
  });

  return (
    <div className="list-body">
      <nav className="navbar scrolled">
          <div className="nav-container">
              <Link to="/dashboard" className="logo">
                  <i className="fa-solid fa-suitcase-rolling"></i>
                  <span>PackSmart</span>
              </Link>
              <div className="nav-actions">
                  <Link to="/dashboard" className="btn btn-outline"><i className="fa-solid fa-arrow-left"></i> Back</Link>
                  <button className="btn btn-primary" id="export-pdf"><i className="fa-solid fa-file-pdf"></i> Export PDF</button>
              </div>
          </div>
      </nav>

      <div className="list-container">
          <div className="context-banner glass-card floating-animation" style={{ animationDelay: '0s', animationDuration: '8s' }}>
              <div className="context-header">
                  <h2>Packing List for <span className="gradient-text">{formData?.destination || 'Your Trip'}</span></h2>
                  <div className="progress-pill">
                      <span>{overallPackedItems}</span> / <span>{overallTotalItems}</span> Packed Overall
                  </div>
              </div>
              
              <div className="context-details">
                  <div className="context-item">
                      <i className="fa-regular fa-calendar"></i>
                      <div>
                          <span className="label">Dates</span>
                          <span className="value">
                            {formData?.startDate && formData?.endDate 
                              ? `${formData.startDate} to ${formData.endDate}` 
                              : 'Not specified'}
                          </span>
                      </div>
                  </div>
                  <div className="context-item">
                      <i className="fa-solid fa-cloud-sun"></i>
                      <div>
                          <span className="label">Weather</span>
                          <span className="value">{weatherData || 'Not analyzed'}</span>
                      </div>
                  </div>
                  <div className="context-item">
                      <i className="fa-solid fa-person-swimming"></i>
                      <div>
                          <span className="label">Trip Style</span>
                          <span className="value" style={{ textTransform: 'capitalize' }}>
                            {formData?.tripType ? (Array.isArray(formData.tripType) ? formData.tripType.join(', ') : formData.tripType) : 'General'}
                            {formData?.activities?.length > 0 ? ` • ${formData.activities.join(', ')}` : ''}
                          </span>
                      </div>
                  </div>
              </div>
          </div>

          {loadingAI ? (
            <div className="loading-area" style={{ margin: '4rem auto', textAlign: 'center', background: 'rgba(255,255,255,0.05)', padding: '3rem', borderRadius: '24px', maxWidth: '600px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                <i className="fa-solid fa-wand-magic-sparkles fa-bounce" style={{ fontSize: '4rem', color: 'var(--primary-color)', marginBottom: '1.5rem', display: 'inline-block' }}></i>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Generating personalized lists...</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Tailoring items for each traveler based on age, gender, and activities.</p>
            </div>
          ) : memberLists.length > 0 && (
            <>
              {apiError && (
                <div className="alert alert-warning" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <i className="fa-solid fa-triangle-exclamation"></i>
                  <div>
                    <strong>Gemini API Rate Limit Exceeded: </strong>
                    We are temporarily showing a default packing list because the AI quota limit was reached. Please wait a minute and try generating again.
                  </div>
                </div>
              )}
              {/* Traveler Selector */}
              <div className="traveler-tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                  {memberLists.map(m => (
                    <button 
                      key={m.travelerId}
                      className={`btn ${activeTravelerId === m.travelerId ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => setActiveTravelerId(m.travelerId)}
                      style={{ borderRadius: '20px', padding: '0.6rem 1.5rem', whiteSpace: 'nowrap', transition: 'all 0.3s ease' }}
                    >
                      <i className="fa-solid fa-user" style={{ marginRight: '0.5rem' }}></i>
                      {m.name}
                    </button>
                  ))}
              </div>

              <div className="list-layout">
                  <aside className="list-tools">
                      <div className="glass-card tools-card">
                          <div className="search-box">
                              <i className="fa-solid fa-magnifying-glass"></i>
                              <input 
                                type="text" 
                                placeholder="Search items..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                              />
                          </div>

                          <div className="add-item-box">
                              <h4>Add Custom Item</h4>
                              <p style={{fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.8rem'}}>Adding to {currentMember?.name}'s list</p>
                              <div className="add-form">
                                  <input 
                                    type="text" 
                                    placeholder="Item name..." 
                                    value={newItemName}
                                    onChange={(e) => setNewItemName(e.target.value)}
                                  />
                                  <div className="add-controls">
                                      <select value={newItemCategory} onChange={e => setNewItemCategory(e.target.value)}>
                                          {categories.map(c => <option key={c.id} value={c.title}>{c.title}</option>)}
                                      </select>
                                      <input 
                                        type="number" 
                                        value={newItemQty} 
                                        onChange={(e) => setNewItemQty(parseInt(e.target.value) || 1)} 
                                        min="1" 
                                      />
                                      <button className="btn btn-primary btn-sm" onClick={addItem}>
                                        <i className="fa-solid fa-plus"></i>
                                      </button>
                                  </div>
                              </div>
                          </div>

                          <div className="category-nav">
                              <h4>Categories</h4>
                              <ul id="category-nav-list">
                                  {categories.map(cat => {
                                    const checkedCount = cat.items.filter(i => i.checked).length;
                                    return (
                                      <li 
                                        key={cat.id} 
                                        className={activeCategory === cat.id ? 'active' : ''} 
                                        onClick={() => setActiveCategory(cat.id)}
                                      >
                                        {cat.title} <span className="badge">{checkedCount}/{cat.items.length}</span>
                                      </li>
                                    );
                                  })}
                              </ul>
                          </div>
                      </div>
                  </aside>

                  <main className="list-main">
                      {categories.map(cat => {
                        const filteredItems = cat.items.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
                        if (searchQuery && filteredItems.length === 0) return null;
                        if (!searchQuery && cat.id !== activeCategory) return null;

                        return (
                          <div key={cat.id} className="category-section glass-card">
                            <div className="category-header">
                                <h3>{cat.title}</h3>
                                <div className="category-progress">
                                    {cat.items.filter(i => i.checked).length} of {cat.items.length}
                                </div>
                            </div>
                            <ul className="item-list">
                                {filteredItems.map(item => (
                                  <li key={item.id} className={`packing-item ${item.checked ? 'packed' : ''}`}>
                                      <div className="item-left">
                                          <label className="custom-checkbox">
                                              <input 
                                                type="checkbox" 
                                                checked={item.checked} 
                                                onChange={() => toggleItem(cat.id, item.id)} 
                                              />
                                              <span className="checkmark"></span>
                                          </label>
                                          <span className="item-name">{item.name}</span>
                                      </div>
                                      <div className="item-right">
                                          <span className="item-qty">Qty: <span className="qty-val">{item.qty}</span></span>
                                          <button className="remove-btn" onClick={() => {
                                            setMemberLists(memberLists.map(member => {
                                              if (member.travelerId === activeTravelerId) {
                                                return {
                                                  ...member,
                                                  categories: member.categories.map(c => {
                                                    if(c.id === cat.id) return { ...c, items: c.items.filter(i => i.id !== item.id) };
                                                    return c;
                                                  })
                                                };
                                              }
                                              return member;
                                            }));
                                          }}><i className="fa-solid fa-trash-can"></i></button>
                                      </div>
                                  </li>
                                ))}
                            </ul>
                          </div>
                        );
                      })}
                  </main>
              </div>
            </>
          )}
      </div>
      
      <div className="blob blob-2" style={{ bottom: '-200px', right: '-100px', width: '600px', height: '600px', opacity: 0.3 }}></div>
    </div>
  );
};

export default List;
