
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import ExclusiveVideoCarousel from '@/components/layout/ExclusiveVideoCarousel';
import { useMediaPlayer } from '@/context/MediaPlayerContext';

const LiveCarouselBlock = ({ isMobile }) => {
  const { streamStatus } = useMediaPlayer();
  const [carouselContent, setCarouselContent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLiveContent = async () => {
      if (!streamStatus || !streamStatus.isLoaded) return;

      setIsLoading(true);

      if (streamStatus.isActive) {
        setCarouselContent([{
          id: 'live-stream',
          nombre: streamStatus.nombre || 'En Vivo',
          imagen: streamStatus.imagen || 'https://via.placeholder.com/640x360.png?text=En+Vivo',
          isLiveThumbnail: true,
        }]);
      } else {
        const today = new Date();
        const sevenDaysLater = new Date(today);
        sevenDaysLater.setDate(today.getDate() + 7);

        const { data, error } = await supabase
          .from('eventos')
          .select('id, nombre, fecha, hora, imagen')
          .gte('fecha', today.toISOString().split('T')[0])
          .lte('fecha', sevenDaysLater.toISOString().split('T')[0])
          .order('fecha', { ascending: true })
          .order('hora', { ascending: true });

        if (error) {
          console.error('Error fetching upcoming events:', error);
          setCarouselContent([]);
        } else {
          const formattedEvents = data.map(event => ({
            id: `event-${event.id}`,
            nombre: new Date(event.fecha).toLocaleDateString('es-AR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              timeZone: 'UTC'
            }),
            imagen: event.imagen,
            isEvent: true,
          }));
          setCarouselContent(formattedEvents);
        }
      }
      setIsLoading(false);
    };

    fetchLiveContent();
  }, [streamStatus]);

  const isStreamActive = streamStatus ? streamStatus.isActive : false;

  const titleContainerClasses = isMobile
    ? 'flex items-center justify-center w-full gap-x-3 z-10'
    : 'flex items-center justify-center w-full gap-x-3 z-10 transform translate-y-0';

  return (
    <div className="live-carousel-block w-full">
      <div className={titleContainerClasses}>
        <h2 className="text-2xl font-futura-bold text-foreground text-center">
          Ver en VIVO
        </h2>
      </div>
      <div className="min-h-[var(--video-carousel-fixed-height)] flex items-center justify-center">
        <ExclusiveVideoCarousel
          videos={carouselContent}
          isLoading={isLoading}
          carouselId="live-carousel"
          isMobile={isMobile}
          isLive={isStreamActive}
          isEventCarousel={!isStreamActive}
          categoryName="Ver en VIVO"
        />
      </div>
    </div>
  );
};

export default LiveCarouselBlock;
