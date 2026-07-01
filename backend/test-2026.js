const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

async function listModels() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  console.log("Searching for valid Gemini models (2.0 - 2.5)...");
  
  const models = [
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-2.0-flash",
    "gemini-2.0-pro",
    "gemini-1.5-flash"
  ];
  
  for (const m of models) {
    try {
      console.log(`Checking ${m}...`);
      const result = await ai.models.generateContent({
        model: m,
        contents: [{ role: "user", parts: [{ text: "hi" }] }]
      });
      console.log(`✅ ${m} is working! Response: ${result.text.substring(0, 20)}...`);
      return;
    } catch (e) {
      console.log(`❌ ${m} failed: ${e.message.split('"message":"')[1]?.split('"')[0] || e.message}`);
    }
  }
}

listModels();
