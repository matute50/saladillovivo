"use client";
import React, { useRef, useEffect, forwardRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap, Power2 } from 'gsap';
import { useVolume } from '@/context/VolumeContext';

// 1. INTERFAZ ACTUALIZADA
export interface VideoPlayerProps {
  videoUrl?: string | null; // RENOMBRADO: Antes era 'url', ahora es 'videoUrl'
  imageUrl?: string | null;
  audioUrl?: string | null;
  onClose: () => void;
  autoplay?: boolean;
}




const VideoPlayer = forwardRef<any, VideoPlayerProps>(
  (
    {
      videoUrl, // Destructuramos videoUrl
      imageUrl,
      audioUrl,
      onClose,
      autoplay = true,
    }
  ) => {
    const playerRef = useRef<ReactPlayer | null>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isYouTube, setIsYouTube] = useState(false);
    const [isWebmSlide, setIsWebmSlide] = useState(false);
    
    // Obtenemos los datos de volumen
    const { isMuted, volume } = useVolume();

    // (Estados de la intro - sin cambios)
    const [introVideo, setIntroVideo] = useState('');
    const [showIntro, setShowIntro] = useState(false);
    const introVideos = React.useMemo(() => ['/azul.mp4', '/cuadros.mp4', '/cuadros2.mp4', '/lineal.mp4', '/RUIDO.mp4'], []);

    useEffect(() => {
      const isYt = !!(videoUrl && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')));
      setIsYouTube(isYt);
      const isWebm = !!(videoUrl && videoUrl.endsWith('.webm')); // Detect .webm
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
    }, [videoUrl, introVideos]);

    // La prop 'playing' ha sido eliminada. La lógica de reproducción se gestionará mediante 'autoplay'.
    // El callback `handlePlayerPause` y las props de pausa, ready, error, progress, duration, seekTo, setSeekToFraction ya no existen.

    // --- ARREGLO FINAL ---
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

    // Ken Burns effect for image slides
    useEffect(() => {
      let tl: gsap.core.Timeline | undefined;
      const imageElement = imgRef.current;
      const audioElement = audioRef.current;

      // Usar autoplay en lugar de playing
      if (imageUrl && audioUrl && imageElement && audioElement && autoplay) {
        // Stop any previous animation
        if (tl) tl.kill();

        // Ensure audio plays when in this mode and `autoplay` prop is true
        // Mute state is handled by the audio element directly in JSX based on isWebmSlide
        const playAudio = async () => {
          try {
            await audioElement.play();
          } catch (error) {
            console.warn('Audio playback prevented:', error);
          }
        };

        playAudio();

        // Get random start and end points for Ken Burns effect
        const startScale = 1 + Math.random() * 0.1; // 1.0 to 1.1
        const endScale = 1 + Math.random() * 0.1;   // 1.0 to 1.1
        const startX = (Math.random() - 0.5) * 20;  // -10 to 10
        const startY = (Math.random() - 0.5) * 20;  // -10 to 10
        const endX = (Math.random() - 0.5) * 20;    // -10 to 10
        const endY = (Math.random() - 0.5) * 20;    // -10 to 10

        // Create GSAP timeline
        tl = gsap.timeline({ repeat: -1, yoyo: true }); // Loop indefinitely, yoyo back and forth

        tl.fromTo(imageElement,
          { scale: startScale, x: startX, y: startY },
          {
            scale: endScale,
            x: endX,
            y: endY,
            duration: 10 + Math.random() * 10, // Animation duration between 10-20 seconds
            ease: Power2.easeInOut,
          }
        );
      } else if (imageElement && !autoplay) { // Usar autoplay
        if (tl) tl.kill();
        gsap.set(imageElement, { scale: 1, x: 0, y: 0 }); // Reset image to original state
        if (audioElement) audioElement.pause();
      }

      return () => {
        if (tl) tl.kill();
        if (audioElement) audioElement.pause();
      };
    }, [imageUrl, audioUrl, autoplay]); // playing changed to autoplay


    // --- SE BORRÓ EL useEffect DUPLICADO ---
    // El segundo useEffect([volume, isMuted]) que estaba aquí 
    // ha sido eliminado. Era la causa del error.


    // (Hook de seekTo - sin cambios)
    // El hook de seekTo y useImperativeHandle se eliminan por la nueva interfaz.
    // Solo se mantienen playerRef y imgRef.

    return (
      <>
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
          {videoUrl && typeof videoUrl === 'string' && videoUrl.trim() !== '' ? (
            <div className='player-wrapper relative w-full h-full bg-black'>
              <ReactPlayer
                key={videoUrl} 
                ref={playerRef}
                className='react-player'
                url={videoUrl}
                width='100%'
                height='100%'
                playing={autoplay && !showIntro}
                controls={true}
                onReady={() => console.log("✅ YouTube Player Ready:", videoUrl)}
                onStart={() => console.log("▶ YouTube Started")}
                onEnded={onClose}
                onError={(e) => console.error("❌ Error en YouTube Player:", e)}
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
          ) : (
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
                  muted={isWebmSlide ? false : isMuted}
                  loop={false}
                />
              </div>
            ) : null
          )}
        </div>
        <div className="absolute inset-0 z-10"></div>
      </div>
      </>
    );
  } // <--- Cierre de la función de renderizado
); // <--- Cierre del forwardRef

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;