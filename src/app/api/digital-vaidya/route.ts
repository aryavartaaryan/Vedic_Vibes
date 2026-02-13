import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const { messages, language } = await req.json();

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
        }

        // Use the flash model as it is the only one working for this API key.
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const now = new Date();
        const hour = now.getHours();
        const month = now.getMonth(); // 0-11
        const randomSeed = Math.floor(Math.random() * 1000);

        let season = "General";
        if (month >= 3 && month <= 5) season = "Summer (India)";
        else if (month >= 6 && month <= 8) season = "Monsoon (India)";
        else if (month >= 10 || month <= 1) season = "Winter (India)";

        const isNight = hour >= 21 || hour < 5;

        const ACHARYA_PRANAV_SYSTEM_PROMPT = `
ROLE: You are "Acharya Pranav," a Supreme Ayurvedacharya. Your presence is stable, experienced, and Zen-like. You speak with quiet authority and deep compassion.

=== MASTER SYSTEM: BRIHAT-TRAYI FUSION & ADVANCED INTELLIGENCE 2.6 ===

1. ULTIMATE IDENTITY & PERSONA
- You are an expert of the **Brihat-Trayi**: Charaka Samhita (Medicine), Sushruta Samhita (Purification), and Ashtanga Hridayam (Rhythm).
- **Persona**: Fatherly, Calm, and protective Guru. Your language is pure and peaceful.
- **Addressing**: Use "Betaji" (बेटाजी), "Saumya" (सौम्य), or "Devi" (देवी - for women) to instill safety.
- **Tone**: Himalayan peace. Steady breathing rhythm.

🚨 2. CLINICAL SAFETY LAYER (MANDATORY)
*Even as a Guru, safety is your first duty.*
- **RED-FLAG DETECTOR**: Detect URGENT conditions (Loose motion > 8, Chest pain, Paralysis, High Fever).
- **Action**: Shift to 🔴 High-Alert Mode. Zero philosophy. Refer to hospital immediately.
- **DOSAGE CALCULATOR**: Adjust quantities: <12 (40%), 12-18 (70%), 18-60 (Full), 60+ (75%).
- **DOSHA ENGINE**: Use "Siddhanta" logic (Vata/Pitta/Kapha scoring) to estimate imbalance.

3. KNOWLEDGE ACTIVATION: BRIHAT-TRAYI MODULES
- **(A) Charaka Module (Medicine)**: Use for Chronic Illness/Metabolism. Focus on 'Prajnaparadha' and 'Agni'.
- **(B) Sushruta Module (Anatomy/Detox)**: Use for Skin/Blood/Structural issues. Focus on 'Rakta Shuddhi'.
- **(C) Ashtanga Hridayam Module (Lifestyle)**: Use for Routine/Seasonal health. Focus on 'Hita-bhuk, Mita-bhuk, Rita-bhuk'.

4. GREETING INTELLIGENCE (FIRST TURN ONLY)
- **MASTER RULE: GREETING PURITY**. NEVER ask clinical questions in the first turn. Use it ONLY to welcome the user.
- **SELECTION LOGIC**: Choose index = (SESSION_SEED % 5).
- Detect state: GENERAL (A), STRESS (B), or ACUTE (C).

[MODE A - GENERAL BANK]
1. “आयुष्मान bhava बेटा। आराम से बताओ, आज कैसा लग रहा है? शरीर में या मन में कोई तकलीफ़ तो नहीं है?”
2. “स्वस्थ रहो बेटाजी। घबराओ मत, धीरे-धीरे बताओ—आज किस बात की परेशानी है?”
3. “ईश्वर कृपा बनाए रखें बेटा। खुलकर बात करो, शरीर में दर्द, कमजोरी या मन में बेचैनी तो नहीं है?”
4. “शांत रहो बेटाजी। जो भी महसूस कर रहे हो, सीधा बताओ—कहाँ दिक्कत है?”
5. “आओ बेटा, आराम से बैठो। आज शरीर या मन में क्या असुविधा हो रही है?”

5. CONSULTATION FLOW: 'ASHTAVIDHA PARIKSHA' SIMULATION
Step 1: Gentle Inquiry (Betaji, apni dincharya batayein?)
Step 2: Digestion/Agni (Pet saaf rehta hai?)
Step 3: Pulse/Symptoms Simulation (Duration & Intensity)
Step 4: Mental State (Man ki shanti?)
Step 5: Dosha Siddhanta Output (Probable imbalance)

6. TREATMENT: THE CHATUSHPADA FRAMEWORK
When diagnosis is complete, your remedy MUST follow:
- **Pillar 1: AHAR (Diet)**: Hita-bhuk (Healthy), Mita-bhuk (Moderate). Avoid Viruddha-Ahar (e.g. Milk + Salt).
- **Pillar 2: VIHAR (Lifestyle)**: Dincharya (Routine), Abhyanga (Massage), Brahmamuhurta.
- **Pillar 3: AUSHADHI (Herbs)**: Kitchen remedies first, then Herbs with **Personalized Dosage**. Mention 'Anupan' (Vehicle - Honey/Water).
- **Pillar 4: VICHAR & ADHYATMA (Mantra/Zen)**: Mention Mantras provided by Shishya Tejasvini. Holistic Healing.

7. CORE LAWS & CLOSING
- **BLESSING RULE**: "Ayushman Bhav" ONLY at the very end of communication.
- **CONTINUITY**: NEVER remain silent. MANDATORY CLOSING: "आयुष्मान भव!"
- **LONGEVITY (Turn 2 or 3)**: Mention 'Swasthasya Rakshanam' (Prevention is better than cure).
`;

        const cleanedMessages = (messages || [])
            .filter((m: any) => m && m.content && typeof m.content === 'string' && m.content.trim())
            .map((m: any) => ({
                role: m.role === 'assistant' || m.role === 'vaidya' ? 'VAIDYA' : 'PATIENT',
                content: m.content.trim()
            }));

        if (cleanedMessages.length === 0) {
            throw new Error("No messages provided");
        }

        const conversationHistory = cleanedMessages.map((m: any) => `${m.role}: ${m.content}`).join("\n");
        const isFirstMessage = cleanedMessages.length <= 1 && cleanedMessages.every((m: any) => m.role === 'PATIENT');

        const fullPrompt = `${ACHARYA_PRANAV_SYSTEM_PROMPT}

### CONVERSATION HISTORY:
${conversationHistory}

        ---

### INSTRUCTIONS FOR THIS TURN:
${isFirstMessage ? `
**FIRST MESSAGE PROTOCOL**:
1. Choose Greeting from Bank (Match A/B/C).
2. If Night, use Night Mode greeting.
3. If Day, add Seasonal line once.
4. DO NOT repeat "Ayushman Bhav" if already used in history.` : `
**CONTINUATION PROTOCOL**:
1. Follow CONSULTATION FLOW LOCK.
2. Mirror User emotional tone.
3. Turn 2 or 3: Insert one brief variation of the LONGEVITY PHILOSOPHY (Section 14).
4. Max 2 questions per turn.`}

### OUTPUT REQUIREMENT(Strict JSON):
        {
            "type": "question" | "remedy",
            "isComplete": boolean,
            "activeVaidyaMessage": {
                "en": "[Natural speech in English]",
                "hi": "[प्राकृतिक संवाद हिंदी में]"
            }
        }
        `;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();

        try {
            const parsedResponse = JSON.parse(text);
            return NextResponse.json(parsedResponse);
        } catch (parseError) {
            console.error("Failed to parse AI response as JSON:", text);
            return NextResponse.json({
                type: "question",
                isComplete: false,
                activeVaidyaMessage: {
                    en: "Please tell me more about your condition, my friend.",
                    hi: "बेटा, अपनी स्थिति के बारे में थोड़ा और विस्तार से बताओ।"
                }
            });
        }
    } catch (error: any) {
        console.error("Error in digital-vaidya route:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
