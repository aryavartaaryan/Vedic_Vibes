"use client";

import React, { useState } from "react";
import Link from 'next/link';
import Navbar from "@/components/Navbar";
import styles from "../vedic-rasoi/rasoi.module.css";
import { Flame, Wind, Droplets, Mountain, Infinity, Globe } from 'lucide-react';
import translations from '@/lib/vaidya-translations.json';

export default function VaidyaSharanamPage() {
    const [lang, setLang] = useState<'en' | 'hi'>('hi');
    const t = translations[lang];

    const toggleLanguage = () => {
        setLang(prev => prev === 'en' ? 'hi' : 'en');
    };

    return (
        <main style={{ backgroundColor: '#f9f5f0', minHeight: '100vh', overflowX: 'hidden' }}>
            <Navbar />

            {/* Language Toggle */}
            <button
                onClick={toggleLanguage}
                style={{
                    position: 'fixed',
                    top: '100px',
                    right: '20px',
                    zIndex: 100,
                    padding: '0.5rem 1rem',
                    background: '#B8860B',
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontFamily: 'var(--font-header)'
                }}
            >
                <Globe size={16} />
                {lang === 'en' ? 'हिन्दी' : 'English'}
            </button>

            {/* Reused Hero Section Structure from Vedic RaSoi */}
            <section className={styles.heroSection} style={{ position: 'relative' }}>

                {/* 
                   MANDALA ANIMATION LAYER 
                   USING PURE CSS FOR ROTATION via CSS MODULE ("HARD STRONG PLAN")
                   This guarantees rotation without JS runtime errors.
                */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 overflow-hidden">
                    <div className={`${styles.rotatingMandala} opacity-100`}>
                        <svg width="600" height="600" viewBox="0 0 100 100" className="md:w-[900px] md:h-[900px]">
                            {/* Detailed Mandala / Chakra SVG - Opacity Set to 1 for Maximum Visibility */}
                            <circle cx="50" cy="50" r="48" fill="none" stroke="#000000" strokeWidth="0.3" strokeDasharray="1 1" opacity="1" />
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#000000" strokeWidth="0.2" opacity="1" />

                            <path d="M50 2 L52 48 L98 50 L52 52 L50 98 L48 52 L2 50 L48 48 Z" fill="none" stroke="#000000" strokeWidth="0.4" opacity="1" />
                            <path d="M50 10 L55 45 L90 50 L55 55 L50 90 L45 55 L10 50 L45 45 Z" transform="rotate(45 50 50)" fill="none" stroke="#000000" strokeWidth="0.4" opacity="1" />

                            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => (
                                <path key={angle} d="M50 20 L50 35" stroke="#000000" strokeWidth="0.3" transform={`rotate(${angle} 50 50)`} />
                            ))}

                            <circle cx="50" cy="50" r="10" fill="none" stroke="#000000" strokeWidth="0.5" opacity="1" />
                        </svg>
                    </div>
                </div>

                {/* 
                   CONTENT OVERLAY LAYER
                */}
                <div className={styles.heroOverlay} style={{ zIndex: 20 }}>

                    {/* Main Title - Axis Aligned */}
                    <h1 className={styles.title} style={{ marginTop: '0', fontSize: '4rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        Rishi Sharanam
                    </h1>

                    {/* Mantra Box - Adapted for Dhanvantari */}
                    {/* Dual Mantra Panels - Dhanvantari & Patanjali */}
                    <div className={styles.sacredMantraBox} style={{
                        marginTop: '1.5rem',
                        maxWidth: '1200px',
                        display: 'flex',
                        flexDirection: 'row',
                        gap: '2rem',
                        background: 'rgba(255, 255, 255, 0.6)', // Increased opacity for parchment feel
                        border: '1px solid #B8860B', // Royal Brass
                        padding: '2rem'
                    }}>

                        {/* Panel 1: Dhanvantari */}
                        <div className={styles.mantraItem} style={{ flex: 1, flexDirection: 'column', textAlign: 'center', borderRight: '1px solid rgba(184, 134, 11, 0.3)', paddingRight: '1rem' }}>
                            <div style={{ color: '#FF9933', fontWeight: 'bold', marginBottom: '0.5rem', fontFamily: 'var(--font-header)', textTransform: 'uppercase', letterSpacing: '1px' }}>{t.dhanvantariTitle}</div>
                            <span className={styles.mantraSanskrit} style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#5D4037' }}>
                                “ॐ नमो भगवते महादर्शनाय वासुदेवाय धन्वंतराये | <br /> अमृतकलश हस्ताय सर्वभय विनाशाय सर्वरोगनिवारणाय | <br /> त्रैलोक्यपथाय त्रैलोक्यनिधये श्री महाविष्णु स्वरूप | <br /> श्री धन्वंतरी स्वरूप श्री श्री श्री औषधचक्र नारायणाय नमः ||”
                            </span>
                            <span className={styles.mantraEnglish} style={{ marginTop: '1rem', opacity: 0.9, color: '#8B4513' }}>
                                I bow to the Divine Lord Dhanvantari, the form of Maha Vishnu, who holds the pot of Amrita, destroys all fear and diseases, and is the Lord of the three worlds.
                            </span>
                        </div>

                        {/* Panel 2: Patanjali */}
                        <div className={styles.mantraItem} style={{ flex: 1, flexDirection: 'column', textAlign: 'center', paddingLeft: '1rem' }}>
                            <div style={{ color: '#FF9933', fontWeight: 'bold', marginBottom: '0.5rem', fontFamily: 'var(--font-header)', textTransform: 'uppercase', letterSpacing: '1px' }}>{t.patanjaliTitle}</div>
                            <span className={styles.mantraSanskrit} style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#5D4037' }}>
                                “योगेन चित्तस्य पदेन वाचां । मलं शरीरस्य च वैद्यकेन ॥ <br /> योऽपाकरोत्तं प्रवरं मुनीनां । पतञ्जलिं प्राञ्जलिरानतोऽस्मि ॥”
                            </span>
                            <span className={styles.mantraEnglish} style={{ marginTop: '1rem', opacity: 0.9, color: '#8B4513' }}>
                                With hands folded, I bow to Patanjali, who removed impurities of the mind through Yoga, of speech through Grammar, and of the body through Ayurveda.
                            </span>
                        </div>

                    </div>

                    {/* Subtitle / Divider */}
                    <div className="w-32 h-1 bg-[#B87333] opacity-40 my-6 rounded-full"></div>

                    {/* Elemental Icons - Keeping the Vedic Vibe */}
                    <div className={styles.elementalHeroContainer} style={{ marginTop: '0' }}>
                        <div title="Space (Akasha)"><Infinity size={22} color="#B87333" /></div>
                        <div title="Air (Vayu)"><Wind size={22} color="#B87333" /></div>
                        <div title="Fire (Agni)"><Flame size={22} color="#B87333" /></div>
                        <div title="Water (Jala)"><Droplets size={22} color="#B87333" /></div>
                        <div title="Earth (Prithvi)"><Mountain size={22} color="#B87333" /></div>
                    </div>

                    {/* Action Button - Replacing Search Box */}
                    <div className={styles.buttonGroup} style={{ marginTop: '2rem' }}>
                        <div className="relative">
                            {/* Diya Decoration */}
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center scale-90 pointer-events-none">
                                {/* Diya Flame Animation - Converted to Pure CSS */}
                                <div
                                    className="w-3 h-6 bg-gradient-to-t from-orange-500 via-yellow-400 to-transparent rounded-full blur-[1px]"
                                    style={{
                                        animation: "diyaFlicker 3s ease-in-out infinite"
                                    }}
                                />
                                <div className="w-8 h-4 rounded-b-full border-t border-[#B8860B] bg-[#8E3A1F]" />
                            </div>

                            <Link href={`/digital-vaidya?lang=${lang}`}>
                                <button className={styles.generateButton} style={{ padding: '1rem 3rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                    <span className="text-xl">🕉️</span>
                                    {t.diagnoseBtn}
                                </button>
                            </Link>
                        </div>
                    </div>

                </div>
            </section>

            <style jsx global>{`
                @keyframes diyaFlicker {
                    0% { transform: scale(1); opacity: 1; }
                    25% { transform: scale(1.05); opacity: 0.9; }
                    50% { transform: scale(0.95); opacity: 1; }
                    75% { transform: scale(1.02); opacity: 0.8; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </main>
    );
}
