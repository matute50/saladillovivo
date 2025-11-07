'use client';

// --- ARREGLO: Eliminado 'useRef' de esta línea ---
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'; 
import { getVideosForHome, getNewRandomVideo } from '@/lib/data';
import { Video } from '@/lib/types';
import { useVolume } from './VolumeContext';

// Exportamos 'ProgressState' para que VideoSection pueda usarlo
export interface ProgressState {
  played: number;
  playedSeconds: number;
  loaded: number;
  loadedSeconds: number;
}

interface MediaPlayerContextType {
  currentVideo: Video | null;
  nextVideo: Video | null;
  isPlaying: boolean;
  seekToFraction: number | null;
  isFirstMedia: boolean;
  randomVideoQueued: boolean;
  streamStatus: { liveStreamUrl: string; isLive: boolean; } | null; 
  playMedia: (media: Video, isFirst?: boolean) => void;
  playSpecificVideo: (media: Video) => void;
  playLiveStream: (status: { liveStreamUrl: string; isLive: boolean; }) => void; 
  setIsPlaying: (isPlaying: boolean) => void;
  togglePlayPause: () => void;
  setSeekToFraction: (fraction: number | null) => void;
  loadInitialPlaylist: (videoUrlToPlay: string | null) => Promise<void>;
  handleOnEnded: () => void;
  handleOnProgress: (progress: ProgressState, currentVideoId: string | undefined, currentVideoCategory: string | undefined) => void;
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

export const MediaPlayerProvider = ({ children }: { children: React.ReactNode }) => {

  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [nextVideo, setNextVideo] = useState<Video | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [seekToFraction, setSeekToFraction] = useState<number | null>(null);
  
  const [isFirstMedia, setIsFirstMedia] = useState(true);
  const [isUserSelected, setIsUserSelected] = useState(false);
  const [randomVideoQueued, setRandomVideoQueued] = useState(false);
  
  const [streamStatus] = useState<{ liveStreamUrl: string; isLive: boolean; } | null>({ liveStreamUrl: 'https.://www.youtube.com/watch?v=vCDCKGfOLoY', isLive: true });

  const { setVolume } = useVolume(); 
  // 'useRef' para 'userVolume' ha sido eliminado

  const playMedia = useCallback((media: Video, isFirst = false) => {
    setCurrentVideo(media);
    setIsPlaying(true);
    setIsFirstMedia(isFirst);
    setNextVideo(null);
    setRandomVideoQueued(false);
    
    if (isFirst) {
       setVolume(0);
    }
    
  }, [setVolume]);

  const playSpecificVideo = useCallback((media: Video) => {
    if (currentVideo) {
      setNextVideo(media);
      setIsUserSelected(true);
      setRandomVideoQueued(false);
    } else {
      setCurrentVideo(media);
      setIsPlaying(true);
      setIsUserSelected(true);
    }
  }, [currentVideo]);

  const playLiveStream = useCallback((status: { liveStreamUrl: string; isLive: boolean; }) => {
    if (status && status.isLive) {
      const liveVideo: Video = { id: 'live-stream', nombre: 'TRANSMISIÓN EN VIVO', url: status.liveStreamUrl, createdAt: new Date().toISOString(), categoria: 'En Vivo', imagen: '/PARCHE.png', novedad: true, };
      playMedia(liveVideo, false);
    }
  }, [playMedia]);

  const loadInitialPlaylist = useCallback(async (videoUrlToPlay: string | null) => {
    const { allVideos: fetchedVideos } = await getVideosForHome(100);
    if (fetchedVideos && fetchedVideos.length > 0) {
      let videoToPlay: Video;
      if (videoUrlToPlay) {
        const specificVideo = fetchedVideos.find(v => v.url === videoUrlToPlay);
        videoToPlay = specificVideo || fetchedVideos[0];
      } else {
        const randomIndex = Math.floor(Math.random() * fetchedVideos.length);
        videoToPlay = fetchedVideos[randomIndex];
      }
      playMedia(videoToPlay, true);
    }
  }, [playMedia]);

  const playNextRandomVideo = useCallback(async (currentVideoId?: string, currentVideoCategory?: string) => {
    const nextVideo = await getNewRandomVideo(currentVideoId, currentVideoCategory);
    if (nextVideo) {
      playMedia(nextVideo, false);
    } else {
      await loadInitialPlaylist(null);
    }
  }, [playMedia, loadInitialPlaylist]);

  const handleOnEnded = useCallback(() => {
    if (isUserSelected) {
      setIsUserSelected(false);
    }
    if (nextVideo) {
      playMedia(nextVideo, false);
      setNextVideo(null);
    } else {
      playNextRandomVideo(currentVideo?.id, currentVideo?.categoria);
    }
  }, [isUserSelected, nextVideo, playMedia, playNextRandomVideo, currentVideo]);

  const handleOnProgress = useCallback(async (progress: ProgressState, currentVideoId: string | undefined, currentVideoCategory: string | undefined) => {
    
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
  }, [nextVideo, randomVideoQueued]);

  const togglePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const playNextVideoInQueue = useCallback(() => {
    if (nextVideo) {
      playMedia(nextVideo, false);
      setNextVideo(null);
    } else {
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
    playMedia,
    playSpecificVideo,
    playLiveStream, 
    setIsPlaying,
    togglePlayPause,
    setSeekToFraction,
    loadInitialPlaylist,
    handleOnEnded,
    handleOnProgress,
    playNextVideoInQueue,
    removeNextVideoFromQueue,
  }), [
    currentVideo,
    nextVideo,
    isPlaying,
    seekToFraction,
    isFirstMedia,
    randomVideoQueued,
    streamStatus,
    playMedia,
    playSpecificVideo,
    playLiveStream,
    setIsPlaying,
    togglePlayPause,
    setSeekToFraction,
    loadInitialPlaylist,
    handleOnEnded,
    handleOnProgress,
    playNextVideoInQueue,
    removeNextVideoFromQueue
  ]);

  return (
    <MediaPlayerContext.Provider value={value}>
      {children}
    </MediaPlayerContext.Provider>
  );
};