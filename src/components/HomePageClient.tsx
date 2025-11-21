'use client';

import React, { useEffect } from 'react';
import DesktopLayout from './layout/DesktopLayout';
import MobileLayout from './layout/MobileLayout';
import TvModeLayout from './layout/TvModeLayout';
import { PageData } from '@/lib/types';
import { useMediaPlayer } from '@/context/MediaPlayerContext';
import useIsMobile from '@/hooks/useIsMobile';

const HomePageClient = ({ initialData }: { initialData: PageData }) => {
  const isMobile = useIsMobile();
  const { loadInitialPlaylist, viewMode } = useMediaPlayer();

  useEffect(() => {
    loadInitialPlaylist(null);
  }, [loadInitialPlaylist]);


  if (viewMode === 'tv') {
    return <TvModeLayout />;
  }

  // Si no es modo TV, renderiza el layout normal (diario)
  const data = {
    articles: initialData.articles || { allNews: [] },
    videos: initialData.videos || { allVideos: [] },
    tickerTexts: initialData.tickerTexts,
    interviews: initialData.interviews,
    banners: initialData.banners,
    ads: initialData.ads,
    events: initialData.events,
  };

  if (isMobile) {
    return <MobileLayout data={data} isMobile={isMobile} />;
  }

  return <DesktopLayout data={data} />;
};

export default HomePageClient;