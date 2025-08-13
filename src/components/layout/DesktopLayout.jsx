import React, { useState, useMemo, useCallback } from 'react';
import BannerSection from '@/components/layout/BannerSection';
import AdsSection from '@/components/layout/AdsSection';
import NewsTicker from '@/components/NewsTicker';
import VideoSection from '@/components/layout/VideoSection';
import DemandCarouselBlock from '@/components/layout/DemandCarouselBlock';
import LiveCarouselBlock from '@/components/layout/LiveCarouselBlock';
import { useNews } from '@/context/NewsContext';
import { useToast } from '@/components/ui/use-toast';
import { Search } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import NewsCarousel from '@/components/layout/NewsCarousel';
import NovedadesCarousel from '@/components/layout/NewsAndMostWatchedCarousel';
import FeaturedNewsSection from '@/components/layout/FeaturedNewsSection';
import SecondaryNewsCard from '@/components/layout/SecondaryNewsCard';
import NoResultsCard from '@/components/layout/NoResultsCard';

const DesktopLayout = ({
  newsContext: newsContextFromProps,
  openModal,
  isMobile
}) => {
  const contextFromHook = useNews();
  const newsContext = newsContextFromProps || contextFromHook;
  const { toast } = useToast();
  const {
    mainFeaturedNews,
    secondaryFeaturedNews1,
    secondaryFeaturedNews2,
    otherNews,
    activeBanners,
    isLoadingBanners,
    isDarkTheme
  } = newsContext;

  const botonDemandUrl = isDarkTheme ? "https://storage.googleapis.com/hostinger-horizons-assets-prod/77d159f1-0d45-4b01-ba42-c8ca9cbd0d70/d15d0b7297225b2c4a0e3c25e783b323.png" : "https://storage.googleapis.com/hostinger-horizons-assets-prod/77d159f1-0d45-4b01-ba42-c8ca9cbd0d70/b68fbe08969c6ffcf64885ca1cf1d93c.png";
  
  const newsForGrid = useMemo(() => {
    const news = [];
    if (secondaryFeaturedNews1) news.push(secondaryFeaturedNews1);
    if (secondaryFeaturedNews2) news.push(secondaryFeaturedNews2);
    return [...news, ...otherNews];
  }, [secondaryFeaturedNews1, secondaryFeaturedNews2, otherNews]);

  const categoryMap = useMemo(() => ({
    "Sembrando Futuro": "SEMBRANDO FUTURO",
    "Hacelo Corto": "cortos",
    "Lo que Fuimos": "historia",
    "Saladillo Canta": "clips",
    "HCD de Saladillo": "HCD DE SALADILLO  - Período 2025",
    "ITEC ¨Augusto Cicaré¨": "ITEC ¨AUGUSTO CICARE¨ SALADILLO",
    "Fierros de Saladillo": "FIERROS",
    "Gente de Acá": "export"
  }), []);

  const selectableCategories = useMemo(() => Object.keys(categoryMap), [categoryMap]);
  
  const findIndex = (catName) => selectableCategories.findIndex(c => c === catName);

  const [categoryIndices, setCategoryIndices] = useState([
    findIndex("Sembrando Futuro"),
    findIndex("Saladillo Canta"),
    findIndex("Hacelo Corto"),
    findIndex("Lo que Fuimos")
  ]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const removeAccents = (str) => {
    return str.normalize("NFD").replace(/\p{M}/gu, "");
  };

  const stopWords = useMemo(() => new Set([
    'el', 'la', 'los', 'las', 'a', 'de', 'en', 'con', 'por', 'para', 'sobre', 'ante', 'bajo', 'cabe', 'contra', 'desde', 'durante', 'mediante', 'entre', 'hacia', 'hasta', 'según', 'sin', 'tras', 'y', 'e', 'ni', 'o', 'u', 'pero', 'mas', 'sino', 'aunque', 'como', 'cuando', 'donde', 'que', 'quien', 'cual', 'cuanto', 'si', 'me', 'te', 'se', 'nos', 'os', 'lo', 'le', 'les', 'mi', 'ti', 'si', 'conmigo', 'contigo', 'consigo', 'nuestro', 'nuestra', 'nuestros', 'nuestras', 'vuestro', 'vuestra', 'vuestros', 'vuestras', 'un', 'una', 'unos', 'unas', 'ya', 'tambien', 'aun', 'solo', 'solo', 'todavia', 'etc'
  ]), []);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    setIsSearching(true);
    
    const normalizedQuery = removeAccents(searchQuery.toLowerCase()).replace(/[.,/#!$%^&*;:{}=\-_`~()]/g," ").replace(/\s{2,}/g," ");
    const searchTerms = normalizedQuery.split(' ').filter(term => !stopWords.has(term) && term.length > 0);
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
  
  const mainColumnClasses = "card card-blur flex flex-col";

  return <>
      <header className="sticky top-[var(--desktop-header-height)] z-40 bg-background/80 backdrop-blur-sm mb-0 md:mb-3">
        <NewsTicker isMobile={false} />
      </header>
      <main className="w-full px-2 py-0 md:py-4 overflow-x-hidden">
        <div className="container mx-auto px-2">
          <div className="flex flex-col lg:flex-row gap-8 items-stretch mb-8">
            <aside className="lg:w-1/2 flex flex-col w-full">
              <div className="sticky top-[calc(var(--desktop-header-height)+var(--ticker-height)+1rem)] z-30 flex flex-col gap-2 h-full">
                <VideoSection isMobile={isMobile} />
                <div className={`flex-grow flex flex-col items-center justify-around mt-4 ${mainColumnClasses} p-4`}>
                    <LiveCarouselBlock isMobile={isMobile} />
                    <NovedadesCarousel isMobile={isMobile} />
                </div>
              </div>
            </aside>
            
            <section className={`lg:w-1/2 w-full ${mainColumnClasses}`} aria-labelledby="on-demand-title">
              <h2 id="on-demand-title" className="sr-only">Contenido On Demand y Búsqueda</h2>
              <div className="flex justify-between items-center mb-1">
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
                 <button className="focus:outline-none flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity" aria-label="Videos On Demand" onClick={() => {
                toast({
                  title: "🚧 Característica no implementada",
                  description: "¡Esta función aún no está implementada, pero puedes solicitarla en tu próximo mensaje! 🚀"
                });
              }}>
                    <img loading="lazy" src={botonDemandUrl} alt="Botón para ver Videos On Demand" className="h-12 object-contain" />
                  </button>
              </div>
              <div className="flex flex-col gap-2 flex-grow justify-between p-4">
                {(searchQuery.trim() !== '' && searchResults !== null && searchResults.length > 0) ? (
                  <DemandCarouselBlock
                    key="search-results-carousel"
                    blockNumber={0}
                    isSelectable={false}
                    isSearchBlock={true}
                    searchResults={searchResults}
                    isSearching={isSearching}
                    isMobile={isMobile}
                  />
                ) : (searchQuery.trim() !== '' && searchResults !== null && searchResults.length === 0 && !isSearching) ? (
                  <NoResultsCard onClearSearch={() => { setSearchQuery(''); setSearchResults(null); }} />
                ) : (
                  <NewsCarousel isMobile={isMobile} />
                )}

                {[...Array(3)].map((_, index) => {
                  const categoryIndexForBlock = index + 1;

                  return (
                    <DemandCarouselBlock
                      key={categoryIndexForBlock}
                      blockNumber={categoryIndexForBlock + 1}
                      isSelectable={true}
                      selectableCategories={selectableCategories}
                      categoryMap={categoryMap}
                      categoryIndex={categoryIndices[categoryIndexForBlock]}
                      onCategoryChange={(direction) => handleCategoryChange(categoryIndexForBlock, direction)}
                      isSearchBlock={false}
                      searchResults={null}
                      isSearching={false}
                      isMobile={isMobile}
                    />
                  );
                })}
              </div>
            </section>
          </div>
          
          <section className="my-6 -mx-2 md:mx-0" aria-label="Banners publicitarios">
             <BannerSection activeBanners={activeBanners} isLoadingBanners={isLoadingBanners} className="w-full" />
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-5 gap-6" aria-label="Sección de noticias">
              <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-fr gap-4">
                  {mainFeaturedNews && <div className="lg:col-span-2 lg:row-span-2 h-full">
                      <FeaturedNewsSection mainFeaturedNews={mainFeaturedNews} openModal={openModal} />
                    </div>}
                  
                  {newsForGrid.slice(0, 2).map(noticia => <div key={noticia.id} className="lg:col-span-1 h-full">
                        <SecondaryNewsCard newsItem={noticia} openModal={openModal} />
                      </div>)}

                  {newsForGrid.slice(2).map((noticia, index) => <div key={noticia.id} className="lg:col-span-1 h-full">
                      <SecondaryNewsCard newsItem={noticia} openModal={openModal} index={index} />
                    </div>)}
              </div>

              <aside className="lg:col-span-1 hidden lg:block" aria-label="Anuncios adicionales">
                  <div className="sticky top-[calc(var(--desktop-header-height)+var(--ticker-height)+1rem)] card card-blur p-2">
                      <AdsSection isMobile={false} />
                  </div>
              </aside>
          </section>

        </div>
      </main>
    </>;
};
export default DesktopLayout;
