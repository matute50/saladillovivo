'use client';

import React from 'react';
import { useMediaPlayer } from '@/context/MediaPlayerContext';
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
  const { activeSlide } = useNewsPlayer();

  const displayCurrentCategory = currentVideo?.categoria ? getDisplayCategory(currentVideo.categoria) : null;
  const currentVideoTitle = currentVideo?.nombre || null;

  const displayNextCategory = nextVideo?.categoria ? getDisplayCategory(nextVideo.categoria) : null;
  const nextVideoTitle = nextVideo?.nombre || null;

  const isSlideActive = !!activeSlide;
  const showMainBar = !!(currentVideoTitle || nextVideoTitle || isSlideActive);
  
  const showSecondLine = !!(nextVideoTitle || isSlideActive);

  return (
    <AnimatePresence>
      {showMainBar && (
        <motion.div
          className={cn("w-full py-0.5 px-2 card text-right shadow-lg flex flex-col gap-0", className)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          {/* PRIMERA LÍNEA: Video Actual o Noticia */}
          {currentVideoTitle && (
            <div className="flex items-center justify-end gap-2">
              <p className="font-semibold text-black dark:text-white truncate uppercase text-[10px] drop-shadow-sm leading-tight">
                {isSlideActive ? (
                   <>
                     <span className="text-[#3399ff]">ESTÁS VIENDO:</span> NOTICIAS EN SALADILLO VIVO
                   </>
                ) : (
                   <>
                     <span className="text-[#3399ff]">ESTÁS VIENDO:</span> {displayCurrentCategory && `${displayCurrentCategory.toUpperCase()}, `}{currentVideoTitle}
                   </>
                )}
              </p>
              
              {!isSlideActive && (
                <button onClick={playNextVideoInQueue} className="text-red-500 hover:text-red-700 transition-colors">
                  <X size={14} />
                </button>
              )}
            </div>
          )}

          {/* SEGUNDA LÍNEA: Próximo Video o Video Interrumpido */}
          {showSecondLine && (
            <div className="flex items-center justify-end gap-2">
              <p className="font-semibold text-black dark:text-white truncate uppercase text-[10px] drop-shadow-sm leading-tight">
                {isSlideActive ? (
                  <>
                    <span className="text-[#3399ff]">CONTINUAR VIENDO:</span> {currentVideoTitle}
                  </>
                ) : (
                  nextVideoTitle && (
                    <>
                      <span className="text-[#3399ff]">PRÓXIMO VIDEO:</span> {displayNextCategory && `${displayNextCategory.toUpperCase()}, `}{nextVideoTitle}
                    </>
                  )
                )}
              </p>
              
              {!isSlideActive && nextVideoTitle && (
                <button onClick={removeNextVideoFromQueue} className="text-red-500 hover:text-red-700 transition-colors">
                  <X size={14} />
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