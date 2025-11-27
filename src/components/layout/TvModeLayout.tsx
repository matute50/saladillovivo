'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import TvBackgroundPlayer from '../tv/TvBackgroundPlayer';
import VideoControls from '../VideoControls';
import TvContentRail from '../tv/TvContentRail';
import { useNews } from '@/context/NewsContext'; // Importar useNews
import Image from 'next/image'; // Importar Image

const TvModeLayout = () => {
  const { handleSearch, searchResults, isSearching, searchLoading } = useNews(); // Get search-related states from NewsContext

  const onSearchSubmit = useCallback((term: string) => {
    handleSearch(term);
  }, [handleSearch]);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const hideOverlayTimer = useRef<NodeJS.Timeout | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false); // State for fullscreen

  const handleMouseEnter = () => {
    if (hideOverlayTimer.current) {
      clearTimeout(hideOverlayTimer.current);
    }
    setIsOverlayVisible(true);
  };

  const handleMouseLeave = () => {
    setIsOverlayVisible(false);
  };

  const toggleFullScreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullScreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullScreen(false));
    }
  }, []);

  const handleSwitchToDailyMode = useCallback(() => {
    window.location.href = '/'; // Forzar recarga completa para navegar a la página principal
  }, []);


  // Clear the timer when the component unmounts to prevent memory leaks
  useEffect(() => {
    // Request fullscreen when the component mounts
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().then(() => setIsFullScreen(true));
    }

    return () => {
      if (hideOverlayTimer.current) {
        clearTimeout(hideOverlayTimer.current);
      }
      // Exit fullscreen when the component unmounts, if it's currently in fullscreen
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    };
  }, []);

  return (
    <div
      className="relative h-screen w-screen overflow-hidden bg-black"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background Player */}
      <TvBackgroundPlayer />

      {/* UI Overlay (Header, Footer, Controls, Content Rail) */}
      <div
        className={`absolute inset-0 z-10 flex flex-col justify-between h-full transition-opacity duration-500 ease-in-out ${
          isOverlayVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-b from-black/80 to-transparent p-8 pointer-events-auto">
          <Image src="/FONDO OSCURO.PNG" alt="Saladillo Vivo Logo" width={192} height={48} className="h-auto w-48" />
        </div>

        {/* Footer (Content Rail) */}
        <div className="bg-gradient-to-t from-black/80 to-transparent p-8 pointer-events-auto">
          <div className="flex justify-between items-end">
            {/* VideoControls removed from here */}
            {/* <VideoControls /> */}
            <TvContentRail
                searchResults={searchResults}
                isSearching={isSearching}
                searchLoading={searchLoading}
            />
          </div>
        </div>

        {/* Contenedor de controles y botón "Modo Diario" */}
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
