'use client';

import React from 'react';
import { useMediaPlayer } from '@/context/MediaPlayerContext';
import { motion, AnimatePresence } from 'framer-motion';
import { getDisplayCategory } from '@/lib/categoryMappings';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';

interface VideoTitleBarProps {
  className?: string;
}

const VideoTitleBar: React.FC<VideoTitleBarProps> = ({ className }) => {
  const { currentVideo, nextVideo, playNextVideoInQueue, removeNextVideoFromQueue } = useMediaPlayer();

  const displayCurrentCategory = currentVideo?.categoria ? getDisplayCategory(currentVideo.categoria) : null;
  const currentVideoTitle = currentVideo?.nombre || null;

  const displayNextCategory = nextVideo?.categoria ? getDisplayCategory(nextVideo.categoria) : null;
  const nextVideoTitle = nextVideo?.nombre || null;

  return (
    <AnimatePresence>
      {(currentVideoTitle || nextVideoTitle) && (
        <motion.div
          className={cn("w-full p-2 card text-right shadow-lg flex flex-col gap-1", className)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          {currentVideoTitle && (
            <div className="flex items-center justify-end gap-2">
              <p className="font-semibold text-black dark:text-white truncate uppercase text-[10px] drop-shadow-sm">
                ESTÁS VIENDO: {displayCurrentCategory && `${displayCurrentCategory.toUpperCase()}, `}{currentVideoTitle}
              </p>
              <button onClick={playNextVideoInQueue} className="text-red-500 hover:text-red-700 transition-colors">
                <X size={16} />
              </button>
            </div>
          )}
          {nextVideoTitle && (
            <div className="flex items-center justify-end gap-2">
              <p className="font-semibold text-black dark:text-white truncate uppercase text-[10px] drop-shadow-sm">
                PRÓXIMO VIDEO: {displayNextCategory && `${displayNextCategory.toUpperCase()}, `}{nextVideoTitle}
              </p>
              <button onClick={removeNextVideoFromQueue} className="text-red-500 hover:text-red-700 transition-colors">
                <X size={16} />
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VideoTitleBar;
