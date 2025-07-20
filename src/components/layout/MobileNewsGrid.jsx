
import React from 'react';
import { motion } from 'framer-motion';

const MobileNewsCard = ({ newsItem, openModal }) => {
  if (!newsItem) return null;

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full card card-blur shadow-md cursor-pointer overflow-hidden flex flex-col"
      onClick={() => openModal(newsItem)}
    >
      <div className="news-image-container relative aspect-[16/10]">
        <img 
          loading="lazy"
          className="w-full h-full object-cover"
          alt={`Imagen de: ${newsItem.titulo}`}
          src={newsItem.imageUrl} 
        />
        <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
          {formatDate(newsItem.fecha)}
        </div>
      </div>
      <div className="p-2 flex-grow">
        <h3 className="font-futura-bold text-sm text-card-foreground line-clamp-4 hover:text-primary transition-colors">
          {newsItem.titulo}
        </h3>
      </div>
    </motion.div>
  );
};


const MobileNewsGrid = ({ newsItems, openModal }) => {
  if (!newsItems || newsItems.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {newsItems.map((item) => (
          item && <MobileNewsCard key={item.id} newsItem={item} openModal={openModal} />
        ))}
      </div>
    </div>
  );
};

export default MobileNewsGrid;
