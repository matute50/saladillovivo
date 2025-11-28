'use client';

import React, { useState, useRef } from 'react'; // <-- useRef added here
import Image from 'next/image';
import Link from 'next/link';
import { Play, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import NewsSlide from '@/components/NewsSlide';
import { AnimatePresence, motion } from 'framer-motion';
import ReactDOM from 'react-dom';

import { useMediaPlayer } from '@/context/MediaPlayerContext';
import { useVolume } from '@/context/VolumeContext'; // Asumimos que este existe

interface NewsCardProps {
  newsItem: any; 
  variant?: string; 
  index?: number;
  className?: string;
}

// Interfaz para las coordenadas del thumbnail
interface RectCoords {
    top: number;
    left: number;
    width: number;
    height: number;
}

const NewsCard: React.FC<NewsCardProps> = ({ newsItem, className }) => {
  const [showSlide, setShowSlide] = useState(false);
  
  // REF: Necesario para medir la posición y tamaño de la imagen que disparamos
  const imageRef = useRef<HTMLDivElement>(null); 
  
  // ESTADO: Almacena las coordenadas de la imagen de la tarjeta
  const [thumbnailRect, setThumbnailRect] = useState<RectCoords | null>(null); 

  // OBTENEMOS LOS CONTROLES DE INTERRUPCIÓN
  const { pause, play, currentVideo } = useMediaPlayer(); 
  const { setMuted } = useVolume(); 

  const hasSlide = !!(newsItem.url_slide || newsItem.audio_url);

  // --- LÓGICA DE DISPARO DEL MODAL ---
  const handlePlaySlide = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();

    if (!imageRef.current) {
        console.warn("No se pudo obtener la referencia de la imagen. Abortando slide.");
        return;
    }

    // 1. Mide la posición y tamaño exactos de la miniatura
    const rect = imageRef.current.getBoundingClientRect();
    setThumbnailRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
    });
    
    // 2. Pausa y mutea el reproductor principal
    if (currentVideo) { pause(); } 
    setMuted(true); 
    
    // 3. Muestra el slide
    setShowSlide(true);
  };

  const handleCloseSlide = () => {
    setShowSlide(false);
    play();
    setMuted(false); 
  };

  const timeAgo = newsItem.createdAt 
    ? formatDistanceToNow(new Date(newsItem.createdAt), { addSuffix: true, locale: es })
    : '';

  const slideArticleData = {
    id: newsItem.id,
    title: newsItem.title || 'Sin Título',
    imageUrl: newsItem.imageUrl,
    audio_url: newsItem.audio_url,
    miniatura_url: newsItem.miniatura_url
  };

  // --- MODAL QUE SE ANCLA AL THUMBNAIL (Portal) ---
  const SlideModal = () => {
    if (!showSlide || typeof document === 'undefined' || !thumbnailRect) return null;
    
    // APLICAMOS LAS COORDENADAS MEDIDAS DIRECTAMENTE
    const alignedStyle = {
      position: 'fixed' as const,
      top: thumbnailRect.top,
      left: thumbnailRect.left,
      width: thumbnailRect.width,
      height: thumbnailRect.height,
      zIndex: 9999,
      transition: 'opacity 0.3s', // Solo transición de opacidad
      backgroundColor: 'transparent',
    };

    return ReactDOM.createPortal(
        <AnimatePresence>
            <motion.div 
                key="anchored-slide-modal"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={alignedStyle} // APLICAMOS LAS COORDENADAS DINÁMICAS
                // Clases mínimas: solo overflow y redondeado
                className="overflow-hidden rounded-lg shadow-2xl" 
            >
                <NewsSlide 
                    article={slideArticleData} 
                    onClose={handleCloseSlide} 
                    isPublicView={false}
                    isMuted={false} // Se activa el sonido con el clic
                />
                
                {/* Botón Cerrar */}
                <button 
                    onClick={handleCloseSlide}
                    className="absolute top-2 right-2 text-white bg-black/50 p-2 rounded-full hover:bg-red-600 transition-colors z-[10000] cursor-pointer"
                >
                    ✕ CERRAR
                </button>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
  };

  return (
    <>
      {showSlide && <SlideModal />}

      <div className={`group relative flex flex-col bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 h-full ${className || ''}`}>
        
        {/* ASIGNAMOS EL REF AL CONTENEDOR DE LA IMAGEN */}
        <div ref={imageRef} className="relative w-full aspect-video overflow-hidden">
          <Link href={`/noticia/${newsItem.slug || newsItem.id}`}>
            <Image
              src={newsItem.imageUrl || '/placeholder.png'}
              alt={newsItem.title || 'Noticia'}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </Link>

          {(newsItem.category || newsItem.categoria) && (
            <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded uppercase shadow-sm z-10">
              {newsItem.category || newsItem.categoria}
            </span>
          )}

          {/* BOTÓN PLAY (Disparador) */}
          {hasSlide && (
            <button
              onClick={handlePlaySlide}
              className="absolute bottom-2 right-2 z-20 bg-red-600 text-white p-2 rounded-full shadow-lg hover:bg-red-700 hover:scale-110 transition-all duration-200 flex items-center justify-center border-2 border-white/20"
              title="Ver en modo TV"
            >
              <Play size={20} fill="currentColor" className="ml-0.5" />
            </button>
          )}
        </div>

        <div className="p-4 flex flex-col flex-grow">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <Clock size={14} />
            <span>{timeAgo}</span>
          </div>
          
          <Link href={`/noticia/${newsItem.slug || newsItem.id}`} className="block flex-grow">
            <h3 className="font-bold text-gray-800 leading-tight hover:text-blue-700 transition-colors line-clamp-3">
              {newsItem.title}
            </h3>
          </Link>
        </div>
      </div>
    </>
  );
};

export default NewsCard;