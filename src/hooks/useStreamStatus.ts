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
  const lastPlayedSvIdRef = useRef(null);
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

  const fetchRandomSvVideo = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('id, url, nombre')
        .eq('categoria', 'SV')
        .range(0, 28); 

      if (error) throw error;
      if (!data || data.length === 0) throw new Error("No SV videos found");

      let availableVideos = data.filter(v => v.id !== lastPlayedSvIdRef.current);
      if (availableVideos.length === 0) {
        availableVideos = data; 
      }
      
      const randomIndex = Math.floor(Math.random() * availableVideos.length);
      const randomVideo = availableVideos[randomIndex];
      lastPlayedSvIdRef.current = randomVideo.id;

      return {
        url: randomVideo.url,
        title: randomVideo.nombre,
        type: 'video',
        isUserSelected: false,
        category: 'SV',
      };
    } catch (error) {
        console.error('Error fetching SV videos:', error);
        toast({
            title: "Error de Red",
            description: "No se pudieron cargar los videos de respaldo. Revisa tu conexión o desactiva bloqueadores de anuncios.",
            variant: "destructive"
        });
        return null;
    }
  }, [toast]);

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
          }, true);
        } else {
          const svVideo = await fetchRandomSvVideo();
          if (svVideo) {
            playMedia(svVideo, true);
          }
        }
      }
    };
    initialCheck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
    }

    checkIntervalRef.current = setInterval(async () => {
      if (!isMounted.current) return;
      const newStatus = await checkStreamStatus();
      if (!isMounted.current) return;

      const isWatchingSv = playingMedia?.category === 'SV';
      const isWatchingUserSelected = playingMedia?.isUserSelected;

      if (newStatus.isActive && playingMedia?.type !== 'stream') {
        if (isWatchingSv) {
          playMedia({
            url: newStatus.url,
            title: newStatus.nombre,
            type: 'stream',
            isUserSelected: false,
            category: 'EN VIVO',
          });
        }
      }

      if (!newStatus.isActive && playingMedia?.type === 'stream') {
        const svVideo = await fetchRandomSvVideo();
        if (svVideo) playMedia(svVideo);
      }
      
      if (isWatchingUserSelected && !isPlaying && playingMedia) {
         if (newStatus.isActive) {
            playMedia({
                url: newStatus.url,
                title: newStatus.nombre,
                type: 'stream',
                isUserSelected: false,
                category: 'EN VIVO',
            });
         } else {
            const svVideo = await fetchRandomSvVideo();
            if (svVideo) playMedia(svVideo);
         }
      }

    }, 15000);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [checkStreamStatus, fetchRandomSvVideo, playMedia, playingMedia, isPlaying]);

  return streamStatus;
};