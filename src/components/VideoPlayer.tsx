'use client';

import React, { useEffect, useState, useRef } from 'react';
import ReactPlayer from 'react-player';
import { useVolume } from '@/context/VolumeContext'; // <--- CONEXIÓN CLAVE

interface VideoPlayerProps {
  videoUrl: string;
  autoplay?: boolean;
  onClose?: () => void;
  onProgress?: (state: { playedSeconds: number }) => void;
  startAt?: number;
  imageUrl?: string; 
  audioUrl?: string; 
  playerVolume?: number; // Added to resolve type error and allow external volume control
}

export default function VideoPlayer({ 
  videoUrl, 
  autoplay = false, 
  onClose, 
  onProgress,
  startAt,
  playerVolume // Destructure playerVolume prop
}: VideoPlayerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const playerRef = useRef<ReactPlayer>(null);
  const hasSeeked = useRef(false);
  
  // Consumimos el estado global del volumen
  const { volume, isMuted } = useVolume(); 

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleReady = () => {
    if (startAt && startAt > 0 && !hasSeeked.current && playerRef.current) {
        playerRef.current.seekTo(startAt, 'seconds');
        hasSeeked.current = true;
    }
  };

  useEffect(() => {
    hasSeeked.current = false;
  }, [videoUrl]);

  const handleError = (e: any) => {
    console.error("VideoPlayer Error:", videoUrl, e);
    if (onClose) onClose();
  };

  if (!isMounted) return null;

  // Determine the effective volume
  const effectiveVolume = typeof playerVolume === 'number' ? playerVolume : volume;

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* CAPA DE BLOQUEO (REGLA DE ORO) 
          Evita cualquier interacción directa con el iframe de YouTube */}
      <div className="absolute inset-0 z-10 bg-transparent" />

      <ReactPlayer
        ref={playerRef}
        url={videoUrl}
        playing={autoplay}
        controls={false} // Desactivamos controles nativos
        volume={effectiveVolume}  // <--- APLICAMOS VOLUMEN EFECTIVO
        muted={isMuted}  // <--- APLICAMOS MUTE DEL CONTEXTO
        width="100%"
        height="100%"
        onEnded={onClose}
        onProgress={onProgress}
        onReady={handleReady}
        onError={handleError}
        config={{
          youtube: {
            playerVars: { 
              showinfo: 0, 
              modestbranding: 1, 
              rel: 0,
              autoplay: autoplay ? 1 : 0,
              controls: 0, 
              disablekb: 1,
              fs: 0,
              iv_load_policy: 3
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
  );
}