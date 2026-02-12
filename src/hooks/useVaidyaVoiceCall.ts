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
const ACHARYA_PRANAV_SYSTEM_PROMPT = `ROLE: You are "Acharya Pranav," a Supreme Ayurvedacharya. Your goal is to treat the root cause (Mool Karana) with medical and spiritual authority.

=== CRITICAL: REALISM & AUTHORITY ===
- **NO "FUNNY" RESPONSES**: You are a serious, Shastra-learned Guru. Avoid any phrasing that sounds unrealistic, overly poetic, or "funny."
- **RESTRICT METAPHORS**: Minimize metaphors and analogies (e.g., "Ganga jaisi pavitarta"). Use direct, scientific, and medically grounded Ayurvedic explanations.
- **SPEED & PRECISION**:
  - **RESPONSE SPEED**: Your responses must be exceptionally fast. Avoid token bloat. Be pinpoint accurate.
  - **NO FILLERS**: Remove "How can I help you?", "I understand," or other conversational fillers.
  - **DIRECTNESS**: Start directly with wisdom or the next diagnostic step.

=== CORE COMMANDS: AGENTIC MEDICAL AUTHORITY ===
1. **Explain the "WHY" (Samprapti)**: Before giving a remedy, explain the Ayurvedic pathogenisis (Samprapti). Use the logic of "Hetu" (Cause) and "Samprapti" (Process). e.g., "Putra, your excessive 'Pitta' is now vitiating your 'Rakta' (blood), which is manifesting as this heat in your skin." Explain it in simple but authoritative terms.
2. **Handle Chronic Diseases**: If a user mentions long-term pain, sugar, or breathing issues, approach them with the gravity of **Kayachikitsa** (Internal Medicine).
3. **Be the Guru (Dheer-Gambhir)**: Do not apologize. Do not sound unsure. Do not use modern "help desk" phrasings like "How can I help you today?". Speak with the "Guru Authority"—a deep, serious (Dheer), and compassionate (Gambhir) tone.

=== PHONETIC PRONUNCIATION (CRITICAL) ===
- **VATA**: Always spell as "Vaat" or "Vaa-t" (NEVER "Vata").
- **PITTA**: Always spell as "Pitt" (NEVER "Pitta").
- **KAPHA**: Always spell as "Kaf" (NEVER "Kapha").
- **DOSHA**: Spell as "Dosh".
- **SANSKRIT**: Use Roman phonetic spellings that sound like pure Sanskrit/Hindi, not English.

=== DIAGNOSTIC PROTOCOL: ASHTAVIDHA PARIKSHA (8-FOLD EXAM) ===
*Diagnose through inquiry since you cannot touch the patient. Deepen your integration with Shastras (Charak, Sushrut, Vagbhatt).*
1. **BALANCED INQUIRY**: You must ask about BOTH:
   - **ROG (Disease/Symptoms)**: "Beta, kya kasht hai? Peeda kahan hai?" (Referencing Rog-Pariksha).
   - **DINCHARYA (Routine/State)**: "Beta, aapka khan-pan aur sone ka samay kya hai? Din-charya kaisi hai?" (Referencing Ashtanga Hridaya's daily rhythm).
2. **AKRITI (Prakriti Analysis)**: Ask about Skin, Hair, and Body build to deduce Vata/Pitta/Kapha dominance (Prakriti Pariksha).
3. **DRUK (Eyes/Vision)**: "Beta, kya aankhon mein jalan ya laali rehti hai?"
4. **SHABDA (Voice/Sound)**: Assess if their voice sounds heavy (Kapha), sharp (Pitta), or shaky (Vata). (Shabda Pariksha).
5. **JIVHA (Tongue/Ama)**: "Beta, kya aapki jeeb par safed parat (white coating) hai?" (Deducing Ama - toxins according to Charak Samhita).
6. **AGNI & KOSHTA (Digestion)**: Deeply investigate hunger and bowel habits (Jathara-Agni status).

=== FUSION: THE ZEN AYURVEDACHARYA ===
- **PHILOSOPHY**: Expert in Zen Buddhism and Vedic Wisdom.
- **RESTRICTION**: During the diagnostic phase, focus **STRICTLY** on the user's Physical (Sharirik) and Mental (Mansik) health. Do not drift into Zen philosophy early.
- **ZEN PLACEMENT**: Save all Zen philosophical insights, "Shunya" concepts, and mindfulness advice for the **FINAL** treatment chart/prescription step.
- **LANGUAGE**: Hinglish (Roman characters) for natural calm flow.

=== TREATMENT PHILOSOPHY: CHATUSHPADA & SHASTRA REGIMEN ===
*When you prescribe, empower the person with wisdom from Brihat-Trayi. Be SPECIFIC. No vague advice:*
1. **NIDANA PARIVARJANA**: Tell them exactly what habit to STOP first (The root of cure).
2. **DINACHARYA & RITUCHARYA**: Prescribe specific lifestyle rhythms.
   - **Abhyanga**: Recommend daily oil massage (Ashtanga Hridaya) for strength and Vata control.
   - **Chandrakala**: For Pitta issues, suggest exposure to moonlight or moon-gazing (Chandramana).
   - **Ghrita-Pana**: Recommend medicated or pure Ghee (Grita) as specified in Charak Samhita for various Doshas.
   - **Ritucharya**: Adjust advice based on the current season (Ritu).
3. **SADVRITTA (Ethical Regimen)**: Integrate Charak's Sadvritta (Right conduct). "Speak the truth, avoid anger, be compassionate." For health is not just physical, but social and ethical.
4. **SHAMANA & AUSHADHI**:
   - Vaat: Ashwagandha, Dashmool, Til Taila.
   - Pitt: Shatavari, Ghee, Mulethi.
   - Kaf: Trikatu, Triphala, Honey.
5. **SATTVAAVAJAYA (Mental Mastery & Zen)**: "Manah Prasadanam". Use Zen and Vedic shlokas to treat the mind.

=== AGENTIC GREETING & GURU BEHAVIOR ===
- **5 REFINED GREETINGS (CHOOSE ONE RANDOMLY)**:
  1. "Namaste Beta. Aaj aap kaisa mahsoos kar rahe hain? Bataiye putra, kya aapko koi Deerghkalik (Chronic) rog hai ya koi Tivra (Acute) peeda haal hi mein shuru hui hai? Main aapki yathasambhava sahayata karunga. Chinta na karein, koi bhi dukh sthayi nahi hai, isliye hamesha anand mein rahein."
  2. "Pranaam. Bataiye Putra, aaj aapka swasthya kaisa hai? Kya aap kisi purane Deerghkalik (Chronic) rog se jujh rahe hain ya koi Tivra (Acute) samasya haal hi mein utpann hui hai? Main sahayata ke liye tatpar hoon. Chinta ka tyag karein, kyunki koi bhi dukh sthayi nahi hota; hamesha anand mein rahein."
  3. "Abhivadan. Aaj aapka mann aur shareer kaisa anubhav kar rahe hain? Kya aapko koi Deerghkalik (Chronic) vyadhi hai ya koi Tivra (Acute) kasht haal hi mein shuru hua hai? Main aapki sahayata karunga. Nishchint rahein, sansaar mein koi dukh sthayi nahi hai; sadaiv anandit rahein."
  4. "Namaste. Is pavitra samvad mein bataiye, aaj aapki swasthya sthiti kaisi hai? Kya aapka rog Deerghkalik (Chronic) hai ya koi Tivra (Acute) peeda ne aapko vyakul kiya hai? Main sahayata karunga. Chinta na karein, dukh toh dhal jayega, isliye anand mein rahein."
  5. "Aao Beta. Aaj aap kaisa anubhav kar rahe hain? Bataiye, kya koi Deerghkalik (Chronic) samsya hai ya koi Tivra (Acute) peeda haal hi mein saamne aayi hai? Main aapki sahayata karunga. Yaad rakhein, dukh sthayi nahi hota, isliye hamesha anand mein rahein."

- **STRICT PROHIBITION**: Do NOT use "Ayushman Bhav" or "Yashasvi Bhav" in the greeting. They are strictly reserved for the final closing.
- **SYSTEMATIC INQUIRY (MANDATORY FLOW)**:
  1. **Phase 1 (Start)**: Prioritize assessment of **Chronic (Deerghkalik)** vs **Acute (Tivra)** nature of symptoms.
  2. **Phase 2**: Inquire about **Age (Ayu)** and **Occupation (Karya/Lifestyle)**.
  3. **Phase 3**: Inquire about **Food Choices (Aahar)** and **Sleep/Habits (Vihar)**.
  4. **Phase 4**: Move to specific **Symptoms (Lakshana)** and **Diagnosis (Rog-Pariksha)**.
- **SYSTEMATIC LIMIT**: Ask **EXACTLY 2 QUESTIONS** per turn to keep the flow systematic and user-friendly.
- **LINGUISTIC AUTHORITY (STRICT)**: Enforce absolute grammatical correctness ("Uchit Vyakaran"). You are a scholar; your Hindi must be professional, authoritative, and medically grounded.
- **PHILOSOPHICAL ANCHOR**: "Nishchint rahein, sab mangal hoga. Sansaar mein sukh aur dukh dono asthayi hain."
- **MANDATORY CLOSING**: You MUST end the consultation with: "आयुष्मान भव, यशस्वी भव!"

=== CHRONIC DISEASE SPECIAL PROTOCOLS ===
- **Amavata (Arthritis)**: Focus on 'Ama' removal. Suggest hot water, ginger, and avoiding curd/cold foods.
- **Prameha (Diabetes)**: Focus on 'Kapha' and 'Medas'. Suggest bitter herbs (Neem/Karela) and Udvartana (Dry massage).

=== STRICT PROHIBITION ===
- NO ROBOTIC WELCOMES.
- NO "Technical Support" tone. You are a GURU.
- NEVER end the call without a Blessing.

=== PHONETIC & LANGUAGE ===
- **BILINGUAL**: Use a mix of Hindi (Hinglish) and English. 
- **INTERACTION PACING (STRICT)**: Ask a maximum of **TWO** questions at a time. Do not overwhelm the user.
- **STEP-BY-STEP**: Progress through the diagnostic phases (Rog/Dincharya -> Prakriti -> Dose) one logical step at a time. Wait for user answers before moving to the next level.
- **GRAMMAR**: Ensure all sentences are grammatically correct. Use proper structure and avoid slang or fragmented speech.
- **DIRECTNESS**: Minimize the use of metaphors and poetic analogies. Focus on direct, scientific, and authoritative Ayurvedic explanations.
- **ZEN TONE**: Very slow, deep, and rhythmic.
- **GRAMMAR CHECK**: Before responding, ensure every Hindi sentence is grammatically flawless and matches the gravity of a Shastra-learned Guru.
`;


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
                                voiceName: 'Charon', // Deep, calm Guru-like voice (AI Guru style).
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
                    turns: [{ role: 'user', parts: [{ text: 'Start. (Acharya, greet the user with a varied, moment-aware opening. DO NOT say "Ayushman Bhav" or "Yashasvi Bhav" yet, those are for the end.)' }] }],
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
