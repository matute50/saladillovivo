'use client';

import React, { useCallback, useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import VideoPlayer from '@/components/VideoPlayer';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useMediaPlayer } from '@/context/MediaPlayerContext';
import { Play, Cast } from 'lucide-react';
import CustomControls from '@/components/CustomControls';
import useCast from '@/hooks/useCast';
import VideoTitleBar from '@/components/VideoTitleBar';
import type { Video } from '@/lib/types';
import { cn } from '@/lib/utils'; // Importamos cn

interface VideoSectionProps {
  isMobileFixed?: boolean;
  isMobile: boolean;
}

const VideoSection: React.FC<VideoSectionProps> = ({ isMobileFixed = false, isMobile }) => {
  const [isMobileFullscreen, setIsMobileFullscreen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  
  const {
    currentVideo,
    isPlaying,
    handleOnEnded, 
  } = useMediaPlayer();
  
  const { isCastAvailable, handleCast } = useCast(currentVideo);

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
    setShowControls(prev => {
      const newShowControls = !prev;
      if (newShowControls && controlsTimeoutRef.current) {
         clearTimeout(controlsTimeoutRef.current);
      }
      if (newShowControls) {
         controlsTimeoutRef.current = setTimeout(() => {
           setShowControls(false);
         }, 3000);
      }
      return newShowControls;
    });
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
  const toggleFullScreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
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
  
  const getThumbnailUrl = (media: Video | null): string => {
    if (!media?.url) return '/placeholder.png';

    const cleanUrl = media.url.trim();
    
    // Check for YouTube URLs first and extract thumbnail
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})?/;
    const videoIdMatch = cleanUrl.match(youtubeRegex);
    if (videoIdMatch) {
        const videoId = videoIdMatch[1];
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }

    // If it's an absolute HTTP/HTTPS URL (but not YouTube), use it
    if (cleanUrl.match(/^(http|https):\/\//)) {
        return cleanUrl;
    }

    // Otherwise, it's a relative path, prepend base URL
    return `${process.env.NEXT_PUBLIC_MEDIA_URL || ''}${cleanUrl.startsWith('/') ? '' : '/'}${cleanUrl}`;
  };

  const playerCore = (
    <div 
      ref={playerContainerRef}
      className={cn(
        "relative w-full h-full aspect-video bg-black overflow-hidden border-0 md:border md:rounded-xl card-blur-player",
        // MODIFICACIÓN: Sombra dual aplicada aquí
        "shadow-[0_4px_20px_rgba(0,0,0,0.5)] dark:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={isMobile ? handleTouchShowControls : undefined}
    >
      <div className="absolute inset-0 w-full h-full md:rounded-xl overflow-hidden">
        {currentVideo && (
          <VideoPlayer
            key={currentVideo.id || currentVideo.url}
            videoUrl={currentVideo.url}
            autoplay={true}
            onClose={handleOnEnded}
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
                <div className="p-4 bg-black/40 rounded-full border border-white">
                    <Play size={38} className="text-white/80" fill="white" strokeWidth={1.35} />
                </div>
              </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showControls && currentVideo?.type !== 'image' && (
             <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-0 left-0 right-0 w-full z-30"
             >
                <CustomControls 
                  onToggleFullScreen={toggleFullScreen} 
                  isFullScreen={isFullScreen} 
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
       <VideoTitleBar className="mt-0" />
    </div>
  );
};

export default VideoSection;