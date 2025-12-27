'use client';

// --- ARREGLO: Eliminado 'useRef' de esta línea ---
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'; 
import { getVideosForHome, getNewRandomVideo } from '@/lib/data';
import { SlideMedia } from '@/lib/types';
import { useVolume } from './VolumeContext';

// Exportamos 'ProgressState' para que VideoSection pueda usarlo
export interface ProgressState {
  played: number;
  playedSeconds: number;
  loaded: number;
  loadedSeconds: number;
}

interface MediaPlayerContextType {
  currentVideo: SlideMedia | null;
  nextVideo: SlideMedia | null;
  isPlaying: boolean;
  seekToFraction: number | null;
  isFirstMedia: boolean;
  randomVideoQueued: boolean;
  streamStatus: { liveStreamUrl: string; isLive: boolean; } | null; 
  viewMode: 'diario' | 'tv';
  setViewMode: (mode: 'diario' | 'tv') => void;
  playMedia: (media: SlideMedia, isFirst?: boolean) => void;
  playSpecificVideo: (media: SlideMedia) => void;
  playTemporaryVideo: (media: SlideMedia) => void;
  playLiveStream: (status: { liveStreamUrl: string; isLive: boolean; }) => void; 
  setIsPlaying: (isPlaying: boolean) => void;
  togglePlayPause: () => void;
  setSeekToFraction: (fraction: number | null) => void;
  loadInitialPlaylist: (videoUrlToPlay: string | null) => Promise<void>;
  handleOnEnded: () => void;
  handleOnProgress: (progress: ProgressState, currentVideoId: string | undefined, currentVideoCategory: string | undefined) => void;
  playNextVideoInQueue: () => void;
  removeNextVideoFromQueue: () => void;
  pause: () => void;
  play: () => void;
}

const MediaPlayerContext = createContext<MediaPlayerContextType | undefined>(undefined);

export const useMediaPlayer = () => {
  const context = useContext(MediaPlayerContext);
  if (!context) {
    throw new Error('useMediaPlayer must be used within a MediaPlayerProvider');
  }
  return context;
};

export const MediaPlayerProvider = ({ children }: { children: React.ReactNode }) => {

  const [viewMode, _setViewMode] = useState<'diario' | 'tv'>('diario');

    const setViewMode = useCallback((mode: 'diario' | 'tv') => {

      console.log(`[MediaPlayerContext] Cambiando viewMode a: ${mode}`);

      _setViewMode(mode);

    }, []);

  

    const [currentVideo, setCurrentVideo] = useState<SlideMedia | null>(null);
    const [interruptedVideo, setInterruptedVideo] = useState<SlideMedia | null>(null);

    const [nextVideo, setNextVideo] = useState<SlideMedia | null>(null);

    const [isPlaying, setIsPlaying] = useState(false);

    const [seekToFraction, setSeekToFraction] = useState<number | null>(null);

    

    const [isFirstMedia, setIsFirstMedia] = useState(true);

    const [isUserSelected, setIsUserSelected] = useState(false);

    const [randomVideoQueued, setRandomVideoQueued] = useState(false);

    

    const [streamStatus] = useState<{ liveStreamUrl: string; isLive: boolean; } | null>({ liveStreamUrl: 'https://www.youtube.com/watch?v=pand8Im1jag', isLive: true });

  

    const { setVolume } = useVolume(); 

    // 'useRef' para 'userVolume' ha sido eliminado
  
    const pause = useCallback(() => setIsPlaying(false), []);
    const play = useCallback(() => setIsPlaying(true), []);

    const playMedia = useCallback((media: SlideMedia, isFirst = false) => {

      setCurrentVideo(media);

      setIsPlaying(true);

      setIsFirstMedia(isFirst);

      setNextVideo(null);

      setRandomVideoQueued(false);

      

      if (isFirst) {

         setVolume(0);

      }

      

    }, [setVolume]);

    const playTemporaryVideo = useCallback((media: SlideMedia) => {
      // Validation check: Allow media with a video URL OR with both image and audio URLs.
      const isValidMediaSource = media.url || ((media as any).imageUrl && (media as any).audio_url) || (media.imageSourceUrl && media.audioSourceUrl);
      if (!isValidMediaSource) {
        console.warn("Play bloqueado: Faltan datos de URL de video o de imagen/audio.", media);
        return;
      }
      console.log("Iniciando reproducción de:", media);

      if (currentVideo) {
        setInterruptedVideo(currentVideo);
      }
      setCurrentVideo(media);
      setIsPlaying(true);
    }, [currentVideo]);
  

        const playSpecificVideo = useCallback((media: SlideMedia) => {

  

          // Si estamos en modo TV, siempre reproducir el video inmediatamente

  

          if (viewMode === 'tv') {

  

            playMedia(media, false); // Reproducir directamente, no como "primer video"

  

            setIsUserSelected(true);

  

          } else {

  

            // Lógica existente para el modo diario (playlist)

  

            if (currentVideo) {

  

              setNextVideo(media);

  

              setIsUserSelected(true);

  

              setRandomVideoQueued(false);

  

            } else {

  

              setCurrentVideo(media);

  

              setIsPlaying(true);

  

              setIsUserSelected(true);

  

            }

  

          }

  

        }, [currentVideo, viewMode, playMedia]);

  

        const playLiveStream = useCallback((status: { liveStreamUrl: string; isLive: boolean; }) => {

  

          if (status && status.isLive) {

  

            const liveVideo: SlideMedia = { id: 'live-stream', nombre: 'TRANSMISIÓN EN VIVO', url: status.liveStreamUrl, createdAt: new Date().toISOString(), categoria: 'En Vivo', imagen: '/PARCHE.png', novedad: true, type: 'stream', };

  

            playMedia(liveVideo, false);

  

          }

  

        }, [playMedia]);

  

        const loadInitialPlaylist = useCallback(async (videoUrlToPlay: string | null) => {

  

          const { allVideos: fetchedVideos } = await getVideosForHome(100);

  

          if (fetchedVideos && fetchedVideos.length > 0) {

  

            let videoToPlay: SlideMedia; // Change from Video to SlideMedia

  

            if (videoUrlToPlay) {

  

              const specificVideo = fetchedVideos.find(v => v.url === videoUrlToPlay);

  

              videoToPlay = specificVideo || fetchedVideos[0];

  

            } else {

  

              const randomIndex = Math.floor(Math.random() * fetchedVideos.length);

  

              videoToPlay = fetchedVideos[randomIndex];

  

            }

  

            playMedia(videoToPlay, true);

  

            setIsPlaying(true); // Aseguramos que el autoplay esté activado para el primer video.

  

          }

  

        }, [playMedia, setIsPlaying]);

  

        const playNextRandomVideo = useCallback(async (currentVideoId?: string, currentVideoCategory?: string) => {

  

          const nextVideo: SlideMedia | null = await getNewRandomVideo(currentVideoId, currentVideoCategory);

  

          if (nextVideo) {

        playMedia(nextVideo, false);

      } else {

        await loadInitialPlaylist(null);

      }

    }, [playMedia, loadInitialPlaylist]);

  

        const handleOnEnded = useCallback(() => {

          if (interruptedVideo) {
            setCurrentVideo(interruptedVideo);
            setInterruptedVideo(null);
            setIsPlaying(true);
            return;
          }
  
          if (viewMode === 'tv') { // Lógica específica del modo TV

  

            playNextRandomVideo(currentVideo?.id, currentVideo?.categoria);

  

          } else { // Lógica del modo diario

  

            if (isUserSelected) {

  

              setIsUserSelected(false);

  

            }

  

            if (nextVideo) {

  

              playMedia(nextVideo, false);

  

              setNextVideo(null);

  

            } else {

  

              playNextRandomVideo(currentVideo?.id, currentVideo?.categoria);

  

            }

  

          }

  

        }, [viewMode, isUserSelected, nextVideo, playMedia, playNextRandomVideo, currentVideo, interruptedVideo]);

  

        const handleOnProgress = useCallback(async (progress: ProgressState, currentVideoId: string | undefined, currentVideoCategory: string | undefined) => {

  

          if (viewMode === 'tv') { // Desactivar la precarga en modo TV

  

            return;

  

          }

  

          

  

          const duration = progress.loadedSeconds;

  

      

  

          if (currentVideoId && !nextVideo && !randomVideoQueued && duration && (duration - progress.playedSeconds < 40)) {

  

            setRandomVideoQueued(true); 

  

            const newRandomVideo = await getNewRandomVideo(currentVideoId, currentVideoCategory);

  

            if (newRandomVideo) {

  

              setNextVideo(newRandomVideo);

  

            } else {

  

              setRandomVideoQueued(false);

  

            }

  

          }

  

        }, [viewMode, nextVideo, randomVideoQueued]);

  

    const togglePlayPause = useCallback(() => {

      setIsPlaying(prev => !prev);

    }, []);

  

    const playNextVideoInQueue = useCallback(() => {

      if (nextVideo) {

        playMedia(nextVideo, false);

        setNextVideo(null);

      }

      else {

        playNextRandomVideo(currentVideo?.id, currentVideo?.categoria);

      }

    }, [nextVideo, playMedia, playNextRandomVideo, currentVideo]);

  

    const removeNextVideoFromQueue = useCallback(() => {

      setNextVideo(null);

    }, []);

  

    const value = useMemo(() => ({

      currentVideo,

      nextVideo,

      isPlaying,

      seekToFraction,

      isFirstMedia,

      randomVideoQueued,

      streamStatus, 

      viewMode,

      setViewMode,

            playMedia,

            playSpecificVideo,

            playTemporaryVideo,

            playLiveStream, 

            setIsPlaying,

      togglePlayPause,

      setSeekToFraction,

      loadInitialPlaylist,

      handleOnEnded,

      handleOnProgress,

      playNextVideoInQueue,

      removeNextVideoFromQueue,
      pause,
      play,
    }), [

      currentVideo,

      nextVideo,

      isPlaying,

      seekToFraction,

      isFirstMedia,

      randomVideoQueued,

      streamStatus,

      viewMode,

            setViewMode,

            playMedia,

            playSpecificVideo,

            playTemporaryVideo,

            playLiveStream,

            togglePlayPause,

      setSeekToFraction,

      loadInitialPlaylist,

      handleOnEnded,

      handleOnProgress,

      playNextVideoInQueue,

      removeNextVideoFromQueue,
      pause,
      play,
    ]);

  return (
    <MediaPlayerContext.Provider value={value}>
      {children}
    </MediaPlayerContext.Provider>
  );
};