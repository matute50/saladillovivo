'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface SlideData {
  url: string; 
  duration: number; 
  type: 'html' | 'json' | 'video' | 'image';
}

interface NewsPlayerContextType {
  activeSlide: SlideData | null;
  playSlide: (data: SlideData) => void;
  stopSlide: () => void;
}

const NewsPlayerContext = createContext<NewsPlayerContextType | undefined>(undefined);

export const NewsPlayerProvider = ({ children }: { children: ReactNode }) => {
  const [activeSlide, setActiveSlide] = useState<SlideData | null>(null);

  const playSlide = (data: SlideData) => {
    // Si no viene duración de la DB, usamos 15s por seguridad
    const safeDuration = data.duration && data.duration > 0 ? data.duration : 15;
    console.log(`⏱️ Slide activado: ${safeDuration} segundos.`);
    setActiveSlide({ ...data, duration: safeDuration });
  };

  const stopSlide = () => {
    console.log("⏹️ Slide finalizado. Retomando programación habitual.");
    setActiveSlide(null);
  };

  // --- TEMPORIZADOR AUTOMÁTICO ---
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (activeSlide) {
      timer = setTimeout(() => {
        stopSlide();
      }, activeSlide.duration * 1000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [activeSlide]);

  return (
    <NewsPlayerContext.Provider value={{ activeSlide, playSlide, stopSlide }}>
      {children}
    </NewsPlayerContext.Provider>
  );
};

export const useNewsPlayer = () => {
  const context = useContext(NewsPlayerContext);
  if (!context) throw new Error('useNewsPlayer debe usarse dentro de un NewsPlayerProvider');
  return context;
};