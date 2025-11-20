'use client';

import React, { useState, useRef, useEffect } from 'react';
import TvBackgroundPlayer from '../tv/TvBackgroundPlayer';
// import TvContentRail from '../tv/TvContentRail'; // Future component for carousel

const TvModeLayout = () => {
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const hideOverlayTimer = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (hideOverlayTimer.current) {
      clearTimeout(hideOverlayTimer.current);
    }
    setIsOverlayVisible(true);
  };

  const handleMouseLeave = () => {
    hideOverlayTimer.current = setTimeout(() => {
      setIsOverlayVisible(false);
    }, 2000);
  };

  // Clear the timer when the component unmounts
  useEffect(() => {
    return () => {
      if (hideOverlayTimer.current) {
        clearTimeout(hideOverlayTimer.current);
      }
    };
  }, []);

  return (
    <div
      className="relative h-screen w-screen overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background Player */}
      <TvBackgroundPlayer />

      {/* Security Shading Overlay */}
      {isOverlayVisible && (
        <div
          className="absolute inset-0 z-20 bg-gradient-to-b from-black/80 via-transparent to-black/80 transition-opacity duration-300 ease-in-out"
          style={{ opacity: isOverlayVisible ? 1 : 0 }}
        ></div>
      )}

      {/* Floating Content Layer (for future carousel) */}
      <div className="absolute inset-0 z-10 bg-transparent flex flex-col justify-end p-8 overflow-y-auto">
        {/* Placeholder for TvContentRail or similar carousel component */}
        {/* <TvContentRail /> */}
      </div>
    </div>
  );
};

export default TvModeLayout;
