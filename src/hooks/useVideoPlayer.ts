import { useState, useCallback, useRef, useEffect } from 'react';
import { usePlaybackLogic } from '@/hooks/usePlaybackLogic';
import { useCast } from '@/hooks/useCast';

export const useVideoPlayer = ({ userVolume, setIsMuted, ...audioState }: any) => { // Destructure userVolume and setIsMuted
  const playerRef = useRef<any>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [currentMedia, setCurrentMedia] = useState<any>(null);
  const [playingMedia, setPlayingMedia] = useState<any>(null);
  const [playerStatus, setPlayerStatus] = useState('idle');
  const [showControls, setShowControls] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  
  const playbackLogic = usePlaybackLogic({
    playingMedia,
    setCurrentMedia,
    setPlayingMedia,
    setPlayerStatus,
    ...audioState,
  });
  const { setIsPlaying } = playbackLogic;

  const { volume, isMuted } = audioState;

  const { isCastAvailable, handleCast } = useCast(currentMedia);

  const handleError = useCallback((e: any) => {
    console.warn("Player error:", e);
    setPlayerStatus('error');
    // On error, try to play the next video to avoid getting stuck
    playbackLogic.playNextRandomVideo(playingMedia?.id);
  }, [setPlayerStatus, playbackLogic, playingMedia]);

  const handlePlayerReady = useCallback(() => {
    setIsPlayerReady(true);
  }, []);

  useEffect(() => {
    console.log(`useVideoPlayer useEffect: isPlayerReady=${isPlayerReady}, isMuted=${isMuted}, volume=${volume}`);
    if (isPlayerReady && playerRef.current && typeof playerRef.current.getMainPlayer === 'function') {
      const mainPlayer = playerRef.current.getMainPlayer();
      if (mainPlayer && typeof mainPlayer.getInternalPlayer === 'function') {
        const internalPlayer = mainPlayer.getInternalPlayer();
        if (internalPlayer) {
          // Synchronize mute state
          if (typeof internalPlayer.mute === 'function' && typeof internalPlayer.unMute === 'function') {
            if (isMuted) {
              internalPlayer.mute();
              console.log('useVideoPlayer: internalPlayer.mute() called');
            } else {
              internalPlayer.unMute();
              console.log('useVideoPlayer: internalPlayer.unMute() called');
            }
          }
          // Synchronize volume state
          if (typeof internalPlayer.setVolume === 'function') {
            internalPlayer.setVolume(isMuted ? 0 : volume * 100);
            console.log(`useVideoPlayer: useEffect setVolume on internalPlayer to ${isMuted ? 0 : volume * 100}`);
          }
        }
      }
    }
  }, [isPlayerReady, isMuted, volume]);

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
    handleProgress: (state: any) => playbackLogic.handleProgress(state),
    handleDuration: (d: number) => playbackLogic.setDuration(d),
    handleSeek: (value: number) => {
      if (playerRef.current && currentMedia?.type === 'video' && value < playbackLogic.progress) {
        playerRef.current.seekTo(value, 'fraction');
      }
    },
    handleCast,
  };
};