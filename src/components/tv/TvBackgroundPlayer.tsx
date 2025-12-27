'use client';

import React from 'react';
import { useMediaPlayer } from '@/context/MediaPlayerContext';
import VideoPlayer from '@/components/VideoPlayer';

const TvBackgroundPlayer = () => {
  const { 
    currentVideo, 
    isPlaying, 
    handleOnEnded, 
  } = useMediaPlayer();

  // No renderizar nada si no hay un video que mostrar
  if (!currentVideo?.url) {
    return (
        <div className="absolute inset-0 w-full h-full z-0 bg-black" />
    );
  }

  return (
    <div className='absolute inset-0 w-full h-full z-0'>
      <VideoPlayer
        videoUrl={currentVideo.url}
        autoplay={isPlaying}
        onClose={handleOnEnded}
      />
    </div>
  );
};

export default TvBackgroundPlayer;
