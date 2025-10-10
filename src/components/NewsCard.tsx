'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
      className="card card-blur flex flex-col group"
    >
      <Link href={articleLink} className="flex flex-col cursor-pointer">
        <div className="aspect-video relative overflow-hidden">
          <Image
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            alt={`Imagen de: ${titulo}`}
            src={imageUrl || "https://images.unsplash.com/photo-1456339445756-beb5120afc42"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />
          <div className="date-on-image">
            <Calendar size={12} className="mr-1.5" />
            <span>{formatDate(fecha)}</span>
          </div>
        </div>
        
        <div className="p-2">
          <h3 className="font-futura-bold text-base text-card-foreground transition-colors duration-300 line-clamp-6">
            {titulo}
          </h3>
        </div>
      </Link>
    </motion.article>
  );
};

export default NewsCard;