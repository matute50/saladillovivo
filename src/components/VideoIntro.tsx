import React, { useState, useEffect, useRef } from 'react';

// Lista de tus videos disponibles en la carpeta public
const INTRO_VIDEOS = [
  '/azul.mp4',
  '/cuadros.mp4',
  '/cuadros2.mp4',
  '/lineal.mp4',
  '/RUIDO.mp4'
];

interface VideoIntroProps {
  onEnd: () => void;
}

const VideoIntro: React.FC<VideoIntroProps> = ({ onEnd }) => {
  // Estado para guardar el video seleccionado (inicialmente null)
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Esta lógica corre SOLO en el cliente al montar el componente.
    // Evita errores de hidratación de Next.js (Server vs Client mismatch).
    const randomIndex = Math.floor(Math.random() * INTRO_VIDEOS.length);
    setVideoSrc(INTRO_VIDEOS[randomIndex]);
  }, []);

  // Efecto para iniciar reproducción apenas cambia el videoSrc
  useEffect(() => {
    if (videoSrc && videoRef.current) {
      // Forzamos la carga y el play
      videoRef.current.load();
      videoRef.current.play().catch((error) => {
        console.warn("Autoplay bloqueado por el navegador:", error);
      });
    }
  }, [videoSrc]);

  // Mientras se decide qué video poner, no renderizamos nada (o un fondo negro)
  if (!videoSrc) return null;

  return (
    <video
      ref={videoRef}
      src={videoSrc}
      // "absolute inset-0" es CRUCIAL para que respete el tamaño del contenedor padre (Stage)
      className="absolute inset-0 w-full h-full object-cover"
      muted // Necesario para asegurar el autoplay sin interacción previa
      playsInline // Necesario para iOS/Móviles
      onEnded={onEnd} // Ejecuta la transición al terminar
    />
  );
};

export default VideoIntro;