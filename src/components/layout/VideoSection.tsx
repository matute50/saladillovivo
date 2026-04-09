import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';
import { useMediaPlayer } from '@/context/MediaPlayerContext';
import { useNewsPlayer } from '@/context/NewsPlayerContext';

const VideoSection: React.FC = () => {
  const {
    currentVideo,
    nextVideo,
    isIntroPlaying,
    setIsIntroPlaying, // Asegúrate de exponer este setter en el Context
    volume,
    playNext,
    isSlidePlaying,
    currentSlideUrl,
    isPlaying,
    isLiveStreamActive,
    streamingUrl
  } = useMediaPlayer();

  const { currentSlide, stopSlide } = useNewsPlayer();
  const slideAudioRef = useRef<HTMLAudioElement>(null);

  const [youtubePlaying, setYoutubePlaying] = useState(false);
  const [introSrc, setIntroSrc] = useState('');
  const introVideoRef = useRef<HTMLVideoElement>(null);
  const [autoplayAllowed, setAutoplayAllowed] = useState(false);

  // Lista de intros actualizada según tu instrucción
  const INTRO_VIDEOS = [
    '/videos_intro/intro1.mp4',
    '/videos_intro/intro2.mp4',
    '/videos_intro/intro3.mp4',
    '/videos_intro/intro4.mp4',
    '/videos_intro/intro5.mp4'
  ];

  // Cada vez que cambia el video actual, preparamos la Intro
  useEffect(() => {
    if (currentVideo && !isSlidePlaying) {
      const randomIntro = INTRO_VIDEOS[Math.floor(Math.random() * INTRO_VIDEOS.length)];
      setIntroSrc(randomIntro);

      // v25.5: Si isIntroPlaying ya es false (cambio directo/restauración), 
      // encendemos YouTube inmediatamente. De lo contrario, YouTube empieza pausado.
      setYoutubePlaying(!isIntroPlaying);
    }
  }, [currentVideo, isSlidePlaying, isIntroPlaying]);

  // Manejador de tiempo de la Intro para "pre-encender" YouTube
  const handleIntroTimeUpdate = () => {
    if (introVideoRef.current) {
      const { currentTime, duration } = introVideoRef.current;
      // Cuando faltan 4 segundos para terminar la intro, activamos YouTube en la capa inferior
      if (duration - currentTime <= 4 && !youtubePlaying) {
        setYoutubePlaying(true);
      }
    }
  };

  const handleIntroEnded = () => {
    setIsIntroPlaying(false);
    setAutoplayAllowed(true); // Una vez que termina la intro, asumimos que hubo interacción o ya es seguro
  };

  // Manejar errores de Autoplay en el video intro
  useEffect(() => {
    if (isIntroPlaying && introVideoRef.current) {
        introVideoRef.current.play().catch(err => {
            console.warn("Autoplay bloqueado en Intro, reintentando muted:", err);
            if (introVideoRef.current) {
                introVideoRef.current.muted = true;
                introVideoRef.current.play();
            }
        });
    }
  }, [isIntroPlaying, introSrc]);

  if (isLiveStreamActive && streamingUrl) {
    return (
      <div className="relative w-full h-full aspect-video bg-black">
        <ReactPlayer
          url={streamingUrl}
          playing={true} 
          volume={volume}
          width="100%"
          height="100%"
          config={{
            youtube: {
              playerVars: {
                controls: 0,
                showinfo: 0,
                rel: 0,
                modestbranding: 1,
                autoplay: 1,
                mute: 1,
                enablejsapi: 1,
                playsinline: 1
              }
            }
          }}
        />
        <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-lg shadow-2xl animate-pulse">
            <div className="w-2 h-2 rounded-full bg-white"></div>
            <span className="text-xs font-black">EN VIVO</span>
        </div>
      </div>
    );
  }

  // Flujo 1: Slide disparado desde NewsCard (NewsPlayerContext)
  const newsSlideIsActive = (currentSlide?.type === 'html' || currentSlide?.type === 'image') && !!currentSlide?.url;
  // Flujo 2: Slide disparado desde MediaPlayerContext (legado)  
  const legacySlideIsActive = isSlidePlaying && !!currentSlideUrl;

  const activeSlideUrl = newsSlideIsActive ? currentSlide!.url : (legacySlideIsActive ? currentSlideUrl : null);

  // Sincronizar el volumen del audio maestro global
  useEffect(() => {
    const audioEl = document.getElementById('global-slide-audio') as HTMLAudioElement;
    if (audioEl) {
      audioEl.volume = volume;
    }
  }, [volume, activeSlideUrl]);

  if (activeSlideUrl) {
    const isImageSlide = currentSlide?.type === 'image' || (!activeSlideUrl.endsWith('.html') && !activeSlideUrl.includes('.mp4'));

    return (
      <div className="relative w-full h-full aspect-video bg-black overflow-hidden">
        {isImageSlide ? (
           <img 
              src={activeSlideUrl} 
              className="w-full h-full object-cover" 
              alt="Slide Imagen" 
           />
        ) : (
           <iframe
             src={activeSlideUrl.includes('?') ? `${activeSlideUrl}&playAudio=true` : `${activeSlideUrl}?playAudio=true`}
             className="w-full h-full border-none"
             title="Noticia Saladillo Vivo"
           />
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full h-full aspect-video bg-black overflow-hidden group">
      {/* CAPA SUPERIOR (Z-INDEX 20): VIDEO INTRO */}
      {isIntroPlaying && (
        <video
          ref={introVideoRef}
          src={introSrc}
          autoPlay
          muted={!autoplayAllowed} 
          onTimeUpdate={handleIntroTimeUpdate}
          onEnded={handleIntroEnded}
          className="absolute inset-0 w-full h-full object-cover z-[20] pointer-events-none"
        />
      )}

      {/* CAPA INFERIOR (Z-INDEX 10): YOUTUBE */}
      {currentVideo && currentVideo.url && (
        <div className="absolute inset-0 w-full h-full z-[10]">
          <ReactPlayer
            url={currentVideo.url}
            playing={youtubePlaying}
            volume={volume}
            muted={isIntroPlaying} // Muted solo mientras la intro lo tapa
            width="100%"
            height="100%"
            onEnded={playNext}
            config={{
              youtube: {
                playerVars: {
                  controls: 0,
                  showinfo: 0,
                  rel: 0,
                  modestbranding: 1,
                  iv_load_policy: 3,
                  disablekb: 1,
                  autoplay: 1,
                  mute: 1,
                  enablejsapi: 1,
                  playsinline: 1
                }
              },
              file: {
                attributes: {
                  controlsList: 'nodownload',
                  style: { objectFit: 'cover', width: '100%', height: '100%' }
                }
              }
            }}
          />
        </div>
      )}

      {/* Overlay para bloquear clicks derechos o interacciones directas con el iframe */}
      <div className="absolute inset-0 w-full h-full z-[15] pointer-events-none" />
    </div>
  );
};

export default VideoSection;