'use client';

// @ts-nocheck
import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { getVideosForHome, getNewRandomVideo } from '@/lib/data';
import { Video } from '@/lib/types'; // Import Video type

interface MediaPlayerContextType {
  currentVideo: Video | null;
  nextVideo: Video | null;
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  seekToFraction: number | null;
  isFirstMedia: boolean;
  randomVideoQueued: boolean;
  playMedia: (media: Video, isFirst?: boolean) => void;
  playSpecificVideo: (media: Video) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  togglePlayPause: () => void;
  setIsMuted: (isMuted: boolean) => void;
  toggleMute: () => void;
  unmute: () => void;
  setVolume: (volume: number) => void;
  handleVolumeChange: (volume: number) => void;
  setSeekToFraction: (fraction: number | null) => void;
  loadInitialPlaylist: (videoUrlToPlay: string | null) => Promise<void>;
  handleOnEnded: () => void;
  handleOnProgress: (progress: any) => void;
  playNextVideoInQueue: () => void;
  removeNextVideoFromQueue: () => void;
}

const MediaPlayerContext = createContext<MediaPlayerContextType | undefined>(undefined);

export const useMediaPlayer = () => {
  const context = useContext(MediaPlayerContext);
  if (!context) {
    throw new Error('useMediaPlayer must be used within a MediaPlayerProvider');
  }
  return context;
};

const useFader = (initialVolume = 1.0) => {
  const [volume, setVolume] = useState(initialVolume);
  const animationFrameRef = useRef<number>();

  const ramp = useCallback((targetVolume: number, duration: number, onComplete?: () => void) => {
    console.log(`--- RAMP called: targetVolume=${targetVolume}, duration=${duration} ---`);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    const startVolume = volume;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      let newVolume = startVolume + (targetVolume - startVolume) * progress;
      newVolume = Math.max(0, Math.min(1, newVolume)); // Clamp volume between 0 and 1
      setVolume(newVolume);
      console.log(`RAMP: current volume = ${newVolume}`); // Log volume during ramp

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        if (onComplete) onComplete();
      }
    };
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [setVolume]);

  return { volume, setVolume, ramp };
};

export const MediaPlayerProvider = ({ children }) => {

  // Estados del reproductor
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [nextVideo, setNextVideo] = useState<Video | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Empezar en mute para autoplay
  const [seekToFraction, setSeekToFraction] = useState<number | null>(null);
  
  // Estados de la lógica de playlist
  const [allVideos, setAllVideos] = useState([]);
  const [lastVolume, setLastVolume] = useState(0.03); // Volumen por defecto
  const [isFirstMedia, setIsFirstMedia] = useState(true);
  const [isUserSelected, setIsUserSelected] = useState(false); // Nuevo estado
  const [randomVideoQueued, setRandomVideoQueued] = useState(false); // Nuevo estado para la cola automática

  // Hook para el fader de volumen
  const { volume, setVolume, ramp } = useFader(0.03);
  const userVolume = useRef(0.03);

  // --- FUNCIONES DE CONTROL DEL REPRODUCTOR ---
  const playMedia = useCallback((media, isFirst = false) => {
    setCurrentVideo(media);
    setIsPlaying(true);
    setIsFirstMedia(isFirst);
    setNextVideo(null); // Clear next video when a new video starts playing
    setRandomVideoQueued(false); // Reset random video queued state
    if (isFirst) {
      setIsMuted(true); // El primer video siempre en mute
    } else {
      setIsMuted(false);
      ramp(userVolume.current, 500); // Fade in al volumen del usuario
    }
  }, [ramp, userVolume]);

  const playSpecificVideo = useCallback((media: Video) => {
    if (currentVideo) {
      // If a video is already playing, add the new video to the queue
      setNextVideo(media);
      setIsUserSelected(true); // Mark as user selected
      setRandomVideoQueued(false); // Reset random video queued state
    } else {
      // If nothing is playing, play it immediately
      setCurrentVideo(media);
      setIsPlaying(true);
      setIsUserSelected(true); // Mark as user selected
      setIsMuted(false);
      ramp(0.05, 500); // Iniciar a 5% de volumen
    }
  }, [currentVideo, ramp]);

  // --- FUNCIONES DE CONTROL DE PLAYLIST ---
  // Carga la playlist inicial y reproduce el primer video
  const loadInitialPlaylist = useCallback(async (videoUrlToPlay: string | null) => {
    console.log('loadInitialPlaylist called.');
    const { allVideos: fetchedVideos } = await getVideosForHome(100);
    if (fetchedVideos && fetchedVideos.length > 0) {
      setAllVideos(fetchedVideos);
      let videoToPlay = fetchedVideos[0]; // Por defecto, el primer video (que ya viene aleatorio)
      if (videoUrlToPlay) {
        const specificVideo = fetchedVideos.find(v => v.url === videoUrlToPlay);
        if (specificVideo) {
          videoToPlay = specificVideo;
        }
      }
      console.log('loadInitialPlaylist: videoToPlay', videoToPlay);
      playMedia(videoToPlay, true); // Reproducir el video correspondiente
    }
  }, [playMedia]);

  // Reproduce el siguiente video aleatorio
  const playNextRandomVideo = useCallback(async () => {
    console.log('playNextRandomVideo called. currentVideo.id:', currentVideo?.id);
    const nextVideo = await getNewRandomVideo(currentVideo?.id);
    if (nextVideo) {
      console.log('Next random video found:', nextVideo.nombre, 'Applying lastVolume:', lastVolume);
      // Restaura el último volumen conocido antes de reproducir
      setVolume(lastVolume);
      setIsMuted(false); // Quitar el mute para el siguiente video
      playMedia(nextVideo, false);
    } else {
      console.log('No next random video found. Attempting to reload initial playlist.');
      // Si no se encuentra un video aleatorio, intentar recargar la playlist inicial
      await loadInitialPlaylist(null); // Recargar la playlist y reproducir el primer video
    }
  }, [currentVideo, lastVolume, playMedia, setVolume, loadInitialPlaylist]);

  // Callback que se ejecuta cuando un video termina
  const handleOnEnded = useCallback(() => {
    console.log('handleOnEnded called. isUserSelected:', isUserSelected, 'nextVideo:', nextVideo);
    if (isUserSelected) {
      setIsUserSelected(false); // Resetear el flag
    }

    if (nextVideo) {
      // Play the next video in the queue
      playMedia(nextVideo, false);
      setNextVideo(null); // Clear the next video after playing
    } else {
      // If no next video, revert to random autoplay
      playNextRandomVideo();
    }
  }, [isUserSelected, nextVideo, playMedia, playNextRandomVideo]);

  // Callback que se ejecuta durante la reproducción para guardar el volumen
  const handleOnProgress = useCallback(async (progress) => {
    const duration = currentVideo?.duration || progress.loadedSeconds; // Aprox
    if (duration && duration - progress.playedSeconds < 10) {
      console.log('handleOnProgress: Less than 10 seconds remaining. Saving volume:', volume);
      // Guardamos el volumen actual para restaurarlo después
      setLastVolume(volume);
    }

    // Lógica para precargar el próximo video aleatorio
    if (currentVideo && !nextVideo && !randomVideoQueued && duration && (duration - progress.playedSeconds < 40)) {
      console.log('handleOnProgress: Less than 40 seconds remaining, queuing random video.');
      const newRandomVideo = await getNewRandomVideo(currentVideo.id);
      if (newRandomVideo) {
        setNextVideo(newRandomVideo);
        setRandomVideoQueued(true);
      }
    }
  }, [volume, currentVideo, nextVideo, randomVideoQueued]);

  const togglePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const unmute = useCallback(() => {
    setIsMuted(false);
    ramp(userVolume.current, 500);
  }, [ramp, userVolume]);

  const toggleMute = useCallback(() => {
    setIsMuted(prevIsMuted => {
        const newMutedState = !prevIsMuted;
        if (newMutedState) {
            ramp(0, 500);
        } else {
            ramp(userVolume.current, 500);
        }
        return newMutedState;
    });
  }, [ramp, userVolume]);

  const handleVolumeChange = useCallback((v: number) => {
    const newVolume = v / 100;
    userVolume.current = newVolume;
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
        setIsMuted(false);
    } else if (newVolume === 0 && !isMuted) {
        setIsMuted(true);
    }
  }, [setVolume, isMuted]);

  const playNextVideoInQueue = useCallback(() => {
    if (nextVideo) {
      playMedia(nextVideo, false);
      setNextVideo(null);
    } else {
      playNextRandomVideo();
    }
  }, [nextVideo, playMedia, playNextRandomVideo]);

  const removeNextVideoFromQueue = useCallback(() => {
    setNextVideo(null);
  }, []);

  // Valor que se pasa al contexto
  const value = {
    // Estados
    currentVideo,
    nextVideo,
    isPlaying,
    isMuted,
    volume,
    seekToFraction,
    isFirstMedia,
    
    // Setters y Controladores
    playMedia,
    playSpecificVideo, // Exportar la nueva función
    setIsPlaying,
    togglePlayPause,
    setIsMuted,
    toggleMute,
    unmute,
    setVolume,
    handleVolumeChange,
    setSeekToFraction,
    
    // Lógica de Playlist
    loadInitialPlaylist,
    handleOnEnded,
    handleOnProgress,
    playNextVideoInQueue,
    removeNextVideoFromQueue,
  };

  return (
    <MediaPlayerContext.Provider value={value}>
      {children}
    </MediaPlayerContext.Provider>
  );
};
