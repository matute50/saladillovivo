'use client';

import React from 'react';
import { NewsProvider } from '@/context/NewsContext';
import { MediaPlayerProvider } from '@/context/MediaPlayerContext';
import { NewsPlayerProvider } from '@/context/NewsPlayerContext';
import { VolumeProvider } from '@/context/VolumeContext';
import { useIsMobile } from '@/hooks/useIsMobile'; // NUEVO IMPORT
import MobileLayout from '@/components/layout/MobileLayout'; // NUEVO IMPORT

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
}

export default function ClientLayoutWrapper({ children }: ClientLayoutWrapperProps) {
  const isMobile = useIsMobile();

  return (
    <NewsProvider>
      <VolumeProvider>
        <MediaPlayerProvider>
          <NewsPlayerProvider>
            {isMobile ? <MobileLayout /> : children}
          </NewsPlayerProvider>
        </MediaPlayerProvider>
      </VolumeProvider>
    </NewsProvider>
  );
}