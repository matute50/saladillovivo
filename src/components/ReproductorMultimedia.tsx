'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import VideoIntro from './VideoIntro'; 
import NewsSlide from './NewsSlide'; // Renombrado para coincidir con el nombre de archivo real
import { Article } from '@/lib/types';
import { isValidSlideUrl } from '@/lib/utils';

interface ReproductorMultimediaProps {
  newsData: Article | null;
  onComplete: () => void;
}

/**
 * ReproductorMultimedia: Actúa como un "stage" para mostrar una secuencia.
 * Comienza con un video de intro y luego pasa a un slide de noticias.
 */
export default function ReproductorMultimedia({ newsData, onComplete }: ReproductorMultimediaProps) {
  const [currentStage, setCurrentStage] = useState<'intro' | 'slide'>('intro');

  const handleVideoEnd = () => {
    if (!newsData || !isValidSlideUrl(newsData.url_slide)) {
      onComplete();
      return;
    }
    console.log('Video de introducción terminado. Cambiando a slide de noticias.');
    setCurrentStage('slide');
  };

  return (
    <div 
      className="relative w-full max-w-4xl aspect-video bg-black/20 backdrop-blur-sm overflow-hidden rounded-xl shadow-2xl mx-auto"
      aria-live="polite"
    >
      <AnimatePresence mode='wait'>
        {currentStage === 'intro' && (
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

        {currentStage === 'slide' && (
          <motion.div
            key="slide"
            className="absolute inset-0 w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <NewsSlide article={newsData!} onEnd={onComplete} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

