'use client';

import React from 'react';
import ExclusiveVideoCarousel from './ExclusiveVideoCarousel';

const NewsAndMostWatchedCarousel = ({ content, isLoading, isMobile }) => {

  if (!content || content.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-center w-full gap-x-3 z-10 mb-2">
        <h2 className="text-2xl font-futura-bold text-foreground truncate text-center">
          Novedades
        </h2>
      </div>
      <div className="flex items-center justify-center min-h-[126px]">
        <ExclusiveVideoCarousel
          videos={content}
          isLoading={isLoading}
          carouselId="novedades-carousel"
          isMobile={isMobile}
          categoryName="Novedades"
        />
      </div>
    </div>
  );
};

export default NewsAndMostWatchedCarousel;
