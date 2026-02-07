'use client';

import { useEffect, useRef } from 'react';

interface VoiceVisualizerProps {
    volumeLevel: number;
    isActive: boolean;
}

export default function VoiceVisualizer({ volumeLevel, isActive }: VoiceVisualizerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number | undefined>(undefined);
    const barsRef = useRef<number[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = canvas.offsetWidth * window.devicePixelRatio;
            canvas.height = canvas.offsetHeight * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Initialize bars
        const barCount = 64;
        if (barsRef.current.length === 0) {
            barsRef.current = Array(barCount).fill(0);
        }

        // Animation loop
        const animate = () => {
            const width = canvas.offsetWidth;
            const height = canvas.offsetHeight;
            const centerY = height / 2;

            // Clear canvas
            ctx.clearRect(0, 0, width, height);

            if (!isActive) {
                // Idle state - gentle pulse
                const time = Date.now() / 1000;
                const pulse = Math.sin(time * 2) * 0.1 + 0.1;

                ctx.beginPath();
                ctx.arc(width / 2, centerY, 40 + pulse * 20, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(255, 219, 88, 0.3)';
                ctx.lineWidth = 2;
                ctx.stroke();
            } else {
                // Active state - flowing waveform
                const barWidth = width / barCount;
                const targetHeight = volumeLevel * height * 0.4;

                // Update bars with smooth interpolation
                for (let i = 0; i < barCount; i++) {
                    // Add some randomness for natural flow
                    const randomFactor = Math.random() * 0.3 + 0.7;
                    const target = targetHeight * randomFactor;

                    // Smooth interpolation
                    barsRef.current[i] += (target - barsRef.current[i]) * 0.3;
                }

                // Draw symmetric waveform
                ctx.beginPath();

                // Top wave
                for (let i = 0; i < barCount; i++) {
                    const x = i * barWidth;
                    const barHeight = barsRef.current[i];
                    const y = centerY - barHeight;

                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        // Smooth curve using quadratic bezier
                        const prevX = (i - 1) * barWidth;
                        const prevY = centerY - barsRef.current[i - 1];
                        const cpX = (prevX + x) / 2;
                        const cpY = (prevY + y) / 2;
                        ctx.quadraticCurveTo(prevX, prevY, cpX, cpY);
                    }
                }

                // Bottom wave (mirror)
                for (let i = barCount - 1; i >= 0; i--) {
                    const x = i * barWidth;
                    const barHeight = barsRef.current[i];
                    const y = centerY + barHeight;

                    const prevX = i < barCount - 1 ? (i + 1) * barWidth : x;
                    const prevY = i < barCount - 1 ? centerY + barsRef.current[i + 1] : y;
                    const cpX = (prevX + x) / 2;
                    const cpY = (prevY + y) / 2;
                    ctx.quadraticCurveTo(prevX, prevY, cpX, cpY);
                }

                ctx.closePath();

                // Gradient fill (flowing water effect)
                const gradient = ctx.createLinearGradient(0, centerY - targetHeight, 0, centerY + targetHeight);
                gradient.addColorStop(0, 'rgba(255, 219, 88, 0.8)');
                gradient.addColorStop(0.5, 'rgba(184, 115, 51, 0.6)');
                gradient.addColorStop(1, 'rgba(255, 219, 88, 0.8)');

                ctx.fillStyle = gradient;
                ctx.fill();

                // Stroke outline
                ctx.strokeStyle = 'rgba(255, 219, 88, 1)';
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [volumeLevel, isActive]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
            }}
        />
    );
}
