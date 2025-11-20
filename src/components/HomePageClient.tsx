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

  // Carga la playlist inicial al montar el componente.
  // Esto ahora se aplica tanto al modo 'diario' como al 'tv' para unificar la experiencia.
  useEffect(() => {
    loadInitialPlaylist(null);
  }, [loadInitialPlaylist]);


  // Lógica de renderizado condicional
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