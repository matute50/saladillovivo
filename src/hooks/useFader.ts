'use client';

import { useState, useRef, useCallback } from 'react';

/**
 * Custom hook for smooth volume fading.
 * @param {number} initialVolume - The initial volume (0.0 to 1.0).
 * @returns {{volume: number, setVolume: (vol: number) => void, ramp: (targetVolume: number, duration: number, onComplete?: () => void) => void}}
 */
const useFader = (initialVolume = 1.0) => {
  const [volume, setVolume] = useState(initialVolume);
  const animationFrameRef = useRef<number>();

  const ramp = useCallback((targetVolume: number, duration: number, onComplete?: () => void) => {
    if (typeof window === 'undefined') return; // No ejecutar en el servidor

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    const startVolume = volume;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      let newVolume = startVolume + (targetVolume - startVolume) * progress;
      newVolume = Math.max(0, Math.min(1, newVolume)); // Clamp volume between 0 and 1
      setVolume(newVolume);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        if (onComplete) onComplete();
      }
    };
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [volume, setVolume]);

  return { volume, setVolume, ramp };
};

export default useFader;