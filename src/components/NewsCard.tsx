'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Play } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Article } from '@/lib/types';
import Image from 'next/image';

// --- Helper function to fetch random intros ---
async function getRandomIntroUrls(count: number): Promise<string[]> {
  const { data, error } = await supabase.from('intros').select('url');
  if (error || !data || data.length === 0) {
    console.error('Error fetching intros or no intros found:', error);
    return [];
  }
  const urls = data.map(item => item.url);
  // Shuffle and pick
  const shuffled = urls.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// --- Modified NewsCard Component ---
interface NewsCardProps {
  newsItem: Article;
  variant: 'destacada-principal' | 'secundaria' | 'default';
  index?: number;
  className?: string;
  onCardClick?: (article: Article) => void; // Prop para abrir el modal
}

const NewsCard: React.FC<NewsCardProps> = ({ newsItem, variant, index = 0, className = '', onCardClick }) => {
  // Fallback seguro si no hay datos
  if (!newsItem) return null;

  const { titulo, fecha, slug, imageUrl } = newsItem;

  const handleImageClick = (e: React.MouseEvent) => {
    // Si hay una función onCardClick, la usamos y prevenimos la navegación del Link
    if (onCardClick) {
      e.stopPropagation();
      e.preventDefault();
      onCardClick(newsItem);
    }
  };

  let cardClass = 'card overflow-hidden flex flex-col group';
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
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`${cardClass} ${className}`}
      aria-label={`Noticia: ${titulo}`}
    >
      <div className="h-full w-full flex flex-col">
        {/* El Link ahora envuelve toda la tarjeta para mejor accesibilidad, 
            pero el click en la imagen será interceptado */}
        <Link href={articleLink} passHref legacyBehavior>
          <a className="contents">
            <motion.div 
              layoutId={'media-' + newsItem.id}
              className={`relative news-image-container overflow-hidden ${imageContainerClass} cursor-pointer`}
              onClick={handleImageClick} // <-- El click se maneja aquí
            >
              <Image
                src={imageUrl || "/placeholder.jpg"}
                alt={titulo}
                fill
                objectFit="cover"
                priority={priority}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.jpg'; }}
              />
              {dateDisplay}

              {/* Icono de Play sobre la imagen para indicar que es clickeable */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Play size={60} className="text-white drop-shadow-lg" fill="currentColor" />
              </div>

            </motion.div>
            <div className="p-2 flex flex-col flex-grow">
              <h3 className={titleClass}>
                {titulo}
              </h3>
            </div>
          </a>
        </Link>
      </div>
    </motion.article>
  );
};


export default NewsCard;