'use client';

import { useState, useEffect, useCallback } from 'react';
import { Video } from '@/lib/types';

interface UseCastResult {
  isCastAvailable: boolean;
  handleCast: () => void;
}

const useCast = (currentVideo: Video | null): UseCastResult => {
  const [isCastAvailable, setIsCastAvailable] = useState(false);

  useEffect(() => {
    // Lógica para detectar la disponibilidad de Cast
    // Esto es un placeholder, la implementación real dependería de la API de Cast
    const checkCastAvailability = () => {
      // Simulación: Cast disponible si hay un video y el navegador lo soporta
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setIsCastAvailable(!!currentVideo && typeof (window as any).chrome?.cast !== 'undefined');
    };

    checkCastAvailability();
    // Podrías añadir listeners para cambios en la disponibilidad de Cast aquí

    return () => {
      // Limpiar listeners si es necesario
    };
  }, [currentVideo]);

  const handleCast = useCallback(() => {
    if (currentVideo) {
      console.log("Intentando transmitir: ", currentVideo.url);
      // Lógica real para iniciar la transmisión a un dispositivo Cast
      // Esto es un placeholder
      alert(`Intentando transmitir ${currentVideo.nombre} a un dispositivo Cast.`);
    } else {
      console.log("No hay video para transmitir.");
    }
  }, [currentVideo]);

  return { isCastAvailable, handleCast };
};

export default useCast;
