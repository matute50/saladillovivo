import React, { useState, useEffect, useMemo } from 'react';
import ExclusiveVideoCarousel from '@/components/layout/ExclusiveVideoCarousel';
import { supabase } from '@/lib/supabaseClient';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaPlayer } from '@/context/MediaPlayerContext';
import { useNews } from '@/context/NewsContext';

const DemandCarouselBlock = ({ 
  blockNumber, 
  isSelectable = false, 
  selectableCategories = [], 
  categoryMap = {},
  categoryIndex = 0,
  onCategoryChange = () => {},
  isMobile = false,
  isSearchBlock = false,
  searchResults = null,
  isSearching = false
}) => {
  const { streamStatus } = useMediaPlayer();
  const { newsLoading } = useNews();
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFading, setIsFading] = useState(false);

  const selectedFriendlyCategory = useMemo(() => {
    if (isSearchBlock && searchResults !== null) return "Tu Búsqueda";
    return selectableCategories[categoryIndex] || '';
  }, [categoryIndex, selectableCategories, isSearchBlock, searchResults]);

  const selectedDbCategory = useMemo(() => {
    const key = selectableCategories[categoryIndex];
    return categoryMap[key] || null;
  }, [categoryIndex, selectableCategories, categoryMap]);
  
  useEffect(() => {
    const fetchContent = async () => {
      setIsFading(true);
      setIsLoading(true);

      let newVideos = [];

      const category = selectedFriendlyCategory;
      
      if (isSearchBlock && searchResults !== null) {
        newVideos = searchResults;
      } else if (category === 'Ver en VIVO') {
          if (streamStatus.isActive) {
            newVideos = [{ id: 'live-stream', nombre: streamStatus.nombre || 'En Vivo', imagen: streamStatus.imagen, isLiveThumbnail: true }];
          } else {
             const today = new Date();
             const sevenDaysLater = new Date(today);
             sevenDaysLater.setDate(today.getDate() + 7);

             const { data, error } = await supabase
               .from('eventos')
               .select('id, nombre, fecha, hora, imagen')
               .gte('fecha', today.toISOString().split('T')[0])
               .lte('fecha', sevenDaysLater.toISOString().split('T')[0])
               .order('fecha', { ascending: true }).order('hora', { ascending: true });
             
             if (error) console.error('Error fetching upcoming events:', error);
             else newVideos = (data || []).map(event => ({ id: `event-${event.id}`, nombre: new Date(event.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }), imagen: event.imagen, isEvent: true }));
          }
      } else if (category === 'Últimas Noticias') {
          const { data, error } = await supabase
            .from('videos')
            .select('id, nombre, url, categoria, imagen, createdAt')
            .eq('categoria', 'noticias')
            .order('createdAt', { ascending: false });

          if (error) console.error('Error fetching latest news videos:', error);
          else {
            newVideos = data || [];
            if (newVideos.length > 0) {
              const latestVideo = newVideos.shift();
              newVideos.unshift(latestVideo);
            }
          }
      } else if (category === 'Novedades') {
          const { data, error } = await supabase.from('videos').select('id, nombre, url, categoria, imagen, createdAt, novedad').eq('novedad', true).order('createdAt', { ascending: false });
          if(error) console.error(error); else newVideos = data;
      } else if (category === 'Lo más visto de la Semana') {
          const { data: topVideosData, error: rpcError } = await supabase.rpc('get_most_watched_videos_weekly');
          if (rpcError) {
              console.error('Error fetching most watched videos:', rpcError);
          } else if (topVideosData && topVideosData.length > 0) {
              const videoNames = topVideosData.map(v => v.nombre_del_video);
              const { data: videosDetails, error: videosError } = await supabase
                  .from('videos')
                  .select('id, nombre, url, categoria, imagen, createdAt, novedad')
                  .in('nombre', videoNames);
              if (videosError) {
                  console.error('Error fetching video details for most watched:', videosError);
              } else {
                  newVideos = topVideosData.map(topVideo => 
                      videosDetails.find(detail => detail.nombre === topVideo.nombre_del_video)
                  ).filter(Boolean);
              }
          }
      } else if (selectedDbCategory) {
        const { data, error } = await supabase
          .from('videos')
          .select('id, nombre, url, categoria, imagen, createdAt')
          .eq('categoria', selectedDbCategory)
          .order('createdAt', { ascending: false });

        if (error) console.error('Error fetching videos:', error);
        else newVideos = data || [];
      }
      
      setTimeout(() => {
        setVideos(newVideos);
        setIsLoading(false);
        setIsFading(false);
      }, 250);
    };

    if (!newsLoading) {
        fetchContent();
    }
  }, [selectedFriendlyCategory, selectedDbCategory, isSearchBlock, searchResults, streamStatus, newsLoading]);

  const handleCategoryChange = (direction) => {
    onCategoryChange(direction);
  };
  
  const titleNavButtonClasses = "carousel-nav-button flex-shrink-0 transition-colors text-white rounded-full p-1 cursor-pointer dark:active:bg-[#6699ff] dark:active:text-white";
  const titleStyles = `titulo-${blockNumber} text-2xl font-futura-bold text-foreground truncate text-center`;

  const titleContainerClasses = isMobile
    ? 'flex items-center justify-center w-full gap-x-3 z-10'
    : 'flex items-center justify-center w-full gap-x-3 z-10 transform translate-y-0';


  if (isSearchBlock && (searchResults === null || searchResults.length === 0)) {
    return null;
  }

  return (
    <div className={`demand-block demand-block-${blockNumber} flex flex-col items-start w-full relative`}>
      <div className={titleContainerClasses}>
          <button onClick={() => handleCategoryChange(-1)} className={titleNavButtonClasses} style={{marginRight: '0.5ch'}}>
            <ChevronLeft size={isMobile ? 13 : 10} className="text-white" />
          </button>
          <h2 className={titleStyles}>
            {selectedFriendlyCategory}
          </h2>
          <button onClick={() => handleCategoryChange(1)} className={titleNavButtonClasses} style={{marginLeft: '0.5ch'}}>
            <ChevronRight size={isMobile ? 13 : 10} className="text-white" />
          </button>
      </div>
      <div className={`carrusel-${blockNumber} w-full flex items-center justify-center min-h-[var(--video-carousel-fixed-height)]`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedFriendlyCategory}
            initial={{ opacity: 0 }}
            animate={{ opacity: isFading ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full"
          >
            <ExclusiveVideoCarousel
              videos={videos}
              isLoading={isLoading}
              carouselId={`carousel-demand-${blockNumber}-${selectedDbCategory ? selectedDbCategory.replace(/\s+/g, '-') : ''}`}
              isMobile={isMobile}
              categoryName={selectedFriendlyCategory}
              isLive={selectedFriendlyCategory === 'Ver en VIVO' && streamStatus.isActive}
              isEventCarousel={selectedFriendlyCategory === 'Ver en VIVO' && !streamStatus.isActive && videos.some(v => v.isEvent)}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DemandCarouselBlock;