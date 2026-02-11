import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { getVideosForHome, getNewRandomVideo, getVideoByUrl } from '@/lib/data';
import { SlideMedia } from '@/lib/types';

import { useNewsPlayerStore } from './useNewsPlayerStore';

const INTRO_VIDEOS = [
    '/videos_intro/intro1.mp4',
    '/videos_intro/intro2.mp4',
    '/videos_intro/intro3.mp4',
    '/videos_intro/intro4.mp4',
    '/videos_intro/intro5.mp4',
];

type PlaybackSource = 'INTRO' | 'DB_RANDOM' | 'USER_SELECTED' | 'RESUMING';

interface PlayerState {
    currentVideo: SlideMedia | null;
    nextVideo: SlideMedia | null;
    playlist: SlideMedia[];
    isPlaying: boolean;
    viewMode: 'tv' | 'diario';
    streamStatus: any;

    // Zero-Branding States
    isPreRollOverlayActive: boolean; // True when Intro is playing
    overlayIntroVideo: SlideMedia | null;
    isContentPlaying: boolean; // True when YouTube/Content underlying layer is playing

    // Slots Management (Smart Slots v18.0)
    activeSlot: 'A' | 'B';
    slotAContent: SlideMedia | null;
    slotBContent: SlideMedia | null;

    // Refs equivalents
    playbackState: PlaybackSource;
    savedProgress: number;
    savedVideo: SlideMedia | null;
    savedVolume: number;
    lastKnownVolume: number;
    historyVolume: number; // Volume captured 10s before end of previous video

    // Actions
    setViewMode: (mode: 'tv' | 'diario') => void;
    setIsPlaying: (isPlaying: boolean) => void;
    togglePlayPause: () => void;
    setStreamStatus: (status: any) => void;

    playMedia: (media: SlideMedia) => void;
    playSpecificVideo: (media: SlideMedia, currentVolume?: number, setVolume?: (v: number) => void) => void;
    playTemporaryVideo: (media: SlideMedia) => void;
    playLiveStream: (streamData: any) => void;
    playNextVideoInQueue: () => void;
    loadInitialPlaylist: (videoUrlToPlay: string | null) => Promise<void>;
    handleOnEnded: (setVolume?: (v: number) => void, getCurrentVolume?: () => number) => Promise<void>;

    // Resume Logic for Slides
    pauseForSlide: (currentTime?: number) => void;
    resumeAfterSlide: () => void;

    saveCurrentProgress: (seconds: number, volume: number) => void;
    playRandomSequence: () => Promise<void>;

    startIntroHideTimer: () => void;

    // Helpers
    getRandomIntro: () => SlideMedia;
    fetchRandomDbVideo: (excludeId?: string, excludeCategory?: string) => Promise<SlideMedia | null>;
    preloadNextVideo: (currentId: string) => Promise<void>;
    finishIntro: () => void;
    startContentPlayback: () => void; // Restoring missing action
}

// Next intro video preloaded
let nextDataVideo: SlideMedia | null = null;

export const usePlayerStore = create<PlayerState>()(
    devtools(
        (set, get) => ({
            currentVideo: null,
            nextVideo: null,
            playlist: [],
            isPlaying: false,
            viewMode: 'tv',
            streamStatus: null,
            isPreRollOverlayActive: false,
            overlayIntroVideo: null,
            isContentPlaying: false,
            activeSlot: 'A',
            slotAContent: null,
            slotBContent: null,

            playbackState: 'INTRO',
            savedProgress: 0,
            savedVideo: null,
            savedVolume: 1,
            lastKnownVolume: 1,
            historyVolume: 1,

            setViewMode: (mode: 'tv' | 'diario') => set({ viewMode: mode }),
            setIsPlaying: (isPlayingState: boolean) => set({ isPlaying: isPlayingState }),

            togglePlayPause: () => set((state) => ({ isPlaying: !state.isPlaying })),
            setStreamStatus: (status) => set({ streamStatus: status }),

            getRandomIntro: () => {
                const generate = () => {
                    const randomIndex = Math.floor(Math.random() * INTRO_VIDEOS.length);
                    const url = INTRO_VIDEOS[randomIndex];
                    return {
                        id: `intro-${url}-${Date.now()}`, // Unique ID to force re-render/logic if needed, though we recycle node
                        nombre: 'ESPACIO PUBLICITARIO',
                        url,
                        categoria: 'Institucional',
                        createdAt: new Date().toISOString(),
                        type: 'video' as const,
                        imagen: '',
                        novedad: false
                    };
                };
                return generate();
            },

            fetchRandomDbVideo: async (excludeId, excludeCategory) => {
                try {
                    return await getNewRandomVideo(excludeId, excludeCategory);
                } catch (error) {
                    console.error("Error fetching DB video:", error);
                    return null;
                }
            },

            playMedia: (media) => set({ currentVideo: media, isPlaying: true }),

            // User clicks a video in carousel
            playSpecificVideo: (media, currentVolume, setVolume) => {
                // 500ms Rule (Interaction Stability v23.2)
                // Stop News Slide if active
                useNewsPlayerStore.getState().stopSlide();

                if (currentVolume !== undefined) set({ savedVolume: currentVolume });

                // Rule: Start at 20% volume for user selection
                if (setVolume) setVolume(0.2);

                set({ playbackState: 'USER_SELECTED', isPlaying: true });

                const introToPlay = get().getRandomIntro();

                // Phase 1: Cover First (Safety Delay v23.0)
                set({
                    overlayIntroVideo: introToPlay,
                    isPreRollOverlayActive: true,
                });

                // Phase 2: Swap Subjacent Content after 800ms
                setTimeout(() => {
                    const currentActive = get().activeSlot;
                    const nextSlot = currentActive === 'A' ? 'B' : 'A';

                    set({
                        [nextSlot === 'A' ? 'slotAContent' : 'slotBContent']: media,
                        activeSlot: nextSlot,
                        currentVideo: media,
                        isContentPlaying: false, // Ensure it's ready but hidden
                    });

                    get().preloadNextVideo(media.id);
                }, 800);
            },

            playTemporaryVideo: (media) => {
                useNewsPlayerStore.getState().stopSlide();
                const { currentVideo, playbackState, getRandomIntro } = get();

                if (currentVideo && playbackState !== 'INTRO') {
                    set({ savedVideo: currentVideo, savedProgress: get().savedProgress });
                }

                set({ isPlaying: true, playbackState: 'USER_SELECTED' });

                const introToPlay = getRandomIntro();

                // Phase 1: Cover
                set({
                    overlayIntroVideo: introToPlay,
                    isPreRollOverlayActive: true,
                });

                // Phase 2: Swap after Safety Delay
                setTimeout(() => {
                    const currentActive = get().activeSlot;
                    const nextSlot = currentActive === 'A' ? 'B' : 'A';

                    set({
                        [nextSlot === 'A' ? 'slotAContent' : 'slotBContent']: media,
                        activeSlot: nextSlot,
                        currentVideo: media,
                        isContentPlaying: false,
                    });

                    get().preloadNextVideo(media.id);
                }, 800);
            },

            playLiveStream: (streamData) => {
                set({ currentVideo: streamData, isPlaying: true, playbackState: 'USER_SELECTED' });
            },

            saveCurrentProgress: (seconds, volume) => {
                // 10s Lookback Volume Persistence Logic
                // We don't have duration here easily without passing it, but VideoPlayer calls this.
                // Better approach: handleOnEnded calculates it if we track history.
                // Simplified: Just allow set/get of historyVolume. 
                // We'll update savedVolume constantly.
                set({ savedProgress: seconds, savedVolume: volume });
            },


            loadInitialPlaylist: async (videoUrlToPlay) => {
                console.log('PlayerStore: Initializing Zero-Branding Sequence...');
                const intro = get().getRandomIntro();
                set({ isPlaying: true });

                if (videoUrlToPlay) {
                    // Deep Linking Logic
                    let requested = (await getVideosForHome(10)).allVideos.find(v => v.url === videoUrlToPlay) as SlideMedia | null | undefined;
                    if (!requested) requested = await getVideoByUrl(videoUrlToPlay);

                    if (requested) {
                        set({
                            overlayIntroVideo: intro,
                            isPreRollOverlayActive: true,
                            isContentPlaying: false,
                            playbackState: 'USER_SELECTED'
                        });

                        setTimeout(() => {
                            set({
                                slotAContent: requested,
                                activeSlot: 'A',
                                currentVideo: requested,
                            });
                            get().preloadNextVideo(requested!.id);
                        }, 800);
                        return;
                    }
                }

                // Random Start
                const randomDbVideo = await get().fetchRandomDbVideo();
                if (randomDbVideo) {
                    set({
                        overlayIntroVideo: intro,
                        isPreRollOverlayActive: true,
                        isContentPlaying: false,
                        playbackState: 'DB_RANDOM'
                    });

                    setTimeout(() => {
                        set({
                            slotAContent: randomDbVideo,
                            activeSlot: 'A',
                            currentVideo: randomDbVideo,
                        });
                        get().preloadNextVideo(randomDbVideo.id);
                    }, 800);
                }
            },

            handleOnEnded: async (setVolume) => {
                const { savedVolume, currentVideo } = get();
                set({ historyVolume: savedVolume });

                const intro = get().getRandomIntro();
                set({ isPlaying: true });

                // 1. Cover Immediately
                set({
                    overlayIntroVideo: intro,
                    isPreRollOverlayActive: true,
                    isContentPlaying: false
                });

                // 2. Fetch Next Video
                let nextV = nextDataVideo || await get().fetchRandomDbVideo(currentVideo?.id, currentVideo?.categoria);
                if (!nextV) nextV = await get().fetchRandomDbVideo();

                if (nextV) {
                    // 3. Swap after Safety Delay
                    setTimeout(() => {
                        const currentActive = get().activeSlot;
                        const nextSlot = currentActive === 'A' ? 'B' : 'A';

                        set({
                            [nextSlot === 'A' ? 'slotAContent' : 'slotBContent']: nextV,
                            activeSlot: nextSlot,
                            currentVideo: nextV,
                            playbackState: 'DB_RANDOM'
                        });

                        if (setVolume) setVolume(savedVolume);

                        nextDataVideo = null;
                        get().preloadNextVideo(nextV!.id);
                    }, 800);
                }
            },

            pauseForSlide: (currentTime) => {
                const { currentVideo, savedProgress } = get();
                if (currentVideo) {
                    set({
                        savedVideo: currentVideo,
                        savedProgress: currentTime || savedProgress,
                        isPlaying: false,
                        isContentPlaying: false
                    });
                }
            },

            resumeAfterSlide: () => {
                const { savedVideo, savedProgress, getRandomIntro } = get();
                if (savedVideo) {
                    const intro = getRandomIntro();
                    const videoWithStart = { ...savedVideo, startAt: savedProgress };

                    set({
                        currentVideo: videoWithStart as any,
                        isPlaying: true,
                        overlayIntroVideo: intro,
                        isPreRollOverlayActive: true,
                        isContentPlaying: false,
                        savedVideo: null // Limpiar después de usar
                    });
                } else {
                    get().playRandomSequence();
                }
            },

            playNextVideoInQueue: async () => {
                // Triggered by "Next" button usually
                // Use handleOnEnded logic essentially
                get().handleOnEnded();
            },


            preloadNextVideo: async (currentId) => {
                const { currentVideo } = get();
                const video = await get().fetchRandomDbVideo(currentId, currentVideo?.categoria);
                if (video) {
                    nextDataVideo = video;
                    set({ nextVideo: video });
                }
            },

            playRandomSequence: async () => {
                // Re-start loop
                get().handleOnEnded();
            },

            finishIntro: () => {
                set({
                    isPreRollOverlayActive: false,
                    overlayIntroVideo: null,
                    isContentPlaying: true
                });
            },

            startContentPlayback: () => {
                set({ isContentPlaying: true });
            }
        }),
        { name: 'PlayerStore' }
    )
);
