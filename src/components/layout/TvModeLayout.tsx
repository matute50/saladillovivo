'use client';

import React, { useState, useEffect, useCallback } from 'react';
import VideoSection from './VideoSection';
import VideoControls from '../VideoControls';
import TvContentRail from '../tv/TvContentRail';
import { useNewsStore } from '@/store/useNewsStore';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useNewsPlayerStore } from '@/store/useNewsPlayerStore';
import { CategoryMapping } from '@/lib/categoryMappings';
import { useRemoteControl } from '@/hooks/useRemoteControl';
import { useNavigationStore } from '@/store/useNavigationStore';

// Definir las categorías elegibles para el inicio aleatorio
const INITIAL_TV_CATEGORIES: CategoryMapping[] = [
  { display: 'Saladillo Canta', dbCategory: 'clips' },
  { display: 'Gente de Acá', dbCategory: 'export' },
  { display: 'Sembrando Futuro', dbCategory: 'SEMBRANDO FUTURO' },
];

const TvModeLayout = () => {
  const { handleSearch, searchResults, isSearching, searchLoading } = useNewsStore();
  const { isPlaying } = usePlayerStore();
  const { isPlaying: isNewsPlaying, currentSlide } = useNewsPlayerStore();
  const isHtmlSlide = isNewsPlaying && currentSlide && currentSlide.type === 'html';
  const [initialTvCategory, setInitialTvCategory] = useState<CategoryMapping | undefined>(undefined);

  // Integración con sistema de navegación espacial
  const { lastActivity } = useRemoteControl(true);
  const { isControlsVisible, setControlsVisible, updateActivity } = useNavigationStore();

  useEffect(() => {
    // Seleccionar una categoría aleatoria al montar
    const randomIndex = Math.floor(Math.random() * INITIAL_TV_CATEGORIES.length);
    setInitialTvCategory(INITIAL_TV_CATEGORIES[randomIndex]);
  }, []); // El array vacío asegura que se ejecute solo una vez al montar

  // Asegurar que los controles estén visibles al montar el componente (Inicio Visible)
  useEffect(() => {
    setControlsVisible(true);
    updateActivity();
  }, [setControlsVisible, updateActivity]);

  // Detectar movimiento del mouse para mostrar controles
  useEffect(() => {
    const handleMouseMove = () => {
      if (!isControlsVisible) {
        setControlsVisible(true);
      }
      updateActivity();
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isControlsVisible, setControlsVisible, updateActivity]);

  const onSearchSubmit = useCallback((term: string) => {
    handleSearch(term);
  }, [handleSearch]);

  // Manejo de teclado para ENTER (Mostrar overlay instantáneamente)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyCode = e.keyCode || e.which;
      if (e.key === 'Enter' || keyCode === 13) {
        if (!isControlsVisible) {
          setControlsVisible(true);
          updateActivity();
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isControlsVisible, setControlsVisible, updateActivity]);

  // Auto-ocultamiento preciso basado en actividad (10 segundos)
  useEffect(() => {
    const INACTIVITY_TIMEOUT = 10000; // 10 segundos exactos solicitado por usuario

    const timer = setTimeout(() => {
      setControlsVisible(false);
    }, INACTIVITY_TIMEOUT);

    return () => clearTimeout(timer);
  }, [lastActivity, setControlsVisible]);

  return (

    <div

      className="relative h-screen w-screen overflow-hidden bg-black"

    >

      <div className="absolute inset-0 z-0">
        <VideoSection />
      </div>

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
        className={`absolute inset-0 z-30 flex flex-col justify-between h-full transition-opacity duration-500 ease-in-out pointer-events-none ${isControlsVisible ? 'opacity-100' : 'opacity-0'}`}
      >
        <div
          className="bg-gradient-to-b from-black/80 to-transparent pt-[22px] px-8 pb-8 pointer-events-auto"
        >
          {!isHtmlSlide && (
            <Image
              src="/FONDO_OSCURO.png"
              alt="Saladillo Vivo Logo"
              width={288}
              height={72}
              className="h-auto w-72 object-contain drop-shadow-[0_0_20px_rgba(0,0,0,1)] drop-shadow-[0_0_45px_rgba(0,0,0,1)]"
              priority
            />
          )}
        </div>

        <div
          className="bg-gradient-to-t from-black/80 to-transparent p-8 pointer-events-auto"
        >
          <div className="flex justify-between items-end">
            <div
              className="pointer-events-auto" // Permitir eventos de mouse en este div
            >
              <TvContentRail
                searchResults={searchResults}
                isSearching={isSearching}
                searchLoading={searchLoading}
                initialCategory={initialTvCategory} // Pasa la categoría inicial aleatoria
                isVisible={isControlsVisible} // Pasa la visibilidad al carrusel
              />
            </div>
          </div>
        </div>

        <div
          className="absolute top-4 right-4 z-[60] flex items-center gap-2 pointer-events-auto"
        >
          <div className="rounded-md p-2 bg-black/10 backdrop-blur-lg shadow-lg shadow-black/50">
            <VideoControls
              showControls={isControlsVisible}
              onSearchSubmit={onSearchSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );

};

export default TvModeLayout;