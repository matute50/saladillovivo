'use client';

import React, { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { usePlayerStore } from '@/store/usePlayerStore';
import { SlideMedia } from '@/lib/types';

const LIVE_THRESHOLD_MS = 10000; // 10 segundos de cortesía

export default function StreamListener() {
  const isStreamingRef = useRef(false);
  const lastStartedAtRef = useRef<string | null>(null);

  useEffect(() => {
    const pollStreaming = async () => {
      try {
        console.log('[StreamListener] Polling Supabase...');
        const { data: currentStream, error } = await supabase
          .from('streaming_config')
          .select('stream_url, title, started_at, is_active')
          .eq('is_active', true)
          .order('started_at', { ascending: false })
          .limit(1);

        const store = usePlayerStore.getState();
        const isCurrentlyLiveInUI = store.currentVideo?.id === 'live-stream';

        // MODO MANUAL DIRECTO (STUDIO PRO):
        // Confiamos 100% en la base de datos (is_active). 
        // Si el jefe apaga el switch, el reproductor vuelve a videos. 
        // Si el jefe prende el switch, el reproductor va al vivo.

        if (!error && currentStream && currentStream.is_active) {
          const sessionKey = currentStream.started_at || 'active';
          
          // Entrar al vivo SOLO si es una sesión nueva o no estamos en vivo todavía
          if (lastStartedAtRef.current !== sessionKey || !isCurrentlyLiveInUI) {
            console.log('[StreamListener] ⚡ ACTIVE STREAM detected in Studio Pro. Switching to Live.');
            
            lastStartedAtRef.current = sessionKey;
            isStreamingRef.current = true;

            const streamMedia: SlideMedia = {
              id: 'live-stream',
              nombre: `EN VIVO - ${currentStream.title || 'SALADILLO VIVO'}`,
              url: currentStream.stream_url,
              categoria: 'Stream',
              createdAt: currentStream.started_at || new Date().toISOString(),
              type: 'video',
              imagen: '',
              novedad: true
            };

            store.playLiveStream(streamMedia);
          }
        } 
        else {
          // Si no hay directo activo en la DB pero el UI sigue en vivo, volvemos a videos
          if (isCurrentlyLiveInUI) {
            console.log('[StreamListener] ⏹️ Stream deactivated in Studio Pro. Reverting to Auto-Playlist.');
            isStreamingRef.current = false;
            lastStartedAtRef.current = null;
            store.playNextVideoInQueue();
          }
        }
      } catch (err) {
        console.error('[StreamListener] Error polling:', err);
      }
    };

    const interval = setInterval(pollStreaming, 5000);
    pollStreaming(); // Initial check

    return () => clearInterval(interval);
  }, []);

  return null;
}
