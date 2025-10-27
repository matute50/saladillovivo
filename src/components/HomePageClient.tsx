'use client';

import React, { useState, useEffect } from 'react';
import DesktopLayout from './layout/DesktopLayout';
import MobileLayout from './layout/MobileLayout';
import { useMediaPlayer } from '@/context/MediaPlayerContext';
import useIsMobile from '@/hooks/useIsMobile';
import type { PageData } from '@/lib/types';

const HomePageClient = ({ data }: { data: PageData }) => {
  const isMobile = useIsMobile();
  const [hasMounted, setHasMounted] = useState(false);
  const { loadInitialPlaylist } = useMediaPlayer();

  useEffect(() => {
    setHasMounted(true);
    if (typeof window !== 'undefined') { // Asegurar que el código solo se ejecute en el cliente
      const params = new URLSearchParams(window.location.search);
      const videoUrl = params.get('videoUrl');
      
      loadInitialPlaylist(videoUrl);
      if (videoUrl) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, [loadInitialPlaylist]);

  if (!hasMounted) {
    return null;
  }

  if (isMobile) {
    return <MobileLayout data={data} isMobile={isMobile} />;
  }

  return <DesktopLayout data={data} isMobile={isMobile} />;
};

export default HomePageClient;