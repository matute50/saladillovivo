'use client';

import { useNews } from '@/context/NewsContext';
import NoResultsCard from './NoResultsCard';

const MobileLayout = ({ data, isMobile }: { data: PageData; isMobile: boolean }) => {

  const {
    articles,
    videos,
    banners,
    ads,
    tickerTexts,
  } = data;

  // --- ESTADO DE BÚSQUEDA DEL CONTEXTO ---
  const { isSearching, searchResults, searchLoading } = useNews();

  const { featuredNews, secondaryNews } = articles;
  const { allVideos, videoCategories } = videos;

  const categoryMappings: CategoryMapping[] = [
    { display: 'HCD de Saladillo', dbCategory: 'HCD DE SALADILLO - Período 2025' },
    { display: 'ITEC ¨Augusto Cicaré¨', dbCategory: 'ITEC ¨AUGUSTO CICARE¨ SALADILLO' },
    { display: 'Fierros de Saladillo', dbCategory: 'FIERROS' },
    { display: 'Gente de Acá', dbCategory: 'export' },
    { display: 'Sembrando Futuro', dbCategory: 'SEMBRANDO FUTURO' },
    { display: 'Lo que Fuimos', dbCategory: ['ARCHIVO SALADILLO VIVO', 'historia'] },
    { display: 'Últimas Noticias', dbCategory: 'Noticias' },
    { display: 'Saladillo Canta', dbCategory: 'clips' },
  ];

  const [index1, setIndex1] = useState(0);
  const [index2, setIndex2] = useState(1);

  const handleCycle = (direction: 'next' | 'prev', currentIndex: number, otherIndex: number, setIndex: React.Dispatch<React.SetStateAction<number>>) => {
    const total = categoryMappings.length;
    let nextIndex = direction === 'next' 
      ? (currentIndex + 1) % total
      : (currentIndex - 1 + total) % total;
    
    if (nextIndex === otherIndex) {
      nextIndex = direction === 'next'
        ? (nextIndex + 1) % total
        : (nextIndex - 1 + total) % total;
    }
    setIndex(nextIndex);
  };

  const handleNext1 = useCallback(() => handleCycle('next', index1, index2, setIndex1), [index1, index2]);
  const handlePrev1 = useCallback(() => handleCycle('prev', index1, index2, setIndex1), [index1, index2]);
  const handleNext2 = useCallback(() => handleCycle('next', index2, index1, setIndex2), [index1, index2]);
  const handlePrev2 = useCallback(() => handleCycle('prev', index2, index1, setIndex2), [index1, index2]);

  const searchCategoryMapping: CategoryMapping = {
    displayName: "Tu Búsqueda",
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
              {featuredNews && (
                <NewsCard newsItem={featuredNews} variant="destacada-principal" />
              )}
              {secondaryNews.map((noticia) => (
                <NewsCard key={noticia.id} newsItem={noticia} variant="default" />
              ))}
            </div>
          </section>

          <section aria-labelledby="video-section-title">
            <h2 id="video-section-title" className="text-2xl font-bold tracking-tight text-foreground/90">Saladillo VIVO TV</h2>
            
            {/* --- LÓGICA CONDICIONAL PARA BÚSQUEDA O CATEGORÍAS -- */}
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
                <NoResultsCard message="No se encontraron videos para tu búsqueda." />
              )
            ) : (
              <>
                <CategoryCycler 
                  allVideos={allVideos} 
                  activeCategory={categoryMappings[index1]} 
                  onNext={handleNext1}
                  onPrev={handlePrev1}
                  isMobile={true} 
                  instanceId="1"
                />
                <CategoryCycler 
                  allVideos={allVideos} 
                  activeCategory={categoryMappings[index2]} 
                  onNext={handleNext2}
                  onPrev={handlePrev2}
                  isMobile={true} 
                  instanceId="2"
                />
              </>
            )}
          </section>

          <section className="my-4" aria-label="Banners publicitarios">
             <BannerSection activeBanners={banners} isLoadingBanners={false} className="w-full" />
          </section>

          <section aria-label="Anuncios">
            <AdsSection ads={ads} />
          </section>
        </div>
      </main>
    </>
  );
};

export default MobileLayout;
