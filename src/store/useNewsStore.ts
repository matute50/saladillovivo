import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
    getArticlesForHome,
    getVideosForHome,
    getTickerTexts,
    getInterviews,
    getActiveBanners,
    getActiveAds,
    getCalendarEvents,
    fetchVideosBySearch
} from '@/lib/data';
import { Article, Video, Interview, Banner, Ad, CalendarEvent } from '@/lib/types';

interface NewsState {
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
    calendarEvents: CalendarEvent[];

    isLoading: boolean;
    isLoadingVideos: boolean;
    isLoadingInterviews: boolean;
    isLoadingBanners: boolean;
    adsLoading: boolean;
    eventsLoading: boolean;
    isLoadingConfig: boolean;
    isDarkTheme: boolean;

    searchQuery: string;
    searchResults: Video[];
    isSearching: boolean;
    searchLoading: boolean;

    // Actions
    fetchData: () => Promise<void>;
    handleSearch: (query: string) => Promise<void>;
    setSearchQuery: (query: string) => void;
    setIsDarkTheme: (isDark: boolean) => void;

    // Helpers
    getNewsById: (id: string | number) => Article | undefined;
    getNewsBySlug: (slug: string) => Article | undefined;
    getRelatedNews: (currentSlug: string, category: string) => Article[];
    getNewsByCategory: (category: string) => Article[];
}

export const useNewsStore = create<NewsState>()(
    devtools(
        (set, get) => ({
            allNews: [],
            featuredNews: [],
            secondaryNews: [],
            tertiaryNews: [],
            otherNews: [],
            allTickerTexts: [],
            galleryVideos: [],
            interviews: [],
            activeBanners: [],
            activeAds: [],
            calendarEvents: [],

            isLoading: true,
            isLoadingVideos: true,
            isLoadingInterviews: true,
            isLoadingBanners: true,
            adsLoading: true,
            eventsLoading: true,
            isLoadingConfig: true,
            isDarkTheme: false,

            searchQuery: '',
            searchResults: [],
            isSearching: false,
            searchLoading: false,

            fetchData: async () => {
                try {
                    const [articlesResult, videosResult, tickerTexts, interviews, banners, ads, events] = await Promise.all([
                        getArticlesForHome(),
                        getVideosForHome(),
                        getTickerTexts(),
                        getInterviews(),
                        getActiveBanners(),
                        getActiveAds(),
                        getCalendarEvents(),
                    ]);

                    const safeArticles = articlesResult || { allNews: [] };
                    const safeVideos = videosResult || { allVideos: [] };

                    set({
                        allNews: safeArticles.allNews,
                        featuredNews: safeArticles.allNews.filter(n => n.featureStatus === 'featured'),
                        secondaryNews: safeArticles.allNews.filter(n => n.featureStatus === 'secondary'),
                        tertiaryNews: safeArticles.allNews.filter(n => n.featureStatus === 'tertiary'),
                        otherNews: safeArticles.allNews.filter(n => !['featured', 'secondary', 'tertiary'].includes(n.featureStatus || '')),
                        allTickerTexts: tickerTexts,
                        galleryVideos: safeVideos.allVideos,
                        interviews: interviews,
                        activeBanners: banners,
                        activeAds: ads,
                        calendarEvents: events,
                        isLoading: false,
                        isLoadingVideos: false,
                        isLoadingInterviews: false,
                        isLoadingBanners: false,
                        adsLoading: false,
                        eventsLoading: false,
                        isLoadingConfig: false,
                    });
                } catch (error) {
                    console.error("Error fetching data:", error);
                    set({
                        isLoading: false,
                        isLoadingVideos: false,
                        isLoadingInterviews: false,
                        isLoadingBanners: false,
                        adsLoading: false,
                        eventsLoading: false,
                        isLoadingConfig: false,
                    });
                }
            },

            handleSearch: async (query: string) => {
                set({ searchQuery: query });

                if (!query.trim()) {
                    set({ isSearching: false, searchResults: [] });
                    return;
                }

                set({ isSearching: true, searchLoading: true });
                try {
                    const results = await fetchVideosBySearch(query);
                    set({ searchResults: results });
                } catch (err) {
                    console.error("Error during search:", err);
                    set({ searchResults: [] });
                } finally {
                    set({ searchLoading: false });
                }
            },

            setSearchQuery: (query: string) => set({ searchQuery: query }),
            setIsDarkTheme: (isDark: boolean) => set({ isDarkTheme: isDark }),

            getNewsById: (id: string | number) => get().allNews.find(item => item.id.toString() === id.toString()),
            getNewsBySlug: (slug: string) => get().allNews.find(item => item.slug === slug),
            getRelatedNews: (currentSlug: string, category: string) =>
                get().allNews.filter(item => item.slug !== currentSlug && item.categoria === category).slice(0, 3),
            getNewsByCategory: (category: string) => get().allNews.filter(item => item.categoria === category),
        }),
        { name: 'NewsStore' }
    )
);
