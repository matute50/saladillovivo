'use client';

import React from 'react';
import NewsCard from '../NewsCard';
import type { Article } from '@/lib/types';

interface NewsColumnProps {
  news: Article[];
}

const NewsColumn: React.FC<NewsColumnProps> = ({ news }) => {
  if (!news || news.length === 0) {
    return null;
  }

  // Dividimos las noticias en los grupos requeridos
  const featuredNews = news.length > 0 ? news[0] : null;
  const secondaryNews = news.slice(1, 3);
  const tertiaryNews = news.slice(3, 7);

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Noticia Destacada */}
      {featuredNews && (
        <NewsCard
          newsItem={featuredNews}
          variant="destacada-principal"
          className="col-span-1 md:col-span-2"
        />
      )}

      {/* 2. Noticias Secundarias */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {secondaryNews.map((noticia, index) => (
          <NewsCard
            key={noticia.id}
            newsItem={noticia}
            variant="secundaria"
            index={index}
          />
        ))}
      </div>

      {/* 3. Noticias Terciarias (sin jerarquía) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tertiaryNews.map((noticia, index) => (
          <NewsCard
            key={noticia.id}
            newsItem={noticia}
            variant="default"
            index={index + 2} // Continuamos el delay de la animación
          />
        ))}
      </div>
    </div>
  );
};

export default NewsColumn;
