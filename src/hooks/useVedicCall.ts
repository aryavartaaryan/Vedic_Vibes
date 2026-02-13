'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Vapi from '@vapi-ai/web';

export type CallState = 'idle' | 'connecting' | 'active' | 'disconnected' | 'error';

interface UseVedicCallReturn {
    callState: CallState;
    startCall: () => Promise<void>;
    endCall: () => void;
    resetToIdle: () => void;
    error: string | null;
    isMuted: boolean;
    toggleMute: () => void;
    volumeLevel: number;
}

export function useVedicCall(): UseVedicCallReturn {
    const [callState, setCallState] = useState<CallState>('idle');
    const [error, setError] = useState<string | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [volumeLevel, setVolumeLevel] = useState(0);

    const vapiRef = useRef<Vapi | null>(null);
    const animationFrameRef = useRef<number | undefined>(undefined);

    // Suppress VAPI/Daily "Meeting ended due to ejection" from console and unhandled rejections
    useEffect(() => {
        const isEjectionMessage = (v: unknown): boolean => {
            const msg =
                typeof v === 'string' ? v : v instanceof Error ? v.message : v ? String(v) : '';
            return /meeting\s*ended\s*due\s*to\s*ejection|meeting\s*has\s*ended/i.test(msg);
        };
        const originalError = console.error;
        console.error = (...args: unknown[]) => {
            const msg =
                typeof args[0] === 'string'
                    ? args[0]
                    : args[0] && typeof (args[0] as Error).message === 'string'
                        ? (args[0] as Error).message
                        : '';
            if (isEjectionMessage(msg)) return;
            originalError.apply(console, args);
        };
        const onRejection = (e: PromiseRejectionEvent) => {
            if (isEjectionMessage(e.reason)) {
                e.preventDefault();
                e.stopImmediatePropagation?.();
            }
        };
        window.addEventListener('unhandledrejection', onRejection, true);
        return () => {
            console.error = originalError;
            window.removeEventListener('unhandledrejection', onRejection, true);
        };
    }, []);

    // Initialize Vapi instance
    useEffect(() => {
        return () => {
            // Cleanup on unmount
            if (vapiRef.current) {
                vapiRef.current.stop();
            }
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    // Stop any existing call and clear ref so we don't get duplicate events or leaks
    const stopExistingCall = useCallback(() => {
        if (vapiRef.current) {
            try {
                vapiRef.current.stop();
            } catch (_) {
                // ignore
            }
            vapiRef.current = null;
        }
    }, []);

    // Start the call
    const startCall = useCallback(async () => {
        try {
            stopExistingCall();
            setCallState('connecting');
            setError(null);

            // Fetch temporary token from backend
            const tokenResponse = await fetch('/api/vapi-token', {
                method: 'POST',
            });

            if (!tokenResponse.ok) {
                const errorData = await tokenResponse.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to get Vapi configuration');
            }

            const { publicKey, assistantId } = await tokenResponse.json();

            // Validate keys
            if (!publicKey || publicKey === 'your_vapi_public_key_here') {
                throw new Error('Vapi public key not configured. Please add your public key to .env.local');
            }

            if (!assistantId) {
                throw new Error('Vapi assistant ID not configured');
            }

            // Initialize Vapi
            const vapi = new Vapi(publicKey);
            vapiRef.current = vapi;

            // Set up event listeners
            vapi.on('call-start', () => {
                console.log('Call started');
                setCallState('active');
            });

            vapi.on('call-end', () => {
                console.log('Call ended');
                setCallState('disconnected');
            });

            vapi.on('speech-start', () => {
                console.log('Sevak is speaking');
            });

            vapi.on('speech-end', () => {
                console.log('Sevak finished speaking');
            });

            vapi.on('volume-level', (level: number) => {
                setVolumeLevel(level);
            });

            vapi.on('error', (payload: any) => {
                // Daily/VAPI can emit "Meeting ended due to ejection" when call ends — treat as normal disconnect
                const message =
                    typeof payload?.error === 'object' && payload.error?.message
                        ? String(payload.error.message)
                        : typeof payload?.message === 'string'
                            ? payload.message
                            : typeof payload?.error === 'string'
                                ? payload.error
                                : 'An error occurred during the call';
                const isEjectionOrMeetingEnded =
                    /ejection|meeting\s*has\s*ended|meeting\s*ended/i.test(message);
                if (isEjectionOrMeetingEnded) {
                    setCallState('disconnected');
                    setError(null);
                    return;
                }
                setError(message);
                setCallState('error');
            });

            vapi.on('message', (message: any) => {
                console.log('Message:', message);
            });

            // Start the call in Hindi by default (first message override; assistant prompt in dashboard can keep rest in Hindi)
            // Dynamic Greetings from Acharya Pranav
            const greetings = [
                "Ayushman bhava beta. Kaise ho aap? Aaj ka din kaisa raha aapka? Paristhiti kaisi bhi sthayi nahi isliaye chiint na karein. Naya ho ya purana rog, bina jhijhak mujhe batao.",
                "Ayushman bhava बेटा. Kaise ho aap? Aaj ka din kaisa raha aapka? Paristhiti kaisi bhi sthayi nahi isliaye chiint na karein. Shareer ya mann mein koi takleef to nahi? Naya ho ya purana rog, mujhe bataiye.",
                "Ayushman bhava beta. Aaj ka din kaisa raha aapka? Paristhiti kaisi bhi sthayi nahi isliaye chiint na karein. Kaho, kaisa mahsoos kar rahe ho? Naya rog ho ya purana, bina jhijhak mujhe batao.",
                "Ayushman bhava बेटा. Kaise ho aap? Aaj ka din kaisa raha aapka? Paristhiti kaisi bhi sthayi nahi isliaye chiint na karein. Mann shant hai na? Apne kisi bhi rog ke baare mein mujhe bina sankoch ke batayein.",
                "Ayushman bhava beta. Kaise ho aap? Aaj ka din kaisa raha aapka? Paristhiti kaisi bhi sthayi nahi isliaye chiint na karein. Shareer swasth hai na? Naya ho ya purana rog, bina jhijhak mujhe batayein."
            ];
            const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];

            const assistantOverrides = {
                firstMessage: randomGreeting,
                firstMessageMode: 'assistant-speaks-first' as const,
            };

            try {
                await vapi.start(assistantId, assistantOverrides);
            } catch (startErr: any) {
                const msg = startErr?.message ?? String(startErr);
                if (/ejection|meeting\s*has\s*ended|meeting\s*ended/i.test(msg)) {
                    setCallState('disconnected');
                    setError(null);
                    return;
                }
                throw startErr;
            }
        } catch (err: any) {
            console.error('Failed to start call:', err);
            setError(err.message || 'Failed to start call');
            setCallState('error');
        }
    }, [stopExistingCall]);

    // End the call
    const endCall = useCallback(() => {
        stopExistingCall();
        setCallState('disconnected');
    }, [stopExistingCall]);

    // Reset to idle when modal closes so the next open starts fresh
    const resetToIdle = useCallback(() => {
        stopExistingCall();
        setCallState('idle');
        setError(null);
        setIsMuted(false);
        setVolumeLevel(0);
    }, [stopExistingCall]);

    // Toggle mute
    const toggleMute = useCallback(() => {
        if (vapiRef.current) {
            const newMutedState = !isMuted;
            vapiRef.current.setMuted(newMutedState);
            setIsMuted(newMutedState);
        }
    }, [isMuted]);

    return {
        callState,
        startCall,
        endCall,
        resetToIdle,
        error,
        isMuted,
        toggleMute,
        volumeLevel,
    };
}
