'use client';

import React from 'react';
import MediaPlayerWrapper from '@/components/MediaPlayerWrapper';
import { useMediaPlayer } from '@/context/MediaPlayerContext';
import VideoPlayer from '../VideoPlayer';

const FullScreenTvPlayer = () => {
  const { currentVideo, isPlaying } = useMediaPlayer();

  return (
    <div className='absolute inset-0 w-full h-full z-0'>
      <MediaPlayerWrapper>
        {currentVideo && (
          <VideoPlayer
            src={currentVideo.url}
            playing={isPlaying}
          />
        )}
      </MediaPlayerWrapper>
    </div>
  );
};

export default FullScreenTvPlayer;
