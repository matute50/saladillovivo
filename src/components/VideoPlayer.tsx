"use client";
import React, { useRef, useEffect, forwardRef, useImperativeHandle, useState, useCallback } from 'react';
import ReactPlayer from 'react-player';
import { motion, AnimatePresence } from 'framer-motion';
import { useVolume } from '@/context/VolumeContext';

// (Interfaces - sin cambios)
interface VideoPlayerProps {
  src: string;
  playing: boolean;
  onReady?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onError?: (error: Error) => void;
  onProgress?: (state: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => void;
  onDuration?: (duration: number) => void;
  seekToFraction?: number | null;
  setSeekToFraction?: (fraction: number | null) => void;
  muted?: boolean;
}

interface YouTubePlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  mute: () => void;
  unMute: () => void;
  setVolume: (volume: number) => void;
}

export interface VideoPlayerRef {
  play: () => void;
  pause: () => void;
  mute: () => void;
  unmute: () => void;
  setVolume: (volume: number) => void;
  seekTo: (fraction: number) => void;
  getInternalPlayer: () => YouTubePlayer | null;
  getReactPlayer: () => ReactPlayer | null;
}
// (Fin Interfaces)


const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(
  (
    {
      src,
      playing,
      onReady,
      onPlay,
      onPause,
      onEnded,
      onError,
      onProgress,
      onDuration,
      seekToFraction,
      setSeekToFraction,
    },
    ref
  ) => {
    const playerRef = useRef<ReactPlayer | null>(null);
    const [isYouTube, setIsYouTube] = useState(false);
    const [isWebmSlide, setIsWebmSlide] = useState(false);
    
    // Obtenemos los datos de volumen
    const { isMuted, volume } = useVolume();

    // (Estados de la intro - sin cambios)
    const [introVideo, setIntroVideo] = useState('');
    const [showIntro, setShowIntro] = useState(false);
    const introVideos = React.useMemo(() => ['/azul.mp4', '/cuadros.mp4', '/cuadros2.mp4', '/lineal.mp4', '/RUIDO.mp4'], []);

    useEffect(() => {
      const isYt = !!(src && (src.includes('youtube.com') || src.includes('youtu.be')));
      setIsYouTube(isYt);
      const isWebm = !!(src && src.endsWith('.webm')); // Detect .webm
      setIsWebmSlide(isWebm); // Set new state

      if (typeof window !== 'undefined' && isYt) {
        const randomIntro = introVideos[Math.floor(Math.random() * introVideos.length)];
        setIntroVideo(randomIntro);
        setShowIntro(true);

        const timer = setTimeout(() => {
          setShowIntro(false);
        }, 4000);

        return () => clearTimeout(timer);
      } else {
        setShowIntro(false);
      }
    }, [src, introVideos]);

    // Nuevo useEffect para asegurar el autoplay después de la intro o al inicio de la página
    const handlePlayerPause = useCallback(() => {
      if (onPause) onPause();
    }, [onPause]);


    // --- ARREGLO FINAL ---
    // Había dos 'useEffect' idénticos. Los combinamos en uno solo.
    // Este hook es AHORA la única fuente de verdad que sincroniza
    // el contexto de volumen con el reproductor interno.
    useEffect(() => {
      if (playerRef.current) {
        const internalPlayer = playerRef.current.getInternalPlayer() as any;
        if (internalPlayer) {
          // New logic for .webm slides: always unmuted and set volume
          if (isWebmSlide) {
            // For YouTube, use its specific unmute/setVolume methods
            if (isYouTube) { 
              internalPlayer.unMute?.();
              if (typeof internalPlayer.setVolume === 'function') {
                internalPlayer.setVolume(volume * 100);
              }
            } else { // For file players (like .webm), set muted to false and volume
              internalPlayer.muted = false;
              internalPlayer.volume = volume;
            }
          } else { // Existing logic for other videos based on global mute state
            if (isMuted) {
              if (isYouTube) {
                internalPlayer.mute?.();
              } else {
                internalPlayer.muted = true;
              }
            } else {
              if (isYouTube) {
                internalPlayer.unMute?.();
                if (typeof internalPlayer.setVolume === 'function') {
                  internalPlayer.setVolume(volume * 100);
                }
              } else {
                internalPlayer.muted = false;
                internalPlayer.volume = volume;
              }
            }
          }
        }
      }
    }, [isMuted, volume, isYouTube, isWebmSlide]);


    // --- SE BORRÓ EL useEffect DUPLICADO ---
    // El segundo useEffect([volume, isMuted]) que estaba aquí 
    // ha sido eliminado. Era la causa del error.


    // (Hook de seekTo - sin cambios)
    useEffect(() => {
        if (typeof window !== 'undefined' && playerRef.current && seekToFraction !== null && typeof seekToFraction === 'number') {
            playerRef.current.seekTo(seekToFraction, 'fraction');
            if (setSeekToFraction) setSeekToFraction(null);
        }
    }, [seekToFraction, setSeekToFraction]);

    // (useImperativeHandle - sin cambios)
    useImperativeHandle(ref, () => ({
      play: () => {
        if (typeof window !== 'undefined' && playerRef.current) {
          if (isYouTube) {
            (playerRef.current.getInternalPlayer() as YouTubePlayer)?.playVideo?.();
          } else {
            // For file players, the internal player is the video element itself
            (playerRef.current.getInternalPlayer() as HTMLVideoElement)?.play?.();
          }
        }
      },
      pause: () => {
        if (typeof window !== 'undefined' && playerRef.current) {
          if (isYouTube) {
            (playerRef.current.getInternalPlayer() as YouTubePlayer)?.pauseVideo?.();
          } else {
            (playerRef.current.getInternalPlayer() as HTMLVideoElement)?.pause?.();
          }
        }
      },
      mute: () => {
        if (typeof window !== 'undefined' && playerRef.current) {
          if (isYouTube) {
            (playerRef.current.getInternalPlayer() as YouTubePlayer)?.mute?.();
          } else if (playerRef.current.getInternalPlayer()) {
            (playerRef.current.getInternalPlayer() as HTMLVideoElement).muted = true;
          }
        }
      },
      unmute: () => {
        if (typeof window !== 'undefined' && playerRef.current) {
          if (isYouTube) {
            (playerRef.current.getInternalPlayer() as YouTubePlayer)?.unMute?.();
          } else if (playerRef.current.getInternalPlayer()) {
            (playerRef.current.getInternalPlayer() as HTMLVideoElement).muted = false;
          }
        }
      },
      setVolume: (vol: number) => {
        if (typeof window !== 'undefined' && playerRef.current) {
          const internalPlayer = playerRef.current.getInternalPlayer();
          if (internalPlayer) {
            if (isYouTube && typeof (internalPlayer as YouTubePlayer).setVolume === 'function') {
              (internalPlayer as YouTubePlayer).setVolume(vol * 100);
            } else {
              (internalPlayer as HTMLVideoElement).volume = vol;
            }
          }
        }
      },
      seekTo: (fraction) => {
        if (typeof window !== 'undefined' && playerRef.current) {
          playerRef.current.seekTo(fraction, 'fraction');
        }
      },
      getInternalPlayer: () => playerRef.current ? (playerRef.current.getInternalPlayer() as any) : null,
      getReactPlayer: () => playerRef.current,
    }));

    return (
      <div className="relative w-full h-full">
        {/* (Intro - sin cambios) */}
        <AnimatePresence>
          {showIntro && (
            <motion.video
              key="intro-video"
              className="absolute inset-0 w-full h-full object-cover z-20"
              src={introVideo}
              autoPlay
              muted
              playsInline
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, delay: 3.2 }}
            />
          )}
        </AnimatePresence>
        
        {/* (ReactPlayer - sin cambios) */}
        <div className="plyr-container" style={{ width: '100%', height: '100%' }}>
          <ReactPlayer
            origin={typeof window !== 'undefined' ? window.location.origin : ''}
            ref={playerRef}
            url={src}
            width="100%"
            height="100%"
            playing={playing && !showIntro}
            controls={false}
            pip={true}
            muted={isMuted}
            config={{
              file: {
                attributes: {
                  preload: 'auto',
                  crossOrigin: 'anonymous',
                  style: { objectFit: 'cover' }
                },
                forceVideo: true
              },
              youtube: {
                playerVars: {
                  autoplay: 1,
                  showinfo: 0,
                  rel: 0,
                  iv_load_policy: 3,
                  modestbranding: 1,
                  controls: 0,
                  disablekb: 1,
                  playsinline: 1,
                  origin: typeof window !== 'undefined' ? window.location.origin : '',
                },
              }
            }}
            onReady={onReady}
            onPlay={onPlay}
            onPause={handlePlayerPause}
            onEnded={onEnded}
            onError={onError}
            onProgress={onProgress}
            onDuration={onDuration}
          />
        </div>
        <div className="absolute inset-0 z-10"></div>
      </div>
    );
  }
);

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;