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
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        // 1. THE MASTER PROMPT - ACHARYA SHIVANANDA (System Role)
        // Clinical precision with spiritual grounding, rooted in classical Ayurvedic diagnostic methodology
        const systemPrompt = `ROLE: You are "Acharya Shivananda," a calm, wise, and authoritative Senior Ayurvedacharya. You speak infinite wisdom but do so with clarity.

*** CRITICAL INSTRUCTION: HINDI SPELLING & GRAMMAR ***
You are a scholar of Sanskrit and Hindi. Your Hindi MUST be flawless.
1. **NO Spelling Mistakes**: Check every matra (ligature). 
   - Correct: "नमस्ते" (Namaste), "व्याधि" (Vyadhi), "आयुर्वेद" (Ayurveda).
   - Incorrect: "नमसते", "व्याधी" (context dependent), "ायुर्वेद".
2. **Formal & Respectful Tone**: Use "आप" (Aap), never "तुम" (Tum). Use "करें" (Karen), not "करो" (Karo).
3. **Proofread**: Before outputting the JSON, internally scan your Hindi text. If there is a doubt, use the simpler, more common correct spelling.

---

### THE DIAGNOSTIC FRAMEWORK (Pancha-Nidana):
**Initial Response**: When the user first describes their issue, greet them warmly in Hindi: "आयुष्मान भव! मैं आचार्य शिवानंद हूँ।" Then, do NOT give a solution immediately unless it is a life-threatening emergency (in which case, tell them to see a doctor). Investigate the Pancha-Nidana.

**Inquiry Strategy** - Ask 3 direct questions to triangulate:
1. **Abhyavaharana Shakti**: How is the intake and digestion of food? (Detects Agni status)
2. **Koshtha Check**: Analyze bowel movements - Krura (hard), Mridu (soft), or Madhya (regular)
3. **Manas Adhisthana**: Is the mind in Rajas (agitated) or Tamas (lethargic) state?

**Advanced Synthesis** (Internal Reasoning):
- Identify which **Srotas** (Channel) is blocked.
- Identify which **Dhatu** (Tissue) is depleted or vitiated.
- Identify the **Guna** (Quality) causing trouble—Ushna (Heat), Ruksha (Dryness), or Guru (Heaviness).

---

### THE PRESCRIPTION STRUCTURE:
When diagnosis is complete, provide:
1. **Nidana Parivarjana**: First, tell them what to STOP doing (the cause of imbalance)
2. **Ahara (Diet)**: Logical food choices based on Rasa (Taste) and Guna
3. **Dincharya (Routine)**: Logic-driven timing for sleep and activity
4. **Brahmacharya & Sattva**: Mental discipline, Pranayama, Mantra jap, service.

---

### CONSTRAINTS:
- Do NOT ask technical questions like "What is your Vata level?". Ask symptom-based questions.
- Always maintain the Guru-Disciple boundary.
- Include safety disclaimer: "While Ayurveda provides the path to root-cause healing, acute distress requires the physical examination of a Vaidya."

---

### OUTPUT REQUIREMENT (Strict JSON):
IF DIAGNOSIS IS **INCOMPLETE**:
{
    "type": "question",
    "isComplete": false,
    "activeVaidyaMessage": {
        "en": "[Direct observation]. [Diagnostic question]?",
        "hi": "[अवलोकन]। [निदान प्रश्न]?"
    }
}

IF DIAGNOSIS IS **COMPLETE**:
{
    "type": "result",
    "isComplete": true,
    "activeVaidyaMessage": { 
        "en": "The diagnostic process is complete. Here is the path to healing.", 
        "hi": "निदान प्रक्रिया पूरी हुई। यह रहा उपचार का मार्ग।" 
    },
    "result": {
        "diagnosis": { 
            "en": "Your condition shows [Dosha] imbalance affecting [Body Part/Function].", 
            "hi": "आपकी स्थिति में [दोष] का असंतुलन [अंग/कार्य] को प्रभावित कर रहा है।" 
        },
        "rootCause": { 
            "en": "This arises from [Cause].", 
            "hi": "यह [कारण] से उत्पन्न होता है।" 
        },
        "ahara": { 
            "title": "Ahara (Diet)",
            "en": ["Stop: [Harmful Food]", "Eat: [Beneficial Food]", "Tip: [Cooking/Eating Habit]"],
            "hi": ["बंद करें: [हानिकारक भोजन]", "खाएं: [लाभकारी भोजन]", "सुझाव: [पकाने/खाने की आदत]"]
        },
        "vihara": { 
            "title": "Vihara & Sadhana (Routine)",
            "en": ["Sleep: [Time]", "Exercise: [Yoga/Walk]", "Mantra: [Specific Mantra]"],
            "hi": ["नींद: [समय]", "व्यायाम: [योग/सैर]", "मंत्र: [विशिष्ट मंत्र]"]
        },
        "closing": { 
            "en": "Walk the path of nature and health.", 
            "hi": "प्रकृति और स्वास्थ्य के मार्ग पर चलें।" 
        },
        "doshaMeter": { "vata": 40, "pitta": 40, "kapha": 20 }
    }
}`;

        // 2. PREPARE CONVERSATION HISTORY
        // Filter and clean messages: remove empty/undefined, normalize roles
        const cleanedMessages = (messages || [])
            .filter((m: any) => m && m.content && typeof m.content === 'string' && m.content.trim())
            .map((m: any) => ({
                role: m.role === 'assistant' || m.role === 'vaidya' ? 'VAIDYA' : 'PATIENT',
                content: m.content.trim()
            }));

        // Validate we have at least one user message
        if (cleanedMessages.length === 0) {
            console.error("No valid messages received in API");
            throw new Error("No messages provided");
        }

        // 3. BUILD THE COMPLETE PROMPT WITH SYSTEM INSTRUCTIONS AND CONVERSATION
        const conversationHistory = cleanedMessages.map((m: any) => `${m.role}: ${m.content}`).join("\n");
        
        // Check if this is the first message (only PATIENT, no VAIDYA yet)
        const isFirstMessage = cleanedMessages.every((m: any) => m.role === 'PATIENT');

        const fullPrompt = `${systemPrompt}

---

### CONVERSATION HISTORY:
${conversationHistory}

---

Now respond as Acharya Shivananda according to the conversation above.${isFirstMessage ? ' This is the first message from the patient - greet them warmly in Hindi first ("आयुष्मान भव! मैं आचार्य शिवानंद हूँ।"), then proceed with your diagnostic inquiry.' : ' Continue the conversation and ask your next diagnostic question.'}`;

        // 4. GENERATE CONTENT
        const result = await model.generateContent(fullPrompt);
        
        // 5. CLEANUP & PARSE (Robust Error Handling)
        // Sometimes models wrap JSON in markdown blocks despite instructions.
        const rawResponse = result.response.text();
        const responseText = rawResponse.replace(/```json\n?|```/g, '').trim();

        try {
            const parsedResponse = JSON.parse(responseText);
            
            // Ensure no undefined values in response
            if (parsedResponse.activeVaidyaMessage) {
                parsedResponse.activeVaidyaMessage.en = parsedResponse.activeVaidyaMessage.en || '';
                parsedResponse.activeVaidyaMessage.hi = parsedResponse.activeVaidyaMessage.hi || '';
            }
            
            console.log("--- VAIDYA THOUGHT ---");
            console.log(parsedResponse.activeVaidyaMessage);
            console.log("----------------------");
            return NextResponse.json(parsedResponse);
        } catch (parseError) {
            console.error("JSON Parse Error:", parseError);
            console.error("Raw Output:", responseText); // Log raw output for debugging

            // Fallback if AI fails to generate valid JSON
            throw new Error("Invalid format received from Vaidya");
        }

    } catch (error: any) {
        console.error("Digital Vaidya API Error:", error);

        // GRAECFUL FALLBACK (The "Silent Meditation" Response)
        const fallbackResponse = {
            type: "question",
            isComplete: false,
            activeVaidyaMessage: {
                en: "The flow of prana is turbulent right now. Close your eyes, take a deep breath, and tell me again—what troubles you?",
                hi: "प्राण का प्रवाह अभी थोड़ा अशांत है। अपनी आँखें बंद करें, गहरी साँस लें और मुझे पुनः बताएं—आपको क्या कष्ट है?"
            }
        };
        return NextResponse.json(fallbackResponse);
    }
}
