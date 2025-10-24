'use client';

import React from 'react';
import { useMediaPlayer } from '@/context/MediaPlayerContext';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { motion, AnimatePresence } from 'framer-motion';

const VideoControls = ({ showControls }) => {
  const {
    isPlaying,
    isMuted,
    volume,
    togglePlayPause,
    toggleMute,
    handleVolumeChange,
    currentVideo, // Changed from currentMedia to currentVideo
  } = useMediaPlayer();

  // Renderiza solo el icono de mute en la esquina inferior derecha cuando está muteado
  if (isMuted) {
    return (
      <motion.div
        className="absolute bottom-4 right-4 z-40"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
      >
        <motion.button
          onClick={toggleMute}
          className="text-white hover:text-orange-500 transition-colors"
          animate={{
            color: ["#FFFFFF", "#FF0000", "#FF0000", "#FFFFFF"],
            scale: [1, 1.2, 1.2, 1],
          }}
          transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
        >
          <VolumeX size={32} /> {/* Icono más grande para el estado muteado */}
        </motion.button>
      </motion.div>
    );
  }

  // Si no está muteado y no se deben mostrar los controles, no renderizar nada
  if (!showControls && !isMuted) {
    return null;
  }

  return (
    <motion.div
      className="absolute bottom-0 left-0 right-0 z-30 flex items-center justify-between p-4 bg-gradient-to-t from-black/70 to-transparent"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2 }}
    >
      {/* --- Controles Izquierdos --- */}
      <div className="flex items-center gap-4">
        <AnimatePresence>
          {showControls && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <button onClick={togglePlayPause} className="text-white hover:text-orange-500 transition-colors">
                {isPlaying ? <Pause size={28} fill="white" /> : <Play size={28} fill="white" />}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- Controles Derechos --- */}
      <div className="flex items-center gap-4">
        {/* Mute/Volumen - Siempre visible si el contenedor es visible */}
        <div className="flex items-center gap-2 w-32">
          <motion.button
            onClick={toggleMute}
            className="text-white hover:text-orange-500 transition-colors"
            animate={{ color: "#FFFFFF", scale: 1 }} // Sin animación de parpadeo cuando no está muteado
            transition={{}}
          >
            {isMuted || volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </motion.button>
          <Slider
            min={0}
            max={100}
            step={1}
            value={[isMuted ? 0 : volume * 100]}
            onValueChange={(value) => handleVolumeChange(value[0])}
            className="w-full"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default VideoControls;
