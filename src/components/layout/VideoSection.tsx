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
import WeatherOverlay from '@/components/tv/WeatherOverlay';
import { cn, cleanTitle } from '@/lib/utils';
import { Play } from 'lucide-react';
import AntiGravityLayer from './AntiGravityLayer';

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
    setIsNewsIntroActive,
    isNewsIntroActive
  } = usePlayerStore();

  const { currentSlide, isPlaying: isSlidePlaying, stopSlide } = useNewsPlayerStore();
  const { volume, setVolume, isMuted, unmute } = useVolumeStore();

  const isHtmlSlideActive = isSlidePlaying && currentSlide && currentSlide.type === 'html';
  const isLocalIntro = currentVideo?.url && (
    currentVideo.url.startsWith('/') ||
    currentVideo.url.includes('videos_intro')
  ) || false;
  const isNewsContent = !!(currentVideo?.categoria === 'Noticias' && !isLocalIntro);

  useEffect(() => {
    if (isNewsContent || isHtmlSlideActive) {
      setVolume(1);
      unmute(); 
    }
  }, [isNewsContent, isHtmlSlideActive, setVolume, unmute]);

  const [showControls, setShowControls] = useState(false);
  const [thumbnailSrc, setThumbnailSrc] = useState<string>('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');
  const cinematicTimerRef = useRef<NodeJS.Timeout|null>(null);
  const lastProcessedVideoIdRef = useRef<string | null>(null);
  const [currentDuration, setCurrentDuration] = useState(0);
  const transitionSignaledRef = useRef(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const introVideoRef = useRef<HTMLVideoElement>(null);
  const [isIntroFadingOut, setIsIntroFadingOut] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const transitionTriggeredRef = useRef(false);
  const introWatchdogRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    transitionTriggeredRef.current = false;
    transitionSignaledRef.current = false;
    setCurrentDuration(0);
    setIsIntroFadingOut(false);
  }, [currentVideo?.id]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isHtmlSlideActive && currentSlide) {
      pauseForSlide();
      const duration = (currentSlide.duration || 15) * 1000;
      timer = setTimeout(() => {
        stopSlide();
        resumeAfterSlide();
      }, duration);
    }
    return () => clearTimeout(timer);
  }, [isHtmlSlideActive, currentSlide, stopSlide, resumeAfterSlide, pauseForSlide]);

  useEffect(() => {
    if (isHtmlSlideActive && currentSlide?.audioUrl && audioRef.current) {
      const audio = audioRef.current;
      audio.muted = false;
      audio.volume = volume > 0 ? volume : 1; 
      
      const attemptPlay = () => {
        audio.play().catch(err => {
          console.warn("[VideoSection] Audio play initial attempt failed, retrying...", err);
          requestAnimationFrame(() => {
            audio.play().catch(() => {});
          });
        });
      };

      if (audio.readyState >= 2) {
        attemptPlay();
      } else {
        audio.oncanplay = () => {
          attemptPlay();
          audio.oncanplay = null;
        };
      }
    } else if (!isHtmlSlideActive && audioRef.current) {
      audioRef.current.pause();
    }
  }, [isHtmlSlideActive, currentSlide, volume]);

  useEffect(() => {
    if (isPreRollOverlayActive && !overlayIntroVideo && currentVideo) {
      const timer = setTimeout(() => {
        finishIntro();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isPreRollOverlayActive, overlayIntroVideo, currentVideo, finishIntro]);

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
        lastProcessedVideoIdRef.current = currentVideo.id;
        setAreCinematicBarsActive(true);
        clearTimer();
        cinematicTimerRef.current = setTimeout(() => {
          setAreCinematicBarsActive(false);
        }, 5000);
      } else if (!isNewVideo) {
        setAreCinematicBarsActive(true);
        clearTimer();
        cinematicTimerRef.current = setTimeout(() => {
          setAreCinematicBarsActive(false);
        }, 5000);
      } else if (isNewVideo) {
        lastProcessedVideoIdRef.current = currentVideo.id || null;
      }
    } else {
      if (!isLocalIntro && !isHtmlSlideActive && !isPreRollOverlayActive && currentVideo) {
        setAreCinematicBarsActive(true);
        clearTimer();
      } else {
        setAreCinematicBarsActive(false);
        clearTimer();
      }
    }

    return () => clearTimer();
  }, [isPlaying, currentVideo, isLocalIntro, isHtmlSlideActive, isPreRollOverlayActive]);

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
    if (timeLeft <= 2 && !isContentPlaying && isPreRollOverlayActive) {
        usePlayerStore.setState({ isContentPlaying: true });
    }
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
            {isHtmlSlideActive && currentSlide && (
              <div className="absolute inset-0 z-40 bg-black">
                <iframe
                  src={`${currentSlide.url}${currentSlide.url.includes('?') ? '&' : '?'}autoplay=1&enablejsapi=1`}
                  className="w-full h-full border-none pointer-events-none"
                  title="Slide"
                  allow="autoplay"
                />
              </div>
            )}

            <audio
              ref={audioRef}
              src={isHtmlSlideActive ? currentSlide?.audioUrl || undefined : undefined}
              className="hidden"
              autoPlay
              crossOrigin="anonymous"
            />

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
                  >
                    <VideoPlayer
                      key={currentVideo.id}
                      id={currentVideo.id}
                      videoUrl={currentVideo.url}
                      autoplay={isPlaying && (isContentPlaying || isInitialLoadRef.current)}
                      muted={(!isPlaying || !isContentPlaying)}
                      imageUrl={currentVideo.imagen}
                      onClose={() => {
                        if (!transitionSignaledRef.current && currentVideo?.id !== 'live-stream') {
                          handleOnEnded(setVolume, unmute);
                        }
                      }}
                      onProgress={handleProgress}
                      onDuration={setCurrentDuration}
                      startAt={currentVideo.id === lastProcessedVideoIdRef.current ? undefined : (currentVideo.novedad ? 0 : undefined)}
                      volumen_extra={currentVideo.volumen_extra}
                      audioUrl={currentVideo.audioSourceUrl}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

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
                  onEnded={() => finishIntro()}
                  onError={() => finishIntro()}
                />
              )}
            </div>

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
                    onLoadedMetadata={handleIntroMetadata}
                  />
                </motion.div>
              )}

              {areCinematicBarsActive && !isNewsContent && (
                <motion.div
                  key="cinematic-bar-top-solid"
                  className="absolute top-0 left-0 right-0 h-[14%] bg-black z-[45] pointer-events-auto"
                  animate={{ y: 0 }}
                  exit={{ y: "-100%" }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                />
              )}
              {areCinematicBarsActive && (
                <motion.div
                  key="cinematic-bar-bottom-solid"
                  className="absolute bottom-0 left-0 right-0 h-[14%] bg-black z-[45] pointer-events-auto"
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                />
              )}
            </AnimatePresence>
          </div>

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

              {!isPlaying && !isHtmlSlideActive && !isLocalIntro && currentVideo && (
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