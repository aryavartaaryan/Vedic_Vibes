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

        "type": "question",
            "isComplete": false,
                "activeVaidyaMessage": {
            "en": "[Natural response/question]?",
                "hi": "[स्वाभाविक प्रतिक्रिया/प्रश्न]?"
        }
    }
...[Keep the rest of JSON structure same]`;

        const cleanedMessages = (messages || [])
            .filter((m: any) => m && m.content && typeof m.content === 'string' && m.content.trim())
            .map((m: any) => ({
                role: m.role === 'assistant' || m.role === 'vaidya' ? 'VAIDYA' : 'PATIENT',
                content: m.content.trim()
            }));

        if (cleanedMessages.length === 0) {
            throw new Error("No messages provided");
        }

        const conversationHistory = cleanedMessages.map((m: any) => `${ m.role }: ${ m.content } `).join("\n");
        const isFirstMessage = cleanedMessages.every((m: any) => m.role === 'PATIENT');

        const fullPrompt = `${ systemPrompt }

    ---

### CONVERSATION HISTORY:
${ conversationHistory }

    ---

        Now respond as Acharya Pranav according to the conversation above.${ isFirstMessage ? ' This is the first message. **AGENTIC GREETING PROTOCOL**: 1. Start with "Ayushman Bhav". 2. Ask "Jivan kaisa chal raha hai?". 3. **PHILOSOPHICAL REASSURANCE (MANDATORY)**: Say "Beta, chinta na karein, sab theek ho jayega. Sansaar mein sukh aur dukh dono asthayi hain." 4. **NATURAL INQUIRY**: Ask: "Koi bhi sharirik ya mansik kasht ya samasya hai to batayein." 5. **SILENT AUTHORITY**: Show you are the Guru by your presence.' : ' Continue the conversation and ask your next diagnostic question (ONLY ONE simple question). **CRITICAL DIAGNOSIS RULE**: DO NOT ask user to guess the cause (e.g., "Is it due to stress?"). It is YOUR job to find the cause. Ask investigating questions (e.g., "What did you eat last night?", "How is your sleep?") and then YOU deduce the root cause.' } `;

        const result = await model.generateContent(fullPrompt);
        const responseText = result.response.text().replace(/```json\n ?| ```/g, '').trim();

        try {
            const parsedResponse = JSON.parse(responseText);
            return NextResponse.json(parsedResponse);
        } catch (parseError) {
            console.error("JSON Parse Error:", parseError);
            throw new Error("Invalid format received from Vaidya");
        }

    } catch (error: any) {
        console.error("Acharya Samvad API Error:", error);
        return NextResponse.json({
            type: "question",
            isComplete: false,
            activeVaidyaMessage: {
                en: "Close your eyes, take a deep breath, and tell me again—what troubles you?",
                hi: "अपनी आँखें बंद करें, गहरी साँस लें और मुझे पुनः बताएं—आपको क्या कष्ट है?"
            }
        });
    }
}
