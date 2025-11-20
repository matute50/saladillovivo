'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Newspaper } from 'lucide-react';
import TvBackgroundPlayer from '../tv/TvBackgroundPlayer';
import VideoControls from '../VideoControls';
import TvContentRail from '../tv/TvContentRail'; // Import the actual TvContentRail component

const TvModeLayout = () => {
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const hideOverlayTimer = useRef<NodeJS.Timeout | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false); // State for fullscreen
  const router = useRouter(); // Inicializar useRouter

  const handleMouseEnter = () => {
    if (hideOverlayTimer.current) {
      clearTimeout(hideOverlayTimer.current);
    }
    setIsOverlayVisible(true);
  };

  const handleMouseLeave = () => {
    hideOverlayTimer.current = setTimeout(() => {
      setIsOverlayVisible(false);
    }, 2000); // 2-second delay
  };

  const toggleFullScreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullScreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullScreen(false));
    }
  }, []);

  const handleSwitchToDailyMode = useCallback(() => {
    router.push('/'); // Navegar a la página principal
  }, [router]);

  // Clear the timer when the component unmounts to prevent memory leaks
  useEffect(() => {
    return () => {
      if (hideOverlayTimer.current) {
        clearTimeout(hideOverlayTimer.current);
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
          <h1 className="text-3xl font-black text-white">SALADILLO VIVO</h1>
        </div>

        {/* Footer (Content Rail) */}
        <div className="bg-gradient-to-t from-black/80 to-transparent p-8 pointer-events-auto">
          <div className="flex justify-between items-end">
            {/* VideoControls removed from here */}
            {/* <VideoControls /> */}
            <TvContentRail />
          </div>
        </div>

        {/* Contenedor de controles y botón "Modo Diario" */}
        <div className="absolute top-4 right-4 z-40 flex items-center gap-2 pointer-events-auto">
          <div className="rounded-md p-2 bg-black/10 backdrop-blur-lg shadow-lg shadow-black/50">
            <VideoControls
                showControls={isOverlayVisible}
                onToggleFullScreen={toggleFullScreen}
                isFullScreen={isFullScreen}
            />
          </div>
          <button
            onClick={handleSwitchToDailyMode}
            className="rounded-md p-2 bg-black/10 text-white text-sm font-semibold backdrop-blur-lg shadow-lg shadow-black/50"
          >
            <Newspaper size={20} /> {/* Usar el icono de periódico */}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TvModeLayout;
