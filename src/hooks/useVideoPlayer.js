import { useState, useCallback, useRef, useEffect } from 'react';
import { usePlaybackLogic } from '@/hooks/usePlaybackLogic';
import { useCast } from '@/hooks/useCast';

export const useVideoPlayer = () => {
  const playerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  const [currentMedia, setCurrentMedia] = useState(null);
  const [playingMedia, setPlayingMedia] = useState(null);
  const [playerStatus, setPlayerStatus] = useState('idle');
  const [showControls, setShowControls] = useState(false);
  
  const { ...playbackLogic } = usePlaybackLogic({
    setCurrentMedia,
    setPlayingMedia,
    setPlayerStatus,
  });

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

  const handleError = useCallback((e) => {
    console.warn("Player error:", e);
    setPlayerStatus('error');
  }, [setPlayerStatus]);

  const handlePlayerReady = useCallback((player) => {
    // No specific HLS logic needed here as ReactPlayer handles it
  }, []);

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
    handleProgress: (state) => playbackLogic.setProgress(state.played),
    handleDuration: (d) => playbackLogic.setDuration(d),
    handleSeek: (value) => {
      if (playerRef.current && currentMedia?.type === 'video' && value < progress) {
        playerRef.current.seekTo(value, 'fraction');
      }
    },
    handleCast,
  };
};