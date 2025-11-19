'use client';

import React from 'react';
import { MediaPlayerProvider } from '@/context/MediaPlayerContext';

const MediaPlayerWrapper = ({ children }: { children: React.ReactNode }) => {
  return <MediaPlayerProvider>{children}</MediaPlayerProvider>;
};

export default MediaPlayerWrapper;
