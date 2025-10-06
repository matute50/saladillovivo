'use client';

import React from 'react';
import ExclusiveVideoCarousel from './ExclusiveVideoCarousel';

const NewsCarousel = ({ news, isLoading, isMobile }) => {

  if (!news || news.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-center w-full gap-x-3 z-10 mb-2">
        <h2 className="text-2xl font-futura-bold text-foreground truncate text-center">
          Últimas Noticias
        </h2>
      </div>
      <div className="flex items-center justify-center min-h-[126px]">
        <ExclusiveVideoCarousel
          videos={news}
          isLoading={isLoading}
          carouselId="news-carousel"
          isMobile={isMobile}
          categoryName="Últimas Noticias"
        />
      </div>
    </div>
  );
};

export default NewsCarousel;
