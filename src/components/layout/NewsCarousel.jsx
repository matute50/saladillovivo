import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import ExclusiveVideoCarousel from '@/components/layout/ExclusiveVideoCarousel';

const NewsCarousel = ({ isMobile }) => {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasNews, setHasNews] = useState(false);

  const fetchNews = useCallback(async () => {
    setIsLoading(true);
    const { data, error, count } = await supabase
      .from('videos')
      .select('id, nombre, url, categoria, imagen, createdAt', { count: 'exact' })
      .eq('categoria', 'Noticias')
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error fetching news:', error);
      setNews([]);
      setHasNews(false);
    } else {
      setNews(data);
      setHasNews(count > 0);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  if (!hasNews) {
    return null;
  }

  const titleContainerClasses = isMobile
    ? 'flex items-center justify-center w-full gap-x-3 z-10'
    : 'flex items-center justify-center w-full gap-x-3 z-10 transform translate-y-0';

  return (
    <div className="w-full">
      <div className={titleContainerClasses}>
        <h2 className="text-2xl font-futura-bold text-foreground truncate text-center">
          Últimas Noticias
        </h2>
      </div>
      <div className="flex items-center justify-center min-h-[var(--video-carousel-fixed-height)]">
        <ExclusiveVideoCarousel
          videos={news}
          isLoading={isLoading}
          carouselId="news-carousel"
          isMobile={isMobile}
          categoryName="Últimas Noticias"
        />
      </div>
    </div>
  );
};

export default NewsCarousel;
