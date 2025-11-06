'use client';

import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import useFader from '@/hooks/useFader';

interface VolumeContextType {
  volume: number;
  isMuted: boolean;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  handleVolumeChange: (volume: number) => void;
  unmute: () => void;
  ramp: (targetVolume: number, duration: number) => void;
}

const VolumeContext = createContext<VolumeContextType | undefined>(undefined);

export const useVolume = () => {
  const context = useContext(VolumeContext);
  if (!context) {
    throw new Error('useVolume must be used within a VolumeProvider');
  }
  return context;
};

export const VolumeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isMuted, setIsMuted] = useState(true);
  const { volume, setVolume, ramp } = useFader(0.03);
  const userVolume = useRef<number>(0.03);

  const unmute = useCallback(() => {
    setIsMuted(false);
    ramp(userVolume.current, 500);
  }, [ramp, userVolume]);

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
  }, [ramp, userVolume]);

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

  const value = {
    volume,
    isMuted,
    setVolume,
    toggleMute,
    handleVolumeChange,
    unmute,
    ramp,
  };

  return (
    <VolumeContext.Provider value={value}>
      {children}
    </VolumeContext.Provider>
  );
};