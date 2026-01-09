'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import VideoPlayer from '@/components/VideoPlayer';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useMediaPlayer } from '@/context/MediaPlayerContext';
import { useNewsPlayer } from '@/context/NewsPlayerContext';
import CustomControls from '@/components/CustomControls';
import useCast from '@/hooks/useCast';
import VideoTitleBar from '@/components/VideoTitleBar';
import { cn } from '@/lib/utils';
import { Play, Cast } from 'lucide-react';

interface VideoSectionProps {
  isMobileFixed?: boolean;
  isMobile: boolean;
}

const VideoSection: React.FC<VideoSectionProps> = ({ isMobileFixed = false, isMobile }) => {
  const [isMobileFullscreen, setIsMobileFullscreen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  
  const { currentVideo, nextVideo, isPlaying, handleOnEnded, saveCurrentProgress, resumeAfterSlide, setIsPlaying } = useMediaPlayer();
  const { currentSlide, isPlaying: isSlidePlaying, stopSlide } = useNewsPlayer();

  const { isCastAvailable, handleCast } = useCast(currentVideo);
  const [showControls, setShowControls] = useState(false);
  const [thumbnailSrc, setThumbnailSrc] = useState<string>('/placeholder.png');

  const [playBackgroundEarly, setPlayBackgroundEarly] = useState(false);
  const transitionTriggeredRef = useRef(false);

  const isHtmlSlideActive = isSlidePlaying && currentSlide && currentSlide.type === 'html';
  
  // Detección actualizada para la nueva carpeta
  const isLocalIntro = currentVideo?.url && (
      currentVideo.url.startsWith('/') || 
      currentVideo.url.includes('videos_intro')
  );

  const backgroundVideoUrl = isLocalIntro ? nextVideo?.url : currentVideo?.url;
  const isBackgroundPlaying = isLocalIntro ? playBackgroundEarly : isPlaying;

  useEffect(() => {
    setPlayBackgroundEarly(false);
    transitionTriggeredRef.current = false;
  }, [currentVideo?.id]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isHtmlSlideActive && currentSlide) {
        setIsPlaying(false);
        const duration = (currentSlide.duration || 15) * 1000;
        timer = setTimeout(() => {
            stopSlide(); 
            resumeAfterSlide(); 
        }, duration);
    }
    return () => clearTimeout(timer);
  }, [isHtmlSlideActive, currentSlide, stopSlide, resumeAfterSlide, setIsPlaying]);

  useEffect(() => {
    if (!currentVideo?.url || isLocalIntro) {
        setThumbnailSrc('/placeholder.png');
        return;
    }
    const cleanUrl = currentVideo.url.trim();
    const match = cleanUrl.match(/(?:youtu\.be\/|youtube\.com\/.*v=)([^&]+)/);
    if (match && match[1]) {
        setThumbnailSrc(`https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`);
    } else {
        setThumbnailSrc('/placeholder.png');
    }
  }, [currentVideo, isLocalIntro]);



  const toggleFullScreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) playerContainerRef.current.requestFullscreen();
    else document.exitFullscreen?.();
  };

  useEffect(() => {
    const handleFs = () => {
        setIsFullScreen(!!document.fullscreenElement);
        if(isMobile) setIsMobileFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFs);
    return () => document.removeEventListener('fullscreenchange', handleFs);
  }, [isMobile]);

  const handleProgress = ({ playedSeconds }: { playedSeconds: number }) => {
      if (!isLocalIntro) saveCurrentProgress(playedSeconds);
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
           </div>
        )}

        {isLocalIntro && (
           <div className="absolute inset-0 z-30 bg-black">
             <video
                key={currentVideo.id}
                src={currentVideo.url}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
                onEnded={handleOnEnded}
                onTimeUpdate={handleIntroTimeUpdate}
                onError={(e) => {
                  console.error("ERROR INTRO:", currentVideo.url, e);
                  handleOnEnded(); 
                }}
             />
           </div>
        )}

        {backgroundVideoUrl && !isHtmlSlideActive && (
          <div className="absolute inset-0 z-20">
             <VideoPlayer
                key={backgroundVideoUrl} 
                videoUrl={backgroundVideoUrl}
                autoplay={isBackgroundPlaying}
                onClose={handleOnEnded}
                onProgress={handleProgress} 
                startAt={!isLocalIntro ? (currentVideo as any).startAt : 0} 
             />
          </div>
        )}

        {!isHtmlSlideActive && !isPlaying && !isLocalIntro && !playBackgroundEarly && (
          <Image
            src={thumbnailSrc}
            alt="Fondo"
            fill
            className="absolute inset-0 z-10 object-cover opacity-60"
            priority
            onError={() => setThumbnailSrc('/placeholder.png')}
          />
        )}

        <AnimatePresence>
          {/* Barras de formato cine cuando está en pausa */}
          {!isPlaying && !isLocalIntro && !isHtmlSlideActive && (
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

          {showControls && !isHtmlSlideActive && !isLocalIntro && (
             <motion.div key="controls" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute bottom-0 left-0 right-0 w-full z-[51]">
                <CustomControls onToggleFullScreen={toggleFullScreen} isFullScreen={isFullScreen} />
             </motion.div>
          )}
          
          {showControls && isCastAvailable && !isHtmlSlideActive && (
            <motion.div key="cast" className="absolute top-4 right-4 z-[52]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <button onClick={handleCast} className="text-white hover:text-orange-500 transition-colors">
                <Cast size={24} />
              </button>
            </motion.div>
          )}

          {!isPlaying && !isHtmlSlideActive && !isLocalIntro && !playBackgroundEarly && currentVideo && (
              <motion.div key="play" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/20 flex items-center justify-center z-50 pointer-events-none">
                <div className="p-4 bg-black/40 rounded-full border border-white"><Play size={38} className="text-white/80" fill="white" strokeWidth={1.35} /></div>
              </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
  
  if (isMobileFixed && isMobileFullscreen) {
     return ReactDOM.createPortal(<div className="fixed inset-0 z-[9999] bg-black">{playerCore}</div>, document.body);
  }
  return (
    <div className={isMobileFixed ? "fixed top-[var(--header-height)] left-0 w-full z-40" : "w-full"}>
       <div className="relative">{playerCore}</div>
       <VideoTitleBar className="mt-0" />
    </div>
  );
};

export default VideoSection;