'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import TvBackgroundPlayer from '../tv/TvBackgroundPlayer';
import VideoControls from '../VideoControls';
import TvContentRail from '../tv/TvContentRail';
import { useNews } from '@/context/NewsContext'; 
import Image from 'next/image'; 
import { useNewsPlayer } from '@/context/NewsPlayerContext'; 

const TvModeLayout = () => {
  const { handleSearch, searchResults, isSearching, searchLoading } = useNews(); 
  const { currentSlide, isPlaying: isSlidePlaying } = useNewsPlayer(); 

  const onSearchSubmit = useCallback((term: string) => {
    handleSearch(term);
  }, [handleSearch]);

  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const hideOverlayTimer = useRef<NodeJS.Timeout | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false); 

  const handleMouseEnter = () => {
    if (hideOverlayTimer.current) clearTimeout(hideOverlayTimer.current);
    setIsOverlayVisible(true);
  };

  const handleMouseLeave = () => {
    setIsOverlayVisible(false);
  };

  const toggleFullScreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
        .then(() => setIsFullScreen(true))
        .catch((e) => console.log("Fullscreen requiere interacción:", e));
    } else {
      document.exitFullscreen().then(() => setIsFullScreen(false)).catch(() => {});
    }
  }, []);

  const handleSwitchToDailyMode = useCallback(() => {
    window.location.href = '/'; 
  }, []);

  useEffect(() => {
    const currentTimer = hideOverlayTimer.current; 
    return () => {
      if (currentTimer) clearTimeout(currentTimer);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    };
  }, []);

  // Detectar si hay un slide HTML reproduciéndose
  const isHtmlSlide = isSlidePlaying && currentSlide && currentSlide.type === 'html';

  return (
    <div
      className="relative h-screen w-screen overflow-hidden bg-black"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 1. Fondo (Video/Imagen) - Se oculta si hay slide HTML */}
      {!isHtmlSlide && <TvBackgroundPlayer />}

      {/* 2. OVERLAY PARA SLIDES HTML (Placas Web) */}
      {isHtmlSlide && (
        <div className="absolute inset-0 z-20 bg-black flex items-center justify-center pointer-events-none">
            <iframe
                src={currentSlide.url}
                className="w-full h-full border-none pointer-events-none"
                title="Slide HTML"
                allow="autoplay; encrypted-media" 
            />
        </div>
      )}

      {/* 3. UI Overlay - IMPORTANTE: pointer-events-none para no bloquear el fondo */}
      <div
        className={`absolute inset-0 z-30 flex flex-col justify-between h-full transition-opacity duration-500 ease-in-out pointer-events-none ${
          isOverlayVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="bg-gradient-to-b from-black/80 to-transparent p-8 pointer-events-auto">
          <Image 
            src="/FONDO OSCURO.PNG" 
            alt="Saladillo Vivo Logo" 
            width={192} 
            height={48} 
            className="h-auto w-48 object-contain"
            style={{ width: 'auto', height: 'auto' }}
            priority
          />
        </div>

        <div className="bg-gradient-to-t from-black/80 to-transparent p-8 pointer-events-auto">
          <div className="flex justify-between items-end">
            <TvContentRail
                searchResults={searchResults}
                isSearching={isSearching}
                searchLoading={searchLoading}
            />
          </div>
        </div>

        <div className="absolute top-4 right-4 z-40 flex items-center gap-2 pointer-events-auto">
          <div className="rounded-md p-2 bg-black/10 backdrop-blur-lg shadow-lg shadow-black/50">
            <VideoControls
                showControls={isOverlayVisible}
                onToggleFullScreen={toggleFullScreen}
                isFullScreen={isFullScreen}
                onSwitchToDailyMode={handleSwitchToDailyMode}
                onSearchSubmit={onSearchSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TvModeLayout;