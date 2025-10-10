'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

const formatDate = (dateString) => {
  if (!dateString) return 'Fecha no disponible';
  const date = new Date(dateString);
  const options = { day: 'numeric', month: 'numeric', year: '2-digit' };
  try {
    return date.toLocaleDateString('es-ES', options);
  } catch (error) {
    return 'Fecha inválida';
  }
};

const MobileNewsCard = ({ newsItem, isFeatured = false }) => {
  if (!newsItem) return null;

  const { featureStatus } = newsItem;

  // Define title size based on feature status for visual hierarchy on mobile
  let titleClass;
  if (isFeatured) {
    titleClass = 'text-base'; // Larger title for the main featured news
  } else {
    titleClass =
      featureStatus === 'secondary' ? 'text-sm' :   // Default size for secondary
      featureStatus === 'tertiary' ? 'text-xs' :     // A bit smaller for tertiary
      'text-xs font-light'; // Smallest and lighter for regular news
  }

  return (
    <Link href={`/noticia/${newsItem.slug}`} passHref>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full card card-blur shadow-md cursor-pointer overflow-hidden flex flex-col h-full"
      >
        <div className={`news-image-container relative ${isFeatured ? 'aspect-video' : 'aspect-[16/10]'}`}>
          <Image
            loading="lazy"
            className="w-full h-full object-cover"
            alt={`Imagen de: ${newsItem.titulo}`}
            src={newsItem.imageUrl}
            fill
            sizes={isFeatured ? "(max-width: 640px) 100vw, 100vw" : "(max-width: 640px) 50vw, 50vw"}
          />
          <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
            {formatDate(newsItem.fecha)}
          </div>
        </div>
        <div className="p-2 flex-grow flex flex-col">
          <h3 className={`font-futura-bold text-card-foreground line-clamp-4 hover:text-primary transition-colors ${titleClass}`}>
            {newsItem.titulo}
          </h3>
        </div>
      </motion.div>
    </Link>
  );
};

export default MobileNewsCard;
