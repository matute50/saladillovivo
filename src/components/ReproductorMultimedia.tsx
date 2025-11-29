'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import VideoIntro from './VideoIntro'; 
import NewsSlide from './NewsSlide'; // Renombrado para coincidir con el nombre de archivo real
import { Article } from '@/lib/types';

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
            {/* 
              Renderiza el slide solo si hay datos, de lo contrario muestra un error.
              Le pasamos los datos de la noticia a través de la prop 'article'.
            */}
            {newsData ? (
              <NewsSlide article={newsData} onEnd={onComplete} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                Error: No se pudieron cargar los datos de la noticia.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

