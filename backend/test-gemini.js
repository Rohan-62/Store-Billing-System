const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

async function listModels() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: "Hello, confirm you are working." }] }]
    });
    console.log("Success:", result.text);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

listModels();
