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
  videoPlayerRef: React.RefObject<HTMLVideoElement>; 
  reactPlayerRef: React.RefObject<any>; 
}

const MediaPlayerContext = createContext<MediaPlayerContextType | undefined>(undefined);

export const useMediaPlayer = () => {
  const context = useContext(MediaPlayerContext);
  if (!context) throw new Error('useMediaPlayer must be used within a MediaPlayerProvider');
  return context;
};

export const MediaPlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const { setVolume, volume: currentVolume } = useVolume();
  
  const [currentVideo, setCurrentVideo] = useState<SlideMedia | null>(null);
  const [nextVideo, setNextVideo] = useState<SlideMedia | null>(null);
  const [playlist, setPlaylist] = useState<SlideMedia[]>([]); 
  const [isPlaying, setIsPlaying] = useState(false);
  const [viewMode, setViewMode] = useState<'diario' | 'tv'>('diario');
  
  const videoPlayerRef = useRef<HTMLVideoElement>(null);
  const reactPlayerRef = useRef<any>(null);

  const isInitialized = useRef(false);
  const playbackState = useRef<PlaybackSource>('INTRO');
  const savedProgress = useRef<number>(0);
  const savedVideo = useRef<SlideMedia | null>(null);
  const savedVolume = useRef<number>(1);
  const nextDataVideoRef = useRef<SlideMedia | null>(null); 
  const preloadGuard = useRef<string>(""); 

  // --- HELPERS ---

  const getRandomIntro = useCallback((): SlideMedia => {
    if (INTRO_VIDEOS.length === 0) {
        console.warn("No hay videos de intro definidos");
        return { id: 'fallback', nombre: 'Intro', url: '', categoria: 'Inst', type: 'video', createdAt: '' };
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
      type: 'video'
    };
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

  // --- FUNCIONES ---

  const playMedia = useCallback((media: SlideMedia) => {
      setCurrentVideo(media);
      setIsPlaying(true);
  }, []);

  const playSpecificVideo = useCallback((media: SlideMedia) => {
      savedVolume.current = currentVolume;
      setVolume(0.2); 
      playbackState.current = 'USER_SELECTED';
      setCurrentVideo(media);
      setIsPlaying(true);
  }, [currentVolume, setVolume]);

  const playTemporaryVideo = useCallback((media: SlideMedia) => {
      if (currentVideo && playbackState.current !== 'INTRO') {
          savedVideo.current = currentVideo;
      }
      playMedia(media); 
  }, [currentVideo, playMedia]);

  const togglePlayPause = useCallback(() => setIsPlaying(p => !p), []);

  const saveCurrentProgress = useCallback((seconds: number) => {
      savedProgress.current = seconds;
  }, []);

  const loadInitialPlaylist = useCallback(async (videoUrlToPlay: string | null) => {
      if (isInitialized.current) return;
      isInitialized.current = true;

      console.log('MediaPlayer: Iniciando secuencia...');
      
      if (videoUrlToPlay) {
         const { allVideos } = await getVideosForHome(10);
         const requested = allVideos.find(v => v.url === videoUrlToPlay);
         if (requested) {
           playSpecificVideo(requested);
           return;
         }
      }

      const intro = getRandomIntro();
      playbackState.current = 'INTRO';
      setCurrentVideo(intro);
      setIsPlaying(true);
  }, [getRandomIntro, playSpecificVideo]); 

  const handleOnEnded = useCallback(async () => {
      console.log('Video Ended. State:', playbackState.current);

      if (playbackState.current === 'INTRO') {
          let nextV = nextDataVideoRef.current;
          
          if (!nextV) {
              console.log("Fallback: Buscando video ahora...");
              nextV = await fetchRandomDbVideo(currentVideo?.id);
          }

          if (nextV) {
              playbackState.current = 'DB_RANDOM';
              setCurrentVideo(nextV);
              setIsPlaying(true);
          } else {
              setCurrentVideo(getRandomIntro());
              setIsPlaying(true);
          }
      } 
      else {
          if (playbackState.current === 'USER_SELECTED') setVolume(savedVolume.current); 
          
          playbackState.current = 'INTRO';
          setCurrentVideo(getRandomIntro());
          setIsPlaying(true);
      }
  }, [setVolume, getRandomIntro, fetchRandomDbVideo, currentVideo]);

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
             setNextVideo({ id: 'loading', nombre: 'Cargando...', categoria: 'Youtube', url: '', createdAt: '', type: 'video' });
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
      currentVideo, nextVideo, playlist, isPlaying, viewMode,
      setViewMode, playMedia, playSpecificVideo, playTemporaryVideo, 
      setIsPlaying, togglePlayPause, loadInitialPlaylist, handleOnEnded, playNextVideoInQueue,
      saveCurrentProgress, resumeAfterSlide,
      videoPlayerRef,
      reactPlayerRef,
  }), [
      currentVideo, nextVideo, playlist, isPlaying, viewMode,
      setViewMode, playMedia, playSpecificVideo, playTemporaryVideo, 
      togglePlayPause, loadInitialPlaylist, handleOnEnded, playNextVideoInQueue,
      saveCurrentProgress, resumeAfterSlide,
      videoPlayerRef,
      reactPlayerRef,
  ]);

  return (
    <MediaPlayerContext.Provider value={value}>
      {children}
    </MediaPlayerContext.Provider>
  );
};