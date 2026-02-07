import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import personality from '@/lib/sevak-personality.json';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Detect language from user input
function detectLanguage(text: string): 'hi' | 'en' | 'mixed' {
    const hindiChars = text.match(/[\u0900-\u097F]/g);
    const englishChars = text.match(/[a-zA-Z]/g);

    const hindiCount = hindiChars ? hindiChars.length : 0;
    const englishCount = englishChars ? englishChars.length : 0;

    if (hindiCount > englishCount * 2) return 'hi';
    if (englishCount > hindiCount * 2) return 'en';
    return 'mixed';
}

// Build system prompt based on personality config
function buildSystemPrompt(userLanguage: 'hi' | 'en' | 'mixed', pageContext?: string): string {
    const langInstruction = {
        hi: 'Reply in Shuddh Hindi or Hinglish. Use Devanagari script where appropriate.',
        en: 'Reply in clear, peaceful English with occasional Sanskrit/Hindi terms.',
        mixed: 'Reply in a natural mix of Hindi and English (Hinglish), matching the user\'s style.'
    };

    return `You are "${personality.identity.name}", ${personality.identity.role}.
Your purpose: ${personality.identity.purpose}

IDENTITY & TONE:
- Always begin first interactions with: ${personality.greetings.first_interaction.join(' OR ')}
- Address users as "Seeker" or "Aatman"
- Your tone is: ${personality.tone_guidelines.style}
- Use phrases like: ${personality.phrases.teaching_reference.join(', ')}
- Humble service: ${personality.phrases.humble_service.join(', ')}

LANGUAGE:
${langInstruction[userLanguage]}

VEDIC VOCABULARY (use these terms):
${Object.entries(personality.vocabulary).map(([eng, vedic]) => `- ${eng} → ${vedic}`).join('\n')}

DOMAIN KNOWLEDGE:
1. DIET: ${personality.domains.diet.focus}
   - Provide Dosha-based food recommendations
   - Suggest recipes from the Vedic Rasoi
   
2. YOGA/MEDITATION: ${personality.domains.yoga.focus}
   - Suggest specific Asanas or Dhyana techniques
   - Guide breathing exercises (Pranayama)
   
3. AYURVEDA: ${personality.domains.ayurveda.focus}
   - Explain Dosha imbalances
   - Provide holistic wellness guidance

CONSTRAINTS:
- If asked medical questions beyond website scope: "${personality.phrases.medical_boundary}"
- If you don't know: "${personality.phrases.unknown}"
- NEVER use: ${personality.tone_guidelines.avoid.join(', ')}
- Stay within the domains of Diet, Yoga, and Ayurveda

${pageContext ? `\nCURRENT PAGE CONTEXT:\n${pageContext}\n\nUse this context to answer questions about "this page" or "this recipe".` : ''}

Remember: You are a humble Sevak, devoted to serving seekers on their path to wellness.`;
}

export async function POST(request: NextRequest) {
    try {
        const { message, pageContext, conversationHistory, isFirstMessage } = await request.json();

        if (!message || typeof message !== 'string') {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        // Detect user's language
        const userLanguage = detectLanguage(message);

        // Build system prompt
        const systemPrompt = buildSystemPrompt(userLanguage, pageContext);

        // Initialize Gemini model
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-exp',
            systemInstruction: systemPrompt,
        });

        // Build conversation history
        const history = conversationHistory || [];

        // Generate response with streaming
        const chat = model.startChat({
            history: history.map((msg: any) => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }],
            })),
        });

        const result = await chat.sendMessageStream(message);

        // Create a readable stream for the response
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of result.stream) {
                        const text = chunk.text();
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
                    }
                    controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                    controller.close();
                } catch (error) {
                    controller.error(error);
                }
            },
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });

    } catch (error: any) {
        console.error('Sevak API Error:', error);
        return NextResponse.json(
            {
                error: 'The path to wisdom is temporarily obscured. Please try again.',
                details: error.message
            },
            { status: 500 }
        );
    }
}
