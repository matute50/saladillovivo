'use client';

import React, { createContext, useContext, useState, useRef, useCallback, useMemo } from 'react';
import useFader from '@/hooks/useFader';

interface VolumeContextType {
  volume: number;
  isMuted: boolean;
  isAutoplayBlocked: boolean; // Nuevo estado
  setIsAutoplayBlocked: (blocked: boolean) => void; // Nuevo setter
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  toggleMute: () => void;
  unmute: () => void;
  ramp: (targetVolume: number, duration: number) => void;
}

const VolumeContext = createContext<VolumeContextType | undefined>(undefined);

export const useVolume = () => {
  const context = useContext(VolumeContext);
  if (!context) throw new Error('useVolume must be used within a VolumeProvider');
  return context;
};

export const VolumeProvider = ({ children }: { children: React.ReactNode }) => {
  const { volume, setVolume: setFaderVolume } = useFader(0); 
  const userVolume = useRef<number>(0.5); 
  const [isAutoplayBlocked, setIsAutoplayBlocked] = useState(false); // Nuevo estado

  const isMuted = volume === 0;

  const toggleMute = useCallback(() => {
    if (volume === 0) {
      setFaderVolume(userVolume.current);
    } else {
      setFaderVolume(0);
    }
  }, [volume, setFaderVolume]);

  const setVolume = useCallback((newVolume: number) => {
    if (newVolume > 0) {
      userVolume.current = newVolume;
    }
    setFaderVolume(newVolume);
  }, [setFaderVolume]);

  const unmute = useCallback(() => {
    if (volume === 0) {
      setFaderVolume(userVolume.current);
    }
  }, [volume, setFaderVolume]);

  const setMuted = useCallback((muted: boolean) => {
    if (muted) {
      if (volume !== 0) {
        setFaderVolume(0);
      }
    } else {
      if (volume === 0) {
        setFaderVolume(userVolume.current);
      }
    }
  }, [volume, setFaderVolume]);

  const dummyRamp = useCallback(() => {}, []);

  const value = useMemo(() => ({
    volume,
    isMuted,
    isAutoplayBlocked, // Exponer nuevo estado
    setIsAutoplayBlocked, // Exponer nuevo setter
    setVolume,
    setMuted,
    toggleMute,
    unmute,
    ramp: dummyRamp,
  }), [volume, isMuted, isAutoplayBlocked, setVolume, setMuted, toggleMute, unmute, dummyRamp]);

  return (
    <VolumeContext.Provider value={value}>
      {children}
    </VolumeContext.Provider>
  );
};