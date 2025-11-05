'use client';

import { useState, useRef, useCallback } from 'react';

const useFader = (initialVolume: number) => {
  const [volume, setVolume] = useState(initialVolume);
  const rampInterval = useRef<NodeJS.Timeout | null>(null);

  const ramp = useCallback((targetVolume: number, duration: number) => {
    if (rampInterval.current) {
      clearInterval(rampInterval.current);
    }

    const steps = 50;
    const stepDuration = duration / steps;
    const volumeStep = (targetVolume - volume) / steps;

    let currentStep = 0;
    rampInterval.current = setInterval(() => {
      if (currentStep >= steps) {
        if (rampInterval.current) {
          clearInterval(rampInterval.current);
        }
        setVolume(targetVolume);
        return;
      }

      setVolume(prevVolume => prevVolume + volumeStep);
      currentStep++;
    }, stepDuration);
  }, [volume]);

  return { volume, setVolume, ramp };
};

export default useFader;
