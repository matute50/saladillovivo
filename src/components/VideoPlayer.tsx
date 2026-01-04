"use client";
import React, { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { VolumeX } from 'lucide-react'; 
import { useVolume } from '@/context/VolumeContext';
import { useNewsPlayer } from '@/context/NewsPlayerContext';
import { useMediaPlayer } from '@/context/MediaPlayerContext';

const ReactPlayer = dynamic(() => import('react-player'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-black flex items-center justify-center"></div>
});

export interface VideoPlayerProps {
  mainVideoUrl?: string | null;
  videoUrl?: string | null;
  imageUrl?: string | null;
  audioUrl?: string | null;
  onClose?: () => void;
  autoplay?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  mainVideoUrl, 
  videoUrl,
  onClose 
}) => {
    const playerRef = useRef<any>(null);
    const resumeTimeRef = useRef<number>(0);
    
    const [isClientMounted, setIsClientMounted] = useState(false); // Nuevo estado
    
    useEffect(() => {
        setIsClientMounted(true);
    }, []);
    
    const urlToPlay = mainVideoUrl || videoUrl || "";

    const { volume: globalVolume, isMuted, unmute, setMuted } = useVolume(); 
    const { activeSlide } = useNewsPlayer(); 
    // Get global state and controls from the media player context
    const { isPlaying, play, pause, togglePlayPause, handleOnProgress, handleOnEnded } = useMediaPlayer();

    const [introVideo, setIntroVideo] = useState('');
    const [showIntro, setShowIntro] = useState(false);
    
    const introVideos = React.useMemo(() => ['/azul.mp4', '/cuadros.mp4', '/cuadros2.mp4', '/lineal.mp4', '/RUIDO.mp4'], []);

    // Silencia el reproductor principal si un slide de noticias (iframe) está activo.
    // Al salir del slide, se reactiva el sonido.
    useEffect(() => {
        if (activeSlide) {
            setMuted(true);
        } else {
            unmute();
        }
    }, [activeSlide, setMuted, unmute]);

    // Gestiona la pausa y reanudación del video principal cuando un slide de noticias se superpone.
    useEffect(() => {
      if (activeSlide) {
        if (playerRef.current) {
          try {
            const t = playerRef.current.getCurrentTime();
            if (t && t > 0) {
                resumeTimeRef.current = t;
            }
          } catch(e) { console.warn(e); }
        }
        pause(); // Use global pause
      } else {
        play(); // Use global play
        if (playerRef.current && resumeTimeRef.current > 0) {
          setTimeout(() => {
             playerRef.current?.seekTo(resumeTimeRef.current, 'seconds');
          }, 100);
        }
      }
    }, [activeSlide, play, pause]);

    // Muestra un video de introducción corto y aleatorio sobre los videos de YouTube.
    useEffect(() => {
      if (isClientMounted && urlToPlay && !activeSlide) { // Check isClientMounted
        const isYt = urlToPlay.includes('youtube') || urlToPlay.includes('youtu.be');
        if (isYt) {
          const randomIntro = introVideos[Math.floor(Math.random() * introVideos.length)];
          setIntroVideo(randomIntro);
          setShowIntro(true);
          const timer = setTimeout(() => setShowIntro(false), 4000);
          return () => clearTimeout(timer);
        }
      }
    }, [urlToPlay, introVideos, isClientMounted, activeSlide]); // Added isClientMounted to dependencies

    const playerConfig = {
      youtube: {
        playerVars: { 
          autoplay: 1,
          controls: 0, 
          modestbranding: 1, 
          rel: 0, 
          showinfo: 0, 
          iv_load_policy: 3, 
          disablekb: 1,
          origin: typeof window !== 'undefined' ? window.location.origin : 'https://saladillovivo.com.ar', // Fallback a la URL de producción
          muted: 1, // Explícitamente muteado para autoplay
          playsinline: 1, // Reproducción inline
        }
      }
    };

    const slideOverlay = activeSlide ? (
        <div className="absolute inset-0 z-50 bg-black animate-in fade-in duration-300">
            <iframe 
              src={activeSlide.url} 
              className="w-full h-full border-none" 
              allow="autoplay"
              title="News Slide"
            />
        </div>
    ) : null;

    return (
      <div className="relative w-full h-full bg-black overflow-hidden group">
        
        <div className="w-full h-full absolute inset-0 z-0 pointer-events-none">
            <ReactPlayer
              key={isClientMounted ? 'client-player' : 'server-player'} // Force re-render on client mount
              ref={playerRef}
              url={urlToPlay}
              width="100%"
              height="100%"
              playing={isPlaying && !showIntro}
              controls={false}
              volume={globalVolume}
              muted={true} // Forced muted for autoplay
              onProgress={handleOnProgress}
              onEnded={onClose || handleOnEnded} 
              config={playerConfig}
            />
        </div>

        {!activeSlide && (
          <div 
            className="absolute inset-0 z-10 cursor-pointer"
            onClick={togglePlayPause}
            title="Click para Pausar/Reproducir"
          />
        )}

        <AnimatePresence>
          {isMuted && ( // Condicional ahora es isMuted
            <motion.button
              onClick={() => {
                unmute();
              }}
              className="absolute top-5 left-5 z-40 text-red-500 bg-black bg-opacity-40 rounded-full p-2 backdrop-blur-sm border border-red-500 shadow-[0_0_15px_rgba(0,0,0,0.7)] flex items-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              title="Activar sonido"
            >
              <VolumeX size={38} strokeWidth={1.5} />
              <span className="ml-2 mr-3 text-sm font-semibold text-white">SONIDO DESACTIVADO</span>
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showIntro && !activeSlide && (
            <motion.video
              key="intro-video"
              className="absolute inset-0 w-full h-full object-cover z-20 pointer-events-none"
              src={introVideo}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, delay: 3.2 }}
            />
          )}
        </AnimatePresence>

        {slideOverlay}
      </div>
    );
};

export default VideoPlayer;