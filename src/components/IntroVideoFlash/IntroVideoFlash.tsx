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
    const videoRef = useRef<HTMLVideoElement>(null);
    const [showText, setShowText] = useState(false);
    const [displayedText, setDisplayedText] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    const currentVideo = videos[currentIndex];

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        if (!currentVideo) return;

        const attemptPlay = async () => {
            const videoEl = videoRef.current;
            if (!videoEl || !isMounted.current) return;

            try {
                // FORCE unmuted on every new video load
                console.log(`[Intro] Attempting unmuted play for video ${currentIndex + 1}`);
                videoEl.muted = false;
                videoEl.volume = 1.0;
                setIsMuted(false);

                // Reset to beginning to ensure we start from 0 with sound
                videoEl.currentTime = 0;

                await videoEl.play();
                if (isMounted.current) {
                    console.log(`[Intro] Success: Playing video ${currentIndex + 1} with sound`);
                }
            } catch (err: any) {
                if (err && typeof err === 'object' && 'name' in err && err.name === 'AbortError') {
                    console.log(`[Intro] Playback interrupt for video ${currentIndex + 1}, ignoring.`);
                    return;
                }

                if (err && typeof err === 'object' && 'name' in err && err.name === 'NotAllowedError') {
                    console.warn(`[Intro] Autoplay with sound failed for video ${currentIndex + 1}. Muting and retrying...`);
                    try {
                        if (videoEl && isMounted.current) {
                            videoEl.muted = true;
                            setIsMuted(true);
                            await videoEl.play();
                            console.log(`[Intro] Playing video ${currentIndex + 1} muted (fallback)`);
                            return;
                        }
                    } catch (muteErr) {
                        console.error("[Intro] Muted playback also failed:", muteErr);
                    }
                }

                console.warn(`[Intro] Autoplay failed for video ${currentIndex + 1}:`, err);
                try {
                    if (videoEl && isMounted.current) {
                        videoEl.muted = true;
                        setIsMuted(true);
                        await videoEl.play();
                    }
                } catch (mutedErr: any) {
                    if (mutedErr && typeof mutedErr === 'object' && 'name' in mutedErr && mutedErr.name !== 'AbortError') {
                        console.error(`[Intro] Video playback failed completely:`, mutedErr);
                    }
                }
            }
        };

        // Reset text state
        setDisplayedText('');
        setShowText(false);

        attemptPlay();

        // Handle Text Animation
        const runTextAnimation = async () => {
            if (!currentVideo.text || !isMounted.current) return;

            // Normalize to array
            const textSegments = Array.isArray(currentVideo.text) ? currentVideo.text : [currentVideo.text];

            for (const segment of textSegments) {
                if (!isMounted.current) break;
                if (!segment || segment.trim() === '') continue;

                // 1. Prepare segment
                const words = segment.split(' ').filter(w => w.trim() !== '');
                setDisplayedText('');
                setShowText(true);

                // 2. Show full segment for better readability
                setDisplayedText(segment);
                setShowText(true);

                // Wait while visible (adjust time based on segment length)
                const readingTime = Math.max(3000, segment.length * 50);
                await new Promise(r => setTimeout(r, readingTime));

                if (!isMounted.current) break;

                // 3. Keep text visible for a moment
                await new Promise(r => setTimeout(r, 2000));

                if (!isMounted.current) break;

                // 4. Fade out text
                setShowText(false);
                await new Promise(r => setTimeout(r, 1000)); // Wait for fade out
            }
        };

        const animationPromise = runTextAnimation();

        return () => {
            // Cleanup if needed
        };

    }, [currentIndex, currentVideo]); // Depend on currentIndex to trigger effect on change


    useEffect(() => {
        const handleEnded = () => {
            console.log(`Video ${currentIndex + 1} ended`);

            if (currentIndex < videos.length - 1) {
                // Determine if we should switch to next video
                setCurrentIndex(prev => prev + 1);
            } else {
                // Sequence complete
                console.log('Sequence complete, fading out');
                setIsFadingOut(true);
                setTimeout(() => {
                    setIsPlaying(false);
                    onComplete();
                }, 800);
            }
        };

        const videoEl = videoRef.current;
        if (videoEl) {
            videoEl.addEventListener('ended', handleEnded);
        }

        return () => {
            if (videoEl) {
                videoEl.removeEventListener('ended', handleEnded);
            }
        };
    }, [currentIndex, videos.length, onComplete]);


    const handleSkip = () => {
        console.log('User skipped intro');
        setIsFadingOut(true);
        setTimeout(() => {
            setIsPlaying(false);
            onComplete();
        }, 500);
    };

    // If explicitly stopped, return null to unmount
    if (!isPlaying) return null;

    // If still loading videos or playing, show overlay
    return (

        <div
            className={`${styles.overlay} ${isFadingOut ? styles.fadeOut : ''}`}
            onClick={handleSkip}
        >
            <div className={styles.videoContainer}>
                {/* Key ensures we get a fresh video element for each source, avoiding state issues */}
                {currentVideo && (
                    <video
                        key={currentVideo.src}
                        ref={videoRef}
                        className={styles.singleVideo}
                        playsInline
                        muted={false}
                        preload="auto"
                        style={{
                            objectFit: currentVideo.objectFit || 'cover',
                            width: '100%',
                            height: '100%'
                        }}
                    >
                        <source src={currentVideo.src} type="video/mp4" />
                    </video>
                )}
            </div>

            {/* Text Overlay */}
            {showText && (
                <div className={styles.textOverlay}>
                    <p className={styles.animatedText}>{displayedText}</p>
                </div>
            )}

            {/* Skip and Unmute hints */}
            <div className={styles.skipHint}>
                {isMuted ? (
                    <button
                        className={styles.unmuteBtn}
                        onClick={(e) => {
                            e.stopPropagation();
                            const videoEl = videoRef.current;
                            if (videoEl) {
                                videoEl.muted = false;
                                setIsMuted(false);
                                videoEl.play().catch(() => { });
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
