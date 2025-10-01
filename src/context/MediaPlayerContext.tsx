'use client';

// @ts-nocheck
import React, { createContext, useContext } from 'react';
import { useVideoPlayer } from '@/hooks/useVideoPlayer';
import { useStreamStatus } from '@/hooks/useStreamStatus';

const MediaPlayerContext = createContext(null);

export const useMediaPlayer = () => {
  const context = useContext(MediaPlayerContext);
  if (!context) {
    throw new Error('useMediaPlayer must be used within a MediaPlayerProvider');
  }
  return context;
};

export const MediaPlayerProvider = ({ children }) => {
  const mediaPlayerLogic = useVideoPlayer();
  const streamStatus = useStreamStatus(mediaPlayerLogic);

  const value = {
    ...mediaPlayerLogic,
    streamStatus,
  };

  return (
    <MediaPlayerContext.Provider value={value}>
      {children}
    </MediaPlayerContext.Provider>
  );
};