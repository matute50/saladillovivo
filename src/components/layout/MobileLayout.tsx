'use client';

import { useState, useCallback, useEffect } from 'react';
import { useNews } from '@/context/NewsContext';
import type { PageData } from '@/lib/types';
import { categoryMappings, type CategoryMapping } from '@/lib/categoryMappings';

import NewsTicker from '../NewsTicker';
import VideoSection from './VideoSection';
import NewsCard from '../NewsCard';
import CategoryCycler from './CategoryCycler';
import NoResultsCard from './NoResultsCard';
import BannerSection from './BannerSection';
import AdsSection from './AdsSection';

const MobileLayout = ({ data, isMobile }: { data: PageData; isMobile: boolean }) => {
  const { articles, videos, banners, ads, tickerTexts } = data;
  const { isSearching, searchResults, searchLoading, handleSearch } = useNews();
  const { allVideos } = videos;

  // Importar y filtrar las categorías en lugar de tenerlas hardcodeadas
  const availableCategoryMappings = categoryMappings.filter(category => {
    // Lógica especial para la categoría "Novedades"
    if (category.dbCategory === '__NOVEDADES__') {
      return allVideos.some(video => video.novedad === true);
    }

    const dbCategories = Array.isArray(category.dbCategory) ? category.dbCategory : [category.dbCategory];
    return allVideos.some(video => dbCategories.includes(video.categoria));
  });

  const [cyclerIndex1, setCyclerIndex1] = useState(0);
  const [cyclerIndex2, setCyclerIndex2] = useState(1);

  useEffect(() => {
    if (availableCategoryMappings.length > 1) {
      const total = availableCategoryMappings.length;
      const randomIndex1 = Math.floor(Math.random() * total);
      const randomIndex2 = (randomIndex1 + 1 + Math.floor(Math.random() * (total - 1))) % total; // Asegura que no sea el mismo
      setCyclerIndex1(randomIndex1);
      setCyclerIndex2(randomIndex2);
    }
  }, [availableCategoryMappings.length]);

  const handleCycle = useCallback((direction: 'next' | 'prev', currentIndex: number, otherIndex: number, setIndex: React.Dispatch<React.SetStateAction<number>>) => {
    const total = availableCategoryMappings.length;
    if (total < 2) return; // No ciclar si no hay suficientes categorías

    let nextIndex = direction === 'next' 
      ? (currentIndex + 1) % total
      : (currentIndex - 1 + total) % total;
    
    // Si el siguiente índice es igual al del otro carrusel, saltar uno más
    if (nextIndex === otherIndex) {
      nextIndex = direction === 'next'
        ? (nextIndex + 1) % total
        : (nextIndex - 1 + total) % total;
    }
    setIndex(nextIndex);
  }, [availableCategoryMappings.length]);

  const handleNext1 = useCallback(() => handleCycle('next', cyclerIndex1, cyclerIndex2, setCyclerIndex1), [cyclerIndex1, cyclerIndex2, handleCycle]);
  const handlePrev1 = useCallback(() => handleCycle('prev', cyclerIndex1, cyclerIndex2, setCyclerIndex1), [cyclerIndex1, cyclerIndex2, handleCycle]);
  const handleNext2 = useCallback(() => handleCycle('next', cyclerIndex2, cyclerIndex1, setCyclerIndex2), [cyclerIndex1, cyclerIndex2, handleCycle]);
  const handlePrev2 = useCallback(() => handleCycle('prev', cyclerIndex2, cyclerIndex1, setCyclerIndex2), [cyclerIndex1, cyclerIndex2, handleCycle]);

  const searchCategoryMapping: CategoryMapping = {
    display: "Tu Búsqueda", // Corregido de displayName a display
    dbCategory: "search",
  };

  return (
    <>
      <div className="bg-background/80 backdrop-blur-sm fixed top-[calc(var(--header-height)-18px)] w-full z-40">
        <NewsTicker tickerTexts={tickerTexts} isMobile={isMobile} />
      </div>
      
      <div className="fixed top-[calc(var(--header-height)+var(--ticker-height)-18px)] left-0 w-full z-30">
         <VideoSection isMobileFixed={false} isMobile={isMobile} />
      </div>
      
      <main className="w-full pt-[calc(var(--header-height)+var(--ticker-height)+var(--player-height-mobile)-18px)]">
        <div className="flex flex-col gap-8 p-2">

          <section aria-labelledby="news-section-title">
            <h2 id="news-section-title" className="text-2xl font-bold tracking-tight text-foreground/90 mb-4">Noticias</h2>
            <div className="flex flex-col gap-4">
              {articles.featuredNews && (
                <NewsCard newsItem={articles.featuredNews} isFeatured={true} />
              )}
              {articles.secondaryNews.map((noticia) => (
                <NewsCard key={noticia.id} newsItem={noticia} />
              ))}
              {articles.tertiaryNews.map((noticia) => (
                <NewsCard key={noticia.id} newsItem={noticia} />
              ))}
              {articles.otherNews.map((noticia) => (
                <NewsCard key={noticia.id} newsItem={noticia} />
              ))}
            </div>
          </section>

          <section aria-labelledby="video-section-title">
            <h2 id="video-section-title" className="text-2xl font-bold tracking-tight text-foreground/90">Saladillo VIVO TV</h2>
            
            {isSearching ? (
              searchLoading ? (
                <div className="text-center p-4">Buscando...</div>
              ) : searchResults.length > 0 ? (
                <CategoryCycler 
                  allVideos={searchResults} 
                  activeCategory={searchCategoryMapping}
                  isSearchResult={true}
                  isMobile={true} 
                  instanceId="search"
                />
              ) : (
                                    <NoResultsCard message="No se encontraron videos para tu búsqueda." onClearSearch={() => handleSearch('')} />              )
            ) : (
              availableCategoryMappings.length > 0 && (
                <>
                  <CategoryCycler 
                    allVideos={allVideos} 
                    activeCategory={availableCategoryMappings[cyclerIndex1]} 
                    onNext={handleNext1}
                    onPrev={handlePrev1}
                    isMobile={true} 
                    instanceId="1"
                  />
                  {availableCategoryMappings.length > 1 && (
                    <CategoryCycler 
                      allVideos={allVideos} 
                      activeCategory={availableCategoryMappings[cyclerIndex2]} 
                      onNext={handleNext2}
                      onPrev={handlePrev2}
                      isMobile={true} 
                      instanceId="2"
                    />
                  )}
                </>
              )
            )}
          </section>

          <section className="my-4" aria-label="Banners publicitarios">
             <BannerSection activeBanners={banners} isLoadingBanners={false} className="w-full" />
          </section>

          <section aria-label="Anuncios">
            <AdsSection activeAds={ads} isLoading={false} />
          </section>
        </div>
      </main>
    </>
  );
};

export default MobileLayout;