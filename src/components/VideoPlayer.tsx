"use client";
import React, { useRef, useEffect, useState } from 'react'; // Quitamos forwardRef si no se usa externamente
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { useVolume } from '@/context/VolumeContext';
import { useNewsPlayer } from '@/context/NewsPlayerContext';

const ReactPlayer = dynamic(() => import('react-player'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-black flex items-center justify-center"></div>
});

export interface VideoPlayerProps {
  mainVideoUrl: string; // Simplificado: solo necesitamos la URL principal
  onClose?: () => void; // Opcional ahora
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ mainVideoUrl }) => {
    // --- 1. REFS Y ESTADOS ---
    const playerRef = useRef<any>(null);
    const resumeTimeRef = useRef<number>(0);
    
    const [isMounted, setIsMounted] = useState(false);
    const [isPlayingMain, setIsPlayingMain] = useState(true);
    const [localVolume, setLocalVolume] = useState(1);

    // Contextos
    const { volume: globalVolume } = useVolume(); 
    const { activeSlide, stopSlide } = useNewsPlayer();

    // Intro States
    const [introVideo, setIntroVideo] = useState('');
    const [showIntro, setShowIntro] = useState(false);
    
    // Memoizamos el array de intros
    const introVideos = React.useMemo(() => ['/azul.mp4', '/cuadros.mp4', '/cuadros2.mp4', '/lineal.mp4', '/RUIDO.mp4'], []);

    // --- 2. MONTAJE ---
    useEffect(() => { setIsMounted(true); }, []);

    // --- 3. LÓGICA DE INTERRUPCIÓN ---
    useEffect(() => {
      if (activeSlide) {
        // A) Entra un Slide: Guardar tiempo y pausar
        if (playerRef.current) {
          try {
            const t = playerRef.current.getCurrentTime();
            if (t && t > 0) {
                resumeTimeRef.current = t;
            }
          } catch(e) { console.warn(e); }
        }
        setLocalVolume(0);
        setIsPlayingMain(false); 

      } else {
        // B) Se va el Slide: Reanudar
        setIsPlayingMain(true);
        setLocalVolume(globalVolume > 0 ? globalVolume : 1);
        
        if (playerRef.current && resumeTimeRef.current > 0) {
          setTimeout(() => {
             playerRef.current?.seekTo(resumeTimeRef.current, 'seconds');
          }, 100);
        }
      }
    }, [activeSlide, globalVolume]);

    // --- 4. INTRO LOGIC ---
    useEffect(() => {
      if (isMounted && mainVideoUrl && !activeSlide) {
        const isYt = mainVideoUrl.includes('youtube') || mainVideoUrl.includes('youtu.be');
        if (isYt) {
          const randomIntro = introVideos[Math.floor(Math.random() * introVideos.length)];
          setIntroVideo(randomIntro);
          setShowIntro(true);
          const timer = setTimeout(() => setShowIntro(false), 4000);
          return () => clearTimeout(timer);
        }
      }
    }, [mainVideoUrl, introVideos, isMounted, activeSlide]);

    if (!isMounted) return <div className="w-full h-full bg-black" />;

    // Contenido del Slide (Overlay)
    const slideOverlay = activeSlide ? (
        <div className="absolute inset-0 z-50 bg-black animate-in fade-in duration-300">
            <iframe 
              src={activeSlide.url} 
              className="w-full h-full border-none" 
              allow="autoplay"
              title="News Slide"
            />
            <button 
                onClick={(e) => { e.stopPropagation(); stopSlide(); }}
                className="absolute top-4 right-4 bg-black/50 hover:bg-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-all z-50 pointer-events-auto cursor-pointer"
            >
                ✕
            </button>
        </div>
    ) : null;

    const effectiveVolume = activeSlide ? 0 : (globalVolume > 0 ? globalVolume : 0);

    return (
      <div className="relative w-full h-full bg-black overflow-hidden group">
        <div className="w-full h-full absolute inset-0 z-0">
            <ReactPlayer
              ref={playerRef}
              url={mainVideoUrl}
              width="100%"
              height="100%"
              playing={isPlayingMain && !showIntro}
              controls={false}
              volume={effectiveVolume}
              muted={effectiveVolume === 0}
              config={{
                youtube: {
                  playerVars: { 
                    autoplay: 1, controls: 0, modestbranding: 1, rel: 0, showinfo: 0, iv_load_policy: 3
                  }
                }
              }}
            />
        </div>

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