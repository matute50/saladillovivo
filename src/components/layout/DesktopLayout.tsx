'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';

const AdsSection = dynamic(() => import('./AdsSection'), { ssr: false });
const VideoSection = dynamic(() => import('./VideoSection'), { ssr: false });
const NewsTicker = dynamic(() => import('../NewsTicker'), { ssr: false });

import Header from '@/components/Header'; 
import type { PageData, Video } from '@/lib/types';
import CategoryCycler from './CategoryCycler';
import { categoryMappings, type CategoryMapping } from '@/lib/categoryMappings';
import { useNewsStore } from '@/store/useNewsStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useVolumeStore } from '@/store/useVolumeStore';
import { useNewsPlayerStore } from '@/store/useNewsPlayerStore';
import NoResultsCard from './NoResultsCard';
import NewsCard from '../NewsCard';
import { shuffleArray } from '@/lib/utils';

interface DesktopLayoutProps {
  data: PageData;
}

const DesktopLayout = ({ data }: DesktopLayoutProps) => {
  const {
    articles,
    ads,
    tickerTexts = []
  } = data || {};

  const { isSearching, searchResults, searchLoading, handleSearch } = useNewsStore();

  const { playSpecificVideo, loadInitialPlaylist, viewMode } = usePlayerStore();
  const { isHtmlSlideActive } = useNewsPlayerStore();
  const { volume, setVolume } = useVolumeStore();

  // --- VIDEOS PARA EL CARRUSEL (cargados en el cliente) ---
  const [carouselVideos, setCarouselVideos] = useState<Video[]>([]);

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) return;

    fetch(
      `${supabaseUrl}/rest/v1/videos?select=id,nombre,url,createdAt,categoria,imagen,novedad,forzar_video,volumen_extra&order=createdAt.desc&limit=500`,
      {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
      }
    )
      .then(r => r.ok ? r.json() : [])
      .then((data: any[]) => {
        const videos: Video[] = (data || []).map((v: any) => ({
          ...v,
          id: String(v.id),
          createdAt: v.createdAt ? new Date(v.createdAt).toISOString() : new Date().toISOString(),
        }));
        setCarouselVideos(shuffleArray(videos));
      })
      .catch(() => { });
  }, []);

  // AUTOPLAY: Lanzar playlist al montar el layout (modo diario)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const requestedUrl = urlParams.get('url');
    const requestedId = urlParams.get('v');
    const videoUrl = requestedUrl || requestedId || null;
    loadInitialPlaylist(videoUrl);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchResultClick = (video: any) => {
    playSpecificVideo(video, volume, setVolume);
    setTimeout(() => { handleSearch(''); }, 500);
  };

  // Categorías disponibles (según los videos del carrusel)
  const availableCategoryMappings = useMemo(() => {
    if (carouselVideos.length === 0) return categoryMappings; // Mostrar todas mientras carga
    return categoryMappings.filter(category => {
      // Bloqueo total de NOVEDADES y NOTICIAS
      if (category.dbCategory === '__NOVEDADES__' || category.dbCategory === '__NOTICIAS__') return false;

      const targets = Array.isArray(category.dbCategory)
        ? category.dbCategory.map(c => c.trim().toLowerCase())
        : [category.dbCategory.trim().toLowerCase()];
      const present = new Set(carouselVideos.map(v => (v.categoria || '').trim().toLowerCase()));
      return targets.some(t => Array.from(present).some(pc => pc.includes(t) || t.includes(pc)));
    });
  }, [carouselVideos]);

  const [categoryIndex, setCategoryIndex] = useState(0);
  const [shuffleNonce, setShuffleNonce] = useState(0); 
  const [hasInitializedPosition, setHasInitializedPosition] = useState(false);

  // Mezclar videos cada vez que cambia la categoría o el nonce
  const currentCategoryVideos = useMemo(() => {
    if (carouselVideos.length === 0) return [];
    return shuffleArray([...carouselVideos]);
  }, [carouselVideos, categoryIndex, shuffleNonce]);

  useEffect(() => {
    if (!hasInitializedPosition && availableCategoryMappings.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableCategoryMappings.length);
      setCategoryIndex(randomIndex);
      setHasInitializedPosition(true);
    }
  }, [availableCategoryMappings, hasInitializedPosition]);

  const handleNextCategory = useCallback(() => {
    const total = availableCategoryMappings.length;
    setCategoryIndex(prevIndex => (prevIndex + 1) % total);
    setShuffleNonce(n => n + 1);
  }, [availableCategoryMappings.length]);

  const handlePrevCategory = useCallback(() => {
    const total = availableCategoryMappings.length;
    setCategoryIndex(prevIndex => (prevIndex - 1 + total) % total);
    setShuffleNonce(n => n + 1);
  }, [availableCategoryMappings.length]);

  const searchCategoryMapping: CategoryMapping = {
    display: 'Tu Búsqueda',
    dbCategory: 'search',
  };

  // RENDERIZADO MODO TV
  if (viewMode === 'tv') {
    return (
      <>
        <Header />
        <main className="w-full bg-black h-[calc(100vh-4.5rem)] flex flex-col items-center justify-center p-6">
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

  // RENDERIZADO MODO DIARIO (Default)
  return (
    <div className="min-h-screen bg-white dark:bg-black text-slate-800 dark:text-neutral-200 font-sans transition-colors duration-300">
      <Header />
      
      {/* Carrusel de noticias principales */}
      <div className="relative z-10">
        <AdsSection ads={ads} />
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Columna Izquierda: Noticias Destacadas y Grillas */}
          <div className="lg:col-span-3 space-y-12">
            
            {/* Visualización de Búsqueda */}
            {isSearching && (
              <section className="space-y-6">
                <CategoryCycler 
                  category={searchCategoryMapping}
                  onNext={() => {}} 
                  onPrev={() => {}}
                  hideArrows={true}
                />
                
                {searchLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[1,2,3].map(n => (
                      <div key={n} className="aspect-video bg-neutral-200 dark:bg-neutral-800 animate-pulse rounded-lg" />
                    ))}
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {searchResults.map((article) => (
                      <NewsCard 
                        key={article.id} 
                        article={article} 
                        onClick={() => handleSearchResultClick(article)}
                      />
                    ))}
                  </div>
                ) : (
                  <NoResultsCard />
                )}
              </section>
            )}

            {/* Categorías Ciclicas */}
            {!isSearching && availableCategoryMappings.length > 0 && (
              <section className="space-y-6">
                <CategoryCycler 
                  category={availableCategoryMappings[categoryIndex]}
                  onNext={handleNextCategory}
                  onPrev={handlePrevCategory}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {currentCategoryVideos.slice(0, 6).map((video) => (
                    <NewsCard 
                      key={video.id} 
                      article={video}
                      onClick={() => playSpecificVideo(video, volume, setVolume)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Renderizar resto de artículos por fechas o relevancia si es necesario */}
            {/* ... */}
          </div>

          {/* Columna Derecha: Video Player Sticky y Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className={`relative transition-all duration-500 overflow-hidden shadow-2xl rounded-2xl border border-neutral-200 dark:border-neutral-800 ${isHtmlSlideActive ? 'aspect-square' : 'aspect-video'}`}>
                <VideoSection isMobile={false} />
              </div>
              
              {/* Sidebar Content (Próximamente: Ranking, Clima, etc.) */}
              <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl p-6 border border-neutral-100 dark:border-neutral-800">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full animate-ping" />
                  AHORA EN VIVO
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Transmisión continua de noticias y programación especial.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <NewsTicker tickerTexts={tickerTexts} />
    </div>
  );
};

export default DesktopLayout;