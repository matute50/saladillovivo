'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// Helper function to format dates
const formatDate = (dateString) => {
  if (!dateString) return 'Fecha no disponible';
  const date = new Date(dateString);
  const options = { day: 'numeric', month: 'numeric', year: '2-digit' };
  try {
    return date.toLocaleDateString('es-ES', options);
  } catch (error) {
    console.error("Error al formatear fecha:", dateString, error);
    return 'Fecha inválida';
  }
};

const SecondaryNewsCard = ({ newsItem, index = 0 }) => {
  if (!newsItem) return null;

  const { featureStatus } = newsItem;

  // Define styles based on featureStatus to create visual hierarchy
  const titleClass = 
    featureStatus === 'secondary' ? 'text-lg' : // More prominent title for secondary news
    featureStatus === 'tertiary' ? 'text-base' : // Standard title for tertiary news
    'text-sm'; // Smaller title for regular news

  const cardClass = 
    featureStatus === 'secondary' ? 'shadow-strong' : // Keep strong shadow for secondary
    featureStatus === 'tertiary' ? 'shadow-md' : // Medium shadow for tertiary
    'shadow'; // Basic shadow for regular news

  return (
    <Link href={`/noticia/${newsItem.slug}`} passHref className="h-full">
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className={`card card-blur overflow-hidden flex flex-col news-card group cursor-pointer ${cardClass}`}
        aria-label={`Noticia: ${newsItem.titulo}`}
      >
        <div className="relative news-image-container overflow-hidden">
          <div className="aspect-video w-full bg-muted">
              <Image 
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                alt={`Imagen de: ${newsItem.titulo}`}
                src={newsItem.imageUrl}
                fill // Use fill to cover the container, aspect ratio is set on the parent
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
          </div>
          <div className="date-on-image">
            <Calendar size={10} className="mr-1" />
            <span>{formatDate(newsItem.fecha)}</span>
          </div>
        </div>
        <div className="p-2 flex flex-col">
          <h3 
            className={`font-futura-bold mb-1 text-card-foreground group-hover:text-primary transition-colors line-clamp-6 ${titleClass}`}
          >
            {newsItem.titulo}
          </h3>
        </div>
      </motion.article>
    </Link>
  );
};

export default SecondaryNewsCard;
