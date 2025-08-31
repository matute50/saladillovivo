
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { NewsContext } from '@/context/NewsContext';
import { Calendar, User, Tag } from 'lucide-react';
import NoResultsCard from '@/components/layout/NoResultsCard';

import { slugify } from '@/lib/utils';

const ContentPage = () => {
  const { slug } = useParams();
  const { news } = useContext(NewsContext);
  const [newsItem, setNewsItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (news.length > 0) {
      const foundItem = news.find(item => slugify(item.titulo, item.id) === slug);
      setNewsItem(foundItem);
      setLoading(false);
    }
  }, [slug, news]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    try {
      return new Date(dateString).toLocaleDateString('es-ES', options);
    } catch (error) {
      console.error("Error al formatear fecha:", dateString, error);
      return 'Fecha inválida';
    }
  };

  if (loading) {
    return <div className="text-center p-10">Cargando...</div>;
  }

  if (!newsItem) {
    return <NoResultsCard message="No se encontró la noticia que buscas." />;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
        <article>
            <header className="mb-6">
              <h1 className="font-futura-bold text-3xl md:text-4xl lg:text-5xl mb-4 text-foreground leading-tight">
                {newsItem.titulo}
              </h1>
              <div className="flex flex-wrap items-center text-sm text-muted-foreground gap-x-4 gap-y-2">
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
              <div className="mb-6 rounded-lg overflow-hidden aspect-video bg-muted shadow-lg">
                <img 
                  className="w-full h-full object-cover"
                  alt={`Imagen de: ${newsItem.titulo}`}
                  src={newsItem.imageUrl} 
                />
              </div>
            )}
            
            <div className="prose prose-base sm:prose-lg dark:prose-invert max-w-none text-foreground/90">
              {newsItem.contenido.split('\n\n').map((parrafo, index) => (
                <p key={index} className="mb-4 leading-relaxed">
                  {parrafo}
                </p>
              ))}
            </div>
        </article>
    </div>
  );
};

export default ContentPage;
