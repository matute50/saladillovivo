'use client';

import React from 'react';
import { motion } from 'framer-motion';
import ReproductorMultimedia from './ReproductorMultimedia';
import type { Article } from '@/lib/types'; // Importando el tipo para la noticia

interface NewsModalProps {
  onClose: () => void;
  newsData: Article; // Se asume que newsData no será nulo cuando el modal esté abierto
}

/**
 * NewsModal: Un componente de superposición (overlay) para mostrar el reproductor multimedia
 * de una noticia específica. Se muestra sobre el contenido de la página.
 */
const NewsModal: React.FC<NewsModalProps> = ({ onClose, newsData }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xl"
      onClick={onClose} // Cierra el modal si se hace clic en el fondo
    >
      {/* Botón para cerrar el modal, posicionado en la esquina superior derecha */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 text-white text-5xl font-bold transition-transform duration-300 hover:scale-110"
        aria-label="Cerrar"
      >
        &times;
      </button>

      <motion.div
        layoutId={'media-' + newsData.id}
        transition={{ type: "spring", stiffness: 200, damping: 25, mass: 1.2 }}
        className="relative w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()} // Evita que el clic en el reproductor cierre el modal
      >
        {/* El reproductor multimedia se renderiza aquí en el centro */}
        <ReproductorMultimedia newsData={newsData} onComplete={onClose} />
      </motion.div>
    </motion.div>
  );
};

export default NewsModal;
