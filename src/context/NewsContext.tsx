"use client";

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { getArticles, getTickerTexts, getVideos, getInterviews, getActiveBanners, getActiveAds, getCalendarEvents } from '@/lib/data';
import { Article, Video, Interview, Banner, Ad, CalendarEvent } from '@/lib/types';
import { useToast } from '@/components/ui/use-toast';

interface NewsContextType {
  allNews: Article[];
  featuredNews: Article[];
  secondaryNews: Article[];
  tertiaryNews: Article[];
  otherNews: Article[];
  allTickerTexts: string[];
  galleryVideos: Video[];
  interviews: Interview[];
  activeBanners: Banner[];
  activeAds: Ad[];
  isLoading: boolean;
  isLoadingVideos: boolean;
  isLoadingInterviews: boolean;
  isLoadingBanners: boolean;
  adsLoading: boolean;
  getNewsById: (id: string | number) => Article | undefined;
  getNewsBySlug: (slug: string) => Article | undefined;
  getRelatedNews: (currentSlug: string, category: string) => Article[];
  getNewsByCategory: (category: string) => Article[];
  calendarEvents: CalendarEvent[];
  eventsLoading: boolean;
  isLoadingConfig: boolean;
  isDarkTheme: boolean;
}

export const NewsContext = createContext<NewsContextType | undefined>(undefined);

export const useNews = () => {
  const context = useContext(NewsContext);
  if (!context) {
    throw new Error('useNews must be used within a NewsProvider');
  }
  return context;
};

export const NewsProvider = ({ children }: { children: ReactNode }) => {
  const [allNews, setAllNews] = useState<Article[]>([]);
  const [featuredNews, setFeaturedNews] = useState<Article[]>([]);
  const [secondaryNews, setSecondaryNews] = useState<Article[]>([]);
  const [tertiaryNews, setTertiaryNews] = useState<Article[]>([]);
  const [otherNews, setOtherNews] = useState<Article[]>([]);
  
  const [allTickerTexts, setAllTickerTexts] = useState<string[]>([]);
  const [galleryVideos, setGalleryVideos] = useState<Video[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [activeBanners, setActiveBanners] = useState<Banner[]>([]);
  const [activeAds, setActiveAds] = useState<Ad[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);
  const [isLoadingInterviews, setIsLoadingInterviews] = useState(true);
  const [isLoadingBanners, setIsLoadingBanners] = useState(true);
  const [adsLoading, setAdsLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);
  
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Theme observer
    setIsDarkTheme(document.documentElement.classList.contains('dark'));
    const observer = new MutationObserver(() => {
      setIsDarkTheme(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch and sort articles using the refactored function
        const { allNews: sortedNews } = await getArticles();
        setAllNews(sortedNews);

        // Categorize news based on featureStatus
        setFeaturedNews(sortedNews.filter(n => n.featureStatus === 'featured'));
        setSecondaryNews(sortedNews.filter(n => n.featureStatus === 'secondary'));
        setTertiaryNews(sortedNews.filter(n => n.featureStatus === 'tertiary'));
        setOtherNews(sortedNews.filter(n => !['featured', 'secondary', 'tertiary'].includes(n.featureStatus || '')));

      } catch (error: any) {
        console.error("Error loading articles:", error);
        toast({ title: "Error de Carga de Noticias", description: error.message });
      } finally {
        setIsLoading(false);
      }

      // Fetch other data in parallel
      Promise.allSettled([
        getTickerTexts().then(setAllTickerTexts),
        getVideos().then(setGalleryVideos).finally(() => setIsLoadingVideos(false)),
        getInterviews().then(setInterviews).finally(() => setIsLoadingInterviews(false)),
        getActiveBanners().then(setActiveBanners).finally(() => setIsLoadingBanners(false)),
        getActiveAds().then(setActiveAds).finally(() => setAdsLoading(false)),
        getCalendarEvents().then(setCalendarEvents).finally(() => setEventsLoading(false)),
      ]).catch(error => {
        console.error("Error fetching auxiliary data:", error);
        toast({ title: "Error de Carga", description: "No se pudieron cargar algunos datos auxiliares." });
      });
    };

    fetchAllData();
  }, [toast]);

  const getNewsBySlug = (slug: string) => allNews.find(item => item.slug === slug);
  const getNewsById = (id: string | number) => allNews.find(item => item.id.toString() === id.toString());
  const getRelatedNews = (currentSlug: string, category: string) => allNews.filter(item => item.slug !== currentSlug && item.categoria === category).slice(0, 3);
  const getNewsByCategory = (category: string) => allNews.filter(item => item.categoria === category);

  const value = {
    allNews,
    featuredNews,
    secondaryNews,
    tertiaryNews,
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
  };

  return <NewsContext.Provider value={value}>{children}</NewsContext.Provider>;
};