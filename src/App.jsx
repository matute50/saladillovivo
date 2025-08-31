
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
const HomePage = lazy(() => import('@/pages/HomePage'));
const ContentPage = lazy(() => import('@/pages/ContentPage')); 
const CategoryPage = lazy(() => import('@/pages/CategoryPage'));
const SitemapGenerator = lazy(() => import('@/pages/SitemapGenerator'));
import { NewsProvider } from '@/context/NewsContext';
import { MediaPlayerProvider } from '@/context/MediaPlayerContext';
import { Helmet, HelmetProvider } from 'react-helmet-async';

const AppContent = () => {
  const location = useLocation();
  const isSitemapPage = location.pathname === '/sitemap.xml';
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    handleResize(); 
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isSitemapPage) {
    return null; 
  }

  return (
    <div className={`flex flex-col min-h-screen overflow-x-hidden hide-scrollbar`}>
      <Header isMobile={isMobile} />
      
      <main className={`flex-grow pb-[var(--footer-height-mobile)] md:pb-[var(--footer-height)]`}>
        <Suspense fallback={<div>Cargando...</div>}>
          <Routes>
            <Route 
              path="/" 
              element={<HomePage isMobile={isMobile} />} 
            />
            <Route path="/noticia/:slug" element={<ContentPage />} />
            <Route path="/categoria/:categoria" element={<CategoryPage />} />
          </Routes>
        </Suspense>
      </main>
      
      <Footer />
      <Toaster />
    </div>
  );
};


function App() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme !== null) {
      try {
        const parsed = JSON.parse(savedTheme);
        return typeof parsed === 'boolean' ? parsed : true;
      } catch (error) {
        return true; 
      }
    }
    return true;
  });

  useEffect(() => {
    if (isDarkTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', JSON.stringify(isDarkTheme));
    
    const headerHeightMobile = '56px';
    const headerHeightDesktop = '72px';
    const playerHeightMobileValue = `calc((100vw * 9 / 16))`;

    document.documentElement.style.setProperty('--header-height', window.innerWidth < 768 ? headerHeightMobile : headerHeightDesktop);
    document.documentElement.style.setProperty('--ticker-height', '32px'); 
    document.documentElement.style.setProperty('--footer-height', '100px'); 
    document.documentElement.style.setProperty('--footer-height-mobile', '60px');
    document.documentElement.style.setProperty('--player-height-mobile', playerHeightMobileValue);
    document.documentElement.style.setProperty('--player-info-bar-height', '32px');
    
  }, [isDarkTheme]);


  useEffect(() => {
    const handleResize = () => {
      const isMobileNow = window.innerWidth < 768;
      document.documentElement.style.setProperty('--header-height', isMobileNow ? '56px' : '72px');
    };
    window.addEventListener('resize', handleResize);
    handleResize(); 
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  


  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div id="loading-screen">
        <div id="loading-spinner"></div>
        <h2 id="loading-text">Cargando Saladillo Vivo...</h2>
      </div>
    );
  }
  
  if (location.pathname === '/sitemap.xml') {
    return (
      <HelmetProvider>
        <NewsProvider>
          <SitemapGenerator />
        </NewsProvider>
      </HelmetProvider>
    );
  }

  return (
    <HelmetProvider>
      <Helmet>
        <script src="https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1" async></script>
      </Helmet>
      <NewsProvider>
        <MediaPlayerProvider>
          <AppContent />
        </MediaPlayerProvider>
      </NewsProvider>
    </HelmetProvider>
  );
}

export default App;
