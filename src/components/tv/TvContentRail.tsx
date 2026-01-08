'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useNews } from '@/context/NewsContext';
import CategoryCycler from '@/components/layout/CategoryCycler';
import { useMediaPlayer } from '@/context/MediaPlayerContext';
import { useNewsPlayer } from '@/context/NewsPlayerContext';
import { Video, Article } from '@/lib/types';
import { categoryMappings } from '@/lib/categoryMappings';

interface TvContentRailProps {
  searchResults: Video[];
  isSearching: boolean;
  searchLoading: boolean;
}

const TvContentRail: React.FC<TvContentRailProps> = ({ searchResults, isSearching, searchLoading }) => {
  const { galleryVideos, allNews, isLoading: isLoadingNews } = useNews();
  const { playSpecificVideo, playTemporaryVideo, setIsPlaying } = useMediaPlayer();
  const { playSlide } = useNewsPlayer();

  const [categoryIndex, setCategoryIndex] = useState(0);

  const availableCategoryMappings = useMemo(() => {
    if (isLoadingNews) return [];
    
    return categoryMappings.filter(category => {
      // Excluir explícitamente la categoría "Noticias (Slides)" del modo TV
      if (category.display === 'Noticias (Slides)') return false;
      
      if (category.dbCategory === '__NOTICIAS__') return allNews.length > 0;
      if (category.dbCategory === '__NOVEDADES__') return galleryVideos.some(video => video.novedad === true);
      
      const dbCategories = Array.isArray(category.dbCategory) ? category.dbCategory : [category.dbCategory];
      return galleryVideos.some(video => dbCategories.includes(video.categoria));
    });
  }, [galleryVideos, allNews, isLoadingNews]);

  useEffect(() => {
    if (availableCategoryMappings.length > 0) {
      const newsIndex = availableCategoryMappings.findIndex(c => c.dbCategory === '__NOTICIAS__');
      setCategoryIndex(newsIndex !== -1 ? newsIndex : 0);
    }
  }, [availableCategoryMappings]);

  const handleNextCategory = useCallback(() => {
    setCategoryIndex(prev => (prev + 1) % availableCategoryMappings.length);
  }, [availableCategoryMappings.length]);

  const handlePrevCategory = useCallback(() => {
    setCategoryIndex(prev => (prev - 1 + availableCategoryMappings.length) % availableCategoryMappings.length);
  }, [availableCategoryMappings.length]);

  // Manejo de Clics
  const handleCardClick = useCallback((item: Video | Article) => {
    const isArticle = 'slug' in item || 'titulo' in item || 'url_slide' in item;

    if (isArticle) {
        const newsItem = item as any;
        const title = newsItem.title || newsItem.titulo;
        const imageUrl = newsItem.imageUrl || newsItem.image_url || newsItem.imagen || '/placeholder.png';
        const urlSlide = newsItem.url_slide || newsItem.urlSlide;
        const duration = newsItem.animation_duration || 15;
        const isHtmlSlide = urlSlide && urlSlide.endsWith('.html');

        if (isHtmlSlide) {
            // Pausar video de fondo y reproducir slide
            setIsPlaying(false);
            // AQUÍ PASAMOS EL TÍTULO
            playSlide({ url: urlSlide, type: 'html', duration, title });
        } else if (urlSlide) {
             // Video temporal
             playTemporaryVideo({
                id: (newsItem.id || Date.now()).toString(),
                type: 'video',
                url: urlSlide, 
                nombre: title,
                categoria: 'Noticias',
                imagen: imageUrl,
                duration: duration,
                createdAt: new Date().toISOString()
             });
        }
    } else {
        playSpecificVideo(item as Video);
    }
  }, [playSpecificVideo, playTemporaryVideo, playSlide, setIsPlaying]);

  const processThumbnails = useCallback((items: any[]) => {
    return items.map(item => {
      let thumb = item.imageUrl || item.image_url || item.imagen || '/placeholder.png';
      if ((thumb === '/placeholder.png' || !thumb) && item.url) {
         const match = item.url.match(/(?:youtu\.be\/|youtube\.com\/.*v=)([^&]+)/);
         if (match && match[1]) thumb = `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
      }
      return { ...item, imageUrl: thumb, imagen: thumb };
    });
  }, []);

  if (isLoadingNews || availableCategoryMappings.length === 0) {
    return <div className="text-white p-4 bg-white/10 rounded-lg flex justify-center items-center h-[126px]">Cargando...</div>;
  }

  // --- RENDERIZADO ---
  if (isSearching) {
    if (searchLoading) return <div className="text-white p-4">Buscando...</div>;
    const processed = processThumbnails(searchResults);
    return (
      <div className="w-full max-w-screen-xl mx-auto px-4">
        <CategoryCycler 
          allVideos={processed} 
          activeCategory={{ display: 'Tu Búsqueda', dbCategory: 'search_results' }} 
          onNext={() => {}} 
          onPrev={() => {}} 
          onCardClick={handleCardClick}
          isMobile={false}
          isSearchResult={true}
          instanceId="search-carousel"
        />
      </div>
    );
  }
  
  const activeCategory = availableCategoryMappings[categoryIndex];
  const rawItems = activeCategory.dbCategory === '__NOTICIAS__' ? allNews : galleryVideos;
  const processedItems = processThumbnails(rawItems);

  return (
    <div className="w-full max-w-screen-xl mx-auto px-4">
      <CategoryCycler 
        allVideos={processedItems} 
        activeCategory={activeCategory} 
        onNext={handleNextCategory}
        onPrev={handlePrevCategory}
        onCardClick={handleCardClick}
        isMobile={false} 
        instanceId="tv-carousel"
      />
    </div>
  );
};

export default TvContentRail;