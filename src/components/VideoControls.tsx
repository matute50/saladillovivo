'use client';

import React from 'react';
import { useMediaPlayer } from '@/context/MediaPlayerContext';
import { Play, Pause, Maximize, Minimize, VolumeX, Volume2, Volume1, Volume } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVolume } from '@/context/VolumeContext'; // Import useVolume
import { Slider } from '@/components/ui/slider'; // Import Slider

interface VideoControlsProps {
  showControls: boolean;
  onToggleFullScreen: () => void;
  isFullScreen: boolean;
}

const VideoControls: React.FC<VideoControlsProps> = ({ showControls, onToggleFullScreen, isFullScreen }) => {
  const { isPlaying, togglePlayPause } = useMediaPlayer();
  const { volume, isMuted, setVolume, toggleMute } = useVolume(); // Use volume context

  // Si no se deben mostrar los controles, no renderizar nada
  if (!showControls) {
    return null;
  }

  const VolumeIcon = isMuted
    ? VolumeX
    : volume <= 0.5
    ? Volume1
    : Volume2;

  return (
    <AnimatePresence>
      {showControls && (
        <motion.div
          className="flex items-center justify-between w-full h-full" // Adjusted to be flexible inside its parent
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          {/* --- Controles Izquierdos (Play/Pause y Volumen) --- */}
          <div className="flex items-center gap-4">
            <button onClick={togglePlayPause} className="text-white transition-colors">
              {isPlaying ? <Pause size={28} fill="white" /> : <Play size={28} fill="white" />}
            </button>

            {/* Controles de Volumen */}
            <div className="flex items-center gap-2">
              <button onClick={toggleMute} className="text-white transition-colors">
                <VolumeIcon size={24} />
              </button>
              <Slider
                value={[volume]}
                max={1}
                step={0.01}
                onValueChange={(val) => setVolume(val[0])}
                className="w-[100px]" // Ajusta el ancho del slider
              />
            </div>
          </div>

          {/* --- Controles Derechos (Pantalla Completa) --- */}
          <div className="flex items-center gap-4">
            <button onClick={onToggleFullScreen} className="text-white transition-colors">
              {isFullScreen ? <Minimize size={24} /> : <Maximize size={24} />}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VideoControls;