import React, { useState, useMemo } from 'react';
import MobileNewsGrid from '@/components/layout/MobileNewsGrid';
import BannerSection from '@/components/layout/BannerSection';
import AdsSection from '@/components/layout/AdsSection';
import VideoSection from '@/components/layout/VideoSection';
import DemandCarouselBlock from '@/components/layout/DemandCarouselBlock';
import { useNews } from '@/context/NewsContext';
import { useMediaPlayer } from '@/context/MediaPlayerContext';

const MobileLayout = ({
  newsContext: newsContextFromProps,
  openModal,
  isMobile,
}) => {
  const contextFromHook = useNews();
  const newsContext = newsContextFromProps || contextFromHook;
  const { playingMedia } = useMediaPlayer();

  const {
    mainFeaturedNews,
    secondaryFeaturedNews1,
    secondaryFeaturedNews2,
    otherNews,
    activeBanners,
    isLoadingBanners,
    activeAds,
    adsLoading,
  } = newsContext;

  const allNewsForMobile = useMemo(() => {
    const newsArr = [];
    if (mainFeaturedNews) newsArr.push(mainFeaturedNews);
    if (secondaryFeaturedNews1) newsArr.push(secondaryFeaturedNews1);
    if (secondaryFeaturedNews2) newsArr.push(secondaryFeaturedNews2);
    return [...newsArr, ...otherNews];
  }, [mainFeaturedNews, secondaryFeaturedNews1, secondaryFeaturedNews2, otherNews]);

  const categoryMap = useMemo(() => ({
    "Ver en VIVO": "live_stream",
    "Novedades": "novedades",
    "Lo más visto de la Semana": "mas_visto",
    "Últimas Noticias": "noticias",
    "Sembrando Futuro": "SEMBRANDO FUTURO",
    "Hacelo Corto": "cortos",
    "Lo que Fuimos": "historia",
    "Saladillo Canta": "clips",
    "HCD de Saladillo": "HCD DE SALADILLO  - Período 2025",
    "ITEC ¨Augusto Cicaré¨": "ITEC ¨AUGUSTO CICARE¨ SALADILLO",
    "Fierros de Saladillo": "FIERROS",
    "Gente de Acá": "export"
  }), []);

  const selectableCategories = useMemo(() => Object.keys(categoryMap), [categoryMap]);
  
  const findIndex = (catName) => selectableCategories.findIndex(c => c === catName);

  const [categoryIndex, setCategoryIndex] = useState(findIndex("Últimas Noticias"));

  const handleCategoryChange = (direction) => {
    setCategoryIndex(prevIndex => (prevIndex + direction + selectableCategories.length) % selectableCategories.length);
  };

  const showTitleBar = playingMedia && (playingMedia.isUserSelected || playingMedia.type === 'stream') && playingMedia.title;
  const titleBarHeight = showTitleBar ? 'var(--player-info-bar-height)' : '0px';

  const paddingTop = `calc(var(--player-height-mobile) + var(--header-height) + ${titleBarHeight})`;

  return (
    <>
      <VideoSection
        isMobileFixed={true}
        isMobile={isMobile}
      />
      <main className="w-full" style={{ paddingTop, transition: 'padding-top 0.3s ease-in-out' }}>
        <div className="flex flex-col gap-2">
          
          <section className="flex flex-col items-center pt-2" aria-label="Carrusel de categorías on demand">
            <DemandCarouselBlock 
              blockNumber={1}
              isSelectable={true}
              selectableCategories={selectableCategories}
              categoryMap={categoryMap}
              categoryIndex={categoryIndex}
              onCategoryChange={handleCategoryChange}
              isMobile={true}
            />
          </section>

          <section aria-label="Banner publicitario principal" className="px-2">
            <BannerSection
              activeBanners={activeBanners}
              isLoadingBanners={isLoadingBanners}
              className="w-full"
              isMobile={isMobile}
            />
          </section>

          <section aria-label="Grilla de noticias" className="px-2">
            <MobileNewsGrid
              newsItems={allNewsForMobile}
              openModal={openModal}
            />
          </section>

          <aside aria-label="Anuncios secundarios" className="px-2">
            <AdsSection
              activeAds={activeAds}
              adsLoading={adsLoading}
              isMobile={isMobile}
            />
          </aside>
        </div>
      </main>
    </>
  );
};

export default MobileLayout;