'use client';

import React, { useState, useEffect } from 'react';
import DesktopLayout from './layout/DesktopLayout';
import MobileLayout from './layout/MobileLayout';
import { useMediaPlayer } from '@/context/MediaPlayerContext';
import useIsMobile from '@/hooks/useIsMobile';
import { useNews } from '@/context/NewsContext';

const HomePageClient = ({ initialData }: { initialData: PageData }) => {
  const isMobile = useIsMobile();
  const [hasMounted, setHasMounted] = useState(false);
  const { loadInitialPlaylist } = useMediaPlayer();
  // const { articles, videos, tickerTexts, interviews, banners, ads, events } = useNews(); // Ya no se desestructura de useNews

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

  return <DesktopLayout data={data} isMobile={isMobile} />;
};

export default HomePageClient;