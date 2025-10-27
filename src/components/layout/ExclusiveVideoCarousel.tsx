'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Navigation } from 'swiper/modules';
import 'swiper/css/navigation';
import { useMediaPlayer } from '@/context/MediaPlayerContext';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

const ExclusiveVideoCarousel = ({ videos, isLoading, carouselId, isMobile = false, isLive = false, isEventCarousel = false }) => {
  const { playSpecificVideo, playLiveStream, streamStatus } = useMediaPlayer();
  const { toast } = useToast();
  const swiperRef = useRef(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [buttonColor, setButtonColor] = useState("#FFFFFF");
  const [buttonBorderColor, setButtonBorderColor] = useState("#FFFFFF");

  useEffect(() => {
    const updateButtonColors = () => {
      const rootStyles = getComputedStyle(document.documentElement);
      const color = rootStyles.getPropertyValue('--carousel-button-color').trim();
      const borderColor = rootStyles.getPropertyValue('--carousel-button-border-color').trim();
      setButtonColor(`rgb(${color})`);
      setButtonBorderColor(`rgb(${borderColor})`);
    };

    updateButtonColors();
    const observer = new MutationObserver(updateButtonColors);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  const getYoutubeThumbnail = (video) => {
    if (!video) return 'https://via.placeholder.com/320x180.png?text=No+disponible';
    if (video.isLiveThumbnail || isEventCarousel) return video.imagen;

    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([\w-]{11})/;

    if (video.url && (video.url.includes('youtube.com') || video.url.includes('youtu.be'))) {
      const videoIdMatch = video.url.match(youtubeRegex);
      if (videoIdMatch) {
        return `https://img.youtube.com/vi/${videoIdMatch[1]}/mqdefault.jpg`;
      }
    }

    if (video.imagen && (video.imagen.includes('youtube.com') || video.imagen.includes('youtu.be'))) {
      const videoIdMatch = video.imagen.match(youtubeRegex);
      if (videoIdMatch) {
        return `https://img.youtube.com/vi/${videoIdMatch[1]}/mqdefault.jpg`;
      }
    }

    return video.imagen || 'https://via.placeholder.com/320x180.png?text=Miniatura';
  };

  const handleVideoClick = (video) => {
    if (isLive || video.isLiveThumbnail) {
      playLiveStream(streamStatus);
    } else if (video.isEvent) {
      toast({
        title: "Próximo Evento",
        description: "Este es un evento futuro. ¡Vuelve pronto para verlo en vivo!",
      });
    } else {
      playSpecificVideo(video);
    }
  };

  if (isLoading) {
    return <div className="relative w-full flex items-center justify-center min-h-[126px] bg-muted/50 animate-pulse rounded-lg"></div>;
  }

  if (!videos || videos.length === 0) {
    return <div className="relative w-full flex items-center justify-center min-h-[126px] text-muted-foreground rounded-lg bg-muted/20">No hay contenido disponible.</div>;
  }

  const showNavButtons = videos.length > (isMobile ? 1 : 3) && !isLive;

  return (
    <div className="relative w-full flex items-center justify-center rounded-xl p-4">
      <Swiper
        ref={swiperRef}
        slidesPerView={videos.length === 2 ? 2 : 'auto'}
        centeredSlides={videos.length === 2 ? false : true}
        initialSlide={videos.length === 2 ? 0 : (isMobile ? 0 : (videos.length > 1 ? 1 : 0))}
        spaceBetween={isMobile ? 10 : 12}
        loop={videos.length === 2 ? false : (videos.length > (isMobile ? 3 : 3))}
        navigation={{
          prevEl: `#prev-${carouselId}`,
          nextEl: `#next-${carouselId}`,
        }}
        modules={[Navigation]}
      >
        {videos.map((video, index) => {
          const isLiveOrEvent = isLive || video.isLiveThumbnail || video.isEvent;
          
          let slideClasses = "transition-all duration-300 ease-in-out";
          let titleOverlayClasses = "absolute inset-0 p-2 bg-gradient-to-t from-black/80 to-transparent flex justify-center items-end text-center opacity-0 transition-opacity duration-300 ease-in-out";

          if (videos.length === 2) {
            const isActiveByHover = (hoveredIndex === null && index === 0) || hoveredIndex === index;
            if (isActiveByHover) {
              slideClasses += " opacity-100 blur-none z-20";
              titleOverlayClasses += " opacity-100";
            } else {
              slideClasses += " opacity-70 blur-sm";
              titleOverlayClasses += " opacity-0";
            }
          } else {
            slideClasses += " opacity-70 blur-sm [&.swiper-slide-active]:opacity-100 [&.swiper-slide-active]:blur-none [&.swiper-slide-active]:z-20";
            titleOverlayClasses += " [.swiper-slide-active_&]:opacity-100";
          }

          return (
            <SwiperSlide 
              key={video.id || video.url} 
              style={{ width: 'auto' }}
              className={slideClasses}
              onMouseEnter={() => videos.length === 2 && setHoveredIndex(index)}
              onMouseLeave={() => videos.length === 2 && setHoveredIndex(null)}
            >
              <div
                onClick={() => handleVideoClick(video)}
                className="relative cursor-pointer group rounded-xl overflow-hidden hover:shadow-orange-500/50"
              >
                <div className="w-56 aspect-video flex items-center justify-center bg-black">
                  <Image
                    loading={index === 0 ? 'eager' : 'lazy'}
                    priority={index === 0}
                    src={getYoutubeThumbnail(video)}
                    alt={video.nombre || "Miniatura de video"}
                    width={320}
                    height={180}
                    className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${isLiveOrEvent ? 'object-contain' : 'object-cover'}`}
                  />
                </div>
                <div className={titleOverlayClasses}>
                  <p className="text-white font-thin uppercase leading-tight text-xs">{video.nombre}</p>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
      {showNavButtons && (
        <>
          <motion.button 
            id={`prev-${carouselId}`}
            className="carousel-nav-button absolute top-1/2 -translate-y-1/2 left-0 z-20 rounded-md p-1 cursor-pointer border"
            animate={{ color: buttonColor, borderColor: buttonBorderColor }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <ChevronLeft size={30} />
          </motion.button>
          <motion.button 
            id={`next-${carouselId}`}
            className="carousel-nav-button absolute top-1/2 -translate-y-1/2 right-0 z-20 rounded-md p-1 cursor-pointer border"
            animate={{ color: buttonColor, borderColor: buttonBorderColor }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <ChevronRight size={30} />
          </motion.button>
        </>
      )}
    </div>
  );
};

export default ExclusiveVideoCarousel;
