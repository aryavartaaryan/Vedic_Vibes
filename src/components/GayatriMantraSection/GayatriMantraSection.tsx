'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import styles from './GayatriMantraSection.module.css';

const mantraLines = [
    "ॐ भूर्भुवः स्वः",
    "तत्सवितुर्वरेण्यं",
    "भर्गो देवस्य धीमहि",
    "धियो यो नः प्रचोदयात्"
];

const meaning = "We meditate on the glory of that Being who has produced this universe; may He enlighten our minds.";

export default function GayatriMantraSection() {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Split mantra into Grapheme Clusters (Aksharas) or Words to preserve Devanagari rendering
    const getSegments = (text: string) => {
        if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
            const segmenter = new Intl.Segmenter("hi", { granularity: "grapheme" });
            return [...segmenter.segment(text)].map(s => s.segment);
        }
        // Fallback to words if Segmenter is not available to avoid broken characters
        return text.split(" ");
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.5
            }
        }
    };

    const charVariants = {
        hidden: { opacity: 0, y: 10, textShadow: "0 0 0 rgba(212, 175, 55, 0)" },
        visible: {
            opacity: 1,
            y: 0,
            textShadow: "0 0 20px rgba(212, 175, 55, 0.8)",
            transition: {
                // Spring animation implied by stiffness/damping
                damping: 12,
                stiffness: 200
            }
        }
    };

    if (!isClient) return null; // Avoid hydration mismatch for random particles

    return (
        <section className={styles.sectionner}>
            {/* --- ATMOSPHERE --- */}
            <div className={styles.solarOrb}></div>

            {/* Rotating Mandala SVG */}
            <div className={styles.mandalaBg}>
                <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                    <circle cx="50" cy="50" r="45" stroke="#D4AF37" strokeWidth="0.2" fill="none" strokeDasharray="1 1" />
                    <circle cx="50" cy="50" r="35" stroke="#D4AF37" strokeWidth="0.5" fill="none" opacity="0.3" />
                    <path d="M50 5 L60 30 L90 30 L65 50 L75 80 L50 65 L25 80 L35 50 L10 30 L40 30 Z" stroke="#D4AF37" strokeWidth="0.3" fill="none" opacity="0.5" />
                </svg>
            </div>

            {/* Floating Particles */}
            <div className={styles.particleContainer}>
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className={styles.particle}
                        style={{
                            left: `${Math.random() * 100}%`,
                            width: `${Math.random() * 3 + 1}px`,
                            height: `${Math.random() * 3 + 1}px`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${10 + Math.random() * 10}s`
                        }}
                    />
                ))}
            </div>

            {/* --- CONTENT CARD --- */}
            <motion.div
                className={styles.card}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
            >
                <div className={styles.sanskritText}>
                    {mantraLines.map((line, lineIndex) => (
                        <motion.div
                            key={lineIndex}
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', width: '100%', marginBottom: '1rem' }}
                        >
                            {getSegments(line).map((char, charIndex) => (
                                <motion.span key={charIndex} variants={charVariants} className={styles.char}>
                                    {char}
                                </motion.span>
                            ))}
                        </motion.div>
                    ))}
                </div>

                <motion.p
                    className={styles.meaningText}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 0.9, y: 0 }}
                    transition={{ delay: 3, duration: 2 }} // Wait for mantra to finish
                >
                    {meaning}
                </motion.p>
            </motion.div>

            {/* Sound Interaction Tip */}
            <div className={styles.soundButton}>
                <Volume2 size={24} />
                <span className={styles.tooltip}>Listen to the Vibration</span>
            </div>

        </section>
    );
}
