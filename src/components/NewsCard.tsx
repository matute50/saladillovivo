'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { Article } from '@/lib/types';
import { format } from 'date-fns';

interface NewsCardProps {
  newsItem: any;
  index?: number;
  className?: string;
  onCardClick?: (article: Article) => void;
  isFeatured?: boolean;
}

const NewsCard: React.FC<NewsCardProps> = ({ newsItem, index = 0, className = '', onCardClick, isFeatured = false }) => {
  const imageRef = useRef<HTMLDivElement>(null);

  if (!newsItem) return null;

  const title = newsItem.title || newsItem.titulo;
  const slug = newsItem.slug;
  const imageUrl = newsItem.imageUrl;
  const createdAt = newsItem.createdAt || newsItem.fecha;
  const hasSlide = !!newsItem.url_slide;

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
    if (onCardClick) {
      onCardClick(newsItem);
    } else {
      console.warn("onCardClick no está definido, no se puede reproducir el slide integrado.");
    }
  };

  const articleLink = `/noticia/${slug || newsItem.id}`;
  const priority = index < 4;

  const titleSizeClass = isFeatured ? 'text-[28.224px]' : 'text-[19.494px]';

  return (
    <>
      <motion.article
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