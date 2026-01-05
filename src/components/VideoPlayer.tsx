"use client";
import React, { useRef, useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { VolumeX } from 'lucide-react'; 
import { useVolume } from '@/context/VolumeContext';
import { useNewsPlayer } from '@/context/NewsPlayerContext';
import { useMediaPlayer } from '@/context/MediaPlayerContext';

const ReactPlayer = dynamic(() => import('react-player'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-black animate-pulse"></div>
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
    
    // Estado para asegurar renderizado solo en cliente
    const [isClientMounted, setIsClientMounted] = useState(false);
    
    useEffect(() => {
        setIsClientMounted(true);
    }, []);
    
    const urlToPlay = mainVideoUrl || videoUrl || "";

    const { volume: globalVolume, isMuted, unmute, setMuted } = useVolume(); 
    const { activeSlide } = useNewsPlayer(); 
    const { isPlaying, play, pause, togglePlayPause, handleOnProgress, handleOnEnded } = useMediaPlayer();

    const [introVideo, setIntroVideo] = useState('');
    const [showIntro, setShowIntro] = useState(false);
    
    const introVideos = useMemo(() => ['/azul.mp4', '/cuadros.mp4', '/cuadros2.mp4', '/lineal.mp4', '/RUIDO.mp4'], []);

    // Configuración del reproductor de YouTube segura para el cliente
    const playerConfig = useMemo(() => {
        if (!isClientMounted) return null;
        
        return {
          youtube: {
            playerVars: { 
              autoplay: 1,
              controls: 0, 
              modestbranding: 1, 
              rel: 0, 
              showinfo: 0, 
              iv_load_policy: 3, 
              disablekb: 1,
              // Aquí solucionamos el error de origen usando window.location.origin real
              origin: window.location.origin, 
              muted: 1, 
              playsinline: 1, 
            }
          }
        };
    }, [isClientMounted]);

    // Silencia el reproductor principal si un slide de noticias está activo
    useEffect(() => {
        if (activeSlide) {
            setMuted(true);
        } else {
             // Opcional: unmute() si deseas que el sonido vuelva solo al cerrar la noticia
             // unmute(); 
        }
    }, [activeSlide, setMuted]);

    // Gestiona pausa/reanudación al abrir noticias
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
        pause(); 
      } else {
        play(); 
        if (playerRef.current && resumeTimeRef.current > 0) {
          // Pequeño delay para asegurar que el player esté listo antes de buscar
          setTimeout(() => {
             playerRef.current?.seekTo(resumeTimeRef.current, 'seconds');
          }, 100);
        }
      }
    }, [activeSlide, play, pause]);

    // Intro aleatoria
    useEffect(() => {
      if (isClientMounted && urlToPlay && !activeSlide) { 
        const isYt = urlToPlay.includes('youtube') || urlToPlay.includes('youtu.be');
        if (isYt) {
          const randomIntro = introVideos[Math.floor(Math.random() * introVideos.length)];
          setIntroVideo(randomIntro);
          setShowIntro(true);
          const timer = setTimeout(() => setShowIntro(false), 4000);
          return () => clearTimeout(timer);
        }
      }
    }, [urlToPlay, introVideos, isClientMounted, activeSlide]);

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

    // Renderizado condicional estricto: Si no estamos en el cliente, no renderizamos nada (o un placeholder)
    if (!isClientMounted) {
        return <div className="w-full h-full bg-black" />;
    }

    return (
      <div className="relative w-full h-full bg-black overflow-hidden group">
        
        <div className="w-full h-full absolute inset-0 z-0 pointer-events-none">
            <ReactPlayer
              ref={playerRef}
              url={urlToPlay}
              width="100%"
              height="100%"
              playing={isPlaying && !showIntro}
              controls={false}
              volume={globalVolume}
              // Usamos el estado del contexto. Asegúrate que VolumeContext inicie en true.
              muted={isMuted} 
              onProgress={handleOnProgress}
              onEnded={onClose || handleOnEnded} 
              // Configuración segura generada con useMemo
              config={playerConfig || undefined} 
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
          {isMuted && (
            <motion.button
              onClick={(e) => {
                e.stopPropagation(); // Evita pausar el video al hacer click en unmute
                unmute();
              }}
              className="absolute top-5 left-5 z-40 text-red-500 bg-black bg-opacity-40 rounded-full p-2 backdrop-blur-sm border border-red-500 shadow-[0_0_15px_rgba(0,0,0,0.7)] flex items-center cursor-pointer hover:bg-black/60 transition-colors"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              title="Activar sonido"
            >
              <VolumeX size={38} strokeWidth={1.5} />
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