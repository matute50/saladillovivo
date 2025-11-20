'use client';

import React from 'react';
import TvBackgroundPlayer from '../tv/TvBackgroundPlayer';
// import TvContentRail from '../tv/TvContentRail'; // Future component for carousel

const TvModeLayout = () => {
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Background Player */}
      <TvBackgroundPlayer />

      {/* Floating Content Layer (for future carousel) */}
      <div className="absolute inset-0 z-10 bg-transparent flex flex-col justify-end p-8 overflow-y-auto">
        {/* Placeholder for TvContentRail or similar carousel component */}
        {/* <TvContentRail /> */}
      </div>
    </div>
  );
};

export default TvModeLayout;
