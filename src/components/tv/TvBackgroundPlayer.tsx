'use client';

import React from 'react';
import { useMediaPlayer } from '@/context/MediaPlayerContext';
import VideoPlayer from '@/components/VideoPlayer';

const TvBackgroundPlayer = () => {
  const { 
    currentVideo, 
    isPlaying, 
    setIsPlaying, 
    handleOnEnded, 
    handleOnProgress 
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
        src={currentVideo.url}
        playing={isPlaying}
        onReady={() => setIsPlaying(true)} // Asegura el play al estar listo
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={handleOnEnded}
        onProgress={(progress) => handleOnProgress(progress, currentVideo?.id, currentVideo?.categoria)}
        onError={(e) => {
          console.error('Background Player Error:', e);
          // En caso de error, intenta pasar al siguiente video.
          handleOnEnded(); 
        }}
      />
    </div>
  );
};

export default TvBackgroundPlayer;
