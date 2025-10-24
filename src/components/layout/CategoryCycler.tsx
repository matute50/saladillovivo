'use client';

import React, { useMemo } from 'react';
import ExclusiveVideoCarousel from './ExclusiveVideoCarousel';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Video } from '@/lib/types';

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
  instanceId: string; // Unique ID for the carousel
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
            className="carousel-nav-button-title p-0.5 rounded-md border"
            animate={{ color: ["#FFFFFF", "#6699ff", "#003399", "#000000"], borderColor: ["#FFFFFF", "#6699ff", "#003399", "#000000"] }}
            transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
          >
            <ChevronLeft size="20" />
          </motion.button>
        )}
        <h2 className="text-2xl font-bold tracking-tight text-foreground/90 truncate text-center mx-2">
          {activeCategory.display}
        </h2>
        {!isSearchResult && onNext && (
          <motion.button 
            onClick={onNext}
            className="carousel-nav-button-title p-0.5 rounded-md border"
            animate={{ color: ["#FFFFFF", "#6699ff", "#003399", "#000000"], borderColor: ["#FFFFFF", "#6699ff", "#003399", "#000000"] }}
            transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
          >
            <ChevronRight size="20" />
          </motion.button>
        )}
      </div>

      {/* Video Carousel */}
      <ExclusiveVideoCarousel
        key={activeCategory.display} // Use key to force re-mount
        videos={filteredVideos}
        isLoading={false}
        carouselId={`category-cycler-${instanceId}`}
        isMobile={isMobile}
        categoryName={activeCategory.display}
      />
    </div>
  );
};

export default CategoryCycler;