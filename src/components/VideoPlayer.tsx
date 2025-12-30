"use client";
import React, { useRef, useEffect, forwardRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap, Power2 } from 'gsap';
import { useVolume } from '@/context/VolumeContext';

// 1. INTERFAZ DE PROPS
export interface VideoPlayerProps {
  videoUrl?: string | null; // URL del video (YouTube / MP4)
  imageUrl?: string | null; // URL de la imagen (Slide Generado)
  audioUrl?: string | null; // URL del audio (Slide Generado)
  onClose: () => void;      // Callback al terminar
  autoplay?: boolean;       // Control de autostart
  duration?: number;        // Duración opcional
}

const VideoPlayer = forwardRef<any, VideoPlayerProps>(
  (
    {
      videoUrl, 
      imageUrl,
      audioUrl,
      onClose,
      autoplay = true,
    }
  ) => {
    const playerRef = useRef<ReactPlayer | null>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    
    // Estados internos
    const [isYouTube, setIsYouTube] = useState(false);
    const [isWebmSlide, setIsWebmSlide] = useState(false);
    
    // Contexto de Volumen Global
    const { isMuted, volume } = useVolume();

    // Estados para Intro (Videos aleatorios)
    const [introVideo, setIntroVideo] = useState('');
    const [showIntro, setShowIntro] = useState(false);
    const introVideos = React.useMemo(() => ['/azul.mp4', '/cuadros.mp4', '/cuadros2.mp4', '/lineal.mp4', '/RUIDO.mp4'], []);

    // 1. DETECCIÓN DE TIPO DE VIDEO E INTRO
    useEffect(() => {
      // Validamos que videoUrl sea un string seguro
      const safeUrl = videoUrl || "";
      const isYt = !!(safeUrl && (safeUrl.includes('youtube.com') || safeUrl.includes('youtu.be')));
      setIsYouTube(isYt);
      
      const isWebm = !!(safeUrl && safeUrl.endsWith('.webm'));
      setIsWebmSlide(isWebm);

      // Solo mostramos intro si es YouTube y estamos en el cliente
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
    }, [videoUrl, introVideos]);

    // 2. GESTIÓN DE VOLUMEN (Sincronización Player <-> Contexto)
    useEffect(() => {
      if (playerRef.current) {
        const internalPlayer = playerRef.current.getInternalPlayer() as any;
        
        if (internalPlayer) {
          // Lógica para videos WebM (Slides antiguos)
          if (isWebmSlide) {
             if (isYouTube) { 
               internalPlayer.unMute?.();
               if (typeof internalPlayer.setVolume === 'function') {
                 internalPlayer.setVolume(volume * 100);
               }
             } else { 
               internalPlayer.muted = false;
               internalPlayer.volume = volume;
             }
          } else { 
            // Lógica estándar (YouTube o MP4 normal)
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
      
      // Control de volumen para el elemento <audio> nativo (Slides Generados)
      if (audioRef.current) {
          audioRef.current.volume = volume;
          audioRef.current.muted = isMuted;
      }
      
    }, [isMuted, volume, isYouTube, isWebmSlide]);

    // 3. EFECTO KEN BURNS (GSAP) PARA SLIDES GENERADOS
    useEffect(() => {
      let tl: gsap.core.Timeline | undefined;
      const imageElement = imgRef.current;
      const audioElement = audioRef.current;

      // Solo activar si NO hay videoUrl y SÍ hay imagen+audio
      if (!videoUrl && imageUrl && audioUrl && imageElement && audioElement && autoplay) {
        
        // Limpiar animaciones previas
        if (tl) tl.kill();

        const playAudio = async () => {
          try {
            audioElement.volume = volume;
            audioElement.muted = isMuted;
            await audioElement.play();
          } catch (error) {
            console.warn('Audio playback auto-prevented:', error);
          }
        };
        playAudio();

        // Configurar escalas y movimiento aleatorio
        const startScale = 1 + Math.random() * 0.1; 
        const endScale = 1 + Math.random() * 0.1;   
        const startX = (Math.random() - 0.5) * 20;  
        const startY = (Math.random() - 0.5) * 20;  
        const endX = (Math.random() - 0.5) * 20;    
        const endY = (Math.random() - 0.5) * 20;    

        // Crear Timeline
        tl = gsap.timeline({ repeat: -1, yoyo: true });

        tl.fromTo(imageElement,
          { scale: startScale, x: startX, y: startY },
          {
            scale: endScale,
            x: endX,
            y: endY,
            duration: 15 + Math.random() * 5, 
            ease: Power2.easeInOut,
          }
        );
      } else if (imageElement && !autoplay) {
        if (tl) tl.kill();
        gsap.set(imageElement, { scale: 1, x: 0, y: 0 });
        if (audioElement) audioElement.pause();
      }

      return () => {
        if (tl) tl.kill();
        if (audioElement) audioElement.pause();
      };
    }, [imageUrl, audioUrl, autoplay, videoUrl, volume, isMuted]); 


    return (
      <>
        <div className="relative w-full h-full">
          {/* --- CAPA DE INTRODUCCIÓN --- */}
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
            
            {/* --- MODO A: REPRODUCTOR DE VIDEO (YouTube / MP4 / HTML) --- */}
            {videoUrl && typeof videoUrl === 'string' && videoUrl.trim() !== '' ? (
              videoUrl.endsWith('.html') ? (
                <iframe
                  src={videoUrl}
                  className="w-full h-full"
                  title="HTML Slide"
                  allow="autoplay"
                />
              ) : (
                <div className='player-wrapper relative w-full h-full bg-black'>
                  <ReactPlayer
                    // [CRÍTICO] KEY: Fuerza remontaje si cambia el video, evitando loops de error
                    key={videoUrl}
                    
                    ref={playerRef}
                    className='react-player'
                    url={videoUrl} // Pasamos videoUrl
                    
                    width='100%'
                    height='100%'
                    playing={autoplay && !showIntro}
                    controls={true}
                    
                    // Callbacks de seguridad
                    onReady={() => console.log("✅ Video Ready:", videoUrl)}
                    onEnded={onClose}
                    onError={(e) => console.error("❌ Error Player (Ignorado):", e)}
                    
                    config={{
                      youtube: {
                        playerVars: { 
                          showinfo: 0,
                          modestbranding: 1,
                          origin: typeof window !== 'undefined' ? window.location.origin : undefined
                        }
                      }
                    }}
                  />
                </div>
              )
            ) : (
              /* --- MODO B: SLIDE GENERADO (Imagen + Audio) --- */
              imageUrl && audioUrl ? (
                <div className="absolute inset-0 overflow-hidden bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    ref={imgRef}
                    src={imageUrl}
                    className="w-full h-full object-cover"
                    alt="News Slide"
                  />
                  <audio
                    ref={audioRef}
                    src={audioUrl}
                    onEnded={onClose}
                    autoPlay={autoplay}
                    // El mute se controla via useEffect, pero dejamos esto por seguridad inicial
                    muted={isMuted} 
                  />
                </div>
              ) : null
            )}
          </div>
          
          {/* Overlay opcional z-10 */}
          <div className="absolute inset-0 z-10 pointer-events-none"></div>
        </div>
      </>
    );
  } 
);

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;