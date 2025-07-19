
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';

const SecondaryNewsCard = ({ newsItem, openModal, index = 0 }) => {
  if (!newsItem) return null;

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

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="card card-blur overflow-hidden flex flex-col news-card h-full group cursor-pointer shadow-strong"
      onClick={() => openModal(newsItem)}
      aria-label={`Noticia: ${newsItem.titulo}`}
    >
      <div className="relative news-image-container overflow-hidden">
        <div className="aspect-video w-full bg-muted">
            <img 
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              alt={`Imagen de: ${newsItem.titulo}`}
              src={newsItem.imageUrl} />
        </div>
        <div className="date-on-image">
          <Calendar size={10} className="mr-1" />
          <span>{formatDate(newsItem.fecha)}</span>
        </div>
      </div>
      <div className="p-2 flex flex-col">
        <h3 
          className="font-futura-bold text-base mb-1 text-card-foreground group-hover:text-primary transition-colors line-clamp-4"
        >
          {newsItem.titulo}
        </h3>
      </div>
    </motion.article>
  );
};

export default SecondaryNewsCard;
