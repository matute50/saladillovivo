'use client';

import React, { useState, useEffect } from 'react';
import ExclusiveVideoCarousel from './ExclusiveVideoCarousel';

const LiveCarouselBlock = ({ streamStatus, upcomingEvents, isMobile }) => {
  const [carouselContent, setCarouselContent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    if (streamStatus?.isActive) {
      setCarouselContent([{
        id: 'live-stream',
        nombre: streamStatus.nombre || 'En Vivo',
        imagen: streamStatus.imagen || 'https://via.placeholder.com/640x360.png?text=En+Vivo',
        isLiveThumbnail: true,
      }]);
    } else if (upcomingEvents) {
      const formattedEvents = upcomingEvents.map(event => ({
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
    setIsLoading(false);
  }, [streamStatus, upcomingEvents]);

  const isStreamActive = streamStatus?.isActive || false;

  return (
    <div className="live-carousel-block w-full">
      <div className="flex items-center justify-center w-full gap-x-3 z-10 mb-2">
        <h2 className="text-2xl font-futura-bold text-foreground text-center">
          Ver en VIVO
        </h2>
      </div>
      <div className="min-h-[126px] flex items-center justify-center">
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