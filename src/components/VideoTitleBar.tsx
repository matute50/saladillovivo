'use client';

import React from 'react';
import { useMediaPlayer } from '@/context/MediaPlayerContext';
import { useNewsPlayer } from '@/context/NewsPlayerContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDisplayCategory } from '@/lib/categoryMappings'; // Importar la función

interface VideoTitleBarProps {
  className?: string;
}

const VideoTitleBar: React.FC<VideoTitleBarProps> = ({ className }) => {
  const { currentVideo, nextVideo: preloadedNextVideo, playNextVideoInQueue } = useMediaPlayer();
  const { currentSlide, isPlaying: isSlidePlaying, stopSlide } = useNewsPlayer();

  const isSlideActive = isSlidePlaying && currentSlide;

  // --- DATOS ACTUALES ---
  const currentVideoName = currentVideo?.nombre || currentVideo?.title || '';
    
  const currentCategoryDb = currentVideo?.categoria || 'VIDEO';
  const currentDisplayCategory = isSlideActive ? 'INFORMACIÓN' : getDisplayCategory(currentCategoryDb);

  const currentDisplay = `${currentDisplayCategory.toUpperCase()}, ${currentVideoName}`;

  // --- DATOS PRÓXIMOS ---
  // Si hay slide, no mostramos "Próximo" porque es una interrupción
  const nextVideoName = preloadedNextVideo ? (preloadedNextVideo.nombre || preloadedNextVideo.title) : null;
  const nextCategoryDb = preloadedNextVideo ? (preloadedNextVideo.categoria || 'VIDEO') : null;
  const nextDisplayCategory = nextCategoryDb ? getDisplayCategory(nextCategoryDb) : null;

  const nextVideoDisplay = nextVideoName ? `${nextDisplayCategory?.toUpperCase()}, ${nextVideoName}` : '';
  const showNextVideoLine = !isSlideActive && preloadedNextVideo; // Asegurarse de que no sea un slide

  const showBar = !!(currentVideo || preloadedNextVideo || isSlideActive);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .force-legend-color { color: #003399 !important; }
        html.dark .force-legend-color { color: #6699ff !important; }
      `}} />

      <AnimatePresence>
        {showBar && (
          <motion.div
            className={cn(
              "w-full py-0.5 px-2 card text-right flex flex-col gap-0 shadow-lg",
              className
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            {/* LÍNEA 1: TÍTULO ACTUAL */}
            <div className="flex items-center justify-end gap-2">
               <p className="font-semibold text-black dark:text-white truncate uppercase text-[10px] drop-shadow-sm leading-tight">
                  <span className="force-legend-color font-bold">ESTÁS VIENDO:</span> {currentDisplay}
               </p>
               <button 
                  onClick={isSlideActive ? stopSlide : playNextVideoInQueue} 
                  className="text-red-500 hover:text-red-700 transition-colors"
               >
                 <X size={14} />
               </button>
            </div>

            {/* LÍNEA 2: PRÓXIMO VIDEO (Solo si no es slide y hay próximo video) */}
            {showNextVideoLine && (
              <div className="flex items-center justify-end gap-2">
                 <p className="font-semibold text-black dark:text-white truncate uppercase text-[10px] drop-shadow-sm leading-tight">
                    <span className="force-legend-color font-bold">PRÓXIMO VIDEO:</span> {nextVideoDisplay}
                 </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VideoTitleBar;