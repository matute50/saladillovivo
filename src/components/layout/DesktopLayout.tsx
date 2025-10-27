'use client';

import { useState, useCallback, useEffect } from 'react';
import BannerSection from './BannerSection';
import AdsSection from './AdsSection';
import NewsTicker from '../NewsTicker';
import dynamic from 'next/dynamic';

const VideoSection = dynamic(() => import('./VideoSection'), { ssr: false });
import NewsCard from '../NewsCard';
import type { PageData } from '@/lib/types';
import CategoryCycler from './CategoryCycler';
import { categoryMappings, type CategoryMapping } from '@/lib/categoryMappings';

import { useNews } from '@/context/NewsContext';
import NoResultsCard from './NoResultsCard';

const DesktopLayout = ({ data }: { data: PageData }) => {
  const {
    articles,
    videos,
    banners,
    ads,
    tickerTexts,
  } = data;

  const { isSearching, searchResults, searchLoading } = useNews();
  const { featuredNews, secondaryNews } = articles;
  const { allVideos } = videos;

  const availableCategoryMappings = categoryMappings.filter(category => {
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
      <div className="bg-background/80 backdrop-blur-sm mb-0 md:mb-3 fixed top-[calc(var(--desktop-header-height)-18px)] w-full z-40">
        <NewsTicker tickerTexts={tickerTexts} isMobile={false} />
      </div>
      <main className="w-full px-2 py-0 md:pb-4 pt-[calc(var(--desktop-header-height)+var(--ticker-height)-70px)]">
        <div className="container mx-auto px-2">
          {/* Main 3-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-8 mb-8">
            
            {/* Left Column (News) */}
            <div className="col-span-1 lg:col-span-5 flex flex-col gap-6">
              {featuredNews && (
                <NewsCard newsItem={featuredNews} variant="destacada-principal" />
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {secondaryNews.map((noticia) => (
                  <NewsCard key={noticia.id} newsItem={noticia} variant="default" />
                ))}
              </div>
            </div>

            {/* Middle Column (Video) */}
            <div className="col-span-1 lg:col-span-5 mt-8 lg:mt-0">
              <div className="sticky top-[calc(var(--desktop-header-height)+var(--ticker-height)-18px)] flex flex-col gap-2 will-change-transform z-30">
                <VideoSection isMobile={false} />

                {isSearching ? (
                  searchLoading ? (
                    <div className="text-center p-4">Buscando...</div>
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
                  <CategoryCycler 
                    allVideos={allVideos} 
                    activeCategory={availableCategoryMappings[categoryIndex]} 
                    onNext={handleNextCategory}
                    onPrev={handlePrevCategory}
                    isMobile={false} 
                    instanceId="1"
                  />
                )}
              </div>
            </div>

            {/* Right Column (Ads) */}
            <div className="col-span-1 lg:col-span-2 flex flex-col gap-6 mt-8 lg:mt-0">
              <AdsSection activeAds={ads} isLoading={false} />
            </div>
          </div>

          {/* Banners Section */}
          <section className="my-6 -mx-2 md:mx-0" aria-label="Banners publicitarios">
             <BannerSection activeBanners={banners} isLoadingBanners={false} className="w-full" />
          </section>

        </div>
      </main>
    </>
  );
};

export default DesktopLayout;