import React, { useEffect } from 'react'; // Eliminar useState, useRef si no se usan

interface VideoIntroProps {
  videoSrc: string; 
  onEnd: () => void;
  videoRef: React.RefObject<HTMLVideoElement>; 
  style?: React.CSSProperties; // NUEVO: para controlar la opacidad inicial
}

const VideoIntro: React.FC<VideoIntroProps> = ({ videoSrc, onEnd, videoRef, style }) => {
  useEffect(() => {
    if (videoSrc && videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch((error) => {
        console.warn("Autoplay bloqueado por el navegador:", error);
      });
    }
  }, [videoSrc]);

  if (!videoSrc) return null;

  return (
    <video
      ref={videoRef}
      src={videoSrc}
      className="absolute inset-0 w-full h-full object-cover"
      muted 
      playsInline 
      onEnded={onEnd}
      style={style} // Aplicar el estilo
    />
  );
};

export default VideoIntro;