'use client';

import React from 'react';
import { useMediaPlayer } from '@/context/MediaPlayerContext';
// Importamos el contexto de noticias para detectar el slide
import { useNewsPlayer } from '@/context/NewsPlayerContext';
import { motion, AnimatePresence } from 'framer-motion';
import { getDisplayCategory } from '@/lib/categoryMappings';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';

interface VideoTitleBarProps {
  className?: string;
}

const VideoTitleBar: React.FC<VideoTitleBarProps> = ({ className }) => {
  const { currentVideo, nextVideo, playNextVideoInQueue, removeNextVideoFromQueue } = useMediaPlayer();
  // Hook para saber si hay un slide reproduciéndose
  const { activeSlide } = useNewsPlayer();

  const displayCurrentCategory = currentVideo?.categoria ? getDisplayCategory(currentVideo.categoria) : null;
  const currentVideoTitle = currentVideo?.nombre || null;

  const displayNextCategory = nextVideo?.categoria ? getDisplayCategory(nextVideo.categoria) : null;
  const nextVideoTitle = nextVideo?.nombre || null;

  // Lógica de visualización:
  // Si hay slide, mostramos la barra aunque no haya nextVideo, para mostrar el mensaje de interrupción.
  const isSlideActive = !!activeSlide;
  const showMainBar = !!(currentVideoTitle || nextVideoTitle || isSlideActive);
  
  // La segunda línea se muestra si hay un próximo video cargado O si hay un slide activo (para mostrar "Continuar viendo")
  const showSecondLine = !!(nextVideoTitle || isSlideActive);

  return (
    <AnimatePresence>
      {showMainBar && (
        <motion.div
          className={cn("w-full p-2 card text-right shadow-lg flex flex-col gap-1", className)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          {/* PRIMERA LÍNEA: Video Actual o Noticia */}
          {currentVideoTitle && (
            <div className="flex items-center justify-end gap-2">
              <p className="font-semibold text-black dark:text-white truncate uppercase text-[10px] drop-shadow-sm">
                {isSlideActive ? (
                   "ESTÁS VIENDO: NOTICIAS EN SALADILLO VIVO"
                ) : (
                   <>ESTÁS VIENDO: {displayCurrentCategory && `${displayCurrentCategory.toUpperCase()}, `}{currentVideoTitle}</>
                )}
              </p>
              
              {/* Botón X: Solo visible si NO es slide, para saltar al siguiente video de la cola */}
              {!isSlideActive && (
                <button onClick={playNextVideoInQueue} className="text-red-500 hover:text-red-700 transition-colors">
                  <X size={16} />
                </button>
              )}
            </div>
          )}

          {/* SEGUNDA LÍNEA: Próximo Video o Video Interrumpido */}
          {showSecondLine && (
            <div className="flex items-center justify-end gap-2">
              <p className="font-semibold text-black dark:text-white truncate uppercase text-[10px] drop-shadow-sm">
                {isSlideActive ? (
                  /* Si hay slide, usamos esta línea para mostrar qué video continúa después */
                  <>CONTINUAR VIENDO: {currentVideoTitle}</>
                ) : (
                  /* Si NO hay slide, mostramos el próximo video precargado (aleatorio o de cola) */
                  nextVideoTitle && <>PRÓXIMO VIDEO: {displayNextCategory && `${displayNextCategory.toUpperCase()}, `}{nextVideoTitle}</>
                )}
              </p>
              
              {/* Botón X: Solo visible si NO es slide y hay un video próximo para quitar */}
              {!isSlideActive && nextVideoTitle && (
                <button onClick={removeNextVideoFromQueue} className="text-red-500 hover:text-red-700 transition-colors">
                  <X size={16} />
                </button>
              )}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VideoTitleBar;