'use client';

import { useEffect } from 'react';
import { X, Mic, MicOff } from 'lucide-react';
import { useVedicCall } from '@/hooks/useVedicCall';
import VoiceVisualizer from './VoiceVisualizer';
import styles from './VoiceCallModal.module.css';

interface VoiceCallModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function VoiceCallModal({ isOpen, onClose }: VoiceCallModalProps) {
    const { callState, startCall, endCall, resetToIdle, error, isMuted, toggleMute, volumeLevel } = useVedicCall();

    // Auto-start call when modal opens
    useEffect(() => {
        if (isOpen && callState === 'idle') {
            startCall();
        }
    }, [isOpen, callState, startCall]);

    // Handle close: end call and reset so next open starts fresh; avoids errors from stale state
    const handleClose = () => {
        endCall();
        resetToIdle();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            {/* Blurred Ashram background */}
            <div
                className={styles.background}
                style={{
                    backgroundImage: 'url(/images/ashram-dawn.jpg)',
                }}
            />

            {/* Content */}
            <div className={styles.content}>
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className={styles.closeButton}
                    aria-label="Close"
                >
                    <X size={24} />
                </button>

                {/* Status indicator */}
                <div className={styles.statusContainer}>
                    {callState === 'connecting' && (
                        <div className={styles.status}>
                            <div className={styles.spinner} />
                            <p>Connecting to Sevak...</p>
                        </div>
                    )}

                    {callState === 'active' && (
                        <div className={styles.status}>
                            <div className={styles.activeIndicator} />
                            <p>Speaking with Sevak</p>
                        </div>
                    )}

                    {callState === 'disconnected' && (
                        <div className={styles.status}>
                            <p>Call Ended</p>
                            <button onClick={handleClose} className={styles.reconnectButton}>
                                Return
                            </button>
                        </div>
                    )}

                    {callState === 'error' && (
                        <div className={styles.status}>
                            <p className={styles.errorText}>Connection Error</p>
                            {error && <p className={styles.errorDetail}>{error}</p>}
                            <button onClick={startCall} className={styles.reconnectButton}>
                                Try Again
                            </button>
                        </div>
                    )}
                </div>

                {/* Voice visualizer */}
                <div className={styles.visualizerContainer}>
                    {/* Pulsing golden Om circle */}
                    <div className={styles.omCircle}>
                        <span className={styles.omSymbol}>🕉</span>
                    </div>

                    {/* Waveform */}
                    <VoiceVisualizer
                        volumeLevel={volumeLevel}
                        isActive={callState === 'active'}
                    />
                </div>

                {/* Controls */}
                {callState === 'active' && (
                    <div className={styles.controls}>
                        {/* Mute button */}
                        <button
                            onClick={toggleMute}
                            className={`${styles.controlButton} ${isMuted ? styles.muted : ''}`}
                            aria-label={isMuted ? 'Unmute' : 'Mute'}
                        >
                            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                        </button>

                        {/* Lotus disconnect button */}
                        <button
                            onClick={handleClose}
                            className={styles.lotusButton}
                            aria-label="End call"
                        >
                            <svg
                                viewBox="0 0 100 100"
                                className={styles.lotusSvg}
                            >
                                {/* Lotus petals */}
                                <g className={styles.lotusPetals}>
                                    {/* Center petal */}
                                    <ellipse cx="50" cy="50" rx="8" ry="20" fill="#DC143C" opacity="0.9" />

                                    {/* Surrounding petals */}
                                    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                                        <ellipse
                                            key={i}
                                            cx="50"
                                            cy="50"
                                            rx="8"
                                            ry="20"
                                            fill="#DC143C"
                                            opacity="0.8"
                                            transform={`rotate(${angle} 50 50)`}
                                        />
                                    ))}
                                </g>

                                {/* Center */}
                                <circle cx="50" cy="50" r="12" fill="#8B0000" />
                                <text
                                    x="50"
                                    y="50"
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    fill="white"
                                    fontSize="20"
                                    fontWeight="bold"
                                >
                                    ×
                                </text>
                            </svg>
                            <span className={styles.lotusLabel}>End Call</span>
                        </button>
                    </div>
                )}

                {/* Sacred mantra */}
                <div className={styles.mantra}>
                    <p>ॐ शान्तिः शान्तिः शान्तिः</p>
                </div>
            </div>
        </div>
    );
}
