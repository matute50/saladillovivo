'use client';

import { motion } from "framer-motion";


import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useNewsStore } from '@/store/useNewsStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useNewsPlayerStore } from '@/store/useNewsPlayerStore';
import { useVolumeStore } from '@/store/useVolumeStore';
import CategoryCycler from '@/components/layout/CategoryCycler';
import { Video, Article } from '@/lib/types';
import { categoryMappings, type CategoryMapping } from '@/lib/categoryMappings';

const TRANSPARENT_PNG_DATA_URI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

interface TvContentRailProps {
  searchResults: Video[];
  isSearching: boolean;
  searchLoading: boolean;
  initialCategory?: CategoryMapping; // Nuevo prop para la categoría inicial
  isVisible?: boolean; // Nuevo prop para controlar la visibilidad
}

const TvContentRail: React.FC<TvContentRailProps> = ({ searchResults, isSearching, searchLoading, initialCategory, isVisible = true }) => {
  const { galleryVideos, allNews, isLoading: isLoadingNews } = useNewsStore();
  const { playSpecificVideo, playTemporaryVideo, setIsPlaying } = usePlayerStore();
  const { playSlide } = useNewsPlayerStore();
  const { volume, setVolume } = useVolumeStore();

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
      if (initialCategory) {
        const initialIndex = availableCategoryMappings.findIndex(
          (cat) =>
            cat.display === initialCategory.display &&
            JSON.stringify(cat.dbCategory) === JSON.stringify(initialCategory.dbCategory)
        );
        if (initialIndex !== -1) {
          setCategoryIndex(initialIndex);
        } else {
          // Fallback if initialCategory is not found in available mappings
          const newsIndex = availableCategoryMappings.findIndex(c => c.dbCategory === '__NOTICIAS__');
          setCategoryIndex(newsIndex !== -1 ? newsIndex : 0);
        }
      } else {
        const newsIndex = availableCategoryMappings.findIndex(c => c.dbCategory === '__NOTICIAS__');
        setCategoryIndex(newsIndex !== -1 ? newsIndex : 0);
      }
    }
  }, [availableCategoryMappings, initialCategory]); // Add initialCategory to dependencies

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
      const imageUrl = newsItem.imageUrl || newsItem.image_url || newsItem.imagen || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
      const urlSlide = newsItem.url_slide || newsItem.urlSlide;
      const audioUrl = newsItem.audio_url || newsItem.audioUrl;
      const duration = newsItem.animation_duration || 15;
      const isHtmlSlide = urlSlide && urlSlide.endsWith('.html');

      if (isHtmlSlide) {
        // Pausar video de fondo y reproducir slide
        setIsPlaying(false);
        // AQUÍ PASAMOS EL TÍTULO Y EL AUDIO
        playSlide({ url: urlSlide, type: 'html', duration, title, audioUrl });
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
          createdAt: new Date().toISOString(),
          novedad: false // Added to satisfy SlideMedia interface
        });
      }
    } else {
      playSpecificVideo(item as Video, volume, setVolume);
    }
  }, [playSpecificVideo, playTemporaryVideo, playSlide, setIsPlaying, volume, setVolume]);

  const processThumbnails = useCallback((items: any[]) => {
    return items.map(item => {
      let thumb = item.imageUrl || item.image_url || item.imagen || TRANSPARENT_PNG_DATA_URI;
      if ((thumb === TRANSPARENT_PNG_DATA_URI || !thumb) && item.url) {
        const match = item.url.match(/(?:youtu\.be\/|youtube\.com\/.*v=)([^&]+)/);
        if (match && match[1]) thumb = `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
      }

      // Map title/titulo to nombre for ExclusiveVideoCarousel
      const nombre = item.nombre || item.title || item.titulo || '';

      return { ...item, imageUrl: thumb, imagen: thumb, nombre };
    });
  }, []); // galleryVideos removed from dependencies as it's not directly used inside

  const processedAllNews = useMemo(() => processThumbnails(allNews), [allNews, processThumbnails]);

  // Determine activeCategory and rawItems only if availableCategoryMappings is not empty
  const activeCategory = availableCategoryMappings.length > 0 ? availableCategoryMappings[categoryIndex] : undefined;

  const rawItems = useMemo(() => {
    return activeCategory ? (activeCategory.dbCategory === '__NOTICIAS__' ? allNews : galleryVideos) : [];
  }, [activeCategory, allNews, galleryVideos]);

  const processedItems = useMemo(() => processThumbnails(rawItems), [rawItems, processThumbnails]);

  if (isLoadingNews || availableCategoryMappings.length === 0) {
    return <div className="text-white p-4 bg-white/10 rounded-lg flex justify-center items-center h-[126px]">Cargando...</div>;
  }

  // --- RENDERIZADO ---
  if (isSearching) {
    if (searchLoading) return <div className="text-white p-4">Buscando...</div>;
    const processed = processThumbnails(searchResults);
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
        transition={{ duration: 0.5 }}
        style={{ pointerEvents: isVisible ? 'auto' : 'none' }}
        className="w-full max-w-screen-xl mx-auto px-4"
      >
        <CategoryCycler
          allVideos={processed}
          activeCategory={{ display: 'Tu Búsqueda', dbCategory: 'search_results' }}
          onNext={() => { }}
          onPrev={() => { }}
          onCardClick={handleCardClick}
          isSearchResult={true}
          instanceId="search-carousel"
        />      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
      transition={{ duration: 0.5 }}
      style={{ pointerEvents: isVisible ? 'auto' : 'none' }}
      className="w-full max-w-screen-xl mx-auto px-4"
    >
      <div className="-mt-[5px] w-full relative z-0 flex flex-col gap-6">
        {/* Static Latest News Carousel */}
        <CategoryCycler
          allVideos={processedAllNews}
          activeCategory={{ display: 'ÚLTIMAS NOTICIAS', dbCategory: '__NOTICIAS__' }}
          // Hide navigation arrows for this static row if preferred, or keep them empty/managed internally if needed.
          // Since CategoryCycler handles its own internal filtering/display, passing 'allNews' is correct.
          // However, CategoryCycler usually expects onNext/onPrev for the *category* switching.
          // If we just want a carousel of items without category switching, we can pass dummy/empty functions or modify CategoryCycler.
          // Based on current CategoryCycler, it renders navigation buttons for the CATEGORY.
          // For this specific 'Latest News' row, we likely DON'T want category switching arrows.
          onNext={undefined}
          onPrev={undefined}
          onCardClick={handleCardClick}
          instanceId="tv-latest-news"
        />

        {/* Dynamic Category Cycler */}
        {activeCategory && (
          <CategoryCycler
            allVideos={processedItems}
            activeCategory={activeCategory}
            onNext={handleNextCategory}
            onPrev={handlePrevCategory}
            onCardClick={handleCardClick}
            instanceId="tv-carousel"
          />
        )}
      </div>
    </motion.div>
  );
};

export default TvContentRail;