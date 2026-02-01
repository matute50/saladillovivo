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
  const [localVolume, setLocalVolume] = useState(0); // State for fade-in volume
  const isFadingIn = useRef(false); // Ref to track if fade-in is active
  const [isPlayerReady, setIsPlayerReady] = useState(false); // New state to track if ReactPlayer is ready
  const [forceMute, setForceMute] = useState(autoplay);
  const [isPlayingInternal, setIsPlayingInternal] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false); // Flag for fade-out at the end
  const durationRef = useRef(0);

  // Consumimos el estado global del volumen
  const { volume, isMuted } = useVolumeStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Efecto para liberar el muteo forzado inicial tras detectar reproducción REAL y ESTABLE
  useEffect(() => {
    let playTimer: NodeJS.Timeout;
    // Solo iniciamos el temporizador si el video está realmente reproduciéndose (state 1)
    if (isPlayingInternal && forceMute) {
      console.log("VideoPlayer: Iniciando cuenta atrás para liberar forceMute...");
      playTimer = setTimeout(() => {
        console.log("VideoPlayer: Liberando forceMute tras 2.5s de reproducción estable");
        setForceMute(false);
      }, 2500);
    } else if (!isPlayingInternal && forceMute) {
      // Si el video se pausa o entra en buffering antes de los 2.5s, cancelamos el timer
      if (playTimer!) clearTimeout(playTimer);
    }
    return () => {
      if (playTimer) clearTimeout(playTimer);
    };
  }, [isPlayingInternal, forceMute]);

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
              console.log("VideoPlayer: Reintentando playVideo() - Estado:", state);
              internal.playVideo();
            } else if (state === 1 && !isPlayingInternal) {
              console.log("VideoPlayer: Detectado estado PLAYING (1)");
              setIsPlayingInternal(true);
            } else if (state === 3) {
              // Si está buferizando, nos aseguramos de que isPlayingInternal sea false para no des-silenciar antes de tiempo
              if (isPlayingInternal) setIsPlayingInternal(false);
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

  // Fade-in effect for YouTube videos (triggers when forceMute is released)
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isYouTubeVideo(videoUrl) && autoplay && effectiveVolume > 0 && isPlayingInternal && !forceMute && !isFadingOut) {
      if (isFadingIn.current && localVolume === effectiveVolume) return;

      console.log("VideoPlayer: Iniciando Fade-in de audio");
      isFadingIn.current = true;
      setLocalVolume(0);

      const fadeDuration = 1000;
      const fadeSteps = 20;
      const increment = effectiveVolume / fadeSteps;
      let currentFadeVolume = 0;
      let step = 0;

      interval = setInterval(() => {
        step++;
        currentFadeVolume = Math.min(effectiveVolume, currentFadeVolume + increment);
        setLocalVolume(currentFadeVolume);

        if (step >= fadeSteps || currentFadeVolume >= effectiveVolume) {
          clearInterval(interval);
          isFadingIn.current = false;
          setLocalVolume(effectiveVolume);
        }
      }, fadeDuration / fadeSteps);
    } else if (!forceMute && !isFadingOut) {
      if (effectiveVolume !== localVolume && !isFadingIn.current) {
        setLocalVolume(effectiveVolume);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [videoUrl, autoplay, effectiveVolume, forceMute, isPlayingInternal, isFadingOut]);

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
    setIsPlayerReady(true); // Player is ready

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

      <div className="w-full h-full scale-[1.02] transform-gpu">
        <ReactPlayer
          ref={playerRef}
          url={videoUrl}
          playing={autoplay}
          controls={false} // Desactivamos controles nativos
          volume={isMuted ? 0 : localVolume}
          muted={forceMute || isMuted} // Muteamos siempre al inicio si es autoplay para garantizar el play
          width="100%"
          height="100%"
          progressInterval={500}
          onEnded={onClose}
          onProgress={handleProgressInternal}
          onDuration={handleDurationInternal}
          onReady={handleReady}
          onError={handleError}
          onPlay={() => setIsPlayingInternal(true)}
          onPause={() => {
            if (autoplay) setIsPlayingInternal(false);
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
                origin: 'https://www.saladillovivo.com.ar',
                enablejsapi: 1,
                widget_referrer: 'https://www.saladillovivo.com.ar',
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