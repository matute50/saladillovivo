'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Play, Pause, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Article } from '@/lib/types';
import Image from 'next/image';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';

interface NewsCardProps {
  newsItem: Article;
  variant: 'destacada-principal' | 'secundaria' | 'default';
  index?: number;
  className?: string;
}

const NewsCard: React.FC<NewsCardProps> = ({ newsItem, variant, index = 0, className = '' }) => {
  // CORRECCIÓN: Llamar al hook en el nivel superior del componente.
  // Pasamos newsItem?.audio_url para manejar de forma segura el caso en que newsItem es nulo.
  const { state, play, pause } = useAudioPlayer(newsItem?.audio_url || null);

  // Ahora, después de llamar a todos los hooks, podemos hacer un retorno temprano.
  if (!newsItem) return null;

  // El resto de las desestructuraciones y la lógica permanecen después del retorno temprano.
  const { titulo, fecha, slug, imageUrl, audio_url } = newsItem;

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    e.preventDefault();

    if (state === 'playing') {
      pause();
    } else {
      play(); 
    }
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
              src={imageUrl || "/placeholder.jpg"}
              alt={`Imagen de: ${titulo}`}
              width={400}
              height={300}
              priority={priority}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.jpg'; }}
            />
            {dateDisplay}

            {audio_url && (
              <button
                onClick={handleTogglePlay}
                className="absolute bottom-2 right-2 z-10 
                           bg-black bg-opacity-50 text-white rounded-full 
                           w-10 h-10 flex items-center justify-center
                           hover:bg-opacity-70 transition-all focus:outline-none
                           ring-offset-background focus-visible:outline-none focus-visible:ring-2 
                           focus-visible:ring-ring focus-visible:ring-offset-2
                           border border-white drop-shadow-[0_0_15px_black]"
                aria-label={state === 'playing' ? "Pausar audio" : "Reproducir audio"}
              >
                {state === 'playing' && <Pause size={20} />}
                {(state === 'paused' || state === 'stopped' || state === 'error') && <Play size={20} />}
                {state === 'loading' && <Loader2 size={20} className="animate-spin" />}
              </button>
            )}
            
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
