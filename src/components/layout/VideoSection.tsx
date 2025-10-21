'use client';

import React, { useCallback, useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import dynamic from 'next/dynamic';

const VideoPlayer = dynamic(() => import('@/components/VideoPlayer'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-black flex items-center justify-center"><p className="text-white">Cargando reproductor...</p></div>,
});
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
    playingMedia,
    mainSrc,
    transitionSrc,
    isTransitioning,
    activeCategory,
  } = useMediaPlayer();

  const customHandleMouseLeaveControls = useCallback(() => {
    handleMouseLeaveControls(true); // pass true for faster fade
  }, [handleMouseLeaveControls]);


  const toggleFullScreen = useCallback(async () => {
    const playerElement = playerRef.current?.getWrapper();
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
        return null;
      // Other cases would go here
      default:
        return null;
    }
  };

  const getThumbnailUrl = (media) => {
    if (!media?.url) return '/placeholder.png'; // A default placeholder
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([\w-]{11})/;
    const videoIdMatch = media.url.match(youtubeRegex);
    if (videoIdMatch) {
      return `https://img.youtube.com/vi/${videoIdMatch[1]}/maxresdefault.jpg`;
    }
    return media.url;
  };

  const playerCore = (
    <div 
      className="relative w-full h-full aspect-video bg-black overflow-hidden border-0 md:border md:rounded-xl shadow-pop card-blur-player"
      onMouseEnter={handleMouseEnterControls}
      onMouseLeave={customHandleMouseLeaveControls}
      onTouchStart={handleTouchShowControls}
    >
      <div className="absolute inset-0 w-full h-full md:rounded-xl overflow-hidden">
        {renderPlayerState()}

        {isMuted && ( // Conditional rendering for blinking mute icon
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }} // Blinking effect
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-2 left-2 z-40 cursor-pointer p-2" // Positioned top-left, clickable
            onClick={toggleMute} // Activate audio on click
          >
            <VolumeX size={isMobile ? 24 : 38} className="text-white drop-shadow-lg" />
          </motion.div>
        )}
        
        {currentMedia?.type !== 'image' && (
          <VideoPlayer
            key={`${currentMedia?.url}-${isMobileFullscreen}`}
            playerRef={playerRef}
            mainSrc={mainSrc}
            transitionSrc={transitionSrc}
            isTransitioning={isTransitioning}
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
        )}

        {/* Custom Image overlay for LCP optimization */}
        {!isPlaying && currentMedia?.type === 'video' && currentMedia?.url && (
          <Image
            src={getThumbnailUrl(currentMedia)}
            alt={`Miniatura de ${currentMedia.title}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="absolute inset-0 z-0 object-cover"
            priority
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
      <VideoTitleBar 
        playingMedia={playingMedia} 
        activeCategory={activeCategory} 
        isMobile={isMobile}
        isPlaying={isPlaying}
        progress={progress}
        duration={duration}
      />
    </div>
  );
  
};

export default VideoSection;