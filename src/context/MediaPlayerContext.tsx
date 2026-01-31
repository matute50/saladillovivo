'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { getVideosForHome, getNewRandomVideo } from '@/lib/data';
import { SlideMedia } from '@/lib/types';
import { useVolume } from '@/context/VolumeContext';

// LISTA ACTUALIZADA DE INTROS (Ubicación: /public/videos_intro/)
const INTRO_VIDEOS = [
    '/videos_intro/intro1.mp4',
    '/videos_intro/intro2.mp4',
    '/videos_intro/intro3.mp4',
    '/videos_intro/intro4.mp4',
    '/videos_intro/intro5.mp4',
];

type PlaybackSource = 'INTRO' | 'DB_RANDOM' | 'USER_SELECTED' | 'RESUMING';

interface MediaPlayerContextType {
    currentVideo: SlideMedia | null;
    nextVideo: SlideMedia | null;
    playlist: SlideMedia[];
    isPlaying: boolean;
    viewMode: 'diario' | 'tv';
    setViewMode: (mode: 'diario' | 'tv') => void;
    playMedia: (media: SlideMedia) => void;
    playSpecificVideo: (media: SlideMedia) => void;
    playTemporaryVideo: (media: SlideMedia) => void;
    resumeAfterSlide: () => void;
    saveCurrentProgress: (seconds: number) => void;
    setIsPlaying: (isPlaying: boolean) => void;
    togglePlayPause: () => void;
    loadInitialPlaylist: (videoUrlToPlay: string | null) => Promise<void>;
    handleOnEnded: () => void;
    playNextVideoInQueue: () => void;
    playLiveStream: (streamData: any) => void;
    streamStatus: any;
    setStreamStatus: (status: any) => void; // Added to allow external components to update stream status 
    videoPlayerRef: React.RefObject<HTMLVideoElement>;
    reactPlayerRef: React.RefObject<any>;
    playbackState: React.MutableRefObject<PlaybackSource>;
    lastKnownVolume: React.MutableRefObject<number>;
    isPreRollOverlayActive: boolean; // New state for overlay intro
    overlayIntroVideo: SlideMedia | null; // New state for overlay intro video
    startIntroHideTimer: () => void; // New function to start the hide timer
}

const MediaPlayerContext = createContext<MediaPlayerContextType | undefined>(undefined);

export const useMediaPlayer = () => {
    const context = useContext(MediaPlayerContext);
    if (!context) throw new Error('useMediaPlayer must be used within a MediaPlayerProvider');
    return context;
};

// Helper to check if a URL is a YouTube video
export const isYouTubeVideo = (url: string) => {
    return url.includes('youtu.be/') || url.includes('youtube.com/');
};

export const MediaPlayerProvider = ({ children }: { children: React.ReactNode }) => {
    const { setVolume, volume: currentVolume } = useVolume();

    const [currentVideo, setCurrentVideo] = useState<SlideMedia | null>(null);
    const [nextVideo, setNextVideo] = useState<SlideMedia | null>(null);
    const [playlist] = useState<SlideMedia[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [viewMode, setViewMode] = useState<'diario' | 'tv'>('diario');
    const [streamStatus, setStreamStatus] = useState<any>(null); // State for live stream status
    const [isPreRollOverlayActive, setIsPreRollOverlayActive] = useState(false); // New state
    const [overlayIntroVideo, setOverlayIntroVideo] = useState<SlideMedia | null>(null); // New state

    const videoPlayerRef = useRef<HTMLVideoElement>(null);
    const reactPlayerRef = useRef<any>(null);
    const isInitialized = useRef(false);
    const playbackState = useRef<PlaybackSource>('INTRO');
    const savedProgress = useRef<number>(0);
    const savedVideo = useRef<SlideMedia | null>(null);
    const savedVolume = useRef<number>(1);
    const lastKnownVolume = useRef<number>(1);
    const nextDataVideoRef = useRef<SlideMedia | null>(null);
    const preloadGuard = useRef<string>("");
    const nextIntroVideoRef = useRef<SlideMedia | null>(null); // New ref for preloading next intro


    // --- HELPERS ---

    const getRandomIntro = useCallback((): SlideMedia => {
        // Function to generate a new random intro
        const generateNewRandomIntro = () => {
            if (INTRO_VIDEOS.length === 0) {
                console.warn("No hay videos de intro definidos");
                return { id: 'fallback', nombre: 'Intro', url: '', categoria: 'Inst', type: 'video', createdAt: '', imagen: '', novedad: false };
            }

            const randomIndex = Math.floor(Math.random() * INTRO_VIDEOS.length);
            const url = INTRO_VIDEOS[randomIndex];
            const safeUrl = encodeURI(url);

            return {
                id: `intro-${Date.now()}-${Math.random()}`,
                nombre: 'ESPACIO PUBLICITARIO',
                url: safeUrl,
                categoria: 'Institucional',
                createdAt: new Date().toISOString(),
                type: 'video',
                imagen: '', // Added to satisfy SlideMedia interface
                novedad: false // Added to satisfy SlideMedia interface
            };
        };

        if (nextIntroVideoRef.current) {
            // If a next intro is preloaded, return it
            const intro = nextIntroVideoRef.current;
            // Immediately start preloading the *next* intro in the background
            nextIntroVideoRef.current = generateNewRandomIntro();
            return intro;
        } else {
            // If no intro is preloaded, generate one and start preloading the next one
            const intro = generateNewRandomIntro();
            nextIntroVideoRef.current = generateNewRandomIntro(); // Preload the next one
            return intro;
        }
    }, []);

    const fetchRandomDbVideo = useCallback(async (excludeId?: string): Promise<SlideMedia | null> => {
        try {
            const video = await getNewRandomVideo(excludeId);
            return video;
        } catch (error) {
            console.error("Error fetching DB video:", error);
            return null;
        }
    }, []);

    const startIntroHideTimer = useCallback(() => {
        setTimeout(() => {
            // Add a small delay before actually hiding the overlay
            setTimeout(() => {
                setIsPreRollOverlayActive(false);
                setOverlayIntroVideo(null); // Clear the overlay intro video
            }, 500); // 500ms additional delay
        }, 4000); // 4 seconds from when intro actually starts playing
    }, [setIsPreRollOverlayActive, setOverlayIntroVideo]);
    // --- FUNCIONES ---

    const playMedia = useCallback((media: SlideMedia) => {
        setCurrentVideo(media);
        setIsPlaying(true);
    }, []);

    const playSpecificVideo = useCallback((media: SlideMedia) => {
        savedVolume.current = currentVolume; // Save current volume for restoring later
        setVolume(0.2); // Optionally lower volume for intro transition
        playbackState.current = 'USER_SELECTED'; // Indicate user selected video

        if (isYouTubeVideo(media.url)) {
            setCurrentVideo(media); // Start playing the YouTube video immediately
            setIsPlaying(true);
            const introToPlay = getRandomIntro();
            setOverlayIntroVideo(introToPlay); // Set a random intro for the overlay
            setIsPreRollOverlayActive(true); // Activate the overlay

            // Timer will now be started by VideoSection when intro video actually starts playing
        } else {
            // Existing logic for non-YouTube videos (or if we decide to apply intro to all specific plays)
            setCurrentVideo(media);
            setIsPlaying(true);
        }
    }, [currentVolume, setVolume, getRandomIntro, setIsPlaying]);
    const playTemporaryVideo = useCallback((media: SlideMedia) => {
        if (currentVideo && playbackState.current !== 'INTRO') {
            savedVideo.current = currentVideo;
        }
        playMedia(media);
    }, [currentVideo, playMedia]);

    const playLiveStream = useCallback((streamData: any) => {
        // Assuming streamData is a SlideMedia compatible object or has a URL
        setCurrentVideo(streamData);
        setIsPlaying(true);
        playbackState.current = 'USER_SELECTED'; // Treat live stream as user selected
    }, []);

    const togglePlayPause = useCallback(() => setIsPlaying(p => !p), []);

    const saveCurrentProgress = useCallback((seconds: number, volume: number) => {
        savedProgress.current = seconds;
        savedVolume.current = volume; // Save the volume at this point
    }, []);

    const loadInitialPlaylist = useCallback(async (videoUrlToPlay: string | null) => {
        if (isInitialized.current) return;
        isInitialized.current = true;

        console.log('MediaPlayer: Iniciando secuencia...');

        if (videoUrlToPlay) {
            const { allVideos } = await getVideosForHome(10);
            const requested = allVideos.find(v => v.url === videoUrlToPlay);
            if (requested) {
                // If a specific video is requested, check if it's YouTube and apply overlay if needed
                if (isYouTubeVideo(requested.url)) {
                    setCurrentVideo(requested);
                    setIsPlaying(true);
                    const introToPlay = getRandomIntro();
                    setOverlayIntroVideo(introToPlay);
                    setIsPreRollOverlayActive(true);
                    // Timer will now be started by VideoSection when intro video actually starts playing
                } else {
                    playSpecificVideo(requested); // Use existing playSpecificVideo for non-YouTube or regular flow
                }
                return;
            }
        }

        // If no specific video requested, or requested video not found,
        // try to fetch a random DB video to start with the overlay
        const randomDbVideo = await fetchRandomDbVideo();
        if (randomDbVideo && isYouTubeVideo(randomDbVideo.url)) {
            setCurrentVideo(randomDbVideo);
            setIsPlaying(true);
            const introToPlay = getRandomIntro();
            setOverlayIntroVideo(introToPlay);
            setIsPreRollOverlayActive(true);
            // Timer will now be started by VideoSection when intro video actually starts playing
        } else {
            // Fallback: If no random YouTube video, or not YouTube, play a regular intro
            const intro = getRandomIntro();
            playbackState.current = 'INTRO';
            setCurrentVideo(intro);
            setIsPlaying(true);
        }
    }, [getRandomIntro, playSpecificVideo, fetchRandomDbVideo, setIsPlaying, setCurrentVideo, setOverlayIntroVideo, setIsPreRollOverlayActive]);
    const handleOnEnded = useCallback(async () => {
        console.log('Video Ended. State:', playbackState.current);

        if (playbackState.current === 'INTRO') {
            let nextV = nextDataVideoRef.current;

            if (!nextV) {
                // console.log("Fallback: Buscando video ahora..."); // Removed, handled below
                nextV = await fetchRandomDbVideo(currentVideo?.id);
            }

            if (nextV) {
                // If the next video is YouTube, play it with the post-roll intro overlay
                if (isYouTubeVideo(nextV.url)) {
                    console.log('Video Ended: INTRO. Next is YouTube. Activating post-roll overlay.');
                    setCurrentVideo(nextV);
                    setIsPlaying(true);
                    const introToPlay = getRandomIntro();
                    setOverlayIntroVideo(introToPlay);
                    setIsPreRollOverlayActive(true);
                } else {
                    // If next is not YouTube, play it normally
                    playbackState.current = 'DB_RANDOM';
                    setCurrentVideo(nextV);
                    setIsPlaying(true);
                }
            } else {
                // Fallback if no DB video is found, play another intro
                console.log('Video Ended: INTRO. No next video found. Playing another intro.');
                setCurrentVideo(getRandomIntro());
                setIsPlaying(true);
            }
        }
        else { // This is the block that executes after a DB_RANDOM or USER_SELECTED video ends
            // If a DB_RANDOM or USER_SELECTED video just ended
            // Restore volume if it was a USER_SELECTED video or if a DB_RANDOM video just ended
            if (playbackState.current === 'DB_RANDOM') {
                setVolume(lastKnownVolume.current);
            } else if (playbackState.current === 'USER_SELECTED') {
                setVolume(savedVolume.current);
            }

            let nextV = nextDataVideoRef.current; // Get the preloaded next video

            if (!nextV) {
                console.log("handleOnEnded: Buscando siguiente video aleatorio...");
                nextV = await fetchRandomDbVideo(currentVideo?.id);
            }

            if (nextV && isYouTubeVideo(nextV.url)) {
                console.log('Video Ended: USER_SELECTED/DB_RANDOM. Next is YouTube. Activating post-roll overlay.');
                // Initiate post-roll intro overlay
                setCurrentVideo(nextV); // Start playing the next YouTube video immediately
                setIsPlaying(true);
                const introToPlay = getRandomIntro();
                setOverlayIntroVideo(introToPlay); // Set a random intro for the overlay
                setIsPreRollOverlayActive(true); // Activate the overlay
            } else if (nextV) {
                console.log('Video Ended: USER_SELECTED/DB_RANDOM. Next is not YouTube. Playing normally.');
                // Play next non-YouTube video normally
                playbackState.current = 'DB_RANDOM';
                setCurrentVideo(nextV);
                setIsPlaying(true);
            } else {
                console.log('Video Ended: USER_SELECTED/DB_RANDOM. No next video found. Playing an intro.');
                // Fallback: If no next video found, play a regular intro
                playbackState.current = 'INTRO';
                setCurrentVideo(getRandomIntro());
                setIsPlaying(true);
            }
        }
    }, [setVolume, getRandomIntro, fetchRandomDbVideo, currentVideo, setCurrentVideo, setIsPlaying, setOverlayIntroVideo, setIsPreRollOverlayActive]);

    const playNextVideoInQueue = useCallback(() => {
        handleOnEnded();
    }, [handleOnEnded]);

    const resumeAfterSlide = useCallback(() => {
        if (savedVideo.current) {
            const videoToResume = { ...savedVideo.current, startAt: savedProgress.current };
            playbackState.current = 'RESUMING';
            setCurrentVideo(videoToResume);
            setIsPlaying(true);
        } else {
            handleOnEnded();
        }
    }, [handleOnEnded]);

    // --- PRECARGA ---
    useEffect(() => {
        if (!currentVideo) return;

        if (preloadGuard.current === currentVideo.id) return;
        preloadGuard.current = currentVideo.id;

        if (playbackState.current === 'INTRO') {
            if (!nextDataVideoRef.current) {
                setNextVideo({ id: 'loading', nombre: 'Cargando...', categoria: 'Youtube', url: '', createdAt: '', type: 'video', imagen: '', novedad: false });
                fetchRandomDbVideo(currentVideo.id).then((video) => {
                    if (video) {
                        nextDataVideoRef.current = video;
                        setNextVideo(video);
                    }
                });
            } else {
                setNextVideo(nextDataVideoRef.current);
            }
        }
        else {
            nextDataVideoRef.current = null;
            fetchRandomDbVideo(currentVideo.id).then((video) => {
                if (video) {
                    nextDataVideoRef.current = video;
                    setNextVideo(video);
                }
            });
        }
    }, [currentVideo, getRandomIntro, fetchRandomDbVideo]);

    const value = useMemo(() => ({
        currentVideo, nextVideo, playlist, isPlaying, viewMode, streamStatus, isPreRollOverlayActive, overlayIntroVideo, startIntroHideTimer,
        setViewMode, playMedia, playSpecificVideo, playTemporaryVideo, playLiveStream,
        setIsPlaying, togglePlayPause, loadInitialPlaylist, handleOnEnded, playNextVideoInQueue,
        saveCurrentProgress, resumeAfterSlide, setStreamStatus,
        videoPlayerRef,
        reactPlayerRef,
        playbackState,
        lastKnownVolume,
    }), [
        currentVideo, nextVideo, playlist, isPlaying, viewMode, streamStatus, isPreRollOverlayActive, overlayIntroVideo, startIntroHideTimer,
        setViewMode, playMedia, playSpecificVideo, playTemporaryVideo, playLiveStream,
        togglePlayPause, loadInitialPlaylist, handleOnEnded, playNextVideoInQueue,
        saveCurrentProgress, resumeAfterSlide, setStreamStatus,
        videoPlayerRef,
        reactPlayerRef,
        playbackState,
        lastKnownVolume,
    ]);

    return (
        <MediaPlayerContext.Provider value={value}>
            {children}
        </MediaPlayerContext.Provider>
    );
};