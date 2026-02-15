'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Flower2, Play, Pause, X, Sparkles, Heart, Volume2, VolumeX } from 'lucide-react';
import styles from './MantraSangrah.module.css';
import LightweightPlayer from '../LightweightPlayer/LightweightPlayer';

interface Track {
    id: string;
    title: string;
    titleHi: string;
    src: string;
    startTime: number;
    isDefault?: boolean;
    isSpecial?: boolean;
    type?: string;
}

// Initial static playlist as fallback/loading state
const INITIAL_PLAYLIST: Track[] = [
    {
        id: 'sahana',
        title: 'Om Sahana Vavatu (Shanti Mantra)', // Internal ID/Search key
        titleHi: 'ॐ सहना ववतु (शांति मंत्र)',
        src: '/audio/Om_Sahana_Vavatu_Shanti_Mantra.mp3',
        startTime: 0,
        isDefault: true,
        type: 'mantra'
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
    activeTrack?: Track | null; // NEW: Single source of truth
    onTrackEnded?: (trackId: string) => void;
    onPlayingChange?: (isPlaying: boolean) => void;
    externalPlaylist?: any[];
    currentIndex?: number;
    onSelectIndex?: (index: number) => void;
    onMutedChange?: (isMuted: boolean) => void;
    isMuted?: boolean; // NEW: Prop to control mute state
    onTimeUpdate?: (current: number, duration: number) => void;
    videoProgress?: number;
    videoTime?: number;
    videoDuration?: number;
    onVideoSeek?: (time: number) => void;
    onVideoToggle?: () => void;
    sessionActive?: boolean;
    onActiveTrackChange?: (track: Track | null) => void;
    onTrackSelect?: (track: Track) => void; // Delegate control
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
    activeTrack, // NEW input
    onTrackEnded,
    externalPlaylist,
    currentIndex,
    onSelectIndex,
    onMutedChange,
    isMuted: isMutedProp, // Destructure prop
    onPlayingChange,
    videoProgress,
    videoTime,
    videoDuration,
    onVideoSeek,
    onVideoToggle,
    onTimeUpdate,
    sessionActive = false,
    onActiveTrackChange,
    onTrackSelect
}: MantraSangrahProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [playlist, setPlaylist] = useState<Track[]>(INITIAL_PLAYLIST);
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(isMutedProp || false);
    const [progress, setProgress] = useState(0);
    const [lang, setLangState] = useState(langProp);
    const [duration, setDuration] = useState(0);

    // RESTORED: Fetch dynamic playlist
    useEffect(() => {
        const fetchPlaylist = async () => {
            try {
                const response = await fetch('/api/audio');
                if (response.ok) {
                    const data = await response.json();
                    if (data.files && Array.isArray(data.files)) {
                        const filteredFiles = data.files.filter((file: any) =>
                            !file.name.includes('Nitya_Santhoshini')
                        );

                        // Map files to Track objects
                        let newTracks: Track[] = filteredFiles.map((file: any) => {
                            let title = formatTitle(file.name);
                            let titleHi = getHindiTitle(file.name);
                            let isSpecial = false;
                            let isDefault = false;
                            let id = file.path; // Use path as ID for library items

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
                                startTime: file.name.includes('vishnu_sahasranama') ? 5 : 0,
                                isSpecial,
                                isDefault,
                                type: 'mantra'
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

                        if (guidanceTrack) { guidanceTrack.isDefault = true; orderedTracks.push(guidanceTrack); }
                        if (sahanaTrack) { if (!guidanceTrack) sahanaTrack.isDefault = true; orderedTracks.push(sahanaTrack); }
                        if (lalithaTrack) { if (!sahanaTrack) lalithaTrack.isDefault = true; orderedTracks.push(lalithaTrack); }
                        if (vishnuTrack) orderedTracks.push(vishnuTrack);

                        setPlaylist([...orderedTracks, ...remainingTracks]);
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
    const onTrackEndedRef = useRef(onTrackEnded);
    const onPlayingChangeRef = useRef(onPlayingChange);

    // Keep refs updated
    useEffect(() => {
        onTrackEndedRef.current = onTrackEnded;
        onPlayingChangeRef.current = onPlayingChange;
    }, [onTrackEnded, onPlayingChange]);

    // Initialize audio ref cleanup
    useEffect(() => {
        return () => {
            console.log("Unmounting MantraSangrah, stopping audio...");
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = '';
            }
        };
    }, []);



    // REFACTORED: Single Source of Truth - 'activeTrack' Prop
    // We no longer maintain internal currentTrack or playOperationId for logic.
    // The parent tells us WHAT to play. We just sync the <audio> element to it.

    // Effect: Sync Audio Element with Active Track
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (activeTrack) {
            // 1. Check if source needs updating
            const encodedSrc = encodeURI(activeTrack.src).replace(/\(/g, '%28').replace(/\)/g, '%29');
            const currentSrc = audio.src;

            // Allow for browser-encoded variations in comparison
            const isSameSource = currentSrc.includes(encodedSrc) || currentSrc === encodedSrc;

            if (!isSameSource) {
                console.log(`[MantraSangrah] Loading NEW Track: ${activeTrack.title}`);
                audio.src = encodedSrc;
                audio.currentTime = activeTrack.startTime || 0;
            }

            // 2. Enforce Playback (Aggressive: If track exists, PLAY IT)
            if (activeTrack) {
                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => {
                            // Playback started successfully
                            if (!isPlaying) setIsPlaying(true);
                        })
                        .catch(err => {
                            if (err.name === 'AbortError') {
                                // Benign: triggered by rapid track switching
                            } else if (err.name === 'NotAllowedError') {
                                console.warn("[MantraSangrah] Autoplay blocked. Retrying with mute...");
                                audio.muted = true;
                                setIsMuted(true);
                                audio.play().catch(e => console.error("Muted play failed", e));
                            } else {
                                console.error("[MantraSangrah] Play error:", err);
                            }
                        });
                }
            } else {
                audio.pause();
                setIsPlaying(false);
            }
        } else {
            // No active track -> Pause and Reset
            if (!audio.paused) {
                console.log("[MantraSangrah] No active track. Pausing.");
                audio.pause();
            }
            setIsPlaying(false);
            // Optionally clear src to stop buffering, or keep for resume? 
            // Better to keep for now, but strictly paused.
        }
    }, [activeTrack, sessionActive]);

    // Handle User Interactions (Play/Pause Toggle)
    const togglePlayPause = useCallback(() => {
        const audio = audioRef.current;
        if (!audio || !activeTrack) {
            // If no active track, maybe ask parent to start default?
            if (onTrackSelect && playlist.length > 0) {
                onTrackSelect(playlist[0]);
            }
            return;
        }

        if (audio.paused) {
            audio.play().catch(console.error);
        } else {
            audio.pause();
        }
    }, [activeTrack, playlist, onTrackSelect]);

    const selectTrack = async (track: Track) => {
        console.log(`[MantraSangrah] User clicked track: ${track.title}`);

        // DELEGATE TO PARENT ALWAYS via onTrackSelect
        if (onTrackSelect) {
            onTrackSelect(track);
        }
    };



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


            {/* FLOATING TRIGGER - LEFT (Mantra Sangrah) */}
            {!isOpen && (
                <div className={styles.triggerContainer}>
                    <button
                        className={styles.trigger}
                        onClick={() => setIsOpen(true)}
                        aria-label="Open Mantra Sangrah"
                    >
                        <span className={styles.lotusIcon}>🪷</span>
                    </button>
                    <div className={styles.triggerLabel}>मंत्र संग्रह</div>
                </div>
            )}

            {/* FLOATING TRIGGER - RIGHT (Acharya Samvad) */}
            {!isOpen && (
                <div className={styles.acharyaContainer}>
                    <a
                        href={`/acharya-samvad?lang=${lang}`}
                        className={styles.acharyaTrigger}
                        aria-label="Chat with Acharya"
                    >
                        <span className={styles.acharyaIcon}>🪔</span>
                    </a>
                    <div className={styles.acharyaLabel}>आचार्य संवाद</div>
                </div>
            )}

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
                        <h2>{lang === 'hi' ? 'हमारा संग्रह' : 'Humara Sangrah'}</h2>
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
                        {/* Unified Collection in Playback Order */}
                        <div className={styles.sectionGroup}>
                            {/* 1. Sequence Items (Videos + Audio in their playback order) */}
                            {externalPlaylist && externalPlaylist.map((track, index) => {
                                const isActive = currentIndex === index;
                                const isVideo = track.type === 'video';

                                return (
                                    <button
                                        key={`seq-${track.id || index}`}
                                        className={`${styles.trackItem} ${isActive ? styles.trackActive : ''}`}
                                        onClick={() => {
                                            onSelectIndex?.(index);
                                            // Only auto-close if selecting a DIFFERENT video
                                            if (isVideo && index !== currentIndex) setIsOpen(false);
                                        }}
                                    >
                                        <div className={styles.trackInfo}>
                                            <div className={styles.trackTitleContainer}>
                                                <span className={styles.mediaIcon}>{isVideo ? '📽️' : '🎵'}</span>
                                                <div className={styles.trackTitleGroup}>
                                                    <span className={styles.trackTitle}>{lang === 'hi' ? track.titleHi : track.title}</span>
                                                    {isVideo && (
                                                        <span className={styles.trackSubtitle}>{lang === 'hi' ? 'चलचित्र' : 'Video'}</span>
                                                    )}
                                                    {!isVideo && (track.title.includes('Vishnu') || track.title.includes('Lalitha')) && (
                                                        <span className={styles.trackSubtitle}>{lang === 'hi' ? 'विशेष' : 'Vishesh'}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={styles.trackAction}>
                                            {isActive && (isVideo ? !isSessionPaused : isPlaying) ? <Pause size={18} /> : <Play size={18} />}
                                        </div>
                                    </button>
                                );
                            })}

                            {/* 2. Full Library Collection (Remaining items) */}
                            {playlist
                                .filter(track => {
                                    if (!externalPlaylist) return true;
                                    return !externalPlaylist.some((extItem: any) =>
                                        extItem.id === track.id || extItem.src === track.id
                                    );
                                })
                                .map((track) => {
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
                                                    <div className={styles.trackTitleGroup}>
                                                        <span className={styles.trackTitle}>{lang === 'hi' ? track.titleHi : track.title}</span>
                                                        {track.isDefault && (
                                                            <span className={track.id === 'guidance' ? styles.trackSubtitleGuidance : styles.trackSubtitle}>
                                                                {lang === 'hi' ? 'प्रारंभिक' : 'Default'}
                                                            </span>
                                                        )}
                                                        {track.isSpecial && (
                                                            <span className={styles.trackSubtitle}>{lang === 'hi' ? 'विशेष' : 'Vishesh'}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={styles.trackAction}>
                                                {isActive && isPlaying ? <Pause size={18} /> : <Play size={18} />}
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
                            // PRIORITIZE external playlist (the meditation sequence) if it exists and current index is valid
                            const isSequenceActive = !!externalPlaylist && currentIndex !== undefined;
                            const sequenceItem = isSequenceActive ? externalPlaylist[currentIndex] : null;

                            // An item is from "sequence" if no library track is playing OR if the sequence item is a video
                            // (Videos MUST use sequence controls)
                            const useSequenceControls = isSequenceActive && (!currentTrack || sequenceItem?.type === 'video');

                            const activeItem = useSequenceControls ? sequenceItem : currentTrack;
                            const isVideo = activeItem?.type === 'video';

                            // Control State - Use ACTUAL playback state
                            const currentlyPlaying = isVideo
                                ? !isSessionPaused
                                : isPlaying; // Use actual audio isPlaying state

                            // UI Values
                            const displayProgress = isVideo ? (videoProgress || 0) : progress;
                            const displayTime = isVideo ? (videoTime || 0) : (audioRef.current?.currentTime || 0);

                            // Calculate Next Track Info
                            let nextItem = null;
                            if (isSequenceActive && externalPlaylist.length > 0) {
                                // Default next index
                                let nextIdx = (currentIndex + 1) % externalPlaylist.length;

                                // Skip 'Guidance' (index 0) if looping back and list > 1
                                if (nextIdx === 0 && externalPlaylist.length > 1) {
                                    nextIdx = 1;
                                }
                                nextItem = externalPlaylist[nextIdx];
                            }

                            return (
                                <LightweightPlayer
                                    lang={lang}
                                    title={activeItem?.title || ''}
                                    titleHi={activeItem?.titleHi || ''}
                                    type={activeItem?.type as any || 'mantra'}
                                    isPlaying={currentlyPlaying}
                                    isMuted={isMuted}
                                    progress={displayProgress}
                                    currentTime={displayTime}
                                    duration={isVideo ? (videoDuration || 0) : duration}
                                    onTogglePlay={isVideo ? (onVideoToggle || (() => { })) : togglePlayPause}
                                    onToggleMute={toggleMute}
                                    onNext={() => {
                                        // If using external playlist control, use that.
                                        if (isSequenceActive && externalPlaylist && currentIndex !== undefined) {
                                            const nextIdx = (currentIndex + 1) % externalPlaylist.length;
                                            onSelectIndex?.(nextIdx);
                                        }
                                    }}
                                    onPrevious={() => {
                                        if (isSequenceActive && externalPlaylist && currentIndex !== undefined) {
                                            let prevIdx = currentIndex - 1;
                                            if (prevIdx < 0) prevIdx = externalPlaylist.length - 1;
                                            onSelectIndex?.(prevIdx);
                                        }
                                    }}
                                    onSeek={(time) => {
                                        if (isVideo) {
                                            onVideoSeek?.(time);
                                        } else {
                                            if (audioRef.current) audioRef.current.currentTime = time;
                                        }
                                    }}
                                />
                            );
                        })()}
                    </div>
                )}

                <div className={styles.footer}>
                    <span>🙏 ॐ शान्ति शान्ति शान्ति 🙏</span>
                </div>
            </div>

            {/* Hidden Audio Element for State Management */}
            <audio
                ref={audioRef}
                onTimeUpdate={(e) => {
                    const audio = e.currentTarget;
                    if (audio.duration) {
                        setProgress((audio.currentTime / audio.duration) * 100);
                        onTimeUpdate?.(audio.currentTime, audio.duration);
                    }
                }}
                onLoadedMetadata={(e) => {
                    setDuration(e.currentTarget.duration);
                    onTimeUpdate?.(e.currentTarget.currentTime, e.currentTarget.duration);
                }}
                onEnded={() => {
                    // Notify parent that THIS specific track ended
                    if (activeTrack && onTrackEnded) {
                        console.log(`[MantraSangrah] Track ended: ${activeTrack.title}`);
                        onTrackEnded(activeTrack.id);
                    }
                }}
                onPlay={() => {
                    setIsPlaying(true);
                    onPlayingChange?.(true);
                }}
                onPause={() => {
                    setIsPlaying(false);
                    onPlayingChange?.(false);
                }}
                onError={(e) => {
                    console.error('Audio element error:', e);
                    setIsPlaying(false);
                    onPlayingChange?.(false);
                }}
                preload="auto"
                style={{ display: 'none' }}
            />
        </>
    );
}
