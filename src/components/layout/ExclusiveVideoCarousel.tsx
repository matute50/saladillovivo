'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { useMediaPlayer } from '@/context/MediaPlayerContext';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

const ExclusiveVideoCarousel = ({ videos, isLoading, carouselId, isMobile = false, isLive = false, isEventCarousel = false, categoryName }) => {
  const { playUserSelectedVideo, playLiveStream, streamStatus } = useMediaPlayer();
  const { toast } = useToast();
  const swiperRef = useRef(null);
  const [activeVideoId, setActiveVideoId] = useState(null);

  useEffect(() => {
    if (videos && videos.length > 0) {
      const centerIndex = isMobile || isLive ? 0 : (videos.length > 1 ? 1 : 0);
      setActiveVideoId(videos[centerIndex]?.id);
    }
  }, [videos, isMobile, isLive]);

  const getYoutubeThumbnail = (video) => {
    if (!video) return 'https://via.placeholder.com/320x180.png?text=No+disponible';
    if (video.isLiveThumbnail || isEventCarousel) return video.imagen;
    if (video.url && (video.url.includes('youtube.com') || video.url.includes('youtu.be'))) {
      const youtubeRegex = new RegExp('(?:https?://)?(?:www\.)?(?:youtube\.com/(?:[^/\n\s]+/[^/\n\s]+/|(?:v|e(?:mbed)?)/|[^/\n\s]*?[?&]v=)|youtu\.be/)([a-zA-Z0-9_-]{11})');
      const videoIdMatch = video.url.match(youtubeRegex);
      return videoIdMatch ? `https://img.youtube.com/vi/${videoIdMatch[1]}/mqdefault.jpg` : (video.imagen || 'https://via.placeholder.com/320x180.png?text=Miniatura');
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
      playUserSelectedVideo(video, categoryName);
    }
  };

  const handleMouseEnter = useCallback((video) => {
    if (isLive || video.isLiveThumbnail) return;
    setActiveVideoId(video.id);
  }, [isLive]);

  const handleMouseLeave = useCallback(() => {
    if (isLive || !swiperRef.current || !swiperRef.current.swiper) return;
    if (!isMobile && videos.length > 2) {
      const centerIndex = swiperRef.current.swiper.realIndex;
      if(videos[centerIndex]) {
        setActiveVideoId(videos[centerIndex].id);
      }
    }
  }, [isLive, isMobile, videos]);

  if (isLoading) {
    return <div className="relative w-full flex items-center justify-center min-h-[126px] bg-muted/50 animate-pulse rounded-lg"></div>;
  }

  if (!videos || videos.length === 0) {
    return <div className="relative w-full flex items-center justify-center min-h-[126px] text-muted-foreground rounded-lg bg-muted/20">No hay contenido disponible.</div>;
  }

  const renderSlide = (video, forceActive = false) => {
    const isActive = forceActive || video.id === activeVideoId;
    const isLiveOrEvent = isLive || video.isLiveThumbnail || video.isEvent;
    const isBlurred = !isLiveOrEvent && !isActive;

    return (
      <motion.div
        onClick={() => handleVideoClick(video)}
        onMouseEnter={() => handleMouseEnter(video)}
        className="relative cursor-pointer group rounded-xl overflow-hidden shadow-thumbnail"
        animate={{
          scale: isActive ? 1.1 : 1,
          zIndex: isActive ? 10 : 1,
          filter: isBlurred ? 'blur(2px)' : 'blur(0px)',
          opacity: isLiveOrEvent ? 1 : (isActive ? 1 : 0.7)
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <div className="w-56 aspect-video flex items-center justify-center bg-black">
          <Image
            loading="lazy"
            src={getYoutubeThumbnail(video)}
            alt={video.nombre || "Miniatura de video"}
            width={320}
            height={180}
            className={`w-full h-full ${isLiveOrEvent ? 'object-contain' : 'object-cover'}`}
          />
        </div>
        <div className="absolute inset-0 transition-all group-hover:bg-black/20"></div>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute inset-0 p-2 bg-gradient-to-t from-black/80 to-transparent flex justify-center items-end text-center"
          >
            <p className="text-white font-thin uppercase leading-tight text-xs">{video.nombre}</p>
          </motion.div>
        )}
      </motion.div>
    );
  };

  const showNavButtons = videos.length > (isMobile ? 1 : 3) && !isLive;

  return (
    <div className="relative w-full flex items-center justify-center rounded-xl overflow-hidden" onMouseLeave={!isMobile ? handleMouseLeave : undefined}>
      <Swiper
        ref={swiperRef}
        slidesPerView={'auto'}
        centeredSlides={true}
        initialSlide={isMobile ? 0 : (videos.length > 1 ? 1 : 0)}
        spaceBetween={isMobile ? 10 : 12}
        loop={videos.length > (isMobile ? 3 : 3)}
        navigation={{
          prevEl: `#prev-${carouselId}`,
          nextEl: `#next-${carouselId}`,
        }}
        modules={[Navigation]}
        onSlideChange={(swiper) => setActiveVideoId(videos[swiper.realIndex]?.id)}
        onSwiper={(swiper) => setActiveVideoId(videos[swiper.realIndex]?.id)}
      >
        {videos.map((video) => (
          <SwiperSlide key={video.id || video.url} style={{ width: 'auto' }}>
            {renderSlide(video)}
          </SwiperSlide>
        ))}
      </Swiper>
      {showNavButtons && (
        <>
          <motion.button 
            className="carousel-nav-button absolute top-1/2 -translate-y-1/2 left-0 z-20 rounded-md p-2 cursor-pointer shadow-xl shadow-black/50 bg-black/30"
            whileHover={{ color: ['#ffffff', '#FF0000', '#ef4444', '#ffffff'], background: '#ef4444' }}
            transition={{ duration: 0.6, times: [0, 0.25, 0.75, 1] }}
            initial={{ color: '#ffffff', background: 'linear-gradient(to right, rgba(30, 58, 138, 0.8), rgba(59, 130, 246, 0.8))' }}
          >
            <ChevronLeft size={20} />
          </motion.button>          <motion.button 
            className="carousel-nav-button absolute top-1/2 -translate-y-1/2 right-0 z-20 rounded-md p-2 cursor-pointer shadow-xl shadow-black/50 bg-black/30"
            whileHover={{ color: ['#ffffff', '#FF0000', '#ef4444', '#ffffff'], background: '#ef4444' }}
            transition={{ duration: 0.6, times: [0, 0.25, 0.75, 1] }}
            initial={{ color: '#ffffff', background: 'linear-gradient(to right, rgba(30, 58, 138, 0.8), rgba(59, 130, 246, 0.8))' }}
          >
            <ChevronRight size={20} />
          </motion.button>
        </>
      )}
    </div>
  );
};

export default ExclusiveVideoCarousel;