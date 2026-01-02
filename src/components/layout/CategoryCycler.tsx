'use client';

import React, { useMemo } from 'react';
import ExclusiveVideoCarousel from './ExclusiveVideoCarousel';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Video } from '@/lib/types';
import { cn } from '@/lib/utils'; 

export interface CategoryMapping {
  display: string;
  dbCategory: string | string[];
}

interface CategoryCyclerProps {
  allVideos: Video[];
  activeCategory: CategoryMapping;
  onNext?: () => void;
  onPrev?: () => void;
  isMobile: boolean;
  instanceId: string;
  isSearchResult?: boolean;
}

const CategoryCycler: React.FC<CategoryCyclerProps> = ({ 
  allVideos, 
  activeCategory, 
  onNext, 
  onPrev, 
  isMobile, 
  instanceId,
  isSearchResult = false
}) => {

  const filteredVideos = useMemo(() => {
    if (isSearchResult) return allVideos;
    if (!activeCategory) return [];
    
    if (activeCategory.dbCategory === '__NOVEDADES__') {
      return allVideos.filter(video => video.novedad === true);
    }

    const dbCategories = Array.isArray(activeCategory.dbCategory)
      ? activeCategory.dbCategory
      : [activeCategory.dbCategory];

    return allVideos.filter(video => dbCategories.includes(video.categoria));
  }, [allVideos, activeCategory, isSearchResult]);


  if (!activeCategory) {
    return null;
  }

  return (
    <div className="w-full flex flex-col gap-0 my-2">
      {/* Title with Category Cycle Controls */}
      <div className="flex items-center justify-center w-full z-10">
        {!isSearchResult && onPrev && (
          <motion.button 
            onClick={onPrev}
            className="carousel-nav-button-title p-0.5 rounded-md border-[1.5px] text-white border-white shadow-lg shadow-black/50 backdrop-blur-md"
            animate={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
            whileHover={{ backgroundColor: '#012078' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <ChevronLeft size="20" />
          </motion.button>
        )}
        <h2 className="text-3xl font-bold tracking-tight text-[#003399] dark:text-white truncate text-center mx-2 drop-shadow-[0_4px_6px_rgba(0,0,0,0.9)]">
          {activeCategory.display}
        </h2>
        {!isSearchResult && onNext && (
          <motion.button 
            onClick={onNext}
            className="carousel-nav-button-title p-0.5 rounded-md border-[1.5px] text-white border-white shadow-lg shadow-black/50 backdrop-blur-md"
            animate={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
            whileHover={{ backgroundColor: '#012078' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <ChevronRight size="20" />
          </motion.button>
        )}
      </div>

      {/* Video Carousel - SIN SOMBRAS */}
      <div className="-mt-[5px] w-full relative z-0 rounded-xl overflow-hidden">
        <ExclusiveVideoCarousel
          key={activeCategory.display}
          videos={filteredVideos}
          isLoading={false}
          carouselId={`category-cycler-${instanceId}`}
          isMobile={isMobile}
        />
      </div>
    </div>
  );
};

export default CategoryCycler;