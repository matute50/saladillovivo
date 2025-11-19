'use client';

import React from 'react';
import { useMediaPlayer } from '@/context/MediaPlayerContext';
import { Play, Pause, Maximize, Minimize } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoControlsProps {
  showControls: boolean;
  onToggleFullScreen: () => void;
  isFullScreen: boolean;
}

const VideoControls: React.FC<VideoControlsProps> = ({ showControls, onToggleFullScreen, isFullScreen }) => {
  const { isPlaying, togglePlayPause } = useMediaPlayer();

  // Si no está muteado y no se deben mostrar los controles, no renderizar nada
  if (!showControls) {
    return null;
  }

  return (
    <AnimatePresence>
      {showControls && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 z-30 flex items-center justify-between p-4 bg-gradient-to-t from-black/70 to-transparent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          {/* --- Controles Izquierdos --- */}
          <div className="flex items-center gap-4">
            <button onClick={togglePlayPause} className="text-white hover:text-orange-500 transition-colors">
              {isPlaying ? <Pause size={28} fill="white" /> : <Play size={28} fill="white" />}
            </button>
          </div>

          {/* --- Controles Derechos --- */}
          <div className="flex items-center gap-4">
            <button onClick={onToggleFullScreen} className="text-white hover:text-orange-500 transition-colors">
              {isFullScreen ? <Minimize size={24} /> : <Maximize size={24} />}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VideoControls;