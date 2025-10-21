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
    // This effect runs once when the component has mounted and data is available.
    if (hasMounted && videos && interviews) {
      const params = new URLSearchParams(window.location.search);
      const videoUrl = params.get('videoUrl');

      if (videoUrl) {
        // If a specific video is requested in the URL, play it.
        const combinedVideos = [...interviews, ...videos];
        const videoToPlay = combinedVideos.find(v => v.url === videoUrl);

        if (videoToPlay) {
            playUserSelectedVideo(videoToPlay);
            // Clean the URL
            window.history.replaceState(null, '', window.location.pathname);
        }
      }
    }
  // The dependency array ensures this runs only once after everything is ready.
  }, [hasMounted, videos, interviews, playUserSelectedVideo]);


  if (!hasMounted) {
    return null; // Return null on first render to avoid hydration mismatch
  }

  if (isMobile) {
    return <MobileLayout data={data} isMobile={isMobile} />;
  }

  return <DesktopLayout data={data} isMobile={isMobile} />;
};

export default HomePageClient;