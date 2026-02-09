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

    const loadDefaultMedia = useCallback((session: any) => {
        if (!session) return;

        console.log('Chromecast: Iniciando carga de imagen con cache-busting...');
        // Forzar recarga de la imagen evitando caché
        const urlWithCacheBust = `${CHROMECAST_BG_URL}?v=${new Date().getTime()}`;

        // Implementación de MediaLoadRequestData con metadatos enriquecidos
        const mediaInfo = new window.chrome.cast.media.MediaInfo(urlWithCacheBust, 'image/png');
        mediaInfo.streamType = window.chrome.cast.media.StreamType.BUFFERED;

        const metadata = new window.chrome.cast.media.GenericMediaMetadata();
        metadata.metadataType = window.chrome.cast.media.MetadataType.GENERIC;
        metadata.title = "Saladillo Vivo - App";
        metadata.subtitle = "Streaming en progreso";
        metadata.images = [{ url: urlWithCacheBust }];

        mediaInfo.metadata = metadata;

        const loadRequest = new window.chrome.cast.media.LoadRequest(mediaInfo);
        loadRequest.autoplay = true;

        // Manejo de promesas para capturar excepciones en el MediaStatus
        session.loadMedia(loadRequest).then(
            () => { console.log('Chromecast: MediaLoadRequest enviado con éxito a la TV'); },
            (error: any) => {
                console.error('Chromecast: Error CRÍTICO en MediaLoadRequest. Probable problema de CORS o URL inaccesible.', error);
            }
        );
    }, []);

    const initializeCastApi = useCallback(() => {
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
                    case window.cast.framework.SessionState.SESSION_RESUMED: {
                        console.log('Chromecast: Sesión activa detectada (Iniciada/Reanudada)');
                        setIsCasting(true);
                        const currentSession = castContext.getCurrentSession();
                        setCastSession(currentSession);

                        // Requerimiento Técnico: Pequeño delay de cortesía para asegurar que el socket está listo
                        setTimeout(() => {
                            console.log('Chromecast: Ejecutando carga diferida...');
                            loadDefaultMedia(currentSession);
                        }, 1500);
                        break;
                    }
                    case window.cast.framework.SessionState.SESSION_ENDED:
                        console.log('Chromecast: Sesión terminada');
                        setIsCasting(false);
                        setCastSession(null);
                        break;
                }
            }
        );
    }, [loadDefaultMedia]);

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
    }, [initializeCastApi]);

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
