'use client';

import React, { useState, useMemo, useCallback } from 'react';
import MobileNewsGrid from './MobileNewsGrid';
import BannerSection from './BannerSection';
import AdsSection from './AdsSection';
import VideoSection from './VideoSection';
import DemandCarouselBlock from './DemandCarouselBlock';
import LiveCarouselBlock from './LiveCarouselBlock';
import NewsAndMostWatchedCarousel from './NewsAndMostWatchedCarousel';
import NewsTicker from '../NewsTicker';
import NoResultsCard from './NoResultsCard';
import { useToast } from '@/components/ui/use-toast';
import { Search } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const MobileLayout = ({ data, openModal, isMobile }) => {
  const { articles, banners, ads, videos } = data;
  const { allNews } = articles;

  const allNewsForMobile = allNews; // The list is already sorted by priority

  // Simplified category logic for mobile
  const categoryMap = {
    "Últimas Noticias": videos.filter(v => v.categoria === 'Noticias'),
    "Sembrando Futuro": videos.filter(v => v.categoria === 'SEMBRANDO FUTURO'),
    "Hacelo Corto": videos.filter(v => v.categoria === 'cortos'),
    "Lo que Fuimos": videos.filter(v => v.categoria === 'historia'),
    "Saladillo Canta": videos.filter(v => v.categoria === 'clips'),
  };

  const selectableCategories = Object.keys(categoryMap);
  const [categoryIndex, setCategoryIndex] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const { toast } = useToast();

  const removeAccents = (str) => {
    return str.normalize("NFD").replace(/\p{M}/gu, "");
  };

  const stopWords = useMemo(() => new Set([
    'el', 'la', 'los', 'las', 'a', 'de', 'en', 'con', 'por', 'para', 'un', 'una', 'y', 'o'
  ]), []);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    setIsSearching(true);
    
    const normalizedQuery = removeAccents(searchQuery.toLowerCase()).replace(/[.,/#!$%^&*;:{}=\-_`~()]/g," ").replace(/\s{2,}/g," ");
    const searchTerms = normalizedQuery.split(' ').filter(term => !stopWords.has(term) && term.length > 2);
    if (searchTerms.length === 0) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const query = searchTerms.map(term => `\'${term}\'`).join(' | ');

    try {
      const { data, error } = await supabase
        .from('videos')
        .select('id, nombre, url, categoria, imagen, createdAt')
        .textSearch('nombre', query, { type: 'websearch', config: 'spanish' });

      if (error) throw error;
      
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching videos:', error);
      toast({
        title: "Error de Búsqueda",
        description: "No se pudieron obtener los resultados.",
        variant: "destructive",
      });
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, stopWords, toast]);

  const handleCategoryChange = (direction) => {
    setCategoryIndex(prevIndex => (prevIndex + direction + selectableCategories.length) % selectableCategories.length);
  };

  const selectedCategoryTitle = selectableCategories[categoryIndex];
  const selectedCategoryVideos = categoryMap[selectedCategoryTitle];

  return (
    <>
      <VideoSection isMobileFixed={true} isMobile={isMobile} />
      <main className="w-full pt-[calc(var(--player-height-mobile)+var(--header-height))]">
        <NewsTicker tickerTexts={data.tickerTexts} isMobile={isMobile} />
        <section className="px-2 py-2">
          <div className="relative w-full">
            <label htmlFor="search-input-mobile" className="sr-only">Buscar persona o evento</label>
            <input
              id="search-input-mobile"
              type="text"
              placeholder="Buscar persona o evento"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="search-box w-full rounded-full py-1 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-['Century_Gothic'] font-light"
            />
            <button onClick={handleSearch} aria-label="Iniciar búsqueda" className="absolute left-0 top-0 bottom-0 px-3 flex items-center justify-center">
              <Search 
                className="search-box-icon" 
                size={16}
              />
            </button>
          </div>
        </section>
        <div className="flex flex-col gap-2">
          {(searchQuery.trim() !== '' && searchResults) ? (
            searchResults.length > 0 ? (
              <section className="flex flex-col items-center pt-2" aria-label="Resultados de búsqueda">
                <DemandCarouselBlock
                  key="search-results-carousel-mobile"
                  title="Resultados de Búsqueda"
                  videos={searchResults}
                  isLoading={isSearching}
                  isMobile={isMobile}
                  carouselId="search-results-mobile"
                />
              </section>
            ) : (
              <NoResultsCard onClearSearch={() => { setSearchQuery(''); setSearchResults(null); }} />
            )
          ) : (
            <>
              <section className="flex flex-col items-center pt-2" aria-label="Carrusel de categorías on demand">
                <DemandCarouselBlock 
                  title={selectedCategoryTitle}
                  videos={selectedCategoryVideos}
                  isLoading={false}
                  onCategoryChange={handleCategoryChange}
                  isMobile={true}
                  carouselId={`demand-mobile`}
                />
              </section>

              <section className="flex flex-col items-center pt-2" aria-label="Carrusel de eventos en vivo">
                <LiveCarouselBlock upcomingEvents={data.events} isMobile={isMobile} />
              </section>

              <section className="flex flex-col items-center pt-2" aria-label="Carrusel de novedades">
                <NewsAndMostWatchedCarousel content={data.videos.filter(v => v.novedad)} isLoading={false} isMobile={isMobile} />
              </section>

              <section aria-label="Banner publicitario principal" className="px-2">
                <BannerSection
                  activeBanners={banners}
                  isLoadingBanners={false}
                  className="w-full"
                  isMobile={isMobile}
                />
              </section>

              <section aria-label="Grilla de noticias" className="px-2">
                <MobileNewsGrid
                  newsItems={allNewsForMobile}
                />
              </section>

              <aside aria-label="Anuncios secundarios" className="px-2">
                <AdsSection
                  activeAds={ads}
                  adsLoading={false}
                  isMobile={isMobile}
                />
              </aside>
            </>
          )}
        </div>
      </main>
    </>
  );
};

export default MobileLayout;
