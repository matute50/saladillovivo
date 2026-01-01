"use client";
import React, { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
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
    // --- 1. Refs y Estados ---
    const playerRef = useRef<any>(null);
    const resumeTimeRef = useRef<number>(0);
    
    const [isMounted, setIsMounted] = useState(false);
    const [isPlayingMain, setIsPlayingMain] = useState(true);
    
    // Compatibilidad de URL
    const urlToPlay = mainVideoUrl || videoUrl || "";

    const { volume: globalVolume } = useVolume(); 
    const { activeSlide } = useNewsPlayer(); 
    
    // Importamos togglePlayPause para permitir pausar al hacer clic en la pantalla
    const { handleOnProgress, handleOnEnded, togglePlayPause } = useMediaPlayer();

    const [introVideo, setIntroVideo] = useState('');
    const [showIntro, setShowIntro] = useState(false);
    
    const introVideos = React.useMemo(() => ['/azul.mp4', '/cuadros.mp4', '/cuadros2.mp4', '/lineal.mp4', '/RUIDO.mp4'], []);

    useEffect(() => { setIsMounted(true); }, []);

    // --- 2. Lógica de Interrupción (Slides / Noticias) ---
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
        setIsPlayingMain(false); 
      } else {
        setIsPlayingMain(true);
        if (playerRef.current && resumeTimeRef.current > 0) {
          setTimeout(() => {
             playerRef.current?.seekTo(resumeTimeRef.current, 'seconds');
          }, 100);
        }
      }
    }, [activeSlide]);

    // --- 3. Lógica de Intro (Branding) ---
    useEffect(() => {
      if (isMounted && urlToPlay && !activeSlide) {
        const isYt = urlToPlay.includes('youtube') || urlToPlay.includes('youtu.be');
        if (isYt) {
          const randomIntro = introVideos[Math.floor(Math.random() * introVideos.length)];
          setIntroVideo(randomIntro);
          setShowIntro(true);
          const timer = setTimeout(() => setShowIntro(false), 4000);
          return () => clearTimeout(timer);
        }
      }
    }, [urlToPlay, introVideos, isMounted, activeSlide]);

    if (!isMounted) return <div className="w-full h-full bg-black" />;

    // --- 4. Overlay del Slide (SIN BOTÓN DE CIERRE) ---
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

    const effectiveVolume = activeSlide ? 0 : (globalVolume > 0 ? globalVolume : 0);

    return (
      <div className="relative w-full h-full bg-black overflow-hidden group">
        
        {/* CAPA DE VIDEO (FONDO)
            Aplicamos 'pointer-events-none' para que el mouse "atraviese" el video.
            Así, YouTube nunca detecta el hover y nunca muestra sus títulos ni botones.
        */}
        <div className="w-full h-full absolute inset-0 z-0 pointer-events-none">
            <ReactPlayer
              ref={playerRef}
              url={urlToPlay}
              width="100%"
              height="100%"
              playing={isPlayingMain && !showIntro}
              controls={false}
              volume={effectiveVolume}
              muted={effectiveVolume === 0}
              
              onProgress={handleOnProgress}
              onEnded={onClose || handleOnEnded} 
              
              config={{
                youtube: {
                  playerVars: { 
                    // Ocultamos controles explícitamente, aunque el pointer-events-none hace el trabajo pesado
                    autoplay: 1, controls: 0, modestbranding: 1, rel: 0, showinfo: 0, iv_load_policy: 3, disablekb: 1
                  }
                }
              }}
            />
        </div>

        {/* CAPA DE CONTROL TRANSPARENTE (INTERACCIÓN BÁSICA)
            Esta capa invisible captura los clics para Pausar/Reproducir,
            ya que desactivamos los clics directos sobre YouTube.
        */}
        {!activeSlide && (
          <div 
            className="absolute inset-0 z-10 cursor-pointer" 
            onClick={togglePlayPause}
            title="Click para Pausar/Reproducir"
          />
        )}

        <AnimatePresence>
          {showIntro && !activeSlide && (
            <motion.video
              key="intro-video"
              className="absolute inset-0 w-full h-full object-cover z-20 pointer-events-none"
              src={introVideo}
              autoPlay
              muted={true}
              playsInline
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