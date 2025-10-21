// @ts-nocheck
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useStreamStatus = ({ playMedia, playingMedia, isPlaying }) => {
  const [streamStatus, setStreamStatus] = useState({
    isActive: false,
    isLoaded: false,
    url: null,
    nombre: null,
    imagen: null,
  });
  const checkIntervalRef = useRef(null);
  const isMounted = useRef(true);
  const { toast } = useToast();

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, []);

  const checkStreamStatus = useCallback(async () => {
    try {
      const { data: streamControl, error: controlError } = await supabase
        .from('stream-videos')
        .select('stream')
        .single();

      if (controlError) throw controlError;

      let newStatus = { isLoaded: true, isActive: false, url: null, nombre: null, imagen: null };

      if (streamControl.stream) {
        const { data: streamData, error: streamError } = await supabase
          .from('streaming')
          .select('url, nombre, imagen')
          .eq('isActive', true)
          .single();
        
        if (streamError && streamError.code !== 'PGRST116') { // Ignore 'no rows found'
          throw streamError;
        }

        if (streamData && streamData.url) {
          newStatus = {
            isLoaded: true,
            isActive: true,
            url: streamData.url,
            nombre: streamData.nombre,
            imagen: streamData.imagen,
          };
        }
      }
      
      if (isMounted.current) {
        setStreamStatus(prevStatus => {
          if (JSON.stringify(prevStatus) !== JSON.stringify(newStatus)) {
            return newStatus;
          }
          return prevStatus;
        });
      }
      return newStatus;
    } catch (error) {
      console.error('Error checking stream status:', error);
      if (error.message.includes('fetch')) {
         toast({
            title: "Error de Conexión",
            description: "No se pudo verificar el estado del streaming. Revisa tu conexión o desactiva bloqueadores de anuncios.",
            variant: "destructive"
        });
      }
      const errorStatus = { isLoaded: true, isActive: false, url: null, nombre: null, imagen: null };
      if (isMounted.current) {
        setStreamStatus(errorStatus);
      }
      return errorStatus;
    }
  }, [toast]);

  useEffect(() => {
    const initialCheck = async () => {
      const status = await checkStreamStatus();
      if (isMounted.current) {
        if (status.isActive) {
          playMedia({
            url: status.url,
            title: status.nombre,
            type: 'stream',
            isUserSelected: false,
            category: 'EN VIVO',
          }, true); // Pass true for isAutoPlay
        }
        // If stream is not active, the main HomePageClient will trigger the random video loop.
      }
    };
    initialCheck();
  }, [checkStreamStatus, playMedia]);

  useEffect(() => {
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
    }

    checkIntervalRef.current = setInterval(async () => {
      if (!isMounted.current) return;
      const newStatus = await checkStreamStatus();
      if (!isMounted.current) return;

      // If live stream becomes active and we are not currently watching a stream, switch to it.
      if (newStatus.isActive && playingMedia?.type !== 'stream') {
        playMedia({
          url: newStatus.url,
          title: newStatus.nombre,
          type: 'stream',
          isUserSelected: false,
          category: 'EN VIVO',
        }, true); // Pass true for isAutoPlay
      }
      // If live stream goes offline, the handleEnded in usePlaybackLogic will take over.
      // If a user-selected video ends, handleEnded in usePlaybackLogic will take over.

    }, 15000);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [checkStreamStatus, playMedia, playingMedia]);

  return streamStatus;
};