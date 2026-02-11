"use client";

import React, { useState, useEffect } from "react";
import { Globe } from 'lucide-react';
import styles from "../vedic-rasoi/rasoi.module.css";
import translations from '@/lib/vaidya-translations.json';
import SriYantra from '@/components/SriYantra/SriYantra';
import MantraSangrah from '@/components/MantraSangrah/MantraSangrah';
import IntroVideoFlash from '@/components/IntroVideoFlash/IntroVideoFlash';

export default function DhyanKakshaPage() {
    const [lang, setLang] = useState<'en' | 'hi'>('hi');
    const [showIntro, setShowIntro] = useState(true);
    const [startBackgroundLoop, setStartBackgroundLoop] = useState(false); // New state to control background loop
    const [playMantra, setPlayMantra] = useState(false);

    const t = translations[lang];

    const toggleLanguage = () => {
        setLang(prev => prev === 'en' ? 'hi' : 'en');
    };

    const [introVideos, setIntroVideos] = useState<{ src: string, text?: string | string[] }[]>([]);
    const [slideVideos, setSlideVideos] = useState<string[]>([]);

    // Fetch Videos on Mount
    useEffect(() => {
        const fetchVideos = async () => {
            try {
                // Fetch Flash Videos for Intro
                const flashRes = await fetch('/api/videos?folder=Flash Videos');
                if (flashRes.ok) {
                    const data = await flashRes.json();
                    // Sort to ensure consistent order if needed, or keep random/file-system order
                    const videos = data.files.map((f: any) => {
                        let text: string | string[] = "";
                        if (f.name.includes('kailash') && !f.name.includes('2')) {
                            // First video - Two sentences
                            text = [
                                "शिव की ध्यान स्थली कैलाश में आपका स्वागत है... यहाँ आपका चित्त शांत और प्रसन्न हो जाएगा।",
                                "आपके जीवन में नई सकारात्मक परिवर्तन की यात्रा आज से शुरू हो रही है..."
                            ];
                        } else if (f.name.includes('kailash2')) {
                            text = "इसके बाद आप ध्यान क्षेत्र में प्रवेश करेंगे, जहाँ आप अपनी इच्छा से कोई भी मंत्र चुनकर ध्यान कर सकते हैं।";
                        } else {
                            text = "ध्यान क्षेत्र में आपका स्वागत है...";
                        }

                        return {
                            src: f.path,
                            text: text
                        };
                    });
                    setIntroVideos(videos);
                }

                // Fetch Slide Videos for Background
                const slideRes = await fetch('/api/videos?folder=Slide Videos&t=' + Date.now());
                if (slideRes.ok) {
                    const data = await slideRes.json();
                    const paths = data.files.map((f: any) => f.path);
                    console.log("Loaded slide videos:", paths);
                    setSlideVideos(paths);
                }
            } catch (error) {
                console.error("Failed to fetch videos:", error);
            }
        };

        fetchVideos();
    }, []);

    // State for current slide configuration
    const [currentSlide, setCurrentSlide] = useState<{ src: string, start: number } | null>(null);
    const videoRef = React.useRef<HTMLVideoElement>(null);

    // Initial Random Slide on Mount (or when loop starts)
    React.useEffect(() => {
        if (startBackgroundLoop && !currentSlide && slideVideos.length > 0) {
            pickRandomSlide();
        }
    }, [startBackgroundLoop, slideVideos]);

    // Function to generate a new random slide at runtime
    const pickRandomSlide = () => {
        if (slideVideos.length === 0) return;

        const randomVideoPath = slideVideos[Math.floor(Math.random() * slideVideos.length)];
        // Random start time: 0, 15, 30, 45 (safe offsets for most background loops)
        const randomStart = Math.floor(Math.random() * 4) * 15;

        console.log("Picking new slide:", randomVideoPath);
        setCurrentSlide({ src: randomVideoPath, start: randomStart });
    };

    // Auto-rotate slides every 30 seconds
    React.useEffect(() => {
        if (!startBackgroundLoop || slideVideos.length === 0) return;

        const interval = setInterval(pickRandomSlide, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [startBackgroundLoop, slideVideos]);

    // Apply slide settings to video element
    React.useEffect(() => {
        if (videoRef.current && currentSlide) {
            const video = videoRef.current;
            // Use the full path directly as it comes from API with leading slash
            // Check if src is different to avoid reloading same video if logic overlaps
            // Use encodeURI to handle spaces in filenames
            const toPlay = encodeURI(currentSlide.src);

            if (!video.src.endsWith(toPlay)) {
                video.src = toPlay;
            }
            video.currentTime = currentSlide.start;
            video.play().catch(e => console.log("Background autoplay prevented:", e));
        }
    }, [currentSlide]);


    return (
        <main style={{
            backgroundColor: startBackgroundLoop ? 'transparent' : '#f9f5f0',
            minHeight: '100vh',
            overflowX: 'hidden',
            transition: 'background-color 1s ease'
        }}>

            {/* Intro Video Flash */}
            {showIntro && (
                <IntroVideoFlash
                    videos={introVideos}
                    onComplete={() => {
                        setShowIntro(false);
                        setStartBackgroundLoop(true); // Start background loop only after intro
                        setPlayMantra(true);
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
            <MantraSangrah lang={lang} startPlaying={playMantra} />

            {/* Background Layer with Random Video Slides - Only show if playing */}
            {startBackgroundLoop && currentSlide && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 0,
                    backgroundColor: '#000' // Prevent white flash
                }}>
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        preload="auto"
                        onEnded={pickRandomSlide} // Generate next random slide on end
                        className="fade-in"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: 'top center', // Focus on top of video as requested
                            // No filters for full brightness
                            transition: 'opacity 1s ease-in-out'
                        }}
                    />
                </div>
            )}

            {/* Dark Overlay REMOVED for brightness */}
            {/* <div style={{...}} /> */}

            {/* Radial Vignette REMOVED for brightness */}
            {/* <div style={{...}} /> */}

            {/* Main Content Container */}
            <div className={styles.heroSection} style={{
                position: 'relative',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                paddingTop: '85px',
                paddingBottom: '150px', // Increased to lift content up
                paddingLeft: '1rem',
                paddingRight: '1rem',
                gap: '1rem',
                zIndex: 10,
                background: 'transparent' // Force transparent to see video
            }}>

                {/* Page Title - Grand Temple Banner */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(10, 5, 2, 0.85) 0%, rgba(25, 12, 5, 0.9) 100%)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '2px solid rgba(255, 215, 0, 0.5)',
                    borderRadius: '20px',
                    padding: '1rem 3rem',
                    boxShadow: '0 0 40px rgba(255, 165, 0, 0.3), 0 8px 32px rgba(0, 0, 0, 0.5), inset 0 0 60px rgba(255, 215, 0, 0.05)',
                    zIndex: 20
                }}>
                    <h1 style={{
                        margin: 0,
                        fontSize: '3.2rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.15em',
                        textAlign: 'center',
                        textShadow: '0 0 30px rgba(255, 215, 0, 0.8), 0 0 60px rgba(255, 165, 0, 0.5), 0 4px 10px rgba(0, 0, 0, 0.9)',
                        background: 'linear-gradient(180deg, #FFD700 0%, #FF9933 50%, #FFD700 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontWeight: '800',
                        fontFamily: "'Noto Serif Devanagari', serif"
                    }}>
                        {t.pageTitle}
                    </h1>
                </div>

                {/* Sri Yantra - Central Focus - Size adjusted in component CSS */}
                <div style={{
                    position: 'relative',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    marginTop: '-60px', // Lifted significantly as requested
                    zIndex: 0, // Ensure it sits behind title if overlapping
                    // transform: 'scale(1.17)', // Reverted global scale
                    // transformOrigin: 'top center'
                }}>
                    <SriYantra />
                </div>



            </div>
        </main>
    );
}
