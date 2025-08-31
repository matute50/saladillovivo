
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { slugify } from '@/lib/utils';

const NewsCard = ({ noticia, index = 0 }) => {
  const { titulo, fecha, slug, imageUrl, id } = noticia;
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    try {
      return new Date(dateString).toLocaleDateString('es-ES', options);
    } catch (e) {
      return '';
    }
  };

  const articleLink = `/noticia/${slugify(titulo, id)}`;

  return (
    <motion.article 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="card card-blur flex flex-col h-full group"
    >
      <Link to={articleLink} className="flex flex-col h-full cursor-pointer">
        <div className="aspect-video relative overflow-hidden">
          <img   
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
            alt={`Imagen de: ${titulo}`}
            src={imageUrl || "https://images.unsplash.com/photo-1456339445756-beb5120afc42"} 
            loading="lazy"
          />
          <div className="date-on-image">
            <Calendar size={12} className="mr-1.5" />
            <span>{formatDate(fecha)}</span>
          </div>
        </div>
        
        <div className="p-2 flex-grow flex items-center">
          <h3 className="font-futura-bold text-base text-card-foreground transition-colors duration-300 line-clamp-4">
            {titulo}
          </h3>
        </div>
      </Link>
    </motion.article>
  );
};

export default NewsCard;
