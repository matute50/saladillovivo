'use client';

import { useState, useCallback, useEffect } from 'react';
import AdsSection from './AdsSection';
import dynamic from 'next/dynamic';
const VideoSection = dynamic(() => import('./VideoSection'), { ssr: false });

import type { PageData } from '@/lib/types';
import CategoryCycler from './CategoryCycler';
import { categoryMappings, type CategoryMapping } from '@/lib/categoryMappings';
import { useNewsStore } from '@/store/useNewsStore';
import NoResultsCard from './NoResultsCard';
import NewsCard from '../NewsCard';
import NewsTicker from '../NewsTicker';

interface DesktopLayoutProps {
  data: PageData;
}

const DesktopLayout = ({ data }: DesktopLayoutProps) => {
  const {
    articles,
    videos = { allVideos: [] },
    ads,
    tickerTexts = []
  } = data || {};

  const { isSearching, searchResults, searchLoading, handleSearch } = useNewsStore();
  const { allVideos } = videos;

  const availableCategoryMappings = categoryMappings.filter(category => {
    if (category.dbCategory === '__NOVEDADES__') {
      return allVideos.some(video => video.novedad === true);
    }
    const dbCategories = Array.isArray(category.dbCategory) ? category.dbCategory : [category.dbCategory];
    return allVideos.some(video => dbCategories.includes(video.categoria));
  });

  const [categoryIndex, setCategoryIndex] = useState(0);

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

  const searchCategoryMapping: CategoryMapping = {
    display: "Tu Búsqueda",
    dbCategory: "search",
  };

  return (
    <>

      <main className="w-full bg-gray-100 dark:bg-neutral-950 pt-[calc(var(--desktop-header-height)-65px)]">
        <div className="container mx-auto px-2">
          <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-4 relative">

            {/* === COLUMNA IZQUIERDA: NOTICIAS === */}
            <div className="col-span-1 lg:col-span-5">
              <div className="mb-4">
                <NewsTicker tickerTexts={tickerTexts} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-8">
                {articles?.featuredNews && (
                  <div className="sm:col-span-2">
                    <NewsCard newsItem={articles.featuredNews} index={0} isFeatured={true} />
                  </div>
                )}
                {articles?.secondaryNews?.map((noticia, index) => (
                  <NewsCard key={noticia.id} newsItem={noticia} index={index} />
                ))}
                {articles?.tertiaryNews?.map((noticia, index) => (
                  <NewsCard key={noticia.id} newsItem={noticia} index={index} />
                ))}
                {articles?.otherNews?.map((noticia, index) => (
                  <NewsCard key={noticia.id} newsItem={noticia} index={index} />
                ))}
              </div>
            </div>

            {/* === COLUMNA CENTRAL: VIDEO + CARRUSEL (FIJA) === */}
            <div className="hidden lg:block col-span-5 sticky top-0 h-screen">
              <div className="flex flex-col h-full gap-6 pt-0">
                <div className="flex-shrink-0">
                  <VideoSection isMobile={false} />
                </div>

                <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] mt-[-9px] mb-4">
                  {isSearching ? (
                    searchLoading ? (
                      <div className="text-center p-4 text-foreground">Buscando...</div>
                    ) : searchResults.length > 0 ? (
                      <CategoryCycler
                        allVideos={searchResults}
                        activeCategory={searchCategoryMapping}
                        isSearchResult={true}
                        isMobile={false}
                        instanceId="search"
                      />
                    ) : (
                      <NoResultsCard message="No se encontraron videos para tu búsqueda." onClearSearch={() => handleSearch('')} />
                    )
                  ) : (
                    availableCategoryMappings[categoryIndex] && (
                      <CategoryCycler
                        allVideos={allVideos}
                        activeCategory={availableCategoryMappings[categoryIndex]}
                        onNext={handleNextCategory}
                        onPrev={handlePrevCategory}
                        isMobile={false}
                        instanceId="1"
                      />
                    )
                  )}
                </div>
              </div>
            </div>

            {/* === COLUMNA DERECHA: ANUNCIOS === */}
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