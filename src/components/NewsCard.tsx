'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Article } from '@/lib/types';

interface NewsCardProps {
  newsItem: Article;
  variant: 'destacada-principal' | 'secundaria' | 'default';
  index?: number;
  className?: string;
}

const NewsCard: React.FC<NewsCardProps> = ({ newsItem, variant, index = 0, className = '' }) => {
  if (!newsItem) return null;

  const { titulo, fecha, slug, imageUrl } = newsItem;

  let cardClass = 'card overflow-hidden flex flex-col group cursor-pointer';
  let titleClass = '';
  let imageContainerClass = 'aspect-video';
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
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`${cardClass} ${className}`}
      aria-label={`Noticia: ${titulo}`}
    >
      <Link href={articleLink} className="flex flex-col h-full">
        <div className={`relative news-image-container overflow-hidden ${imageContainerClass}`}>
            <Image 
              loading={priority ? 'eager' : 'lazy'}
              priority={priority}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              alt={`Imagen de: ${titulo}`}
              src={imageUrl || "https://images.unsplash.com/photo-1456339445756-beb5120afc42"}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {dateDisplay}
        </div>
        <div className="p-2 flex flex-col flex-grow">
          <h3 className={titleClass}>
            {titulo}
          </h3>
        </div>
      </Link>
    </motion.article>
  );
};

export default NewsCard;
