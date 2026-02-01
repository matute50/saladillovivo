'use client';

import React, { useRef, useState, useEffect } from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';
import VideoPlayer from '@/components/VideoPlayer';
import Image from 'next/image';
import { useVolumeStore } from '@/store/useVolumeStore';

const TvBackgroundPlayer = () => {
  const {
    currentVideo,
    nextVideo,
    handleOnEnded,
    isPlaying,
  } = usePlayerStore();
  const { volume, isMuted, setVolume } = useVolumeStore(); // Get volume and mute state

  const [playBackgroundEarly, setPlayBackgroundEarly] = useState(false);
  const transitionTriggeredRef = useRef(false);

  // Determina si el video actual es una intro local
  const isLocalIntro = currentVideo?.url?.includes('videos_intro');

  // El video de fondo es el siguiente en la cola si estamos en una intro
  const backgroundVideoUrl = isLocalIntro ? nextVideo?.url : currentVideo?.url;
  const isBackgroundPlaying = isLocalIntro ? playBackgroundEarly : isPlaying;

  // Resetea el estado de la transición cuando cambia el video
  useEffect(() => {
    setPlayBackgroundEarly(false);
    transitionTriggeredRef.current = false;
  }, [currentVideo?.id]);

  // Maneja el evento onTimeUpdate del video de la intro
  const handleIntroTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (!video.duration || transitionTriggeredRef.current) return;

    const timeLeft = video.duration - video.currentTime;

    if (timeLeft <= 5) {
      console.log("TV Intro: Activando video de fondo (5s antes del final)");
      transitionTriggeredRef.current = true;
      setPlayBackgroundEarly(true);
    }
  };

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

  return (
    <div className="absolute inset-0 z-0 bg-black">

      {/* CAPA SUPERIOR: Intro local */}
      {isLocalIntro && currentVideo?.url && (
        <div className="absolute inset-0 z-30 bg-black">
          <video
            key={currentVideo.id}
            src={currentVideo.url}
            autoPlay
            playsInline
            muted // Las intros siempre deben estar silenciadas para el autoplay
            className="w-full h-full object-contain"
            onEnded={() => handleOnEnded(setVolume)}
            onTimeUpdate={handleIntroTimeUpdate}
            onError={() => handleOnEnded(setVolume)} // Si la intro falla, pasa al siguiente
          />
        </div>
      )}

      {/* CAPA INFERIOR: Video principal (de DB o YouTube) */}
      {backgroundVideoUrl && (
        <div className="absolute inset-0 z-20">
          <VideoPlayer
            key={backgroundVideoUrl}
            videoUrl={backgroundVideoUrl}
            // El autoplay se activa cuando isPlaying es true, o cuando se dispara la reproducción temprana
            autoplay={isBackgroundPlaying}
            onClose={() => handleOnEnded(setVolume)}
            // El volumen es 0 si es una intro que se está reproduciendo por encima
            playerVolume={isMuted ? 0 : volume}
          />
        </div>
      )}

      <div className="absolute inset-0 bg-black/20 pointer-events-none z-40" />
    </div>
  );
};

export default TvBackgroundPlayer;