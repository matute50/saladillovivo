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

    const loadDefaultMedia = useCallback((session: any) => {
        if (!session) {
            console.error('Chromecast: No hay sesión activa para cargar media.');
            return;
        }

        const origin = window.location.origin;
        const assetPath = '/images/chromecast-bg.png';
        // Priorizar el host de media si no es localhost, sino usar el actual
        const finalBaseUrl = origin.includes('localhost') ? CHROMECAST_BG_URL : `${origin}${assetPath}`;

        console.log(`Chromecast: Intentando cargar imagen en TV => ${finalBaseUrl}`);
        const urlWithCacheBust = `${finalBaseUrl}?v=${new Date().getTime()}`;

        try {
            if (!window.chrome || !window.chrome.cast || !window.chrome.cast.media) {
                console.error('Chromecast: chrome.cast.media no está disponible');
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
                () => { console.log('Chromecast: ¡Comando enviado! La TV debería estar mostrando el logo.'); },
                (error: any) => {
                    console.error('Chromecast: Error en el receptor al intentar cargar la imagen.', error);
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
            console.error('Chromecast: Error fatal en la construcción del objeto MediaInfo', e);
        }
    }, []);

    const initializeCastApi = useCallback(() => {
        if (!window.cast || !window.cast.framework) {
            console.warn('Chromecast: SDK no detectado aún en initializeCastApi');
            return;
        }

        console.log('Chromecast: Inicializando CastContext...');
        const castContext = window.cast.framework.CastContext.getInstance();

        try {
            castContext.setOptions({
                receiverApplicationId: window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
                autoJoinPolicy: window.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
                resumeSavedSession: true
            });

            setIsCastAvailable(true);

            castContext.addEventListener(
                window.cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
                (event: any) => {
                    console.log(`Chromecast: Cambio de estado => ${event.sessionState}`);
                    const sessionState = event.sessionState;

                    if (sessionState === window.cast.framework.SessionState.SESSION_STARTED ||
                        sessionState === window.cast.framework.SessionState.SESSION_RESUMED) {
                        setIsCasting(true);
                        const currentSession = castContext.getCurrentSession();
                        setCastSession(currentSession);

                        // Delay para estabilizar la conexión antes de cargar
                        setTimeout(() => loadDefaultMedia(currentSession), 2000);
                    } else if (sessionState === window.cast.framework.SessionState.SESSION_ENDED) {
                        setIsCasting(false);
                        setCastSession(null);
                    }
                }
            );
        } catch (e) {
            console.error('Chromecast: Error inicializando CastContext', e);
        }
    }, [loadDefaultMedia]);

    useEffect(() => {
        // Registro global para el SDK
        window.__onGCastApiAvailable = (isAvailable: boolean) => {
            console.log(`Chromecast: SDK reporta disponibilidad => ${isAvailable}`);
            if (isAvailable) {
                initializeCastApi();
            }
        };

        // Verificación proactiva por si ya cargó (Next.js client-side)
        if (window.chrome && window.chrome.cast && window.cast && window.cast.framework) {
            console.log('Chromecast: SDK ya presente en el montaje del hook');
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
