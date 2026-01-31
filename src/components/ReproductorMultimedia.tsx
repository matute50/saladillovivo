'use client';

import React from 'react';
import { motion } from 'framer-motion';
import VideoIntro from './VideoIntro';
import VideoPlayer from './VideoPlayer';
import { SlideMedia, Article } from '@/lib/types';
import { usePlayerStore } from '@/store/usePlayerStore';

interface ReproductorMultimediaProps {
  onComplete: () => void;
  videoToPlay?: SlideMedia | null;
}

export default function ReproductorMultimedia({ onComplete, videoToPlay }: ReproductorMultimediaProps) {
  const { currentVideo } = usePlayerStore();
  const videoPlayerRef = React.useRef<HTMLVideoElement>(null);

  const handleVideoEnd = () => {
    console.log('Video de introducción terminado. Finalizando secuencia.');
    onComplete();
  };

  return (
    <div
      className="relative w-full max-w-4xl aspect-video bg-black/20 backdrop-blur-sm overflow-hidden rounded-xl shadow-2xl dark:shadow-none mx-auto"
      aria-live="polite"
    >        {videoToPlay ? (
      <VideoPlayer
        videoUrl={videoToPlay?.url || ""}
        imageUrl={
          videoToPlay?.imageSourceUrl ||
          (videoToPlay as unknown as Article)?.imageUrl ||
          (videoToPlay as any)?.image_url ||
          videoToPlay?.imagen ||
          null
        }
        audioUrl={
          videoToPlay?.audioSourceUrl ||
          (videoToPlay as unknown as Article)?.audio_url ||
          (videoToPlay as any)?.audioUrl ||
          null
        }
        onClose={onComplete}
        autoplay={true}
      />
    ) : (
      <motion.div
        key="intro"
        className="absolute inset-0 w-full h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <VideoIntro
          onEnd={handleVideoEnd}
          videoSrc={currentVideo?.url || ""} // Pass currentVideo.url as videoSrc
          videoRef={videoPlayerRef} // Pass videoPlayerRef
        />
      </motion.div>
    )}
    </div>
  );
}

