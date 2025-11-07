'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Video } from '@/lib/types'; // Asegúrate de que la ruta sea correcta

// --- ARREGLO: Mover 'cast' y 'chrome' a la interfaz de 'Window' ---
// Esto le dice a TypeScript: "Confía en mí, 'window.cast' y 'window.chrome'
// existirán, y tendrán este tipo".
declare global {
  interface Window {
    __onGCastApiAvailable?: (isAvailable: boolean) => void;
    cast?: any; // El SDK de Cast adjuntará 'cast' a window
    chrome?: any; // El SDK de Cast necesita 'chrome' para funcionar
  }
}
// --- FIN DEL ARREGLO ---

export const useCast = (currentVideo: Video | null) => {
  const [isCastAvailable, setIsCastAvailable] = useState(false);

  useEffect(() => {
    // El SDK que cargamos en layout.tsx llamará a esta función
    // cuando esté listo.
    window['__onGCastApiAvailable'] = (isAvailable) => {
      if (isAvailable && window.cast && window.chrome) { // Comprueba que existan
        try {
          const castContext = window.cast.framework.CastContext.getInstance();
          castContext.setOptions({
            receiverApplicationId: window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
            autoJoinPolicy: window.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
          });
          setIsCastAvailable(true);
        } catch (error) {
          console.error("Error al inicializar Google Cast:", error);
          setIsCastAvailable(false);
        }
      }
    };
  }, []);

  const handleCast = useCallback(() => {
    // Comprueba que todo exista antes de intentar transmitir
    if (!isCastAvailable || !currentVideo || !currentVideo.url || !window.cast || !window.chrome) {
      console.error("Cast no disponible, no hay video, o los scripts de cast/chrome no están cargados.");
      return;
    }

    const castContext = window.cast.framework.CastContext.getInstance();
    const castSession = castContext.getCurrentSession();
    
    // Asume que la URL es un video MP4/WebM.
    const mediaInfo = new window.chrome.cast.media.MediaInfo(currentVideo.url, 'video/mp4');
    
    mediaInfo.metadata = new window.chrome.cast.media.GenericMediaMetadata();
    mediaInfo.metadata.title = currentVideo.nombre;
    // (Aquí podrías añadir la lógica de 'getThumbnailUrl' si la tienes disponible)
    // mediaInfo.metadata.images = [{ 'url': 'URL_DE_LA_MINIATURA' }];

    const request = new window.chrome.cast.media.LoadRequest(mediaInfo);

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
  }, [isCastAvailable, currentVideo]); // Dependencias del useCallback

  return { isCastAvailable, handleCast };
};

export default useCast;