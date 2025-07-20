import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const NewsContext = createContext();

export const useNews = () => useContext(NewsContext);

export const NewsProvider = ({ children }) => {
  const [news, setNews] = useState([]);
  const [mainFeaturedNews, setMainFeaturedNews] = useState(null);
  const [secondaryFeaturedNews1, setSecondaryFeaturedNews1] = useState(null);
  const [secondaryFeaturedNews2, setSecondaryFeaturedNews2] = useState(null);
  const [otherNews, setOtherNews] = useState([]);
  const [allTickerTexts, setAllTickerTexts] = useState([]);
  const [galleryVideos, setGalleryVideos] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [activeBanners, setActiveBanners] = useState([]);
  const [activeAds, setActiveAds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);
  const [isLoadingInterviews, setIsLoadingInterviews] = useState(true);
  const [isLoadingBanners, setIsLoadingBanners] = useState(true);
  const [adsLoading, setAdsLoading] = useState(true);
  const { toast } = useToast();

  const [calendarEvents, setCalendarEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);
  
  const [isDarkTheme, setIsDarkTheme] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const currentThemeIsDark = document.documentElement.classList.contains('dark');
      setIsDarkTheme(currentThemeIsDark);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  

  useEffect(() => {
    const fetchCalendarEvents = async () => {
      setEventsLoading(true);
      const { data, error } = await supabase
        .from('eventos')
        .select('nombre, fecha, hora')
        .order('fecha', { ascending: true })
        .order('hora', { ascending: true });

      if (error) {
        console.warn('Error fetching calendar events:', error);
        setCalendarEvents([]);
      } else {
        setCalendarEvents(data || []);
      }
      setEventsLoading(false);
    };
    fetchCalendarEvents();
  }, []);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        setIsLoadingVideos(true);
        setIsLoadingInterviews(true);
        setIsLoadingBanners(true);
        setAdsLoading(true);

        const [articlesResponse, tickerResponse, videosResponse, interviewsResponse, bannersResponse, adsResponse] = await Promise.all([
          supabase.from('articles').select('id, title, text, imageUrl, featureStatus, updatedAt, createdAt, slug, description').order('createdAt', { ascending: false }),
          supabase.from('textos_ticker').select('text, isActive').eq('isActive', true).order('createdAt', { ascending: true }),
          supabase.from('videos').select('id, nombre, url, createdAt, categoria, imagen').order('createdAt', { ascending: false }),
          supabase.from('entrevistas').select('id, nombre, url, created_at, updated_at, categoria, imagen').order('created_at', { ascending: false }),
          supabase.from('banner').select('id, imageUrl, nombre, isActive').eq('isActive', true).order('createdAt', { ascending: false }),
          supabase.from('anuncios').select('id, imageUrl, name, isActive, linkUrl').eq('isActive', true).order('createdAt', { ascending: false })
        ]);

        if (articlesResponse.error) throw articlesResponse.error;
        const processedNews = articlesResponse.data.map(item => ({
          id: item.id,
          titulo: item.title,
          slug: item.slug || item.id.toString(), 
          description: item.description || (item.text ? item.text.substring(0, 160) : 'Descripción no disponible.'),
          resumen: item.text ? item.text.substring(0, 150) + (item.text.length > 150 ? '...' : '') : 'Resumen no disponible.',
          contenido: item.text || 'Contenido no disponible.',
          fecha: item.updatedAt || item.createdAt,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          autor: 'Equipo Editorial',
          categoria: item.featureStatus,
          imageUrl: item.imageUrl || 'https://images.unsplash.com/photo-1495020689067-958852a7765e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1169&q=80',
          featureStatus: item.featureStatus,
        }));
        setNews(processedNews);

        const featured = processedNews.find(n => n.featureStatus === 'destacada');
        setMainFeaturedNews(featured || null);

        const noticia2 = processedNews.find(n => n.featureStatus === 'noticia2');
        setSecondaryFeaturedNews1(noticia2 || null);
        
        const noticia3 = processedNews.find(n => n.featureStatus === 'noticia3');
        setSecondaryFeaturedNews2(noticia3 || null);

        const others = processedNews.filter(n => 
          n.featureStatus !== 'destacada' &&
          n.featureStatus !== 'noticia2' &&
          n.featureStatus !== 'noticia3'
        );
        setOtherNews(others);

        if (tickerResponse.error) {
           console.warn('Error fetching ticker texts:', tickerResponse.error);
           setAllTickerTexts(["Últimas noticias de última hora - Siga nuestra cobertura en vivo."]);
        } else if (tickerResponse.data && tickerResponse.data.length > 0) {
          setAllTickerTexts(tickerResponse.data.map(t => t.text).filter(Boolean)); 
        } else {
          setAllTickerTexts(["Bienvenido a Saladillo Vivo - Manténgase informado."]);
        }

        if (videosResponse.error) {
          console.error('Error fetching videos:', videosResponse.error);
          setGalleryVideos([]);
        } else {
          setGalleryVideos(videosResponse.data || []); 
        }
        setIsLoadingVideos(false);

        if (interviewsResponse.error) {
          console.error('Error fetching interviews:', interviewsResponse.error);
          setInterviews([]);
        } else {
          const processedInterviews = (interviewsResponse.data || []).map(item => ({
            ...item,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
          }));
          setInterviews(processedInterviews);
        }
        setIsLoadingInterviews(false);

        if (bannersResponse.error) {
          console.error('Error fetching banners:', bannersResponse.error);
          setActiveBanners([]);
        } else {
          setActiveBanners(bannersResponse.data || []);
        }
        setIsLoadingBanners(false);

        if (adsResponse.error) {
          console.error('Error fetching ads:', adsResponse.error);
          setActiveAds([]);
        } else {
          setActiveAds(adsResponse.data || []);
        }
        setAdsLoading(false);
        
        setIsLoading(false);
      } catch (error) {
        toast({
          title: "Error de Carga",
          description: `No se pudieron cargar los datos. ${error.message}`,
          variant: "destructive",
        });
        setIsLoading(false);
        setIsLoadingVideos(false);
        setIsLoadingInterviews(false);
        setIsLoadingBanners(false);
        setAdsLoading(false);
        setNews([]);
        setMainFeaturedNews(null);
        setSecondaryFeaturedNews1(null);
        setSecondaryFeaturedNews2(null);
        setOtherNews([]);
        setGalleryVideos([]);
        setInterviews([]);
        setActiveBanners([]);
        setActiveAds([]);
        setAllTickerTexts(["Error al cargar el ticker."]);
      }
    };

    if (!isLoadingConfig) { 
      fetchAllData();
    }
  }, [toast, isLoadingConfig]);

  const getNewsById = (id) => {
    return news.find(item => item.id.toString() === id.toString());
  };

  const getNewsBySlug = (slug) => {
    return news.find(item => item.slug === slug);
  };

  const getRelatedNews = (currentSlug, category) => {
    return news.filter(item => 
      item.slug !== currentSlug && 
      (item.categoria === category || !category) 
    ).slice(0, 3);
  };

  const getNewsByCategory = (category) => {
    return news.filter(item => item.categoria === category);
  };

  return (
    <NewsContext.Provider value={{
      news,
      mainFeaturedNews,
      secondaryFeaturedNews1,
      secondaryFeaturedNews2,
      otherNews,
      allTickerTexts,
      galleryVideos,
      interviews,
      activeBanners,
      activeAds,
      isLoading,
      isLoadingVideos,
      isLoadingInterviews,
      isLoadingBanners,
      adsLoading,
      getNewsById,
      getNewsBySlug,
      getRelatedNews,
      getNewsByCategory,
      calendarEvents,
      eventsLoading,
      isLoadingConfig,
      isDarkTheme,
    }}>
      {children}
    </NewsContext.Provider>
  );
};