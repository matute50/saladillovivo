'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import DesktopLayout from './layout/DesktopLayout';
import MobileLayout from './layout/MobileLayout';
import TvModeLayout from './layout/TvModeLayout';
import type { PageData, Article, SlideMedia } from '@/lib/types';
import { useMediaPlayer } from '@/context/MediaPlayerContext';
import useIsMobile from '@/hooks/useIsMobile';
import NewsModal from './NewsModal'; // Importar el modal

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<Article | null>(null);

  useEffect(() => {
    // Load the initial playlist
    loadInitialPlaylist(null);
    // Set loading to false after the component has mounted and hydrated
    setIsLoading(false);
  }, [loadInitialPlaylist]);

  const handleOpenModal = (newsItem: Article) => {
    setSelectedNews(newsItem);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  
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
        <MobileLayout data={data} isMobile={isMobile} onCardClick={handleOpenModal} />
      ) : (
        <DesktopLayout data={data} onCardClick={handleOpenModal} />
      )}
      
      
      
      <AnimatePresence onExitComplete={() => setSelectedNews(null)}>
        {isModalOpen && selectedNews && (
          <NewsModal
            onClose={handleCloseModal}
            videoToPlay={(() => {
                let slideMedia: SlideMedia | null = null;
                const hasAnySlideUrl = !!selectedNews.url_slide;
                const isWebmVideoSlide = hasAnySlideUrl && selectedNews.url_slide?.endsWith('.webm');
                const isMp4VideoSlide = hasAnySlideUrl && selectedNews.url_slide?.endsWith('.mp4');
                const hasImageAudioForSlide = !!selectedNews.imageUrl && !!selectedNews.audio_url;

                if (isWebmVideoSlide || isMp4VideoSlide) {
                    slideMedia = {
                        id: selectedNews.id,
                        nombre: selectedNews.titulo,
                        url: selectedNews.url_slide!,
                        createdAt: selectedNews.created_at,
                        categoria: selectedNews.categoria || 'Noticias',
                        imagen: selectedNews.imageUrl,
                        novedad: false,
                        type: 'video',
                    };
                } else if (hasImageAudioForSlide) {
                    slideMedia = {
                        id: selectedNews.id,
                        nombre: selectedNews.titulo,
                        url: "", // Placeholder
                        imageSourceUrl: selectedNews.imageUrl!,
                        audioSourceUrl: selectedNews.audio_url!,
                        createdAt: selectedNews.created_at,
                        categoria: selectedNews.categoria || 'Noticias',
                        imagen: selectedNews.imageUrl,
                        novedad: false,
                        type: 'image',
                    };
                }
                return slideMedia;
            })()}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default HomePageClient;