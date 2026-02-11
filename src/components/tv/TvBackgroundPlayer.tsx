'use client';

import { useEffect, useRef } from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';
import VideoPlayer from '@/components/VideoPlayer';
import Image from 'next/image';
import { useVolumeStore } from '@/store/useVolumeStore';
import { motion, AnimatePresence } from 'framer-motion';

// Subcomponent to Isolate Timer Logic from Parent Re-renders
const IntroLayer = ({
  video,
  onFinish
}: {
  video: any,
  onFinish: () => void
}) => {
  // Use a ref to keep the latest callback without triggering effect re-runs
  const onFinishRef = useRef(onFinish);

  // Update ref on every render when onFinish changes
  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    // STRICT TIMER: 4100ms Hard Cut
    // This effect runs EXACTLY ONCE when the component mounts.
    // We intentionally ignore dependency changes to prevent timer reset.
    console.log("[IntroLayer] MOUNTED. Timer started: 4100ms (Immutable)");

    const timer = setTimeout(() => {
      console.log("[IntroLayer] TIMER DONE. Executing Finish (via Ref).");
      if (onFinishRef.current) {
        onFinishRef.current();
      }
    }, 4100);

    return () => {
      console.log("[IntroLayer] UNMOUNTED. Clearing Timer.");
      clearTimeout(timer);
    };
  }, []); // EMPTY ARRAY: NEVER RESET

  if (!video) return null;

  return (
    <div className="absolute inset-0 z-30 bg-black pointer-events-none">
      <video
        src={video.url}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-contain"
        onError={(e) => console.error("Intro Error (Ignored):", e)}
      />
    </div>
  );
};

const TvBackgroundPlayer = () => {
  const {
    isPlaying,

    // Zero-Branding State
    isPreRollOverlayActive,
    overlayIntroVideo,
    isContentPlaying,

    // Slots (Smart Slots v18.0)
    activeSlot,
    slotAContent,
    slotBContent,

    // Actions
    handleOnEnded,
    finishIntro,
    startContentPlayback
  } = usePlayerStore();

  const { volume, isMuted, setVolume } = useVolumeStore();

  // Combine actions for the timer callback
  const handleIntroFinish = () => {
    finishIntro();
    startContentPlayback();
  };

  return (
    <div className="absolute inset-0 z-0 bg-black">

      {/* CAPA DE FONDO (Fallback) */}
      {!slotAContent && !slotBContent && (
        <div className="absolute inset-0 z-0">
          <Image
            src="/FONDO OSCURO.PNG"
            alt="Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      )}

      {/* CAPA SUPERIOR: Intro Overlay (Zero-Branding) - persistence node v16.0 */}
      <AnimatePresence>
        {isPreRollOverlayActive && overlayIntroVideo && (
          <IntroLayer
            key={overlayIntroVideo.id}
            video={overlayIntroVideo}
            onFinish={handleIntroFinish}
          />
        )}
      </AnimatePresence>

      {/* SMART SLOTS SYSTEM (v18.0) */}
      {/* Slot A */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${activeSlot === 'A' ? 'z-20 opacity-100' : 'z-0 opacity-100'}`}
        style={{ pointerEvents: activeSlot === 'A' ? 'auto' : 'none' }}
      >
        {slotAContent && (
          <VideoPlayer
            videoUrl={slotAContent.url}
            autoplay={isPlaying && isContentPlaying && activeSlot === 'A'}
            onClose={() => handleOnEnded(setVolume)}
            playerVolume={isMuted || isPreRollOverlayActive ? 0 : volume}
            muted={isPreRollOverlayActive || activeSlot !== 'A'}
            startAt={slotAContent.startAt}
            volumen_extra={slotAContent.volumen_extra}
          />
        )}
      </div>

      {/* Slot B */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${activeSlot === 'B' ? 'z-20 opacity-100' : 'z-0 opacity-100'}`}
        style={{ pointerEvents: activeSlot === 'B' ? 'auto' : 'none' }}
      >
        {slotBContent && (
          <VideoPlayer
            videoUrl={slotBContent.url}
            autoplay={isPlaying && isContentPlaying && activeSlot === 'B'}
            onClose={() => handleOnEnded(setVolume)}
            playerVolume={isMuted || isPreRollOverlayActive ? 0 : volume}
            muted={isPreRollOverlayActive || activeSlot !== 'B'}
            startAt={slotBContent.startAt}
            volumen_extra={slotBContent.volumen_extra}
          />
        )}
      </div>

      <div className="absolute inset-0 bg-black/20 pointer-events-none z-40" />

      {/* Cinematic Bars Overlay */}
      <AnimatePresence>
        {!isPlaying && (
          <>
            <motion.div
              key="tv-top-bar"
              className="absolute top-0 left-0 w-full h-[12%] bg-black z-50 pointer-events-none"
              initial={{ y: "-100%" }}
              animate={{ y: "0%" }}
              exit={{ y: "-100%" }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
            <motion.div
              key="tv-bottom-bar"
              className="absolute bottom-0 left-0 w-full h-[12%] bg-black z-50 pointer-events-none"
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TvBackgroundPlayer;