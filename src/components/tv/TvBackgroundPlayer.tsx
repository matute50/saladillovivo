'use client';

import React, { useRef } from 'react';
import { useMediaPlayer } from '@/context/MediaPlayerContext';
import VideoPlayer from '@/components/VideoPlayer';
import VideoIntro from '@/components/VideoIntro';
import Image from 'next/image';

const TvBackgroundPlayer = () => {
  const { 
    currentVideo, 
    handleOnEnded, 
    videoPlayerRef, 
    reactPlayerRef, 
    reactPlayerOpacity, 
    reactPlayerVolume,
    fadeState,
    showIntroOverlay, 
    introOverlayVideoSrc,
    nextVideo, // NUEVO: para preloading
    preloadPlayerRef // NUEVO: para el preloader
  } = useMediaPlayer();

  // Ref para el video de introducción superpuesto
  const introOverlayRef = useRef<HTMLVideoElement>(null); 

  if (!currentVideo) {
    return (
      <div className="absolute inset-0 z-0">
        <Image 
          src="/FONDO OSCURO.PNG" 
          alt="Background" 
          fill 
          className="object-cover" 
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>
    );
  }

  const isNativeVideo = currentVideo.type === 'video';
  const isNextVideoYoutube = nextVideo?.url.includes('youtube.com') || nextVideo?.url.includes('youtu.be');

  return (
    <div className="absolute inset-0 z-0 bg-black">
      {/* Reproductor de Video Principal (inferior) */}
      {isNativeVideo ? (
        <VideoIntro
          videoSrc={currentVideo.url}
          onEnd={handleOnEnded}
          videoRef={videoPlayerRef}
          style={{ 
            opacity: showIntroOverlay ? 0 : (fadeState === 'fadingIn' ? 0 : 1), 
            transition: showIntroOverlay ? 'none' : 'opacity 1s ease-in-out',
            zIndex: 10 
          }} 
        />
      ) : (
        <VideoPlayer
          videoUrl={currentVideo.url}
          autoplay={true}
          onClose={handleOnEnded}
          playerRef={reactPlayerRef}
          playerOpacity={showIntroOverlay ? 0.01 : reactPlayerOpacity} 
          playerVolume={showIntroOverlay ? 0 : reactPlayerVolume} 
        />
      )}

      {/* Video de Introducción Superpuesto (superior) */}
      {showIntroOverlay && introOverlayVideoSrc && (
        <VideoIntro
          videoSrc={introOverlayVideoSrc}
          onEnd={() => { /* No hacemos nada especial al finalizar el overlay, se quita por timer */ }}
          videoRef={introOverlayRef} 
          muted 
          style={{ opacity: 1, zIndex: 20 }} 
        />
      )}

      {/* Reproductor Oculto para Precarga del Próximo Video de YouTube */}
      {nextVideo && isNextVideoYoutube && (
        <div style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden', opacity: 0, zIndex: -1 }}>
          <VideoPlayer
            videoUrl={nextVideo.url}
            autoplay={false}
            playing={false}
            playerRef={preloadPlayerRef}
            playerOpacity={0}
            playerVolume={0}
            onClose={() => { /* No hacer nada al "terminar" el video precargado */ }}
          />
        </div>
      )}
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />
    </div>
  );
};

export default TvBackgroundPlayer;