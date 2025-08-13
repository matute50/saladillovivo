import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import ExclusiveVideoCarousel from '@/components/layout/ExclusiveVideoCarousel';

const NovedadesCarousel = ({ isMobile }) => {
  const [content, setContent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasNovedades, setHasNovedades] = useState(false);

  const fetchNovedades = useCallback(async () => {
    const { data, error, count } = await supabase
      .from('videos')
      .select('id, nombre, url, categoria, imagen, createdAt, novedad', { count: 'exact' })
      .not('categoria', 'eq', 'Noticias')
      .order('createdAt', { ascending: false })
      .limit(3);
    
    if (error) {
      console.error('Error fetching novedades:', error);
      setContent([]);
      setHasNovedades(false);
    } else {
      setContent(data);
      setHasNovedades(count > 0);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchNovedades();
  }, [fetchNovedades]);

  const titleContainerClasses = isMobile
    ? 'flex items-center justify-center w-full gap-x-3 z-10'
    : 'flex items-center justify-center w-full gap-x-3 z-10 transform translate-y-0';

  if (!hasNovedades) {
    return null;
  }

  return (
    <div className="w-full">
      <div className={titleContainerClasses}>
        <h2 className="text-2xl font-futura-bold text-foreground truncate text-center">
          Novedades
        </h2>
      </div>
      <div className="flex items-center justify-center min-h-[var(--video-carousel-fixed-height)]">
        <ExclusiveVideoCarousel
          videos={content}
          isLoading={isLoading}
          carouselId="novedades-carousel"
          isMobile={isMobile}
          categoryName="Novedades"
        />
      </div>
    </div>
  );
};

export default NovedadesCarousel;