'use client';

import React from 'react';
import { NewsProvider } from '@/context/NewsContext';
import { MediaPlayerProvider } from '@/context/MediaPlayerContext';
import { NewsPlayerProvider } from '@/context/NewsPlayerContext';
import { VolumeProvider } from '@/context/VolumeContext'; // <--- NUEVO IMPORT

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
}

export default function ClientLayoutWrapper({ children }: ClientLayoutWrapperProps) {
  return (
    <NewsProvider>
      <VolumeProvider> {/* <--- AGREGAR AQUÍ (Debe envolver a MediaPlayer) */}
        <MediaPlayerProvider>
          <NewsPlayerProvider>
             {children}
          </NewsPlayerProvider>
        </MediaPlayerProvider>
      </VolumeProvider>
    </NewsProvider>
  );
}