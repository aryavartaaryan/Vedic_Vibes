import { useEffect, useRef, useState } from 'react';
import styles from './IntroVideoFlash.module.css';

interface VideoConfig {
    src: string;
    text?: string | string[]; // Support array of strings
    objectFit?: 'cover' | 'contain' | 'fill';
}

interface IntroVideoFlashProps {
    videos: VideoConfig[];
    onComplete: () => void;
}

export default function IntroVideoFlash({ videos, onComplete }: IntroVideoFlashProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isFadingOut, setIsFadingOut] = useState(false);

    const isMounted = useRef(true);
    const videoRefA = useRef<HTMLVideoElement>(null);
    const videoRefB = useRef<HTMLVideoElement>(null);

    // Track which buffer is CURRENTLY active and what its source is
    const [bufferA, setBufferA] = useState<{ src: string | null; active: boolean }>({ src: videos[0]?.src || null, active: true });
    const [bufferB, setBufferB] = useState<{ src: string | null; active: boolean }>({ src: videos[1]?.src || null, active: false });

    const [showText, setShowText] = useState(false);
    const [displayedText, setDisplayedText] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    const textDone = useRef(false);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    const attemptPlay = async (videoEl: HTMLVideoElement | null, index: number) => {
        if (!videoEl || !isMounted.current) return;

        try {
            videoEl.muted = false;
            videoEl.volume = 1.0;
            setIsMuted(false);
            videoEl.currentTime = 0;

            await videoEl.play();
            console.log(`[Intro] Success: Playing video ${index + 1} with sound`);
        } catch (err: any) {
            console.warn(`[Intro] Autoplay failed for video ${index + 1}, retrying muted...`);
            try {
                if (videoEl && isMounted.current) {
                    videoEl.muted = true;
                    setIsMuted(true);
                    await videoEl.play();
                }
            } catch (muteErr) {
                console.error("[Intro] Muted playback failed:", muteErr);
            }
        }
    };

    // Text Animation Effect
    useEffect(() => {
        const currentVideo = videos[currentIndex];
        if (!currentVideo) return;

        const runTextAnimation = async () => {
            if (!currentVideo.text || !isMounted.current) {
                textDone.current = true;
                return;
            }

            textDone.current = false;
            const textSegments = Array.isArray(currentVideo.text) ? currentVideo.text : [currentVideo.text];

            await new Promise(r => setTimeout(r, 1500));

            let segmentIdx = 0;
            for (const segment of textSegments) {
                if (!isMounted.current) break;
                if (!segment || segment.trim() === '') continue;

                setDisplayedText('');
                setShowText(true);
                setDisplayedText(segment);

                const waitTime = (currentIndex === 0 && (segmentIdx === 0 || segmentIdx === 1)) ? 7000 : 5000;
                await new Promise(r => setTimeout(r, waitTime));

                if (!isMounted.current) break;
                setShowText(false);
                await new Promise(r => setTimeout(r, 800));

                if (segmentIdx < textSegments.length - 1) {
                    await new Promise(r => setTimeout(r, 1500));
                }

                segmentIdx++;
            }

            textDone.current = true;
            const currentVideoEl = bufferA.active ? videoRefA.current : videoRefB.current;
            if (isMounted.current && currentVideoEl && currentVideoEl.ended) {
                handleEnded();
            }
        };

        runTextAnimation();
    }, [currentIndex, videos]); // Depend on videos to ensure currentVideo is up-to-date

    const handleEnded = () => {
        if (!textDone.current) return;

        const nextIndex = currentIndex + 1;
        if (nextIndex < videos.length) {
            // Swap buffers
            if (bufferA.active) {
                // Currently A is active, swap to B
                setBufferA(prev => ({ ...prev, active: false }));
                setBufferB(prev => ({ ...prev, active: true }));
                // Buffer A is now inactive, preload the video AFTER B (index + 2)
                setTimeout(() => {
                    const preloadIndex = currentIndex + 2;
                    if (preloadIndex < videos.length) {
                        setBufferA(prev => ({ ...prev, src: videos[preloadIndex].src }));
                    } else {
                        setBufferA(prev => ({ ...prev, src: null })); // Clear src if no more videos
                    }
                }, 500);
            } else {
                // Currently B is active, swap to A
                setBufferB(prev => ({ ...prev, active: false }));
                setBufferA(prev => ({ ...prev, active: true }));
                // Buffer B is now inactive, preload the video AFTER A (index + 2)
                setTimeout(() => {
                    const preloadIndex = currentIndex + 2;
                    if (preloadIndex < videos.length) {
                        setBufferB(prev => ({ ...prev, src: videos[preloadIndex].src }));
                    } else {
                        setBufferB(prev => ({ ...prev, src: null })); // Clear src if no more videos
                    }
                }, 500);
            }

            setCurrentIndex(nextIndex);

            // Play the NEW active buffer immediately
            // The state update for active buffer might not be immediate, so we infer the next active ref
            const nextVideoEl = bufferA.active ? videoRefB.current : videoRefA.current;
            if (nextVideoEl) {
                attemptPlay(nextVideoEl, nextIndex);
            }
        } else {
            setIsFadingOut(true);
            setTimeout(() => {
                setIsPlaying(false);
                onComplete();
            }, 1000);
        }
    };

    const handleSkip = () => {
        console.log('User skipped intro');
        setIsFadingOut(true);
        setTimeout(() => {
            setIsPlaying(false);
            onComplete();
        }, 800);
    };

    if (!isPlaying) return null;

    return (
        <div
            className={`${styles.overlay} ${isFadingOut ? styles.fadeOut : ''}`}
            onClick={handleSkip}
        >
            <div className={styles.videoContainer}>
                {/* Buffer A */}
                <video
                    ref={videoRefA}
                    className={`${styles.singleVideo} ${bufferA.active ? styles.visible : styles.hidden}`}
                    playsInline
                    muted={false}
                    preload="auto"
                    src={bufferA.src || undefined}
                    onEnded={handleEnded}
                    style={{ objectFit: 'cover' }}
                />

                {/* Buffer B */}
                <video
                    ref={videoRefB}
                    className={`${styles.singleVideo} ${bufferB.active ? styles.visible : styles.hidden}`}
                    playsInline
                    muted={false}
                    preload="auto"
                    src={bufferB.src || undefined}
                    onEnded={handleEnded}
                    style={{ objectFit: 'cover' }}
                />
            </div>

            {/* Text Overlay */}
            {showText && (
                <div className={styles.textOverlay}>
                    <p className={styles.animatedText}>{displayedText}</p>
                </div>
            )}

            {/* Skip/Unmute hints */}
            <div className={styles.skipHint}>
                {isMuted ? (
                    <button
                        className={styles.unmuteBtn}
                        onClick={(e) => {
                            e.stopPropagation();
                            const activeEl = bufferA.active ? videoRefA.current : videoRefB.current;
                            if (activeEl) {
                                activeEl.muted = false;
                                setIsMuted(false);
                                activeEl.play().catch(() => { });
                            }
                        }}
                    >
                        🔊 Click to Unmute
                    </button>
                ) : (
                    <span>🕉️ Click anywhere to skip</span>
                )}
            </div>
        </div>
    );
}
