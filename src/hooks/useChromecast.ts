'use client';

import { useState, useEffect, useCallback } from 'react';

declare global {
    interface Window {
        __onGCastApiAvailable: (isAvailable: boolean) => void;
        chrome: any;
        cast: any;
    }
}

const DEFAULT_BG = 'https://media.saladillovivo.com.ar/images/chromecast-bg.png';

export function useChromecast() {
    const [isCastAvailable, setIsCastAvailable] = useState(false);
    const [isCasting, setIsCasting] = useState(false);
    const [castSession, setCastSession] = useState<any>(null);

    const loadMedia = useCallback((session: any) => {
        if (!session) return;

        try {
            const origin = window.location.origin;
            const assetUrl = origin.includes('localhost') ? DEFAULT_BG : `${origin}/images/chromecast-bg.png`;
            const finalUrl = `${assetUrl}?v=${Date.now()}`;

            console.log('Chromecast: Sending Media ->', finalUrl);

            const mediaInfo = new window.chrome.cast.media.MediaInfo(finalUrl, 'image/png');
            mediaInfo.streamType = window.chrome.cast.media.StreamType.BUFFERED;
            const metadata = new window.chrome.cast.media.GenericMediaMetadata();
            metadata.title = "Saladillo Vivo";
            metadata.images = [{ url: finalUrl }];
            mediaInfo.metadata = metadata;

            const request = new window.chrome.cast.media.LoadRequest(mediaInfo);
            session.loadMedia(request).then(
                () => console.log('Chromecast: Load Success'),
                (err: any) => {
                    console.error('Chromecast: Load Failed, trying fallback...', err);
                    const fallback = new window.chrome.cast.media.MediaInfo(DEFAULT_BG, 'image/png');
                    fallback.metadata = metadata;
                    session.loadMedia(new window.chrome.cast.media.LoadRequest(fallback));
                }
            );
        } catch (e) {
            console.error('Chromecast Error:', e);
        }
    }, []);

    const init = useCallback(() => {
        if (typeof window === 'undefined' || !window.cast?.framework || !window.chrome?.cast) return;
        if (window.cast.framework.CastContext.getInstance().getCastState() !== 'NO_DEVICES_AVAILABLE') {
            // Already initialized logic
        }

        try {
            const context = window.cast.framework.CastContext.getInstance();
            context.setOptions({
                receiverApplicationId: window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
                autoJoinPolicy: window.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
            });

            setIsCastAvailable(true);
            console.log('Chromecast: API Initialized');

            context.addEventListener(window.cast.framework.CastContextEventType.SESSION_STATE_CHANGED, (event: any) => {
                const s = event.sessionState;
                console.log('Chromecast Session:', s);
                if (s === 'SESSION_STARTED' || s === 'SESSION_RESUMED') {
                    setIsCasting(true);
                    const session = context.getCurrentSession();
                    setCastSession(session);
                    setTimeout(() => loadMedia(session), 2000);
                } else if (s === 'SESSION_ENDED') {
                    setIsCasting(false);
                }
            });
        } catch (e) {
            console.error('Chromecast Init Error:', e);
        }
    }, [loadMedia]);

    useEffect(() => {
        window.__onGCastApiAvailable = (isAvailable) => {
            if (isAvailable) init();
        };

        const check = setInterval(() => {
            if (window.cast?.framework && window.chrome?.cast) {
                init();
                clearInterval(check);
            }
        }, 1000);

        return () => clearInterval(check);
    }, [init]);

    const requestSession = useCallback(async () => {
        if (!isCastAvailable) return;
        try {
            await window.cast.framework.CastContext.getInstance().requestSession();
        } catch (e) {
            console.error('Cast Error:', e);
        }
    }, [isCastAvailable]);

    return { isCastAvailable, isCasting, requestCastSession: requestSession, castSession };
}
