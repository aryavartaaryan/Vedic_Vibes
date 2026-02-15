"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Globe, Sparkles, Volume2, VolumeX } from 'lucide-react';
import styles from "../vedic-rasoi/rasoi.module.css";
import translations from '@/lib/vaidya-translations.json';
import pageStyles from "./page.module.css";
import SriYantra from '@/components/SriYantra/SriYantra';
import MantraSangrah from '@/components/MantraSangrah/MantraSangrah';
import IntroVideoFlash from '@/components/IntroVideoFlash/IntroVideoFlash';
import LightweightPlayer from '@/components/LightweightPlayer/LightweightPlayer';

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
    const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null);
    const [isMantraPlaying, setIsMantraPlaying] = useState(false);
    const [forceMantraId, setForceMantraId] = useState<string | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isSessionPaused, setIsSessionPaused] = useState(false);
    const [introVideos, setIntroVideos] = useState<{ src: string, text?: string | string[] }[]>([]);
    const [slideVideos, setSlideVideos] = useState<string[]>([]);
    const [videoProgress, setVideoProgress] = useState(0);
    const [videoTime, setVideoTime] = useState(0);
    const [videoDuration, setVideoDuration] = useState(0);
    const [audioTime, setAudioTime] = useState(0);
    const [audioDuration, setAudioDuration] = useState(0);
    const [isVideoLoading, setIsVideoLoading] = useState(false);
    const [activeMantra, setActiveMantra] = useState<any>(null);
    const [manualTrack, setManualTrack] = useState<any>(null); // NEW: For library/manual selections
    const sequentialVideoRef = React.useRef<HTMLVideoElement>(null);

    const playlist = useMemo(() => {
        // PRE-REQUISITE ITEMS (The Specific Start Sequence)
        // 1. HARDCODED START SEQUENCE (Spiritual Priority)
        const startSequence = [
            { type: "mantra", id: "guidance", src: "/audio/Guidance.wav", title: "Guidance", titleHi: "आज्ञा और मार्गदर्शन" },
            { type: "mantra", id: "sahana", src: "/audio/Om_Sahana_Vavatu_Shanti_Mantra.mp3", title: "Om Sahana Vavatu", titleHi: "ॐ सहना ववतु" },
            { type: "mantra", id: "lalitha", src: "/audio/Lalitha_Sahasranamam.mp3", title: "Lalitha Sahasranamam", titleHi: "ललिता सहस्रनाम" },
            { type: "mantra", id: "shivatandava", src: "/audio/Shiva Tandava Stotram (All 18 Slokas)  Vande Guru Paramparaam  'Shiva-Bhakta' Ravana.mp3", title: "Shiva Tandava", titleHi: "शिव ताण्डव स्तोत्रम्" },
            { type: "video", id: "v_vishesh", src: "https://ik.imagekit.io/aup4wh6lq/VISHNU%20SAHASRANAMAM%20_%20Madhubanti%20Bagchi%20&%20Siddharth%20Bhavsar%20_%20Stotra%20For%20Peace%20&%20Divine%20Blessings.mp4", title: "Vishesh", titleHi: "विष्णु सहस्रनाम", startTime: 7 },
            { type: "mantra", id: "shantipath", src: "/audio/Agnihotra_Shantipath_-_Vedic_Chants_for_Universal_Peace_and_Well-Being_part_2_(mp3.pm).mp3", title: "Shanti Mantra", titleHi: "अग्निहोत्र शांतिपाठ" },
        ];

        // If NOT first time, remove the Guidance mantra
        const effectiveStartSequence = isFirstTime === false
            ? startSequence.filter(item => item.id !== "guidance")
            : startSequence;

        // POOL OF REMAINING MEDIA (alternating)
        const remainingVideos = [
            { type: "video", id: "v1", src: VIDEO_LIST[0], title: "Maheshvara Sutram", titleHi: "महेश्वर सूत्रम्", trimEnd: 4 },
            { type: "video", id: "v2", src: VIDEO_LIST[1], title: "Shiv Shakti Energy", titleHi: "शिव शक्ति ऊर्जा" },
            { type: "video", id: "v3", src: VIDEO_LIST[2], title: "Mahadev Nav Varsh", titleHi: "महादेव नव वर्ष" },
            { type: "video", id: "v4", src: VIDEO_LIST[3], title: "Ardhanarishwara", titleHi: "अर्धनारीश्वर स्वरूप" },
            { type: "video", id: "v5", src: VIDEO_LIST[4], title: "Shiv Swarnamala", titleHi: "शिव स्वर्णमाला स्तुति" },
            { type: "video", id: "v6", src: VIDEO_LIST[5], title: "Sound Healing", titleHi: "नाद चिकित्सा" },
            { type: "video", id: "v7", src: VIDEO_LIST[6], title: "Mahashivratri Special", titleHi: "महाशिवरात्रि" },
            { type: "video", id: "v8", src: VIDEO_LIST[7], title: "Kaal Bhairav Ashtakam", titleHi: "काल भैरव अष्टकम्" }
        ];

        const remainingMantras = [
            { type: "mantra", id: "shrisuktam", src: "/audio/Challakere_Brothers_vedic_chanting_-_Shri_suktam_(mp3.pm).mp3", title: "Shri Suktam", titleHi: "श्री सूक्तम्" },
            { type: "mantra", id: "narayana", src: "/audio/Anant_-_a_collection_of_vedic_chants_-_05._Narayana_Suktam_(mp3.pm).mp3", title: "Narayana Suktam", titleHi: "नारायण सूक्तम्" },
            { type: "mantra", id: "mahamrtyunjaya", src: "/audio/Challakere_Brothers_vedic_chanting_-_MahaMrtyunjaya_mantrah_108_times_(mp3.pm).mp3", title: "MahaMrtyunjaya", titleHi: "महामृत्युंजय मंत्र" },
            { type: "mantra", id: "rudrashtakam", src: "/audio/Agam - Rudrashtakam  रदरषटकम  Most POWERFUL Shiva Mantras Ever  Lyrical Video  Shiv.mp3", title: "Rudrashtakam", titleHi: "रुद्राष्टकम" },
            { type: "mantra", id: "hanuman", src: "/audio/Powerful Hanuman Chalisa  HanuMan  Teja Sajja  Saicharan  Hanuman Jayanti Song  Jai Hanuman.mp3", title: "Hanuman Chalisa", titleHi: "हनुमान चालीसा" },
            { type: "mantra", id: "virija", src: "/audio/Virija Homa Mantra  Uma Mohan  Promod Shanker  Times Music Spiritual.mp3", title: "Virija Homa Mantra", titleHi: "विरजा होम मंत्र" },
            { type: "mantra", id: "dainik", src: "/audio/दैनिक अग्निहोत्र _ Dainik Agnihotra _ Ramashish _ Spiritual Mantra _ Latest Mantra 2024 _ मंत्र.mp3", title: "Dainik Agnihotra", titleHi: "दैनिक अग्निहोत्र" }
        ];

        // ALTERNATING: video → mantra → video → mantra ...
        // We start with a video after the initial sacred block
        const alternatingSection: any[] = [];
        const maxPairs = Math.min(remainingVideos.length, remainingMantras.length);

        for (let i = 0; i < maxPairs; i++) {
            alternatingSection.push(remainingVideos[i]);
            alternatingSection.push(remainingMantras[i]);
        }

        // REMAINING ITEMS
        const leftovers = [
            ...remainingVideos.slice(maxPairs),
            ...remainingMantras.slice(maxPairs)
        ];

        return [...effectiveStartSequence, ...alternatingSection, ...leftovers];
    }, [isFirstTime]);

    // UNIFIED CONTROLLER LOGIC
    // 1. Derive Active Item (Prioritize Manual Track)
    const activeItem = useMemo(() => {
        if (manualTrack) return manualTrack;
        return playlist[currentIndex] || null;
    }, [manualTrack, playlist, currentIndex]);

    // ALIAS for compatibility with existing effects
    const currentItem = activeItem;

    // 2. Format Time Helper (Preserved)
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // 3. Unified Track Selection Handler
    const handleTrackSelect = (track: any) => {
        console.log(`[DhyanKshetra] Track Selected: ${track.title}`);

        // Stop any running video first
        if (sequentialVideoRef.current) {
            sequentialVideoRef.current.pause();
            sequentialVideoRef.current.currentTime = 0;
        }

        // Check if track is in main sequence
        const seqIndex = playlist.findIndex(p => p.id === track.id || p.src === track.src);

        if (seqIndex !== -1) {
            console.log(`[Playback] Switching to Sequence Index: ${seqIndex}`);
            setManualTrack(null);
            setCurrentIndex(seqIndex);
        } else {
            console.log(`[Playback] Switching to Manual Track: ${track.title}`);
            setManualTrack(track);
        }

        // Ensure playback environment is ACTIVE
        setStartBackgroundLoop(true);
        setIsSessionPaused(false);
        setVideoProgress(0);
    };

    // 3.5 Unified Index Selection (For Sequence Items)
    const handleSelectIndex = (index: number) => {
        console.log(`[DhyanKshetra] Index Selected: ${index}`);
        setManualTrack(null); // Clear manual override
        setCurrentIndex(index);
        setStartBackgroundLoop(true);
        setIsSessionPaused(false);
    };

    // 4. Unified Next Logic
    const goNext = () => {
        if (manualTrack) {
            console.log("[Playback] Manual track ended. Returning to sequence.");
            setManualTrack(null);
            // Optional: Advance to next in sequence or stay? 
            // Let's stay on current index so sequence resumes naturally?
            // Or advance? Let's advance to keep flow moving.
            let nextIndex = (currentIndex + 1) % playlist.length;
            // Skip Guidance if looping
            if (nextIndex === 0 && playlist.length > 1) nextIndex = 1;
            setCurrentIndex(nextIndex);
        } else {
            let nextIndex = (currentIndex + 1) % playlist.length;
            if (nextIndex === 0 && playlist.length > 1) {
                nextIndex = 1;
            }
            console.log(`[Sequence] Auto-Advancing: ${currentIndex} -> ${nextIndex}`);
            setCurrentIndex(nextIndex);
        }

        // Ensure video is reset if we are moving to one
        if (sequentialVideoRef.current) {
            sequentialVideoRef.current.pause();
            sequentialVideoRef.current.currentTime = 0;
        }
    };

    const goPrevious = () => {
        let prevIndex = currentIndex - 1;
        if (prevIndex < 0) prevIndex = playlist.length - 1;

        // Skip Guidance if moving backwards too
        if (prevIndex === 0 && playlist.length > 1) {
            prevIndex = playlist.length - 1;
        }

        console.log(`[Sequence] goPrevious: ${currentIndex} -> ${prevIndex}`);
        handleSelectIndex(prevIndex);
    };

    // Scroll to top on mount and lock body scroll
    useEffect(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

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
    const pickRandomSlide = (isAgnihotraSession: boolean = false) => {
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
            {/* SPLASH SCREEN - Elegant Single Entry */}
            {!hasStarted && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 9999,
                    background: 'radial-gradient(ellipse at 50% 30%, #0a1628 0%, #050d1a 40%, #020810 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '2rem',
                    textAlign: 'center',
                    padding: '2rem'
                }}>

                    {/* Decorative Om Image */}
                    <img
                        src="/images/golden_om_enter.png"
                        alt="Om"
                        style={{
                            width: 'clamp(172px, 39vw, 266px)',
                            height: 'auto',
                            opacity: 0.85,
                            filter: 'drop-shadow(0 0 25px rgba(255, 215, 0, 0.4))',
                            animation: 'breathe 4s ease-in-out infinite'
                        }}
                    />

                    <div style={{ maxWidth: '500px' }}>
                        <h1 style={{
                            background: 'linear-gradient(135deg, #FFD700, #FF9933, #FFD700)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontFamily: "'Playfair Display', serif",
                            fontSize: 'clamp(2rem, 6vw, 3rem)',
                            marginBottom: '1rem',
                            letterSpacing: '3px',
                            filter: 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.3))'
                        }}>
                            ध्यान क्षेत्र
                        </h1>
                        <p style={{
                            color: 'rgba(245, 230, 211, 0.85)',
                            fontSize: 'clamp(1rem, 3vw, 1.2rem)',
                            lineHeight: '1.8',
                            fontFamily: "'Noto Serif Devanagari', serif",
                            textShadow: '0 1px 3px rgba(0,0,0,0.5)'
                        }}>
                            दिव्य ध्यान अनुभव के लिए तैयार रहें।<br />
                            <span style={{ color: 'rgba(150, 200, 255, 0.7)', fontSize: '0.9em' }}>
                                Prepare for a divine meditation experience.
                            </span>
                        </p>
                    </div>

                    {/* Single Enter Button */}
                    <button
                        onClick={() => {
                            if (introVideos.length > 0) {
                                // 1. UNLOCK AUDIO CONTEXT IMMEDIATELY
                                const unlockAudio = new Audio();
                                unlockAudio.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAGZGF0YQAAAAA="; // Silent WAV
                                unlockAudio.play().then(() => {
                                    console.log("[Audio] Global Context Unlocked");
                                }).catch(e => console.warn("[Audio] Unlock failed:", e));

                                setIsFirstTime(true);
                                setHasStarted(true);
                                setIsMantraPlaying(true); // Trigger initial mantra playback logic
                            }
                        }}
                        disabled={introVideos.length === 0}
                        style={{
                            padding: '1rem 3.5rem',
                            fontSize: 'clamp(1.1rem, 3vw, 1.3rem)',
                            fontFamily: "'Noto Serif Devanagari', serif",
                            fontWeight: 700,
                            color: '#0a1628',
                            background: 'linear-gradient(135deg, #FFD700 0%, #FF9933 50%, #FFD700 100%)',
                            border: '1px solid rgba(255, 215, 0, 0.4)',
                            borderRadius: '50px',
                            cursor: introVideos.length === 0 ? 'wait' : 'pointer',
                            letterSpacing: '1px',
                            boxShadow: '0 8px 32px rgba(255, 215, 0, 0.25), inset 0 1px 0 rgba(255,255,255,0.3)',
                            transition: 'all 0.4s ease',
                            opacity: introVideos.length === 0 ? 0.5 : 1,
                            animation: introVideos.length > 0 ? 'gentlePulse 3s ease-in-out infinite' : 'none'
                        }}
                    >
                        {introVideos.length === 0 ? '🪷 प्रतीक्षा करें...' : '🪷 प्रवेश करें'}
                    </button>

                    <style jsx>{`
                        @keyframes breathe {
                            0%, 100% { transform: scale(1); opacity: 0.25; }
                            50% { transform: scale(1.08); opacity: 0.4; }
                        }
                        @keyframes gentlePulse {
                            0%, 100% { box-shadow: 0 8px 32px rgba(255, 215, 0, 0.2); }
                            50% { box-shadow: 0 8px 40px rgba(255, 215, 0, 0.4), 0 0 60px rgba(255, 153, 51, 0.15); }
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
                        // REMOVED: setStartBackgroundLoop(true) - to prevent Guidance form starting too early
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
            )
            }

            {/* ... language button ... */}
            <button
                onClick={toggleLanguage}
                style={{
                    position: 'fixed',
                    top: '20px',
                    left: '20px',
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

            {/* Mute/Unmute Button - Right Aligned Icon Only */}
            <button
                onClick={() => setIsMuted(!isMuted)}
                style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    zIndex: 100,
                    padding: '0.6rem',
                    background: 'linear-gradient(135deg, rgba(10, 5, 2, 0.9) 0%, rgba(25, 12, 5, 0.85) 100%)',
                    color: '#FFD700',
                    border: '1.5px solid rgba(212, 175, 55, 0.5)',
                    borderRadius: '50%',
                    boxShadow: '0 0 15px rgba(255, 165, 0, 0.25), 0 4px 15px rgba(0, 0, 0, 0.4)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)'
                }}
                title={isMuted ? (lang === 'en' ? 'Unmute' : 'अनम्यूट') : (lang === 'en' ? 'Mute' : 'म्यूट')}
            >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>

            {/* Mantra Sangrah - Divine Audio Player */}
            <MantraSangrah
                lang={lang}
                // UNIFIED CONTROLLER:
                // Only play if activeItem is a mantra AND the main loop has started.
                activeTrack={startBackgroundLoop && activeItem && (activeItem.type === 'mantra' || !activeItem.type) ? activeItem : null}
                sessionActive={!isSessionPaused}

                onPlayingChange={(playing) => {
                    setIsMantraPlaying(playing);
                    // Update global pause state if needed for UI sync
                    if (!playing && activeItem?.type === 'mantra') {
                        setIsSessionPaused(true);
                    } else {
                        setIsSessionPaused(false);
                    }
                }}
                onTrackEnded={() => {
                    goNext();
                }}
                onTrackSelect={handleTrackSelect}
                onSelectIndex={handleSelectIndex}
                externalPlaylist={playlist}
                onMutedChange={setIsMuted}
                isMuted={isMuted}
                onActiveTrackChange={(track) => setActiveMantra(track)}
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

            {/* LIGHTWEIGHT MEDIA PLAYER - Global Control Center */}
            {/* LIGHTWEIGHT MEDIA PLAYER - Global Control Center (REMOVED - Now inside Mantra Menu) */}

            {/* MAIN CONTENT LAYER - Video Player (Only render when actual video is playing) */}
            {
                startBackgroundLoop && currentItem.type === 'video' && (
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
                            onCanPlay={() => setIsVideoLoading(false)}
                            onLoadedData={() => setIsVideoLoading(false)}
                            onLoadStart={() => setIsVideoLoading(true)}
                            onStalled={() => setIsVideoLoading(true)}
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
                                        {lang === 'hi' ? 'संचित हो रहा है... (Loading)' : 'Accumulating... (Loading)'}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* SESSION DASHBOARD (Unified Up Next - Restored to Top Alignment) */}
                        {!showIntro && (
                            <div className={pageStyles.sessionDashboard}>
                                <div className={pageStyles.dashboardPill}>
                                    {/* Up Next Only */}
                                    <div className={pageStyles.dashboardHeader}>
                                        <Sparkles size={14} className={pageStyles.nextIcon} />
                                        <span>{lang === 'hi' ? 'अगला अनुभव' : 'Up Next'}</span>
                                    </div>
                                    <div className={pageStyles.dashboardTitle}>
                                        {(() => {
                                            let nextIdx = (currentIndex + 1) % playlist.length;
                                            // Skip Guidance
                                            if (nextIdx === 0 && playlist.length > 1) nextIdx = 1;

                                            let nextItem = playlist[nextIdx];

                                            // Skip Sahana display (Intro Mantra)
                                            if (nextItem && (nextItem.id === 'sahana' || nextItem.src.includes('Sahana'))) {
                                                nextIdx = (nextIdx + 1) % playlist.length;
                                                nextItem = playlist[nextIdx];
                                            }

                                            return (
                                                <>
                                                    <span className={pageStyles.nextTypeIcon} style={{ marginRight: '8px' }}>
                                                        {nextItem.type === 'video' ? '📽️' : '🎵'}
                                                    </span>
                                                    {lang === 'hi' ? nextItem.titleHi : nextItem.title}
                                                </>
                                            );
                                        })()}
                                    </div>

                                    {/* शेष (Remaining Time) - Only for mantras > 3 min */}
                                    {(() => {
                                        const isVideo = currentItem.type === 'video';
                                        const cur = isVideo ? videoTime : audioTime;
                                        const dur = isVideo ? videoDuration : audioDuration;

                                        if (currentItem.id === 'guidance' || dur < 180) return null;

                                        const remaining = Math.max(0, dur - cur);

                                        return (
                                            <div className={pageStyles.dashboardShesh}>
                                                <span>{lang === 'hi' ? 'शेष' : 'Remaining'}</span>
                                                <span className={pageStyles.sheshTime}>{formatTime(remaining)}</span>
                                            </div>
                                        );
                                    })()}
                                </div>

                            </div>
                        )}




                    </div>
                )
            }

            {/* LAYER 2: Ambient Background Loop (During Mantras) - A/B Double Buffering */}
            {
                startBackgroundLoop && currentItem.type === 'mantra' && (
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
                )
            }

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

        </main >
    );
}
