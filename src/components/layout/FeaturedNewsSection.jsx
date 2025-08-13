
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';

const FeaturedNewsSection = ({ mainFeaturedNews, openModal, isMobile = false }) => {
  if (!mainFeaturedNews) return null;

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

  if (isMobile) {
    return (
      <article
        className="w-full card card-blur shadow-strong cursor-pointer overflow-hidden group/featured"
        onClick={() => openModal(mainFeaturedNews)}
        aria-label={`Noticia destacada: ${mainFeaturedNews.titulo}`}
      >
        <div className="news-image-container relative aspect-[16/10]">
          <img 
            loading="lazy"
            className="w-full h-full object-cover"
            alt={`Imagen de: ${mainFeaturedNews.titulo}`}
            src={mainFeaturedNews.imageUrl} 
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
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7 }}
      className="w-full card card-blur featured-news-card overflow-hidden flex flex-col h-full group/featured shadow-strong"
      aria-label="Noticia destacada"
    >
      <div className="news-image-container relative cursor-pointer flex-shrink-0" onClick={() => openModal(mainFeaturedNews)}>
        <img 
          className="w-full h-auto object-cover aspect-video"
          alt={`Imagen de la noticia destacada: ${mainFeaturedNews.titulo}`}
          src={mainFeaturedNews.imageUrl} 
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        <div className="date-on-image">
          <Calendar size={12} className="inline-block mr-1" />
          {formatDate(mainFeaturedNews.fecha)}
        </div>
      </div>
      <div className="p-2 flex flex-col mt-2">
        <h1 
          className="font-futura-bold text-lg md:text-xl mb-2 text-card-foreground transition-colors cursor-pointer line-clamp-4"
          onClick={() => openModal(mainFeaturedNews)}
        >
          {mainFeaturedNews.titulo}
        </h1>
      </div>
    </motion.article>
  );
};

export default FeaturedNewsSection;
