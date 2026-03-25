import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient'; // Ajusta según tu configuración

interface VideoData {
  id: string;
  url: string;
  nombre: string;
  categoria: string;
  type?: string; 
}

interface MediaPlayerContextType {
  currentVideo: VideoData | null;
  nextVideo: VideoData | null;
  isIntroPlaying: boolean;
  currentIntro: string | null;
  isSlidePlaying: boolean;
  currentSlideUrl: string | null;
  isPlaying: boolean;
  volume: number;
  lastVolumeBeforeEnd: number;
  isLiveStreamActive: boolean;
  viewMode: 'diario' | 'tv';
  setViewMode: (mode: 'diario' | 'tv') => void;
  streamingUrl: string | null;
  playNext: () => void;
  playSlide: (url: string, duration: number) => void;
  playUserSelected: (video: VideoData) => void;
  playSpecificVideo: (video: any) => void;
  playTemporaryVideo: (video: any) => void;
  togglePlayPause: () => void;
  setIsPlaying: (playing: boolean) => void;
  setIsIntroPlaying: (playing: boolean) => void;
  playLiveStream: (status: any) => void;
  streamStatus: any;
  handleOnEnded: () => void;
}

const INTRO_VIDEOS = [
  '/videos_intro/intro1.mp4',
  '/videos_intro/intro2.mp4',
  '/videos_intro/intro3.mp4',
  '/videos_intro/intro4.mp4',
  '/videos_intro/intro5.mp4'
];

const MediaPlayerContext = createContext<MediaPlayerContextType | undefined>(undefined);

export const MediaPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentVideo, setCurrentVideo] = useState<VideoData | null>(null);
  const [nextVideo, setNextVideo] = useState<VideoData | null>(null);
  const [interruptedVideo, setInterruptedVideo] = useState<{ video: VideoData, time: number } | null>(null);

  const [isIntroPlaying, setIsIntroPlaying] = useState(false);
  const [currentIntro, setCurrentIntro] = useState('');

  const [isSlidePlaying, setIsSlidePlaying] = useState(false);
  const [currentSlideUrl, setCurrentSlideUrl] = useState<string | null>(null);

  const [volume, setVolume] = useState(0.2); // Default inicial 20%
  const [lastVolumeBeforeEnd, setLastVolumeBeforeEnd] = useState(0.2);
  const [isPlaying, setIsPlaying] = useState(true);
  const [viewMode, setViewMode] = useState<'diario' | 'tv'>('diario');
  const [isLiveStreamActive, setIsLiveStreamActive] = useState(false);
  const [streamingUrl, setStreamingUrl] = useState<string | null>(null);

  const videoRef = useRef<any>(null);

  const [rawStreamStatus, setRawStreamStatus] = useState<any>(null);

  // 1. Detección de Streaming (Realtime)
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const { data } = await supabase.from('streaming').select('*').eq('id', 25).single();
        if (data) processData(data);
      } catch (err) {}
    };

    const processData = (data: any) => {
      const isActive = data.isActive;
      const rawUrl = data.url;
      const normalizedUrl = (rawUrl && rawUrl.includes('/live/')) 
        ? `https://www.youtube.com/watch?v=${rawUrl.split('/live/')[1].split('?')[0]}` 
        : rawUrl;

      setIsLiveStreamActive(isActive);
      setStreamingUrl(isActive ? normalizedUrl : null);
      setRawStreamStatus(data);
      
      if (isActive && viewMode === 'diario') {
        setViewMode('tv');
      }
    };

    fetchInitial();

    const channel = supabase
      .channel('streaming-web-realtime')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'streaming', filter: 'id=eq.25' },
        (payload) => {
          console.log('[Realtime Web] Syncing:', payload.new);
          processData(payload.new);
        }
      )
      .subscribe();

    const backup = setInterval(fetchInitial, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(backup);
    };
  }, [viewMode]);

  // 2. Cargar video aleatorio inicial y el siguiente (solo al montar)
  useEffect(() => {
    initPlayer();
  }, []);

  const fetchRandomVideo = async (categoria?: string, excludeId?: string): Promise<VideoData | null> => {
    let query = supabase
      .from('videos')
      .select('id, url, nombre, categoria');

    if (categoria) {
      query = query.eq('categoria', categoria);
    }
    
    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      // Fallback: si falla o no hay más de esa categoría, buscar sin excluir
      if (excludeId) {
        return fetchRandomVideo(categoria);
      }
      // Fallback: buscar en general si ya nada sirve
      if (categoria) {
         return fetchRandomVideo();
      }
      return null;
    }
    return data[Math.floor(Math.random() * data.length)];
  };

  const initPlayer = async () => {
    const first = await fetchRandomVideo();
    const second = await fetchRandomVideo(first?.categoria, first?.id);
    setCurrentVideo(first);
    setNextVideo(second);
    startIntro();
  };

  const startIntro = () => {
    const list = INTRO_VIDEOS;
    const randomIntro = list[Math.floor(Math.random() * list.length)];
    setCurrentIntro(randomIntro);
    setIsIntroPlaying(true);
  };

  // Lógica de reproducción infinita
  const playNext = async () => {
    setLastVolumeBeforeEnd(volume); // Guardar volumen actual

    // Si había un video interrumpido (e.g. por un video temporal), lo restauramos
    if (interruptedVideo) {
      setCurrentVideo(interruptedVideo.video);
      setInterruptedVideo(null);
      // Opcionalmente: no disparamos Intro para restauraciones manuales?
      // startIntro(); 
      return;
    }

    const next = nextVideo || await fetchRandomVideo(currentVideo?.categoria, currentVideo?.id);
    const prefetch = await fetchRandomVideo(next?.categoria, next?.id);

    setCurrentVideo(next);
    setNextVideo(prefetch);
    startIntro();
  };

  // Lógica de Slides (Noticias)
  const playSlide = (url: string, duration: number) => {
    if (currentVideo) {
      setInterruptedVideo({ video: currentVideo, time: 0 });
    }

    setCurrentSlideUrl(url);
    setIsSlidePlaying(true);

    // PRE-FETCHING: Cargar el siguiente ítem 3 segundos antes de que termine el slide
    const prefetchTime = Math.max(0, (duration - 3) * 1000);
    setTimeout(async () => {
      // Normal flow prediction (if daily show is gone, we don't predict slides for now as they are videos)
    }, prefetchTime);

    // Al terminar el slide
    setTimeout(() => {
      setIsSlidePlaying(false);
      setCurrentSlideUrl(null);

      if (interruptedVideo) {
        setCurrentVideo(interruptedVideo.video);
      }
    }, duration * 1000);
  };

  // Selección manual desde Carrusel
  const playUserSelected = async (video: VideoData) => {
    setVolume(0.2); // Política: 20% en selección manual
    setCurrentVideo(video);
    setIsPlaying(true);
    startIntro();
    // Preparar el siguiente acorde a esta nueva categoría
    const prefetch = await fetchRandomVideo(video.categoria, video.id);
    setNextVideo(prefetch);
  };

  const playSpecificVideo = async (video: any) => {
    setCurrentVideo(video);
    setIsPlaying(true);
    startIntro();
    // Preparar el siguiente acorde a esta nueva categoría
    const prefetch = await fetchRandomVideo(video.categoria, video.id);
    setNextVideo(prefetch);
  };

  const playTemporaryVideo = (video: any) => {
    // Guardamos el video actual para restaurarlo después
    if (currentVideo) {
      setInterruptedVideo({ video: currentVideo, time: 0 });
    }

    setCurrentVideo(video);
    setIsPlaying(true);
    // Nota: Aquí no llamamos a startIntro() para que el cambio sea directo, 
    // pero si se prefiere intro se puede agregar.
  };

  const togglePlayPause = () => setIsPlaying(prev => !prev);

  return (
    <MediaPlayerContext.Provider value={{
      currentVideo,
      nextVideo,
      isIntroPlaying,
      currentIntro,
      isSlidePlaying,
      currentSlideUrl,
      isPlaying,
      volume,
      lastVolumeBeforeEnd,
      isLiveStreamActive,
      viewMode,
      setViewMode,
      streamingUrl,
      playNext,
      playSlide,
      playUserSelected,
      playSpecificVideo,
      playTemporaryVideo,
      togglePlayPause,
      setIsPlaying,
      setIsIntroPlaying,
      playLiveStream: (status: any) => {
        setIsLiveStreamActive(true);
        setViewMode('tv');
      },
      streamStatus: rawStreamStatus,
      handleOnEnded: () => {
        if (isIntroPlaying) setIsIntroPlaying(false);
        playNext();
      }
    }}>
      {children}
    </MediaPlayerContext.Provider>
  );
};

export const useMediaPlayer = () => {
  const context = useContext(MediaPlayerContext);
  if (!context) throw new Error('useMediaPlayer debe usarse dentro de MediaPlayerProvider');
  return context;
};