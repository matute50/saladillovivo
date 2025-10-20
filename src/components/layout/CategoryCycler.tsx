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
  onNext: () => void;
  onPrev: () => void;
  isMobile: boolean;
  instanceId: string; // Unique ID for the carousel
}

const CategoryCycler: React.FC<CategoryCyclerProps> = ({ 
  allVideos, 
  activeCategory, 
  onNext, 
  onPrev, 
  isMobile, 
  instanceId
}) => {

  const filteredVideos = useMemo(() => {
    if (!activeCategory) return [];
    
    const dbCategories = Array.isArray(activeCategory.dbCategory)
      ? activeCategory.dbCategory
      : [activeCategory.dbCategory];

    return allVideos.filter(video => dbCategories.includes(video.categoria));
  }, [allVideos, activeCategory]);

  if (!activeCategory) {
    return null;
  }

  return (
    <div className="w-full flex flex-col gap-0 my-2">
      {/* Title with Category Cycle Controls */}
      <div className="flex items-center justify-center w-full gap-x-3 z-10">
        <motion.button 
          onClick={onPrev} 
          className="carousel-nav-button-title shadow-xl shadow-black/50 bg-black/30 p-0.5 rounded-md"
          whileHover={{ color: ['#ffffff', '#FF0000', '#ef4444', '#ffffff'], background: '#ef4444' }}
          transition={{ duration: 0.6, times: [0, 0.25, 0.75, 1] }}
          initial={{ color: '#ffffff', background: 'linear-gradient(to right, rgba(30, 58, 138, 0.8), rgba(59, 130, 246, 0.8))' }}
        >
          <ChevronLeft size="16" />
        </motion.button>
        <h2 className="text-2xl font-bold tracking-tight text-foreground/90 truncate text-center w-80">
          {activeCategory.display}
        </h2>
        <motion.button 
          onClick={onNext} 
          className="carousel-nav-button-title shadow-xl shadow-black/50 bg-black/30 p-0.5 rounded-md"
          whileHover={{ color: ['#ffffff', '#FF0000', '#ef4444', '#ffffff'], background: '#ef4444' }}
          transition={{ duration: 0.6, times: [0, 0.25, 0.75, 1] }}
          initial={{ color: '#ffffff', background: 'linear-gradient(to right, rgba(30, 58, 138, 0.8), rgba(59, 130, 246, 0.8))' }}
        >
          <ChevronRight size="16" />
        </motion.button>
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