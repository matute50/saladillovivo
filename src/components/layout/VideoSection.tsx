'use client';

import React, { useRef, useState, useEffect } from 'react';
import VideoPlayer from '@/components/VideoPlayer';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useNewsPlayerStore } from '@/store/useNewsPlayerStore';
import { useVolumeStore } from '@/store/useVolumeStore';
import CustomControls from '@/components/CustomControls';
import VideoTitleBar from '@/components/VideoTitleBar';
import NewsTicker from '@/components/NewsTicker';
import { useMediaPlayer } from '@/context/MediaPlayerContext';
import WeatherOverlay from '@/components/tv/WeatherOverlay';
import { cn, cleanTitle } from '@/lib/utils';
import { Play } from 'lucide-react';
import AntiGravityLayer from './AntiGravityLayer';

// Simplified VideoSection for Desktop Only


const VideoSection: React.FC = () => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const [areCinematicBarsActive, setAreCinematicBarsActive] = useState(false);
  const isInitialLoadRef = useRef(true);

  const {
    currentVideo,
    isPlaying,
    handleOnEnded,
    saveCurrentProgress,
    setIsPlaying,
    isPreRollOverlayActive,
    overlayIntroVideo,
    viewMode,
    isContentPlaying,
    pauseForSlide,
    resumeAfterSlide,
    finishIntro,
  } = usePlayerStore();

  const { currentSlide, isPlaying: isSlidePlaying, stopSlide, isNewsIntroActive, setIsNewsIntroActive } = useNewsPlayerStore();
  const { volume, setVolume, isMuted, unmute } = useVolumeStore(); // Added unmute

  // Auto-Unmute for News or HTML Slides
  const isHtmlSlideActive = isSlidePlaying && currentSlide && currentSlide.type === 'html';
  const isLocalIntro = currentVideo?.url && (
    currentVideo.url.startsWith('/') ||
    currentVideo.url.includes('videos_intro')
  ) || false;
  const isNewsContent = !!(currentVideo?.categoria === 'Noticias' && !isLocalIntro);

  useEffect(() => {
    // Solo forzamos volumen si YA está reproduciendo y NO es el inicio (para cumplir con Autoplay Muted)
    if ((isNewsContent || isHtmlSlideActive) && !isInitialLoadRef.current) {
      setVolume(1);
    }
  }, [isNewsContent, isHtmlSlideActive, setVolume]);

  // Limpiamos el flag de carga inicial solo después de que el primer video haya tenido tiempo de empezar
  // o cuando cambie el video por segunda vez.
  useEffect(() => {
    if (isInitialLoadRef.current && currentVideo) {
      const timer = setTimeout(() => {
        // isInitialLoadRef.current = false; // No lo limpiamos aquí aún, dejamos que handleOnEnded lo haga mejor
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [currentVideo]);

  const [showControls, setShowControls] = useState(false);
  const [thumbnailSrc, setThumbnailSrc] = useState<string>('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');
  const cinematicTimerRef = useRef<NodeJS.Timeout|null>(null);
  const lastProcessedVideoIdRef = useRef<string | null>(null);
  const [currentDuration, setCurrentDuration] = useState(0);
  const transitionSignaledRef = useRef(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const introVideoRef = useRef<HTMLVideoElement>(null);
  const [isIntroFadingOut, setIsIntroFadingOut] = useState(false);


  // --- SINGLE PLAYER LOGIC (v23.9) ---

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const [playBackgroundEarly, setPlayBackgroundEarly] = useState(false);
  const transitionTriggeredRef = useRef(false);
  const introWatchdogRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setPlayBackgroundEarly(false);
    transitionTriggeredRef.current = false;
    transitionSignaledRef.current = false;
    setCurrentDuration(0);
    setIsIntroFadingOut(false);
  }, [currentVideo?.id]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isHtmlSlideActive && currentSlide) {
      // RULE OF GOLD: Pause and save background state
      pauseForSlide(); // Uses internal savedProgress automatically

      const duration = (currentSlide.duration || 15) * 1000;
      timer = setTimeout(() => {
        stopSlide();
        resumeAfterSlide();
      }, duration);
    }
    return () => clearTimeout(timer);
  }, [isHtmlSlideActive, currentSlide, stopSlide, resumeAfterSlide, pauseForSlide]);

  // FIX AUTOPLAY: Si isPreRollOverlayActive está activo pero no hay video de intro asignado,
  // el reproductor quedaría bloqueado indefinidamente (isContentPlaying nunca se activaría).
  // En ese caso, saltamos la intro directamente.
  useEffect(() => {
    if (isPreRollOverlayActive && !overlayIntroVideo && currentVideo) {
      // Sin intro = sin overlay = activar contenido inmediatamente
      const timer = setTimeout(() => {
        finishIntro();
      }, 100); // 100ms de gracia para evitar estados intermedios del store
      return () => clearTimeout(timer);
    }
  }, [isPreRollOverlayActive, overlayIntroVideo, currentVideo, finishIntro]);

  // --- UNIVERSAL PAUSE-ZOOM STRATEGY (V23.2) ---
  // No specific "Return from News" detection needed.
  // The Pause state itself triggers the shield.

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isNewsIntroActive) {
      timer = setTimeout(() => {
        setIsNewsIntroActive(false);
      }, 4000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isNewsIntroActive, setIsNewsIntroActive]);

  useEffect(() => {
    const isNewVideo = !!(currentVideo && currentVideo.id !== lastProcessedVideoIdRef.current);

    // Clear any previous timer
    const clearTimer = () => {
      if (cinematicTimerRef.current) {
        clearTimeout(cinematicTimerRef.current);
        cinematicTimerRef.current = null;
      }
    };

    if (currentVideo?.id === 'live-stream') {
      setAreCinematicBarsActive(false);
      clearTimer();
      lastProcessedVideoIdRef.current = 'live-stream';
      return;
    }

    if (isPlaying) {
      if (isNewVideo && !isLocalIntro && !isPreRollOverlayActive) {
        // --- CASE: NEW VIDEO START (INTRO) ---
        lastProcessedVideoIdRef.current = currentVideo.id;
        setAreCinematicBarsActive(true);
        clearTimer();
        cinematicTimerRef.current = setTimeout(() => {
          setAreCinematicBarsActive(false);
        }, 5000); // 5s Anti-Branding Shield
      } else if (!isNewVideo) {
        // --- CASE: RESUME PLAY (Universal Anti-Branding V23.2) ---
        // Resume from Pause (or News) -> Hold Shield for 2s, then Zoom Out (1s)

        setAreCinematicBarsActive(true); // Ensure active
        clearTimer();
        cinematicTimerRef.current = setTimeout(() => {
          setAreCinematicBarsActive(false); // Triggers Zoom Out transition
        }, 5000); // 5s Hold (V23.3)
      } else if (isNewVideo) {
        // Backup: update ref even if we don't show bars
        lastProcessedVideoIdRef.current = currentVideo.id || null;
      }
    } else {
      // --- CASE: PAUSED (Manual or Auto) ---
      // Force Shield + Over-Scaling immediately
      if (!isLocalIntro && !isHtmlSlideActive && !isPreRollOverlayActive && currentVideo) {

        setAreCinematicBarsActive(true);
        clearTimer(); // Keep active indefinitely while paused
      } else {
        setAreCinematicBarsActive(false);
        clearTimer();
      }
    }

    return () => clearTimer();
  }, [isPlaying, currentVideo?.id, isLocalIntro, isHtmlSlideActive, isPreRollOverlayActive, currentVideo]);

  useEffect(() => {
    if (!currentVideo?.url || isLocalIntro) {
      setThumbnailSrc('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');
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
    };
    document.addEventListener('fullscreenchange', handleFs);
    return () => document.removeEventListener('fullscreenchange', handleFs);
  }, []);

  const handleProgress = (state: { playedSeconds: number, loadedSeconds: number }) => {
    const { playedSeconds } = state;

    if (!isLocalIntro && !isPreRollOverlayActive) {
      saveCurrentProgress(playedSeconds, volume);

      if (
        currentDuration > 0 &&
        currentDuration - playedSeconds <= 1 &&
        !transitionSignaledRef.current
      ) {

        transitionSignaledRef.current = true;
        handleOnEnded(setVolume, unmute);
      }

      // Capture volume 10s before end for persistence (v24.8)
      if (
        currentDuration > 0 &&
        currentDuration - playedSeconds <= 10 &&
        currentDuration - playedSeconds > 9.5
      ) {
        // captureVolumeForHistory(); // Function missing in context v24.8
      }
    }
  };


  const handleIntroTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (!video.duration || !video.playbackRate) return;
    const timeLeft = (video.duration - video.currentTime) / video.playbackRate;
    if (timeLeft <= 1 && !video.muted) {
      const fadeProgress = Math.max(0, 1 - timeLeft);
      video.volume = Math.max(0, 1 - fadeProgress);
    }
    if (timeLeft <= 0.5 && !isIntroFadingOut) {
      setIsIntroFadingOut(true);
    }
    // Sincronización 2s: Iniciar contenido oculto detrás de la intro (v25.1)
    if (timeLeft <= 2 && !isContentPlaying && isPreRollOverlayActive) {
      usePlayerStore.setState({ isContentPlaying: true });
    }

    // Barras de Cine: 1s antes del fin de la intro (v25.1)
    // No activar si es un vivo
    if (timeLeft <= 1 && !areCinematicBarsActive && isPreRollOverlayActive && currentVideo?.id !== 'live-stream') {
      setAreCinematicBarsActive(true);
    }
  };

  const handleIntroMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (video.duration) {
      const rate = video.duration / 4.0;
      video.playbackRate = rate;
    }
  };


  const displayTitle = cleanTitle(currentVideo?.nombre);
  const displaySubtitle = (currentVideo as any)?.resumen || (currentVideo as any)?.description;

  return (
    <div className="w-full overflow-visible">
      <div className="relative aspect-video w-full">
        <div
          ref={playerContainerRef}
          className={cn(
            "relative w-full h-full aspect-video bg-black overflow-hidden border-0 md:border md:rounded-xl card-blur-player shadow-lg",
          )}
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          {/* === VIDEO UNIVERSE (SCALABLE & IMMERSIVE) === */}
          <div
            className={cn(
              "video-universe absolute inset-0 w-full h-full transition-transform ease-in-out md:rounded-xl overflow-hidden"
            )}
            style={{
              transform: areCinematicBarsActive ? 'scale(1.20)' : 'scale(1)',
              transitionDuration: areCinematicBarsActive ? '75ms' : '2000ms',
              willChange: 'transform'
            }}
          >

            {/* HTML Slide (Considered Content/Video) */}
            {isHtmlSlideActive && currentSlide && (
              <div className="absolute inset-0 z-40 bg-black">
                <iframe
                  src={`${currentSlide.url}${currentSlide.url.includes('?') ? '&' : '?'}mute=1&autoplay=1&enablejsapi=1`}
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
                    onPlay={() => { }}
                    onError={(e) => console.error("Error reproduciendo audio de noticia:", e, currentSlide.audioUrl)}
                  />
                )}
              </div>
            )}

            {/* === SINGLE POWER PLAYER (v23.9) === */}
            <div className="absolute inset-0 bg-black">
              <AnimatePresence mode="wait">
                {currentVideo?.url && !isHtmlSlideActive && (
                  <motion.div
                    key={currentVideo.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.75 }}
                    className="absolute inset-0"
                    data-player-id={currentVideo.id}
                  >
                    <VideoPlayer
                      key={currentVideo.id}
                      id={currentVideo.id}
                      videoUrl={currentVideo.url}
                      // Forzamos autoplay incluso durante el overlay de intro para pre-buffer masivo (v25.3)
                      autoplay={isPlaying && (isContentPlaying || isInitialLoadRef.current)}
                      muted={(!isPlaying || !isContentPlaying)}
                      imageUrl={currentVideo.imagen}
                      onClose={() => {
                        if (!transitionSignaledRef.current && currentVideo?.id !== 'live-stream') {
                          handleOnEnded(setVolume, unmute);
                        }
                      }}
                      onProgress={(state) => {
                        handleProgress(state);
                      }}
                      onDuration={(d) => {
                        setCurrentDuration(d);
                      }}
                      startAt={currentVideo.id === lastProcessedVideoIdRef.current ? undefined : (currentVideo.novedad ? 0 : undefined)}
                      volumen_extra={currentVideo.volumen_extra}
                      audioUrl={currentVideo.audioSourceUrl}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>


            {/* === PERSISTENT INTRO OVERLAY === */}
            <div
              className={cn(
                "absolute inset-0 z-[999] bg-black transition-opacity duration-500",
                (isPreRollOverlayActive && overlayIntroVideo && !isIntroFadingOut)
                  ? "opacity-100"
                  : "opacity-0 invisible pointer-events-none"
              )}
            >
              {overlayIntroVideo?.url && (
                <video
                  ref={introVideoRef}
                  src={overlayIntroVideo.url}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  onTimeUpdate={handleIntroTimeUpdate}
                  onLoadedData={() => {
                    // Watchdog: si la intro carga pero en 20s no termina, forzar finishIntro
                    if (introWatchdogRef.current) clearTimeout(introWatchdogRef.current);
                    introWatchdogRef.current = setTimeout(() => {
                      console.warn('[VideoSection] Intro watchdog: forzando finishIntro()');
                      finishIntro();
                    }, 20000);
                  }}
                  onEnded={() => {
                    if (isInitialLoadRef.current) {
                      isInitialLoadRef.current = false; // El primer video ya pasó su fase crítica de intro
                    }
                    if (introWatchdogRef.current) clearTimeout(introWatchdogRef.current);
                    finishIntro();
                  }}
                  onError={(e) => {
                    console.error("Intro Error:", e);
                    if (introWatchdogRef.current) clearTimeout(introWatchdogRef.current);
                    finishIntro();
                  }}
                />
              )}
            </div>


            {
              (!isPlaying) && !isLocalIntro && !playBackgroundEarly && !isHtmlSlideActive && (
                <Image
                  src={thumbnailSrc}
                  alt="Fondo"
                  fill
                  className="absolute inset-0 z-10 object-contain opacity-60"
                  priority
                  onError={() => setThumbnailSrc('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=')}
                />
              )
            }

            <AnimatePresence>
              {isNewsIntroActive && (
                <motion.div
                  key="news-intro"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1 }}
                  className="absolute inset-0 z-[998] bg-black"
                >
                  <video
                    src="/videos_intro/noticias.mp4?v=20b"
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-contain"
                    onPlay={() => { }}
                    onLoadedMetadata={handleIntroMetadata}
                  />
                </motion.div>
              )}

              {areCinematicBarsActive && !isNewsContent && (
                <motion.div
                  key="cinematic-bar-top-solid"
                  className="absolute top-0 left-0 right-0 h-[14%] bg-black z-[45] pointer-events-auto"
                  initial={{ y: 0 }}
                  animate={{ y: 0 }}
                  exit={{ y: "-100%" }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                />
              )}
              {areCinematicBarsActive && !isNewsContent && (
                <motion.div
                  key="cinematic-bar-top-gradient"
                  className="absolute top-0 left-0 right-0 h-[35%] bg-gradient-to-b from-black via-black/90 to-transparent z-[45] pointer-events-auto"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2.0, ease: "easeOut" }}
                />
              )}
              {areCinematicBarsActive && (
                <motion.div
                  key="cinematic-bar-bottom-solid"
                  className="absolute bottom-0 left-0 right-0 h-[14%] bg-black z-[45] pointer-events-auto"
                  initial={{ y: 0 }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                />
              )}
              {areCinematicBarsActive && (
                <motion.div
                  key="cinematic-bar-bottom-gradient"
                  className="absolute bottom-0 left-0 right-0 h-[35%] bg-gradient-to-t from-black via-black/90 to-transparent z-[45] pointer-events-auto"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2.0, ease: "easeOut" }}
                />
              )}
            </AnimatePresence>
          </div>

          {/* === ANTI-GRAVITY UI LAYER (STATIC & PRESERVED) === */}
          <AntiGravityLayer areCinematicBarsActive={areCinematicBarsActive}>

            {isNewsContent && (
              <>
                <div className="absolute inset-x-0 top-0 top-safe-area z-[50] p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                  <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 inline-block max-w-[90%] md:max-w-[70%] shadow-2xl">
                    <h2 className="text-white text-base md:text-xl font-bold leading-tight drop-shadow-lg break-words">
                      {displayTitle}
                    </h2>
                  </div>
                </div>

                <div className="absolute inset-x-0 bottom-0 z-[50] pointer-events-auto h-8 bg-black/80 backdrop-blur-md border-t border-white/10 flex items-center">
                  <NewsTicker tickerTexts={[displaySubtitle || '']} />
                </div>
              </>
            )}

            <WeatherOverlay />

            <AnimatePresence>
              {showControls && !isHtmlSlideActive && !isLocalIntro && !isPreRollOverlayActive && (
                <motion.div key="controls" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute bottom-0 left-0 right-0 w-full z-[51] pointer-events-auto">
                  <CustomControls onToggleFullScreen={toggleFullScreen} isFullScreen={isFullScreen} />
                </motion.div>
              )}


              {!isPlaying && !isHtmlSlideActive && !isLocalIntro && !playBackgroundEarly && currentVideo && (
                <motion.div
                  key="play"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center z-50 cursor-pointer pointer-events-auto"
                  onClick={() => setIsPlaying(true)}
                >
                  <div className="p-4 bg-black/40 rounded-full border border-white backdrop-blur-sm"><Play size={38} className="text-white/80" fill="white" strokeWidth={1.35} /></div>
                </motion.div>
              )}
            </AnimatePresence>

          </AntiGravityLayer>
        </div>
      </div >
      {viewMode === 'diario' && <VideoTitleBar className="mt-0 rounded-t-none border-t-0" />}
    </div >
  );

};

export default VideoSection;