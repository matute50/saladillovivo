'use client';

import { useState, useEffect, useCallback } from 'react';

declare global {
    interface Window {
        __onGCastApiAvailable: (isAvailable: boolean) => void;
        chrome: any;
        cast: any;
    }
}

const CHROMECAST_BG_URL = 'https://media.saladillovivo.com.ar/images/chromecast-bg.png';

export function useChromecast() {
    const [isCastAvailable, setIsCastAvailable] = useState(false);
    const [isCasting, setIsCasting] = useState(false);
    const [castSession, setCastSession] = useState<any>(null);

    useEffect(() => {
        // Definir la función que el SDK llama cuando está listo
        window.__onGCastApiAvailable = (isAvailable: boolean) => {
            if (isAvailable) {
                initializeCastApi();
            }
        };

        // Si ya está disponible (p.ej. navegación en SPA)
        if (window.cast && window.cast.framework) {
            initializeCastApi();
        }
    }, []);

    const initializeCastApi = () => {
        const castContext = window.cast.framework.CastContext.getInstance();
        castContext.setOptions({
            receiverApplicationId: window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
            autoJoinPolicy: window.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
        });

        setIsCastAvailable(true);

        // Interceptar cambios de sesión (onSessionStarted / onSessionResumed)
        castContext.addEventListener(
            window.cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
            (event: any) => {
                const sessionState = event.sessionState;

                switch (sessionState) {
                    case window.cast.framework.SessionState.SESSION_STARTED:
                    case window.cast.framework.SessionState.SESSION_RESUMED:
                        console.log('Chromecast: Sesión activa detectada');
                        setIsCasting(true);
                        const currentSession = castContext.getCurrentSession();
                        setCastSession(currentSession);

                        // Requerimiento Técnico: Inicializar RemoteMediaClient y cargar contenido
                        loadDefaultMedia(currentSession);
                        break;
                    case window.cast.framework.SessionState.SESSION_ENDED:
                        console.log('Chromecast: Sesión terminada');
                        setIsCasting(false);
                        setCastSession(null);
                        break;
                }
            }
        );
    };

    const loadDefaultMedia = (session: any) => {
        if (!session) return;

        // Implementación de MediaLoadRequestData con metadatos enriquecidos
        const mediaInfo = new window.chrome.cast.media.MediaInfo(CHROMECAST_BG_URL, 'image/png');
        mediaInfo.streamType = window.chrome.cast.media.StreamType.BUFFERED;

        const metadata = new window.chrome.cast.media.GenericMediaMetadata();
        metadata.metadataType = window.chrome.cast.media.MetadataType.GENERIC;
        metadata.title = "Saladillo Vivo - App";
        metadata.subtitle = "Streaming en progreso";
        metadata.images = [{ url: CHROMECAST_BG_URL }];

        mediaInfo.metadata = metadata;

        const loadRequest = new window.chrome.cast.media.LoadRequest(mediaInfo);
        loadRequest.autoplay = true;

        // Manejo de promesas para capturar excepciones en el MediaStatus
        session.loadMedia(loadRequest).then(
            () => { console.log('Chromecast: MediaLoadRequest enviado con éxito'); },
            (error: any) => { console.error('Chromecast: Error en MediaLoadRequest', error); }
        );
    };

    const requestCastSession = useCallback(async () => {
        if (!isCastAvailable) return;

        const castContext = window.cast.framework.CastContext.getInstance();
        try {
            // Abre el DiscoveryManager nativo del navegador (Sink selection)
            await castContext.requestSession();
        } catch (error) {
            console.error('Chromecast: Error al solicitar sesión', error);
        }
    }, [isCastAvailable]);

    return {
        isCastAvailable,
        isCasting,
        requestCastSession,
        castSession
    };
}
