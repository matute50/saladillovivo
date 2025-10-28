'use client';

import React, { useCallback, useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import VideoPlayer, { type VideoPlayerRef } from '@/components/VideoPlayer';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useMediaPlayer } from '@/context/MediaPlayerContext';
import { Play, Cast } from 'lucide-react';
import VideoControls from '@/components/VideoControls';
import { useCast } from '@/hooks/useCast';
import VideoTitleBar from '@/components/VideoTitleBar';
import type { Video } from '@/lib/types';

interface VideoSectionProps {
  isMobileFixed?: boolean;
  isMobile: boolean;
}

const VideoSection: React.FC<VideoSectionProps> = ({ isMobileFixed = false, isMobile }) => {
  const [isMobileFullscreen, setIsMobileFullscreen] = useState(false);
  
  const {
    currentVideo,
    isPlaying,
    volume,
    isMuted,
    seekToFraction,
    setSeekToFraction,
    handleOnEnded,
    handleOnProgress,
  } = useMediaPlayer();
  
  const { isCastAvailable, handleCast } = useCast(currentVideo);
  const playerRef = useRef<VideoPlayerRef>(null);
  const [showControls, setShowControls] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleShowControls = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, []);

  const handleTouchShowControls = () => {
    setShowControls(prev => !prev);
  };

  const handleMouseEnter = () => {
    if (!isMobile) {
      handleShowControls();
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setShowControls(false);
    }
  };

  const toggleFullScreen = useCallback(async () => {
    const playerElement = playerRef.current?.getInternalPlayer()?.elements.container;
    if (!playerElement) return;

    if (!document.fullscreenElement) {
      if (playerElement.requestFullscreen) {
        await playerElement.requestFullscreen({ navigationUI: "hide" }).catch((err: Error) => console.error(err));
      }
      if (isMobile) {
        try {
          const orientation = window.screen.orientation as any;
          if (orientation && typeof orientation.lock === 'function') {
            await orientation.lock('landscape');
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
        const orientation = window.screen.orientation as any;
        if (orientation && typeof orientation.unlock === 'function') {
          orientation.unlock();
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
    const handleOrientationChange = () => {
       setIsMobileFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [isMobile]);

  const getThumbnailUrl = (media: Video | null) => {
    if (!media?.url) return '/placeholder.png';
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const videoIdMatch = media.url.match(youtubeRegex);
    if (videoIdMatch) {
      const videoId = videoIdMatch[1];
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    return media.url;
  };

  const playerCore = (
    <div 
      className="relative w-full h-full aspect-video bg-black overflow-hidden border-0 md:border md:rounded-xl shadow-pop card-blur-player"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchShowControls}
    >
      <div className="absolute inset-0 w-full h-full md:rounded-xl overflow-hidden">
        {currentVideo && (
          <VideoPlayer
            key={currentVideo.id || currentVideo.url}
            ref={playerRef}
            src={currentVideo.url}
            playing={isPlaying}
            volume={volume}
            muted={isMuted}
            onEnded={handleOnEnded}
            onProgress={handleOnProgress}
            seekToFraction={seekToFraction}
            setSeekToFraction={setSeekToFraction}
          />
        )}

        {!isPlaying && currentVideo?.type === 'video' && currentVideo?.url && (
          <Image
            src={getThumbnailUrl(currentVideo)}
            alt={`Miniatura de ${currentVideo?.title}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="absolute inset-0 z-0 object-cover"
            priority
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src.includes('maxresdefault.jpg')) {
                target.src = getThumbnailUrl(currentVideo).replace('maxresdefault.jpg', 'hqdefault.jpg');
              } else if (target.src.includes('hqdefault.jpg')) {
                target.src = getThumbnailUrl(currentVideo).replace('hqdefault.jpg', 'mqdefault.jpg');
              } else {
                target.src = '/placeholder.png';
              }
            }}
          />
        )}

        <AnimatePresence>
          {showControls && isCastAvailable && (
            <motion.div
              className="absolute top-4 right-4 z-30"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <button onClick={handleCast} className="text-white hover:text-orange-500 transition-colors">
                <Cast size={24} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {!isPlaying && currentVideo?.url && (currentVideo.type === 'video' || currentVideo.type === 'stream') && (
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
          {(isMuted || showControls) && currentVideo?.type !== 'image' && <VideoControls showControls={showControls} />}
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
       <VideoTitleBar className="mt-0" />
    </div>
  );
};

export default VideoSection;
