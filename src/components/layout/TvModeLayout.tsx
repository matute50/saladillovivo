'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import VideoSection from './VideoSection';
import VideoControls from '../VideoControls';
import TvContentRail from '../tv/TvContentRail';
import { useNewsStore } from '@/store/useNewsStore';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '@/store/usePlayerStore'; // Importar el store del reproductor
import { useNewsPlayerStore } from '@/store/useNewsPlayerStore'; // Importar store de noticias
import { CategoryMapping } from '@/lib/categoryMappings'; // Importar CategoryMapping

// Definir las categorías elegibles para el inicio aleatorio
const INITIAL_TV_CATEGORIES: CategoryMapping[] = [
  { display: 'Saladillo Canta', dbCategory: 'clips' },
  { display: 'Gente de Acá', dbCategory: 'export' },
  { display: 'Sembrando Futuro', dbCategory: 'SEMBRANDO FUTURO' },
];

const TvModeLayout = () => {
  const { handleSearch, searchResults, isSearching, searchLoading } = useNewsStore();
  const { isPlaying, setViewMode } = usePlayerStore(); // Obtener el video actual y el estado de reproducción
  const { isPlaying: isNewsPlaying } = useNewsPlayerStore(); // Estado de reproducción de noticias
  const [initialTvCategory, setInitialTvCategory] = useState<CategoryMapping | undefined>(undefined); // Nuevo estado

  useEffect(() => {
    // Seleccionar una categoría aleatoria al montar
    const randomIndex = Math.floor(Math.random() * INITIAL_TV_CATEGORIES.length);
    setInitialTvCategory(INITIAL_TV_CATEGORIES[randomIndex]);
  }, []); // El array vacío asegura que se ejecute solo una vez al montar


  const onSearchSubmit = useCallback((term: string) => {
    handleSearch(term);
  }, [handleSearch]);

  const [isOverlayVisible, setIsOverlayVisible] = useState(false);

  const [isCarouselVisible, setIsCarouselVisible] = useState(false); // Nuevo estado para la visibilidad del carrusel



  const hideOverlayTimer = useRef<NodeJS.Timeout | null>(null);

  const hideCarouselTimer = useRef<NodeJS.Timeout | null>(null); // Nuevo timer para el carrusel



  const [isFullScreen, setIsFullScreen] = useState(false);







  const cancelHideTimer = () => {

    if (hideOverlayTimer.current) {

      clearTimeout(hideOverlayTimer.current);

    }

  };



  const cancelHideCarouselTimer = () => { // Nueva función para cancelar el timer del carrusel

    if (hideCarouselTimer.current) {

      clearTimeout(hideCarouselTimer.current);

    }

  };



  // Lógica Unificada de Inactividad (0.5s)
  const resetIdleTimer = useCallback(() => {
    cancelHideTimer();
    cancelHideCarouselTimer();

    setIsOverlayVisible(true);
    setIsCarouselVisible(true);

    // Timer único global: 500ms de inactividad ocultan todo
    hideOverlayTimer.current = setTimeout(() => {
      setIsOverlayVisible(false);
      setIsCarouselVisible(false);
    }, 500);
  }, []);

  useEffect(() => {
    // Listeners globales para detectar "actividad" real (mouse, teclado, toques)
    const handleActivity = () => resetIdleTimer();

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    // Iniciar timer al montar
    resetIdleTimer();

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      cancelHideTimer();
      cancelHideCarouselTimer();
    };
  }, [resetIdleTimer]);





  const toggleFullScreen = useCallback(() => {

    if (!document.fullscreenElement) {

      document.documentElement.requestFullscreen()

        .then(() => setIsFullScreen(true))

        .catch((e) => console.log("Fullscreen requiere interacción:", e));

    } else {

      document.exitFullscreen().then(() => setIsFullScreen(false)).catch(() => { });

    }

  }, []);





  const handleSwitchToDailyMode = useCallback(() => {
    setViewMode('diario');
  }, [setViewMode]);





  // Detectar si hay un slide HTML reproduciéndose
  // const isHtmlSlide = isSlidePlaying && currentSlide && currentSlide.type === 'html';





  return (

    <div

      className="relative h-screen w-screen overflow-hidden bg-black"

      onMouseMove={resetIdleTimer} // El evento principal que controla la visibilidad

    >

      <div className="absolute inset-0 z-0">
        <VideoSection />
      </div>



      {/* Cinematic bars */}



      <AnimatePresence>
        {!isPlaying && !isNewsPlaying && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.0, ease: "easeOut" }}
            className="absolute inset-0 z-20 pointer-events-none"
          >
            <div className="absolute top-0 left-0 w-full bg-black h-[15%] pointer-events-auto" />
            <div className="absolute bottom-0 left-0 w-full bg-black h-[15%] pointer-events-auto" />
          </motion.div>
        )}
      </AnimatePresence>



      {/* 3. UI Overlay - IMPORTANTE: pointer-events-none para no bloquear el fondo */}
      <div
        className={`absolute inset-0 z-30 flex flex-col justify-between h-full transition-opacity duration-500 ease-in-out pointer-events-none ${isOverlayVisible ? 'opacity-100' : 'opacity-0'}`}
        onMouseMove={resetIdleTimer}
      >
        <div
          className="bg-gradient-to-b from-black/80 to-transparent p-8 pointer-events-auto"
          onMouseEnter={() => { cancelHideTimer(); setIsOverlayVisible(true); }}
        >
          <Image
            src="/FONDO_OSCURO.png"
            alt="Saladillo Vivo Logo"
            width={192}
            height={48}
            className="h-auto w-48 object-contain"
            priority
          />
        </div>

        <div
          className="bg-gradient-to-t from-black/80 to-transparent p-8 pointer-events-auto"
          onMouseEnter={() => { cancelHideTimer(); setIsOverlayVisible(true); }}
        >
          <div className="flex justify-between items-end">
            <div
              className="pointer-events-auto" // Permitir eventos de mouse en este div
              onMouseEnter={() => { cancelHideCarouselTimer(); setIsCarouselVisible(true); }}
            >
              <TvContentRail
                searchResults={searchResults}
                isSearching={isSearching}
                searchLoading={searchLoading}
                initialCategory={initialTvCategory} // Pasa la categoría inicial aleatoria
                isVisible={isCarouselVisible} // Pasa la visibilidad al carrusel
              />
            </div>
          </div>
        </div>

        <div
          className="absolute top-4 right-4 z-40 flex items-center gap-2 pointer-events-auto"
          onMouseEnter={() => { cancelHideTimer(); setIsOverlayVisible(true); }}
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
    </div>
  );

};

export default TvModeLayout;