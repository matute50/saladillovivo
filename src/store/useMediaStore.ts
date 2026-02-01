import { create } from 'zustand';
import { SlideMedia } from '@/lib/types';
import { getVideosForHome, getNewRandomVideo } from '@/lib/data';
import React from 'react';

// LISTA ACTUALIZADA DE INTROS (Ubicación: /public/videos_intro/)
const INTRO_VIDEOS = [
    '/videos_intro/intro1.mp4',
    '/videos_intro/intro2.mp4',
    '/videos_intro/intro3.mp4',
    '/videos_intro/intro4.mp4',
    '/videos_intro/intro5.mp4',
];

type PlaybackSource = 'INTRO' | 'DB_RANDOM' | 'USER_SELECTED' | 'RESUMING';

interface MediaState {
    currentVideo: SlideMedia | null;
    nextVideo: SlideMedia | null;
    playlist: SlideMedia[];
    isPlaying: boolean;
    viewMode: 'diario' | 'tv';
    streamStatus: any;
    isPreRollOverlayActive: boolean;
    overlayIntroVideo: SlideMedia | null;

    // Refs (stored in store to be accessible)
    videoPlayerRef: React.RefObject<HTMLVideoElement>;
    reactPlayerRef: React.RefObject<any>;

    // Logic refs (not exposed but kept for logic)
    playbackState: PlaybackSource;
    savedProgress: number;
    savedVideo: SlideMedia | null;
    savedVolume: number;
    lastKnownVolume: number;
    nextDataVideoRef: SlideMedia | null;
    preloadGuard: string;
    nextIntroVideoRef: SlideMedia | null;
    isInitialized: boolean;

    // Actions
    setViewMode: (mode: 'diario' | 'tv') => void;
    setIsPlaying: (isPlaying: boolean) => void;
    togglePlayPause: () => void;
    setStreamStatus: (status: any) => void;

    playMedia: (media: SlideMedia) => void;
    playSpecificVideo: (media: SlideMedia, currentVolume: number, setVolume: (v: number) => void) => void;
    playTemporaryVideo: (media: SlideMedia) => void;
    playLiveStream: (streamData: any) => void;

    loadInitialPlaylist: (videoUrlToPlay: string | null) => Promise<void>;
    handleOnEnded: (setVolume: (v: number) => void) => Promise<void>;
    playNextVideoInQueue: (setVolume: (v: number) => void) => void;
    resumeAfterSlide: (setVolume: (v: number) => void) => void;
    saveCurrentProgress: (seconds: number, volume: number) => void;
    startIntroHideTimer: () => void;

    // Helpers
    getRandomIntro: () => SlideMedia;
    fetchRandomDbVideo: (excludeId?: string) => Promise<SlideMedia | null>;
    isYouTubeVideo: (url: string) => boolean;
}

export const useMediaStore = create<MediaState>((set, get) => ({
    currentVideo: null,
    nextVideo: null,
    playlist: [],
    isPlaying: false,
    viewMode: 'diario',
    streamStatus: null,
    isPreRollOverlayActive: false,
    overlayIntroVideo: null,

    videoPlayerRef: React.createRef<HTMLVideoElement>(),
    reactPlayerRef: React.createRef<any>(),

    playbackState: 'INTRO',
    savedProgress: 0,
    savedVideo: null,
    savedVolume: 1,
    lastKnownVolume: 1,
    nextDataVideoRef: null,
    preloadGuard: "",
    nextIntroVideoRef: null,
    isInitialized: false,

    setViewMode: (viewMode) => set({ viewMode }),
    setIsPlaying: (isPlaying) => set({ isPlaying }),
    togglePlayPause: () => set((state) => ({ isPlaying: !state.isPlaying })),
    setStreamStatus: (streamStatus) => set({ streamStatus }),

    isYouTubeVideo: (url: string) => {
        return url.includes('youtu.be/') || url.includes('youtube.com/');
    },

    getRandomIntro: (): SlideMedia => {
        const generateNewRandomIntro = (): SlideMedia => {
            if (INTRO_VIDEOS.length === 0) {
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
                imagen: '',
                novedad: false
            };
        };

        const nextIntro = get().nextIntroVideoRef;
        if (nextIntro) {
            set({ nextIntroVideoRef: generateNewRandomIntro() });
            return nextIntro;
        } else {
            const intro = generateNewRandomIntro();
            set({ nextIntroVideoRef: generateNewRandomIntro() });
            return intro;
        }
    },

    fetchRandomDbVideo: async (excludeId?: string): Promise<SlideMedia | null> => {
        try {
            const video = await getNewRandomVideo(excludeId);
            return video as SlideMedia | null;
        } catch (error) {
            console.error("Error fetching DB video in MediaStore:", error);
            return null;
        }
    },

    playMedia: (media) => set({ currentVideo: media, isPlaying: true }),

    playSpecificVideo: (media, currentVolume, setVolume) => {
        set({ savedVolume: currentVolume });
        setVolume(0.2);
        set({ playbackState: 'USER_SELECTED' });

        if (get().isYouTubeVideo(media.url)) {
            set({ currentVideo: media, isPlaying: true });
            const introToPlay = get().getRandomIntro();
            set({ overlayIntroVideo: introToPlay, isPreRollOverlayActive: true });
        } else {
            set({ currentVideo: media, isPlaying: true });
        }
    },

    playTemporaryVideo: (media) => {
        if (get().currentVideo && get().playbackState !== 'INTRO') {
            set({ savedVideo: get().currentVideo });
        }
        get().playMedia(media);
    },

    playLiveStream: (streamData) => {
        set({ currentVideo: streamData, isPlaying: true, playbackState: 'USER_SELECTED' });
    },

    loadInitialPlaylist: async (videoUrlToPlay) => {
        if (get().isInitialized) return;
        set({ isInitialized: true });

        if (videoUrlToPlay) {
            const { allVideos } = await getVideosForHome(10);
            const requested = allVideos.find(v => v.url === videoUrlToPlay);
            if (requested) {
                if (get().isYouTubeVideo(requested.url)) {
                    set({ currentVideo: requested as SlideMedia, isPlaying: true });
                    const introToPlay = get().getRandomIntro();
                    set({ overlayIntroVideo: introToPlay, isPreRollOverlayActive: true });
                } else {
                    set({ currentVideo: requested as SlideMedia, isPlaying: true });
                }
                return;
            }
        }

        const randomDbVideo = await get().fetchRandomDbVideo();
        if (randomDbVideo && get().isYouTubeVideo(randomDbVideo.url)) {
            set({ currentVideo: randomDbVideo, isPlaying: true });
            const introToPlay = get().getRandomIntro();
            set({ overlayIntroVideo: introToPlay, isPreRollOverlayActive: true });
        } else {
            const intro = get().getRandomIntro();
            set({ playbackState: 'INTRO', currentVideo: intro, isPlaying: true });
        }
    },

    handleOnEnded: async (setVolume) => {
        const currentState = get().playbackState;
        if (currentState === 'INTRO') {
            let nextV = get().nextDataVideoRef;
            if (!nextV) {
                nextV = await get().fetchRandomDbVideo(get().currentVideo?.id);
            }

            if (nextV) {
                if (get().isYouTubeVideo(nextV.url)) {
                    set({ currentVideo: nextV, isPlaying: true });
                    const introToPlay = get().getRandomIntro();
                    set({ overlayIntroVideo: introToPlay, isPreRollOverlayActive: true });
                } else {
                    set({ playbackState: 'DB_RANDOM', currentVideo: nextV, isPlaying: true });
                }
            } else {
                set({ currentVideo: get().getRandomIntro(), isPlaying: true });
            }
        } else {
            if (currentState === 'DB_RANDOM') {
                setVolume(get().lastKnownVolume);
            } else if (currentState === 'USER_SELECTED') {
                setVolume(get().savedVolume);
            }

            let nextV = get().nextDataVideoRef;
            if (!nextV) {
                nextV = await get().fetchRandomDbVideo(get().currentVideo?.id);
            }

            if (nextV && get().isYouTubeVideo(nextV.url)) {
                set({ currentVideo: nextV, isPlaying: true });
                const introToPlay = get().getRandomIntro();
                set({ overlayIntroVideo: introToPlay, isPreRollOverlayActive: true });
            } else if (nextV) {
                set({ playbackState: 'DB_RANDOM', currentVideo: nextV, isPlaying: true });
            } else {
                set({ playbackState: 'INTRO', currentVideo: get().getRandomIntro(), isPlaying: true });
            }
        }

        // Trigger preload for the *next* next video
        const newVideo = get().currentVideo;
        if (newVideo) {
            get().fetchRandomDbVideo(newVideo.id).then(v => set({ nextDataVideoRef: v, nextVideo: v }));
        }
    },

    playNextVideoInQueue: (setVolume) => {
        get().handleOnEnded(setVolume);
    },

    resumeAfterSlide: (setVolume) => {
        if (get().savedVideo) {
            const videoToResume = { ...get().savedVideo!, startAt: get().savedProgress };
            set({ playbackState: 'RESUMING', currentVideo: videoToResume, isPlaying: true });
        } else {
            get().handleOnEnded(setVolume);
        }
    },

    saveCurrentProgress: (seconds, volume) => {
        set({ savedProgress: seconds, savedVolume: volume });
    },

    startIntroHideTimer: () => {
        setTimeout(() => {
            setTimeout(() => {
                set({ isPreRollOverlayActive: false, overlayIntroVideo: null });
            }, 500);
        }, 4000);
    },
}));
