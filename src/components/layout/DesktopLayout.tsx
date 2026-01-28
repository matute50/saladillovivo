'use client';

import { useState, useCallback, useEffect } from 'react';
import AdsSection from './AdsSection';
import dynamic from 'next/dynamic';
const VideoSection = dynamic(() => import('./VideoSection'), { ssr: false });

// RUTA CORREGIDA: Apuntamos a src/components/Header.tsx usando el alias @
import Header from '@/components/Header'; 

import type { PageData } from '@/lib/types';
import CategoryCycler from './CategoryCycler';
import { categoryMappings, type CategoryMapping } from '@/lib/categoryMappings';
import { useNews } from '@/context/NewsContext';
import NoResultsCard from './NoResultsCard';
import NewsCard from '../NewsCard';

const DesktopLayout = ({ data }: { data: PageData }) => {
  const { articles, videos = { allVideos: [] }, ads, tickerTexts = [] } = data || {};
  const { isSearching, searchResults, searchLoading, handleSearch } = useNews();
  const { allVideos } = videos;

  // Lógica de filtrado de categorías para el carrusel central
  const availableCategoryMappings = categoryMappings.filter(category => {
    const dbCategories = Array.isArray(category.dbCategory) ? category.dbCategory : [category.dbCategory];
    return allVideos.some(video => dbCategories.includes(video.categoria));
  });

  const [categoryIndex, setCategoryIndex] = useState(0);

  return (
    <>
      {/* HEADER RESTAURADO CON LA RUTA CORRECTA */}
      <Header />

      <main className="w-full bg-gray-100 dark:bg-neutral-950 pt-4">
        <div className="container mx-auto px-2">
          <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-4 relative">
            
            {/* Columna Izquierda: Noticias */}
            <div className="col-span-1 lg:col-span-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-8">
                {articles?.featuredNews && (
                  <div className="sm:col-span-2">
                    <NewsCard newsItem={articles.featuredNews} index={0} isFeatured={true} />
                  </div>
                )}
                {articles?.secondaryNews?.map((n, i) => (
                  <NewsCard key={n.id} newsItem={n} index={i} />
                ))}
              </div>
            </div>

            {/* Columna Central: Video y Carrusel (Fija al hacer scroll) */}
            <div className="hidden lg:block col-span-5 sticky top-[4rem] h-[calc(100vh-5rem)]">
              <div className="flex flex-col h-full gap-2">
                <div className="flex-shrink-0">
                  <VideoSection isMobile={false} />
                </div>
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                  <CategoryCycler 
                    allVideos={isSearching ? searchResults : allVideos} 
                    activeCategory={availableCategoryMappings[categoryIndex]} 
                    isMobile={false} 
                    instanceId="1" 
                  />
                </div>
              </div>
            </div>

            {/* Columna Derecha: Publicidad */}
            <div className="hidden lg:block col-span-2">
               <AdsSection activeAds={ads} isLoading={false} />
            </div>

          </div>
        </div>
      </main>
    </>
  );
};

export default DesktopLayout;