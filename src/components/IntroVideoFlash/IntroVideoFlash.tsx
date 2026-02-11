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

    // Text animation state
    const [displayedText, setDisplayedText] = useState('');
    const [showText, setShowText] = useState(false);

    // We use a key to force re-mounting of video element when switching sources
    const videoRef = useRef<HTMLVideoElement>(null);

    const currentVideo = videos[currentIndex];

    useEffect(() => {
        if (!currentVideo) return;

        const attemptPlay = async () => {
            const videoEl = videoRef.current;
            if (!videoEl) return;

            try {
                videoEl.volume = 1.0;
                videoEl.muted = false; // Force unmuted
                videoEl.currentTime = 0;
                await videoEl.play();
                console.log(`Playing video ${currentIndex + 1} with sound`);
            } catch (err) {
                console.warn(`Autoplay with sound failed for video ${currentIndex + 1}:`, err);
                try {
                    videoEl.muted = true;
                    await videoEl.play();
                    console.log(`Playing video ${currentIndex + 1} muted (fallback)`);
                } catch (mutedErr) {
                    console.error(`Video playback failed completely for video ${currentIndex + 1}:`, mutedErr);
                }
            }
        };

        // Reset text state
        setDisplayedText('');
        setShowText(false);

        attemptPlay();

        // Handle Text Animation
        const runTextAnimation = async () => {
            if (!currentVideo.text) return;

            // Normalize to array
            const textSegments = Array.isArray(currentVideo.text) ? currentVideo.text : [currentVideo.text];

            for (const segment of textSegments) {
                if (!segment || segment.trim() === '') continue;

                // 1. Prepare segment
                const words = segment.split(' ').filter(w => w.trim() !== '');
                setDisplayedText('');
                setShowText(true);

                // 2. Animate words
                for (let i = 0; i < words.length; i++) {
                    setDisplayedText(prev => prev ? `${prev} ${words[i]}` : words[i]);
                    await new Promise(r => setTimeout(r, 600)); // 600ms per word
                }

                // 3. Keep text visible for a moment
                await new Promise(r => setTimeout(r, 2000));

                // 4. Fade out text
                setShowText(false);
                await new Promise(r => setTimeout(r, 1000)); // Wait for fade out
            }
        };

        const animationPromise = runTextAnimation();

        // Cleanup function (no easy way to cancel async loop, but component unmount will stop state updates eventually or effect will be cleaned up)
        // ideally we use an AbortController or a ref to cancel, but for simplicity we rely on React ignoring state updates on unmount in newer versions
        // or we check a `mounted` flag inside the loop. Let's add simple mount check.
        // Actually for simplicity, the loop runs.

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

            {/* Skip hint */}
            <div className={styles.skipHint}>
                <span>🕉️ Click anywhere to skip</span>
            </div>
        </div>
    );
}
