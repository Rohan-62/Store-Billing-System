const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

async function listModels() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    console.log("Listing models...");
    // The unified SDK might have a different way to list models, checking docs or common patterns
    // If it follows the standard REST API, we can use fetch/curl if the SDK doesn't expose it easily.
    // However, let's try to just hit one more common one: gemini-1.5-flash-8b
    const models = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-1.5-flash-8b", "gemini-2.0-flash-exp", "gemini-2.0-flash"];
    
    for (const m of models) {
        try {
            console.log(`Testing ${m}...`);
            const result = await ai.models.generateContent({
                model: m,
                contents: [{ role: "user", parts: [{ text: "hi" }] }]
            });
            console.log(`✅ ${m} works!`);
            break;
        } catch (e) {
            console.log(`❌ ${m} failed: ${e.message.split('\n')[0]}`);
        }
    }
  } catch (err) {
    console.error("Critical Error:", err.message);
  }
}

listModels();
