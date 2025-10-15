import { GoogleGenAI } from "@google/genai";

// WARNING: Storing API keys in client-side code is a security risk.
// An attacker could easily find and use your API key, leading to unexpected charges.
// For production applications, it is strongly recommended to make API calls
// from a backend server where the key can be stored securely.
// This key is used here for demonstration purposes as requested by the user.
const API_KEY = "AIzaSyAGhvZvnBV8HA10bVpa6h9Q61MMwA3j85w";

if (!API_KEY) {
    // This check is now somewhat redundant but good practice to keep.
    throw new Error("API_KEY is not set in the code.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function recognizeDigit(imageDataUrl: string): Promise<string> {
    try {
        const [meta, base64Data] = imageDataUrl.split(',');
        if (!meta || !base64Data) {
            throw new Error("Invalid image data URL format");
        }
        
        const mimeTypeMatch = meta.match(/:(.*?);/);
        const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/png';
        
        const imagePart = {
            inlineData: {
                mimeType,
                data: base64Data,
            },
        };

        const textPart = {
            text: "What single digit is drawn in this image? Respond with only the numerical digit from 0 to 9. If the image does not contain a recognizable single digit, respond with '?'. Do not provide any other explanation or text."
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });
        
        const text = response.text.trim();

        // Basic validation to ensure the response is a single character we expect
        if (text.length === 1 && ('0123456789?'.includes(text))) {
            return text;
        }

        console.warn(`Unexpected response from API: "${text}"`);
        return '?';
        
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("An error occurred while communicating with the AI service.");
    }
}
