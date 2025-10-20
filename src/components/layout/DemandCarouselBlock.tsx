'use client';

import React from 'react';
import ExclusiveVideoCarousel from './ExclusiveVideoCarousel';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DemandCarouselBlock = ({ 
  title,
  videos,
  isLoading,
  onCategoryChange,
  isMobile = false,
  carouselId
}) => {

  if (!videos) {
    return null; // Or a loading/error state
  }

  return (
    <div className={`demand-block flex flex-col items-start w-full relative`}>
      <div className="flex items-center justify-center w-full gap-x-3 z-10 mb-2">
        {onCategoryChange && (
          <button onClick={() => onCategoryChange(-1)} className="carousel-nav-button flex-shrink-0 transition-colors text-white rounded-full p-1 cursor-pointer shadow-xl shadow-black/50 bg-black/30">
            <ChevronLeft size={isMobile ? 13 : 10} />
          </button>
        )}
        <h2 className="text-2xl font-futura-bold text-foreground truncate text-center">
          {title}
        </h2>
        {onCategoryChange && (
          <button onClick={() => onCategoryChange(1)} className="carousel-nav-button flex-shrink-0 transition-colors text-white rounded-full p-1 cursor-pointer shadow-xl shadow-black/50 bg-black/30">
            <ChevronRight size={isMobile ? 13 : 10} />
          </button>
        )}
      </div>
      <div className={`w-full flex items-center justify-center min-h-[126px]`}>
        <ExclusiveVideoCarousel
          videos={videos}
          isLoading={isLoading}
          carouselId={carouselId}
          isMobile={isMobile}
          categoryName={title}
        />
      </div>
    </div>
  );
};

export default DemandCarouselBlock;
