import React, { useEffect } from 'react'; // Eliminar useState, useRef si no se usan

interface VideoIntroProps {
  videoSrc: string;
  onEnd: () => void;
  videoRef: React.RefObject<HTMLVideoElement>;
  style?: React.CSSProperties; // NUEVO: para controlar la opacidad inicial
}

const VideoIntro: React.FC<VideoIntroProps> = ({ videoSrc, onEnd, videoRef, style }) => {
  useEffect(() => {
    // Este efecto se ejecuta cuando el videoSrc cambia o la ref se asigna.
    if (videoRef && videoRef.current && videoSrc) {
      // Si tenemos todo lo necesario, cargamos y reproducimos el video.
      videoRef.current.load();
      videoRef.current.play().catch((error) => {
        // La reproducción automática puede ser bloqueada por el navegador si el usuario no ha interactuado con la página.
        console.warn("La reproducción automática del video de intro fue bloqueada:", error);
      });
    }
  }, [videoSrc, videoRef]); // Dependemos de videoSrc y videoRef para re-evaluar.

  if (!videoSrc) return null;

  return (
    <video
      ref={videoRef}
      src={videoSrc}
      className="absolute inset-0 w-full h-full object-contain"
      muted
      playsInline
      onEnded={onEnd}
      style={style} // Aplicar el estilo
    />
  );
};

export default VideoIntro;