'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { getVideosForHome } from '@/lib/data';
import { Video } from '@/lib/types';
import { categoryMappings, type CategoryMapping } from '@/lib/categoryMappings';
import CategoryCycler from '@/components/layout/CategoryCycler';

interface TvContentRailProps {
  searchResults: Video[];
  isSearching: boolean;
  searchLoading: boolean;
}

const TvContentRail: React.FC<TvContentRailProps> = ({ searchResults, isSearching, searchLoading }) => {

  const [allVideos, setAllVideos] = useState<Video[]>([]);
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoading(true);
      const { allVideos: fetchedVideos } = await getVideosForHome(100);
      setAllVideos(fetchedVideos);
      setIsLoading(false);
    };
    fetchVideos();
  }, []);

  const availableCategoryMappings = useMemo(() => {
    if (allVideos.length === 0) return [];
    return categoryMappings.filter(category => {
      if (category.dbCategory === '__NOVEDADES__') {
        return allVideos.some(video => video.novedad === true);
      }
      const dbCategories = Array.isArray(category.dbCategory) ? category.dbCategory : [category.dbCategory];
      return allVideos.some(video => dbCategories.includes(video.categoria));
    });
  }, [allVideos]);

  useEffect(() => {
    if (availableCategoryMappings.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableCategoryMappings.length);
      setCategoryIndex(randomIndex);
    }
  }, [availableCategoryMappings.length]);

  const handleNextCategory = useCallback(() => {
    const total = availableCategoryMappings.length;
    setCategoryIndex(prevIndex => (prevIndex + 1) % total);
  }, [availableCategoryMappings.length]);

  const handlePrevCategory = useCallback(() => {
    const total = availableCategoryMappings.length;
    setCategoryIndex(prevIndex => (prevIndex - 1 + total) % total);
  }, [availableCategoryMappings.length]);

  if (isLoading || allVideos.length === 0) {
    return (
      <div className="text-white p-4 bg-white/10 rounded-lg flex justify-center items-center h-[126px]">
        Cargando contenido...
      </div>
    );
  }

  // Conditional rendering for search results
  if (isSearching) {
    if (searchLoading) {
      return (
        <div className="text-white p-4 bg-white/10 rounded-lg flex justify-center items-center h-[126px]">
          Buscando videos...
        </div>
      );
    } else if (searchResults.length > 0) {
      const searchCategory: CategoryMapping = {
        display: 'Tu Búsqueda',
        dbCategory: 'search_results',
      }; 

      return (
        <div className="w-full max-w-screen-xl mx-auto px-4">
          <CategoryCycler 
            allVideos={searchResults} 
            activeCategory={searchCategory} 
            onNext={() => {}} 
            onPrev={() => {}} 
            isMobile={false}
            isSearchResult={true}
            instanceId="search-carousel"
          />
        </div>
      );
    } else {
      return (
        <div className="text-white p-4 bg-white/10 rounded-lg flex justify-center items-center h-[126px]">
          No se encontraron resultados para tu búsqueda.
        </div>
      );
    }
  }

  return (
    <div className="w-full max-w-screen-xl mx-auto px-4">
      <CategoryCycler 
        allVideos={allVideos} 
        activeCategory={availableCategoryMappings[categoryIndex]} 
        onNext={handleNextCategory}
        onPrev={handlePrevCategory}
        isMobile={false} 
        instanceId="tv-carousel"
      />
    </div>
  );
};

export default TvContentRail;