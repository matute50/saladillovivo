'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { Article } from '@/lib/types';
import { format } from 'date-fns';
import { useNewsPlayer } from '@/context/NewsPlayerContext';

interface NewsCardProps {
  newsItem: any;
  index?: number;
  className?: string;
  onCardClick?: (article: Article) => void;
  isFeatured?: boolean;
}

const NewsCard: React.FC<NewsCardProps> = ({ newsItem, index = 0, className = '', onCardClick, isFeatured = false }) => {
  const { playSlide } = useNewsPlayer();

  if (!newsItem) return null;

  const title = newsItem.title || newsItem.titulo;
  const slug = newsItem.slug;
  const imageUrl = newsItem.imageUrl || newsItem.image_url;
  const createdAt = newsItem.created_at || newsItem.fecha;
  
  // --- CORRECCIÓN DE DURACIÓN ---
  // 1. Leemos exactamente la columna de la base de datos: animation_duration
  // 2. Convertimos a Number() por si viene como string "45.5"
  // 3. Si no existe o es 0, usamos 30 segundos como fallback razonable
  const dbDuration = newsItem.animation_duration;
  const duration = (dbDuration && !isNaN(Number(dbDuration))) ? Number(dbDuration) : 30;

  const hasSlide = !!newsItem.url_slide || (!!newsItem.image_url && !!newsItem.audio_url);

  const handlePlaySlide = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    e.preventDefault();

    if (hasSlide) {
      console.log(`🎬 Play Slide: "${title}" | Duración DB: ${dbDuration} | Duración Final: ${duration}s`);

      let type: 'html' | 'json' | 'video' | 'image' = 'html'; 
      const url = newsItem.url_slide || '';

      if (url.endsWith('.json')) type = 'json';
      else if (url.endsWith('.mp4') || url.endsWith('.webm')) type = 'video';
      else if (!url && newsItem.image_url) type = 'image';

      playSlide({
        url: url,
        duration: duration, // Enviamos la duración limpia
        type: type
      });
    }
  };

  const handleImageClick = (e: React.MouseEvent) => {
    if (onCardClick) {
      onCardClick(newsItem);
    }
  };

  const articleLink = `/noticia/${slug || newsItem.id}`;
  const priority = index < 4;
  const titleSizeClass = isFeatured ? 'text-[28.224px]' : 'text-[19.494px]';

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`group relative flex flex-col bg-main-gradient rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 h-full ${className || ''}`}
    >
      <div className="relative w-full aspect-video overflow-hidden cursor-pointer" onClick={handleImageClick}>
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
        
        {/* BOTÓN PLAY */}
        {hasSlide && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <motion.button
              onClick={handlePlaySlide}
              className="flex items-center justify-center w-16 h-16 rounded-full bg-white bg-opacity-30 backdrop-blur-md text-white drop-shadow-lg z-10 hover:bg-opacity-50 transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title={`Reproducir Slide (${duration}s)`} 
            >
              <Play size={40} fill="currentColor" className="ml-1" />
            </motion.button>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <Link href={articleLink} className="block flex-grow">
          <h3 className={`font-bold ${titleSizeClass} text-black dark:text-white leading-tight hover:text-blue-700 transition-colors line-clamp-4`}>
            {title}
          </h3>
        </Link>
      </div>
    </motion.article>
  );
};

export default NewsCard;