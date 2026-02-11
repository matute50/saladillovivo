'use client';

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';
import { Focusable } from '@/components/ui/Focusable';

import { Article } from '@/lib/types';
import NewsCard from '@/components/NewsCard';
import { useThemeButtonColors } from '@/hooks/useThemeButtonColors';

interface NewsCarouselProps {
  items: Article[];
  carouselId: string;
}

const NewsCarousel: React.FC<NewsCarouselProps> = ({ items, carouselId }) => {
  const { buttonColor, buttonBorderColor } = useThemeButtonColors();
  const swiperRef = useRef<any>(null);

  // Duplicar items si son pocos para asegurar que el carrusel esté lleno en TV
  const displayItems = React.useMemo(() => {
    if (!items || items.length === 0) return [];
    let result = [...items];
    while (result.length > 0 && result.length < 15) {
      result = [...result, ...items];
    }
    return result;
  }, [items]);

  const middleInitialSlide = React.useMemo(() => {
    if (items.length === 0) return 0;
    const originalCount = items.length;
    const totalCount = displayItems.length;
    const repetitions = Math.floor(totalCount / originalCount);
    const middleRepetition = Math.floor(repetitions / 2);
    return (middleRepetition * originalCount);
  }, [items, displayItems]);

  if (!items || items.length === 0) {
    return <div className="relative w-full flex items-center justify-center min-h-[126px] text-muted-foreground rounded-lg bg-muted/20">No hay noticias disponibles.</div>;
  }

  return (
    <div className="relative w-full flex items-center justify-center rounded-xl p-4">
      <Swiper
        ref={swiperRef}
        slidesPerView={'auto'}
        centeredSlides={true}
        initialSlide={middleInitialSlide}
        spaceBetween={16}
        loop={items.length > 1}
        navigation={{
          prevEl: `#prev-${carouselId}`,
          nextEl: `#next-${carouselId}`,
        }}
        modules={[Navigation]}
        className="w-full"
      >
        {displayItems.map((article, index) => (
          <SwiperSlide
            key={`${carouselId}-${article.id}-${index}`}
            style={{ width: 'auto' }}
            className="h-full"
          >
            <Focusable
              id={`news-card-${carouselId}-${article.id}-${index}`}
              group={`carousel-${carouselId}`}
              onFocus={() => {
                if (swiperRef.current?.swiper) {
                  swiperRef.current.swiper.slideToLoop(index);
                }
              }}
              layer={1}
              focusClassName=""
            >
              {({ isFocused }) => (
                <div className="relative h-full">
                  {isFocused && (
                    <div className="absolute inset-0 border-8 border-white rounded-xl pointer-events-none z-50" />
                  )}
                  <NewsCard newsItem={article} className="w-64 h-full" />
                </div>
              )}
            </Focusable>
          </SwiperSlide>
        ))}
      </Swiper>
      <>
        <motion.button
          id={`prev-${carouselId}`}
          className="carousel-nav-button absolute top-1/2 -translate-y-1/2 left-0 z-20 rounded-md p-1 cursor-pointer border shadow-lg shadow-black/50 backdrop-blur-md"
          animate={{ color: buttonColor, borderColor: buttonBorderColor, backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
          whileHover={{ backgroundColor: '#012078' }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <ChevronLeft size={30} />
        </motion.button>
        <motion.button
          id={`next-${carouselId}`}
          className="carousel-nav-button absolute top-1/2 -translate-y-1/2 right-0 z-20 rounded-md p-1 cursor-pointer border shadow-lg shadow-black/50 backdrop-blur-md"
          animate={{ color: buttonColor, borderColor: buttonBorderColor, backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
          whileHover={{ backgroundColor: '#012078' }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <ChevronRight size={30} />
        </motion.button>
      </>
    </div>
  );
};

export default NewsCarousel;
