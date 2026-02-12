'use client';

import { useEffect, useRef } from 'react';
import { X, Mic, MicOff, PhoneOff } from 'lucide-react';
import { useVaidyaVoiceCall } from '@/hooks/useVaidyaVoiceCall';
import VoiceVisualizer from './VoiceVisualizer';
import styles from './VaidyaVoiceModal.module.css';

interface VaidyaVoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    lang: 'en' | 'hi';
}

export default function VaidyaVoiceModal({ isOpen, onClose, lang }: VaidyaVoiceModalProps) {
    const {
        callState,
        startCall,
        endCall,
        resetToIdle,
        error,
        isMuted,
        toggleMute,
        volumeLevel,
        transcript,
        isSpeaking,
    } = useVaidyaVoiceCall();

    const transcriptEndRef = useRef<HTMLDivElement>(null);

    // Auto-start call when modal opens
    useEffect(() => {
        let mounted = true;
        if (isOpen && callState === 'idle') {
            // Small delay to ensure we don't race with a close event
            const timer = setTimeout(() => {
                if (mounted) startCall();
            }, 100);
            return () => clearTimeout(timer);
        }
        return () => { mounted = false; };
    }, [isOpen, callState, startCall]);

    // Reset to idle when modal actually closes (wait for animation if needed, but here simple is fine)
    useEffect(() => {
        if (!isOpen && callState !== 'idle') {
            resetToIdle();
        }
    }, [isOpen, callState, resetToIdle]);

    // Auto-scroll transcript (Disabled as transcript is hidden)
    /* useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcript]); */

    const handleClose = () => {
        endCall();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            {/* Sacred background */}
            <div className={styles.background} />

            {/* Content */}
            <div className={styles.content}>
                {/* Close button */}
                <button onClick={handleClose} className={styles.closeButton} aria-label="Close">
                    <X size={24} />
                </button>

                {/* Header */}
                <div className={styles.header}>
                    <h2 className={styles.headerTitle}>
                        {lang === 'hi' ? 'आचार्य संवाद — वाणी परामर्श' : 'Acharya Samvad — Voice Consultation'}
                    </h2>
                    <p className={styles.headerSubtitle}>
                        {lang === 'hi' ? 'आचार्य प्रणव से सीधे बात करें' : 'Speak directly with Acharya Pranav'}
                    </p>
                </div>

                {/* Status indicator */}
                <div className={styles.statusContainer}>
                    {callState === 'connecting' && (
                        <div className={styles.status}>
                            <div className={styles.spinner} />
                            <p>{lang === 'hi' ? 'आचार्य प्रणव से जुड़ रहे हैं...' : 'Connecting to Acharya Pranav...'}</p>
                        </div>
                    )}

                    {callState === 'active' && (
                        <div className={styles.status}>
                            <div className={styles.activeIndicator} />
                            <p>
                                {isSpeaking
                                    ? (lang === 'hi' ? 'आचार्य प्रणव बोल रहे हैं...' : 'Acharya Pranav is speaking...')
                                    : (lang === 'hi' ? 'सुन रहे हैं — बोलिए' : 'Listening — speak now')}
                            </p>
                        </div>
                    )}

                    {callState === 'disconnected' && (
                        <div className={styles.status}>
                            <p>{lang === 'hi' ? 'संवाद समाप्त' : 'Consultation Ended'}</p>
                            <button onClick={handleClose} className={styles.reconnectButton}>
                                {lang === 'hi' ? 'संवाद समाप्त करें' : 'End Consultation'}
                            </button>
                        </div>
                    )}

                    {callState === 'error' && (
                        <div className={styles.status}>
                            <p className={styles.errorText}>
                                {lang === 'hi' ? 'संपर्क त्रुटि' : 'Connection Error'}
                            </p>
                            {error && <p className={styles.errorDetail}>{error}</p>}
                            <button onClick={startCall} className={styles.reconnectButton}>
                                {lang === 'hi' ? 'पुनः प्रयास करें' : 'Try Again'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Voice visualizer with Om */}
                <div className={styles.visualizerContainer}>
                    <div className={styles.omCircle}>
                        <span className={styles.omSymbol}>🕉</span>
                    </div>
                    <VoiceVisualizer
                        volumeLevel={volumeLevel}
                        isActive={callState === 'active'}
                    />
                </div>

                {/* Live transcript - Hidden as per user request */}
                {/* <div className={styles.transcriptArea}>
                    {transcript.length === 0 ? (
                        <p className={styles.noTranscript}>
                            {callState === 'active'
                                ? (lang === 'hi' ? 'बोलिए, आचार्य सुन रहे हैं...' : 'Speak, Acharya is listening...')
                                : (lang === 'hi' ? 'संवाद यहाँ दिखेगा' : 'Conversation will appear here')}
                        </p>
                    ) : (
                        transcript.map((line, idx) => (
                            <div key={idx} className={styles.transcriptLine}>
                                {line}
                            </div>
                        ))
                    )}
                    <div ref={transcriptEndRef} />
                </div> */}

                {/* Controls - Just Mute here for focus */}
                {callState === 'active' && (
                    <div className={styles.controls}>
                        <button
                            onClick={toggleMute}
                            className={`${styles.controlButton} ${isMuted ? styles.muted : ''}`}
                            aria-label={isMuted ? 'Unmute' : 'Mute'}
                        >
                            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                        </button>
                    </div>
                )}

                {/* Bottom Section: End Call & Mantra */}
                {callState === 'active' && (
                    <button onClick={handleClose} className={styles.endCallButton} aria-label="End call">
                        <PhoneOff size={22} />
                        <span>{lang === 'hi' ? 'संवाद समाप्त करें' : 'End Call'}</span>
                    </button>
                )}

                <div className={styles.mantra}>
                    <p>ॐ धन्वन्तरये नमः</p>
                </div>
            </div>
        </div>
    );
}
