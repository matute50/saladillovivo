'use client';

import React from 'react';
import { motion } from 'framer-motion';
import VideoIntro from './VideoIntro';
import VideoPlayer from './VideoPlayer'; 
import { Video } from '@/lib/types';




interface ReproductorMultimediaProps {




  onComplete: () => void;




  videoToPlay?: Video | null;




}

/**
 * ReproductorMultimedia: Actúa como un "stage" para mostrar una secuencia.
 * Comienza con un video de intro y luego pasa a un slide de noticias.
 */
export default function ReproductorMultimedia({ onComplete, videoToPlay }: ReproductorMultimediaProps) {
  const handleVideoEnd = () => {
    console.log('Video de introducción terminado. Finalizando secuencia.');
    onComplete();
  };

  return (
    <div 
      className="relative w-full max-w-4xl aspect-video bg-black/20 backdrop-blur-sm overflow-hidden rounded-xl shadow-2xl mx-auto"
      aria-live="polite"
    >
        {videoToPlay ? (
          <VideoPlayer videoUrl={videoToPlay.url} onEnded={onComplete} autoplay={true} muted={false} />
        ) : (
          <motion.div
            key="intro"
            className="absolute inset-0 w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <VideoIntro onEnd={handleVideoEnd} />
          </motion.div>
        )}
    </div>
  );
}

