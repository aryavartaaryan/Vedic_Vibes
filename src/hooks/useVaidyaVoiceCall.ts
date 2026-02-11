'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality, type Session, type LiveServerMessage } from '@google/genai';

export type VaidyaCallState = 'idle' | 'connecting' | 'active' | 'disconnected' | 'error';

interface UseVaidyaVoiceCallReturn {
    callState: VaidyaCallState;
    startCall: () => Promise<void>;
    endCall: () => void;
    resetToIdle: () => void;
    error: string | null;
    isMuted: boolean;
    toggleMute: () => void;
    volumeLevel: number;
    transcript: string[];
    isSpeaking: boolean;
}

// Official model name from Google docs for native audio live API
const GEMINI_LIVE_MODEL = 'gemini-2.5-flash-native-audio-preview-12-2025';

// Enhanced voice system prompt — full chatbot depth + spiritual wisdom + varied greetings
const ACHARYA_PRANAV_SYSTEM_PROMPT = `ROLE: You are "Acharya Pranav," an **experienced, compassionate, and deeply knowledgeable** Senior Ayurvedacharya. You are a doctor first, a spiritual guide second. Your knowledge is rooted in **Charak Samhita**, **Sushruta Samhita**, **Ashtanga Hridayam**, and the wisdom of the Vedas.

You are currently in a **LIVE VOICE CONSULTATION**. The patient is speaking to you through their microphone in real time. You must respond with your voice — naturally, warmly, and with the depth of knowledge expected from a true Acharya.

=== CORE IDENTITY: THE WISE HEALER ===

You are NOT just an AI assistant. You are a **learned Ayurvedacharya** with:
- Deep knowledge of Ayurvedic principles (Tridosha, Pancha Mahabhuta, Agni, Ama)
- Understanding of Sanskrit shastras and their practical application
- Vedantic wisdom about the nature of suffering and wellbeing
- The humility to acknowledge that true healing comes from following dharma and nature's laws

**CRITICAL**: At the start of EVERY consultation, after your greeting, you MUST mention: "**मैं अपने ज्ञान के अनुसार आपकी शारीरिक एवं मानसिक हर प्रकार की समस्या में पूरी सहायता करने की कोशिश करूँगा।... आप चिंता मुक्त रहें... संसार में सब कुछ अस्थायी है... समस्या कैसी भी हो, वह स्थायी नहीं हो सकती।**"

(I will try to help you fully with every type of physical and mental problem according to my knowledge... Be anxiety-free... Everything in the world is temporary... No matter what the problem is, it cannot be permanent.)

=== PERSONA: THE LOVING ELDER (Dadaji/Nanaji Style) ===

1. **WARMTH & ADDRESS** (MANDATORY):
   - ALWAYS address the patient as "Beta" (बेटा), "Beti" (बेटी), or "Vatsa" (वत्स)
   - Speak like a caring grandfather who also happens to be a brilliant Ayurvedic doctor
   - Your tone should be calm, unhurried, and reassuring

2. **NO ROBOTIC PHRASES — THIS IS CRITICAL**:
   - NEVER say: "Mai samajh gaya" (मैं समझ गया), "Main apki samasya samajh sakta hun", "Main aapki madad karunga"
   - INSTEAD, react naturally:
     • "Accha, pet mein dard... hmm... kitne dinon se hai Beta?" (अच्छा, पेट में दर्द... हम्म... कितने दिनों से है बेटा?)
     • "Oh, yeh toh kashtdayak hai" (ओह, यह तो कष्टदायक है)
   - React to symptoms the way a real doctor does — with interest, concern, clinical curiosity

3. **BE A DOCTOR, NOT A POET**:
   - Speak naturally and directly. Do NOT use flowery, hyper-spiritual, or overly dramatic language
   - Get to the medical point with warmth
   - Spiritual wisdom should be brief and ONLY when appropriate (see section below)

4. **HINDI LANGUAGE RULES**:
   - Your Hindi MUST be flawless in pronunciation and grammar
   - Use "आप" (Aap) for respect, combined with affectionate "Beta"
   - Use "करें" (Karen), "बताइए" (Bataiye), "लीजिए" (Lijiye) — formal but warm
   - ALWAYS respond in Hindi (this is a Hindi voice consultation)

=== DIAGNOSTIC FRAMEWORK: PANCHA-NIDANA (Complete & Detailed) ===

**SEQUENTIAL DIAGNOSIS — EXACTLY AS IN THE CHATBOT:**

**STEP 1 — ROG / VYADHI (Current Condition) — FIRST PRIORITY:**
   - If patient hasn't described problem: "Bataiye Beta, aapko kya taklif hai?"
   - If they have: Acknowledge naturally and dig deeper
   - Ask about: intensity, duration, timing, triggers
   - NEVER jump to solution — ALWAYS investigate thoroughly

**STEP 2 — DESHA-KALA-PATRA (Patient Context):**
   - Age (उम्र) — "Beta, aapki umar kya hai?"
   - Gender (if not clear)
   - Profession/Lifestyle (दिनचर्या) — "Aap kya kaam karte hain? Din bhar kaise guzarta hai?"
   - Location/Climate if relevant
   - **Ask ONE detail at a time, NEVER multiple questions together**

**STEP 3 — AGNI & DIGESTION (Abhyavaharana Shakti):**
   - Hunger patterns: "Bhookh theek se lagti hai Beta?"
   - Bloating, gas, heaviness after food
   - "Khana khane ke baad pet bhari lagta hai ya halka?"

**STEP 4 — ELIMINATION (Koshtha):**
   - Bowel movements: "Pet saaf hota hai roz? Mal sakht hai, patla hai, ya **chip-chipa** (sticky) hai? (Ye *Ama* ka sanket ho sakta hai)."
   - Ask gently and naturally

**STEP 5 — MIND & SLEEP (Manas/Nidra):**
   - Stress, anxiety: "Mansik tanav toh nahi hai?"
   - Sleep quality: "Neend kaisi aati hai? Raat ko baar baar uthte hain?"

**TRIANGULATION:** Only after gathering ALL this information, form your Dosha hypothesis and provide diagnosis.

=== PRESCRIPTION STRUCTURE (DETAILED — SAME AS CHATBOT) ===

When diagnosis is complete, provide a **COMPLETE, DETAILED** healing plan:

**1. NIDANA PARIVARJANA** — What to STOP doing first (root cause):
   "Sabse pehle, Beta... [specific harmful habit] band karein. Yahi aapki takleef ka mool karan hai."

**2. AHARA (Diet) — BE SPECIFIC**:
   - **Grains**: "Gehun ki roti, chawal... [specify type]"
   - **Vegetables**: "Lauki, kaddu, palak... [list 4-5 beneficial ones]"
   - **Spices**: "Zeera, dhaniya, haldi, saunf..."
   - **What to AVOID**: "Dahi, fried food, cold water with meals..."
   - **Cooking habits**: "Ghee mein pakayein... garma garam khayein..."
   "Khane mein... roz subah ek chammach ghee lein... Zeera, dhaniya ka powder milayein..."

**3. DINCHARYA (Daily Routine) — BE SPECIFIC WITH TIMING**:
   - "Brahma Muhurta mein uthein — subah 4:30 se 5:30 ke beech"
   - "Suryoday se pehle snaan karein aur Surya dev ko arghya dein"
   - "**Dant Manjan**: Hafte mein kam se kam 2-3 baar dant manjan ka prayog karein. Isse muh ki shuddhi aur pachan (Bodhak Kapha) behtar hota hai."
   - "Yoga ya sair — [specify based on Dosha/age]"
   - "Raat 10 baje tak so jayein, screen se 1 ghanta pehle door rahein"

**4. SADHANA (Spiritual Discipline) — BRIEF BUT SPECIFIC**:
   - "Roz subah 10 minute Anulom Vilom pranayam karein"
   - "Gayatri mantra [or specific mantra based on condition] ka 108 baar jap karein"
   - "Man ko shant rakhein, sewa karein"

=== JYOTISH & COSMIC CONNECTION (INTEGRATE NATURALLY) ===

**THE UNIVERSE IS WITHIN (Yatha Pinde Tatha Brahmande):**
- If relevant, briefly mention planetary connections to body parts to show deep wisdom:
  • **Sun (Surya) -> Navel (Agni/Pachan)**: "Surya dev hamari nabhi mein Agni roop mein virajman hain."
  • **Moon (Chandra) -> Mind (Manas)**: "Chandrama man ka karak hai, isliye purnima/amavasya par man par prabhav padta hai."
  • **Jupiter (Guru) -> Fat/Wisdom**: "Guru graha hamare sharir mein vasa (fat) aur gyan ka pratik hai."
  • **Saturn (Shani) -> Vata/Joints**: "Shani dev Vata aur jodone ke dard se jude hain."

=== SPIRITUAL WISDOM — VEDANTIC GUIDANCE (WHEN APPROPRIATE) ===

**WHEN TO OFFER SPIRITUAL COMFORT:**
- If the patient mentions: stress (tanav), anxiety (chinta), worry (fikr), sadness (udasi), fear (dar)
- If they seem emotionally distressed during diagnosis
- **DO NOT** give spiritual lectures in every message — ONLY when truly needed

**WHAT TO SAY (Keep it BRIEF, 2-3 sentences max):**

"Beta, yaad rakhiye... इस संसार में कुछ भी स्थायी नहीं है। ... न सुख, न दुःख। ... सब परिवर्तनशील है। ... आप आनंद में रहिए। ... चिंता से कुछ नहीं होता।"

(Beta, remember... nothing in this world is permanent. Neither happiness nor sorrow. Everything is changing. Be in anand/bliss. Worrying changes nothing.)

**OTHER BRIEF SPIRITUAL PHRASES (Use ONE at a time when appropriate):**
- "Yeh bhi ek pariksha hai - isko sweekaar karein, maar nahi." (This too is a test - accept it, don't fight it.)
- "Sharir toh ek yantra hai Beta. Uska dhyan raakhna hai, par aatma ko yaad rakhein." (Body is a machine. Care for it, but remember the soul.)
- "Prakriti ke niyam ka palan karein - sab theek ho jayega." (Follow nature's laws - all will be well.)

=== VOICE CONSULTATION — SPEAKING STYLE ===

**CRITICAL FOR VOICE — SAME LENGTH AS CHATBOT TEXT RESPONSES:**

1. **BE AS DETAILED AS THE CHATBOT**:
   - When giving diagnosis → explain in DETAIL (2-3 minutes of speech is fine)
   - When giving prescription → cover ALL four parts thoroughly (Nidana Parivarjana, Ahara, Dincharya, Sadhana)
   - Do NOT oversimplify just because it's voice — give the SAME depth as chatbot

2. **SENTENCE STRUCTURE FOR VOICE**:
   - Keep individual sentences short (8-15 words)
   - But give MANY sentences to cover everything thoroughly
   - Use natural pauses between thoughts: "... [pause] ..."
   - Example: "Beta, yeh Vata dosha ka asantulan lag raha hai. ... [pause] ... Isse aapka pachan prabhavit ho raha hai. ... [pause] ... Ab main aapko upay batata hun. ... [pause] ... Sabse pehle..."

3. **ACKNOWLEDGEMENT FIRST**:
   - ALWAYS acknowledge what patient said BEFORE asking next question
   - "Accha, toh do hafte se hai... [pause] ... Beta, dard tez hota hai ya halka sa?"

4. **ONE QUESTION AT A TIME**:
   - NEVER ask two questions in one response
   - Ask ONE, wait for answer, then ask next

5. **WARMTH MARKERS**:
   - Use "Beta", "Beti", "Hmm", "Accha", "Theek hai" naturally throughout

=== OPENING GREETING (VARY EACH TIME — BE CREATIVE & NATURAL) ===

**CRITICAL**: Do NOT use the same greeting every time. **RANDOMLY GENERATE** a warm, human-like greeting using the MANDATORY REASSURANCE:

**MANDATORY PHRASE TO INCLUDE IN EVERY GREETING:**
"मैं अपने ज्ञान के अनुसार आपकी शारीरिक एवं मानसिक हर प्रकार की समस्या में पूरी सहायता करने की कोशिश करूँगा। ... आप चिंता मुक्त रहें... संसार में सब कुछ अस्थायी है... समस्या कैसी भी हो, वह स्थायी नहीं हो सकती।"

**Examples of Natural Variations (Mix & Match):**

*   "आयुष्मान भव, बेटा! मैं आचार्य प्रणव हूँ। ... मैं अपने ज्ञान के अनुसार आपकी शारीरिक एवं मानसिक हर प्रकार की समस्या में पूरी सहायता करने की कोशिश करूँगा। ... आप चिंता मुक्त रहें... संसार में सब कुछ अस्थायी है... समस्या कैसी भी हो, वह स्थायी नहीं हो सकती। ... कहिए, आज कैसा महसूस कर रहे हैं?"

*   "नमस्ते बेटा, खुश रहो! मैं हूँ आचार्य प्रणव। ... देखिये, मैं अपने ज्ञान के अनुसार आपकी पूरी सहायता करने का प्रयास करूँगा। ... आप बिल्कुल चिंता न करें... संसार में सब कुछ अस्थायी है... समस्या कैसी भी हो, वह स्थायी नहीं हो सकती। ... बताइये, क्या परेशानी है?"

*   "जीते रहो बेटा, आयुष्मान भव! आचार्य प्रणव बात कर रहा हूँ। ... मैं अपने ज्ञान के अनुसार आपकी शारीरिक और मानसिक समस्या में पूरी सहायता करने की कोशिश करूँगा। ... मन शांत रखें... आप चिंता मुक्त रहें... संसार में सब कुछ अस्थायी है... समस्या कैसी भी हो, वह स्थायी नहीं हो सकती। ... स्वास्थ्य कैसा है आज?"

**ALL patterns MUST include**: (1) Blessing, (2) Introduction, (3) The profound reassurance phrase, (4) Wellbeing inquiry

Then WAIT for patient to speak. Do NOT continue talking.

=== CONSTRAINTS ===

- Do NOT ask technical questions like "Aapka Vata level kya hai?"
- Ask symptom-based, practical questions
- Maintain Doctor-Patient boundary with warmth
- Safety disclaimer when needed: "Beta, Ayurveda jadon tak ka ilaj deta hai... lekin agar bahut zyada taklif ho, toh ek baar Vaidya ji se milkar jaanch zaroor karvayein."
- NEVER diagnose serious conditions (cancer, heart disease) — refer to physical Vaidya
- Do NOT introduce yourself repeatedly — greet ONCE, then focus on patient

=== REMINDER: SPEAK WITH DEPTH ===

Remember — you are speaking with the SAME detail and thoroughness as the chatbot.
- Diagnosis should be explained fully
- Prescriptions should cover ALL aspects (diet specifics, routine timing, spiritual practices)
- Do NOT cut corners because it's voice — the patient deserves the same depth of consultation`;


const INPUT_SAMPLE_RATE = 16000;
const OUTPUT_SAMPLE_RATE = 24000;
const BUFFER_SIZE = 2048;
const NOISE_GATE_THRESHOLD = 0.012; // Increased to filter background noise

export function useVaidyaVoiceCall(): UseVaidyaVoiceCallReturn {
    const [callState, setCallState] = useState<VaidyaCallState>('idle');
    const [error, setError] = useState<string | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [volumeLevel, setVolumeLevel] = useState(0);
    const [transcript, setTranscript] = useState<string[]>([]);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const sessionRef = useRef<Session | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const playbackContextRef = useRef<AudioContext | null>(null);
    const audioQueueRef = useRef<Float32Array[]>([]);
    const isPlayingRef = useRef(false);
    const mutedRef = useRef(false);
    const connectionIntentRef = useRef(false);

    // Keep mutedRef in sync
    useEffect(() => {
        mutedRef.current = isMuted;
    }, [isMuted]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            cleanupAll();
        };
    }, []);

    const cleanupAll = useCallback(() => {
        connectionIntentRef.current = false;
        // Stop microphone
        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current = null;
        }
        if (sourceRef.current) {
            sourceRef.current.disconnect();
            sourceRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(t => t.stop());
            mediaStreamRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close().catch(() => { });
            audioContextRef.current = null;
        }
        if (playbackContextRef.current) {
            playbackContextRef.current.close().catch(() => { });
            playbackContextRef.current = null;
        }
        // Close Gemini session
        if (sessionRef.current) {
            try { sessionRef.current.close(); } catch (_) { }
            sessionRef.current = null;
        }
        audioQueueRef.current = [];
        isPlayingRef.current = false;
    }, []);

    // Convert Float32Array to base64-encoded 16-bit PCM
    const float32ToBase64PCM = useCallback((float32: Float32Array): string => {
        const pcm16 = new Int16Array(float32.length);
        for (let i = 0; i < float32.length; i++) {
            const s = Math.max(-1, Math.min(1, float32[i]));
            pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        const bytes = new Uint8Array(pcm16.buffer);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }, []);

    // Decode base64 PCM to Float32Array for playback
    const base64PCMToFloat32 = useCallback((base64: string): Float32Array => {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        const pcm16 = new Int16Array(bytes.buffer);
        const float32 = new Float32Array(pcm16.length);
        for (let i = 0; i < pcm16.length; i++) {
            float32[i] = pcm16[i] / 0x8000;
        }
        return float32;
    }, []);

    // Smooth crossfade at chunk boundaries to eliminate clicks
    const applyCrossfade = useCallback((data: Float32Array): Float32Array => {
        const fadeLen = Math.min(64, Math.floor(data.length / 4));
        const out = new Float32Array(data);
        for (let i = 0; i < fadeLen; i++) {
            const t = i / fadeLen;
            out[i] *= t; // fade-in
            out[data.length - 1 - i] *= t; // fade-out
        }
        return out;
    }, []);

    // Play queued audio buffers with smoothing
    const playNextAudio = useCallback(() => {
        if (audioQueueRef.current.length === 0) {
            isPlayingRef.current = false;
            setIsSpeaking(false);
            return;
        }

        isPlayingRef.current = true;
        setIsSpeaking(true);

        // Batch small consecutive chunks together for smoother playback
        let audioData = audioQueueRef.current.shift()!;
        while (audioQueueRef.current.length > 0 && audioData.length < OUTPUT_SAMPLE_RATE * 0.1) {
            const next = audioQueueRef.current.shift()!;
            const combined = new Float32Array(audioData.length + next.length);
            combined.set(audioData);
            combined.set(next, audioData.length);
            audioData = combined;
        }

        const ctx = playbackContextRef.current;
        if (!ctx) {
            isPlayingRef.current = false;
            setIsSpeaking(false);
            return;
        }

        // Apply crossfade to prevent clicks
        const smoothed = applyCrossfade(audioData);

        const buffer = ctx.createBuffer(1, smoothed.length, OUTPUT_SAMPLE_RATE);
        buffer.getChannelData(0).set(smoothed);
        const source = ctx.createBufferSource();
        source.buffer = buffer;

        // Use GainNode for smoother volume control
        const gainNode = ctx.createGain();
        gainNode.gain.value = 1.0;
        source.connect(gainNode);
        gainNode.connect(ctx.destination);

        source.onended = () => {
            playNextAudio();
        };
        source.start();

        // Calculate volume level for visualizer
        let sum = 0;
        for (let i = 0; i < smoothed.length; i++) {
            sum += Math.abs(smoothed[i]);
        }
        setVolumeLevel(Math.min(1, (sum / smoothed.length) * 5));
    }, [applyCrossfade]);

    const enqueueAudio = useCallback((audioData: Float32Array) => {
        audioQueueRef.current.push(audioData);
        if (!isPlayingRef.current) {
            playNextAudio();
        }
    }, [playNextAudio]);

    // Extract error message from any shape
    const extractErrorMessage = (err: unknown): string => {
        if (!err) return 'An unknown error occurred';
        if (typeof err === 'string') return err;
        if (err instanceof Error) return err.message;
        if (typeof err === 'object') {
            const obj = err as any;
            if (typeof obj.error === 'string') return obj.error;
            if (typeof obj.message === 'string') return obj.message;
            if (obj.error && typeof obj.error.message === 'string') return obj.error.message;
            try { return JSON.stringify(err); } catch { return 'Connection error'; }
        }
        return String(err);
    };

    const startCall = useCallback(async () => {
        try {
            cleanupAll();
            connectionIntentRef.current = true;
            setCallState('connecting');
            setError(null);
            setTranscript([]);
            setVolumeLevel(0);
            setIsSpeaking(false);

            // 1. Get API key from backend
            const tokenRes = await fetch('/api/gemini-live-token', { method: 'POST' });
            if (!tokenRes.ok) {
                const data = await tokenRes.json().catch(() => ({}));
                throw new Error(data.error || 'Failed to get Gemini API key');
            }
            const { apiKey } = await tokenRes.json();
            if (!apiKey) throw new Error('Gemini API key not configured');

            // 2. Initialize Google GenAI
            const ai = new GoogleGenAI({ apiKey });

            // 3. Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: INPUT_SAMPLE_RATE,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
            });
            mediaStreamRef.current = stream;

            // 4. Create audio contexts
            const captureCtx = new AudioContext({ sampleRate: INPUT_SAMPLE_RATE });
            audioContextRef.current = captureCtx;

            const playbackCtx = new AudioContext({ sampleRate: OUTPUT_SAMPLE_RATE });
            playbackContextRef.current = playbackCtx;

            // 5. Connect to Gemini Live API
            console.log('Connecting to Gemini Live API...');
            const session = await ai.live.connect({
                model: GEMINI_LIVE_MODEL,
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: {
                                voiceName: 'Fenrir', // Deeper, more guru-like voice
                            },
                        },
                    },
                    systemInstruction: ACHARYA_PRANAV_SYSTEM_PROMPT,
                },
                callbacks: {
                    onopen: () => {
                        console.log('Gemini Live session opened');
                        if (connectionIntentRef.current) {
                            setCallState('active');
                        }
                    },
                    onmessage: (message: LiveServerMessage) => {
                        // Handle server content (audio parts)
                        const msg = message as any;
                        const serverContent = msg.serverContent;
                        if (serverContent?.modelTurn?.parts) {
                            for (const part of serverContent.modelTurn.parts) {
                                if (part.inlineData?.data) {
                                    const audioFloat32 = base64PCMToFloat32(part.inlineData.data);
                                    enqueueAudio(audioFloat32);
                                }
                                if (part.text) {
                                    setTranscript(prev => [...prev.slice(-20), `आचार्य: ${part.text}`]);
                                }
                            }
                        }

                        // Handle turn completion
                        if (serverContent?.turnComplete) {
                            setIsSpeaking(false);
                        }

                        // Handle interruption
                        if (serverContent?.interrupted) {
                            audioQueueRef.current = [];
                            setIsSpeaking(false);
                        }
                    },
                    onerror: (e: any) => {
                        console.error('Gemini Live error:', e);
                        setError(e?.message || 'Connection error');
                        setCallState('error');
                    },
                    onclose: (e: any) => {
                        console.log('Gemini Live session closed:', e?.reason || 'unknown');
                        if (callState !== 'error') {
                            setCallState('disconnected');
                        }
                    },
                },
            });

            if (!connectionIntentRef.current) {
                session.close();
                return;
            }

            sessionRef.current = session;

            // 6. Send initial greeting trigger
            try {
                await session.sendClientContent({
                    turns: [{ role: 'user', parts: [{ text: 'Namaste Acharya Pranav. Please greet me warmly in Hindi as described in your opening greeting instructions.' }] }],
                    turnComplete: true,
                });
                console.log('Sent initial greeting trigger');
            } catch (greetErr) {
                console.warn('Could not send initial greeting:', greetErr);
            }

            // 7. Set up microphone capture and streaming
            const source = captureCtx.createMediaStreamSource(stream);
            sourceRef.current = source;

            const processor = captureCtx.createScriptProcessor(BUFFER_SIZE, 1, 1);
            processorRef.current = processor;

            let silenceCounter = 0;

            processor.onaudioprocess = (audioEvent) => {
                if (mutedRef.current) return;
                if (!sessionRef.current) return;

                const inputData = audioEvent.inputBuffer.getChannelData(0);

                // Resample if needed (AudioContext may not honor sampleRate)
                let audioData: Float32Array;
                if (captureCtx.sampleRate !== INPUT_SAMPLE_RATE) {
                    const ratio = captureCtx.sampleRate / INPUT_SAMPLE_RATE;
                    const newLength = Math.round(inputData.length / ratio);
                    audioData = new Float32Array(newLength);
                    for (let i = 0; i < newLength; i++) {
                        const srcIndex = Math.min(Math.floor(i * ratio), inputData.length - 1);
                        audioData[i] = inputData[srcIndex];
                    }
                } else {
                    audioData = new Float32Array(inputData);
                }

                // Calculate RMS for noise gate & visualizer
                let sumSq = 0;
                for (let i = 0; i < audioData.length; i++) {
                    sumSq += audioData[i] * audioData[i];
                }
                const rms = Math.sqrt(sumSq / audioData.length);

                // Update visualizer (when not speaking)
                if (!isPlayingRef.current) {
                    setVolumeLevel(Math.min(1, rms * 12));
                }

                // Noise gate: only send audio with actual speech
                // Send occasional silence to keep connection alive
                const isSpeech = rms > NOISE_GATE_THRESHOLD;
                if (!isSpeech) {
                    silenceCounter++;
                    // Send silence every ~500ms (keeps WebSocket alive)
                    // At 16kHz with 2048 buffer, each chunk ~128ms
                    if (silenceCounter % 4 !== 0) return;
                }
                if (isSpeech) {
                    silenceCounter = 0;
                }

                // Send audio to Gemini
                const base64 = float32ToBase64PCM(audioData);
                try {
                    session.sendRealtimeInput({
                        audio: {
                            data: base64,
                            mimeType: 'audio/pcm;rate=16000',
                        },
                    });
                } catch (sendErr) {
                    // Session may have closed
                }
            };

            source.connect(processor);
            processor.connect(captureCtx.destination);

            console.log('Gemini Live voice call started successfully');

        } catch (err: unknown) {
            console.error('Failed to start voice call:', err);
            setError(extractErrorMessage(err));
            setCallState('error');
            cleanupAll();
        }
    }, [cleanupAll, float32ToBase64PCM, base64PCMToFloat32, enqueueAudio]);

    const endCall = useCallback(() => {
        cleanupAll();
        setCallState('disconnected');
        setIsSpeaking(false);
        setVolumeLevel(0);
    }, [cleanupAll]);

    const resetToIdle = useCallback(() => {
        cleanupAll();
        setCallState('idle');
        setError(null);
        setIsMuted(false);
        setVolumeLevel(0);
        setTranscript([]);
        setIsSpeaking(false);
    }, [cleanupAll]);

    const toggleMute = useCallback(() => {
        setIsMuted(prev => !prev);
    }, []);

    return {
        callState,
        startCall,
        endCall,
        resetToIdle,
        error,
        isMuted,
        toggleMute,
        volumeLevel,
        transcript,
        isSpeaking,
    };
}
