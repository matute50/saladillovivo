'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import VideoPlayer from '@/components/VideoPlayer';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useNewsPlayerStore } from '@/store/useNewsPlayerStore';
import { useVolumeStore } from '@/store/useVolumeStore';
import CustomControls from '@/components/CustomControls';
import useCast from '@/hooks/useCast';
import VideoTitleBar from '@/components/VideoTitleBar';
import NewsTicker from '@/components/NewsTicker';
import { cn } from '@/lib/utils';
import { Play, Cast } from 'lucide-react';

const isYouTubeVideo = (url: string) => url.includes('youtu.be/') || url.includes('youtube.com/');

interface VideoSectionProps {
  isMobileFixed?: boolean;
  isMobile: boolean;
}

const VideoSection: React.FC<VideoSectionProps> = ({ isMobileFixed = false, isMobile }) => {
  const [isMobileFullscreen, setIsMobileFullscreen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const { currentVideo, isPlaying, handleOnEnded, saveCurrentProgress, setIsPlaying, isPreRollOverlayActive, overlayIntroVideo, startIntroHideTimer, playRandomSequence, viewMode } = usePlayerStore();
  const { currentSlide, isPlaying: isSlidePlaying, stopSlide, isNewsIntroActive, setIsNewsIntroActive } = useNewsPlayerStore();
  const { volume, setVolume, isMuted } = useVolumeStore();
  const { isCastAvailable, handleCast } = useCast(currentVideo);
  const [showControls, setShowControls] = useState(false);
  const [thumbnailSrc, setThumbnailSrc] = useState<string>('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');
  const [showIntroCinematicBars, setShowIntroCinematicBars] = useState(false); // New state for intro cinematic bars
  const lastProcessedVideoIdRef = useRef<string | null>(null);
  const [currentDuration, setCurrentDuration] = useState(0);
  const transitionSignaledRef = useRef(false);


  const audioRef = useRef<HTMLAudioElement>(null);
  const overlayVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);


  const [playBackgroundEarly, setPlayBackgroundEarly] = useState(false);
  const transitionTriggeredRef = useRef(false);

  const isHtmlSlideActive = isSlidePlaying && currentSlide && currentSlide.type === 'html';

  // Detección actualizada para la nueva carpeta
  const isLocalIntro = currentVideo?.url && (
    currentVideo.url.startsWith('/') ||
    currentVideo.url.includes('videos_intro')
  );

  // backgroundVideoUrl and isBackgroundPlaying are no longer directly used in this way
  // as the main video player always uses currentVideo and the overlay uses overlayIntroVideo
  // const backgroundVideoUrl = isLocalIntro ? nextVideo?.url : currentVideo?.url;
  // const isBackgroundPlaying = isLocalIntro ? playBackgroundEarly : isPlaying;

  useEffect(() => {
    setPlayBackgroundEarly(false);
    setIsIntroVideoPlaying(false);
    transitionTriggeredRef.current = false;
    transitionSignaledRef.current = false;
    setCurrentDuration(0);
  }, [currentVideo?.id]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isHtmlSlideActive && currentSlide) {
      setIsPlaying(false);
      const duration = (currentSlide.duration || 15) * 1000;
      timer = setTimeout(() => {
        stopSlide();
        // Al terminar el slide, iniciamos la secuencia aleatoria (Intro + Video)
        playRandomSequence();
      }, duration);
    }
    return () => clearTimeout(timer);
  }, [isHtmlSlideActive, currentSlide, stopSlide, playRandomSequence, setIsPlaying]);

  // Effect para la intro de noticias (2 segundos)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isNewsIntroActive) {
      timer = setTimeout(() => {
        setIsNewsIntroActive(false);
      }, 2500); // 2.5s fijas + 1s fade-out = 3.5s total
    }
    return () => clearTimeout(timer);
  }, [isNewsIntroActive, setIsNewsIntroActive]);

  // New useEffect for cinematic bars on YouTube video start
  useEffect(() => {
    let timer1: NodeJS.Timeout;

    const isNewVideo = currentVideo && currentVideo.id !== lastProcessedVideoIdRef.current;

    if (currentVideo && isPlaying && isNewVideo) {
      console.log("Activando barras cinematográficas por 5s para:", currentVideo.nombre);
      setShowIntroCinematicBars(true);
      lastProcessedVideoIdRef.current = currentVideo.id;

      timer1 = setTimeout(() => {
        setShowIntroCinematicBars(false);
      }, 5000);
    } else if (!isPlaying && showIntroCinematicBars) {
      setShowIntroCinematicBars(false);
    } else if (!currentVideo && showIntroCinematicBars) {
      setShowIntroCinematicBars(false);
    }

    return () => {
      if (timer1) clearTimeout(timer1);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentVideo, isPlaying]); // showIntroCinematicBars omitted to prevent restarting timer unnecessarily

  useEffect(() => {
    if (!currentVideo?.url || isLocalIntro) {
      setThumbnailSrc('data:image/png;base64,iVBORw0KGgoAAAANSUgABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');
      return;
    }
    const cleanUrl = currentVideo.url.trim();
    const match = cleanUrl.match(/(?:youtu\.be\/|youtube\.com\/.*v=)([^&]+)/);
    if (match && match[1]) {
      setThumbnailSrc(`https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`);
    } else {
      setThumbnailSrc('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');
    }
  }, [currentVideo, isLocalIntro]);

  const toggleFullScreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) (document.documentElement as any).requestFullscreen();
    else document.exitFullscreen?.();
  };
  useEffect(() => {
    const handleFs = () => {
      setIsFullScreen(!!document.fullscreenElement);
      if (isMobile) setIsMobileFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFs);
    return () => document.removeEventListener('fullscreenchange', handleFs);
  }, [isMobile]);

  const handleProgress = (state: { playedSeconds: number, loadedSeconds: number }) => {
    const { playedSeconds } = state;

    // Only save progress for the main video, not for the local intro or pre-roll overlay
    if (!isLocalIntro && !isPreRollOverlayActive) {
      saveCurrentProgress(playedSeconds, volume);

      // --- LOGICA DE TRANSICIÓN ANTICIPADA (1s antes) ---
      if (
        currentDuration > 0 &&
        currentDuration - playedSeconds <= 1 &&
        !transitionSignaledRef.current &&
        isYouTubeVideo(currentVideo?.url || '')
      ) {
        console.log("YouTube: Transición anticipada (1s antes del final)");
        transitionSignaledRef.current = true;
        handleOnEnded(setVolume);
      }
    }
  };

  const handleIntroTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (!video.duration) return;

    const timeLeft = video.duration - video.currentTime;

    // Cuando faltan 4 segundos (y no lo hemos activado aún)
    if (timeLeft <= 4 && !transitionTriggeredRef.current) {
      console.log("Intro: Activando video de fondo (4s antes del final)");
      transitionTriggeredRef.current = true;
      setPlayBackgroundEarly(true);
    }
  };

  const [isIntroVideoPlaying, setIsIntroVideoPlaying] = useState(false);

  useEffect(() => {
    if (!isPreRollOverlayActive) {
      setIsIntroVideoPlaying(false);
    }
  }, [isPreRollOverlayActive]);

  const handleIntroMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (video.duration) {
      // Ajustamos la velocidad para que dure exactamente 4 segundos
      const rate = video.duration / 4.0;
      video.playbackRate = rate;
      console.log(`Intro Metadata: duration=${video.duration}, playbackRate set to=${rate}`);
    }
  };

  const [delayedPlay, setDelayedPlay] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPreRollOverlayActive) {
      setDelayedPlay(false);
      // Esperamos 0.5s después de que se activa la intro para empezar el video de fondo
      timer = setTimeout(() => {
        setDelayedPlay(true);
      }, 500);
    } else {
      setDelayedPlay(true);
    }
    return () => clearTimeout(timer);
  }, [isPreRollOverlayActive, currentVideo?.id]);

  const handleIntroPlay = () => {
    console.log("Intro visible y reproduciendo. Activando fondo...");
    setIsIntroVideoPlaying(true);
  };

  // Efecto para forzar la carga y reproducción rápida de la intro
  useEffect(() => {
    if (isPreRollOverlayActive && overlayIntroVideo && overlayVideoRef.current) {
      console.log("Forzando carga inmediata de intro:", overlayIntroVideo.url);
      const v = overlayVideoRef.current;
      v.load();
      v.play().catch(e => console.log("Auto-play prevented, waiting for user interaction or network", e));
    }
  }, [overlayIntroVideo, isPreRollOverlayActive]);

  // Helper para determinar si mostrar el overlay de noticias (Solo para Videos/Imágenes, NO para HTML)
  const isNewsContent = (currentVideo?.categoria === 'Noticias' && !isLocalIntro);
  const displayTitle = currentVideo?.nombre;
  const displaySubtitle = (currentVideo as any)?.resumen || (currentVideo as any)?.description;

  const playerCore = (
    <div
      ref={playerContainerRef}
      className={cn(
        "relative w-full h-full aspect-video bg-black overflow-hidden border-0 md:border md:rounded-xl card-blur-player shadow-lg",
      )}
      onMouseEnter={() => !isMobile && setShowControls(true)}
      onMouseLeave={() => !isMobile && setShowControls(false)}
    // onClick ya no es necesario para la visibilidad de controles con este comportamiento
    >
      <div className="absolute inset-0 w-full h-full md:rounded-xl overflow-hidden bg-black">

        {isHtmlSlideActive && (
          <div className="absolute inset-0 z-40 bg-black">
            <iframe
              src={currentSlide.url}
              className="w-full h-full border-none pointer-events-none"
              title="Slide"
              allow="autoplay"
            />
            {currentSlide.audioUrl && (
              <audio
                ref={audioRef}
                src={currentSlide.audioUrl}
                autoPlay
                className="hidden"
                muted={isMuted}
                onError={(e) => console.error("Error reproduciendo audio de noticia:", e)}
              />
            )}
          </div>
        )}

        {/* Overlay de Título y Ticker para Contenido de Noticias (HTML, Video, Imagen) */}
        {isNewsContent && (
          <>
            <div className="absolute inset-x-0 top-0 z-50 p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
              <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 inline-block max-w-[90%] md:max-w-[70%] shadow-2xl">
                <h2 className="text-white text-base md:text-xl font-bold leading-tight drop-shadow-lg break-words">
                  {displayTitle}
                </h2>
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 z-50 pointer-events-auto h-8 bg-black/80 backdrop-blur-md border-t border-white/10 flex items-center">
              <NewsTicker tickerTexts={[displaySubtitle || '']} />
            </div>
          </>
        )}

        {/* Main VideoPlayer (for YouTube or DB videos) - always renders, controlled by opacity */}
        {currentVideo?.url && !isHtmlSlideActive && (
          <div
            className={cn(
              "absolute inset-0 z-20 bg-black opacity-100"
            )}
            style={{
              transition: 'opacity 0.5s ease-in-out'
            }}
          >
            <VideoPlayer
              key={currentVideo.id}
              videoUrl={currentVideo.url}
              // REGLA: Si hay overlay, el video debe empezar a cargar y reproducirse DE INMEDIATO
              // para estar listo cuando el overlay desaparezca a los 4s.
              autoplay={isPlaying}
              onClose={() => {
                if (!transitionSignaledRef.current) {
                  handleOnEnded(setVolume);
                }
              }}
              onProgress={handleProgress}
              onDuration={setCurrentDuration}
              startAt={(currentVideo as any).startAt || 0}
              volumen_extra={currentVideo.volumen_extra}
            />
          </div>
        )}

        {/* Local Intro (main intro sequence, not the overlay) */}
        {isLocalIntro && !isPreRollOverlayActive && (
          <div className="absolute inset-0 z-30 bg-black">
            <video
              key={currentVideo.id}
              src={currentVideo.url}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
              onEnded={() => handleOnEnded(setVolume)}
              onTimeUpdate={handleIntroTimeUpdate}
              onError={(e) => {
                console.error("ERROR INTRO:", currentVideo.url, e);
                handleOnEnded(setVolume);
              }}
            />
          </div>
        )}

        {/* Pre-roll Overlay Intro - now correctly conditional */}
        {isPreRollOverlayActive && overlayIntroVideo && (
          <div className={cn(
            "absolute inset-0 z-40 bg-black",
            isPreRollOverlayActive ? "opacity-100" : "opacity-0 transition-opacity duration-500 pointer-events-none"
          )}>
            <video
              ref={overlayVideoRef}
              src={overlayIntroVideo.url}
              autoPlay
              playsInline
              muted={true}
              preload="auto"
              className="w-full h-full object-cover"
              onPlay={handleIntroPlay}
              onPlaying={() => {
                handleIntroPlay();
                startIntroHideTimer(); // El timer de 4s empieza cuando REALMENTE se reproduce
              }}
              onLoadedMetadata={handleIntroMetadata}
              onLoadedData={() => {
                console.log("Intro loaded data");
              }}
              onError={(e) => console.error("ERROR PRE-ROLL OVERLAY INTRO:", overlayIntroVideo.url, e)}
            />
          </div>
        )}

        {/* El Thumbnail se queda visible hasta que el video (intro o principal) esté realmente reproduciéndose */}
        {(!isPlaying || (isPreRollOverlayActive && !isIntroVideoPlaying)) && !isLocalIntro && !playBackgroundEarly && !isHtmlSlideActive && (
          <Image
            src={thumbnailSrc}
            alt="Fondo"
            fill
            className="absolute inset-0 z-10 object-cover opacity-60"
            priority
            onError={() => setThumbnailSrc('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=')}
          />
        )}

        <AnimatePresence>
          {/* Intro de Noticias (noticias.mp4) - 3.5 segundos con fade-out */}
          {isNewsIntroActive && (
            <motion.div
              key="news-intro"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 z-50 bg-black"
            >
              <video
                src="/videos_intro/noticias.mp4"
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </motion.div>
          )}

          {showIntroCinematicBars && ( // New cinematic bars for YouTube intro
            <>
              <motion.div
                key="youtube-top-cinematic-bar"
                className="absolute top-0 left-0 right-0 h-14 bg-black z-30 pointer-events-none"
                initial={{ y: 0 }}
                animate={{ y: 0 }}
                exit={{ y: "-100%" }}
                transition={{ duration: 1 }}
              />
              <motion.div
                key="youtube-bottom-cinematic-bar"
                className="absolute bottom-0 left-0 right-0 h-14 bg-black z-30 pointer-events-none"
                initial={{ y: 0 }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ duration: 1 }}
              />
            </>
          )}

          {/* Barras de formato cine cuando está en pausa */}
          {!isPlaying && !isLocalIntro && !isHtmlSlideActive && !isPreRollOverlayActive && !showIntroCinematicBars && (
            <>
              <motion.div
                key="top-cinematic-bar"
                className="absolute top-0 left-0 right-0 h-14 bg-black z-50 pointer-events-none"
                initial={{ opacity: 1 }} // Aparece instantáneamente
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
              <motion.div
                key="bottom-cinematic-bar"
                className="absolute bottom-0 left-0 right-0 h-14 bg-black z-50 pointer-events-none"
                initial={{ opacity: 1 }} // Aparece instantáneamente
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            </>
          )}

          {showControls && !isHtmlSlideActive && !isLocalIntro && !isPreRollOverlayActive && !showIntroCinematicBars && (
            <motion.div key="controls" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute bottom-0 left-0 right-0 w-full z-[51]">
              <CustomControls onToggleFullScreen={toggleFullScreen} isFullScreen={isFullScreen} />
            </motion.div>
          )}

          {showControls && isCastAvailable && !isHtmlSlideActive && !isPreRollOverlayActive && !showIntroCinematicBars && (
            <motion.div key="cast" className="absolute top-4 right-4 z-[52]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <button onClick={handleCast} className="text-white hover:text-orange-500 transition-colors">
                <Cast size={24} />
              </button>
            </motion.div>
          )}

          {!isPlaying && !isHtmlSlideActive && !isLocalIntro && !playBackgroundEarly && !isPreRollOverlayActive && !showIntroCinematicBars && currentVideo && (
            <motion.div key="play" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/20 flex items-center justify-center z-50 pointer-events-none">
              <div className="p-4 bg-black/40 rounded-full border border-white"><Play size={38} className="text-white/80" fill="white" strokeWidth={1.35} /></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  if (isMobileFixed && isMobileFullscreen && typeof document !== 'undefined') {
    return ReactDOM.createPortal(<div className="fixed inset-0 z-[9999] bg-black">{playerCore}</div>, document.body);
  }
  return (
    <div className={isMobileFixed ? "fixed top-[var(--header-height)] left-0 w-full z-40" : "w-full overflow-visible"}>
      <div className="relative aspect-video w-full">{playerCore}</div>
      {viewMode === 'diario' && <VideoTitleBar className="mt-2" />}
    </div>
  );
};

export default VideoSection;