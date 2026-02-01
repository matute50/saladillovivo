'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import ReactPlayer from 'react-player';
import { useVolumeStore } from '@/store/useVolumeStore';

// Helper to check if a URL is a YouTube video (redefined here for VideoPlayer context)
const isYouTubeVideo = (url: string) => {
  return url.includes('youtu.be/') || url.includes('youtube.com/');
};

interface VideoPlayerProps {
  videoUrl: string;
  autoplay?: boolean;
  onClose?: () => void;
  onProgress?: (state: { playedSeconds: number, loadedSeconds: number }) => void;
  onDuration?: (duration: number) => void;
  startAt?: number;
  imageUrl?: string;
  audioUrl?: string;
  playerVolume?: number;
  volumen_extra?: number;
}

export default function VideoPlayer({
  videoUrl,
  autoplay = false,
  onClose,
  onProgress,
  onDuration,
  startAt,
  playerVolume,
  volumen_extra = 1
}: VideoPlayerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const playerRef = useRef<ReactPlayer>(null);
  const hasSeeked = useRef(false);
  const [localVolume, setLocalVolume] = useState(0); // Absolute zero volume start
  const isFadingIn = useRef(false); // Ref to track if fade-in is active
  const [forceMute, setForceMute] = useState(autoplay); // Respect autoplay for initial mute
  const [isPlayingInternal, setIsPlayingInternal] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false); // Flag for fade-out at the end
  const durationRef = useRef(0);
  const playStartTimeRef = useRef<number | null>(null); // Track when playback actually started
  const [appOrigin, setAppOrigin] = useState('https://www.saladillovivo.com.ar');
  const [shouldPlay, setShouldPlay] = useState(false); // New state to force playback trigger

  // Consumimos el estado global del volumen
  const { volume, isMuted, unmute, setVolume } = useVolumeStore();

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      setAppOrigin(window.location.origin);
    }
    // Activamos shouldPlay tras un pequeño delay para asegurar la reactividad
    const timer = setTimeout(() => setShouldPlay(autoplay), 100);
    return () => clearTimeout(timer);
  }, [autoplay]);

  // Efecto para sincronizar el volumen base cuando no hay fade activo
  useEffect(() => {
    if (!isFadingIn.current && !isFadingOut && localVolume !== effectiveVolume) {
      setLocalVolume(effectiveVolume);
    }
  }, [effectiveVolume, localVolume, isFadingOut]);

  // --- REINTENTO AGRESIVO DE AUTOPLAY PARA YOUTUBE ---
  useEffect(() => {
    let retryInterval: NodeJS.Timeout;

    if (isMounted && autoplay && isYouTubeVideo(videoUrl)) {
      retryInterval = setInterval(() => {
        if (playerRef.current) {
          const internal = playerRef.current.getInternalPlayer();
          if (internal && typeof internal.playVideo === 'function') {
            const state = typeof internal.getPlayerState === 'function' ? internal.getPlayerState() : -1;

            // Si está pausado (2), canteado (5) o no ha empezado (-1, 0)
            // IMPORTANTE: NO reintenta si está BUFERIZANDO (3)
            if (state === 2 || state === 5 || state === -1 || state === 0) {
              console.log("VideoPlayer: Reintentando playVideo() para salir de estado:", state);
              internal.playVideo();
            } else if (state === 1) {
              if (!isPlayingInternal) {
                console.log("VideoPlayer: Detectado estado PLAYING (1)");
                setIsPlayingInternal(true);
                if (playStartTimeRef.current === null) playStartTimeRef.current = Date.now();
              }
            } else if (state === 3) {
              // En BUFFERING (3), mantenemos isPlayingInternal en true para no resetear timers de muteo
              // pero no actualizamos el playStartTimeRef inicial
              if (!isPlayingInternal) setIsPlayingInternal(true);
            }
          }
        }
      }, 1000);
    }

    return () => {
      if (retryInterval) clearInterval(retryInterval);
    };
  }, [isMounted, autoplay, videoUrl, isPlayingInternal]);

  // Determine the base volume based on props or global context
  const baseVolume = typeof playerVolume === 'number' ? playerVolume : volume;
  // Apply the extra volume multiplier (normalization)
  const effectiveVolume = baseVolume * volumen_extra;

  // Eliminado el fade-in inicial automático por petición del usuario.
  // El reproductor inicia silenciado y se mantiene así hasta interacción manual.

  // Handle Fade-out effect
  const handleProgressInternal = (state: { playedSeconds: number, loadedSeconds: number }) => {
    if (onProgress) onProgress(state);

    if (isYouTubeVideo(videoUrl) && durationRef.current > 0 && !isFadingOut) {
      const timeLeft = durationRef.current - state.playedSeconds;

      // Start fade-out when 1 second remains
      if (timeLeft <= 1 && timeLeft > 0) {
        console.log("VideoPlayer: Iniciando Fade-out de audio (1s restante)");
        setIsFadingOut(true);

        const fadeDuration = 1000;
        const fadeSteps = 20;
        const decrement = localVolume / fadeSteps;
        let currentFadeVolume = localVolume;
        let step = 0;

        const fadeOutInterval = setInterval(() => {
          step++;
          currentFadeVolume = Math.max(0, currentFadeVolume - decrement);
          setLocalVolume(currentFadeVolume);

          if (step >= fadeSteps || currentFadeVolume <= 0) {
            clearInterval(fadeOutInterval);
            setLocalVolume(0);
          }
        }, fadeDuration / fadeSteps);
      }
    }
  };

  const handleDurationInternal = (duration: number) => {
    durationRef.current = duration;
    if (onDuration) onDuration(duration);
  };

  // Handle player ready state and seeking
  const handleReady = useCallback(() => {

    // Si es YouTube y debe ser autoplay, forzamos el play de forma explícita
    if (autoplay && playerRef.current) {
      const internalPlayer = playerRef.current.getInternalPlayer();
      if (internalPlayer && typeof internalPlayer.playVideo === 'function') {
        console.log("VideoPlayer: Forzando playVideo() en YouTube onReady");
        internalPlayer.playVideo();
      }
    }

    if (startAt && startAt > 0 && !hasSeeked.current && playerRef.current) {
      playerRef.current.seekTo(startAt, 'seconds');
      hasSeeked.current = true;
    }
  }, [autoplay, startAt]);

  const handleError = useCallback((e: any) => {
    console.error("VideoPlayer Error:", videoUrl, e);
    if (onClose) onClose();
  }, [videoUrl, onClose]);

  if (!isMounted) return null;

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* CAPA DE BLOQUEO (REGLA DE ORO) 
          Evita cualquier interacción directa con el iframe de YouTube */}
      <div className="absolute inset-0 z-10 bg-transparent" />

      <div className="w-full h-full scale-[1.20] transform-gpu overflow-hidden">
        <ReactPlayer
          ref={playerRef}
          url={videoUrl}
          playing={shouldPlay}
          controls={false} // Desactivamos controles nativos
          volume={localVolume}
          muted={isMuted}
          width="100%"
          height="100%"
          progressInterval={500}
          onEnded={onClose}
          onProgress={handleProgressInternal}
          onDuration={handleDurationInternal}
          onReady={handleReady}
          onError={handleError}
          onPlay={() => {
            setIsPlayingInternal(true);
            if (playStartTimeRef.current === null) playStartTimeRef.current = Date.now();
          }}
          onPause={() => {
            if (autoplay) {
              // BLOQUEADOR DE PAUSAS: Si se pausa durante los primeros 5 segundos de vida
              // y es autoplay, es probable que sea un bloqueo del navegador o error de estado.
              const now = Date.now();
              const playDuration = playStartTimeRef.current ? (now - playStartTimeRef.current) : 0;

              if (playDuration < 5000) {
                console.warn("VideoPlayer: Pausa prematura detectada (" + playDuration + "ms). Forzando Play...");
                if (playerRef.current) {
                  const internal = playerRef.current.getInternalPlayer();
                  if (internal && typeof internal.playVideo === 'function') internal.playVideo();
                }
              } else {
                setIsPlayingInternal(false);
              }
            } else {
              setIsPlayingInternal(false);
            }
          }}
          config={{
            youtube: {
              playerVars: {
                showinfo: 0,
                modestbranding: 1,
                rel: 0,
                autoplay: autoplay ? 1 : 0,
                mute: 1,
                playsinline: 1,
                controls: 0,
                disablekb: 1,
                fs: 0,
                iv_load_policy: 3,
                cc_load_policy: 0,
                origin: appOrigin,
                enablejsapi: 1,
                widget_referrer: appOrigin,
                host: 'https://www.youtube.com'
              }
            },
            file: {
              attributes: {
                controlsList: 'nodownload',
                playsInline: true,
                style: { objectFit: 'cover', width: '100%', height: '100%' }
              }
            }
          }}
        />
      </div>
    </div>
  );
}