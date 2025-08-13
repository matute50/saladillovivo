
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useNews } from '@/context/NewsContext';
import DesktopLayout from '@/components/layout/DesktopLayout';
import MobileLayout from '@/components/layout/MobileLayout';
import NewsDetailModal from '@/components/NewsDetailModal';
import { AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useMediaPlayer } from '@/context/MediaPlayerContext';

const HomePage = ({ isMobile }) => {
  const newsContext = useNews();
  const location = useLocation();
  const { playUserSelectedVideo } = useMediaPlayer();
  
  const { 
    isLoading: newsLoading, 
    isLoadingConfig,
    mainFeaturedNews,
    galleryVideos,
    interviews,
  } = newsContext;

  const [selectedNews, setSelectedNews] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const videoUrl = params.get('videoUrl');

    if (videoUrl && galleryVideos && interviews) {
        const combinedVideos = [...interviews, ...galleryVideos];
        const videoToPlay = combinedVideos.find(v => v.url === videoUrl);

        if (videoToPlay) {
            playUserSelectedVideo(videoToPlay);
            window.history.replaceState(null, '', window.location.pathname);
        }
    }
  }, [location.search, galleryVideos, interviews, playUserSelectedVideo]);

  const openModal = (noticia) => setSelectedNews(noticia);
  const closeModal = () => setSelectedNews(null);

  if (newsLoading || isLoadingConfig) {
    return (
      <div className="container mx-auto px-4 py-8">
         <Helmet>
          <title>Cargando... - Saladillo Vivo</title>
          <meta name="description" content="Cargando las últimas noticias y actualidad de Saladillo." />
        </Helmet>
        <div className="flex flex-col lg:flex-row gap-8 mb-8">
          <div className="lg:w-1/2 bg-muted rounded-xl p-6 animate-pulse h-[400px] lg:h-auto"></div>
          <div className="lg:w-1/2 bg-muted rounded-xl animate-pulse h-[400px] lg:h-auto"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="bg-muted rounded-xl p-4 animate-pulse h-[250px]"></div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>{mainFeaturedNews?.meta_title || 'Saladillo Vivo - Noticias, Eventos y Cultura'}</title>
        <meta name="description" content={mainFeaturedNews?.meta_description || 'Saladillo Vivo es el canal temático de noticias, eventos y cultura de Saladillo. Mirá streaming en vivo y contenido on demand las 24hs.'} />
        <meta name="keywords" content={mainFeaturedNews?.meta_keywords || 'Saladillo, noticias, actualidad, vivo, streaming, eventos, cultura, HCD'} />
        <meta property="og:title" content={mainFeaturedNews?.meta_title || 'Saladillo Vivo - Noticias y Actualidad'} />
        <meta property="og:description" content={mainFeaturedNews?.meta_description || 'Saladillo Vivo es el canal temático de noticias, eventos y cultura de Saladillo. Mirá streaming en vivo y contenido on demand las 24hs.'} />
        <meta property="og:image" content={mainFeaturedNews?.imageUrl || 'https://www.saladillovivo.com.ar/default-og-image.png'} /> 
        <meta property="og:url" content={`https://www.saladillovivo.com.ar${mainFeaturedNews?.slug ? '/noticia/' + mainFeaturedNews.slug : ''}`} />
        <meta property="og:type" content={mainFeaturedNews ? 'article' : 'website'} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={mainFeaturedNews?.meta_title || 'Saladillo Vivo - Noticias y Actualidad'} />
        <meta name="twitter:description" content={mainFeaturedNews?.meta_description || 'Saladillo Vivo es el canal temático de noticias, eventos y cultura de Saladillo.'} />
        <meta name="twitter:image" content={mainFeaturedNews?.imageUrl || 'https://www.saladillovivo.com.ar/default-og-image.png'} />
        {mainFeaturedNews && <link rel="canonical" href={`https://www.saladillovivo.com.ar/noticia/${mainFeaturedNews.slug}`} />}
      </Helmet>

      {isMobile ? (
        <MobileLayout
          newsContext={newsContext}
          openModal={openModal}
          isMobile={isMobile}
        />
      ) : (
        <DesktopLayout
          newsContext={newsContext}
          openModal={openModal}
          isMobile={isMobile}
        />
      )}
      <AnimatePresence>
        {selectedNews && (
          <NewsDetailModal newsItem={selectedNews} onClose={closeModal} />
        )}
      </AnimatePresence>
    </>
  );
};

export default HomePage;
