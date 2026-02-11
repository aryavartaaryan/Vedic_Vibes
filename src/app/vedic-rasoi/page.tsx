'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import RecipeCard from '@/components/RecipeCard';
import {
    Sparkles,
    ChefHat,
    Leaf,
    AlertCircle,
    Stethoscope,
    Lightbulb,
    Volume2,
    Languages,
    Wind,
    Flame,
    Droplets,
    Mountain,
    Infinity
} from 'lucide-react';
import styles from './rasoi.module.css';
import { BilingualString, BilingualList } from '@/lib/types';

export default function VedicRasoi() {
    const [input, setInput] = useState('');
    const [ingredients, setIngredients] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [aiRecipes, setAiRecipes] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [lang, setLang] = useState<'hi' | 'en'>('hi');
    const [ayurvedicInsight, setAyurvedicInsight] = useState<{
        isCompatible: boolean,
        analysis: BilingualString,
        doshaBalance?: BilingualString,
        recommendations: BilingualList
    } | null>(null);

    const getText = useCallback((field: BilingualString) => {
        if (!field) return '';
        if (typeof field === 'string') return field;
        return field[lang] || field['hi'] || '';
    }, [lang]);

    const speakText = (text: string, forceLang?: 'hi' | 'en') => {
        if (typeof window === 'undefined' || !window.speechSynthesis) return;

        const targetLang = forceLang || lang;

        // Create a unique session ID for this speech attempt
        const sessionId = Date.now();
        (window as any)._guruSpeechSession = sessionId;

        // Cancel any ongoing speech and clear heartbeats
        window.speechSynthesis.cancel();
        if ((window as any)._guruHeartbeat) clearInterval((window as any)._guruHeartbeat);

        if (!text) return;

        // Clean text: remove brackets and extra spaces
        const cleanText = text.replace(/\(.*?\)/g, '').replace(/\s+/g, ' ').trim();
        const chunks = cleanText.split(/[.!?।]\s+/).filter(Boolean).map(c => c.trim() + ".");
        let currentChunk = 0;

        const startSpeaking = () => {
            const speakNext = () => {
                // Ensure we are still in the active session
                if ((window as any)._guruSpeechSession !== sessionId) return;

                if (currentChunk >= chunks.length) {
                    if ((window as any)._guruHeartbeat) clearInterval((window as any)._guruHeartbeat);
                    return;
                }

                const utterance = new SpeechSynthesisUtterance(chunks[currentChunk]);
                utterance.lang = targetLang === 'hi' ? 'hi-IN' : 'en-IN';

                const voices = window.speechSynthesis.getVoices();

                // Advanced Guru Voice selection
                const guruVoice =
                    voices.find(v => v.lang.startsWith(targetLang) && (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('google'))) ||
                    voices.find(v => v.lang.startsWith(targetLang)) ||
                    voices.find(v => v.lang.startsWith('hi')) ||
                    voices.find(v => v.lang.startsWith('en'));

                if (guruVoice) utterance.voice = guruVoice;

                utterance.rate = 0.85;
                utterance.pitch = 0.6;
                utterance.volume = 1.0;

                utterance.onend = () => {
                    if ((window as any)._guruSpeechSession === sessionId) {
                        currentChunk++;
                        speakNext();
                    }
                };

                utterance.onerror = (e) => {
                    // Ignore "interrupted" or "canceled" as they are parts of normal flow
                    if (e.error === 'interrupted' || e.error === 'canceled') return;

                    // Log the SPECIFIC error code to help debugging
                    console.error(`Guru speech error [${e.error}]:`, e);

                    if ((window as any)._guruSpeechSession === sessionId) {
                        currentChunk++;
                        speakNext();
                    }
                };

                (window as any)._activeUtterance = utterance;
                window.speechSynthesis.speak(utterance);
            };

            // Heartbeat: Pause and resume to keep long speech alive in Chrome
            (window as any)._guruHeartbeat = setInterval(() => {
                if (window.speechSynthesis.speaking) {
                    window.speechSynthesis.pause();
                    window.speechSynthesis.resume();
                }
            }, 10000);

            speakNext();
        };

        // If voices aren't loaded yet, wait for them
        if (window.speechSynthesis.getVoices().length === 0) {
            window.speechSynthesis.onvoiceschanged = () => {
                window.speechSynthesis.onvoiceschanged = null;
                startSpeaking();
            };
        } else {
            startSpeaking();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && input.trim()) {
            const newIng = input.trim().toLowerCase();
            if (newIng.includes('onion') || newIng.includes('garlic')) {
                alert(`🚫 Sattvic Purity Check: Onion and garlic are avoided in Vedic cooking.`);
                setInput('');
                return;
            }
            if (!ingredients.includes(newIng)) {
                setIngredients([...ingredients, newIng]);
            }
            setInput('');
        }
    };

    const handleGenerate = async () => {
        // Prime the speech engine immediately on user click to preserve activation context
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
            const primer = new SpeechSynthesisUtterance('');
            primer.volume = 0;
            window.speechSynthesis.speak(primer);
        }

        let currentIngredients = [...ingredients];

        if (input.trim()) {
            const newIng = input.trim().toLowerCase();
            if (!currentIngredients.includes(newIng)) {
                currentIngredients = [...currentIngredients, newIng];
                setIngredients(currentIngredients);
            }
            setInput('');
        }

        if (currentIngredients.length === 0) {
            setError(lang === 'hi' ? "कृपया भोजन प्रकट करने के लिए कम से कम एक सामग्री प्रदान करें।" : "Please provide at least one ingredient to manifest a healing meal.");
            return;
        }

        setError(null);
        setAyurvedicInsight(null);
        setLoading(true);
        setAiRecipes([]);

        try {
            const response = await fetch('/api/generate-recipe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ingredients: currentIngredients })
            });
            const data = await response.json();

            if (data.success && data.recipes && data.ayurvedicInsight) {
                setAiRecipes(data.recipes);
                setAyurvedicInsight(data.ayurvedicInsight);

                // Narrate the full insight
                const insightText = getText(data.ayurvedicInsight.analysis);
                const doshaText = getText(data.ayurvedicInsight.doshaBalance);

                let recs = "";
                if (data.ayurvedicInsight.recommendations) {
                    recs = (Array.isArray(data.ayurvedicInsight.recommendations)
                        ? data.ayurvedicInsight.recommendations
                        : (data.ayurvedicInsight.recommendations[lang] || data.ayurvedicInsight.recommendations['hi'] || [])).join('. ');
                }

                const fullInsightSpeech = `${insightText}. ${doshaText}. ${lang === 'hi' ? 'सुझाव' : 'Recommendations'}: ${recs}`;
                speakText(fullInsightSpeech);
            }
            else {
                setError(data.error || "Ancient wisdom is temporarily veiled. (Missing data from Rishis)");
            }
        } catch (err) {
            setError("Connection to the Rishis lost. Please check your internet.");
        } finally {
            setLoading(false);
        }
    };

    const resetRasoi = () => {
        setIngredients([]);
        setInput('');
        setAiRecipes([]);
        setAyurvedicInsight(null);
        setError(null);
        window.speechSynthesis.cancel();
    };

    const removeIng = (index: number) => {
        setIngredients(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <main style={{ backgroundColor: '#f9f5f0', minHeight: '100vh' }}>
            <Navbar />

            {/* Rebranded Hero Section - Centralized */}
            <section className={styles.heroSection}>
                <div className={styles.heroOverlay}>
                    {/* Absolute positioned toggle in hero */}
                    <div className={styles.heroLangToggle}>
                        <button
                            onClick={() => setLang(lang === 'hi' ? 'en' : 'hi')}
                            className={styles.resetButton}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
                        >
                            <Languages size={16} />
                            {lang === 'hi' ? 'English' : 'हिन्दी'}
                        </button>
                    </div>

                    <h1 className={styles.title}>
                        {lang === 'hi' ? 'आयुर्वेद अनुसार भोजन परामर्श' : 'Ayurvedic Bhojana Paramarsha'}
                    </h1>

                    {/* First Mantra - Below Title */}
                    <div className={styles.sacredMantraBox}>
                        <div className={styles.mantraItem}>
                            <span className={styles.mantraSanskrit}>“सं गच्छध्वं सं वदध्वं सं वो मनांसि जानताम् । अन्नं प्राणानां प्रथमं तद्देवा उप जीवन्ति ॥”</span>
                            <span className={styles.mantraEnglish}>(Atharva Veda) — Let us move together, let our minds be in harmony. Food is the first of breaths.</span>
                        </div>
                    </div>
                    <p className={styles.subtitle} style={{ fontSize: '2rem', marginTop: '1.5rem', fontWeight: 600, color: '#3E2723', textShadow: '0 2px 4px rgba(255,255,255,0.6)', lineHeight: 1.4 }}>
                        {lang === 'hi'
                            ? "भोजन पदार्थ डालें, हम उसकी आयुर्वेद अनुसार प्रकृति और उसकी कुछ स्वास्थ्यवर्धक रेसिपी बताएंगे।"
                            : "Enter food ingredients, and we will reveal their Ayurvedic nature and suggest healthy recipes."}
                    </p>

                    {/* Elemental Icons now in Hero */}
                    <div className={styles.elementalHeroContainer}>
                        <div title="Space (Akasha)"><Infinity size={22} color="#B87333" /></div>
                        <div title="Air (Vayu)"><Wind size={22} color="#B87333" /></div>
                        <div title="Fire (Agni)"><Flame size={22} color="#B87333" /></div>
                        <div title="Water (Jala)"><Droplets size={22} color="#B87333" /></div>
                        <div title="Earth (Prithvi)"><Mountain size={22} color="#B87333" /></div>
                    </div>

                    {/* Ingredient Input Area in Hero */}
                    <div className={styles.searchBox}>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder={lang === 'hi' ? "अपनी सामग्री चुनें (जैसे, हल्दी, मूंग दाल)..." : "Select Your Ingredients (e.g., Turmeric, Moong Dal)..."}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </div>

                    <div className={styles.tags}>
                        {ingredients.map((ing, i) => (
                            <span key={i} className={styles.tag}>
                                {ing}
                                <button onClick={() => removeIng(i)} className={styles.removeTag}>×</button>
                            </span>
                        ))}
                    </div>

                    <div className={styles.buttonGroup}>
                        <button className={styles.resetButton} onClick={resetRasoi}>
                            {lang === 'hi' ? "सामग्री साफ करें" : "Clear All Ingredients"}
                        </button>

                        <button className={styles.generateButton} onClick={handleGenerate} disabled={loading}>
                            {loading ? (lang === 'hi' ? "🔮 हीलिंग मील प्रकट हो रहा है..." : "🔮 Manifesting Healing Meal...") : (
                                <>
                                    {lang === 'hi' ? "भोजन की मूल प्रकृति जानें" : "Know the Nature of Food"}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </section>

            <div className={styles.container}>

                {loading && (
                    <div className={styles.spiritualLoading}>
                        <div className={styles.omSpinner}>ॐ</div>
                        <h2 style={{ fontFamily: 'var(--font-header)', fontSize: '2.5rem', color: '#8B4513' }}>
                            {lang === 'hi' ? "वेदों से परामर्श..." : "Consulting the Vedas..."}
                        </h2>
                        <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '1.2rem', opacity: 0.8 }}>
                            {lang === 'hi' ? "आपके प्राण के लिए तत्वों को संतुलित करना।" : "Balancing the elements for your Prana."}
                        </p>
                    </div>
                )}

                {ayurvedicInsight && !loading && (
                    <div className={styles.ayurvedicSection} style={{
                        background: ayurvedicInsight.isCompatible ? 'rgba(34, 197, 94, 0.03)' : 'rgba(239, 68, 68, 0.03)',
                    }}>
                        <div className={styles.ayurvedicHeader}>
                            <Stethoscope size={32} color={ayurvedicInsight.isCompatible ? '#22c55e' : 'var(--sacred-kumkum)'} />
                            <h2 className={styles.ayurvedicTitle}>
                                {ayurvedicInsight.isCompatible ? (lang === 'hi' ? 'सात्विक सद्भाव' : 'Sattvic Harmony') : (lang === 'hi' ? 'विरुद्ध आहार चेतावनी' : 'Viruddha Ahara Warning')}
                            </h2>
                            <button
                                onClick={() => speakText(getText(ayurvedicInsight.analysis))}
                                style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#B87333' }}
                                title="Listen"
                            >
                                <Volume2 size={24} />
                            </button>
                        </div>
                        <p className={styles.ayurvedicAnalysis}>
                            {getText(ayurvedicInsight.analysis).split(/<br\s*\/?>/i).map((line, i) => (
                                <span key={i}>
                                    {line}
                                    {i < getText(ayurvedicInsight.analysis).split(/<br\s*\/?>/i).length - 1 && <br />}
                                </span>
                            ))}
                        </p>
                        {ayurvedicInsight.doshaBalance && (
                            <p className={styles.ayurvedicAnalysis} style={{ fontWeight: '600', color: '#B87333' }}>
                                ✨ {getText(ayurvedicInsight.doshaBalance)}
                            </p>
                        )}

                        {((Array.isArray(ayurvedicInsight.recommendations) && ayurvedicInsight.recommendations.length > 0) ||
                            (!Array.isArray(ayurvedicInsight.recommendations) && ayurvedicInsight.recommendations[lang]?.length > 0)) && (
                                <div className={styles.recommendationsBox}>
                                    <div className={styles.recommendationsTitle}>
                                        <Lightbulb size={24} />
                                        <span>{lang === 'hi' ? 'संतुलन के लिए बेहतर संयोजन:' : 'Better Combinations for Balance:'}</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {(Array.isArray(ayurvedicInsight.recommendations)
                                            ? ayurvedicInsight.recommendations
                                            : (ayurvedicInsight.recommendations[lang] || ayurvedicInsight.recommendations['hi'] || [])
                                        ).map((rec: any, idx: number) => (
                                            <div key={idx} className={styles.recommendationItem}>
                                                <span className={styles.recommendationBullet}>•</span>
                                                {typeof rec === 'string' ? rec : getText(rec)}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                    </div>
                )}

                {error && (
                    <div style={{ textAlign: 'center', color: '#B22222', margin: '3rem 0', padding: '2rem', border: '1px solid #ffccbc', borderRadius: '16px', backgroundColor: '#fff5f2' }}>
                        <AlertCircle size={40} style={{ marginBottom: '1rem', opacity: 0.8 }} />
                        <p style={{ fontWeight: '700', fontSize: '1.3rem' }}>🙏 {error}</p>
                        <p style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '0.5rem', fontFamily: 'monospace' }}>
                            {lang === 'hi' ? 'दोष विवरण: ' : 'Ritual Detail: '} {error}
                        </p>
                        <button onClick={handleGenerate} style={{ marginTop: '2rem', background: '#B87333', color: 'white', border: 'none', cursor: 'pointer', padding: '1rem 3rem', borderRadius: '12px', fontWeight: 'bold' }}>
                            {lang === 'hi' ? "पुनः प्रयास करें" : "Try Again"}
                        </button>
                    </div>
                )}

                {!loading && aiRecipes.length > 0 && (
                    <div className={styles.resultsArea}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '3rem' }}>
                            <ChefHat size={40} color="#B87333" />
                            <h2 style={{ fontFamily: 'var(--font-header)', fontSize: '2.5rem', margin: 0 }}>
                                {lang === 'hi' ? "हीलिंग मेनिफेस्टेशन्स" : "Healing Manifestations"}
                            </h2>
                        </div>
                        <div className={styles.grid}>
                            {aiRecipes.map(recipe => (
                                <div key={recipe.id} style={{ position: 'relative' }}>
                                    <RecipeCard recipe={recipe} lang={lang} />
                                    <button
                                        onClick={() => {
                                            const ingredientsText = recipe.ingredients.map((ing: any) => `${getText(ing.name)} ${ing.quantity}`).join(', ');
                                            const instructionsText = (recipe.instructions[lang] || recipe.instructions['hi'] || []).join('. ');
                                            const doshaEffect = recipe.doshaEffect ? `${getText(recipe.doshaEffect)}. ` : '';
                                            const fullRecipeSpeech = `${getText(recipe.title)}. ${doshaEffect}${getText(recipe.description)}. ` +
                                                `${lang === 'hi' ? 'सामग्री' : 'Ingredients'}: ${ingredientsText}. ` +
                                                `${lang === 'hi' ? 'बनाने की विधि' : 'Instructions'}: ${instructionsText}`;
                                            speakText(fullRecipeSpeech);
                                        }}
                                        style={{ position: 'absolute', bottom: '20px', right: '20px', zIndex: 10, background: 'white', border: '2px solid #B87333', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#B87333', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
                                        title="Listen"
                                    >
                                        <Volume2 size={20} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
