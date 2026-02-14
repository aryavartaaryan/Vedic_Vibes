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
        title: 'Om Sahana Vavatu (Shanti Mantra)', // Internal ID/Search key
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
    forceTrackId?: string | null;
    isPaused?: boolean;
    isSessionPaused?: boolean;
    onTrackEnded?: (trackId: string) => void;
    onPlayingChange?: (isPlaying: boolean) => void;
    externalPlaylist?: any[];
    currentIndex?: number;
    onSelectIndex?: (index: number) => void;
    onMutedChange?: (isMuted: boolean) => void;
    videoProgress?: number;
    videoTime?: number;
    videoDuration?: number;
    onVideoSeek?: (time: number) => void;
    onVideoToggle?: () => void;
}

// Helper to get Hindi title
const getHindiTitle = (filename: string): string => {
    // Specific Long Names or Priority Mappings First
    if (filename.includes('Om_Sahana_Vavatu')) return 'ॐ सहना ववतु (शांति मंत्र)';
    if (filename.includes('Lalitha Sahasranamam')) return 'ललिता सहस्रनाम';
    if (filename.includes('vishnu_sahasranama')) return 'विष्णु सहस्रनाम';
    if (filename.includes('MahaMrtyunjaya')) return 'महामृत्युंजय मंत्र (108 बार)';
    if (filename.includes('Narayana_Suktam')) return 'नारायण सूक्तम्';
    if (filename.includes('Shri_suktam')) return 'श्री सूक्तम्';
    if (filename.includes('Agnihotra_Shantipath')) return 'अग्निहोत्र शांतिपाठ';
    if (filename.includes('Chamakam')) return 'चमकम्';
    if (filename.includes('Kshama_Prarthana')) return 'क्षमा प्रार्थना';
    if (filename.includes('Virija Homa Mantra')) return 'विरजा होम मंत्र';
    if (filename.includes('Ranjani - Gayatri')) return 'ललिता सहस्रनाम (रंजनी - गायत्री)';
    if (filename.includes('Rudrashtakam')) return 'रुद्राष्टकम';
    if (filename.includes('Shiva Tandava')) return 'शिव ताण्डव स्तोत्रम्';
    if (filename.includes('Chinnamasta')) return 'छिन्नमस्ता स्तोत्रम्';
    if (filename.includes('Dainik Agnihotra')) return 'दैनिक अग्निहोत्र मंत्र';

    // Generic Keyword Checks Last
    if (filename.includes('Guidance')) return 'मार्गदर्शन';
    if (filename.includes('Gayatri')) return 'गायत्री मंत्र';
    if (filename.includes('Hanuman')) return 'हनुमान चालीसा';
    if (filename.includes('Ganesha')) return 'गणेश मंत्र';
    if (filename.includes('Shiva')) return 'शिव मंत्र';
    if (filename.includes('Durga')) return 'दुर्गा मंत्र';
    if (filename.includes('Krishna')) return 'कृष्ण मंत्र';
    if (filename.includes('Ram')) return 'राम मंत्र';
    if (filename.includes('Saraswati')) return 'सरस्वती मंत्र';
    if (filename.includes('Lakshmi')) return 'लक्ष्मी मंत्र';
    if (filename.includes('Kali')) return 'काली मंत्र';
    if (filename.includes('Vedic_Chant')) return 'वैदिक मंत्र';

    // If it contains Devanagari characters already, return it as is but trim extension
    if (/[\u0900-\u097F]/.test(filename)) {
        return filename.replace(/\.(mp3|wav|m4a|ogg|mp3\.mp3)$/i, '').replace(/_/g, ' ').trim();
    }

    return formatTitle(filename);
};

export default function MantraSangrah({
    lang: langProp,
    startPlaying = false,
    forceTrackId,
    isPaused,
    onTrackEnded,
    externalPlaylist,
    currentIndex,
    onSelectIndex,
    onMutedChange,
    isSessionPaused = false,
    onPlayingChange,
    videoProgress,
    videoTime,
    videoDuration,
    onVideoSeek,
    onVideoToggle
}: MantraSangrahProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [playlist, setPlaylist] = useState<Track[]>(INITIAL_PLAYLIST);
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [lang, setLangState] = useState(langProp);
    const [duration, setDuration] = useState(0);

    // Sync with prop if needed
    useEffect(() => {
        setLangState(langProp);
    }, [langProp]);


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
                            let id = file.path;

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
                        if (guidanceTrack) {
                            guidanceTrack.isDefault = true;
                            orderedTracks.push(guidanceTrack);
                        }
                        if (sahanaTrack) {
                            if (!guidanceTrack) sahanaTrack.isDefault = true;
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
    const playlistRef = useRef<Track[]>([]);
    const onTrackEndedRef = useRef(onTrackEnded);

    // Keep refs updated
    useEffect(() => {
        onTrackEndedRef.current = onTrackEnded;
    }, [onTrackEnded]);

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
        audio.currentTime = track.startTime || 0; // Fallback if startTime is missing
        setProgress(0);

        try {
            await audio.play();
            setIsPlaying(true);
        } catch (err: any) {
            if (err && typeof err === 'object' && 'name' in err && err.name === 'AbortError') {
                console.log("Mantra play request was interrupted (AbortError), ignoring.");
            } else if (err && typeof err === 'object' && 'name' in err && err.name === 'NotAllowedError') {
                console.warn("Autoplay blocked (NotAllowedError). Muting and retrying...");
                audio.muted = true;
                setIsMuted(true);
                try {
                    await audio.play();
                    setIsPlaying(true);
                } catch (muteErr) {
                    console.error("Muted playback also failed:", muteErr);
                    setIsPlaying(false);
                }
            } else {
                console.error("Mantra playback failed:", err);
                setIsPlaying(false);
            }
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
            const currentPlaylist = playlistRef.current;

            if (onTrackEndedRef.current && current) {
                console.log(`Mantra ${current.id} ended. Notifying parent.`);
                onTrackEndedRef.current(current.id);
                return;
            }

            // Fallback to internal sequential logic if no parent listener
            const currentIdx = currentPlaylist.findIndex(t => t.id === current?.id);
            if (currentIdx !== -1 && currentIdx < currentPlaylist.length - 1) {
                const nextTrack = currentPlaylist[currentIdx + 1];
                playTrack(nextTrack);
            } else {
                const firstMantra = currentPlaylist[0];
                if (firstMantra) playTrack(firstMantra);
            }
        };

        const handlePlay = () => {
            setIsPlaying(true);
            onPlayingChange?.(true);
        };

        const handlePause = () => {
            setIsPlaying(false);
            onPlayingChange?.(false);
        };

        const handleError = (e: Event) => {
            console.error('Audio error:', e);
            setIsPlaying(false);
            onPlayingChange?.(false);
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
                    audio.muted = false;
                    setIsMuted(false);

                    const guidanceTrack: Track = {
                        id: 'guidance',
                        title: 'Guidance',
                        titleHi: 'मार्गदर्शन',
                        src: '/audio/Guidance.wav',
                        startTime: 0
                    };

                    playTrack(guidanceTrack);
                } catch (err) {
                    console.log('Guidance Play failed:', err);
                    const firstMantra = playlist[0];
                    if (firstMantra) playTrack(firstMantra);
                }
            };
            playSequence();
        }
    }, [startPlaying]);

    useEffect(() => {
        if (forceTrackId && audioRef.current) {
            // Search in both internal and external playlists
            const allTracks = [...(playlist || []), ...(externalPlaylist || [])];
            const track = allTracks.find(t => t.id === forceTrackId || t.src === forceTrackId);

            if (track) {
                // GUARD: If this track is already loaded, don't restart it (which resets currentTime)
                // We check the source directly to avoid resets on re-render
                const isSameSrc = audioRef.current.src.includes(encodeURI(track.src));
                if (isSameSrc) {
                    if (audioRef.current.paused && !isPaused && !isSessionPaused) {
                        console.log(`[MantraSangrah] Track already loaded but paused, resuming instead of restarting.`);
                        audioRef.current.play().catch(() => { });
                    } else {
                        console.log(`[MantraSangrah] Track ${track.title} already active, skipping redundant restart.`);
                    }
                    return;
                }

                console.log(`Forcing track from parent: ${track.title} (ID/Src: ${forceTrackId})`);
                // Ensure track has all required fields for playTrack
                const normalizedTrack: Track = {
                    ...track,
                    id: track.id || track.src,
                    title: track.title || formatTitle(track.src),
                    titleHi: track.titleHi || track.title || formatTitle(track.src),
                    src: track.src,
                    startTime: track.startTime || 0
                };
                playTrack(normalizedTrack);
            } else {
                console.warn(`Could not find forced track: ${forceTrackId}`);
            }
        }
    }, [forceTrackId, playlist, externalPlaylist]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        // isPaused (prop) is for video/mantra turn coordination
        // isSessionPaused is for manual overrides
        if (isPaused && !startPlaying && !forceTrackId) {
            console.log("[MantraSangrah] Pausing because it's video turn.");
            audio.pause();
        } else if (!isPaused && audio.paused && isPlaying && !isSessionPaused) {
            // Resume if sequence moved back to mantra turn
            console.log("[MantraSangrah] Resuming mantra turn.");
            audio.play().catch(err => {
                if (err && typeof err === 'object' && 'name' in err && err.name === 'AbortError') {
                    // Silent
                } else {
                    console.warn("Resume play failed:", err);
                }
            });
        }
    }, [isPaused, isSessionPaused, isPlaying, startPlaying, forceTrackId]);

    const selectTrack = async (track: Track) => {
        const audio = audioRef.current;
        if (!audio) return;

        // If clicking the already selected track, toggle play/pause
        if (currentTrack?.id === track.id) {
            if (audio.paused) {
                try {
                    await audio.play();
                } catch (err: any) {
                    if (err && typeof err === 'object' && 'name' in err && err.name === 'AbortError') {
                        // Silent
                    } else {
                        console.log('Play failed:', err);
                    }
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
            } catch (err: any) {
                if (err && typeof err === 'object' && 'name' in err && err.name === 'AbortError') {
                    // Silent
                } else {
                    console.log('Playback failed:', err);
                }
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
        if (onMutedChange) onMutedChange(newMutedState);
    }, [onMutedChange]);

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const isVideo = !!externalPlaylist && currentIndex !== undefined && externalPlaylist[currentIndex]?.type === 'video';

        if (isVideo && onVideoSeek && videoDuration) {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const percentage = clickX / rect.width;
            onVideoSeek(percentage * videoDuration);
            return;
        }

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
                        className={styles.closeBtn}
                        onClick={() => setIsOpen(false)}
                        aria-label="Close"
                        title={lang === 'hi' ? 'बंद करें' : 'Close'}
                    >
                        <X size={26} />
                    </button>
                </div>

                {/* Divider */}
                <div className={styles.divider} />

                {/* Playlist Scroll Area */}
                <div className={styles.playlist}>
                    <div className={styles.trackList}>
                        {/* SECTION 1: Meditation Sequence (If provided) */}
                        {externalPlaylist && (
                            <div className={styles.sectionGroup}>
                                <p className={styles.categoryLabel}>
                                    {lang === 'hi' ? '🧘 साधना क्रम' : '🧘 Meditation Sequence'}
                                </p>
                                {externalPlaylist.map((track: any, index: number) => {
                                    const isActive = currentIndex === index;
                                    return (
                                        <button
                                            key={`seq-${track.id || index}`}
                                            className={`${styles.trackItem} ${isActive ? styles.trackActive : ''}`}
                                            onClick={() => onSelectIndex?.(index)}
                                        >
                                            <div className={styles.trackInfo}>
                                                <div className={styles.trackTitleContainer}>
                                                    {track.type === 'video' ? <span className={styles.mediaIcon}>📽️</span> : <span className={styles.mediaIcon}>🎵</span>}
                                                    <span className={styles.trackTitle}>
                                                        {track.titleHi}
                                                    </span>
                                                </div>
                                                <div className={styles.badgeContainer}>
                                                    {track.type === 'video' ? (
                                                        <span className={styles.trackBadgeVideo}>
                                                            {lang === 'hi' ? 'दर्शन' : 'Darshan'}
                                                        </span>
                                                    ) : (
                                                        <span className={styles.trackBadge}>
                                                            {lang === 'hi' ? 'मंत्र' : 'Mantra'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className={styles.trackAction}>
                                                {isActive && (track.type === 'video' ? !isSessionPaused : (isPlaying && !isSessionPaused)) ? (
                                                    <Pause size={18} />
                                                ) : (
                                                    <Play size={18} />
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                                <div className={styles.sectionDivider} />
                            </div>
                        )}

                        {/* SECTION 2: Full Collection */}
                        <div className={styles.sectionGroup}>
                            <p className={styles.categoryLabel}>
                                {lang === 'hi' ? '🎼 मंत्र संग्रह (पूर्ण)' : '🎼 Mantra Collection (Full)'}
                            </p>
                            {playlist
                                .filter(track => {
                                    // Hide if this track is already in the meditation sequence (externalPlaylist)
                                    if (!externalPlaylist) return true;
                                    return !externalPlaylist.some((extItem: any) =>
                                        extItem.id === track.id || extItem.src === track.id
                                    );
                                })
                                .map((track) => {
                                    // If we are in sequential mode, check if this specific audio path matches currentTrack
                                    const isActive = currentTrack?.id === track.id;
                                    return (
                                        <button
                                            key={`lib-${track.id}`}
                                            className={`${styles.trackItem} ${isActive ? styles.trackActive : ''}`}
                                            onClick={() => selectTrack(track)}
                                        >
                                            <div className={styles.trackInfo}>
                                                <div className={styles.trackTitleContainer}>
                                                    <span className={styles.mediaIcon}>🪷</span>
                                                    <span className={styles.trackTitle}>
                                                        {track.titleHi}
                                                    </span>
                                                </div>
                                                <div className={styles.badgeContainer}>
                                                    {track.isDefault && (
                                                        <span className={track.id === 'guidance' ? styles.trackBadgeGuidance : styles.trackBadge}>
                                                            {lang === 'hi' ? 'प्रारंभिक' : 'Prarambhik'}
                                                        </span>
                                                    )}
                                                    {track.isSpecial && (
                                                        <span className={styles.trackBadge}>
                                                            {lang === 'hi' ? 'विशेष' : 'Vishesh'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className={styles.trackAction}>
                                                {isActive && isPlaying ? (
                                                    <Pause size={18} />
                                                ) : (
                                                    <Play size={18} />
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                        </div>
                    </div>
                </div>

                {/* Unified Media Controls - Compact Mini Player */}
                {(currentTrack || (externalPlaylist && currentIndex !== undefined)) && (
                    <div className={styles.controls}>
                        {/* Compact Layout: [PlayBtn] [Title+Progress] [Time] */}

                        {/* Derive current display item from either library track or sequence index */}
                        {(() => {
                            const isSequenceItem = !!externalPlaylist && currentIndex !== undefined && !currentTrack;
                            const activeItem = isSequenceItem ? externalPlaylist[currentIndex] : currentTrack;
                            const isVideo = activeItem?.type === 'video';

                            // Control State
                            const isPausedNow = isVideo ? isSessionPaused : (isSequenceItem ? isSessionPaused : isPaused);
                            const currentlyPlaying = !isPausedNow;

                            // UI Values
                            const displayProgress = isVideo ? (videoProgress || 0) : progress;
                            const displayTime = isVideo ? (videoTime || 0) : (audioRef.current?.currentTime || 0);

                            return (
                                <>
                                    <button
                                        className={styles.miniPlayBtn}
                                        onClick={() => {
                                            if (isVideo && onVideoToggle) {
                                                onVideoToggle();
                                            } else if (isSequenceItem) {
                                                onSelectIndex?.(currentIndex);
                                            } else {
                                                togglePlayPause();
                                            }
                                        }}
                                    >
                                        {currentlyPlaying ? <Pause size={22} /> : <Play size={22} className={styles.playIconOffset} />}
                                    </button>

                                    <div className={styles.miniTrackInfo}>
                                        <span className={styles.miniTrackTitle}>
                                            {activeItem?.titleHi || activeItem?.title}
                                        </span>

                                        <div
                                            className={styles.miniProgressContainer}
                                            onClick={handleProgressClick}
                                        >
                                            <div
                                                className={styles.miniProgressBar}
                                                style={{ width: `${displayProgress}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.miniTimeDisplay}>
                                        <span>{formatTime(displayTime)}</span>
                                    </div>
                                </>
                            );
                        })()}
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
