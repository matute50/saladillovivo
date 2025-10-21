'use client';

// @ts-nocheck
import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { useVideoPlayer } from '@/hooks/useVideoPlayer';
import { useStreamStatus } from '@/hooks/useStreamStatus';

const MediaPlayerContext = createContext(null);

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
    // Use the current volume state directly, or get it from a ref if it's causing issues.
    // For now, let's assume `volume` is the correct starting point.
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
  }, [setVolume]); // <--- Removed 'volume' from dependencies, added 'setVolume'

  return { volume, setVolume, ramp };
};

export const MediaPlayerProvider = ({ children }) => {
  const { volume, setVolume, ramp } = useFader(0.05); // Initial target volume is 5%
  const [isMuted, setIsMuted] = useState(true); // Start muted to guarantee autoplay
  const [isFirstPlay, setIsFirstPlay] = useState(true); // New state for first play
  const userVolume = useRef(0.05); // Default user volume is 5%

  const unmute = useCallback(() => {
    setIsMuted(false);
    ramp(userVolume.current, 500);
  }, [ramp]);

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
  }, [ramp]);

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

  const audioState = {
    volume,
    isMuted,
    isFirstPlay,
    setVolume,
    setIsMuted,
    setIsFirstPlay,
    ramp,
    userVolume,
    unmute,
    toggleMute,
    handleVolumeChange,
  };

  const mediaPlayerLogic = useVideoPlayer(audioState);
  const streamStatus = useStreamStatus(mediaPlayerLogic);

  const value = {
    ...mediaPlayerLogic,
    streamStatus,
    ...audioState,
  };

  return (
    <MediaPlayerContext.Provider value={value}>
      {children}
    </MediaPlayerContext.Provider>
  );
};