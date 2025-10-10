'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { slugify, formatDate } from '@/lib/utils'; // Importar formatDate
import { Article } from '@/lib/types'; // Importar el tipo

interface NewsCardProps {
  newsItem: Article;
  variant: 'featured-desktop' | 'secondary' | 'tertiary' | 'default' | 'featured-mobile' | 'grid-mobile';
  index?: number;
  className?: string;
}

const NewsCard: React.FC<NewsCardProps> = ({ newsItem, variant, index = 0, className = '' }) => {
  if (!newsItem) return null;

  const { titulo, fecha, slug, imageUrl, id, featureStatus } = newsItem;

  // Definir estilos basados en la variante
  let cardClass = 'card card-blur overflow-hidden flex flex-col group cursor-pointer';
  let titleClass = '';
  let imageContainerClass = 'aspect-video'; // Default aspect ratio
  let dateDisplay;
  let priority = false;

  // Lógica para determinar estilos y comportamiento
  switch (variant) {
    case 'featured-desktop':
      cardClass += ' featured-news-card shadow-strong';
      titleClass = 'font-futura-bold text-lg md:text-xl mb-2 text-card-foreground transition-colors cursor-pointer line-clamp-6';
      priority = true;
      dateDisplay = (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
          <div className="date-on-image">
            <Calendar size={12} className="inline-block mr-1" />
            {formatDate(fecha, 'numeric')}
          </div>
        </>
      );
      break;

    case 'secondary':
      cardClass += ' shadow-strong h-full';
      titleClass = 'font-futura-bold text-lg text-card-foreground group-hover:text-primary transition-colors line-clamp-6';
      dateDisplay = (
        <div className="date-on-image">
          <Calendar size={10} className="mr-1" />
          <span>{formatDate(fecha, 'numeric')}</span>
        </div>
      );
      break;

    case 'tertiary':
      cardClass += ' shadow-md h-full';
      titleClass = 'font-futura-bold text-base text-card-foreground group-hover:text-primary transition-colors line-clamp-6';
      dateDisplay = (
        <div className="date-on-image">
          <Calendar size={10} className="mr-1" />
          <span>{formatDate(fecha, 'numeric')}</span>
        </div>
      );
      break;

    case 'featured-mobile':
      cardClass += ' shadow-md h-full';
      titleClass = 'font-futura-bold text-base text-card-foreground line-clamp-4 hover:text-primary transition-colors';
      dateDisplay = (
        <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
          {formatDate(fecha, 'numeric')}
        </div>
      );
      break;

    case 'grid-mobile':
      cardClass += ' shadow-md h-full';
      imageContainerClass = 'aspect-[16/10]';
      titleClass = `font-futura-bold text-card-foreground line-clamp-4 hover:text-primary transition-colors ${
        featureStatus === 'secondary' ? 'text-sm' :
        featureStatus === 'tertiary' ? 'text-xs' :
        'text-xs font-light'
      }`;
      dateDisplay = (
        <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
          {formatDate(fecha, 'numeric')}
        </div>
      );
      break;

    default: // 'default-desktop'
      cardClass += ' shadow h-full';
      titleClass = 'font-futura-bold text-sm text-card-foreground group-hover:text-primary transition-colors line-clamp-6';
      dateDisplay = (
        <div className="date-on-image">
          <Calendar size={10} className="mr-1" />
          <span>{formatDate(fecha, 'numeric')}</span>
        </div>
      );
      break;
  }

  const articleLink = `/noticia/${slugify(titulo, id)}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`${cardClass} ${className}`}
      aria-label={`Noticia: ${titulo}`}
    >
      <Link href={articleLink} passHref className="flex flex-col flex-grow">
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