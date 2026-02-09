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
        if (!session) return;

        const origin = window.location.origin;
        const assetPath = '/images/chromecast-bg.png';
        const finalBaseUrl = origin.includes('localhost') ? CHROMECAST_BG_URL : `${origin}${assetPath}`;

        console.log(`Chromecast: Cargando imagen => ${finalBaseUrl}`);
        const urlWithCacheBust = `${finalBaseUrl}?v=${new Date().getTime()}`;

        try {
            if (!window.chrome?.cast?.media) return;

            const mediaInfo = new window.chrome.cast.media.MediaInfo(urlWithCacheBust, 'image/png');
            mediaInfo.streamType = window.chrome.cast.media.StreamType.BUFFERED;

            const metadata = new window.chrome.cast.media.GenericMediaMetadata();
            metadata.metadataType = window.chrome.cast.media.MetadataType.GENERIC;
            metadata.title = "Saladillo Vivo";
            metadata.subtitle = "Streaming";
            metadata.images = [{ url: urlWithCacheBust }];

            mediaInfo.metadata = metadata;

            const loadRequest = new window.chrome.cast.media.LoadRequest(mediaInfo);
            loadRequest.autoplay = true;

            session.loadMedia(loadRequest).then(
                () => { console.log('Chromecast: Media enviada'); },
                (error: any) => {
                    console.error('Chromecast: Error receptor', error);
                    // Fallback directo a media URL si el del origen falla
                    if (finalBaseUrl !== CHROMECAST_BG_URL) {
                        const fallbackMedia = new window.chrome.cast.media.MediaInfo(CHROMECAST_BG_URL, 'image/png');
                        fallbackMedia.metadata = metadata;
                        session.loadMedia(new window.chrome.cast.media.LoadRequest(fallbackMedia));
                    }
                }
            );
        } catch (e) {
            console.error('Chromecast Error:', e);
        }
    }, []);

    const initializeCastApi = useCallback(() => {
        if (isCastAvailable) return;
        if (!window.cast?.framework || !window.chrome?.cast) return;

        console.log('Chromecast: Inicializando API de Cast...');
        try {
            const castContext = window.cast.framework.CastContext.getInstance();
            castContext.setOptions({
                receiverApplicationId: window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
                autoJoinPolicy: window.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
                resumeSavedSession: true
            });

            setIsCastAvailable(true);

            castContext.addEventListener(
                window.cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
                (event: any) => {
                    const sessionState = event.sessionState;
                    console.log('Chromecast State:', sessionState);

                    if (sessionState === window.cast.framework.SessionState.SESSION_STARTED ||
                        sessionState === window.cast.framework.SessionState.SESSION_RESUMED) {
                        setIsCasting(true);
                        const session = castContext.getCurrentSession();
                        setCastSession(session);
                        setTimeout(() => loadDefaultMedia(session), 2500);
                    } else if (sessionState === window.cast.framework.SessionState.SESSION_ENDED) {
                        setIsCasting(false);
                        setCastSession(null);
                    }
                }
            );
        } catch (e) {
            console.error('Chromecast Init Error:', e);
        }
    }, [isCastAvailable, loadDefaultMedia]);

    useEffect(() => {
        // 1. Callback de SDK
        window.__onGCastApiAvailable = (isAvailable: boolean) => {
            if (isAvailable) initializeCastApi();
        };

        // 2. Polling de seguridad por si el SDK carga antes o después de forma asíncrona
        const interval = setInterval(() => {
            if (window.cast?.framework && window.chrome?.cast) {
                initializeCastApi();
                // Si logramos inicializar, mantenemos el interval un par de segundos más o limpiamos
                if (isCastAvailable) clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [initializeCastApi, isCastAvailable]);

    const requestCastSession = useCallback(async () => {
        if (!isCastAvailable) return;
        try {
            await window.cast.framework.CastContext.getInstance().requestSession();
        } catch (e) {
            console.error('Cast Request Error:', e);
        }
    }, [isCastAvailable]);

    return { isCastAvailable, isCasting, requestCastSession, castSession };
}
