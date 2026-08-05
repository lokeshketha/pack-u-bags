async function test() {
  const geminiKey = process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY';
  const prompt = `Generate a personalized travel packing list for the following travelers traveling to Paris from 2026-07-01 to 2026-07-10. 
Trip type: sightseeing. Activities: walking, museum. Weather context: Sunny, 25C.

Travelers:
Traveler ID 1: 30 year old Female
Traveler ID 2: 5 year old Male

Return ONLY a JSON array without markdown formatting. Each object in the array MUST have:
1. "travelerId": matching the Traveler ID provided above (number)
2. "categories": an array of exactly 4 category objects. Each category object should have:
   - "id": a unique string (e.g. "cat-clothing")
   - "title": category title (e.g. "Clothing", "Electronics", "Documents", "Toiletries")
   - "items": an array of item objects with "id" (unique number), "name" (string), "qty" (number), "checked" (boolean set to false)

Generate at least 4 items per category, highly customized for EACH specific traveler's age, gender, and the trip details.`;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { response_mime_type: 'application/json' }
      })
    });
    const data = await res.json();
    if (data.candidates) {
        console.log(data.candidates[0].content.parts[0].text);
    } else {
        console.log("Error:", data);
    }
  } catch (err) {
    console.error(err);
  }
}

test();
