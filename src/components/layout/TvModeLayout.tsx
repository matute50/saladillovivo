'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import TvBackgroundPlayer from '../tv/TvBackgroundPlayer';
import VideoControls from '../VideoControls';
import TvContentRail from '../tv/TvContentRail';
import { useNews } from '@/context/NewsContext'; 
import Image from 'next/image'; 
import { useNewsPlayer } from '@/context/NewsPlayerContext';
import { motion } from 'framer-motion';
import { useMediaPlayer } from '@/context/MediaPlayerContext'; // Importar el hook del reproductor

const TvModeLayout = () => {
  const { handleSearch, searchResults, isSearching, searchLoading } = useNews(); 
  const { currentSlide, isPlaying: isSlidePlaying } = useNewsPlayer(); 
  const { currentVideo, isPlaying } = useMediaPlayer(); // Obtener el video actual y el estado de reproducción
  const [showBlackRectangle, setShowBlackRectangle] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (currentVideo && (currentVideo.url.includes('youtube.com') || currentVideo.url.includes('youtu.be'))) {
      setShowBlackRectangle(true);
      timer = setTimeout(() => {
        setShowBlackRectangle(false);
      }, 5000);
    } else {
      setShowBlackRectangle(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [currentVideo]);

  const onSearchSubmit = useCallback((term: string) => {
    handleSearch(term);
  }, [handleSearch]);

      const [isOverlayVisible, setIsOverlayVisible] = useState(false);

      const hideOverlayTimer = useRef<NodeJS.Timeout | null>(null);

      const [isFullScreen, setIsFullScreen] = useState(false); 

      const [isMouseOverInteractiveElement, setIsMouseOverInteractiveElement] = useState(false); // Nuevo estado

    

      const cancelHideTimer = () => {

        if (hideOverlayTimer.current) {

          clearTimeout(hideOverlayTimer.current);

        }

      };

    

      // Lógica para mostrar/ocultar el overlay con inactividad del mouse

      const handleMouseActivity = useCallback(() => {

        cancelHideTimer(); // Siempre limpiamos el timer anterior

        setIsOverlayVisible(true);

    

        // Solo configuramos el timer para ocultar si el mouse no está sobre un elemento interactivo

        if (!isMouseOverInteractiveElement) {

            hideOverlayTimer.current = setTimeout(() => {

                setIsOverlayVisible(false);

            }, 1000);

        }

      }, [isMouseOverInteractiveElement]);

    

      useEffect(() => {

        handleMouseActivity();

        return () => {

          cancelHideTimer();

        };

      }, [handleMouseActivity]);

    

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

    

      // Detectar si hay un slide HTML reproduciéndose

      const isHtmlSlide = isSlidePlaying && currentSlide && currentSlide.type === 'html';

    

      return (

        <div

          className="relative h-screen w-screen overflow-hidden bg-black"

          onMouseMove={handleMouseActivity} // El evento principal que controla la visibilidad

        >

                    {/* 1. Fondo (Video/Imagen) - Se oculta si hay slide HTML */}

                    {!isHtmlSlide && <TvBackgroundPlayer />}

          

                                        

          

                    

          

                              {/* Cinematic bars */}

          

                              {!isPlaying && (

          

                                <>

          

                                                <div className="absolute top-0 left-0 w-full bg-black z-20" style={{ height: '15%' }} />

          

                                                <div className="absolute bottom-0 left-0 w-full bg-black z-20" style={{ height: '15%' }} />

          

                                </>

          

                              )}

    

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

            <div 

              className="bg-gradient-to-b from-black/80 to-transparent p-8 pointer-events-auto"

              onMouseEnter={() => { cancelHideTimer(); setIsOverlayVisible(true); setIsMouseOverInteractiveElement(true); }}

                            onMouseLeave={() => { setIsMouseOverInteractiveElement(false); }}

                          >

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

    

            <div 

                            className="bg-gradient-to-t from-black/80 to-transparent p-8 pointer-events-auto"

                            onMouseEnter={() => { cancelHideTimer(); setIsOverlayVisible(true); setIsMouseOverInteractiveElement(true); }}

                            onMouseLeave={() => { setIsMouseOverInteractiveElement(false); }}

            >

              <div className="flex justify-between items-end">

                <TvContentRail

                    searchResults={searchResults}

                    isSearching={isSearching}

                    searchLoading={searchLoading}

                />

              </div>

            </div>

    

            <div 

              className="absolute top-4 right-4 z-40 flex items-center gap-2 pointer-events-auto"

              onMouseEnter={() => { cancelHideTimer(); setIsOverlayVisible(true); setIsMouseOverInteractiveElement(true); }}

              onMouseLeave={() => { setIsMouseOverInteractiveElement(false); }}

            >

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

          {showBlackRectangle && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.5 }}
              className="absolute bottom-[-4px] right-4 w-36 h-24 bg-black rounded-lg shadow-lg z-20"
            >
              <div className="p-4 text-white">
              </div>
            </motion.div>
          )}
        </div>
      );

    };

export default TvModeLayout;