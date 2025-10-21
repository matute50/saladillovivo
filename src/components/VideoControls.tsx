'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Volume1, Cast } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

const VideoControls = ({
  isPlaying,
  isMuted,
  progress,
  duration,
  volume,
  isMobileFixed,
  togglePlayPause,
  toggleMute,
  onSeek,
  onVolumeChange,
  toggleFullScreen,
  isFullscreen,
  isCastAvailable,
  handleCast,
  isLive
}) => {
  const [showVolume, setShowVolume] = useState(false);

  const handleInteraction = (e, action) => {
    e.stopPropagation();
    action();
  };

  const handleSeekChange = (value: number[]) => {
    if (!isLive && duration > 0) {
      onSeek(value[0] / duration);
    }
  };

  const handleVolumeChangeWrapper = (value: number) => {
    onVolumeChange(value);
  };

  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.1 }}
      className="absolute bottom-0 left-0 right-0 pt-1 bg-gradient-to-t from-black/70 to-transparent flex flex-col z-20"
    >
      {!isLive && (
        <div className="px-2 w-full">
          <Slider
            value={[progress * duration]}
            max={duration}
            step={1}
            onValueChange={handleSeekChange}
            className="w-full h-1 cursor-pointer"
          />
        </div>
      )}
      <div className="flex items-center justify-between space-x-2 p-2">
        <div className="flex items-center space-x-2">
          <button onClick={(e) => handleInteraction(e, togglePlayPause)} className="text-white p-1 focus:outline-none">
            {isPlaying ? <Pause size={isMobileFixed ? 18 : 22} /> : <Play size={isMobileFixed ? 18 : 22} />}
          </button>
          <div 
            className="flex items-center"
            onMouseEnter={() => setShowVolume(true)}
            onMouseLeave={() => setShowVolume(false)}
          >
            <button onClick={(e) => handleInteraction(e, toggleMute)} className="text-white p-1 focus:outline-none transition-colors">
              <VolumeIcon size={isMobileFixed ? 18 : 22} />
            </button>
            {showVolume && !isMobileFixed && (
              <div className="w-20 ml-2">
                <Slider
                  value={[isMuted ? 0 : volume * 100]}
                  max={100}
                  step={1}
                  onValueChange={(value) => handleVolumeChangeWrapper(value[0])}
                  className="w-full h-1 cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {isCastAvailable && (
            <button onClick={(e) => handleInteraction(e, handleCast)} className="text-white p-1 focus:outline-none">
              <Cast size={isMobileFixed ? 18 : 22} />
            </button>
          )}
          <button onClick={(e) => handleInteraction(e, toggleFullScreen)} className="text-white p-1 focus:outline-none">
            {isFullscreen ? <Minimize size={isMobileFixed ? 18 : 22} /> : <Maximize size={isMobileFixed ? 18 : 22} />}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default VideoControls;
