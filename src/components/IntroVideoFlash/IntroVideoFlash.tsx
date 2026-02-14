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
    const [activeBuffer, setActiveBuffer] = useState<'A' | 'B'>('A');
    const [showText, setShowText] = useState(false);
    const [displayedText, setDisplayedText] = useState('');
    const [isMuted, setIsMuted] = useState(false);

    // We'll track if the "other" buffer is ready
    // const [bufferBPrepared, setBufferBPrepared] = useState(false); // This state was not used in the provided snippet, removing.

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    // Function to get active/inactive refs
    const getRefs = () => {
        return activeBuffer === 'A'
            ? { active: videoRefA, inactive: videoRefB }
            : { active: videoRefB, inactive: videoRefA };
    };

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
            if (err && typeof err === 'object' && 'name' in err && err.name === 'AbortError') {
                console.log(`[Intro] Playback interrupt for video ${index + 1}, ignoring.`);
                return;
            }
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

    // Prepare next video in the inactive buffer
    useEffect(() => {
        const nextIndex = currentIndex + 1;
        if (nextIndex < videos.length) {
            const { inactive } = getRefs();
            if (inactive.current) {
                inactive.current.src = videos[nextIndex].src;
                inactive.current.load();
                console.log(`[Intro] Preloading video ${nextIndex + 1} in background`);
            }
        }
    }, [currentIndex, videos, activeBuffer]); // Added activeBuffer to dependencies

    // Main playback effect
    useEffect(() => {
        const currentVideo = videos[currentIndex];
        if (!currentVideo) return;

        const { active } = getRefs();

        // Reset text state
        setDisplayedText('');
        setShowText(false);

        attemptPlay(active.current, currentIndex);

        // Handle Text Animation
        const runTextAnimation = async () => {
            if (!currentVideo.text || !isMounted.current) {
                textDone.current = true;
                return;
            }

            textDone.current = false;
            const textSegments = Array.isArray(currentVideo.text) ? currentVideo.text : [currentVideo.text];

            // 1. Initial delay to let video start
            await new Promise(r => setTimeout(r, 1500));

            let segmentIdx = 0;
            for (const segment of textSegments) {
                if (!isMounted.current) break;
                if (!segment || segment.trim() === '') continue;

                setDisplayedText('');
                setShowText(true);
                setDisplayedText(segment);

                // Wait for display: 7s for first segment of first video, 5s for others
                const waitTime = (currentIndex === 0 && segmentIdx === 0) ? 7000 : 5000;
                await new Promise(r => setTimeout(r, waitTime));

                if (!isMounted.current) break;
                setShowText(false);
                await new Promise(r => setTimeout(r, 800)); // Fade out duration

                // Gap between sentences for better distribution
                if (segmentIdx < textSegments.length - 1) {
                    await new Promise(r => setTimeout(r, 1500));
                }

                segmentIdx++;
            }

            textDone.current = true;
            const { active: currentActive } = getRefs();
            if (isMounted.current && currentActive.current && currentActive.current.ended) {
                handleEnded();
            }
        };

        runTextAnimation();

    }, [currentIndex, activeBuffer, videos]); // Depend on buffer toggle too and videos

    const textDone = useRef(false);

    const handleEnded = () => {
        if (!textDone.current) {
            console.log("Video ended but text still playing, waiting...");
            return;
        }

        console.log(`Video ${currentIndex + 1} ended`);

        if (currentIndex < videos.length - 1) {
            // TOGGLE BUFFER
            setActiveBuffer(prev => prev === 'A' ? 'B' : 'A');
            setCurrentIndex(prev => prev + 1);
        } else {
            console.log('Sequence complete, fading out');
            setIsFadingOut(true);
            setTimeout(() => {
                setIsPlaying(false);
                onComplete();
            }, 1000); // Slightly longer fade for smoothness
        }
    };

    // Attach ended listener to both buffers
    useEffect(() => {
        const elA = videoRefA.current;
        const elB = videoRefB.current;

        // Ensure the handler only fires for the currently active video
        const onEndedA = () => {
            if (activeBuffer === 'A') {
                handleEnded();
            }
        };
        const onEndedB = () => {
            if (activeBuffer === 'B') {
                handleEnded();
            }
        };

        elA?.addEventListener('ended', onEndedA);
        elB?.addEventListener('ended', onEndedB);

        return () => {
            elA?.removeEventListener('ended', onEndedA);
            elB?.removeEventListener('ended', onEndedB);
        };
    }, [currentIndex, activeBuffer, videos.length, onComplete]); // Added onComplete to dependencies

    const handleSkip = () => {
        console.log('User skipped intro');
        setIsFadingOut(true);
        setTimeout(() => {
            setIsPlaying(false);
            onComplete();
        }, 800);
    };

    if (!isPlaying) return null;

    const currentVideoConfig = videos[currentIndex];
    const nextVideoConfig = videos[currentIndex + 1];

    return (
        <div
            className={`${styles.overlay} ${isFadingOut ? styles.fadeOut : ''}`}
            onClick={handleSkip}
        >
            <div className={styles.videoContainer}>
                {/* Buffer A */}
                <video
                    ref={videoRefA}
                    className={`${styles.singleVideo} ${activeBuffer === 'A' ? styles.visible : styles.hidden}`}
                    playsInline
                    muted={false}
                    preload="auto"
                    src={currentVideoConfig?.src} // Always set src for the current video
                    style={{ objectFit: currentVideoConfig?.objectFit || 'cover' }}
                />

                {/* Buffer B */}
                <video
                    ref={videoRefB}
                    className={`${styles.singleVideo} ${activeBuffer === 'B' ? styles.visible : styles.hidden}`}
                    playsInline
                    muted={false}
                    preload="auto"
                    src={nextVideoConfig?.src} // Always set src for the next video to preload
                    style={{ objectFit: nextVideoConfig?.objectFit || 'cover' }}
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
                            const { active } = getRefs();
                            if (active.current) {
                                active.current.muted = false;
                                setIsMuted(false);
                                active.current.play().catch(() => { });
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
