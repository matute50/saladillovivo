"use client";
import React, { useRef, useEffect, forwardRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap, Power2 } from 'gsap';
import { useVolume } from '@/context/VolumeContext';

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
  (
    {
      videoUrl, 
      imageUrl,
      audioUrl,
      onClose,
      autoplay = true,
    }
  ) => {
    // Refs
    const playerRef = useRef<any>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    
    // Estados internos
    const [finalVideoUrl, setFinalVideoUrl] = useState<string | null>(null);
    const [finalImageUrl, setFinalImageUrl] = useState<string | null>(imageUrl || null);
    const [finalAudioUrl, setFinalAudioUrl] = useState<string | null>(audioUrl || null);
    const [isLoadingJson, setIsLoadingJson] = useState(false);

    // Estados lógicos
    const [isYouTube, setIsYouTube] = useState(false);
    const [isWebmSlide, setIsWebmSlide] = useState(false);
    const [hasMounted, setHasMounted] = useState(false);

    // Contexto de Volumen
    const { volume } = useVolume(); 

    // Intro
    const [introVideo, setIntroVideo] = useState('');
    const [showIntro, setShowIntro] = useState(false);
    const introVideos = React.useMemo(() => ['/azul.mp4', '/cuadros.mp4', '/cuadros2.mp4', '/lineal.mp4', '/RUIDO.mp4'], []);

    // 1. MONTAJE
    useEffect(() => {
      setHasMounted(true);
    }, []);

    // 2. PARSER DE FUENTES (JSON)
    useEffect(() => {
      const resolveMediaSource = async () => {
        setFinalVideoUrl(null);
        setFinalImageUrl(imageUrl || null);
        setFinalAudioUrl(audioUrl || null);

        if (!videoUrl) return;

        if (videoUrl.toLowerCase().endsWith('.json')) {
          console.log("📄 Interpretando slide JSON...", videoUrl);
          setIsLoadingJson(true);
          try {
            const res = await fetch(videoUrl);
            if (!res.ok) throw new Error("Error fetching JSON");
            const data = await res.json();
            
            setFinalImageUrl(data.image_url || data.imageUrl || data.imagen);
            setFinalAudioUrl(data.audio_url || data.audioUrl || data.audio);
            setFinalVideoUrl(null); 
          } catch (error) {
            console.error("❌ Error en JSON:", error);
            onClose();
          } finally {
            setIsLoadingJson(false);
          }
        } else {
          setFinalVideoUrl(videoUrl);
          setFinalImageUrl(null);
        }
      };
      resolveMediaSource();
    }, [videoUrl, imageUrl, audioUrl]); 

    // 3. DETECCIÓN DE TIPO
    useEffect(() => {
      const safeUrl = finalVideoUrl || "";
      const isYt = !!(safeUrl && (safeUrl.includes('youtube.com') || safeUrl.includes('youtu.be')));
      setIsYouTube(isYt);
      
      const isWebm = !!(safeUrl && safeUrl.endsWith('.webm'));
      setIsWebmSlide(isWebm);

      if (hasMounted && isYt && !isLoadingJson) {
        const randomIntro = introVideos[Math.floor(Math.random() * introVideos.length)];
        setIntroVideo(randomIntro);
        setShowIntro(true);
        const timer = setTimeout(() => setShowIntro(false), 4000);
        return () => clearTimeout(timer);
      } else {
        setShowIntro(false);
      }
    }, [finalVideoUrl, introVideos, hasMounted, isLoadingJson]);

    // 4. CONTROL DE VOLUMEN FORZADO
    useEffect(() => {
      if (!hasMounted) return;
      
      const isMuted = volume === 0;
      const activeVolume = volume;

      if (playerRef.current) {
        const internalPlayer = playerRef.current.getInternalPlayer ? playerRef.current.getInternalPlayer() : null;
        if (internalPlayer) {
          try {
            if (isYouTube) {
              if (isMuted) {
                internalPlayer.mute?.();
              } else {
                internalPlayer.unMute?.();
              }
              internalPlayer.setVolume?.(activeVolume * 100);
            } else {
               internalPlayer.muted = isMuted;
               internalPlayer.volume = activeVolume;
            }
          } catch(e) {}
        }
      }
      
      if (audioRef.current) {
          audioRef.current.muted = isMuted;
          audioRef.current.volume = activeVolume;
      }
    }, [volume, isYouTube, hasMounted, finalVideoUrl]); 

    // 5. ANIMACIÓN GSAP
    useEffect(() => {
      if (!hasMounted || isLoadingJson) return;
      let tl: gsap.core.Timeline | undefined;

      if (!finalVideoUrl && finalImageUrl && finalAudioUrl && imgRef.current && audioRef.current && autoplay) {
        if (tl) tl.kill();

        const playAudio = async () => {
          try {
            if (audioRef.current) {
                const isMuted = volume === 0;
                audioRef.current.muted = isMuted;
                audioRef.current.volume = volume;
                await audioRef.current.play();
            }
          } catch (error) {
            console.warn('Audio play warning:', error);
          }
        };
        playAudio();

        const startScale = 1 + Math.random() * 0.1; 
        const endScale = 1 + Math.random() * 0.1;   
        const startX = (Math.random() - 0.5) * 20;  
        const endX = (Math.random() - 0.5) * 20;    

        tl = gsap.timeline({ repeat: -1, yoyo: true });
        tl.fromTo(imgRef.current,
          { scale: startScale, x: startX },
          { scale: endScale, x: endX, duration: 15, ease: Power2.easeInOut }
        );
      } 
      return () => { if (tl) tl.kill(); };
    }, [finalImageUrl, finalAudioUrl, finalVideoUrl, autoplay, hasMounted, isLoadingJson, volume]); 

    if (!hasMounted) return null;
    if (isLoadingJson) return <div className="w-full h-full bg-black" />;

    const initialVolume = volume > 0 ? volume : 1.0;

    return (
      <div className="relative w-full h-full bg-black overflow-hidden">
        {/* INTRO YOUTUBE */}
        <AnimatePresence>
          {showIntro && (
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
        
        <div className="w-full h-full">
          {finalVideoUrl && typeof finalVideoUrl === 'string' ? (
            /* --- MODO VIDEO (LIMPIO) --- */
            // pointer-events-none en el wrapper evita clics en el video (pausa/menu contextual)
            // pero permite ver el video. Los controles propios deben estar en una capa superior (z-index mayor).
            <div className='player-wrapper relative w-full h-full pointer-events-none'>
              <ReactPlayer
                key={finalVideoUrl}
                ref={playerRef}
                className='react-player'
                url={finalVideoUrl}
                width='100%'
                height='100%'
                
                // AUTOPLAY FORZADO Y CONTROLES APAGADOS
                playing={autoplay && !showIntro}
                controls={false} // <--- APAGA CONTROLES NATIVOS
                
                muted={true}
                volume={initialVolume}
                
                onEnded={onClose}
                onError={(e: any) => console.error("Player Error:", e)}
                
                config={{
                  youtube: {
                    playerVars: { 
                      autoplay: 1,
                      controls: 0,       // Refuerzo: Apagar controles
                      disablekb: 1,      // Apagar teclado
                      fs: 0,             // Apagar botón fullscreen
                      modestbranding: 1, // Minimizar logo
                      rel: 0,
                      showinfo: 0,
                      iv_load_policy: 3, // Sin anotaciones
                      origin: window.location.origin,
                    }
                  },
                  file: {
                    attributes: {
                      style: { objectFit: 'cover', width: '100%', height: '100%' },
                      autoPlay: true,
                      muted: true
                    }
                  }
                }}
              />
            </div>
          ) : (
            /* --- MODO SLIDE --- */
            finalImageUrl && finalAudioUrl ? (
              <div className="absolute inset-0 overflow-hidden bg-black pointer-events-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imgRef}
                  src={finalImageUrl}
                  className="w-full h-full object-cover"
                  alt="Slide"
                />
                <audio
                  ref={audioRef}
                  src={finalAudioUrl}
                  onEnded={onClose}
                  autoPlay={autoplay}
                  muted={true}
                />
              </div>
            ) : null
          )}
        </div>
      </div>
    );
  } 
);

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;