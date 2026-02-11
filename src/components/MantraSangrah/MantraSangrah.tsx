'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Flower2, Play, Pause, X, Sparkles, Heart, Volume2, VolumeX } from 'lucide-react';
import styles from './MantraSangrah.module.css';

interface Track {
    id: string;
    title: string;
    titleHi: string;
    src: string;
    startTime: number;
    isDefault?: boolean;
    isSpecial?: boolean;
}

// Initial static playlist as fallback/loading state
const INITIAL_PLAYLIST: Track[] = [
    {
        id: 'sahana',
        title: 'Om Sahana Vavatu (Shanti Mantra)',
        titleHi: 'ॐ सहना ववतु (शांति मंत्र)',
        src: '/audio/Om_Sahana_Vavatu_Shanti_Mantra.mp3',
        startTime: 0,
        isDefault: true
    }
];

// Helper to format filename into readable title
const formatTitle = (filename: string): string => {
    // Remove extension
    let name = filename.replace(/\.(mp3|wav|m4a|ogg)$/i, '');

    // Remove common prefixes/suffixes using regex
    name = name.replace(/_/g, ' ')  // Replace underscores with spaces
        .replace(/-/g, ' ')  // Replace hyphens with spaces
        .replace(/\(mp3\.pm\)/gi, '') // Remove specific site suffix
        .replace(/\.mp3/gi, '') // Remove double extensions
        .replace(/vedic chants/gi, '') // Clean common terms
        .replace(/collection of/gi, '')
        .replace(/\d+/g, '') // Remove numbers (optional, maybe keep if meaningful?)
        .trim();

    // Capitalize words
    return name.replace(/\b\w/g, c => c.toUpperCase());
};

interface MantraSangrahProps {
    lang: 'en' | 'hi';
    startPlaying?: boolean;
}

// Helper to get Hindi title
const getHindiTitle = (filename: string): string => {
    if (filename.includes('Om_Sahana_Vavatu')) return 'ॐ सहना ववतु (शांति मंत्र)';
    if (filename.includes('Lalitha Sahasranamam')) return 'ललिता सहस्रनाम';
    if (filename.includes('vishnu_sahasranama')) return 'विष्णु सहस्रनाम';
    if (filename.includes('MahaMrtyunjaya')) return 'महामृत्युंजय मंत्र (108x)';
    if (filename.includes('Narayana_Suktam')) return 'नारायण सूक्तम्';
    if (filename.includes('Shri_suktam')) return 'श्री सूक्तम्';
    if (filename.includes('Agnihotra_Shantipath')) return 'अग्निहोत्र शांतिपाठ';
    if (filename.includes('Chamakam')) return 'चमकम्';
    if (filename.includes('Kshama_Prarthana')) return 'क्षमा प्रार्थना';
    if (filename.includes('Vedic_Chant')) return 'वैदिक मंत्र';
    if (filename.includes('Virija Homa Mantra')) return 'विरजा होम मंत्र';
    if (filename.includes('Ranjani - Gayatri')) return 'ललिता सहस्रनाम (रंजनी - गायत्री)';
    if (filename.includes('Guidance')) return 'मार्गदर्शन (Guidance)';

    // Fallback format if no mapping found
    return formatTitle(filename);
};

export default function MantraSangrah({ lang, startPlaying = false }: MantraSangrahProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [playlist, setPlaylist] = useState<Track[]>(INITIAL_PLAYLIST);
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);

    // Fetch dynamic playlist
    useEffect(() => {
        const fetchPlaylist = async () => {
            try {
                const response = await fetch('/api/audio');
                if (response.ok) {
                    const data = await response.json();
                    if (data.files && Array.isArray(data.files)) {
                        // Filter out unwanted tracks
                        const filteredFiles = data.files.filter((file: any) =>
                            !file.name.includes('Nitya_Santhoshini')
                        );

                        let newTracks: Track[] = filteredFiles.map((file: any, index: number) => {
                            let title = formatTitle(file.name);
                            let titleHi = getHindiTitle(file.name);
                            let isSpecial = false;
                            let isDefault = false;
                            let id = `track-${index}`;

                            // Identify specific tracks
                            if (file.name.includes('Guidance')) {
                                title = 'Guidance';
                                id = 'guidance';
                            } else if (file.name.includes('Om_Sahana_Vavatu')) {
                                title = 'Om Sahana Vavatu (Shanti Mantra)';
                            } else if (file.name.includes('Lalitha Sahasranamam I Manojna')) {
                                title = 'Lalitha Sahasranamam';
                                isSpecial = true;
                            } else if (file.name.includes('vishnu_sahasranama')) {
                                title = 'Vishnu Sahasranama';
                                isSpecial = true;
                                isDefault = true;
                            }

                            return {
                                id,
                                title,
                                titleHi,
                                src: file.path,
                                startTime: 0,
                                isSpecial,
                                isDefault
                            };
                        });

                        // Custom Sorting Logic
                        const orderedTracks: Track[] = [];
                        const remainingTracks: Track[] = [];

                        let guidanceTrack: Track | undefined;
                        let sahanaTrack: Track | undefined;
                        let lalithaTrack: Track | undefined;
                        let vishnuTrack: Track | undefined;

                        newTracks.forEach(track => {
                            if (track.id === 'guidance') guidanceTrack = track;
                            else if (track.src.includes('Om_Sahana_Vavatu')) sahanaTrack = track;
                            else if (track.src.includes('Lalitha Sahasranamam I Manojna')) lalithaTrack = track;
                            else if (track.src.includes('vishnu_sahasranama')) vishnuTrack = track;
                            else remainingTracks.push(track);
                        });

                        remainingTracks.sort((a, b) => a.title.localeCompare(b.title));

                        // Order: Guidance -> Sahana -> Lalitha -> Vishnu -> Others
                        if (guidanceTrack) orderedTracks.push(guidanceTrack);

                        if (sahanaTrack) {
                            sahanaTrack.isDefault = true; // Sahana remains default start if Guidance isn't auto-started
                            orderedTracks.push(sahanaTrack);
                        }
                        if (lalithaTrack) {
                            if (!sahanaTrack) lalithaTrack.isDefault = true;
                            orderedTracks.push(lalithaTrack);
                        }
                        if (vishnuTrack) orderedTracks.push(vishnuTrack);

                        const finalPlaylist = [...orderedTracks, ...remainingTracks];

                        setPlaylist(finalPlaylist);

                        if (!currentTrack && finalPlaylist.length > 0) {
                            setCurrentTrack(finalPlaylist[0]);
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to fetch playlist:", error);
            }
        };

        fetchPlaylist();
    }, []);

    // Refs for state access inside event listeners
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const currentTrackRef = useRef<Track | null>(null);
    const playlistRef = useRef<Track[]>([]); // New ref to access fresh playlist in callbacks

    // Keep refs updated
    useEffect(() => {
        currentTrackRef.current = currentTrack;
    }, [currentTrack]);

    useEffect(() => {
        playlistRef.current = playlist;
    }, [playlist]);

    const playTrack = async (track: Track) => {
        const audio = audioRef.current;
        if (!audio) return;

        setCurrentTrack(track);
        currentTrackRef.current = track;

        audio.src = track.src;
        audio.currentTime = track.startTime;
        setProgress(0);

        try {
            await audio.play();
            setIsPlaying(true);
        } catch (err) {
            console.error("Playback failed:", err);
            setIsPlaying(false);
        }
    };

    // Initialize audio element on mount, clean up on unmount
    useEffect(() => {
        // Create audio element
        const audio = new Audio();
        audio.volume = 0.5;
        audio.preload = 'auto';
        audioRef.current = audio;

        // Event handlers
        const handleTimeUpdate = () => {
            if (audio.duration) {
                setProgress((audio.currentTime / audio.duration) * 100);
            }
        };

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
        };

        const handleEnded = () => {
            const current = currentTrackRef.current;
            const currentPlaylist = playlistRef.current; // Use ref for fresh state



            // Sequential Playback Logic
            const currentIdx = currentPlaylist.findIndex(t => t.id === current?.id);
            console.log("Current Index:", currentIdx);

            if (currentIdx !== -1 && currentIdx < currentPlaylist.length - 1) {
                // Play next track
                const nextTrack = currentPlaylist[currentIdx + 1];
                console.log(`Playing next: ${nextTrack.title}`);
                playTrack(nextTrack);
            } else {
                // End of playlist. Loop back to first mantra
                console.log('Playlist ended. Looping back to first mantra.');
                const firstMantra = currentPlaylist[0];
                if (firstMantra) playTrack(firstMantra);
            }
        };

        const handlePlay = () => {
            setIsPlaying(true);
        };

        const handlePause = () => {
            setIsPlaying(false);
        };

        const handleError = (e: Event) => {
            console.error('Audio error:', e);
            setIsPlaying(false);
        };

        // Add event listeners
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('error', handleError);

        // Load default track (Lalita Sahasranama)
        const defaultTrack = playlist.find(t => t.isDefault) || playlist[0];
        setCurrentTrack(defaultTrack);
        audio.src = defaultTrack.src;

        // CLEANUP: Stop audio and remove all listeners when navigating away
        return () => {
            console.log("Unmounting MantraSangrah, stopping audio...");
            audio.pause();
            audio.src = ''; // Release audio resource
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('error', handleError);
            audioRef.current = null;
        };
    }, []); // Empty deps - runs once on mount, cleans up on unmount

    // Handle external play trigger (from IntroVideoFlash completion)
    useEffect(() => {
        if (startPlaying && audioRef.current) {
            const playSequence = async () => {
                const audio = audioRef.current;
                if (!audio) return;

                console.log("startPlaying triggered. Playing Guidance...");

                try {
                    // Force unmute
                    audio.muted = false;
                    setIsMuted(false);

                    // 1. Play Guidance Audio
                    const guidanceTrack: Track = {
                        id: 'guidance',
                        title: 'Guidance',
                        titleHi: 'मार्गदर्शन',
                        src: '/audio/Guidance.wav', // Ensure case matches file system
                        startTime: 0
                    };

                    // We manually set this because playTrack might be async/complex
                    setCurrentTrack(guidanceTrack);
                    currentTrackRef.current = guidanceTrack;

                    audio.src = guidanceTrack.src;
                    await audio.play();

                } catch (err) {
                    console.log('Guidance Play failed, falling back to playlist:', err);
                    // Fallback to Sahana if guidance fails
                    const firstMantra = playlist[0];
                    playTrack(firstMantra);
                }
            };
            playSequence();
        }
    }, [startPlaying]);

    const selectTrack = async (track: Track) => {
        const audio = audioRef.current;
        if (!audio) return;

        // If clicking the already selected track, toggle play/pause
        if (currentTrack?.id === track.id) {
            if (audio.paused) {
                try {
                    await audio.play();
                } catch (err) {
                    console.log('Play failed:', err);
                }
            } else {
                audio.pause();
            }
            return;
        }

        // Play new track
        playTrack(track);
    };

    const togglePlayPause = useCallback(async () => {
        const audio = audioRef.current;
        if (!audio) return;

        // If no track, select default
        if (!currentTrack) {
            const defaultTrack = playlist.find(t => t.isDefault) || playlist[0];
            playTrack(defaultTrack);
            return;
        }

        if (audio.paused) {
            try {
                await audio.play();
            } catch (err) {
                console.log('Playback failed:', err);
            }
        } else {
            audio.pause();
        }
    }, [currentTrack]);

    const toggleMute = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;

        // Toggle mute directly on the audio element
        const newMutedState = !audio.muted;
        audio.muted = newMutedState;
        setIsMuted(newMutedState);
    }, []);

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!audioRef.current || !duration) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = clickX / rect.width;
        audioRef.current.currentTime = percentage * duration;
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <>
            {/* Floating Sound Toggle - Always Visible */}
            <button
                className={styles.soundToggle}
                onClick={toggleMute}
                aria-label={isMuted ? "Unmute" : "Mute"}
                title={isMuted ? (lang === 'hi' ? 'ध्वनि चालू करें' : 'Unmute') : (lang === 'hi' ? 'ध्वनि बंद करें' : 'Mute')}
            >
                {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
            </button>

            {/* Floating Golden Lotus Trigger - Top Left Temple Pillar */}
            <div className={`${styles.triggerContainer} ${isOpen ? styles.triggerHidden : ''}`}>
                <button
                    className={styles.trigger}
                    onClick={() => setIsOpen(true)}
                    aria-label="Open Mantra Collection"
                >
                    <span className={styles.lotusIcon}>🪷</span>
                </button>
                <span className={styles.triggerLabel}>
                    {lang === 'hi' ? 'ध्यान के लिए अपना श्रोत या मंत्र चुनें' : 'Choose your Mantra for Meditation'}
                </span>
            </div>

            {/* Acharya Samvad - Top Right Temple Pillar */}
            <div className={styles.acharyaContainer}>
                <Link
                    href={`/acharya-samvad?lang=${lang}`}
                    className={styles.acharyaTrigger}
                    aria-label="Consult Acharya"
                >
                    <span className={styles.acharyaIcon}>🪔</span>
                </Link>
                <span className={styles.acharyaLabel}>
                    {lang === 'hi' ? 'आचार्य संवाद' : 'Acharya Samvad'}
                </span>
            </div>

            {/* Overlay */}
            {isOpen && (
                <div
                    className={styles.overlay}
                    onClick={() => setIsOpen(false)}
                />

            )}

            {/* Menu Panel */}
            <div className={`${styles.panel} ${isOpen ? styles.panelOpen : ''}`}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerTitle}>
                        <Sparkles size={20} className={styles.headerIcon} />
                        <h2>{lang === 'hi' ? 'मंत्र संग्रह' : 'Mantra Sangrah'}</h2>
                    </div>
                    <button
                        className={styles.diagnoseButton}
                        onClick={() => {
                            window.location.href = `/digital-vaidya?lang=${lang}`;
                        }}
                        aria-label={lang === 'hi' ? 'आचार्य संवाद के लिए यहाँ क्लिक करें' : 'Click for Acharya Samvad'}
                    >
                        {lang === 'hi' ? 'आचार्य संवाद के लिए यहाँ क्लिक करें 🙏' : 'Click for Acharya Samvad 🙏'}
                    </button>
                </div>

                {/* Divider */}
                <div className={styles.divider} />

                {/* Playlist */}
                <div className={styles.playlist}>
                    <p className={styles.sectionLabel}>
                        {lang === 'hi' ? '🙏 दिव्य मंत्र चुनें' : '🙏 Select Divine Mantra'}
                    </p>
                    {playlist.map((track) => (
                        <button
                            key={track.id}
                            className={`${styles.trackItem} ${currentTrack?.id === track.id ? styles.trackActive : ''}`}
                            onClick={() => selectTrack(track)}
                        >
                            <div className={styles.trackInfo}>
                                <span className={styles.trackTitle}>
                                    {track.titleHi}
                                </span>
                                {track.isDefault && (
                                    <span className={styles.trackBadge}>
                                        {lang === 'hi' ? 'डिफ़ॉल्ट' : 'Default'}
                                    </span>
                                )}
                                {track.isSpecial && (
                                    <span className={styles.trackBadge}>
                                        {lang === 'hi' ? 'विशेष' : 'Special'}
                                    </span>
                                )}
                            </div>
                            <div className={styles.trackAction}>
                                {currentTrack?.id === track.id && isPlaying ? (
                                    <Pause size={18} />
                                ) : (
                                    <Play size={18} />
                                )}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Audio Controls - Compact Mini Player */}
                {currentTrack && (
                    <div className={styles.controls}>
                        {/* Compact Layout: [PlayBtn] [Title+Progress] [Time] */}

                        <button
                            className={styles.miniPlayBtn}
                            onClick={togglePlayPause}
                        >
                            {isPlaying ? <Pause size={20} /> : <Play size={20} className={styles.playIconOffset} />}
                        </button>

                        <div className={styles.miniTrackInfo}>
                            <span className={styles.miniTrackTitle}>
                                {currentTrack.titleHi}
                            </span>

                            <div
                                className={styles.miniProgressContainer}
                                onClick={handleProgressClick}
                            >
                                <div
                                    className={styles.miniProgressBar}
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>

                        <div className={styles.miniTimeDisplay}>
                            <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className={styles.footer}>
                    <span>🙏 ॐ शान्ति शान्ति शान्ति 🙏</span>
                </div>
            </div>
        </>
    );
}
