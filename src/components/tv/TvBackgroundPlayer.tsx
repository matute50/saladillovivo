'use client';

import React from 'react';
import { useMediaPlayer } from '@/context/MediaPlayerContext';
import VideoPlayer from '@/components/VideoPlayer';

const TvBackgroundPlayer = () => {
  const { currentVideo, isPlaying } = useMediaPlayer();

  // No renderizar nada si no hay un video que mostrar
  if (!currentVideo?.url) {
    return (
        <div className="absolute inset-0 w-full h-full z-0 bg-black" />
    );
  }

  return (
    <div className='absolute inset-0 w-full h-full z-0'>
      <VideoPlayer
        src={currentVideo.url}
        playing={isPlaying}
        // Estas props son necesarias para el reproductor pero no necesitamos manejarlas aquí
        onReady={() => {}}
        onPlay={() => {}}
        onPause={() => {}}
        onEnded={() => {}}
        onError={(e) => console.error('Background Player Error:', e)}
      />
    </div>
  );
};

export default TvBackgroundPlayer;
