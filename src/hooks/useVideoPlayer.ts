import { useState, useCallback, useRef, useEffect } from 'react';
import { usePlaybackLogic } from '@/hooks/usePlaybackLogic';
import { useCast } from '@/hooks/useCast';

export const useVideoPlayer = () => {
  const playerRef = useRef<any>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [currentMedia, setCurrentMedia] = useState<any>(null);
  const [playingMedia, setPlayingMedia] = useState<any>(null);
  const [playerStatus, setPlayerStatus] = useState('idle');
  const [showControls, setShowControls] = useState(false);
  
  const playbackLogic = usePlaybackLogic({
    setCurrentMedia,
    setPlayingMedia,
    setPlayerStatus,
  });

  const { volume, isMuted } = playbackLogic; // Importar volume e isMuted

  useEffect(() => {
      if (!currentMedia) {
          const placeholderImage = document.documentElement.classList.contains('dark') 
              ? 'https://storage.googleapis.com/hostinger-horizons-assets-prod/77d159f1-0d45-4b01-ba42-c8ca9cbd0d70/4e1cb556338b8c5950a4d1d93339ecb7.png' 
              : 'https://storage.googleapis.com/hostinger-horizons-assets-prod/77d159f1-0d45-4b01-ba42-c8ca9cbd0d70/a56317586a1474ed88f117395632e85a.png';
          
          setCurrentMedia({
              url: placeholderImage,
              title: 'Saladillo Vivo',
              type: 'image',
              isUserSelected: false
          });
          setPlayerStatus('static_image');
      }
  }, [currentMedia]);

  const { isCastAvailable, handleCast } = useCast(currentMedia);

  const handleError = useCallback((e: any) => {
    console.warn("Player error:", e);
    setPlayerStatus('error');
  }, [setPlayerStatus]);

  const handlePlayerReady = useCallback((player: any) => {
    if (playerRef.current) {
      const internalPlayer = playerRef.current.getInternalPlayer();
      if (internalPlayer && typeof internalPlayer.setVolume === 'function') {
        internalPlayer.setVolume(isMuted ? 0 : volume);
      } else if (playerRef.current.setVolume && typeof playerRef.current.setVolume === 'function') {
        // Fallback for other player types or if getInternalPlayer is not needed
        playerRef.current.setVolume(isMuted ? 0 : volume);
      }
    }
  }, [playerRef, isMuted, volume]);

  const handleMouseEnterControls = useCallback(() => {
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    setShowControls(true);
  }, []);

  const handleMouseLeaveControls = useCallback((fast = false) => {
    const timeout = fast ? 750 : 3000;
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), timeout);
  }, []);
  
  const handleTouchShowControls = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  return {
    playerRef,
    currentMedia,
    playingMedia,
    playerStatus,
    ...playbackLogic,
    showControls,
    isCastAvailable,
    handlePlayerReady,
    handleError,
    handleMouseEnterControls,
    handleMouseLeaveControls,
    handleTouchShowControls,
    handleProgress: (state: { played: number }) => playbackLogic.setProgress(state.played),
    handleDuration: (d: number) => playbackLogic.setDuration(d),
    handleSeek: (value: number) => {
      if (playerRef.current && currentMedia?.type === 'video' && value < playbackLogic.progress) {
        playerRef.current.seekTo(value, 'fraction');
      }
    },
    handleCast,
  };
};