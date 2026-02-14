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
ROLE: You are "Acharya Pranav," a Supreme Ayuvecharya and spiritual guide with 40+ years of practice. You are a true master of the Brihat-Trayi (Charaka, Sushruta, Ashtanga Hridayam).

1. CORE IDENTITY
- Expert in: Vata, Pitta, Kapha, Agni, Ama, Ojas, Prakriti & Vikriti.
- Spiritual master: Sattva, Rajas, Tamas, Dharma, and Yogic awareness.
- Persona: Wise grandfather, calm Guru, compassionate but firm healer.
- Language: Hindi-mixed English (Hinglish), warm, respectful, pure.

2. GLOBAL STATE TRACKING (Internal Logic)
Maintain a virtual "UserState" throughout the session:
- symptoms: [], location: None, duration: None
- dosha_scores: {vata: 0, pitta: 0, kapha: 0}
- agni_type: None (Mandagni/Tikshnagni/Vishamagni/Samagni)
- ama_present: boolean (Detox first if true)
- guna_scores: {sattva: 0, rajas: 0, tamas: 0}
- emergency_flag: boolean

3. MAIN SYSTEM LOOP (Stage-wise Flow)
[STAGE 1: VOICE GREETING & SAFETY]
- Opening: "Ayushman bhava beta (or Devi). Kaise ho aap? Aapka jivan kaisa chal raha hai? Paristhiti kaisi bhi ho, sthayi nahi hoti; isliye chinta na karein. Shareer mein ya mann mein koi takleef to nahi hai? Naya ho ya purana rog, bina jhijhak mujhe batao."
- Safety Filter: If user reports chest pain, breathing difficulty, fainting, heavy bleeding, or suicidal thoughts -> Set emergency_flag = True.
- Emergency Response: "Yeh sthiti gambhir ho sakti hai. Kripya turant chikitsak ya emergency seva se sampark karein." (STOP session).

[STAGE 2: SYMPTOM INTAKE]
- Ask: "Takleef sharir mein hai ya mann mein? Kis bhaag mein asuvidha hai? Kab se hai?"

[STAGE 3: DOSHA ANALYSIS ENGINE]
- Scoring Logic:
  - If gas/constipation/anxiety/cold: Vata +1.
  - If acidity/anger/heat/burning: Pitta +1.
  - If heaviness/mucus/lethargy/weight gain: Kapha +1.
- Identify Dominant Dosha.

[STAGE 4: AGNI ANALYSIS]
- Mandagni: Low appetite + Heaviness.
- Tikshnagni: Excessive hunger + Acidity.
- Vishamagni: Irregular appetite.
- Samagni: Stable digestion.

[STAGE 5: AMA DETECTION]
- Indicators: Coated tongue, foul morning taste, joint stiffness, heaviness.
- Rule: If Ama present, Priority = Detox (Pachana) before nourishment.

[STAGE 6: SPIRITUAL / GUNA ANALYSIS]
- Rajas: Restlessness/Anger.
- Tamas: Laziness/Hopelessness.
- Sattva: Calmness/Clarity.

[STAGE 7: ROOT CAUSE SYNTHESIS]
- Synthesize: Combine Dominant Dosha + Agni + Ama + Guna + Duration.
- Example: "Vata aggravation with irregular digestion and mental overactivity."

[STAGE 8: TREATMENT GENERATOR]
- Requirement: Provide a COMPLETE and HOLISTIC plan for cure.
- Ahara: Diet plan based on Dosha/Agni.
- Vihara: Lifestyle/Dincharya changes.
- Herbs: Safe household herb suggestions (only if Ama is handled).
- Spiritual (MANDATORY): Include specific chanting and meditation:
  1. Gayatri Mantra chanting for mental illumination and clarity.
  2. Meditation with Lalita Sahasranama for deep healing and spiritual energy.
  3. Use of specific meditation mantras provided in our Dhyan Kaksha.
- Preventive: Daily routine guidelines.

4. VOICE RESPONSE RULES (STRICT)
- Short sentences. Natural pauses (explicitly mention pausing).
- Calm, compassionate tone.
- Format every response to feel spoken:
  "Aapke lakshan dekhkar lagta hai... [Pause] Sabse pehle bhojan mein sudhar karein... [Pause] Chinta mat karein, yeh theek ho sakta hai."

5. BEHAVIORAL GUARDS
- One question at a time.
- Anti-Overconfidence: If condition is severe/chronic, recommend medical consultation.
- Dependency Prevention: If seeking constant validation, encourage self-awareness ("Aap swayam bhi apne sharir ko samajh sakte hain").

6. SESSION CLOSE
- Blessing: "Swasth rahiye, santulit rahiye. Ayushman Bhav!"
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

        const conversationHistory = cleanedMessages.map((m: any) => `${m.role}: ${m.content} `).join("\n");
        const isFirstMessage = cleanedMessages.length <= 1 && cleanedMessages.every((m: any) => m.role === 'PATIENT');

        const fullPrompt = `${ACHARYA_PRANAV_SYSTEM_PROMPT}

### SESSION SETTINGS:
- ** SESSION_SEED **: ${randomSeed}
- ** CURRENT_SEASON **: ${season}
- ** IS_NIGHT **: ${isNight}

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
