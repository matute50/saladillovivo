"use client";
import React, { useRef, useEffect, forwardRef, useImperativeHandle, useState, useCallback } from 'react';
import ReactPlayer from 'react-player/youtube';
import { motion, AnimatePresence } from 'framer-motion';

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
  getInternalPlayer: () => any; // O un tipo más específico si se conoce el tipo del reproductor interno de ReactPlayer
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
      if (onReady) onReady();
    }, [onReady]);


    
    useEffect(() => {
        if (typeof window !== 'undefined' && playerRef.current && seekToFraction !== null && typeof seekToFraction === 'number') {
            playerRef.current.seekTo(seekToFraction, 'fraction');
            if (setSeekToFraction) setSeekToFraction(null);
        }
    }, [seekToFraction, setSeekToFraction]);

    useImperativeHandle(ref, () => ({
      play: () => { if (typeof window !== 'undefined' && playerRef.current) playerRef.current.getInternalPlayer().playVideo(); }, // Método de YouTube API
      pause: () => { if (typeof window !== 'undefined' && playerRef.current) playerRef.current.getInternalPlayer().pauseVideo(); }, // Método de YouTube API
      mute: () => { if (typeof window !== 'undefined' && playerRef.current) playerRef.current.getInternalPlayer().mute(); },
      unmute: () => { if (typeof window !== 'undefined' && playerRef.current) playerRef.current.getInternalPlayer().unmute(); },
      setVolume: (vol: number) => { 
        if (typeof window !== 'undefined' && playerRef.current) {
          const internalPlayer = playerRef.current.getInternalPlayer();
          if (internalPlayer && typeof internalPlayer.setVolume === 'function') {
            internalPlayer.setVolume(vol);
          }
        }
      },
      seekTo: (fraction) => {
        if (typeof window !== 'undefined' && playerRef.current) {
          playerRef.current.seekTo(fraction, 'fraction');
        }
      },
      getInternalPlayer: () => playerRef.current?.getInternalPlayer(),
      getReactPlayer: () => playerRef.current,
    }));

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
        <div className="plyr-container" style={{ width: '100%', height: '100%' }}>
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
              playerVars: {
                showinfo: 0,
                rel: 0,
                iv_load_policy: 3,
                modestbranding: 1,
                controls: 0,
                disablekb: 1,
                playsinline: 1,
              },
            }}
            onReady={handleReactPlayerReady}
            onPlay={onPlay}
            onPause={onPause}
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