'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'; 
import { getVideosForHome, getNewRandomVideo } from '@/lib/data';
import { SlideMedia } from '@/lib/types';
// Importamos el contexto de volumen para controlar el nivel de audio
import { useVolume } from '@/context/VolumeContext';

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
  handleOnProgress: (progress: ProgressState) => void;
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
  const { unmute } = useVolume();

  const [viewMode, _setViewMode] = useState<'diario' | 'tv'>('diario');
  
  const setViewMode = useCallback((mode: 'diario' | 'tv') => {
      _setViewMode(mode);
  }, []);

  const [currentVideo, setCurrentVideo] = useState<SlideMedia | null>(null);
  const [interruptedVideo, setInterruptedVideo] = useState<SlideMedia | null>(null);
  const [nextVideo, setNextVideo] = useState<SlideMedia | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [seekToFraction, setSeekToFraction] = useState<number | null>(null);
  const [isFirstMedia, setIsFirstMedia] = useState(true);
  const [isUserSelected, setIsUserSelected] = useState(false);
  const [randomVideoQueued, setRandomVideoQueued] = useState(false);
  
  const [streamStatus] = useState<{ liveStreamUrl: string; isLive: boolean; } | null>({ liveStreamUrl: 'https://www.youtube.com/watch?v=pand8Im1jag', isLive: true });

  const pause = useCallback(() => setIsPlaying(false), []);
  const play = useCallback(() => setIsPlaying(true), []);

  const playMedia = useCallback((media: SlideMedia, isFirst = false) => {
      setCurrentVideo(media);
      // setIsPlaying is now handled by an effect
      setIsFirstMedia(isFirst);
      setNextVideo(null);
      setRandomVideoQueued(false);
  }, []);

  // Effect to start playback when a new video is set.
  useEffect(() => {
    if (currentVideo) {
      setIsPlaying(true);
    }
  }, [currentVideo]);

  const playTemporaryVideo = useCallback(async (media: SlideMedia) => {
      if (interruptedVideo) return;
      const wasPlaying = isPlaying;
      pause();
      try {
        let finalMediaData = { ...media };
        if (media.url && media.url.endsWith('.json')) {
          const response = await fetch(media.url);
          const slideData = await response.json();
          finalMediaData = {
            ...finalMediaData,
            type: 'image',
            url: "",
            imageSourceUrl: slideData.image_url || slideData.imageUrl || slideData.imagen,
            audioSourceUrl: slideData.audio_url || slideData.audioUrl || slideData.audioSourceUrl,
            duration: slideData.duration || 15
          };
        }
        const isValidMediaSource = finalMediaData.url || (finalMediaData.imageSourceUrl && finalMediaData.audioSourceUrl);
        if (!isValidMediaSource) {
          if (wasPlaying) play();
          return;
        }
        if (currentVideo) setInterruptedVideo(currentVideo);
        
        // Use playMedia to set the temporary video
        playMedia(finalMediaData, false);

      } catch (error) {
        console.error("Error al reproducir video temporal:", error);
        if (wasPlaying) play();
      }
  }, [currentVideo, interruptedVideo, isPlaying, pause, play, playMedia]);

  const playSpecificVideo = useCallback((media: SlideMedia) => {
      playMedia(media, false);
      setIsUserSelected(true);
  }, [playMedia]);

  const playLiveStream = useCallback((status: { liveStreamUrl: string; isLive: boolean; }) => {
      if (status && status.isLive) {
          const liveVideo: SlideMedia = { id: 'live-stream', nombre: 'TRANSMISIÓN EN VIVO', url: status.liveStreamUrl, createdAt: new Date().toISOString(), categoria: 'En Vivo', imagen: '/PARCHE.png', novedad: true, type: 'stream', };
          playMedia(liveVideo, false);
      }
  }, [playMedia]);

  const loadInitialPlaylist = useCallback(async (videoUrlToPlay: string | null) => {
      const { allVideos: fetchedVideos } = await getVideosForHome(100);
      if (fetchedVideos && fetchedVideos.length > 0) {
          let videoToPlay: SlideMedia;
          if (videoUrlToPlay) {
              const specificVideo = fetchedVideos.find(v => v.url === videoUrlToPlay);
              videoToPlay = specificVideo || fetchedVideos[0];
          } else {
              const randomIndex = Math.floor(Math.random() * fetchedVideos.length);
              videoToPlay = fetchedVideos[randomIndex];
          }
          playMedia(videoToPlay, true);
          // Redundant setIsPlaying(true) removed
      }
  }, [playMedia]);

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
        unmute(); // Forzamos que el volumen vuelva a estar activo
        return;
      }
      if (viewMode === 'tv') {
          unmute(); // Aseguramos el volumen activo en modo TV
          playNextRandomVideo(currentVideo?.id, currentVideo?.categoria);
      } else {
          if (isUserSelected) setIsUserSelected(false);
          if (nextVideo) {
              unmute(); // Aseguramos el volumen activo para el siguiente video
              playMedia(nextVideo, false);
              setNextVideo(null);
          } else {
              unmute(); // Aseguramos el volumen activo para un video aleatorio
              playNextRandomVideo(currentVideo?.id, currentVideo?.categoria);
          }
      }
  }, [viewMode, isUserSelected, nextVideo, playMedia, playNextRandomVideo, currentVideo, interruptedVideo, unmute]);

  const handleOnProgress = useCallback(async (progress: ProgressState) => {
      if (viewMode === 'tv' || interruptedVideo) return;
      if (!currentVideo) return;

      if (!nextVideo && !randomVideoQueued && progress.playedSeconds > 5) {
          setRandomVideoQueued(true);
          const newRandomVideo = await getNewRandomVideo(currentVideo.id, currentVideo.categoria);
          if (newRandomVideo) {
              setNextVideo(newRandomVideo);
          } else {
              setRandomVideoQueued(false);
          }
      }
  }, [viewMode, nextVideo, randomVideoQueued, currentVideo, interruptedVideo]);

  const togglePlayPause = useCallback(() => setIsPlaying(prev => !prev), []);

  const playNextVideoInQueue = useCallback(() => {
      if (nextVideo) {
        playMedia(nextVideo, false);
        setNextVideo(null);
      } else {
        playNextRandomVideo(currentVideo?.id, currentVideo?.categoria);
      }
  }, [nextVideo, playMedia, playNextRandomVideo, currentVideo]);

  const removeNextVideoFromQueue = useCallback(() => setNextVideo(null), []);

  const value = useMemo(() => ({
      currentVideo, nextVideo, isPlaying, seekToFraction, isFirstMedia, randomVideoQueued, streamStatus, viewMode,
      setViewMode, playMedia, playSpecificVideo, playTemporaryVideo, playLiveStream, setIsPlaying, togglePlayPause,
      setSeekToFraction, loadInitialPlaylist, handleOnEnded, handleOnProgress, playNextVideoInQueue, removeNextVideoFromQueue,
      pause, play,
  }), [
      currentVideo, nextVideo, isPlaying, seekToFraction, isFirstMedia, randomVideoQueued, streamStatus, viewMode,
      setViewMode, playMedia, playSpecificVideo, playTemporaryVideo, playLiveStream, togglePlayPause, setSeekToFraction,
      loadInitialPlaylist, handleOnEnded, handleOnProgress, playNextVideoInQueue, removeNextVideoFromQueue, pause, play,
  ]);

  return (
    <MediaPlayerContext.Provider value={value}>
      {children}
    </MediaPlayerContext.Provider>
  );
};