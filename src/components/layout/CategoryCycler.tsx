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
  instanceId: string;
  isSearchResult?: boolean;
  onCardClick?: (item: any) => void;
}

const CategoryCycler: React.FC<CategoryCyclerProps> = ({ 
  allVideos = [], 
  activeCategory, 
  onNext, 
  onPrev, 
  isMobile, 
  instanceId,
  isSearchResult = false,
  onCardClick
}) => {

  const filteredVideos = useMemo(() => {
    const safeVideos = allVideos || [];

    if (isSearchResult) return safeVideos;
    if (!activeCategory) return [];
    
    // Si es NOTICIAS, devolvemos todo (TvContentRail ya lo filtró)
    if (activeCategory.dbCategory === '__NOTICIAS__') {
      return safeVideos;
    }

    if (activeCategory.dbCategory === '__NOVEDADES__') {
      return safeVideos.filter(video => video.novedad === true);
    }

    const dbCategories = Array.isArray(activeCategory.dbCategory)
      ? activeCategory.dbCategory
      : [activeCategory.dbCategory];

    return safeVideos.filter(video => dbCategories.includes(video.categoria));
  }, [allVideos, activeCategory, isSearchResult]);

  if (!activeCategory) return null;

  return (
    <div className="w-full flex flex-col gap-0 my-2">
      <div className="flex items-center justify-center w-full z-10">

      </div>

      <div className="-mt-[5px] w-full relative z-0">
        <ExclusiveVideoCarousel
          key={activeCategory.display}
          videos={filteredVideos}
          isLoading={false}
          carouselId={`category-cycler-${instanceId}`}
          isMobile={isMobile}
          onVideoClick={onCardClick} 
        />
      </div>
    </div>
  );
};

export default CategoryCycler;