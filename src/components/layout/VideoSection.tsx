'use client';

import React, { useCallback, useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import VideoPlayer from '@/components/VideoPlayer';
import VideoControls from '@/components/VideoControls';
import VideoTitleBar from '@/components/VideoTitleBar';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useMediaPlayer } from '@/context/MediaPlayerContext';
import { Play, Cast, VolumeX } from 'lucide-react';

const VideoSection = ({ 
  isMobileFixed = false, 
  isMobile
}) => {
  const [isMobileFullscreen, setIsMobileFullscreen] = useState(false);
  
  const {
    playerRef,
    currentMedia,
    playerStatus,
    isPlaying,
    volume,
    isMuted,
    unmute,
    showControls,
    progress,
    duration,
    videoOpacity,
    isCastAvailable,
    handlePlayerReady,
    handleError,
    togglePlayPause,
    toggleMute,
    handleVolumeChange,
    handleMouseEnterControls,
    handleMouseLeaveControls,
    handleTouchShowControls,
    handleProgress,
    handleDuration,
    handleSeek,
    handleCast,
    handlePlay,
    handlePause,
    handleEnded,
    playingMedia
  } = useMediaPlayer();

  const customHandleMouseLeaveControls = useCallback(() => {
    handleMouseLeaveControls(true); // pass true for faster fade
  }, [handleMouseLeaveControls]);


  const toggleFullScreen = useCallback(async () => {
    const playerElement = playerRef.current?.wrapper;
    if (!playerElement) return;

    if (!document.fullscreenElement) {
      if (playerElement.requestFullscreen) {
        await playerElement.requestFullscreen({ navigationUI: "hide" }).catch(err => console.error(err));
      }
      if (isMobile) {
        try {
          if (window.screen.orientation && typeof window.screen.orientation.lock === 'function') {
            await window.screen.orientation.lock('landscape');
          }
        } catch(err) {
          console.error("No se pudo bloquear la orientación:", err)
        }
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen().catch(err => console.error(err));
      }
      if (isMobile) {
        if (window.screen.orientation && typeof window.screen.orientation.unlock === 'function') {
          window.screen.orientation.unlock();
        }
      }
    }
  }, [playerRef, isMobile]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (isMobile) {
        setIsMobileFullscreen(!!document.fullscreenElement);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    const handleOrientationChange = () => {
       setIsMobileFullscreen(!!document.fullscreenElement);
    };

    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [isMobile]);

  const renderPlayerState = () => {
    const baseClasses = "absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 z-10 text-white text-center p-4 md:rounded-xl";
    
    switch (playerStatus) {
      case 'loading':
        return (
          <div className={baseClasses}>
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-lg">Cargando...</p>
          </div>
        );
      // Other cases would go here
      default:
        return null;
    }
  };

  const playerCore = (
    <div 
      className="relative w-full h-full aspect-video bg-black overflow-hidden border-0 md:border md:rounded-xl shadow-player card-blur-player"
      onMouseEnter={handleMouseEnterControls}
      onMouseLeave={customHandleMouseLeaveControls}
      onTouchStart={handleTouchShowControls}
    >
      <div className="absolute inset-0 w-full h-full md:rounded-xl overflow-hidden">
        {renderPlayerState()}
        
        {currentMedia?.type !== 'image' && (
          <motion.div
            className="w-full h-full"
            animate={{ opacity: videoOpacity }}
            transition={{ duration: 2, ease: 'linear' }}
          >
            <VideoPlayer
              key={`${currentMedia?.url}-${isMobileFullscreen}`}
              playerRef={playerRef}
              src={currentMedia?.url}
              playing={isPlaying}
              volume={volume}
              muted={isMuted}
              onReady={handlePlayerReady}
              onPlay={() => handlePlay(currentMedia)}
              onPause={handlePause}
              onEnded={handleEnded}
              onError={handleError}
              onProgress={handleProgress}
              onDuration={handleDuration}
              isMobile={isMobile}
            />
          </motion.div>
        )}

        {/* Custom Image overlay for LCP optimization */}
        {!isPlaying && currentMedia?.type === 'video' && currentMedia?.url && (
          <Image
            src={currentMedia.url.includes('v=') 
              ? `https://img.youtube.com/vi/${currentMedia.url.split('v=')[1].split('&')[0]}/maxresdefault.jpg`
              : currentMedia.url // Fallback if not a YouTube video, or handle other types
            } // Extract YouTube video ID
            alt={`Miniatura de ${currentMedia.title}`}
            layout="fill"
            objectFit="cover"
            priority
            className="absolute inset-0 z-0"
          />
        )}
        <AnimatePresence>
          {!isPlaying && currentMedia?.url && (currentMedia.type === 'video' || currentMedia.type === 'stream') && (
              <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 bg-black/20 flex items-center justify-center z-10 pointer-events-none"
              >
                  <div className="p-4 bg-black/40 rounded-full">
                      <Play size={48} className="text-white/80" fill="white" />
                  </div>
              </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
        {showControls && currentMedia?.type !== 'image' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-0 left-0 right-0 z-30"
          >
          <VideoControls
            isPlaying={isPlaying}
            isMuted={isMuted}
            progress={progress}
            duration={duration}
            volume={volume}
            togglePlayPause={togglePlayPause}
            toggleMute={toggleMute}
            onSeek={handleSeek}
            onVolumeChange={handleVolumeChange}
            toggleFullScreen={toggleFullScreen}
            isFullscreen={isMobileFullscreen || !!document.fullscreenElement}
            isMobileFixed={isMobileFixed}
            isCastAvailable={isCastAvailable}
            handleCast={handleCast}
            isLive={currentMedia?.type === 'stream'}
          />
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
  
  if (isMobileFixed && isMobileFullscreen) {
     return ReactDOM.createPortal(
      <div className="fullscreen-portal fixed inset-0 w-full h-full bg-black z-[9999]">
        {playerCore}
      </div>,
      document.body
    );
  }

  const wrapperClasses = isMobileFixed
    ? "fixed top-[var(--header-height)] left-0 w-full flex flex-col bg-background z-40"
    : "w-full flex flex-col";

  return (
    <div className={wrapperClasses}>
       <div className="relative">
          {playerCore}
       </div>
      <VideoTitleBar playingMedia={playingMedia} isMobile={isMobile} />
    </div>
  );
};

export default VideoSection;
