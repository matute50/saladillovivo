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

  // Consumimos el estado global del volumen
  const { volume, isMuted } = useVolumeStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Efecto para liberar el muteo forzado inicial tras el arranque
  useEffect(() => {
    if (isPlayerReady && forceMute) {
      const timer = setTimeout(() => setForceMute(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isPlayerReady, forceMute]);

  // Determine the base volume based on props or global context
  const baseVolume = typeof playerVolume === 'number' ? playerVolume : volume;
  // Apply the extra volume multiplier (normalization)
  const effectiveVolume = baseVolume * volumen_extra;

  // Fade-in effect for YouTube videos
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isYouTubeVideo(videoUrl) && autoplay && effectiveVolume > 0 && isPlayerReady) { // Added isPlayerReady condition
      // Only start fade-in if not already fading in for the same video/state
      if (isFadingIn.current && localVolume === effectiveVolume) return;

      isFadingIn.current = true;
      setLocalVolume(0); // Start from muted for fade-in

      const fadeDuration = 1000; // 1 second exact
      const fadeSteps = 20; // Fewer steps for efficiency but enough for smoothness
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
          setLocalVolume(effectiveVolume); // Ensure it's at final volume
        }
      }, fadeDuration / fadeSteps);
    } else {
      // If not YouTube, or not autoplaying, or muted, or effectiveVolume is 0, or player not ready
      // just set local volume to effective immediately.
      if (effectiveVolume !== localVolume) {
        setLocalVolume(effectiveVolume);
      }
      isFadingIn.current = false; // Reset fade-in status
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
      isFadingIn.current = false; // Ensure reset on unmount or dependency change
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoUrl, autoplay, effectiveVolume, isMuted, isPlayerReady]); // localVolume omitted to prevent infinite loop

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
          onProgress={onProgress}
          onDuration={onDuration}
          onReady={handleReady}
          onError={handleError}
          config={{
            youtube: {
              playerVars: {
                showinfo: 0,
                modestbranding: 1,
                rel: 0,
                autoplay: autoplay ? 1 : 0,
                mute: 1, // Forzamos mute en la API de YT para mayor seguridad de autoplay
                playsinline: 1,
                controls: 0,
                disablekb: 1,
                fs: 0,
                iv_load_policy: 3,
                cc_load_policy: 0,
                origin: typeof window !== 'undefined' ? window.location.origin : ''
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