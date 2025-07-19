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
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  
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
    const fetchInitialConfig = async () => {
      setIsLoadingConfig(true);
      setTimeout(() => setIsLoadingConfig(false), 100); 
    };
    fetchInitialConfig();
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

        let { data: articles, error: articlesError } = await supabase
          .from('articles')
          .select('id, title, text, imageUrl, featureStatus, updatedAt, createdAt, slug, description')
          .order('createdAt', { ascending: false });

        if (articlesError) throw articlesError;
        
        const processedNews = articles.map(item => ({
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
          categoria: item.featureStatus || 'General',
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

        let { data: tickerData, error: tickerError } = await supabase
          .from('textos_ticker')
          .select('text, isActive') 
          .eq('isActive', true)
          .order('createdAt', { ascending: true });

        if (tickerError) {
           console.warn('Error fetching ticker texts:', tickerError);
           setAllTickerTexts(["Últimas noticias de última hora - Siga nuestra cobertura en vivo."]);
        } else if (tickerData && tickerData.length > 0) {
          setAllTickerTexts(tickerData.map(t => t.text).filter(Boolean)); 
        } else {
          setAllTickerTexts(["Bienvenido a Saladillo Vivo - Manténgase informado."]);
        }

        let { data: videosData, error: videosError } = await supabase
          .from('videos')
          .select('id, nombre, url, createdAt, categoria, imagen')
          .order('createdAt', { ascending: false });
        if (videosError) {
          console.error('Error fetching videos:', videosError);
          setGalleryVideos([]);
        } else {
          setGalleryVideos(videosData || []); 
        }
        setIsLoadingVideos(false);

        let { data: interviewsData, error: interviewsError } = await supabase
          .from('entrevistas')
          .select('id, nombre, url, created_at, updated_at, categoria, imagen')
          .order('created_at', { ascending: false });
        if (interviewsError) {
          console.error('Error fetching interviews:', interviewsError);
          setInterviews([]);
        } else {
          const processedInterviews = (interviewsData || []).map(item => ({
            ...item,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
          }));
          setInterviews(processedInterviews);
        }
        setIsLoadingInterviews(false);

        let { data: bannersData, error: bannersError } = await supabase
          .from('banner')
          .select('id, imageUrl, nombre, isActive')
          .eq('isActive', true)
          .order('createdAt', { ascending: false });
        if (bannersError) {
          console.error('Error fetching banners:', bannersError);
          setActiveBanners([]);
        } else {
          setActiveBanners(bannersData || []);
        }
        setIsLoadingBanners(false);

        let { data: adsData, error: adsError } = await supabase
          .from('anuncios')
          .select('id, imageUrl, name, isActive, linkUrl')
          .eq('isActive', true)
          .order('createdAt', { ascending: false });
        if (adsError) {
          console.error('Error fetching ads:', adsError);
          setActiveAds([]);
        } else {
          setActiveAds(adsData || []);
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