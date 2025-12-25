'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Play } from 'lucide-react';
import { Article, Video } from '@/lib/types';
import { format } from 'date-fns';
import { isValidSlideUrl } from '@/lib/utils';

import NewsSlide from '@/components/NewsSlide';
import ReactDOM from 'react-dom';
import { useMediaPlayer } from '@/context/MediaPlayerContext';
import { useVolume } from '@/context/VolumeContext';

interface RectCoords {
    top: number;
    left: number;
    width: number;
    height: number;
}

interface NewsCardProps {
  newsItem: any;
  index?: number;
  className?: string;
  onCardClick?: (article: Article) => void;
  isFeatured?: boolean;
}

const NewsCard: React.FC<NewsCardProps> = ({ newsItem, index = 0, className = '', onCardClick, isFeatured = false }) => {
  const [showSlide, setShowSlide] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const [thumbnailRect, setThumbnailRect] = useState<RectCoords | null>(null);

  const { pause, play, currentVideo, playTemporaryVideo } = useMediaPlayer();
  const { setMuted } = useVolume();

  if (!newsItem) return null;

  // Standardize property access
  const title = newsItem.title || newsItem.titulo;
  const slug = newsItem.slug;
  const imageUrl = newsItem.imageUrl;
  const createdAt = newsItem.created_at || newsItem.fecha;
  const category = newsItem.category || newsItem.categoria;
  const hasSlide = isValidSlideUrl(newsItem.url_slide);

  const handleImageClick = (e: React.MouseEvent) => {
    if (onCardClick) {
      e.stopPropagation();
      e.preventDefault();
      onCardClick(newsItem);
    } else if (hasSlide) {
        handlePlaySlide(e);
    }
  };

  const handlePlaySlide = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Si es un video webm, usar el reproductor principal
    if (newsItem.url_slide && newsItem.url_slide.includes('.webm')) {
      const slideAsVideo: Video = {
        id: newsItem.id.toString(),
        nombre: title,
        url: newsItem.url_slide,
        createdAt: createdAt,
        categoria: category || 'Slides',
        imagen: imageUrl || '/placeholder.png',
        novedad: false,
        type: 'video',
      };
      playTemporaryVideo(slideAsVideo);
      return;
    }

    // Lógica original para el modal
    if (!imageRef.current) {
        console.warn("No se pudo obtener la referencia de la imagen. Abortando slide.");
        return;
    }

    const rect = imageRef.current.getBoundingClientRect();
    setThumbnailRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
    });

    if (currentVideo) { pause(); }
    setMuted(true);
    setShowSlide(true);
  };

  const handleCloseSlide = () => {
    setShowSlide(false);
    play();
    setMuted(false);
  };

  const handleMouseEnter = () => {
    if (hasSlide && newsItem.url_slide && newsItem.url_slide.includes('.webm')) {
      // Evita duplicar el link de precarga
      if (document.getElementById('video-preload-link')) {
        return;
      }
      const link = document.createElement('link');
      link.id = 'video-preload-link';
      link.rel = 'preload';
      link.as = 'video';
      link.href = newsItem.url_slide;
      document.head.appendChild(link);
    }
  };


  const slideArticleData: Article = {
    id: newsItem.id,
    titulo: title,
    slug: slug,
    description: newsItem.description || '',
    resumen: newsItem.resumen || '',
    contenido: newsItem.contenido || '',
    fecha: createdAt,
    created_at: createdAt,
    updatedAt: newsItem.updatedAt || createdAt,
    autor: newsItem.autor || 'Saladillo Vivo',
    categoria: category,
    imageUrl: imageUrl,
    featureStatus: newsItem.featureStatus || null,
    audio_url: newsItem.audio_url,

  };

  const SlideModal = () => {
    if (!showSlide || typeof document === 'undefined' || !thumbnailRect) return null;

    const alignedStyle = {
      position: 'fixed' as const,
      top: thumbnailRect.top,
      left: thumbnailRect.left,
      width: thumbnailRect.width,
      height: thumbnailRect.height,
      zIndex: 9999,
      transition: 'opacity 0.3s',
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
                style={alignedStyle}
                className="overflow-hidden rounded-lg shadow-2xl"
            >
                <NewsSlide
                    article={slideArticleData}
                    onEnd={handleCloseSlide}
                />

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

  const articleLink = `/noticia/${slug || newsItem.id}`;
  const priority = index < 4; // Prioritize loading for first few images

  const titleSizeClass = isFeatured ? 'text-[28.224px]' : 'text-[19.494px]';

  return (
    <>
      {showSlide && <SlideModal />}
      <motion.article
        onMouseEnter={handleMouseEnter}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className={`group relative flex flex-col bg-main-gradient rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 h-full ${className || ''}`}
        aria-label={`Noticia: ${title}`}
      >
        <div ref={imageRef} className="relative w-full aspect-video overflow-hidden cursor-pointer" onClick={handleImageClick}>
          <Link href={articleLink} passHref legacyBehavior>
            <a>
              <Image
                src={imageUrl || '/placeholder.png'}
                alt={title || 'Noticia'}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                priority={priority}
                onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.jpg'; }}
              />
            </a>
          </Link>
          {createdAt && (
            <span className="date-on-image">
                {format(new Date(createdAt), "dd/MM/yyyy")}
            </span>
          )}

          {hasSlide && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Play size={60} className="text-white drop-shadow-lg" fill="currentColor" />
            </div>
          )}

          {hasSlide /* && !onCardClick */ && (
            <motion.button
              onClick={handlePlaySlide}
              className="absolute bottom-2 right-2 z-20 p-2 rounded-full shadow-lg flex items-center justify-center bg-black/15 border-[1.5px] text-white border-white shadow-black/50 backdrop-blur-md"
              title="Ver en modo TV"
              animate={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
              whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <Play size={20} fill="currentColor" className="ml-0.5" />
            </motion.button>
          )}
        </div>

        <div className="p-4 flex flex-col flex-grow">
          {/* <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <Clock size={14} />
            <span>{timeAgo}</span>
          </div> */}

          <Link href={articleLink} className="block flex-grow">
            <h3 className={`font-bold ${titleSizeClass} text-black dark:text-white text-shadow-[0_2px_4px_rgba(0,0,0,0.2)] dark:text-shadow-[0_2px_4px_rgba(0,0,0,0.5)] leading-tight hover:text-blue-700 transition-colors line-clamp-4`}>
              {title}
            </h3>
          </Link>
        </div>
      </motion.article>
    </>
  );
};

export default NewsCard;
