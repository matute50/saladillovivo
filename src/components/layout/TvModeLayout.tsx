'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import VideoSection from './VideoSection';
import VideoControls from '../VideoControls';
import TvContentRail from '../tv/TvContentRail';
import { useNewsStore } from '@/store/useNewsStore';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { usePlayerStore } from '@/store/usePlayerStore'; // Importar el store del reproductor
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
  const [initialTvCategory, setInitialTvCategory] = useState<CategoryMapping | undefined>(undefined); // Nuevo estado

  useEffect(() => {
    // Seleccionar una categoría aleatoria al montar
    const randomIndex = Math.floor(Math.random() * INITIAL_TV_CATEGORIES.length);
    setInitialTvCategory(INITIAL_TV_CATEGORIES[randomIndex]);
  }, []); // El array vacío asegura que se ejecute solo una vez al montar

  // Ocultamos el rectángulo negro viejo ya que VideoSection escala al 102% para ocultar branding.
  const showBlackRectangle = false;

  const onSearchSubmit = useCallback((term: string) => {
    handleSearch(term);
  }, [handleSearch]);

  const [isOverlayVisible, setIsOverlayVisible] = useState(false);

  const [isCarouselVisible, setIsCarouselVisible] = useState(false); // Nuevo estado para la visibilidad del carrusel



  const hideOverlayTimer = useRef<NodeJS.Timeout | null>(null);

  const hideCarouselTimer = useRef<NodeJS.Timeout | null>(null); // Nuevo timer para el carrusel



  const [isFullScreen, setIsFullScreen] = useState(false);

  const [isMouseOverInteractiveElement, setIsMouseOverInteractiveElement] = useState(false); // Nuevo estado

  const [isMouseOverTvContentRail, setIsMouseOverTvContentRail] = useState(false); // Nuevo estado para el carrusel





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



  // Lógica para mostrar/ocultar el overlay con inactividad del mouse

  const handleMouseActivity = useCallback(() => {

    cancelHideTimer(); // Siempre limpiamos el timer anterior

    cancelHideCarouselTimer(); // Limpiar también el timer del carrusel



    setIsOverlayVisible(true);

    setIsCarouselVisible(true); // Mostrar el carrusel al detectar actividad del mouse



    // Solo configuramos el timer para ocultar si el mouse no está sobre un elemento interactivo

    if (!isMouseOverInteractiveElement) {
      hideOverlayTimer.current = setTimeout(() => {
        setIsOverlayVisible(false);
      }, 500);
    }

    if (!isMouseOverInteractiveElement && !isMouseOverTvContentRail) {
      hideCarouselTimer.current = setTimeout(() => {
        setIsCarouselVisible(false);
      }, 500);
    }



  }, [isMouseOverInteractiveElement, isMouseOverTvContentRail]);





  useEffect(() => {

    handleMouseActivity();

    return () => {

      cancelHideTimer();

      cancelHideCarouselTimer(); // Limpiar el timer del carrusel al desmontar

    };

  }, [handleMouseActivity]);





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

      onMouseMove={handleMouseActivity} // El evento principal que controla la visibilidad

    >

      {/* 1. Contenido de Fondo (Video/Stream/NewsSlide) */}
      <div className="absolute inset-0 z-0">
        <VideoSection isMobile={false} />
      </div>



      {/* Cinematic bars */}



      {!isPlaying && (



        <>



          <div className="absolute top-0 left-0 w-full bg-black z-20" style={{ height: '15%' }} />



          <div className="absolute bottom-0 left-0 w-full bg-black z-20" style={{ height: '15%' }} />



        </>



      )}



      {/* 3. UI Overlay - IMPORTANTE: pointer-events-none para no bloquear el fondo */}

      <div

        className={`absolute inset-0 z-30 flex flex-col justify-between h-full transition-opacity duration-500 ease-in-out pointer-events-none ${isOverlayVisible ? 'opacity-100' : 'opacity-0'

          }`}

      >

        <div

          className="bg-gradient-to-b from-black/80 to-transparent p-8 pointer-events-auto"

          onMouseEnter={() => { cancelHideTimer(); setIsOverlayVisible(true); setIsMouseOverInteractiveElement(true); }}

          onMouseLeave={() => { setIsMouseOverInteractiveElement(false); }}

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

          onMouseEnter={() => { cancelHideTimer(); setIsOverlayVisible(true); setIsMouseOverInteractiveElement(true); }}

          onMouseLeave={() => { setIsMouseOverInteractiveElement(false); }}

        >

          <div className="flex justify-between items-end">

            <div

              className="pointer-events-auto" // Permitir eventos de mouse en este div

              onMouseEnter={() => { cancelHideCarouselTimer(); setIsCarouselVisible(true); setIsMouseOverTvContentRail(true); }}

              onMouseLeave={() => { setIsMouseOverTvContentRail(false); }}

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