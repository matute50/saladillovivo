import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { getNewRandomVideo } from '@/lib/data';
import { getDisplayCategory } from '@/lib/categoryMappings';

interface PlaybackLogicProps {
  playingMedia: any;
  setCurrentMedia: (media: any) => void;
  setPlayingMedia: (media: any) => void;
  setPlayerStatus: (status: string) => void;
  isMuted: boolean;
  setIsMuted: (isMuted: boolean) => void;
  isFirstPlay: boolean;
  setIsFirstPlay: (isFirstPlay: boolean) => void;
  setVolume: (volume: number) => void;
  ramp: (targetVolume: number, duration: number, onComplete?: () => void) => void;
  userVolume: React.MutableRefObject<number>;
}

export const usePlaybackLogic = ({
  playingMedia,
  setCurrentMedia,
  setPlayingMedia,
  setPlayerStatus,
  isMuted,
  setIsMuted,
  isFirstPlay,
  setIsFirstPlay,
  setVolume,
  ramp,
  userVolume,
}: PlaybackLogicProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAutoplaying, setIsAutoplaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const playbackEventSent = useRef(false);
  const fadeOutInitiated = useRef(false);
  // Removed: const isInitialPlay = useRef(true);
  const { toast } = useToast();
  const [mainSrc, setMainSrc] = useState('');
  const [transitionSrc, setTransitionSrc] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  const introVideos = ['/azul.mp4', '/cuadros.mp4', '/cuadros2.mp4', '/lineal.mp4', '/ruido.mp4'];

  const playMedia = useCallback((mediaData: any, isAutoPlay = false) => {
    playbackEventSent.current = false;
    fadeOutInitiated.current = false;
    setPlayerStatus('loading');

    if (isAutoPlay) {
      // Autoplay is silent at first to comply with browser policies.
      // The context starts with isMuted: true, so we don't need to do anything here.
    } else {
      // User-initiated play
      if (isMuted) { // If it was muted, unmute and fade in.
        setIsMuted(false);
        setVolume(0);
        ramp(userVolume.current, 1000);
      }
    }

    setMainSrc(mediaData.url);
    setCurrentMedia(mediaData);
    setPlayingMedia(mediaData);

    if (mediaData.url.includes('youtube.com') || mediaData.url.includes('youtu.be')) {
        const randomIntro = introVideos[Math.floor(Math.random() * introVideos.length)];
        setTransitionSrc(randomIntro);
        setIsTransitioning(true);
    }
    
    setIsPlaying(true);

  }, [setCurrentMedia, setPlayingMedia, setPlayerStatus, ramp, introVideos, isMuted, setIsMuted, userVolume, setVolume]);

  const playNextRandomVideo = useCallback(async (currentId?: string) => {
    const randomVideo = await getNewRandomVideo(currentId);
    if (randomVideo) {
      const mediaData = {
        ...randomVideo,
        id: randomVideo.id,
        url: randomVideo.url,
        title: randomVideo.nombre,
        type: 'video',
        isUserSelected: false,
        category: randomVideo.categoria,
      };
      setActiveCategory(getDisplayCategory(randomVideo.categoria));
      playMedia(mediaData, true);
    } else {
      toast({
        title: "Fin del Contenido Aleatorio",
        description: "No se encontraron más videos para reproducir.",
      });
    }
  }, [toast, playMedia]);

  // Effect for initial video load
  useEffect(() => {
    playNextRandomVideo();
  }, []); // Runs only once on mount


  const playUserSelectedVideo = useCallback((video: any, categoryName?: string) => {
    setIsAutoplaying(false);
    setActiveCategory(categoryName || getDisplayCategory(video.categoria));
    
    let videoUrl = video.url;
    if (!videoUrl || !videoUrl.includes('youtu')) {
      if (video.imagen && video.imagen.includes('youtu')) {
        videoUrl = video.imagen;
      }
    }

    const mediaData = {
      ...video,
      url: videoUrl,
      title: video.nombre,
      type: 'video',
      isUserSelected: true,
      category: video.categoria,
    };
    playMedia(mediaData, false);
  }, [playMedia]);

  const handlePlay = useCallback(async (media: any) => {
    setIsPlaying(true);
    setPlayerStatus(media.type === 'stream' ? 'playing_stream' : 'playing_vod');

    if (media) {
      setPlayingMedia(media);
    }

    if (media && !playbackEventSent.current) {
        playbackEventSent.current = true;
        try {
            const { error } = await supabase.from('reproducciones').insert({
                nombre_del_video: media.title.toUpperCase(),
                categoria: media.category.toUpperCase(),
                tipo: media.type
            });
            if (error) throw error;
        } catch (error: any) {
            console.error('Error logging playback event:', error);
            if (error.message.includes('fetch')) {
                toast({
                    title: "Error de Conexión",
                    description: "No se pudo registrar la reproducción. Revisa tu conexión.",
                    variant: "destructive"
                });
            }
        }
    }
  }, [setPlayingMedia, toast, setPlayerStatus]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleEnded = useCallback(() => {
    setIsAutoplaying(true);
    const currentPlayingId = playingMedia?.id;
    playNextRandomVideo(currentPlayingId);
  }, [playNextRandomVideo, playingMedia]);

  const handleProgress = useCallback((state: { played: number, playedSeconds: number }) => {
    setProgress(state.played);
  }, []);

  const togglePlayPause = useCallback(() => {
    // If we are about to start playing and the context is muted (i.e., initial state)
    if (!isPlaying && isMuted) {
        setIsMuted(false);
        setVolume(0);
        ramp(userVolume.current, 1000);
    }
    setIsPlaying(prev => !prev);
  }, [isPlaying, isMuted, setIsMuted, setVolume, ramp, userVolume]);

  useEffect(() => {
    if (isPlaying && isTransitioning) {
      const transitionTimer = setTimeout(() => {
        setIsTransitioning(false);
        setTransitionSrc('');
      }, 5500);          
      return () => clearTimeout(transitionTimer);
    }
  }, [isPlaying, isTransitioning]);

  // Effect for audio fade-out
  useEffect(() => {
    if (!isPlaying || duration <= 0 || isMuted) return;

    const remainingTime = duration * (1 - progress);

    if (remainingTime <= 1 && !fadeOutInitiated.current) {
      fadeOutInitiated.current = true;
      ramp(0, 1000);
    }
  }, [progress, duration, isPlaying, isMuted, ramp]);
  
  return {
    isPlaying,
    progress,
    duration,
    mainSrc,
    transitionSrc,
    isTransitioning,
    activeCategory,
    setIsPlaying,
    setProgress,
    setDuration,
    playUserSelectedVideo,
    playMedia,
    togglePlayPause,
    handlePlay,
    handlePause,
    handleEnded,
    playNextRandomVideo,
    handleProgress,
  };
};