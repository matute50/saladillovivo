'use client';

import React, { useEffect, useState } from 'react';
// Se eliminó AnimatePresence y NewsModal porque ya no se usan
import DesktopLayout from './layout/DesktopLayout';
import MobileLayout from './layout/MobileLayout';
import TvModeLayout from './layout/TvModeLayout';
import type { PageData } from '@/lib/types'; // Se eliminaron tipos Article/SlideMedia no usados aquí
import { useMediaPlayer } from '@/context/MediaPlayerContext';
import useIsMobile from '@/hooks/useIsMobile';

// A simple loading spinner component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen w-screen bg-black">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

const HomePageClient = ({ initialData }: { initialData: PageData }) => {
  const isMobile = useIsMobile();
  const { loadInitialPlaylist, viewMode } = useMediaPlayer();
  
  const [isLoading, setIsLoading] = useState(true);
  // Se eliminaron los estados del Modal (isModalOpen, selectedNews)

  useEffect(() => {
    // Load the initial playlist
    loadInitialPlaylist(null);
    // Set loading to false after the component has mounted and hydrated
    setIsLoading(false);
  }, [loadInitialPlaylist]);

  // Se eliminaron handlers (handleOpenModal, handleCloseModal)
  
  // Show a loading spinner until the client-side is ready
  if (isLoading) {
    return <LoadingSpinner />;
  }

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
    <>
      {isMobile ? (
        // Se eliminó onCardClick
        <MobileLayout data={data} isMobile={isMobile} />
      ) : (
        // Se eliminó onCardClick (Corrección del error de build)
        <DesktopLayout data={data} />
      )}
      
      {/* Se eliminó todo el bloque de AnimatePresence/NewsModal */}
    </>
  );
};

export default HomePageClient;