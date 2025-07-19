import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import ExclusiveVideoCarousel from '@/components/layout/ExclusiveVideoCarousel';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const NewsAndMostWatchedCarousel = ({ isMobile }) => {
  const [view, setView] = useState('novedades'); // 'novedades' or 'mas_visto'
  const [content, setContent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasNovedades, setHasNovedades] = useState(false);

  const fetchMostWatched = useCallback(async () => {
    const { data: topVideosData, error: rpcError } = await supabase.rpc('get_most_watched_videos_weekly');

    if (rpcError) {
      console.error('Error fetching most watched videos:', rpcError);
      return [];
    }

    if (!topVideosData || topVideosData.length === 0) {
      return [];
    }

    const videoNames = topVideosData.map(v => v.nombre_del_video);
    
    const { data: videosDetails, error: videosError } = await supabase
      .from('videos')
      .select('id, nombre, url, categoria, imagen, createdAt, novedad')
      .in('nombre', videoNames);

    if (videosError) {
      console.error('Error fetching video details for most watched:', videosError);
      return [];
    }

    const orderedVideos = topVideosData.map(topVideo => 
      videosDetails.find(detail => detail.nombre === topVideo.nombre_del_video)
    ).filter(Boolean);

    return orderedVideos;
  }, []);

  const fetchNovedades = useCallback(async () => {
    const { data, error } = await supabase
      .from('videos')
      .select('id, nombre, url, categoria, imagen, createdAt, novedad')
      .eq('novedad', true)
      .order('createdAt', { ascending: false });
    
    if (error) {
      console.error('Error fetching novedades:', error);
      return [];
    }
    return data;
  }, []);

  useEffect(() => {
    const checkNovedades = async () => {
      setIsLoading(true);
      const { count, error } = await supabase
        .from('videos')
        .select('id', { count: 'exact', head: true })
        .eq('novedad', true);

      if (error) {
        console.error('Error checking for novedades:', error);
        setHasNovedades(false);
        setView('mas_visto');
      } else {
        const hasNovs = count > 0;
        setHasNovedades(hasNovs);
        if (!hasNovs) {
          setView('mas_visto');
        } else {
          setView('novedades');
        }
      }
    };
    checkNovedades();
  }, [fetchNovedades, fetchMostWatched]);

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      let data = [];
      if (view === 'novedades') {
        data = await fetchNovedades();
      } else { // 'mas_visto'
        data = await fetchMostWatched();
      }
      setContent(data);
      setIsLoading(false);
    };

    fetchContent();
  }, [view, fetchNovedades, fetchMostWatched]);

  const title = useMemo(() => {
    if (view === 'novedades') return 'Novedades';
    return 'Lo más visto de la Semana';
  }, [view]);

  const handleToggleView = () => {
    if (!hasNovedades) return;
    setView(prev => (prev === 'novedades' ? 'mas_visto' : 'novedades'));
  };
  
  const titleNavButtonClasses = `carousel-nav-button flex-shrink-0 transition-colors text-white rounded-full p-1 ${hasNovedades ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`;

  return (
    <div className="w-full">
      <div className="flex items-center justify-center w-full gap-x-3 mb-[-1.25rem] z-10 relative">
        <button onClick={handleToggleView} disabled={!hasNovedades} className={titleNavButtonClasses} style={{marginRight: '0.5ch'}}>
          <ChevronLeft size={10} className="text-white" />
        </button>
        <h2 className="text-2xl font-futura-bold text-foreground truncate text-center">
          {title}
        </h2>
        <button onClick={handleToggleView} disabled={!hasNovedades} className={titleNavButtonClasses} style={{marginLeft: '0.5ch'}}>
          <ChevronRight size={10} className="text-white" />
        </button>
      </div>
      <div className="min-h-[var(--video-carousel-fixed-height)] flex items-center justify-center">
        <ExclusiveVideoCarousel
          videos={content}
          isLoading={isLoading}
          carouselId={`dynamic-carousel-${view}`}
          isMobile={isMobile}
          categoryName={title}
        />
      </div>
    </div>
  );
};

export default NewsAndMostWatchedCarousel;