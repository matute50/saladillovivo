import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';

const FADE_DURATION = 2000;

const useFader = (initialVolume = 1.0) => {
  const [volume, setVolume] = useState(initialVolume);
  const animationFrameRef = useRef<number>();

  const ramp = useCallback((targetVolume: number, duration: number, onComplete?: () => void) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    const startVolume = volume;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      const newVolume = startVolume + (targetVolume - startVolume) * progress;
      setVolume(newVolume);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        if (onComplete) onComplete();
      }
    };
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [volume]);

  return { volume, setVolume, ramp };
};

interface PlaybackLogicProps {
  setCurrentMedia: (media: any) => void;
  setPlayingMedia: (media: any) => void;
  setPlayerStatus: (status: string) => void;
}

export const usePlaybackLogic = ({ setCurrentMedia, setPlayingMedia, setPlayerStatus }: PlaybackLogicProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [videoOpacity, setVideoOpacity] = useState(0);
  const { volume, setVolume, ramp } = useFader(1.0);
  const playbackEventSent = useRef(false);
  const userVolume = useRef(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const { toast } = useToast();

  const performTransition = useCallback((callback?: () => void) => {
    setIsTransitioning(true);
    setVideoOpacity(0);
    ramp(0, FADE_DURATION, () => {
      if (callback) callback();
      setTimeout(() => {
        setVideoOpacity(1);
        ramp(isMuted ? 0 : userVolume.current, FADE_DURATION, () => {
          setIsTransitioning(false);
        });
      }, 50);
    });
  }, [ramp, isMuted]);

  const playMedia = useCallback((mediaData: any, isAutoPlay = false) => {
    playbackEventSent.current = false;
    setPlayerStatus('loading');
    
    const startMuted = isAutoPlay && (mediaData.type === 'stream' || mediaData.type === 'video');

    if (startMuted) {
      userVolume.current = 1.0;
      setIsMuted(true);
      setVolume(0);
    } else {
      setIsMuted(false);
      setVolume(userVolume.current);
    }

    performTransition(() => {
        setCurrentMedia(mediaData);
        setPlayingMedia(mediaData);
        setPlayerStatus(mediaData.type === 'stream' ? 'playing_stream' : 'playing_vod');
        setIsPlaying(true);
    });
  }, [setCurrentMedia, setPlayingMedia, setPlayerStatus, performTransition, setVolume]);

  const playUserSelectedVideo = useCallback((video: any, categoryName?: string) => {
    const mediaData = {
      url: video.url,
      title: video.nombre,
      type: 'video',
      isUserSelected: true,
      category: categoryName
    };
    setIsMuted(false);
    userVolume.current = volume > 0 ? volume : 1.0;
    playMedia(mediaData, true);
  }, [playMedia, volume]);

  const togglePlayPause = useCallback(() => setIsPlaying(prev => !prev), []);
  
  const unmute = useCallback(() => {
    setIsMuted(false);
    ramp(userVolume.current, 500);
  }, [ramp]);
  
  const toggleMute = useCallback(() => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    ramp(newMutedState ? 0 : userVolume.current, 500);
  }, [ramp, isMuted]);

  const handleVolumeChange = useCallback((v: number) => {
    const newVolume = v / 100;
    userVolume.current = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  }, [setVolume]);

  const handlePlay = useCallback(async (media: any) => {
    setIsPlaying(true);
    if (media) {
      setPlayingMedia(media);
    }

    if (media && !playbackEventSent.current) {
        if (media.category === 'SV') {
            playbackEventSent.current = true;
            return;
        }

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
  }, [setPlayingMedia, toast]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
  }, []);

  return {
    isPlaying,
    volume,
    isMuted,
    videoOpacity,
    isTransitioning,
    progress,
    duration,
    setIsPlaying,
    setVolume,
    setProgress,
    setDuration,
    playUserSelectedVideo,
    playMedia,
    togglePlayPause,
    unmute,
    toggleMute,
    handleVolumeChange,
    handlePlay,
    handlePause,
    handleEnded,
    // Exponer volume e isMuted para useVideoPlayer
    volume,
    isMuted,
  };
};