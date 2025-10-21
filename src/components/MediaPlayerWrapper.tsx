'use client';

import { MediaPlayerProvider } from '@/context/MediaPlayerContext';
import React from 'react';

export default function MediaPlayerWrapper({ children }: { children: React.ReactNode }) {
  return (
    <MediaPlayerProvider>
      {children}
    </MediaPlayerProvider>
  );
}