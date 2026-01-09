'use client';

import React, { useEffect, useState } from 'react';
import DesktopLayout from './layout/DesktopLayout';
import MobileLayout from './layout/MobileLayout';
import TvModeLayout from './layout/TvModeLayout';
// Rutas directas a components/
import Header from './Header'; 
import Footer from './Footer'; 

import type { PageData } from '@/lib/types';
import { useMediaPlayer } from '@/context/MediaPlayerContext';
import useIsMobile from '@/hooks/useIsMobile';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen w-screen bg-black">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

const HomePageClient = ({ initialData }: { initialData: PageData }) => {
  const isMobile = useIsMobile();
  const { loadInitialPlaylist, viewMode } = useMediaPlayer();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Cargar solo una vez
    loadInitialPlaylist(null);
    setIsLoading(false);
  }, [loadInitialPlaylist]); 

  if (isLoading) return <LoadingSpinner />;

  if (viewMode === 'tv') {
    return <TvModeLayout />;
  }

  const data = {
    articles: initialData.articles || { allNews: [] },
    videos: initialData.videos || { allVideos: [] },
    tickerTexts: initialData.tickerTexts,
    interviews: initialData.interviews,
    banners: initialData.banners,
    ads: initialData.ads,
    events: initialData.events,
  };

  return (
    <div className="flex flex-col h-screen w-full bg-gray-100 dark:bg-neutral-950 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 z-50">
        <Header />
      </div>

      {/* Contenido Scrollable */}
      <div className="flex-1 w-full overflow-y-auto relative">
        {isMobile ? (
          <MobileLayout data={data} isMobile={isMobile} />
        ) : (
          <DesktopLayout data={data} />
        )}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 z-50">
        <Footer />
      </div>
    </div>
  );
};

export default HomePageClient;