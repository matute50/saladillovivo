import React from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, User, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NewsDetailModal = ({ newsItem, onClose }) => {
  if (!newsItem) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    try {
      return new Date(dateString).toLocaleDateString('es-ES', options);
    } catch (error) {
      console.error("Error al formatear fecha en modal:", dateString, error);
      return 'Fecha inválida';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.7, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="card rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 relative"
        onClick={(e) => e.stopPropagation()} 
      > 
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 md:top-4 md:right-4 rounded-full text-muted-foreground hover:text-foreground"
          onClick={onClose}
          aria-label="Cerrar modal"
        >
          <X size={24} />
        </Button>

        <header className="mb-6">
          <h1 className="font-futura-bold text-2xl md:text-3xl mb-3 text-foreground">
            {newsItem.titulo}
          </h1>
          <div className="flex flex-wrap items-center text-xs text-muted-foreground gap-x-4 gap-y-2">
            <div className="flex items-center">
              <Calendar size={14} className="mr-1.5" />
              <span>{formatDate(newsItem.fecha)}</span>
            </div>
            {newsItem.autor && (
              <div className="flex items-center">
                <User size={14} className="mr-1.5" />
                <span>{newsItem.autor}</span>
              </div>
            )}
            {newsItem.categoria && (
              <div className="flex items-center text-primary font-medium">
                <Tag size={14} className="mr-1.5" />
                <span>{newsItem.categoria}</span>
              </div>
            )}
          </div>
        </header>

        {newsItem.imageUrl && (
          <div className="mb-6 rounded-lg overflow-hidden aspect-video bg-muted">
            <img 
              className="w-full h-full object-cover"
              alt={`Imagen de: ${newsItem.titulo}`}
              src={newsItem.imageUrl} 
            />
          </div>
        )}
        
        <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-foreground/80">
          {newsItem.contenido.split('\n\n').map((parrafo, index) => (
            <p key={index} className="mb-4 leading-relaxed">
              {parrafo}
            </p>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default NewsDetailModal;
