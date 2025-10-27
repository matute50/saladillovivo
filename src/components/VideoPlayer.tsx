"use client";
import React, { useRef, useEffect, forwardRef, useImperativeHandle, useState, useCallback } from 'react';
import ReactPlayer from 'react-player/youtube';
import Plyr from 'plyr';
import { motion, AnimatePresence } from 'framer-motion';
import 'plyr/dist/plyr.css';
import '../styles/plyr-theme.css';

interface VideoPlayerProps {
  src: string;
  playing: boolean;
  volume: number;
  muted: boolean;
  onReady?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onError?: (error: Error) => void;
  onProgress?: (state: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => void;
  onDuration?: (duration: number) => void;
  seekToFraction?: number | null;
  setSeekToFraction?: (fraction: number | null) => void;
}

export interface VideoPlayerRef {
  play: () => void;
  pause: () => void;
  mute: () => void;
  unmute: () => void;
  setVolume: (volume: number) => void;
  seekTo: (fraction: number) => void;
  getInternalPlayer: () => Plyr | null;
  getReactPlayer: () => ReactPlayer | null;
}

const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(
  (
    {
      src,
      playing,
      volume,
      muted,
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
    const plyrInstanceRef = useRef<Plyr | null>(null);
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const [isPlyrReady, setIsPlyrReady] = useState(false);

    const [introVideo, setIntroVideo] = useState('');
    const [showIntro, setShowIntro] = useState(false);
    const introVideos = ['/azul.mp4', '/cuadros.mp4', '/cuadros2.mp4', '/lineal.mp4', '/RUIDO.mp4'];

    useEffect(() => {
      if (typeof window !== 'undefined' && src && (src.includes('youtube.com') || src.includes('youtu.be'))) {
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
    }, [src]);

    const handleReactPlayerReady = useCallback(() => {
      if (typeof window !== 'undefined' && wrapperRef.current && !plyrInstanceRef.current) {
        const videoElement = wrapperRef.current.querySelector('video');
        if (videoElement) {
          const plyrPlayer = new Plyr(videoElement, {
            clickToPlay: false,
            controls: [
              'play-large', 'play', 'progress', 'current-time', 'mute', 'volume',
              'captions', 'settings', 'pip', 'airplay', 'fullscreen',
            ],
            youtube: {
              noCookie: true, rel: 0, showinfo: 0, iv_load_policy: 3,
              modestbranding: 1, controls: 0, disablekb: 1, playsinline: 1,
            },
            hideControls: true, invertTime: false, toggleInvert: false,
            tooltips: { controls: true, seek: true },
            fullscreen: { enabled: true, fallback: true, iosNative: true },
            storage: { enabled: false },
          });

          plyrInstanceRef.current = plyrPlayer;

          if (onReady) plyrPlayer.on('ready', () => {
            onReady();
            setIsPlyrReady(true);
          });
          if (onPlay) plyrPlayer.on('play', onPlay);
          if (onPause) plyrPlayer.on('pause', onPause);
          if (onEnded) plyrPlayer.on('ended', onEnded);
          if (onError) plyrPlayer.on('error', (e) => onError(new Error(e.detail.plyr.source)));
          if (onDuration) plyrPlayer.on('durationchange', () => onDuration(plyrPlayer.duration));
          plyrPlayer.on('timeupdate', () => {
            if (onProgress && plyrPlayer.duration) {
              onProgress({
                played: plyrPlayer.currentTime / plyrPlayer.duration,
                playedSeconds: plyrPlayer.currentTime,
                loaded: 0,
                loadedSeconds: 0,
              });
            }
          });
        }
      }
    }, [onReady, onPlay, onPause, onEnded, onError, onProgress, onDuration]);

    useEffect(() => {
      if (typeof window !== 'undefined') { // Asegurar que el código solo se ejecute en el cliente
        return () => {
          plyrInstanceRef.current?.destroy();
          plyrInstanceRef.current = null;
          setIsPlyrReady(false);
        };
      }
    }, []);

    useEffect(() => {
      if (typeof window !== 'undefined' && isPlyrReady && plyrInstanceRef.current) {
        playing ? plyrInstanceRef.current.play() : plyrInstanceRef.current.pause();
      }
    }, [playing, isPlyrReady]);

    useEffect(() => {
      if (typeof window !== 'undefined' && isPlyrReady && plyrInstanceRef.current) {
        plyrInstanceRef.current.muted = muted;
      }
    }, [muted, isPlyrReady]);

    useEffect(() => {
      if (typeof window !== 'undefined' && isPlyrReady && plyrInstanceRef.current) {
        plyrInstanceRef.current.volume = volume;
      }
    }, [volume, isPlyrReady]);
    
    useEffect(() => {
        if (typeof window !== 'undefined' && isPlyrReady && playerRef.current && seekToFraction !== null && typeof seekToFraction === 'number') {
            playerRef.current.seekTo(seekToFraction, 'fraction');
            if (setSeekToFraction) setSeekToFraction(null);
        }
    }, [seekToFraction, setSeekToFraction, isPlyrReady]);

    useImperativeHandle(ref, () => ({
      play: () => { if (typeof window !== 'undefined' && isPlyrReady && plyrInstanceRef.current) plyrInstanceRef.current.play(); },
      pause: () => { if (typeof window !== 'undefined' && isPlyrReady && plyrInstanceRef.current) plyrInstanceRef.current.pause(); },
      mute: () => { if (typeof window !== 'undefined' && isPlyrReady && plyrInstanceRef.current) plyrInstanceRef.current.muted = true; },
      unmute: () => { if (typeof window !== 'undefined' && isPlyrReady && plyrInstanceRef.current) plyrInstanceRef.current.muted = false; },
      setVolume: (vol) => { if (typeof window !== 'undefined' && isPlyrReady && plyrInstanceRef.current) plyrInstanceRef.current.volume = vol; },
      seekTo: (fraction) => {
        if (typeof window !== 'undefined' && isPlyrReady && playerRef.current) {
          playerRef.current.seekTo(fraction, 'fraction');
        }
      },
      getInternalPlayer: () => plyrInstanceRef.current,
      getReactPlayer: () => playerRef.current,
    }), [isPlyrReady]);

    return (
      <div className="relative w-full h-full">
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
        <div ref={wrapperRef} className="plyr-container" style={{ width: '100%', height: '100%' }}>
          <ReactPlayer
            ref={playerRef}
            url={src}
            width="100%"
            height="100%"
            playing={playing}
            volume={volume}
            muted={muted}
            controls={false}
            pip={true}
            config={{
              youtube: {
                playerVars: {
                  showinfo: 0,
                  rel: 0,
                  iv_load_policy: 3,
                  modestbranding: 1,
                  controls: 0,
                  disablekb: 1,
                  playsinline: 1,
                },
              },
            }}
            onReady={handleReactPlayerReady}
          />
        </div>
        <div className="absolute inset-0 z-10"></div>
      </div>
    );
  }
);

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;