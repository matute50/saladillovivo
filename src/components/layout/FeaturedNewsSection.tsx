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

const FeaturedNewsSection = ({ mainFeaturedNews, isMobile = false }) => {
  if (!mainFeaturedNews) return null;

  if (isMobile) {
    return (
      <Link href={`/noticia/${mainFeaturedNews.slug}`} passHref>
        <article
          className="w-full card card-blur shadow-strong cursor-pointer overflow-hidden group/featured"
          aria-label={`Noticia destacada: ${mainFeaturedNews.titulo}`}
        >
          <div className="news-image-container relative aspect-[16/10]">
            <Image 
              loading="lazy"
              className="w-full h-full object-cover"
              alt={`Imagen de: ${mainFeaturedNews.titulo}`}
              src={mainFeaturedNews.imageUrl} 
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="date-on-image">
              <Calendar size={12} className="inline-block mr-1" />
              {formatDate(mainFeaturedNews.fecha)}
            </div>
          </div>
          <div className="p-2">
            <h3 className="font-futura-bold text-sm text-card-foreground line-clamp-3 group-hover/featured:text-primary transition-colors">
              {mainFeaturedNews.titulo}
            </h3>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7 }}
      className="w-full card card-blur featured-news-card overflow-hidden group/featured shadow-strong"
      aria-label="Noticia destacada"
    >
      <Link href={`/noticia/${mainFeaturedNews.slug}`} passHref>
        <div className="news-image-container relative cursor-pointer flex-shrink-0">
          <div className="aspect-video w-full relative">
            <Image 
              className="w-full h-full object-cover"
              alt={`Imagen de la noticia destacada: ${mainFeaturedNews.titulo}`}
              src={mainFeaturedNews.imageUrl} 
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
          <div className="date-on-image">
            <Calendar size={12} className="inline-block mr-1" />
            {formatDate(mainFeaturedNews.fecha)}
          </div>
        </div>
      </Link>
      <div className="p-2 mt-2">
        <Link href={`/noticia/${mainFeaturedNews.slug}`} passHref>
          <h1 
            className="font-futura-bold text-lg md:text-xl mb-2 text-card-foreground transition-colors cursor-pointer line-clamp-6"
          >
            {mainFeaturedNews.titulo}
          </h1>
        </Link>
      </div>
    </motion.article>
  );
};

export default FeaturedNewsSection;
