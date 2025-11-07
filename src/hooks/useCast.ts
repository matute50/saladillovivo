'use client';

import { useState, useEffect } from 'react';
import type { Video } from '@/lib/types'; // Asegúrate de que la ruta sea correcta

// Declara los tipos de Google Cast para que TypeScript no falle
// Si ya tienes @types/chrome, puedes borrar esto.
declare global {
  interface Window {
    __onGCastApiAvailable?: (isAvailable: boolean) => void;
  }
  const cast: any;
  const chrome: any;
}

export const useCast = (currentVideo: Video | null) => {
  const [isCastAvailable, setIsCastAvailable] = useState(false);

  useEffect(() => {
    // El SDK que cargamos en layout.tsx llamará a esta función
    // cuando esté listo.
    window['__onGCastApiAvailable'] = (isAvailable) => {
      if (isAvailable) {
        try {
          const castContext = cast.framework.CastContext.getInstance();
          castContext.setOptions({
            // Debes obtener tu propio App ID en la consola de Google Cast
            // Pero puedes usar el ID por defecto para probar
            receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
            autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
          });
          setIsCastAvailable(true);
        } catch (error) {
          console.error("Error al inicializar Google Cast:", error);
          setIsCastAvailable(false);
        }
      }
    };
  }, []);

  const handleCast = () => {
    if (!isCastAvailable || !currentVideo || !currentVideo.url) {
      console.error("Cast no disponible o no hay video para transmitir.");
      return;
    }

    const castSession = cast.framework.CastContext.getInstance().getCurrentSession();
    
    // Asume que la URL es un video MP4/WebM.
    // NOTA: 'ReactPlayer' usa el reproductor de YouTube, que es más complejo.
    // Esta lógica simple funciona para URLs de video directas.
    const mediaInfo = new chrome.cast.media.MediaInfo(currentVideo.url, 'video/mp4');
    
    // Añade metadatos básicos
    mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
    mediaInfo.metadata.title = currentVideo.nombre;
    // (Aquí podrías añadir la lógica de 'getThumbnailUrl' si la tienes disponible)
    // mediaInfo.metadata.images = [{ 'url': 'URL_DE_LA_MINIATURA' }];

    const request = new chrome.cast.media.LoadRequest(mediaInfo);

    const castContext = cast.framework.CastContext.getInstance();
    if (castSession) {
      // Si ya hay una sesión, solo carga el video
      castSession.loadMedia(request).catch(
        (error: any) => console.error('Error al cargar media en sesión existente:', error)
      );
    } else {
      // Si no hay sesión, pide al usuario que elija un dispositivo
      castContext.requestSession().then(
        () => {
          const newSession = castContext.getCurrentSession();
          if (newSession) {
            newSession.loadMedia(request).catch(
              (error: any) => console.error('Error al cargar media en nueva sesión:', error)
            );
          }
        },
        (error: any) => {
          console.error('Error al solicitar sesión de Cast:', error);
        }
      );
    }
  };

  return { isCastAvailable, handleCast };
};

export default useCast;