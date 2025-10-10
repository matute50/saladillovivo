'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import BannerSection from './BannerSection';
import AdsSection from './AdsSection';
import NewsTicker from '../NewsTicker';
import VideoSection from './VideoSection';
import DemandCarouselBlock from './DemandCarouselBlock';
import LiveCarouselBlock from './LiveCarouselBlock';
import NewsCarousel from './NewsCarousel';
import NewsAndMostWatchedCarousel from './NewsAndMostWatchedCarousel';
import FeaturedNewsSection from './FeaturedNewsSection';
import SecondaryNewsCard from './SecondaryNewsCard';
import NoResultsCard from './NoResultsCard';
import { useToast } from '@/components/ui/use-toast';
import { Search } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const DesktopLayout = ({ data, openModal, isMobile }) => {
  const { toast } = useToast();
  const {
    articles,
    banners,
    ads,
    tickerTexts,
    videos,
    interviews
  } = data;

  // Directly use the new data structure
  const { destacada, noticias2, noticias3, otrasNoticias } = articles;
  const otherNews = [...noticias2, ...noticias3, ...otrasNoticias];

  const [isDarkTheme, setIsDarkTheme] = useState(true);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkTheme(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    // Set initial state
    setIsDarkTheme(document.documentElement.classList.contains('dark'));
    return () => observer.disconnect();
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const categoryMap = useMemo(() => ({
    "Sembrando Futuro": videos.filter(v => v.categoria === 'SEMBRANDO FUTURO'),
    "Hacelo Corto": videos.filter(v => v.categoria === 'cortos'),
    "Lo que Fuimos": videos.filter(v => v.categoria === 'historia'),
    "Saladillo Canta": videos.filter(v => v.categoria === 'clips'),
    "HCD de Saladillo": videos.filter(v => v.categoria === 'HCD DE SALADILLO  - Período 2025'),
    "ITEC ¨Augusto Cicaré¨": videos.filter(v => v.categoria === 'ITEC ¨AUGUSTO CICARE¨ SALADILLO'),
    "Fierros de Saladillo": videos.filter(v => v.categoria === 'FIERROS'),
    "Gente de Acá": videos.filter(v => v.categoria === 'export')
  }), [videos]);

  const selectableCategories = useMemo(() => Object.keys(categoryMap), [categoryMap]);
  
  const findIndex = (catName) => selectableCategories.findIndex(c => c === catName);

  const [categoryIndices, setCategoryIndices] = useState([
    findIndex("Sembrando Futuro"),
    findIndex("Saladillo Canta"),
    findIndex("Hacelo Corto"),
  ]);

  const handleCategoryChange = (blockIndex, direction) => {
    setCategoryIndices(prevIndices => {
      const newIndices = [...prevIndices];
      const numCategories = selectableCategories.length;
      let newCategoryIndex = (newIndices[blockIndex] + direction + numCategories) % numCategories;

      while (newIndices.filter((ci, i) => i !== blockIndex).includes(newCategoryIndex)) {
        newCategoryIndex = (newCategoryIndex + direction + numCategories) % numCategories;
      }
      
      newIndices[blockIndex] = newCategoryIndex;
      return newIndices;
    });
  };

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

    const query = searchTerms.map(term => `'${term}'`).join(' | ');

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

  const botonDemandUrl_dark = "https://storage.googleapis.com/hostinger-horizons-assets-prod/77d159f1-0d45-4b01-ba42-c8ca9cbd0d70/d15d0b7297225b2c4a0e3c25e783b323.png";
  const botonDemandUrl_light = "https://storage.googleapis.com/hostinger-horizons-assets-prod/77d159f1-0d45-4b01-ba42-c8ca9cbd0d70/b68fbe08969c6ffcf64885ca1cf1d93c.png";

  const mainColumnClasses = "card card-blur flex flex-col";

  return (
    <>
      <div className="bg-background/80 backdrop-blur-sm mb-0 md:mb-3">
        <NewsTicker tickerTexts={tickerTexts} isMobile={false} />
      </div>
      <main className="w-full px-2 py-0 md:pb-4 overflow-x-hidden">
        <div className="container mx-auto px-2">
          <div className="flex flex-col lg:flex-row gap-8 items-stretch mb-8">
            <aside className="lg:w-1/2 flex flex-col w-full">
              <div className="sticky top-[calc(var(--desktop-header-height)+var(--ticker-height)+1rem)] z-30 flex flex-col gap-2 h-full">
                <VideoSection isMobile={isMobile} />
                <div className={`flex-grow flex flex-col items-center justify-around mt-4 ${mainColumnClasses} p-4`}>
                    <LiveCarouselBlock upcomingEvents={data.events} isMobile={isMobile} />
                    <NewsAndMostWatchedCarousel content={data.videos.filter(v => v.novedad)} isLoading={false} isMobile={isMobile} />
                </div>
              </div>
            </aside>
            
            <section className={`lg:w-1/2 w-full ${mainColumnClasses}`} aria-labelledby="on-demand-title">
              <h2 id="on-demand-title" className="sr-only">Contenido On Demand y Búsqueda</h2>
              <div className="flex justify-between items-center mb-1 p-4 pb-0">
                <div className="relative w-2/5">
                  <label htmlFor="search-input" className="sr-only">Buscar persona o evento</label>
                  <input
                    id="search-input"
                    type="text"
                    placeholder="Buscar persona o evento"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="search-box w-full rounded-full py-0.5 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-['Century_Gothic'] font-light"
                    style={{ lineHeight: 'normal', height: '1.8rem' }}
                  />
                  <button onClick={handleSearch} aria-label="Iniciar búsqueda" className="absolute left-0 top-0 bottom-0 px-2.5 flex items-center justify-center">
                    <Search 
                      className="search-box-icon" 
                      size={14}
                    />
                  </button>
                </div>
                 <button className="focus:outline-none flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity" aria-label="Videos On Demand">
                    <img loading="lazy" src={isDarkTheme ? botonDemandUrl_dark : botonDemandUrl_light} alt="Botón para ver Videos On Demand" className="h-9 object-contain" />
                  </button>
              </div>
              <div className="flex flex-col gap-2 flex-grow justify-between p-4">
                {(searchQuery.trim() !== '' && searchResults) ? (
                  searchResults.length > 0 ? (
                    <DemandCarouselBlock
                      key="search-results-carousel"
                      title="Resultados de Búsqueda"
                      videos={searchResults}
                      isLoading={isSearching}
                      isMobile={isMobile}
                      carouselId="search-results"
                    />
                  ) : (
                    <NoResultsCard onClearSearch={() => { setSearchQuery(''); setSearchResults(null); }} />
                  )
                ) : (
                  <>
                    <NewsCarousel news={videos.filter(v => v.categoria === 'Noticias')} isLoading={false} isMobile={isMobile} />
                    {[...Array(3)].map((_, index) => {
                      const categoryTitle = selectableCategories[categoryIndices[index]];
                      const categoryVideos = categoryMap[categoryTitle] || [];
                      return (
                        <DemandCarouselBlock
                          key={index}
                          title={categoryTitle}
                          videos={categoryVideos}
                          isLoading={false}
                          isMobile={isMobile}
                          carouselId={`demand-${index}`}
                          onCategoryChange={(direction) => handleCategoryChange(index, direction)}
                        />
                      );
                    })}
                  </>
                )}
              </div>
            </section>
          </div>
          
          <section className="my-6 -mx-2 md:mx-0" aria-label="Banners publicitarios">
             <BannerSection activeBanners={banners} isLoadingBanners={false} className="w-full" />
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-5 gap-6" aria-label="Sección de noticias">
              <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-fr gap-4">
                  {destacada && <div className="lg:col-span-2 lg:row-span-2">
                      <FeaturedNewsSection mainFeaturedNews={destacada} />
                    </div>}
                  
                  {otherNews.slice(0, 2).map(noticia => <div key={noticia.id} className="lg:col-span-1 h-full">
                        <SecondaryNewsCard newsItem={noticia} />
                      </div>)}

                  {otherNews.slice(2).map((noticia, index) => <div key={noticia.id} className="lg:col-span-1 h-full">
                      <SecondaryNewsCard newsItem={noticia} index={index} />
                    </div>)}
              </div>

              <aside className="lg:col-span-1 hidden lg:block" aria-label="Anuncios adicionales">
                  <div className="sticky top-[calc(var(--desktop-header-height)+var(--ticker-height)+1rem)] card card-blur p-2">
                      <AdsSection activeAds={ads} adsLoading={false} isMobile={false} />
                  </div>
              </aside>
          </section>

        </div>
      </main>
    </>
  );
};
export default DesktopLayout;
