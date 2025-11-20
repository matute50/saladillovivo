'use client';

import React from 'react';
import MediaPlayerWrapper from '@/components/MediaPlayerWrapper';

const FullScreenTvPlayer = () => {
  return (
    <div className='absolute inset-0 w-full h-full z-0'>
      <MediaPlayerWrapper />
    </div>
  );
};

export default FullScreenTvPlayer;
