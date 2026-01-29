'use client';

import { useState, useCallback, useEffect } from 'react';
import AdsSection from './AdsSection';
import dynamic from 'next/dynamic';
const VideoSection = dynamic(() => import('./VideoSection'), { ssr: false });

import Header from '@/components/Header'; 
import type { PageData } from '@/lib/types';
import CategoryCycler from './CategoryCycler';
import { categoryMappings } from '@/lib/categoryMappings';
import { useNews } from '@/context/NewsContext';
import { useMediaPlayer } from '@/context/MediaPlayerContext';
import NoResultsCard from './NoResultsCard';
import NewsCard from '../NewsCard';

const DesktopLayout = ({ data }: { data: PageData }) => {
  const { viewMode } = useMediaPlayer();
  const { articles, videos = { allVideos: [] }, ads, tickerTexts = [] } = data || {};
  const { isSearching, searchResults, searchLoading, handleSearch } = useNews();
  const { allVideos } = videos;

  const availableCategoryMappings = categoryMappings.filter(category => {
    const dbCategories = Array.isArray(category.dbCategory) ? category.dbCategory : [category.dbCategory];
    return allVideos.some(video => dbCategories.includes(video.categoria));
  });

  const [categoryIndex, setCategoryIndex] = useState(0);

  const handleNextCategory = useCallback(() => {
    setCategoryIndex(prev => (prev + 1) % availableCategoryMappings.length);
  }, [availableCategoryMappings.length]);

  const handlePrevCategory = useCallback(() => {
    setCategoryIndex(prev => (prev - 1 + availableCategoryMappings.length) % availableCategoryMappings.length);
  }, [availableCategoryMappings.length]);

  // RENDERIZADO MODO TV
  if (viewMode === 'tv') {
    return (
      <>
        <Header />
        <main className="w-full bg-black h-[calc(100vh-3.3174rem)] flex flex-col items-center justify-center p-6">
           <div className="w-full max-w-5xl aspect-video shadow-2xl shadow-orange-600/20 border border-white/10 rounded-xl overflow-hidden">
              <VideoSection isMobile={false} />
           </div>
           <div className="mt-6 text-white/50 text-sm font-light tracking-[0.3em] uppercase animate-pulse">
              Señal en vivo • Saladillo Vivo TV
           </div>
        </main>
      </>
    );
  }

  // RENDERIZADO MODO DIARIO
  return (
    <>
      <Header />
      <main className="w-full bg-gray-100 dark:bg-neutral-950 pt-4">
        <div className="container mx-auto px-2">
          <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-4 relative">
            <div className="col-span-1 lg:col-span-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-8">
                {articles?.featuredNews && (
                  <div className="sm:col-span-2">
                    <NewsCard newsItem={articles.featuredNews} index={0} isFeatured={true} />
                  </div>
                )}
                {articles?.secondaryNews?.map((n, i) => <NewsCard key={n.id} newsItem={n} index={i} />)}
                {articles?.tertiaryNews?.map((n, i) => <NewsCard key={n.id} newsItem={n} index={i} />)}
                {articles?.otherNews?.map((n, i) => <NewsCard key={n.id} newsItem={n} index={i} />)}
              </div>
            </div>

            <div className="hidden lg:block col-span-5 sticky top-[4rem] h-[calc(100vh-5rem)]">
              <div className="flex flex-col h-full gap-2">
                <VideoSection isMobile={false} />
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                  <CategoryCycler 
                    allVideos={isSearching ? searchResults : allVideos} 
                    activeCategory={availableCategoryMappings[categoryIndex]} 
                    onNext={handleNextCategory}
                    onPrev={handlePrevCategory}
                    isMobile={false} 
                    instanceId="1" 
                  />
                </div>
              </div>
            </div>

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