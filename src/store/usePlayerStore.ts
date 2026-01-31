import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { getVideosForHome, getNewRandomVideo } from '@/lib/data';
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
    viewMode: 'diario' | 'tv';
    streamStatus: any;
    isPreRollOverlayActive: boolean;
    overlayIntroVideo: SlideMedia | null;

    // Refs equivalents (using state for common reactive values)
    playbackState: PlaybackSource;
    savedProgress: number;
    savedVideo: SlideMedia | null;
    savedVolume: number;
    lastKnownVolume: number;

    // Actions
    setViewMode: (mode: 'diario' | 'tv') => void;
    setIsPlaying: (isPlaying: boolean) => void;
    togglePlayPause: () => void;
    setStreamStatus: (status: any) => void;

    playMedia: (media: SlideMedia) => void;
    playSpecificVideo: (media: SlideMedia, currentVolume?: number, setVolume?: (v: number) => void) => void;
    playTemporaryVideo: (media: SlideMedia) => void;
    playLiveStream: (streamData: any) => void;
    playNextVideoInQueue: () => void;
    loadInitialPlaylist: (videoUrlToPlay: string | null) => Promise<void>;
    handleOnEnded: (setVolume?: (v: number) => void) => Promise<void>;
    resumeAfterSlide: () => void;
    saveCurrentProgress: (seconds: number, volume: number) => void;
    playRandomSequence: () => Promise<void>;

    startIntroHideTimer: () => void;

    // Helpers/Internals
    getRandomIntro: () => SlideMedia;
    fetchRandomDbVideo: (excludeId?: string, excludeCategory?: string) => Promise<SlideMedia | null>;
    preloadNextVideo: (currentId: string) => Promise<void>;
}

// Next intro video preloaded (outside of store for simplicity or could be inside)
let nextIntroVideo: SlideMedia | null = null;
let nextDataVideo: SlideMedia | null = null;

export const usePlayerStore = create<PlayerState>()(
    devtools(
        (set, get) => ({
            currentVideo: null,
            nextVideo: null,
            playlist: [],
            isPlaying: false,
            viewMode: 'diario',
            streamStatus: null,
            isPreRollOverlayActive: false,
            overlayIntroVideo: null,

            playbackState: 'INTRO',
            savedProgress: 0,
            savedVideo: null,
            savedVolume: 1,
            lastKnownVolume: 1,

            setViewMode: (mode) => set({ viewMode: mode }),
            setIsPlaying: (isPlaying) => set({ isPlaying }),
            togglePlayPause: () => set((state) => ({ isPlaying: !state.isPlaying })),
            setStreamStatus: (status) => set({ streamStatus: status }),

            getRandomIntro: () => {
                const generate = () => {
                    const randomIndex = Math.floor(Math.random() * INTRO_VIDEOS.length);
                    const url = INTRO_VIDEOS[randomIndex]; // No encodeURI to match PreloadIntros
                    return {
                        id: `intro-${url}`,
                        nombre: 'ESPACIO PUBLICITARIO',
                        url,
                        categoria: 'Institucional',
                        createdAt: new Date().toISOString(),
                        type: 'video' as const,
                        imagen: '',
                        novedad: false
                    };
                };

                if (nextIntroVideo) {
                    const intro = nextIntroVideo;
                    nextIntroVideo = generate();
                    return intro;
                } else {
                    const intro = generate();
                    nextIntroVideo = generate();
                    return intro;
                }
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

            playSpecificVideo: (media, currentVolume, setVolume) => {
                // Interrumpir noticias si están activas
                useNewsPlayerStore.getState().stopSlide();

                if (currentVolume !== undefined) set({ savedVolume: currentVolume });
                if (setVolume) setVolume(0.2);

                set({ playbackState: 'USER_SELECTED' });

                const introToPlay = get().getRandomIntro();
                set({
                    currentVideo: media,
                    isPlaying: true,
                    overlayIntroVideo: introToPlay,
                    isPreRollOverlayActive: true
                });

                // Disparar precarga del siguiente video para la barra de títulos
                get().preloadNextVideo(media.id);
            },

            playTemporaryVideo: (media) => {
                // Interrumpir noticias si están activas
                useNewsPlayerStore.getState().stopSlide();

                const { currentVideo, playbackState, getRandomIntro } = get();
                if (currentVideo && playbackState !== 'INTRO') {
                    set({ savedVideo: currentVideo });
                }

                const introToPlay = getRandomIntro();
                set({
                    currentVideo: media,
                    isPlaying: true,
                    overlayIntroVideo: introToPlay,
                    isPreRollOverlayActive: true,
                    playbackState: 'USER_SELECTED'
                });

                // Disparar precarga del siguiente video
                get().preloadNextVideo(media.id);
            },

            playLiveStream: (streamData) => {
                set({ currentVideo: streamData, isPlaying: true, playbackState: 'USER_SELECTED' });
            },

            saveCurrentProgress: (seconds, volume) => {
                set({ savedProgress: seconds, savedVolume: volume });
            },

            startIntroHideTimer: () => {
                // Limpiar cualquier temporizador previo
                if ((globalThis as any)._introTimer) clearTimeout((globalThis as any)._introTimer);
                if ((globalThis as any)._introFadeTimer) clearTimeout((globalThis as any)._introFadeTimer);

                // El usuario quiere 4 segundos exactos de intro.
                // 3500ms + 500ms de fade-out (CSS) = 4000ms total.
                (globalThis as any)._introTimer = setTimeout(() => {
                    (globalThis as any)._introFadeTimer = setTimeout(() => {
                        set({ isPreRollOverlayActive: false, overlayIntroVideo: null });
                    }, 500);
                }, 3500);
            },

            loadInitialPlaylist: async (videoUrlToPlay) => {
                console.log('PlayerStore: Iniciando secuencia...');

                if (videoUrlToPlay) {
                    const { allVideos } = await getVideosForHome(10);
                    const requested = allVideos.find(v => v.url === videoUrlToPlay);
                    if (requested) {
                        const intro = get().getRandomIntro();
                        set({ currentVideo: requested, isPlaying: true, overlayIntroVideo: intro, isPreRollOverlayActive: true });
                        get().preloadNextVideo(requested.id);
                        return;
                    }
                }

                const randomDbVideo = await get().fetchRandomDbVideo();
                const isYouTube = randomDbVideo?.url.includes('youtu.be/') || randomDbVideo?.url.includes('youtube.com/');

                if (randomDbVideo) {
                    const intro = get().getRandomIntro();
                    set({ currentVideo: randomDbVideo, isPlaying: true, overlayIntroVideo: intro, isPreRollOverlayActive: true });
                    get().preloadNextVideo(randomDbVideo.id);
                } else {
                    const intro = get().getRandomIntro();
                    set({ playbackState: 'INTRO', currentVideo: intro, isPlaying: true });
                }
            },

            handleOnEnded: async (setVolume) => {
                const { playbackState, currentVideo, lastKnownVolume, savedVolume } = get();
                const isYouTubeVideo = (url: string) => url.includes('youtu.be/') || url.includes('youtube.com/');

                if (playbackState === 'INTRO') {
                    // Si venimos de una INTRO local (4s), elegimos video de DB
                    let nextV = nextDataVideo || await get().fetchRandomDbVideo(currentVideo?.id, currentVideo?.categoria);

                    if (nextV) {
                        if (isYouTubeVideo(nextV.url)) {
                            // REGLA: Después de un video intro nunca reproducir otro video intro.
                            // Como YA estamos en playbackState === 'INTRO', NO disparamos overlayIntroVideo.
                            set({ currentVideo: nextV, isPlaying: true, isPreRollOverlayActive: false, overlayIntroVideo: null });
                        } else {
                            set({ playbackState: 'DB_RANDOM', currentVideo: nextV, isPlaying: true });
                        }
                    } else {
                        // Si no hay nada mas, volvemos a una intro (para no quedar en negro)
                        set({ currentVideo: get().getRandomIntro(), isPlaying: true });
                    }
                } else {
                    // Si terminó un video normal
                    if (playbackState === 'DB_RANDOM' && setVolume) {
                        setVolume(lastKnownVolume);
                    } else if (playbackState === 'USER_SELECTED' && setVolume) {
                        setVolume(savedVolume);
                    }

                    // Buscar próximo video de categoría diferente
                    let nextV = nextDataVideo || await get().fetchRandomDbVideo(currentVideo?.id, currentVideo?.categoria);

                    if (nextV && isYouTubeVideo(nextV.url)) {
                        // Si es YouTube y NO venimos de intro, ponemos intro overlay
                        const intro = get().getRandomIntro();
                        set({ currentVideo: nextV, isPlaying: true, overlayIntroVideo: intro, isPreRollOverlayActive: true });
                    } else if (nextV) {
                        set({ playbackState: 'DB_RANDOM', currentVideo: nextV, isPlaying: true });
                    } else {
                        // Fallback a intro local por defecto
                        set({ playbackState: 'INTRO', currentVideo: get().getRandomIntro(), isPlaying: true });
                    }
                }

                // Marcar que un video ya está asignado para evitar precargas duplicadas inmediatas
                nextDataVideo = null;
                // Disparar precarga del próximo-próximo video
                if (get().currentVideo) {
                    get().preloadNextVideo(get().currentVideo!.id);
                }
            },

            playNextVideoInQueue: () => {
                const { handleOnEnded } = get();
                // No pasamos setVolume aquí porque playNext controlado por usuario no debería bajar el volumen brusco? 
                // Usamos la lógica de handleOnEnded
                handleOnEnded();
            },

            resumeAfterSlide: () => {
                const { savedVideo, savedProgress } = get();
                if (savedVideo) {
                    const videoToResume = { ...savedVideo, startAt: savedProgress };
                    set({ playbackState: 'RESUMING', currentVideo: videoToResume as any, isPlaying: true });
                } else {
                    // Fallback if no saved video
                }
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
                const intro = get().getRandomIntro();
                // Seteamos el estado a INTRO para que handleOnEnded sepa qué hacer después
                set({
                    playbackState: 'INTRO',
                    currentVideo: intro,
                    isPlaying: true,
                    isPreRollOverlayActive: false,
                    overlayIntroVideo: null
                });

                // Preparamos el siguiente video de fondo (diferente categoría si es posible)
                const nextV = await get().fetchRandomDbVideo(undefined, intro.categoria);
                if (nextV) {
                    nextDataVideo = nextV;
                    set({ nextVideo: nextV });
                }
            }
        }),
        { name: 'PlayerStore' }
    )
);
