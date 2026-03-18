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
    const fetchInitial = async () => {
      try {
        const { data } = await supabase.from('streaming').select('*').eq('id', 25).single();
        if (data) processStreamData(data);
      } catch (err) {}
    };

    const processStreamData = (data: any) => {
      const store = usePlayerStore.getState();
      const isCurrentlyLiveInUI = store.currentVideo?.id === 'live-stream';

      if (data && data.isActive) {
        const sessionKey = data.updatedAt || 'active';
        if (lastStartedAtRef.current !== sessionKey || !isCurrentlyLiveInUI) {
          console.log('[StreamListener Realtime] ⚡ LIVE DETECTED', data.url);
          lastStartedAtRef.current = sessionKey;
          
          const finalUrl = data.url.includes('/live/') 
            ? `https://www.youtube.com/watch?v=${data.url.split('/live/')[1].split('?')[0]}` 
            : data.url;

          const streamMedia: SlideMedia = {
            id: 'live-stream',
            nombre: `EN VIVO - ${data.nombre || 'SALADILLO VIVO'}`,
            url: finalUrl,
            categoria: 'Stream',
            createdAt: data.updatedAt || new Date().toISOString(),
            type: 'video',
            imagen: data.imagen || '',
            novedad: true
          };

          store.playLiveStream(streamMedia);
        }
      } else if (data && !data.isActive && isCurrentlyLiveInUI) {
        console.log('[StreamListener Realtime] ⏹️ LIVE ENDED');
        lastStartedAtRef.current = null;
        store.playNextVideoInQueue();
      }
    };

    fetchInitial();

    // Suscripción Realtime
    const channel = supabase
      .channel('streaming-changes')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'streaming', filter: 'id=eq.25' },
        (payload) => {
          console.log('[StreamListener] Realtime Update received:', payload.new);
          processStreamData(payload.new);
        }
      )
      .subscribe();

    const backupInterval = setInterval(fetchInitial, 30000); // Polling de seguridad cada 30s

    return () => {
      supabase.removeChannel(channel);
      clearInterval(backupInterval);
    };
  }, []);

  return null;
}
