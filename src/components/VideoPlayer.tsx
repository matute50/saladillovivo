'use client';

import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import ReactPlayer from 'react-player';

const introVideos = [
  '/azul.mp4',
  '/cuadros.mp4',
  '/cuadros2.mp4',
  '/lineal.mp4',
  '/RUIDO.mp4',
];

const VideoPlayer = ({
  mainSrc,
  transitionSrc,
  onReady,
  onPlay,
  onPause,
  onEnded,
  onError,
  onProgress,
  onDuration,
  playing = false,
  volume = 1,
  muted = false,
  isMobile = false,
  width = "100%",
  height = "100%",
  isTransitioning,
  playerRef: ref, // Renombrar para usar internamente
}) => {
  const mainPlayerRef = useRef(null);
  const transitionPlayerRef = useRef(null);
  const wrapperRef = useRef(null);
  const [introVideoSrc, setIntroVideoSrc] = useState('');
  const [showIntro, setShowIntro] = useState(false);
  const introVideoRef = useRef(null); // Referencia para el elemento de video de introducción

  useImperativeHandle(ref, () => ({
    getWrapper: () => wrapperRef.current,
    getMainPlayer: () => mainPlayerRef.current,
    getTransitionPlayer: () => transitionPlayerRef.current,
    seekTo: (fraction: number, type: string) => {
      if (mainPlayerRef.current) {
        mainPlayerRef.current.seekTo(fraction, type);
      }
    },
  }));

  useEffect(() => {
    if (mainSrc) {
      // Seleccionar un video de introducción aleatorio
      const randomIndex = Math.floor(Math.random() * introVideos.length);
      setIntroVideoSrc(introVideos[randomIndex]);
      setShowIntro(true); // Mostrar la introducción

      // Iniciar la reproducción del video de introducción
      if (introVideoRef.current) {
        introVideoRef.current.play();
      }

      // Ocultar la introducción después de 4 segundos
      const timer = setTimeout(() => {
        setShowIntro(false);
      }, 4000); // 4 segundos

      return () => clearTimeout(timer);
    }
  }, [mainSrc]); // Ejecutar cuando mainSrc cambie

  const playerConfig = {
    youtube: {
      playerVars: {
        showinfo: 0,
        controls: 0,
        modestbranding: 1,
        rel: 0,
        iv_load_policy: 3,
        fs: 0,
        disablekb: 1,
        cc_load_policy: 0,
        autohide: 1,
        playsinline: 1,
        mute: 1 // Force mute for YouTube player
      },
    },
    file: {
      attributes: {
        poster: "",
        controlsList: 'nodownload noremoteplayback',
        disablePictureInPicture: true,
        playsInline: true,
      },
    },
  };

  const playerStyle = { position: 'absolute', top: 0, left: 0 };
  const wrapperClass = isMobile ? "w-full h-full relative bg-black" : "w-full h-full relative bg-black rounded-xl overflow-hidden border border-black shadow-lg shadow-black";

  return (
    <div ref={wrapperRef} className={wrapperClass}>
        <>
          {/* Video de introducción */}
          {introVideoSrc && (
            <video
              ref={introVideoRef}
              src={introVideoSrc}
              muted
              playsInline
              className="absolute top-0 left-0 w-full h-full object-cover"
              style={{
                opacity: showIntro ? 1 : 0,
                transition: 'opacity 1s ease-in-out',
                zIndex: showIntro ? 2 : 0, // Asegurarse de que esté encima cuando sea visible
              }}
            />
          )}

          <ReactPlayer
            ref={mainPlayerRef}
            url={mainSrc || ""}
            playing={playing && !showIntro} // Solo reproducir mainSrc si la intro no está visible
            controls={false}
            width={width}
            height={height}
            className="react-player"
            playsInline={true}
            volume={volume}
            onReady={() => onReady(mainPlayerRef.current)}
            onPlay={onPlay}
            onPause={onPause}
            onEnded={onEnded}
            onError={onError}
            onProgress={onProgress}
            onDuration={onDuration}
            progressInterval={500}
            config={playerConfig}
            style={{ ...playerStyle, opacity: (isTransitioning || showIntro) ? 0 : 1, transition: 'opacity 1s ease-in-out' }}
          />
          <ReactPlayer
            ref={transitionPlayerRef}
            url={transitionSrc || ""}
            playing={playing && isTransitioning}
            controls={false}
            width={width}
            height={height}
            className="react-player"
            playsInline={true}
            loop={true}
            muted={true} // Ensure intro is muted
            volume={volume}
            onReady={() => console.log('Transition player is ready.')}
            onError={(e) => console.error('Transition player error:', e, 'URL:', transitionSrc)}
            config={playerConfig}
            style={{ ...playerStyle, opacity: isTransitioning ? 1 : 0, transition: 'opacity 1s ease-in-out' }}
          />
        </>
      
      <div
        className="absolute inset-0 z-10"
        onClick={(e) => e.stopPropagation()}
      ></div>
    </div>
  );
};

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;