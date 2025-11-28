'use client';

import React, { useState, useRef } from 'react'; // <-- CORREGIDO: Agregamos useRef
import Image from 'next/image';
import Link from 'next/link';
import { Play, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import NewsSlide from '@/components/NewsSlide';
import { AnimatePresence, motion } from 'framer-motion';
import ReactDOM from 'react-dom';

// IMPORTAMOS HOOKS NECESARIOS PARA EL ALINEAMIENTO Y CONTROLES
import { usePlayerGeometry } from '@/hooks/usePlayerGeometry';
import { useMediaPlayer } from '@/context/MediaPlayerContext';
import { useVolume } from '@/context/VolumeContext';

interface NewsCardProps {
  newsItem: any; 
  variant?: string; 
  index?: number;
  className?: string;
}

const NewsCard: React.FC<NewsCardProps> = ({ newsItem, className }) => {
  const [showSlide, setShowSlide] = useState(false);
  // REF: Necesario para medir la posición y tamaño de la imagen que disparamos
  const imageRef = useRef<HTMLDivElement>(null); 
  
  // ESTADO: Almacena las coordenadas de la imagen donde se hará clic
  const [thumbnailRect, setThumbnailRect] = useState<DOMRect | null>(null); 

  // OBTENEMOS LAS COORDENADAS DEL REPRODUCTOR PRINCIPAL
  const { playerRect } = usePlayerGeometry(); 
  
  // OBTENEMOS LOS CONTROLES DE INTERRUPCIÓN
  const { setIsPlaying, currentVideo } = useMediaPlayer(); 
  const { setVolume, unmute } = useVolume(); 

  const hasSlide = !!(newsItem.url_slide || newsItem.audio_url);

  // --- LÓGICA DE DISPARO DEL MODAL ---
  const handlePlaySlide = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();

    if (!imageRef.current || !playerRect.isReady) {
        console.warn("Cannot measure or player coordinates are not ready.");
        // Fallback: Si no podemos medir, abrimos el slide en fullscreen centralizado
        setShowSlide(true);
        return;
    }

    // 1. Mide la posición de la imagen de la tarjeta que el usuario tocó
    const rect = imageRef.current.getBoundingClientRect();
    setThumbnailRect(rect);
    
    // 2. Pausar el video principal, mutear y mostrar slide
    if (currentVideo) {
        setIsPlaying(false); 
    }
    setVolume(0); 
    setShowSlide(true);
  };

  const handleCloseSlide = () => {
    // 1. Ocultar slide
    setShowSlide(false);
    // 2. Reanudar el video principal
    setIsPlaying(true);
    // 3. Restaurar volumen
    unmute(); 
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

  // --- MODAL QUE SE ALINEA AL REPRODUCTOR PRINCIPAL ---
  const SlideModal = () => {
    if (!showSlide || typeof document === 'undefined') return null;
    
    // Si la posición del reproductor principal está lista, el slide se alinea a él
    // Si no está lista (null), usamos las coordenadas de la tarjeta para una vista previa local.
    const targetRect = playerRect.isReady ? playerRect : thumbnailRect;
    
    if (!targetRect) return null;

    // Estilo que se alinea al bounding box final
    const alignedStyle = {
      position: 'fixed' as const,
      top: targetRect.top,
      left: targetRect.left,
      width: targetRect.width,
      height: targetRect.height,
      zIndex: 9999,
      backgroundColor: 'transparent',
      transition: 'all 0.3s ease-out', 
    };

    return ReactDOM.createPortal(
        <AnimatePresence>
            <motion.div 
                key="aligned-slide-modal"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={alignedStyle} // APLICAMOS LAS COORDENADAS DINÁMICAS
                className="overflow-hidden rounded-xl shadow-2xl" 
            >
                <NewsSlide 
                    article={slideArticleData} 
                    onClose={handleCloseSlide} 
                    isPublicView={false}
                    isMuted={false}
                />
                
                {/* Botón Cerrar (Posicionado dentro del área del reproductor) */}
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

        {/* ... Resto del contenido de la tarjeta ... */}
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