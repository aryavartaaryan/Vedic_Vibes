import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const { ingredients } = await req.json();

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ success: false, error: "Temple keys (API Key) are missing." }, { status: 500 });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
            You are a Vedic Culinary expert and Ayurvedic Rishi. 
            Based on these ingredients: ${ingredients.join(", ")}, manifest 2-3 healing Sattvic recipes.
            
            STRICT VEDIC RULES:
            1. NO Onion, NO Garlic, NO Mushrooms, NO Meat, NO Eggs.
            2. Focus on Prana, Agni (digestive fire), and Dosha balance.
            3. Include a relevant Sanskrit Mantra for each recipe or the whole session.
            4. Provide an "ayurvedicInsight" explaining the compatibility of these ingredients.
            
            
            RETURN ONLY A JSON OBJECT with this structure:
            {
                "success": true,
                "recipes": [
                    {
                        "id": "string",
                        "title": { "hi": "Hindi Title", "en": "English Title" },
                        "description": { "hi": "...", "en": "..." },
                        "ingredients": [ { "name": { "hi": "...", "en": "..." }, "quantity": "..." } ],
                        "instructions": { "hi": ["step1", "step2"], "en": ["step1", "step2"] },
                        "doshaEffect": { "hi": "...", "en": "..." },
                        "prepTime": number,
                        "cookTime": number,
                        "difficulty": "Easy",

                    }
                ],
                "ayurvedicInsight": {
                    "isCompatible": boolean,
                    "analysis": { "hi": "...", "en": "..." },
                    "doshaBalance": { "hi": "...", "en": "..." },
                    "recommendations": { "hi": ["...", "..."], "en": ["...", "..."] }
                }
            }
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Clean up any markdown code blocks if the model included them
        const cleanJson = responseText.replace(/```json|```/g, "").trim();
        const data = JSON.parse(cleanJson);


        return NextResponse.json(data);
    } catch (e: any) {
        console.error("Gemini API Error:", e);
        return NextResponse.json({
            success: false,
            error: "The Rishis are silent: " + e.message
        }, { status: 500 });
    }
}
