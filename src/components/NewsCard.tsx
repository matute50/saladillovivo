'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Play } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Article } from '@/lib/types';
import Image from 'next/image';
import NewsSlide from './NewsSlide';

interface NewsCardProps {
  newsItem: Article;
  variant: 'destacada-principal' | 'secundaria' | 'default';
  index?: number;
  className?: string;
}

const NewsCard: React.FC<NewsCardProps> = ({ newsItem, variant, index = 0, className = '' }) => {
  const [isSlideOpen, setIsSlideOpen] = useState(false);

  // Fallback seguro si no hay datos
  if (!newsItem) return null;

  const { titulo, fecha, slug, imageUrl, audio_url } = newsItem;
  
  // El slide está disponible si hay un audio_url. Se puede expandir la lógica si hay otros tipos de slide.
  const hasSlide = !!(audio_url);

  const handlePlaySlideClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsSlideOpen(true);
  };

  const handleCloseSlide = () => {
    setIsSlideOpen(false);
  };

  let cardClass = 'card overflow-hidden flex flex-col group cursor-pointer';
  let titleClass = '';
  const imageContainerClass = 'aspect-video';
  let dateDisplay;
  let priority = false;

  switch (variant) {
    case 'destacada-principal':
      cardClass += ' shadow-pop';
      titleClass = 'font-futura-bold text-3xl mt-2 text-card-foreground';
      priority = true;
      dateDisplay = (
        <div className="date-on-image">
          <Calendar size={12} className="inline-block mr-1" />
          {formatDate(fecha, 'numeric')}
        </div>
      );
      break;

    case 'secundaria':
    case 'default':
      cardClass += ' shadow-pop';
      titleClass = `font-futura-bold text-card-foreground group-hover:text-primary transition-colors ${variant === 'secundaria' ? 'text-lg line-clamp-4' : 'text-base line-clamp-3'}`;
      dateDisplay = (
        <div className="date-on-image">
          <Calendar size={10} className="mr-1" />
          <span>{formatDate(fecha, 'numeric')}</span>
        </div>
      );
      break;
  }

  const articleLink = `/noticia/${slug}`;

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className={`${cardClass} ${className}`}
        aria-label={`Noticia: ${titulo}`}
      >
        <div className="h-full w-full flex flex-col">
            <Link href={articleLink} passHref legacyBehavior>
                <a className="contents">
                    <div className={`relative news-image-container overflow-hidden ${imageContainerClass}`}>
                        <Image
                        src={imageUrl || "/placeholder.jpg"}
                        alt={`Imagen de: ${titulo}`}
                        layout="fill"
                        objectFit="cover"
                        priority={priority}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.jpg'; }}
                        />
                        {dateDisplay}

                        {hasSlide && (
                        <div className="absolute bottom-2 right-2 z-20">
                            <button
                            onClick={handlePlaySlideClick}
                            className="z-10 bg-red-600 p-2 rounded-full border-2 border-white/20 shadow-lg
                                        hover:bg-red-700 hover:scale-110 transition-all
                                        flex items-center justify-center text-white"
                            aria-label="Reproducir noticia en formato slide"
                            >
                            <Play size={24} fill="currentColor" />
                            </button>
                        </div>
                        )}
                    </div>
                    <div className="p-2 flex flex-col flex-grow">
                        <h3 className={titleClass}>
                            {titulo}
                        </h3>
                    </div>
                </a>
            </Link>
        </div>
      </motion.article>

      <AnimatePresence>
        {isSlideOpen && (
            <NewsSlide
              article={newsItem}
              onClose={handleCloseSlide}
              isMuted={false}
            />
        )}
      </AnimatePresence>
    </>
  );
};

export default NewsCard;