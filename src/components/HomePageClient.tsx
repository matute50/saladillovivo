'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import DesktopLayout from './layout/DesktopLayout';
import MobileLayout from './layout/MobileLayout';
import TvModeLayout from './layout/TvModeLayout';
import type { PageData, Article } from '@/lib/types';
import { useMediaPlayer } from '@/context/MediaPlayerContext';
import useIsMobile from '@/hooks/useIsMobile';
import NewsModal from './NewsModal'; // Importar el modal

const HomePageClient = ({ initialData }: { initialData: PageData }) => {
  const isMobile = useIsMobile();
  const { loadInitialPlaylist, viewMode } = useMediaPlayer();
  
  // --- Estados para el modal de noticias ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<Article | null>(null);

  useEffect(() => {
    loadInitialPlaylist(null);
  }, [loadInitialPlaylist]);

  const handleOpenModal = (newsItem: Article) => {
    setSelectedNews(newsItem);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

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
        <MobileLayout data={data} isMobile={isMobile} onCardClick={handleOpenModal} />
      ) : (
        <DesktopLayout data={data} onCardClick={handleOpenModal} />
      )}
      
      <AnimatePresence onExitComplete={() => setSelectedNews(null)}>
        {isModalOpen && selectedNews && (
          <NewsModal
            onClose={handleCloseModal}
            newsData={selectedNews}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default HomePageClient;