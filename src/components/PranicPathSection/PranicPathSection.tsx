'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import styles from './PranicPathSection.module.css';

// --- 3. SACRED GEOMETRY (SRI YANTRA) ---
const SriYantraSVG = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className} style={{ width: '100%', height: '100%' }}>
        <g fill="none" stroke="#D4AF37" strokeWidth="0.2" opacity="0.3">
            {/* Simplified Pattern for background "Etched" feel */}
            <circle cx="50" cy="50" r="48" strokeDasharray="0.5 0.5" />
            <path d="M50 2 L85 85 L15 85 Z" />
            <path d="M50 98 L85 15 L15 15 Z" />
            <path d="M50 85 L80 30 L20 30 Z" opacity="0.5" />
            <path d="M50 15 L80 70 L20 70 Z" opacity="0.5" />
        </g>
    </svg>
);

// --- 1. PRANA PARTICLE CANVAS ---
const PranaCanvas = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let particles: { x: number; y: number; angle: number; radius: number; speed: number; alpha: number }[] = [];
        let animationFrameId: number;
        let mouseX = -1000;
        let mouseY = -1000;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        const initParticles = () => {
            particles = [];
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            // Fibonacci Spiral Logic
            for (let i = 0; i < 200; i++) {
                const angle = i * 0.4;
                const dist = i * 3.5;
                particles.push({
                    x: centerX + Math.cos(angle) * dist,
                    y: centerY + Math.sin(angle) * dist,
                    angle: angle,
                    radius: Math.random() * 1.5 + 0.5,
                    speed: Math.random() * 0.003 + 0.001,
                    alpha: Math.random() * 0.7 + 0.3
                });
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            particles.forEach(p => {
                p.angle += p.speed;

                // Mouse Repulsion (Water Ripple)
                const dx = p.x - mouseX;
                const dy = p.y - mouseY;
                const mouseDist = Math.sqrt(dx * dx + dy * dy);
                let pushX = 0;
                let pushY = 0;

                if (mouseDist < 150) {
                    const force = (150 - mouseDist) / 150;
                    pushX = (dx / mouseDist) * force * 30;
                    pushY = (dy / mouseDist) * force * 30;
                }

                // Spiral movement + Push
                const dist = 100 + p.angle * 10; // Keeping them somewhat spiraled
                /* To keep it simple visually: just rotate around center and apply push */
                const currentDist = Math.sqrt(Math.pow(p.x - centerX, 2) + Math.pow(p.y - centerY, 2));

                // Simple rotation
                const originalX = p.x - pushX * 0.1; // damping push return
                const originalY = p.y - pushY * 0.1;

                // Rotate orbit
                const cos = Math.cos(p.speed);
                const sin = Math.sin(p.speed);
                const nx = (originalX - centerX) * cos - (originalY - centerY) * sin + centerX;
                const ny = (originalX - centerX) * sin + (originalY - centerY) * cos + centerY;

                p.x = nx + pushX * 0.05;
                p.y = ny + pushY * 0.05;

                // Draw Particle
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 215, 0, ${p.alpha})`; // Gold sparks
                ctx.fill();
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
        };

        window.addEventListener('resize', resize);
        canvas.addEventListener('mousemove', handleMouseMove);
        resize();
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            canvas.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className={styles.particleCanvas} />;
};

// --- WRAPPERS ---

const SolarFlareText = ({ children }: { children: React.ReactNode }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <motion.h2
            ref={ref}
            className={styles.heading}
            initial={{ filter: "brightness(500%) blur(10px)", color: "#fff", opacity: 0 }}
            animate={isInView ? { filter: "brightness(100%) blur(0)", color: "#D4AF37", opacity: 1 } : {}}
            transition={{ duration: 2.5, ease: "easeOut" }}
        >
            {children}
        </motion.h2>
    );
};

const LuminescentText = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    return (
        <motion.div
            ref={ref}
            className={styles.bodyText}
            initial={{ opacity: 0.1, textShadow: "0 0 0 rgba(0,0,0,0)" }}
            animate={isInView ? {
                opacity: 1,
                transition: { duration: 1.5, delay: delay }
            } : {}}
        >
            <motion.span
                initial={{ color: "#F5F5DC", textShadow: "0 0 0 rgba(255,215,0,0)" }}
                animate={isInView ? {
                    color: ["#F5F5DC", "#FFD700", "#F5F5DC"], // Flash gold
                    textShadow: ["0 0 0px rgba(0,0,0,0)", "0 0 20px rgba(255,215,0,0.8)", "0 0 0px rgba(0,0,0,0)"]
                } : {}}
                transition={{ duration: 1.5, delay: delay + 0.2 }}
            >
                {children}
            </motion.span>
        </motion.div>
    );
};

// --- MAIN COMPONENT ---

export default function PranicPathSection() {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <section className={`${styles.container} ${isHovered ? styles.buttonHovered : ''}`}>
            <PranaCanvas />

            {/* Marigolds */}
            <div className={styles.petalContainer}>
                <div className={styles.petal}></div>
                <div className={styles.petal}></div>
                <div className={styles.petal}></div>
                <div className={styles.petal}></div>
            </div>

            {/* Sri Yantra - Deep Etched Pulse */}
            <motion.div
                style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: '800px', height: '800px', zIndex: 1, pointerEvents: 'none', filter: 'drop-shadow(0 0 5px rgba(0,0,0,0.5))'
                }}
                animate={{
                    scale: [1, 1.15, 1.15, 1], // Inhale(4), Hold(4), Exhale(4) roughly
                    opacity: [0.3, 0.4, 0.4, 0.3]
                }}
                transition={{
                    duration: 12, // 4+4+4
                    times: [0, 0.33, 0.66, 1],
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                <SriYantraSVG />
            </motion.div>

            <div className={styles.contentWrapper}>
                <div className={styles.omAnchor}>🕉</div>

                <SolarFlareText>
                    The Vedic Way
                </SolarFlareText>

                {/* Scroll Triggered Text */}
                <LuminescentText delay={0.2}>
                    We believe that true wellness is not just the absence of disease, but the vibrant flow of <span className={styles.keyword}>Prana</span> (life force) through body, mind, and spirit.
                </LuminescentText>

                <LuminescentText delay={1.0}>
                    Our approach fuses the ancient diagnostic wisdom of the <span className={styles.keyword}>Great Rishis</span> with modern accessibility, offering you a <span className={styles.keyword}>Sacred Space</span> to
                    <span className={styles.activeWord}> Heal</span>,
                    <span className={styles.activeWord}> Rejuvenate</span>, and
                    <span className={styles.activeWord}> Thrive</span>.
                </LuminescentText>

                <Link href="/dhyan-kshetra">
                    <button
                        className={styles.stoneSealButton}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        Begin Your Journey
                    </button>
                </Link>
            </div>
        </section>
    );
}
