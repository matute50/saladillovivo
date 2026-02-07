'use client';

import React, { useRef, useState, useEffect } from 'react';
import VideoPlayer from '@/components/VideoPlayer';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { usePlayerStore } from '@/store/usePlayerStore';
import { SlideMedia } from '@/lib/types';
import { useNewsPlayerStore } from '@/store/useNewsPlayerStore';
import { useVolumeStore } from '@/store/useVolumeStore';
import CustomControls from '@/components/CustomControls';
import useCast from '@/hooks/useCast';
import VideoTitleBar from '@/components/VideoTitleBar';
import NewsTicker from '@/components/NewsTicker';
import WeatherOverlay from '@/components/tv/WeatherOverlay';
import { cn, cleanTitle, isYouTubeVideo } from '@/lib/utils';
import { Play, Cast } from 'lucide-react';
import AntiGravityLayer from './AntiGravityLayer';

// Simplified VideoSection for Desktop Only


const VideoSection: React.FC = () => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const playerContainerRef = useRef<HTMLDivElement>(null);

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
    finishIntro
  } = usePlayerStore();

  const { currentSlide, isPlaying: isSlidePlaying, stopSlide, isNewsIntroActive, setIsNewsIntroActive } = useNewsPlayerStore();
  const { volume, setVolume, isMuted, unmute } = useVolumeStore(); // Added unmute
  const { isCastAvailable, handleCast } = useCast(currentVideo);

  // Auto-Unmute for News or HTML Slides
  const isHtmlSlideActive = isSlidePlaying && currentSlide && currentSlide.type === 'html';
  const isLocalIntro = currentVideo?.url && (
    currentVideo.url.startsWith('/') ||
    currentVideo.url.includes('videos_intro')
  ) || false;
  const isNewsContent = !!(currentVideo?.categoria === 'Noticias' && !isLocalIntro);

  useEffect(() => {
    if ((isNewsContent || isHtmlSlideActive) && isMuted) {
      console.log("Unmuting for News content...");
      unmute();
    }
  }, [isNewsContent, isHtmlSlideActive, isMuted, unmute]);

  const [showControls, setShowControls] = useState(false);
  const [thumbnailSrc, setThumbnailSrc] = useState<string>('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');
  const [areCinematicBarsActive, setAreCinematicBarsActive] = useState(false);
  const cinematicTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastProcessedVideoIdRef = useRef<string | null>(null);
  const [currentDuration, setCurrentDuration] = useState(0);
  const transitionSignaledRef = useRef(false);

  const audioRef = useRef<HTMLAudioElement>(null);


  // --- SMART SLOTS LOGIC (v18.0) ---
  const [activeSlot, setActiveSlot] = useState<'A' | 'B'>('A');
  const [slotA, setSlotA] = useState<SlideMedia | null>(null);
  const [slotB, setSlotB] = useState<SlideMedia | null>(null);

  // ZERO-BLACK Sync (v20)


  // Determine which slot holds the current video (Target)
  const isSlotATarget = slotA?.id === currentVideo?.id;
  const isSlotBTarget = slotB?.id === currentVideo?.id;

  // If neither holds it directly (e.g. init), fallback to active or next logic, 
  // but usually one matches. If not, we wait for effect to load it.

  useEffect(() => {
    if (!currentVideo) return;

    // Determine target based on state
    // We prefer the 'other' slot if possible for A/B swap
    const targetSlot = (isSlotATarget) ? 'A' :
      (isSlotBTarget) ? 'B' :
        (activeSlot === 'A' ? 'B' : 'A');

    // Load content into target slot if needed - comparison by reference or URL to catch prop updates like startAt
    // Load content into target slot if needed
    if (targetSlot === 'A') {
      if (slotA !== currentVideo) setSlotA(currentVideo);
      if (slotB !== null) setSlotB(null); // STRICT CLEANUP for Ghost Audio
    }
    if (targetSlot === 'B') {
      if (slotB !== currentVideo) setSlotB(currentVideo);
      if (slotA !== null) setSlotA(null); // STRICT CLEANUP for Ghost Audio
    }

    // Transition Logic
    if (targetSlot !== activeSlot) {
      setActiveSlot(targetSlot);
    }
    // RESET CLEAN STATE ON NEW VIDEO WITH INTRO

  }, [currentVideo, isPreRollOverlayActive, activeSlot, isSlotATarget, isSlotBTarget, slotA, slotB]);

  // ... (Other effects)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const [playBackgroundEarly, setPlayBackgroundEarly] = useState(false);
  const transitionTriggeredRef = useRef(false);

  useEffect(() => {
    setPlayBackgroundEarly(false);
    transitionTriggeredRef.current = false;
    transitionSignaledRef.current = false;
    setCurrentDuration(0);
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
        console.log("Resuming -> Holding Shield for 2s");
        setAreCinematicBarsActive(true); // Ensure active
        clearTimer();
        cinematicTimerRef.current = setTimeout(() => {
          setAreCinematicBarsActive(false); // Triggers Zoom Out transition
        }, 3000); // 3s Hold (V23.3)
      } else if (isNewVideo) {
        // Backup: update ref even if we don't show bars
        lastProcessedVideoIdRef.current = currentVideo.id || null;
      }
    } else {
      // --- CASE: PAUSED (Manual or Auto) ---
      // Force Shield + Over-Scaling immediately
      if (!isLocalIntro && !isHtmlSlideActive && !isPreRollOverlayActive && currentVideo) {
        console.log("Paused -> Force Shield");
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
        !transitionSignaledRef.current &&
        isYouTubeVideo(currentVideo?.url || '')
      ) {
        console.log("YouTube: Transición anticipada (1s antes del final)");
        transitionSignaledRef.current = true;
        handleOnEnded(setVolume);
      }
    }
  };

  // Now handled by <IntroLayer /> with Strict Timer.

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
          <div className="absolute inset-0 w-full h-full md:rounded-xl overflow-hidden bg-black">

            {/* === VIDEO UNIVERSE (SCALABLE & IMMERSIVE) === */}
            {/* === VIDEO UNIVERSE (SCALABLE & IMMERSIVE) === */}
            <div
              className={cn(
                "video-universe absolute inset-0 w-full h-full transition-transform ease-in-out md:rounded-xl overflow-hidden"
              )}
              style={{
                transform: areCinematicBarsActive ? 'scale(1.20)' : 'scale(1)',
                transitionDuration: areCinematicBarsActive ? '75ms' : '5000ms'
              }}
            >

              {/* HTML Slide (Considered Content/Video) */}
              {isHtmlSlideActive && currentSlide && (
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

              {/* === SMART SLOT A (v18.0) === */}
              <div
                className={cn(
                  "absolute inset-0 bg-black transition-opacity duration-500",
                  activeSlot === 'A' ? "z-20 opacity-100 pointer-events-auto" : "z-0 opacity-0 pointer-events-none"
                )}
              >
                {slotA?.url && !isHtmlSlideActive && (
                  <VideoPlayer
                    videoUrl={slotA.url}
                    autoplay={isPlaying && isContentPlaying && isSlotATarget}
                    onClose={() => {
                      if (activeSlot === 'A' && !transitionSignaledRef.current) handleOnEnded(setVolume);
                    }}
                    onProgress={(state) => {
                      if (isSlotATarget) handleProgress(state);
                    }}
                    onDuration={(d) => {
                      if (isSlotATarget) setCurrentDuration(d);
                    }}
                    startAt={(slotA as any).startAt || 0}
                    volumen_extra={slotA.volumen_extra}
                  />
                )}
              </div>

              {/* === SMART SLOT B (v18.0) === */}
              <div
                className={cn(
                  "absolute inset-0 bg-black transition-opacity duration-500",
                  activeSlot === 'B' ? "z-20 opacity-100 pointer-events-auto" : "z-0 opacity-0 pointer-events-none"
                )}
              >
                {slotB?.url && !isHtmlSlideActive && (
                  <VideoPlayer
                    videoUrl={slotB.url}
                    autoplay={isPlaying && isContentPlaying && isSlotBTarget}
                    onClose={() => {
                      if (activeSlot === 'B' && !transitionSignaledRef.current) handleOnEnded(setVolume);
                    }}
                    onProgress={(state) => {
                      if (isSlotBTarget) handleProgress(state);
                    }}
                    onDuration={(d) => {
                      if (isSlotBTarget) setCurrentDuration(d);
                    }}
                    startAt={(slotB as any).startAt || 0}
                    volumen_extra={slotB.volumen_extra}
                  />
                )}
              </div>

              {/* === PERSISTENT INTRO OVERLAY === */}
              <AnimatePresence>
                {isPreRollOverlayActive && overlayIntroVideo && (
                  <motion.div
                    key="intro-overlay"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-[999] bg-black"
                  >
                    <video
                      src={overlayIntroVideo.url}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                      onEnded={() => {
                        console.log("Intro ended natively.");
                        finishIntro();
                      }}
                      onError={(e) => {
                        console.error("Intro Error:", e);
                        finishIntro();
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

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
                      src="/videos_intro/noticias.mp4"
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
                    key="cinematic-bar-bottom"
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

                {showControls && isCastAvailable && !isHtmlSlideActive && !isPreRollOverlayActive && (
                  <motion.div key="cast" className="absolute top-4 right-4 z-[52] pointer-events-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <button onClick={handleCast} className="text-white hover:text-orange-500 transition-colors">
                      <Cast size={24} />
                    </button>
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
        </div>
      </div>
      {viewMode === 'diario' && <VideoTitleBar className="mt-2" />}
    </div>
  );

};

export default VideoSection;