'use client';

import React, { useState, useRef, useEffect } from 'react';
import VideoPlayer from '@/components/VideoPlayer';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useMediaPlayer } from '@/context/MediaPlayerContext';
import CustomControls from '@/components/CustomControls';
import VideoTitleBar from '@/components/VideoTitleBar';
import { cn } from '@/lib/utils';
import { Play } from 'lucide-react';

const VideoSection = ({ isMobile }: { isMobile: boolean }) => {
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const { currentVideo, isPlaying, handleOnEnded, setIsPlaying } = useMediaPlayer();
  const [thumbnailSrc, setThumbnailSrc] = useState<string>('/placeholder.png');

  // Forzar autoplay al cargar
  useEffect(() => {
    if (currentVideo) setIsPlaying(true);
  }, [currentVideo, setIsPlaying]);

  useEffect(() => {
    if (currentVideo?.url) {
      const match = currentVideo.url.match(/(?:youtu\.be\/|youtube\.com\/.*v=)([^&]+)/);
      if (match) setThumbnailSrc(`https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`);
    }
  }, [currentVideo]);

  return (
    <div className="w-full">
      <div 
        ref={playerContainerRef}
        className="relative w-full aspect-video bg-black overflow-hidden md:rounded-xl shadow-lg"
      >
        <div className="absolute inset-0 w-full h-full">
          {currentVideo?.url && (
             <VideoPlayer
                key={currentVideo.url} 
                videoUrl={currentVideo.url}
                autoplay={true}
                muted={true} // NECESARIO PARA AUTOPLAY EN PC
                onClose={handleOnEnded}
             />
          )}

          {!isPlaying && currentVideo && (
            <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/40">
               <Play size={48} className="text-white" fill="white" />
            </div>
          )}
        </div>
      </div>
      <VideoTitleBar className="mt-2" />
    </div>
  );
};

export default VideoSection;