// src/hooks/useAudioPlayer.ts

import { useState, useEffect, useCallback, useRef } from 'react';

type PlaybackState = 'playing' | 'paused' | 'stopped' | 'loading' | 'error';

export const useAudioPlayer = (audioUrl: string | null) => {
  const [state, setState] = useState<PlaybackState>('stopped');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioUrl) {
      setState('stopped');
      return;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
    } else {
      audioRef.current.src = audioUrl;
    }

    const audio = audioRef.current;
    audio.playbackRate = 1.13; // Mantenemos tu velocidad

    // --- Definición de Eventos ---
    const onPlaying = () => setState('playing');
    const onPaused = () => setState('paused');
    const onEnded = () => setState('stopped');
    const onError = () => {
      console.error("Error al cargar o reproducir el audio.");
      setState('error');
    };
    const onLoading = () => setState('loading');
    
    // --- ESTA ES LA CORRECCIÓN ---
    // Se ejecuta cuando el audio ha cargado lo suficiente
    // y está listo para ser reproducido.
    const onCanPlay = () => setState('stopped'); // Listo para 'Play'

    // Asignar eventos
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('pause', onPaused);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    audio.addEventListener('loadstart', onLoading);
    
    // Usamos 'canplaythrough' para saber que terminó de cargar
    audio.addEventListener('canplaythrough', onCanPlay); 
    // ELIMINAMOS EL EVENTO 'canplay' QUE CAUSABA EL BUG

    // --- Limpieza del Efecto ---
    return () => {
      if (audio) {
        audio.pause();
        audio.removeEventListener('playing', onPlaying);
        audio.removeEventListener('pause', onPaused);
        audio.removeEventListener('ended', onEnded);
        audio.removeEventListener('error', onError);
        audio.removeEventListener('loadstart', onLoading);
        audio.removeEventListener('canplaythrough', onCanPlay); // Limpiamos el nuevo evento
      }
    };
  }, [audioUrl]); 

  
  const play = useCallback(() => {
    if (audioRef.current && (state === 'paused' || state === 'stopped')) {
      audioRef.current.play().catch(e => console.error("Error al reproducir:", e));
    }
  }, [state]);

  const pause = useCallback(() => {
    if (audioRef.current && state === 'playing') {
      audioRef.current.pause();
    }
  }, [state]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setState('stopped');
    }
  }, []);

  const setSpeed = useCallback((speed: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, []);

  return { state, play, pause, stop, setSpeed };
};