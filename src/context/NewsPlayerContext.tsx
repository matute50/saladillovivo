'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

export type SlideType = 'html' | 'video' | 'image';

export interface SlideData {
  url: string;
  type: SlideType;
  duration?: number;
  title?: string;
  audioUrl?: string | null; // Audio de locución del estudio
}

interface NewsPlayerContextType {
  playSlide: (slide: SlideData) => void;
  stopSlide: () => void;
  currentSlide: SlideData | null;
  isPlaying: boolean;
}

const NewsPlayerContext = createContext<NewsPlayerContextType | undefined>(undefined);

export const NewsPlayerProvider = ({ children }: { children: ReactNode }) => {
  const [currentSlide, setCurrentSlide] = useState<SlideData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playSlide = useCallback((slide: SlideData) => {
    setCurrentSlide(slide);
    setIsPlaying(true);
  }, []);

  const stopSlide = useCallback(() => {
    setIsPlaying(false);
    setCurrentSlide(null);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && currentSlide) {
      if (currentSlide.duration && currentSlide.duration > 0) {
        // Agregamos tiempo extra (2s) de colchón si sabemos que hay audio, así priorizamos `onEnded`.
        // Si no hay audio, seremos precisos a la duración.
        const margin = currentSlide.audioUrl ? 2 : 0;
        const totalDuration = (currentSlide.duration + margin) * 1000;
        timer = setTimeout(() => {
          stopSlide();
        }, totalDuration);
      }
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentSlide, stopSlide]);


  return (
    <NewsPlayerContext.Provider value={{ playSlide, stopSlide, currentSlide, isPlaying }}>
      {children}
    </NewsPlayerContext.Provider>
  );
};

export const useNewsPlayer = () => {
  const context = useContext(NewsPlayerContext);
  if (!context) {
    throw new Error('useNewsPlayer debe usarse dentro de un NewsPlayerProvider');
  }
  return context;
};