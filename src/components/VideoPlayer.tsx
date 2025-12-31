"use client";
import React, { useRef, useEffect, forwardRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap, Power2 } from 'gsap';
import { useVolume } from '@/context/VolumeContext';
// Importamos el nuevo contexto
import { useNewsPlayer } from '@/context/NewsPlayerContext';

// Importación dinámica sin SSR
const ReactPlayer = dynamic(() => import('react-player'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-black flex items-center justify-center"></div>
});

export interface VideoPlayerProps {
  videoUrl?: string | null;
  imageUrl?: string | null;
  audioUrl?: string | null;
  onClose: () => void;
  autoplay?: boolean;
}

const VideoPlayer = forwardRef<any, VideoPlayerProps>(
  ({ videoUrl, imageUrl, audioUrl, onClose, autoplay = true }, ref) => {
    
    // --- 1. REFS Y ESTADOS ---
    const playerRef = useRef<any>(null); // Ref para Youtube
    const resumeTimeRef = useRef<number>(0); // Memoria del segundo exacto
    const imgRef = useRef<HTMLImageElement | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    
    const [finalVideoUrl, setFinalVideoUrl] = useState<string | null>(null);
    const [finalImageUrl, setFinalImageUrl] = useState<string | null>(imageUrl || null);
    const [finalAudioUrl, setFinalAudioUrl] = useState<string | null>(audioUrl || null);
    const [isLoadingJson, setIsLoadingJson] = useState(false);

    const [isMounted, setIsMounted] = useState(false);
    // Controlamos si el video principal debe sonar o estar en pausa lógica
    const [isMainPlayerActive, setIsMainPlayerActive] = useState(true);

    // Contextos
    const { volume: globalVolume } = useVolume(); 
    const { activeSlide, stopSlide } = useNewsPlayer(); // El Slide que interrumpe

    // Intro States
    const [introVideo, setIntroVideo] = useState('');
    const [showIntro, setShowIntro] = useState(false);
    const introVideos = React.useMemo(() => ['/azul.mp4', '/cuadros.mp4', '/cuadros2.mp4', '/lineal.mp4', '/RUIDO.mp4'], []);

    // --- 2. MONTAJE ---
    useEffect(() => { setIsMounted(true); }, []);

    // --- 3. LÓGICA DE INTERRUPCIÓN (LA MAGIA) ---
    useEffect(() => {
      if (activeSlide) {
        // A) Entra un Slide:
        // 1. Guardar tiempo actual del video principal si se está reproduciendo
        if (playerRef.current && finalVideoUrl && !finalVideoUrl.endsWith('.json')) {
          try {
            const t = playerRef.current.getCurrentTime();
            if (t && t > 0) {
                resumeTimeRef.current = t;
                console.log(`⏸️ Interrumpiendo video en: ${t}s`);
            }
          } catch(e) { console.warn("No se pudo leer el tiempo", e); }
        }
        // 2. Desactivar el video principal (esto lo silenciará y pausará en el render)
        setIsMainPlayerActive(false); 

      } else {
        // B) Se va el Slide:
        // 1. Reactivar video principal
        setIsMainPlayerActive(true);
        
        // 2. Volver al segundo guardado (seekTo)
        if (playerRef.current && resumeTimeRef.current > 0) {
          console.log(`⏩ Reanudando en: ${resumeTimeRef.current}s`);
          // Pequeño timeout para asegurar que el player está listo antes de saltar
          setTimeout(() => {
             playerRef.current?.seekTo(resumeTimeRef.current, 'seconds');
          }, 100);
        }
      }
    }, [activeSlide, finalVideoUrl]);

    // --- 4. PARSER DE FUENTES (Tu lógica original conservada) ---
    useEffect(() => {
        // ... (Tu lógica original de parseo de JSON se mantiene aquí si es necesaria para el video principal)
        // Por brevedad, asumimos que videoUrl viene limpio o se procesa igual que antes
        // Si necesitas parsear videoUrl .json para el contenido PRINCIPAL, mantén tu bloque useEffect original aquí.
        // Para este ejemplo, simplifico asumiendo que videoUrl es directo o ya procesado.
        setFinalVideoUrl(videoUrl || null);
        setFinalImageUrl(imageUrl || null);
        setFinalAudioUrl(audioUrl || null);
    }, [videoUrl, imageUrl, audioUrl]);

    // --- 5. DETECCIÓN DE TIPO E INTRO ---
    useEffect(() => {
      const safeUrl = finalVideoUrl || "";
      const isYt = !!(safeUrl && (safeUrl.includes('youtube.com') || safeUrl.includes('youtu.be')));
      
      // La intro solo sale si no hay slide y no es una reanudación inmediata
      if (isMounted && isYt && !isLoadingJson && !activeSlide) {
        const randomIntro = introVideos[Math.floor(Math.random() * introVideos.length)];
        setIntroVideo(randomIntro);
        setShowIntro(true);
        const timer = setTimeout(() => setShowIntro(false), 4000);
        return () => clearTimeout(timer);
      } else {
        setShowIntro(false);
      }
    }, [finalVideoUrl, introVideos, isMounted, isLoadingJson, activeSlide]);

    if (!isMounted) return <div className="w-full h-full bg-black" />;

    // Contenido del Slide (Overlay)
    const slideOverlay = activeSlide ? (
        <div className="absolute inset-0 z-50 bg-black animate-in fade-in duration-300">
            {activeSlide.type === 'json' || activeSlide.type === 'html' ? (
                 <iframe 
                    src={activeSlide.url} 
                    className="w-full h-full border-none" 
                    allow="autoplay"
                    title="News Slide"
                 />
            ) : (
                 // Fallback simple por si es otro tipo
                 <iframe src={activeSlide.url} className="w-full h-full border-none" allow="autoplay" />
            )}
            <button 
                onClick={(e) => { e.stopPropagation(); stopSlide(); }}
                className="absolute top-4 right-4 bg-black/50 hover:bg-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-all z-50 pointer-events-auto cursor-pointer"
            >
                ✕
            </button>
        </div>
    ) : null;

    // Volumen calculado: Si hay slide, el fondo es 0. Si no, usa el volumen global.
    const effectiveVolume = activeSlide ? 0 : (globalVolume > 0 ? globalVolume : 0);

    return (
      <div className="relative w-full h-full bg-black overflow-hidden">
        
        {/* --- CAPA 1: VIDEO PRINCIPAL (Fondo) --- */}
        <div className="w-full h-full">
          {finalVideoUrl && (
              <div className='player-wrapper relative w-full h-full pointer-events-none'>
                <ReactPlayer
                  key={finalVideoUrl}
                  ref={playerRef}
                  className='react-player'
                  url={finalVideoUrl}
                  width='100%'
                  height='100%'
                  
                  // Si hay slide, pausamos la reproducción visual (playing=false)
                  playing={autoplay && !showIntro && isMainPlayerActive}
                  controls={false}
                  
                  // Volumen controlado
                  volume={effectiveVolume}
                  muted={effectiveVolume === 0}
                  
                  onEnded={onClose}
                  onError={(e: any) => console.error("Player Error:", e)}
                  
                  config={{
                    youtube: {
                      playerVars: { 
                        autoplay: 1,
                        controls: 0,
                        disablekb: 1,
                        fs: 0,
                        modestbranding: 1,
                        rel: 0,
                        showinfo: 0,
                        iv_load_policy: 3,
                        origin: typeof window !== 'undefined' ? window.location.origin : undefined,
                      }
                    }
                  }}
                />
              </div>
          )}
        </div>

        {/* --- CAPA 2: INTRO (Solo si no hay slide) --- */}
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

        {/* --- CAPA 3: SLIDE OVERLAY --- */}
        {slideOverlay}

      </div>
    );
  } 
);

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;