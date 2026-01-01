'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { Article, SlideMedia } from '@/lib/types';
import { format } from 'date-fns';
import { useMediaPlayer } from '@/context/MediaPlayerContext';
import { useNewsPlayer } from '@/context/NewsPlayerContext';

interface NewsCardProps {
  newsItem: any;
  index?: number;
  className?: string;
  onCardClick?: (article: Article) => void;
  isFeatured?: boolean;
}

const NewsCard: React.FC<NewsCardProps> = ({ newsItem, index = 0, className = '', onCardClick, isFeatured = false }) => {
  const { playTemporaryVideo } = useMediaPlayer();
  const { playSlide } = useNewsPlayer(); 

  if (!newsItem) return null;

  // --- Normalización de Datos ---
  const title = newsItem.title || newsItem.titulo;
  const imageUrl = newsItem.imageUrl || newsItem.image_url || '/placeholder.png';
  const createdAt = newsItem.created_at || newsItem.fecha;
  const audioUrl = newsItem.audio_url || newsItem.audioUrl;
  const urlSlide = newsItem.url_slide || newsItem.urlSlide;
  const duration = newsItem.animation_duration || 15;

  // Detección de tipo
  const hasSlide = !!urlSlide;
  const isHtmlSlide = hasSlide && urlSlide.endsWith('.html');
  const hasAudioImage = !!imageUrl && !!audioUrl;
  const isPlayable = hasSlide || hasAudioImage;

  // --- Manejadores ---
  
  // 1. ABRIR NOTICIA (Lectura)
  const handleOpenNews = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onCardClick) {
      onCardClick(newsItem);
    }
  };

  // 2. REPRODUCIR (Multimedia) - Lógica Inteligente
  const handlePlaySlide = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    e.preventDefault();

    // CASO A: Slide HTML (Requiere Iframe del NewsPlayer)
    if (isHtmlSlide) {
        console.log("▶ Reproduciendo Slide HTML en Overlay:", title);
        
        if (playSlide) {
            // CORRECCIÓN: Solo pasamos 'url' para cumplir con el tipo SlideData estricto
            playSlide({
                url: urlSlide
            });
        } else {
            console.error("NewsPlayer no disponible para reproducir HTML");
        }
        return;
    }

    // CASO B: Video o Imagen+Audio (Manejado por MediaPlayer)
    let mediaData: SlideMedia | null = null;

    if (hasSlide && !isHtmlSlide) {
        // Videos MP4, WebM, JSON
        mediaData = {
            id: newsItem.id.toString(),
            type: 'video', 
            url: urlSlide,
            nombre: title,
            createdAt: createdAt,
            categoria: 'Noticias',
            imagen: imageUrl,
            novedad: true,
            duration: duration
        };
    } else if (hasAudioImage) {
        // Imagen Estática + Audio
        mediaData = {
            id: newsItem.id.toString(),
            type: 'image',
            url: "", 
            imageSourceUrl: imageUrl,
            audioSourceUrl: audioUrl,
            nombre: title,
            createdAt: createdAt,
            categoria: 'Noticias',
            imagen: imageUrl,
            novedad: true,
            duration: duration
        };
    }

    if (mediaData) {
        console.log("▶ Reproduciendo Video en MediaPlayer:", mediaData.nombre);
        playTemporaryVideo(mediaData);
    }
  };

  const priority = index < 4;
  const titleSizeClass = isFeatured ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl';

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`group relative flex flex-col rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full ${className || ''}`}
    >
      {/* CONTENEDOR BASE */}
      <div className="relative w-full h-full aspect-video overflow-hidden bg-black">
        
        {/* CAPA 1: FONDO INTERACTIVO (Abre la noticia) */}
        <div 
          className="absolute inset-0 z-10 cursor-pointer"
          onClick={handleOpenNews}
          title="Leer noticia"
        >
            <Image
              src={imageUrl}
              alt={title || 'Noticia'}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              priority={priority}
              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.jpg'; }}
            />
            {/* Degradado para texto */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-90" />

            {/* FECHA */}
            {createdAt && (
              <div className="absolute top-3 left-3">
                <span className="bg-black/60 backdrop-blur-md text-white text-[9px] md:text-[11px] font-medium px-2 py-1 rounded border border-white/10 shadow-sm">
                    {format(new Date(createdAt), "dd/MM/yyyy")}
                </span>
              </div>
            )}

            {/* TÍTULO */}
            <div className="absolute bottom-0 left-0 w-full p-4">
                <h3 className={`font-bold ${titleSizeClass} text-white leading-tight drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] group-hover:text-blue-200 transition-colors line-clamp-3`}>
                  {title}
                </h3>
            </div>
        </div>

        {/* CAPA 2: BOTÓN PLAY */}
        {isPlayable && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
            <motion.button
              onClick={handlePlaySlide}
              className="pointer-events-auto flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/50 text-white shadow-[0_0_15px_rgba(0,0,0,0.5)] opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600 hover:border-red-600 hover:scale-110 cursor-pointer"
              whileTap={{ scale: 0.95 }}
              title="Reproducir Slide en Multimedia"
            >
              <Play size={32} fill="currentColor" className="ml-1" />
            </motion.button>
          </div>
        )}

      </div>
    </motion.article>
  );
};

export default NewsCard;