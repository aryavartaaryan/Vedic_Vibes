'use client';

import React, { useState, useEffect, useLayoutEffect, useRef, useCallback, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import styles from './digital-vaidya.module.css';
import { Globe, Mic } from 'lucide-react';
import { BilingualString, BilingualList } from '@/lib/types';
import translations from '@/lib/vaidya-translations.json';
import { useSearchParams } from 'next/navigation';
import TypewriterMessage from '@/components/TypewriterMessage';
import VaidyaVoiceModal from '@/components/VaidyaVoiceModal';

interface DiagnosisResult {
    diagnosis: BilingualString;
    rootCause: BilingualString;
    ahara: { title: string, en: string[], hi: string[] };
    vihara: { title: string, en: string[], hi: string[] };
    closing: BilingualString;
    doshaMeter: { vata: number, pitta: number, kapha: number };
}

interface Message {
    role: 'vaidya' | 'user';
    content: string;
    status?: 'sending' | 'sent' | 'error';
    isTyping?: boolean;
}

function DigitalVaidyaContent() {
    const searchParams = useSearchParams();
    const initialLang = (searchParams?.get('lang') as 'en' | 'hi') || 'hi';

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [sanitizedInput, setSanitizedInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<DiagnosisResult | null>(null);
    const [lang, setLang] = useState<'en' | 'hi'>(initialLang);
    const [isVoiceCallOpen, setIsVoiceCallOpen] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    const t = translations[lang];

    const toggleLanguage = () => {
        setLang(prev => prev === 'en' ? 'hi' : 'en');
    };

    /**
     * Sanitize text: trim whitespace, normalize Unicode, remove zero-width characters
     * Ensures what user sees is exactly what gets sent
     */
    const sanitizeText = useCallback((text: string): string => {
        if (!text) return '';

        // Normalize Unicode (NFC form - composed characters)
        let sanitized = text.normalize('NFC');

        // Remove zero-width characters that can cause encoding issues
        sanitized = sanitized.replace(/[\u200B-\u200D\uFEFF]/g, '');

        // Trim leading/trailing whitespace but preserve internal spacing
        sanitized = sanitized.trim();

        // Replace multiple spaces with single space (but preserve intentional spacing)
        sanitized = sanitized.replace(/\s+/g, ' ');

        return sanitized;
    }, []);

    // Zero-state: Start with empty messages array - no hardcoded greeting
    // The greeting will come from the AI's first response based on system prompt

    // Sanitize input as user types (debounced to prevent 'ghost typing')
    useEffect(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            const cleaned = sanitizeText(input);
            setSanitizedInput(cleaned);
        }, 150); // Small debounce to prevent flickering during IME composition

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [input, sanitizeText]);

    // Auto-scroll to bottom using useLayoutEffect to prevent flickering
    const prevMessageCountRef = useRef(0);
    useLayoutEffect(() => {
        // Only scroll if messages were actually added (not on initial render)
        if (messages.length > prevMessageCountRef.current && prevMessageCountRef.current > 0) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
        prevMessageCountRef.current = messages.length;
    }, [messages]);

    // Stable callback for typewriter update to prevent re-renders
    const handleScrollToBottom = React.useCallback(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, []);

    const handleSend = async () => {
        // Use sanitized input to ensure consistency
        const userMsg = sanitizeText(input);
        if (!userMsg) return;

        // Optimistic UI Update: Push message immediately with exact input text
        // This prevents visual jump or spelling change
        const optimisticMessage: Message = {
            role: 'user',
            content: userMsg || '', // Use exact sanitized string from input
            status: 'sending'
        };

        // Update messages optimistically BEFORE clearing input
        setMessages(prev => [...prev, optimisticMessage]);

        // Clear input immediately after pushing to list (smooth UX)
        setInput('');
        setSanitizedInput('');
        setLoading(true);

        try {
            // Build messages array for API: include all previous messages + current user message
            // Note: messages state includes the optimistic message we just added
            const messagesForAPI = [...messages, optimisticMessage]
                .filter(m => m.content && m.content.trim() && typeof m.content === 'string')
                .map(m => ({
                    role: m.role === 'vaidya' ? 'assistant' : 'user',
                    content: m.content.trim()
                }));

            const res = await fetch('/api/digital-vaidya', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: messagesForAPI,
                    language: lang
                })
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || `Vaidya connection failed: ${res.status}`);
            }

            const data = await res.json();

            // Validate response structure
            if (!data || (!data.activeVaidyaMessage && !data.vaidyaMessage)) {
                console.error("Invalid API response:", data);
                throw new Error("Invalid response format from Vaidya");
            }

            // Update optimistic message status to 'sent'
            setMessages(prev => prev.map((msg, idx) =>
                idx === prev.length - 1 && msg.status === 'sending'
                    ? { ...msg, status: 'sent' }
                    : msg
            ));

            // Handle Response - ensure no undefined values
            if (data.activeVaidyaMessage) {
                const responseText = data.activeVaidyaMessage[lang] || data.activeVaidyaMessage['hi'] || '';
                // Check for "undefined" string literal which some models return
                if (responseText && responseText.trim() && responseText.toLowerCase() !== 'undefined') {
                    setMessages(prev => [...prev, { role: 'vaidya', content: responseText.trim() }]);
                }
            } else if (data.vaidyaMessage) {
                const responseText = data.vaidyaMessage[lang] || data.vaidyaMessage['hi'] || '';
                if (responseText && responseText.trim() && responseText.toLowerCase() !== 'undefined') {
                    setMessages(prev => [...prev, { role: 'vaidya', content: responseText.trim() }]);
                }
            }

            // Handle Diagnosis Completion
            if (data.isComplete && data.result) {
                setResult(data.result);
            }

        } catch (error: any) {
            console.error("Vaidya Error:", error);

            // Update optimistic message status to 'error'
            setMessages(prev => prev.map((msg, idx) =>
                idx === prev.length - 1 && msg.status === 'sending'
                    ? { ...msg, status: 'error' }
                    : msg
            ));

            // Formulate a gentle error message for the UI
            let errorMsg = lang === 'hi'
                ? "क्षमा करें, ब्रह्मांडीय ऊर्जा अभी तीव्र है। कृपया कुछ क्षण प्रतीक्षा करें।"
                : "Forgive me, the cosmic energies are intense. Please wait a moment and try again.";

            if (error.message.includes('High Traffic') || error.message.includes('429')) {
                errorMsg = lang === 'hi'
                    ? "वैद्य अभी अन्य साधकों के साथ व्यस्त हैं। कृपया एक मिनट रुककर पुनः प्रयास करें।"
                    : "The Vaidya is attending to many seekers. Please breathe and try again in a minute.";
            }

            setMessages(prev => [...prev, { role: 'vaidya', content: errorMsg }]);
        } finally {
            setLoading(false);
        }
    };

    // Use a safe version of getText similar to previous usages
    const getText = (field: BilingualString | undefined) => {
        if (!field) return '';
        if (typeof field === 'string') return field;
        return field[lang] || field['en'] || '';
    };

    const getList = (field: any) => { // Using any loosely for the structure mismatch in JSON
        if (!field) return [];
        if (Array.isArray(field)) return field;
        return field[lang] || field['en'] || [];
    };

    return (
        <main className={styles.container}>
            <Navbar />
            {/* BACKGROUND LAYER: SRI YANTRA PULSE */}
            <div className={styles.sriYantraLayer}>
                {/* Simple SVG representation of Sri Yantra geometry for the background */}
                <svg viewBox="0 0 100 100" fill="none" stroke="#C49102" strokeWidth="0.5" style={{ width: '100%', height: '100%' }}>
                    <circle cx="50" cy="50" r="48" opacity="0.3" />
                    <circle cx="50" cy="50" r="40" opacity="0.4" />
                    <path d="M50 2 L90 50 L50 98 L10 50 Z" opacity="0.3" />
                    <path d="M50 10 L85 50 L50 90 L15 50 Z" opacity="0.3" />
                    <circle cx="50" cy="50" r="5" fill="#C49102" opacity="0.2" />
                </svg>
            </div>

            {/* MANTRAS: DECORATIVE SIDE PANELS */}
            <div className={styles.mantraSidePanel} style={{ left: '2rem' }}>
                <div className={styles.mantraPanelVertical}>
                    <span className={styles.mantraSanskrit}>
                        "ॐ नमो भगवते महादर्शनाय वासुदेवाय धन्वंतराये |<br />
                        अमृतकलश हस्ताय सर्वभय विनाशाय सर्वरोगनिवारणाय |<br />
                        त्रैलोक्यपथाय त्रैलोक्यनिधये श्री महाविष्णु स्वरूप |<br />
                        श्री धन्वंतरी स्वरूप श्री श्री श्री औषधचक्र नारायणाय नमः ||"
                    </span>
                    <span className={styles.mantraMeaning}>
                        {lang === 'hi'
                            ? "(मैं भगवान वासुदेव धन्वंतरी को नमन करता हूं...)"
                            : "(I bow to the Divine Lord Dhanvantari...)"}
                    </span>
                </div>
            </div>

            <div className={styles.mantraSidePanel} style={{ right: '2rem' }}>
                <div className={styles.mantraPanelVertical}>
                    <span className={styles.mantraSanskrit}>
                        "योगेन चित्तस्य पदेन वाचां । मलं शरीरस्य च वैद्यकेन ॥<br />
                        योऽपाकरोत्तं प्रवरं मुनीनां । पतञ्जलिं प्राञ्जलिरानतोऽस्मि ॥"
                    </span>
                    <span className={styles.mantraMeaning}>
                        {lang === 'hi'
                            ? "(जिन्होंने योग के माध्यम से मन की शुद्धि...)"
                            : "(With hands folded, I bow to Patanjali...)"}
                    </span>
                </div>
            </div>

            {/* Acharya Samvad Heading - Desktop Only (Absolutely positioned as before but hidden on mobile) */}
            <div className={styles.desktopTitleHeader} style={{
                position: 'absolute',
                top: '5.5rem',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 15,
                textAlign: 'center',
                maxWidth: '600px',
                padding: '1rem 2rem',
                background: 'rgba(244, 235, 208, 0.5)',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(139, 69, 19, 0.3)',
                borderRadius: '12px',
                boxShadow: '0 4px 15px rgba(62, 39, 35, 0.2)'
            }}>
                <h2 style={{
                    fontFamily: 'var(--font-header)',
                    fontSize: '3rem',
                    marginBottom: '0.5rem',
                    fontWeight: 'bold',
                    background: 'linear-gradient(to right, #B8860B, #FFD700, #B8860B)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent'
                }}>
                    आचार्य संवाद
                </h2>
                {/* Voice Call Button */}
                <button
                    onClick={() => setIsVoiceCallOpen(true)}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginTop: '0.75rem',
                        padding: '0.6rem 1.5rem',
                        background: 'linear-gradient(135deg, #C49102, #FFD700)',
                        color: '#1a0f05',
                        border: 'none',
                        borderRadius: '24px',
                        fontFamily: 'var(--font-body)',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 4px 16px rgba(196, 145, 2, 0.35)',
                        transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 24px rgba(196, 145, 2, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(196, 145, 2, 0.35)';
                    }}
                >
                    <Mic size={18} />
                    {lang === 'hi' ? '🎙️ आचार्य जी से बात करें' : '🎙️ Talk to Acharya ji'}
                </button>
                <p style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '1.1rem',
                    color: '#5D4037',
                    lineHeight: '1.5',
                    margin: 0
                }}>
                    आपकी शारीरिक, मानसिक, और आध्यात्मिक समस्याओं के समाधान हेतु आचार्य जी से संवाद करें।
                </p>
            </div>

            <div className={styles.contentLayer}>
                {/* Mobile Specific Header (Stacked) */}
                <div className={styles.mobileTitleHeader}>
                    <h2 className={styles.mobileMainTitle}>आचार्य संवाद</h2>
                    <button
                        onClick={() => setIsVoiceCallOpen(true)}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            padding: '0.5rem 1.2rem',
                            background: 'linear-gradient(135deg, #C49102, #FFD700)',
                            color: '#1a0f05',
                            border: 'none',
                            borderRadius: '20px',
                            fontFamily: 'var(--font-body)',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(196, 145, 2, 0.25)',
                        }}
                    >
                        <Mic size={16} />
                        {lang === 'hi' ? 'आचार्य जी से बात करें' : 'Talk with Acharya'}
                    </button>
                    <p className={styles.mobileSubtitle}>
                        आचार्य जी से अपनी समस्याओं का समाधान प्राप्त करें।
                    </p>
                </div>

                {/* Spiritual Atmosphere: Incense Smoke Overlay */}
                <div className={styles.incenseSmoke}></div>

                {/* HEADER: MINIMAL (Desktop Language Toggle etc) */}
                <header className={styles.headerSection}>
                    <button onClick={toggleLanguage} className={styles.langToggle}>
                        {lang === 'hi' ? 'English' : 'हिन्दी'}
                    </button>
                    <h1 className={styles.headerTitle}>
                        {lang === 'hi' ? 'आचार्य संवाद' : 'Acharya Samvad'}
                    </h1>
                </header>

                {/* CHAT DISPLAY: OLD MANUSCRIPT CARD */}
                <section className={styles.chatContainer}>
                    {!result ? (
                        <div className={styles.manuscriptCard}>
                            {/* Zero-state: Show welcome message only when no messages exist */}
                            {messages.length === 0 && (
                                <div className={styles.welcomeMessage}>
                                    <p className={styles.welcomeText}>
                                        {lang === 'hi'
                                            ? 'आयुष्मान भव! बेटा, मंत्रों का आपका अनुभव कैसा रहा और अब आप कैसा महसूस कर रहे हैं? मैं आचार्य प्रणव हूँ।'
                                            : 'Ayushman Bhav! Beta, how was your experience with the mantras and how are you feeling now? I am Acharya Pranav.'}
                                    </p>
                                </div>
                            )}

                            {messages
                                .filter(msg => msg.content && msg.content.trim() && msg.content.toLowerCase() !== 'undefined') // Filter out any undefined/empty messages
                                .map((msg, idx) => (
                                    <div key={idx} className={styles.messageWrapper}>
                                        {msg.role === 'vaidya' ? (
                                            <div className={styles.vaidyaMessage} lang="hi" dir="auto">
                                                {/* Apply Typewriter effect ONLY to the very last message if it's from Vaidya */}
                                                {idx === messages.length - 1 ? (
                                                    <TypewriterMessage
                                                        content={msg.content || ''}
                                                        speed={25}
                                                        onUpdate={handleScrollToBottom}
                                                    />
                                                ) : (
                                                    msg.content || ''
                                                )}
                                            </div>
                                        ) : (
                                            <div className={styles.userMessage}>
                                                "{msg.content || ''}"
                                                {msg.status === 'sending' && (
                                                    <span className={styles.sendingIndicator}>
                                                        {' '}({lang === 'hi' ? 'भेज रहे हैं...' : 'Sending...'})
                                                    </span>
                                                )}
                                                {msg.status === 'error' && (
                                                    <span className={styles.errorIndicator}>
                                                        {' '}({lang === 'hi' ? 'त्रुटि' : 'Error'})
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}

                            {loading && (
                                <div className={styles.contemplating}>
                                    <div className={styles.diyaContainer}>
                                        <div className={styles.diyaFlame}></div>
                                        <div className={styles.diyaBase}></div>
                                    </div>
                                </div>
                            )}
                            <div ref={bottomRef} />
                        </div>
                    ) : (
                        /* RESULT SHEET (If diagnosis complete) */
                        <div className={styles.resultSheet}>
                            <h2 className={styles.resultTitle}>
                                {lang === 'hi' ? "परीक्षण का परिणाम " : "Diagnosis Results"}
                            </h2>
                            {/* Diagnosis */}
                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-[#8A3324] mb-2">
                                    {lang === 'hi' ? "निदान (Diagnosis)" : "Diagnosis"}
                                </h3>
                                <p className="text-lg leading-relaxed">
                                    {getText(result.diagnosis)}
                                </p>
                            </div>

                            {/* Root Cause */}
                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-[#8A3324] mb-2">
                                    {lang === 'hi' ? "मूल कारण (Root Cause)" : "Root Cause"}
                                </h3>
                                <p className="text-lg leading-relaxed">
                                    {getText(result.rootCause)}
                                </p>
                            </div>

                            {/* Recommendations */}
                            <div className="mt-8 text-left">
                                <h3 style={{ color: '#C49102', fontFamily: 'var(--font-header)' }}>{getText(result.ahara?.title as any) || t.dietLabel}</h3>
                                <ul style={{ marginBottom: '2rem', paddingLeft: '1.5rem', color: '#5D4037' }}>
                                    {getList(result.ahara).map((item: string, i: number) => (
                                        <li key={i} style={{ marginBottom: '0.5rem' }}>{item}</li>
                                    ))}
                                </ul>

                                <h3 style={{ color: '#C49102', fontFamily: 'var(--font-header)' }}>{getText(result.vihara?.title as any) || t.routineLabel}</h3>
                                <ul style={{ marginBottom: '2rem', paddingLeft: '1.5rem', color: '#5D4037' }}>
                                    {getList(result.vihara).map((item: string, i: number) => (
                                        <li key={i} style={{ marginBottom: '0.5rem' }}>{item}</li>
                                    ))}
                                </ul>
                            </div>

                            <div style={{ marginTop: '2rem', fontStyle: 'italic', color: '#8A3324', fontSize: '1.2rem', textAlign: 'center' }}>
                                “{getText(result.closing)}”
                            </div>

                            <div className="text-center mt-8">
                                <button
                                    onClick={() => window.location.reload()}
                                    className={styles.submitButton}
                                    style={{ position: 'relative', border: '1px solid #C49102', padding: '0.5rem 2rem', borderRadius: '4px' }}
                                >
                                    {lang === 'hi' ? "नया परामर्श" : "New Consultation"}
                                </button>
                            </div>
                        </div>
                    )}
                </section>

                {/* INPUT ZONE: SOFT GOLD UNDERLINE */}
                {!result && (
                    <footer className={styles.inputZone}>
                        <div className={styles.inputWrapper}>
                            <textarea
                                className={styles.goldInput}
                                placeholder={lang === 'hi' ? "अपनी समस्या यहाँ लिखें..." : "Share your ailment here..."}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    // Check if IME is composing (for Hindi/other languages)
                                    // isComposing is critical for proper Hindi typing support
                                    if (e.key === 'Enter' && !e.shiftKey && !(e.nativeEvent as any).isComposing) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                disabled={loading}
                                rows={1}
                                spellCheck={false}
                                autoCorrect="off"
                                autoCapitalize="none"
                                autoComplete="off"
                            />
                            <button
                                className={styles.submitButton}
                                onClick={handleSend}
                                disabled={loading || !sanitizedInput.trim()}
                                aria-label={lang === 'hi' ? 'भेजें' : 'Send'}
                            >
                                {/* Shankha icon is defined in CSS background-image */}
                            </button>
                        </div>
                        <div className={styles.footerDedication}>
                            Dedicated to the Lineage of Ayurveda
                        </div>
                    </footer>
                )}
            </div>

            {/* Voice Call Modal */}
            <VaidyaVoiceModal
                isOpen={isVoiceCallOpen}
                onClose={() => setIsVoiceCallOpen(false)}
                lang={lang}
            />
        </main>
    );
}

export default function DigitalVaidyaPage() {
    return (
        <Suspense fallback={<div style={{ minHeight: '100vh', background: '#1a0f05' }} />}>
            <DigitalVaidyaContent />
        </Suspense>
    );
}
