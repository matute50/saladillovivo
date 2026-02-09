'use client';

import { useState, useEffect, useCallback } from 'react';

declare global {
    interface Window {
        __onGCastApiAvailable: (isAvailable: boolean) => void;
        chrome: any;
        cast: any;
    }
}

// La URL se construirá dinámicamente para evitar problemas de CORS y asegurar que apunte al dominio actual
const CHROMECAST_BG_URL = 'https://media.saladillovivo.com.ar/images/chromecast-bg.png';

export function useChromecast() {
    const [isCastAvailable, setIsCastAvailable] = useState(false);
    const [isCasting, setIsCasting] = useState(false);
    const [castSession, setCastSession] = useState<any>(null);

    // DEBUG: Monitor de estado del hook
    useEffect(() => {
        console.log(`Chromecast Hook: Status Check [Available: ${isCastAvailable}, Casting: ${isCasting}]`);
    }, [isCastAvailable, isCasting]);

    const loadDefaultMedia = useCallback((session: any) => {
        if (!session) {
            console.error('Chromecast: No hay sesión activa para cargar media.');
            return;
        }

        const origin = window.location.origin;
        const assetPath = '/images/chromecast-bg.png';
        // Priorizar el host de media si no es localhost, sino usar el actual
        const finalBaseUrl = origin.includes('localhost') ? CHROMECAST_BG_URL : `${origin}${assetPath}`;

        console.log(`Chromecast: Cargando imagen => ${finalBaseUrl}`);
        const urlWithCacheBust = `${finalBaseUrl}?v=${new Date().getTime()}`;

        try {
            if (!window.chrome?.cast?.media) {
                console.error('Chromecast: chrome.cast.media no disponible al cargar');
                return;
            }
            const mediaInfo = new window.chrome.cast.media.MediaInfo(urlWithCacheBust, 'image/png');
            mediaInfo.streamType = window.chrome.cast.media.StreamType.BUFFERED;

            const metadata = new window.chrome.cast.media.GenericMediaMetadata();
            metadata.metadataType = window.chrome.cast.media.MetadataType.GENERIC;
            metadata.title = "Saladillo Vivo";
            metadata.subtitle = "App de Noticias y Streaming";
            metadata.images = [{ url: urlWithCacheBust }];

            mediaInfo.metadata = metadata;

            const loadRequest = new window.chrome.cast.media.LoadRequest(mediaInfo);
            loadRequest.autoplay = true;

            session.loadMedia(loadRequest).then(
                () => { console.log('Chromecast: SUCCESS - Imagen enviada a TV'); },
                (error: any) => {
                    console.error('Chromecast: FAILED - Error en receptor', error);
                    // Si falla por CORS o URL, probamos con la URL hardcodeada de media como último recurso
                    if (finalBaseUrl !== CHROMECAST_BG_URL) {
                        console.log('Chromecast: Reintentando con URL de emergencia...');
                        const fallbackMedia = new window.chrome.cast.media.MediaInfo(CHROMECAST_BG_URL, 'image/png');
                        fallbackMedia.metadata = metadata;
                        session.loadMedia(new window.chrome.cast.media.LoadRequest(fallbackMedia));
                    }
                }
            );
        } catch (e) {
            console.error('Chromecast: Error fatal en MediaInfo constructor', e);
        }
    }, []);

    const initializeCastApi = useCallback(() => {
        console.log('Chromecast: Iniciando initializeCastApi...');

        if (!window.cast?.framework || !window.chrome?.cast) {
            console.error('Chromecast: SDK incompleto detectado en initializeCastApi');
            return;
        }

        try {
            const castContext = window.cast.framework.CastContext.getInstance();

            castContext.setOptions({
                receiverApplicationId: window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
                autoJoinPolicy: window.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
                resumeSavedSession: true
            });

            console.log('Chromecast: CastContext configurado con éxito');
            setIsCastAvailable(true);

            castContext.addEventListener(
                window.cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
                (event: any) => {
                    console.log(`Chromecast: SessionState Changed => ${event.sessionState}`);
                    const sessionState = event.sessionState;

                    if (sessionState === window.cast.framework.SessionState.SESSION_STARTED ||
                        sessionState === window.cast.framework.SessionState.SESSION_RESUMED) {
                        setIsCasting(true);
                        const currentSession = castContext.getCurrentSession();
                        setCastSession(currentSession);

                        // Delay para estabilizar la conexión antes de cargar
                        setTimeout(() => loadDefaultMedia(currentSession), 3000); // 3s para máxima seguridad
                    } else if (sessionState === window.cast.framework.SessionState.SESSION_ENDED) {
                        setIsCasting(false);
                        setCastSession(null);
                    }
                }
            );
        } catch (e) {
            console.error('Chromecast: Error CRÍTICO en setOptions/addEventListener', e);
        }
    }, [loadDefaultMedia]);

    useEffect(() => {
        console.log('Chromecast: Hook mounted, setting up callbacks...');
        // Registro global para el SDK
        window.__onGCastApiAvailable = (isAvailable: boolean) => {
            console.log(`Chromecast: __onGCastApiAvailable callback => ${isAvailable}`);
            if (isAvailable) {
                initializeCastApi();
            }
        };

        // Verificación proactiva por si ya cargó (Next.js client-side)
        if (window.cast?.framework && window.chrome?.cast) {
            console.log('Chromecast: SDK ya presente en el montaje');
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
