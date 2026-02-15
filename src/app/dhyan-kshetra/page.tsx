"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Globe } from 'lucide-react';
import styles from "../vedic-rasoi/rasoi.module.css";
import translations from '@/lib/vaidya-translations.json';
import pageStyles from "./page.module.css";
import SriYantra from '@/components/SriYantra/SriYantra';
import MantraSangrah from '@/components/MantraSangrah/MantraSangrah';
import IntroVideoFlash from '@/components/IntroVideoFlash/IntroVideoFlash';

// Move static videoList outside to prevent re-renders from recreating it
const VIDEO_LIST: string[] = [
    "https://ik.imagekit.io/aup4wh6lq/Most%20powerful%20Maheshvara%20Su%CC%84tram%20_%20the%20primal%20sound%20of%20creation.%E0%A4%AE%E0%A4%BE%E0%A4%B9%E0%A5%87%E0%A4%B6%E0%A5%8D%E0%A4%B5%E0%A4%B0%20%E0%A4%B8%E0%A5%82%E0%A4%A4%E0%A5%8D%E0%A4%B0%E0%A4%AE%E0%A5%8D%20_%20%E0%A4%9C%E0%A4%BF%E0%A4%B8%E0%A4%B8%E0%A5%87%20%E0%A4%B8%E0%A4%AE%E0%A5%8D%E0%A4%AA%E0%A5%82%E0%A4%B0%E0%A5%8D%E0%A4%A3.mp4",
    "https://ik.imagekit.io/aup4wh6lq/Just%20feel%20the%20energy%20____Follow%20@fmccreators%20for%20more_%E0%A4%B9%E0%A4%B0%20%E0%A4%B9%E0%A4%B0%20%E0%A4%AE%E0%A4%B9%E0%A4%BE%E0%A4%A6%E0%A5%87%E0%A4%B5%20__%E0%A4%9C%E0%A4%AF%20%E0%A4%B6%E0%A4%82%E0%A4%95%E0%A4%B0%20___Do%20like.mp4",
    "https://ik.imagekit.io/aup4wh6lq/%E0%A4%86%E0%A4%AA%20%E0%A4%B8%E0%A4%AD%E0%A5%80%20%E0%A4%95%E0%A5%8B%20%E0%A4%A8%E0%A4%B5%20%E0%A4%B5%E0%A4%B0%E0%A5%8D%E0%A4%B7%20%E0%A4%95%E0%A5%80%20%E0%A4%B9%E0%A4%BE%E0%A4%B0%E0%A5%8D%E0%A4%A6%E0%A4%BF%E0%A4%95%20%E0%A4%AC%E0%A4%A7%E0%A4%BE%E0%A4%88%20%E0%A4%8F%E0%A4%B5%E0%A4%82%20%E0%A4%B6%E0%A5%81%E0%A4%AD%E0%A4%95%E0%A4%BE%E0%A4%AE%E0%A4%A8%E0%A4%BE%E0%A4%8F%E0%A4%81_%E0%A4%B9%E0%A4%B0%20%E0%A4%B9%E0%A4%B0%20%E0%A4%AE%E0%A4%B9%E0%A4%BE%E0%A4%A6%E0%A5%87%E0%A4%B5____.mp4",
    "https://ik.imagekit.io/aup4wh6lq/The%20_Lord%20who%20is%20half%20woman_%20signifies%20the%20perfect%20synthesis%20of%20masculine%20and%20feminine%20energies,.mp4",
    "https://ik.imagekit.io/aup4wh6lq/Shiv%20Swarnamala%20Stuti%20_%E2%9D%A4%EF%B8%8F%20I%20Verse%20-%207%20_.Follow%20@aumm_namah_shivay%20for%20more%20%E2%9D%A4%EF%B8%8F%20.._mahadev%20_shiv.mp4",
    "https://ik.imagekit.io/aup4wh6lq/Most%20people%20don_t%20realize%20it,%20but%20sound%20has%20the%20power%20to%20heal%20-%20or%20harm.%20There_s%20a%20reason%20why%20an.mp4",
    "/videos/mahashivratri_darshan.mp4",
    "https://ik.imagekit.io/aup4wh6lq/Kaal%20Bhairav%20Ashtakam%20_%20Tanuku%20Sisters%20_%20@DivineDharohar.mp4"
];

export default function DhyanKakshaPage() {
    const [lang, setLang] = useState<'en' | 'hi'>('hi');
    const [showIntro, setShowIntro] = useState(true);
    const [hasStarted, setHasStarted] = useState(false); // NEW: Track user activation
    const [startBackgroundLoop, setStartBackgroundLoop] = useState(false);
    const [playMantra, setPlayMantra] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isMantraPlaying, setIsMantraPlaying] = useState(false);
    const [forceMantraId, setForceMantraId] = useState<string | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isSessionPaused, setIsSessionPaused] = useState(false);
    const [introVideos, setIntroVideos] = useState<{ src: string, text?: string | string[] }[]>([]);
    const [slideVideos, setSlideVideos] = useState<string[]>([]);
    const [videoProgress, setVideoProgress] = useState(0);
    const [videoTime, setVideoTime] = useState(0);
    const [videoDuration, setVideoDuration] = useState(0);
    const [isVideoLoading, setIsVideoLoading] = useState(false);
    const sequentialVideoRef = React.useRef<HTMLVideoElement>(null);

    const playlist = useMemo(() => {
        return [
            { type: "mantra", id: "guidance", src: "/audio/Guidance.wav", title: "Guidance", titleHi: "दर्शन और मार्गदर्शन" },
            { type: "mantra", id: "/audio/Om_Sahana_Vavatu_Shanti_Mantra.mp3", src: "/audio/Om_Sahana_Vavatu_Shanti_Mantra.mp3", title: "Om Sahana Vavatu", titleHi: "ॐ सहना ववतु" },
            { type: "video", id: "v1", src: VIDEO_LIST[0], title: "Maheshvara Sutram", titleHi: "महेश्वर सूत्रम्", trimEnd: 4 },
            { type: "mantra", id: "/audio/Lalitha Sahasranamam I Manojna & Pradanya - Om Voices Junior I The names of Goddess Lalitha Devi [zNYj8GrXEQk].mp3", src: "/audio/Lalitha Sahasranamam I Manojna & Pradanya - Om Voices Junior I The names of Goddess Lalitha Devi [zNYj8GrXEQk].mp3", title: "Lalitha Sahasranamam", titleHi: "ललिता सहस्रनाम (विशेष)" },
            { type: "video", id: "v2", src: VIDEO_LIST[1], title: "Shiv Shakti Energy", titleHi: "शिव शक्ति ऊर्जा" },
            { type: "video", id: "v_vishesh", src: "https://ik.imagekit.io/aup4wh6lq/VISHNU%20SAHASRANAMAM%20_%20Madhubanti%20Bagchi%20&%20Siddharth%20Bhavsar%20_%20Stotra%20For%20Peace%20&%20Divine%20Blessings.mp4", title: "Vishesh", titleHi: "विष्णु सहस्रनाम | मधुबंती बागची & सिद्धार्थ भावसार | शांति और दिव्य आशीर्वाद के लिए स्तोत्र", startTime: 7 },
            { type: "video", id: "v3", src: VIDEO_LIST[2], title: "Mahadev Nav Varsh", titleHi: "महादेव नव वर्ष" },
            { type: "mantra", id: "/audio/Challakere_Brothers_vedic_chanting_-_Shri_suktam_(mp3.pm).mp3", src: "/audio/Challakere_Brothers_vedic_chanting_-_Shri_suktam_(mp3.pm).mp3", title: "Shri Suktam", titleHi: "श्री सूक्तम्" },
            { type: "video", id: "v4", src: VIDEO_LIST[3], title: "Ardhanarishwara", titleHi: "अर्धनारीश्वर स्वरूप" },
            { type: "mantra", id: "/audio/Anant_-_a_collection_of_vedic_chants_-_05._Narayana_Suktam_(mp3.pm).mp3", src: "/audio/Anant_-_a_collection_of_vedic_chants_-_05._Narayana_Suktam_(mp3.pm).mp3", title: "Narayana Suktam", titleHi: "नारायण सूक्तम्" },
            { type: "video", id: "v5", src: VIDEO_LIST[4], title: "Shiv Swarnamala", titleHi: "शिव स्वर्णमाला स्तुति" },
            { type: "mantra", id: "/audio/Challakere_Brothers_vedic_chanting_-_MahaMrtyunjaya_mantrah_108_times_(mp3.pm).mp3", src: "/audio/Challakere_Brothers_vedic_chanting_-_MahaMrtyunjaya_mantrah_108_times_(mp3.pm).mp3", title: "MahaMrtyunjaya", titleHi: "महामृत्युंजय मंत्र" },
            { type: "video", id: "v6", src: VIDEO_LIST[5], title: "Sound Healing", titleHi: "नाद चिकित्सा" },
            { type: "mantra", id: "/audio/Shiva Tandava Stotram (All 18 Slokas)  Vande Guru Paramparaam  'Shiva-Bhakta' Ravana.mp3", src: "/audio/Shiva Tandava Stotram (All 18 Slokas)  Vande Guru Paramparaam  'Shiva-Bhakta' Ravana.mp3", title: "Shiva Tandava", titleHi: "शिव ताण्डव स्तोत्रम्" },
            { type: "video", id: "v7", src: VIDEO_LIST[6], title: "Mahashivratri Special", titleHi: "महाशिवरात्रि दर्शन" },
            { type: "video", id: "v8", src: VIDEO_LIST[7], title: "Kaal Bhairav Ashtakam", titleHi: "काल भैरव अष्टकम्" }
        ];
    }, []);

    const currentItem = playlist[currentIndex];

    const handleSelectIndex = (index: number) => {
        if (index === currentIndex) {
            // TOGGLE PLAY/PAUSE
            setIsSessionPaused(!isSessionPaused);
            return;
        }

        console.log(`Manual selection: Index ${index}`, playlist[index]);

        // Reset unified video control bar state
        setVideoProgress(0);
        setVideoTime(0);
        setVideoDuration(0);

        setCurrentIndex(index);
        setIsSessionPaused(false);

        // AUTO-SCROLL TO TOP: Ensure video/player is visible
        if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        if (playlist[index].type === 'mantra') {
            // STOP active video if any
            if (sequentialVideoRef.current) {
                sequentialVideoRef.current.pause();
            }
            setForceMantraId(playlist[index].id || null);
            setIsMantraPlaying(true);
        } else {
            // STOP active audio
            setIsMantraPlaying(false);
            setForceMantraId(null);
        }
    };

    const goNext = () => {
        let nextIndex = (currentIndex + 1) % playlist.length;
        // SKIP index 0 (Guidance) during automatic loops - it's only for the start
        if (nextIndex === 0 && playlist.length > 1) {
            nextIndex = 1;
        }
        handleSelectIndex(nextIndex);
    };

    // Effect to handle sequential video playback robustly
    useEffect(() => {
        const video = sequentialVideoRef.current;
        if (!video || !startBackgroundLoop) return;

        if (currentItem.type === 'video') {
            // Ensure source is synced and loaded if it changed
            if (!video.src.includes(currentItem.src)) {
                console.log(`[Video Sync] Loading source: ${currentItem.titleHi}`);
                video.src = currentItem.src;
                if ((currentItem as any).startTime) {
                    video.currentTime = (currentItem as any).startTime;
                }
                video.load();
            }

            if (isSessionPaused || isMantraPlaying) {
                video.pause();
            } else {
                console.log(`[Playback] Triggering video: ${currentItem.titleHi}`);
                video.muted = isMuted;
                video.play().catch(err => {
                    if (err && typeof err === 'object' && 'name' in err && err.name === 'AbortError') {
                        console.log("Video play request was interrupted (AbortError), ignoring.");
                    } else {
                        console.warn("Video play failed, attempting muted fallback:", err);
                        video.muted = true;
                        video.play().catch(() => { });
                    }
                });
            }
        } else if (currentItem.type === 'mantra') {
            // Ensure video turn is PAUSED when it's mantra turn
            video.pause();
        }
    }, [currentIndex, currentItem.src, currentItem.type, isMuted, isSessionPaused, isMantraPlaying, startBackgroundLoop]);



    const t = translations[lang];

    const toggleLanguage = () => {
        setLang(prev => prev === 'en' ? 'hi' : 'en');
    };



    // State for A/B double buffering ambient slides (Videos + Images)
    const [ambientSlides, setAmbientSlides] = useState<{ src: string, type: 'video' | 'image' }[]>([]);
    const [currentSlideA, setCurrentSlideA] = useState<{ src: string, type: 'video' | 'image', start?: number, animationIndex?: number } | null>(null);
    const [currentSlideB, setCurrentSlideB] = useState<{ src: string, type: 'video' | 'image', start?: number, animationIndex?: number } | null>(null);
    const [activeBuffer, setActiveBuffer] = useState<'A' | 'B'>('A');

    const videoRefA = React.useRef<HTMLVideoElement>(null);
    const videoRefB = React.useRef<HTMLVideoElement>(null);

    // Fetch Media on Mount
    useEffect(() => {
        const fetchMedia = async () => {
            try {
                // 1. Fetch Flash Videos for Intro
                const flashRes = await fetch('/api/videos?folder=Flash Videos');
                console.log("[Intro] Flash fetch status:", flashRes.status);
                if (flashRes.ok) {
                    const data = await flashRes.json();
                    console.log("[Intro] Flash videos found:", data.files?.length);
                    const videos = data.files
                        .filter((f: any) => {
                            const name = f.name.toLowerCase();
                            // Robust filter for Sahana Bhavatu (Shanti Mantra)
                            return !name.includes('sahana') &&
                                !name.includes('bhavatu') &&
                                !name.includes('sahna') &&
                                !name.includes('shanti_mantra');
                        })
                        .map((f: any) => {
                            let text: string | string[] = "";
                            if (f.name.includes('kailash') && !f.name.includes('2')) {
                                text = [
                                    "🕉\n\nॐ असतो मा सद्गमय ।\nतमसो मा ज्योतिर्गमय ।\nमृत्योर्मा अमृतं गमय ।\nॐ शान्तिः शान्तिः शान्तिः ॥\n\nशुक्ल यजुर्वेद",
                                    "हे परमात्मा!\nहमें असत्य से सत्य की ओर ले चलो।\nअज्ञान रूपी अंधकार से ज्ञान के प्रकाश की ओर ले चलो।\nमृत्यु और भय से अमरत्व एवं आत्मिक शांति की ओर ले चलो।\n\n\nॐ शांति शांति शांति।\n\nहमारे मन में शांति हो,\nहमारे आसपास शांति हो,\nसंपूर्ण सृष्टि में शांति हो।",
                                    "शिव की पवित्र ध्यान स्थली, कैलाश में आपका स्वागत है। यहाँ अनन्त शांति की अनुभूति होती है।"
                                ];
                            }
                            else if (f.name.includes('kailash2')) {
                                text = [
                                    "अब आप चिंता मुक्त हो जाइए। हम अत्याधुनिक तकनीक और ऋषियों के प्राचीन ज्ञान के मिश्रण से आपकी समस्याओं का समाधान करेंगे।",
                                    "अब आप विशेष ध्यान क्षेत्र में प्रवेश कर रहे हैं..."
                                ];
                            } else {
                                text = "विशेष ध्यान क्षेत्र में आपका स्वागत है...";
                            }

                            return { src: f.path, text: text };
                        });
                    setIntroVideos(videos);
                }

                // 2. Fetch Slide Videos & Images for Background
                const [vRes, iRes] = await Promise.all([
                    fetch('/api/videos?folder=Slide Videos&t=' + Date.now()),
                    fetch('/api/images')
                ]);

                let combined: { src: string, type: 'video' | 'image' }[] = [];

                if (vRes.ok) {
                    const vData = await vRes.json();
                    combined = [...combined, ...vData.files.map((f: any) => ({ src: f.path, type: 'video' }))];
                }
                if (iRes.ok) {
                    const iData = await iRes.json();
                    combined = [...combined, ...iData.files.map((f: any) => ({ src: f.path, type: 'image' }))];
                }

                console.log("Loaded unified ambient slides:", combined);
                setAmbientSlides(combined);

                // Initial Slide
                if (combined.length > 0) {
                    const first = combined[Math.floor(Math.random() * combined.length)];
                    const start = first.type === 'video' ? Math.floor(Math.random() * 4) * 15 : undefined;
                    const animationIndex = Math.floor(Math.random() * 4) + 1; // 1 to 4
                    setCurrentSlideA({ ...first, start, animationIndex });
                    setActiveBuffer('A');
                }
            } catch (error) {
                console.error("Failed to fetch media:", error);
            }
        };

        fetchMedia();
    }, []);

    // Function to prepare the NEXT slide into the inactive buffer
    const pickRandomSlide = (isAgnihotraSession: boolean) => {
        if (ambientSlides.length === 0) return;

        const currentActive = activeBuffer === 'A' ? currentSlideA : currentSlideB;
        const currentActiveSrc = currentActive?.src;
        const currentActiveType = currentActive?.type;

        // FILTER: Only include images if it's an Agnihotra/Shanti session
        let pool = ambientSlides;
        if (!isAgnihotraSession) {
            pool = ambientSlides.filter(s => s.type === 'video');
            // If no videos available (shouldn't happen), fallback to all
            if (pool.length === 0) pool = ambientSlides;
        }

        // Distribution Filter: Encourage switching types (video <-> image) if possible
        const otherTypeSlides = pool.filter(s => s.type !== currentActiveType);
        const finalPool = otherTypeSlides.length > 0 ? otherTypeSlides : pool;

        let nextSlide = finalPool[Math.floor(Math.random() * finalPool.length)];

        // Avoid immediate repeat of the exact same source
        if (finalPool.length > 1 && nextSlide.src === currentActiveSrc) {
            nextSlide = finalPool.filter(s => s.src !== currentActiveSrc)[Math.floor(Math.random() * (finalPool.length - 1))];
        }

        const start = nextSlide.type === 'video' ? Math.floor(Math.random() * 4) * 15 : undefined;
        const animationIndex = Math.floor(Math.random() * 4) + 1; // 1 to 4

        console.log(`[Ambient] Buffering ${isAgnihotraSession ? 'Agnihotra' : 'Regular'} ${nextSlide.type} into ${activeBuffer === 'A' ? 'B' : 'A'}:`, nextSlide.src);

        if (activeBuffer === 'A') {
            setCurrentSlideB({ ...nextSlide, start, animationIndex });
        } else {
            setCurrentSlideA({ ...nextSlide, start, animationIndex });
        }
    };

    const isAgnihotra = useMemo(() => {
        const title = currentItem.titleHi.toLowerCase() + currentItem.title.toLowerCase();
        return title.includes('अग्निहोत्र') ||
            title.includes('agnihotra') ||
            title.includes('शान्ति') ||
            title.includes('shanti');
    }, [currentItem]);

    // Auto-rotate ambient slides: 3s for images (Agnihotra), 30s for videos
    React.useEffect(() => {
        if (!startBackgroundLoop || ambientSlides.length === 0) return;

        const currentSlide = activeBuffer === 'A' ? currentSlideA : currentSlideB;
        const effectiveDuration = (currentSlide?.type === 'image') ? 3000 : 30000;

        console.log(`[Ambient] Timer set for ${effectiveDuration}ms (${currentSlide?.type}). Agnihotra Mode: ${isAgnihotra}`);

        const interval = setInterval(() => {
            console.log(`[Ambient] Rotating slide...`);
            pickRandomSlide(isAgnihotra);
        }, effectiveDuration);

        return () => clearInterval(interval);
    }, [startBackgroundLoop, ambientSlides.length, activeBuffer, currentSlideA?.src, currentSlideB?.src, isAgnihotra]);

    // Handle media synchronization on the buffers
    React.useEffect(() => {
        if (!startBackgroundLoop) return;

        const syncBuffer = (buffer: 'A' | 'B') => {
            const slide = buffer === 'A' ? currentSlideA : currentSlideB;
            const ref = buffer === 'A' ? videoRefA : videoRefB;

            if (ref.current && slide && slide.type === 'video') {
                const video = ref.current;
                const toPlay = encodeURI(slide.src);

                if (!video.src.includes(toPlay)) {
                    video.src = toPlay;
                    if (slide.start !== undefined) video.currentTime = slide.start;
                    video.load();
                }

                if (buffer === activeBuffer && currentItem.type === 'mantra') {
                    video.play().catch(e => {
                        if (e.name !== 'AbortError') console.warn(`[Ambient] Buffer ${buffer} play failed:`, e);
                    });
                }
            }
        };

        syncBuffer('A');
        syncBuffer('B');
    }, [currentSlideA, currentSlideB, activeBuffer, startBackgroundLoop, currentItem.type]);


    const ambientLayerStyle: React.CSSProperties = {
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: 'top center',
        transition: 'opacity 1.5s ease-in-out',
    };

    return (
        <main
            className={pageStyles.container}
            style={{
                minHeight: '100vh',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* SPLASH SCREEN FOR USER ACTIVATION (Audio restriction fix) */}
            {!hasStarted && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 9999,
                    background: 'radial-gradient(circle at center, #1a0f05 0%, #0a0502 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '2rem',
                    textAlign: 'center',
                    padding: '2rem'
                }}>
                    <div style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        background: 'rgba(212, 175, 55, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 40px rgba(184, 134, 11, 0.2)',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        animation: 'pulse 3s infinite ease-in-out'
                    }}>
                        <div className={pageStyles.goldenOmEntranceContainer}>
                            <img src="/images/golden_om_enter.png" alt="Vedic Om" className={pageStyles.goldenOmEntrance} />
                        </div>
                    </div>

                    <div style={{ maxWidth: '600px' }}>
                        <h1 style={{
                            color: '#FFD700',
                            fontFamily: "'Playfair Display', serif",
                            fontSize: '2.5rem',
                            marginBottom: '1rem',
                            textShadow: '0 0 20px rgba(255, 215, 0, 0.3)'
                        }}>
                            ध्यान क्षेत्र
                        </h1>
                        <p style={{
                            color: 'rgba(255, 255, 255, 0.8)',
                            fontSize: '1.2rem',
                            lineHeight: '1.6',
                            fontFamily: "'Noto Serif Devanagari', serif"
                        }}>
                            Prepare for a divine meditation experience.<br />
                            दिव्य ध्यान अनुभव के लिए तैयार रहें।
                        </p>
                    </div>

                    <button
                        onClick={() => introVideos.length > 0 && setHasStarted(true)}
                        className={`${pageStyles.enterButton} ${introVideos.length === 0 ? pageStyles.buttonLoading : ""}`}
                        disabled={introVideos.length === 0}
                    >
                        {introVideos.length === 0 ? "प्रतीक्षा करें..." : "प्रवेश करें"}
                    </button>

                    <style jsx>{`
                        @keyframes pulse {
                            0% { transform: scale(1); opacity: 0.8; }
                            50% { transform: scale(1.05); opacity: 1; border-color: rgba(212, 175, 55, 0.6); }
                            100% { transform: scale(1); opacity: 0.8; }
                        }
                    `}</style>
                </div>
            )}

            {/* INTRO VIDEO FLASH (Now activates after user interaction) */}
            {showIntro && hasStarted && (
                <IntroVideoFlash
                    videos={introVideos}
                    onFadeOutStart={() => {
                        console.log("[Intro] Fade out started, initiating background early...");
                        setStartBackgroundLoop(true);
                    }}
                    onComplete={() => {
                        console.log("Intro complete. Starting Margdarshan...");
                        setShowIntro(false);
                        setStartBackgroundLoop(true);
                        setIsSessionPaused(false);

                        // Explicitly trigger Margdarshan (playlist[0])
                        const firstItem = playlist[0];
                        if (firstItem && firstItem.type === 'mantra') {
                            setForceMantraId(firstItem.id || null);
                            setIsMantraPlaying(true);
                        }
                    }}
                />
            )}

            {/* ... language button ... */}
            <button
                onClick={toggleLanguage}
                style={{
                    position: 'fixed',
                    top: '20px',
                    right: '130px',
                    zIndex: 100,
                    padding: '0.5rem 1.2rem',
                    background: 'linear-gradient(135deg, rgba(10, 5, 2, 0.9) 0%, rgba(25, 12, 5, 0.85) 100%)',
                    color: '#FFD700',
                    border: '1.5px solid rgba(212, 175, 55, 0.5)',
                    borderRadius: '25px',
                    boxShadow: '0 0 15px rgba(255, 165, 0, 0.25), 0 4px 15px rgba(0, 0, 0, 0.4)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontFamily: "'Noto Serif Devanagari', serif",
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)'
                }}
            >
                <Globe size={14} />
                {lang === 'en' ? 'हिन्दी' : 'English'}
            </button>

            {/* Mantra Sangrah - Divine Audio Player */}
            <MantraSangrah
                lang={lang}
                startPlaying={false}
                forceTrackId={forceMantraId}
                isPaused={currentItem.type === 'video'}
                isSessionPaused={isSessionPaused}
                sessionActive={!showIntro}
                onPlayingChange={(playing) => {
                    setIsMantraPlaying(playing);
                    // If a mantra starts playing, PAUSE the video
                    if (playing && currentItem.type === 'video') {
                        // We DON'T set isSessionPaused to true here, as it might pause the mantra itself
                        // Instead, we just pause the video element
                        if (sequentialVideoRef.current) {
                            sequentialVideoRef.current.pause();
                        }
                    } else if (playing && isSessionPaused) {
                        // Reset session pause if manually starting a mantra from library
                        setIsSessionPaused(false);
                    }
                }}
                onTrackEnded={() => {
                    if (currentItem.type === 'mantra') {
                        goNext();
                    }
                }}
                externalPlaylist={playlist}
                currentIndex={currentIndex}
                onSelectIndex={handleSelectIndex}
                onMutedChange={setIsMuted}
                // Video Control Props
                videoProgress={videoProgress}
                videoTime={videoTime}
                videoDuration={videoDuration}
                onVideoSeek={(time) => {
                    if (sequentialVideoRef.current) {
                        sequentialVideoRef.current.currentTime = time;
                    }
                }}
                onVideoToggle={() => {
                    if (sequentialVideoRef.current) {
                        if (isSessionPaused) {
                            sequentialVideoRef.current.play().catch(() => { });
                            setIsSessionPaused(false);
                        } else {
                            sequentialVideoRef.current.pause();
                            setIsSessionPaused(true);
                        }
                    }
                }}
            />

            {/* BACKGROUND LAYERS */}
            {startBackgroundLoop && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    zIndex: 1,
                    pointerEvents: 'none'
                }}>
                    {/* LAYER 1: Meditation Sequence Video (Darshans) */}
                    <video
                        ref={sequentialVideoRef}
                        playsInline
                        onEnded={goNext}
                        onWaiting={() => setIsVideoLoading(true)}
                        onPlaying={() => setIsVideoLoading(false)}
                        onLoadedData={() => setIsVideoLoading(false)}
                        onCanPlay={() => setIsVideoLoading(false)}
                        onError={(e) => {
                            setIsVideoLoading(false);
                            const error = (e.currentTarget.error);
                            console.error(`[Sequential Video Error] Code ${error?.code}: ${error?.message}`, currentItem.src);
                        }}
                        onTimeUpdate={(e) => {
                            const video = e.currentTarget;

                            // Update unified control bar state
                            if (video.duration > 0) {
                                setVideoTime(video.currentTime);
                                setVideoDuration(video.duration);
                                setVideoProgress((video.currentTime / video.duration) * 100);
                            }

                            const trim = (currentItem as any).trimEnd;
                            if (trim && video.currentTime > 0 && video.duration > 0) {
                                if (video.duration - video.currentTime <= trim) {
                                    console.log(`[Trimming] Early transition for ${currentItem.id}`);
                                    goNext();
                                }
                            }
                        }}
                        style={{
                            display: currentItem.type === 'video' ? 'block' : 'none',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain', // User requested no cutting
                            objectPosition: 'center',
                            transition: 'opacity 1s ease-in-out',
                            zIndex: 10,
                            backgroundColor: '#000' // Ensure black bars if ratio differs
                        }}
                    />

                    {/* VIDEO LOADING OVERLAY */}
                    {isVideoLoading && currentItem.type === 'video' && (
                        <div className={pageStyles.videoBufferingOverlay}>
                            <div className={pageStyles.spiritualSpinner}>
                                <div className={pageStyles.spinnerLotus}>🪷</div>
                                <span className={pageStyles.loadingText}>
                                    {lang === 'hi' ? 'प्राण ऊर्जा संचित हो रही है...' : 'Accumulating Pranic Energy...'}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* LAYER 2: Ambient Background Loop (During Mantras) - A/B Double Buffering */}
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            zIndex: 0,
                            backgroundColor: '#000',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Buffer A - Media Display */}
                        {currentSlideA && (
                            currentSlideA.type === 'video' ? (
                                <video
                                    ref={videoRefA}
                                    autoPlay
                                    muted
                                    playsInline
                                    onCanPlayThrough={() => activeBuffer === 'B' && setActiveBuffer('A')}
                                    onEnded={() => activeBuffer === 'A' && pickRandomSlide(isAgnihotra)}
                                    style={{
                                        ...ambientLayerStyle,
                                        opacity: activeBuffer === 'A' ? 1 : 0,
                                        zIndex: activeBuffer === 'A' ? 2 : 1
                                    }}
                                />
                            ) : (
                                <img
                                    src={currentSlideA.src}
                                    alt="Atmosphere"
                                    onLoad={() => activeBuffer === 'B' && setActiveBuffer('A')}
                                    className={pageStyles[`ambientCinematic${currentSlideA.animationIndex || 1}`]}
                                    style={{
                                        ...ambientLayerStyle,
                                        objectFit: 'cover',
                                        opacity: activeBuffer === 'A' ? 1 : 0,
                                        zIndex: activeBuffer === 'A' ? 2 : 1
                                    }}
                                />
                            )
                        )}

                        {/* Buffer B - Media Display */}
                        {currentSlideB && (
                            currentSlideB.type === 'video' ? (
                                <video
                                    ref={videoRefB}
                                    autoPlay
                                    muted
                                    playsInline
                                    onCanPlayThrough={() => activeBuffer === 'A' && setActiveBuffer('B')}
                                    onEnded={() => activeBuffer === 'B' && pickRandomSlide(isAgnihotra)}
                                    style={{
                                        ...ambientLayerStyle,
                                        opacity: activeBuffer === 'B' ? 1 : 0,
                                        zIndex: activeBuffer === 'B' ? 2 : 1
                                    }}
                                />
                            ) : (
                                <img
                                    src={currentSlideB.src}
                                    alt="Atmosphere"
                                    onLoad={() => activeBuffer === 'A' && setActiveBuffer('B')}
                                    className={pageStyles[`ambientCinematic${currentSlideB.animationIndex || 1}`]}
                                    style={{
                                        ...ambientLayerStyle,
                                        objectFit: 'cover',
                                        opacity: activeBuffer === 'B' ? 1 : 0,
                                        zIndex: activeBuffer === 'B' ? 2 : 1
                                    }}
                                />
                            )
                        )}
                    </div>
                </div>
            )}

            {/* Dark Overlay REMOVED for brightness */}
            {/* <div style={{...}} /> */}

            {/* Radial Vignette REMOVED for brightness */}
            {/* <div style={{...}} /> */}

            {/* Main Content Container */}
            <div className={`${pageStyles.heroSection} ${showIntro ? pageStyles.mainContentHidden : ""}`}>



                {/* Page Title - Grand Temple Banner */}
                <div className={pageStyles.titleContainer}>
                    <h1 className={pageStyles.titleText}>
                        {t.pageTitle}
                    </h1>
                </div>

                {/* Sri Yantra - Central Focus - Size adjusted in component CSS */}
                <div className={pageStyles.sriYantraContainer}>
                    <SriYantra />
                </div>



            </div>
        </main>
    );
}
