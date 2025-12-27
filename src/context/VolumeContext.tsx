'use client';

import React, { createContext, useContext, useState, useRef, useCallback, useMemo } from 'react';
// 'useFader' ahora es mucho más simple
import useFader from '@/hooks/useFader';

// (Interface - No es necesario cambiarla, podemos dejar 'ramp' como una función vacía)
interface VolumeContextType {
  volume: number;
  isMuted: boolean;
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
  const [isMuted, setIsMuted] = useState(true);
  
  // 'useFader' ya no devuelve 'ramp' ni 'cancelRamp'
  const { volume, setVolume: setFaderVolume } = useFader(0); 

  const userVolume = useRef<number>(0.5); 

  // --- ARREGLO 1: 'toggleMute' ahora es INSTANTÁNEO ---
  // Ya no usa 'ramp'.
  const toggleMute = useCallback(() => {
    setIsMuted(prevIsMuted => {
        const newMutedState = !prevIsMuted;
        if (newMutedState) {
          setFaderVolume(0); // Salta a 0
        } else {
          // Salta al volumen guardado
          setFaderVolume(userVolume.current); 
        }
        return newMutedState;
    });
  }, [setFaderVolume]); // Depende del setter estable de useFader

  // --- ARREGLO 2: 'setVolume' (del slider) ya era instantáneo (Está OK) ---
  const setVolume = useCallback((newVolume: number) => {
    
    // 1. Guarda la preferencia
    userVolume.current = newVolume;

    // 2. Llama al 'setter' crudo para saltar el valor
    setFaderVolume(newVolume);

    // 3. Actualiza el estado de mute
    if (newVolume > 0) {
      setIsMuted(false);
    } else {
      setIsMuted(true);
    }
  }, [setFaderVolume]);

  // Funciones 'dummy' (vacías) para que la interfaz no se rompa
  const dummyRamp = useCallback(() => {}, []);
  const unmute = useCallback(() => {
    setIsMuted(false);
    setFaderVolume(userVolume.current);
  }, [setFaderVolume]);

  const setMuted = useCallback((muted: boolean) => {
    setIsMuted(muted);
    if (muted) {
      setFaderVolume(0);
    } else {
      setFaderVolume(userVolume.current);
    }
  }, [setFaderVolume]);

  const value = useMemo(() => ({
    volume,
    isMuted,
    setVolume, // Nuestra función que "salta"
    setMuted,
    toggleMute, // Nuestra función que "salta"
    unmute,
    ramp: dummyRamp, // Pasa la función vacía
  }), [volume, isMuted, setVolume, setMuted, toggleMute, unmute, dummyRamp]);

  return (
    <VolumeContext.Provider value={value}>
      {children}
    </VolumeContext.Provider>
  );
};