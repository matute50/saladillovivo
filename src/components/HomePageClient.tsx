'use client';

import React, { useState, useEffect } from 'react';
import DesktopLayout from './layout/DesktopLayout';
import MobileLayout from './layout/MobileLayout';
import { useMediaPlayer } from '@/context/MediaPlayerContext';

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024); // Use 1024px as the breakpoint for desktop layout
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  return isMobile;
};

const HomePageClient = ({ data }) => {
  const isMobile = useIsMobile();
  const [hasMounted, setHasMounted] = useState(false);
  const { playUserSelectedVideo } = useMediaPlayer();
  const { videos, interviews } = data;

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const videoUrl = params.get('videoUrl');

    if (videoUrl && videos && interviews) {
        const combinedVideos = [...interviews, ...videos];
        const videoToPlay = combinedVideos.find(v => v.url === videoUrl);

        if (videoToPlay) {
            playUserSelectedVideo(videoToPlay);
            window.history.replaceState(null, '', window.location.pathname);
        }
    }
  }, [videos, interviews, playUserSelectedVideo]);


  if (!hasMounted) {
    return null; // Return null on first render to avoid hydration mismatch
  }

  if (isMobile) {
    return <MobileLayout data={data} isMobile={isMobile} />;
  }

  return <DesktopLayout data={data} isMobile={isMobile} />;
};

export default HomePageClient;