import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { useMediaPlayer } from '@/context/MediaPlayerContext';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ExclusiveVideoCarousel = ({ videos, isLoading, carouselId, isMobile = false, isLive = false, isEventCarousel = false, categoryName }) => {
  const { playUserSelectedVideo, playLiveStream, streamStatus } = useMediaPlayer();
  const { toast } = useToast();
  const swiperRef = useRef(null);
  
  const [activeVideoId, setActiveVideoId] = useState(null);

  useEffect(() => {
    if (videos && videos.length > 0) {
      if (isMobile || videos.length <= 2 || isLive) {
         const centerIndex = isMobile ? swiperRef.current?.swiper.realIndex ?? 0 : 0;
         setActiveVideoId(videos[centerIndex]?.id);
      } else {
        const centerIndex = videos.length > 1 ? 1 : 0;
        setActiveVideoId(videos[centerIndex]?.id);
      }
    }
  }, [videos, isMobile, isLive]);

  const getYoutubeThumbnail = (video) => {
    if (!video) return 'https://via.placeholder.com/320x180.png?text=No+disponible';
    if (video.isLiveThumbnail || isEventCarousel) return video.imagen;
    if (video.url && (video.url.includes('youtube.com') || video.url.includes('youtu.be'))) {
      const videoIdMatch = video.url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
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

  const carouselContainerClasses = `relative w-full flex items-center justify-center`;

  if (isLoading) {
    return <div className={`${carouselContainerClasses} w-full bg-muted/50 animate-pulse rounded-lg`}></div>;
  }

  if (!videos || videos.length === 0) {
    return <div className={`${carouselContainerClasses} flex items-center justify-center text-muted-foreground rounded-lg bg-muted/20`}>No hay contenido disponible.</div>;
  }
  
  const isTwoItemCarousel = videos.length === 2;

  let slideWidthClass = isMobile ? "w-48" : "w-56";
  
  let scaleActive = isMobile ? 1.15 : 1.1; // Default active scale
  let scaleInactive = isMobile ? 1 : 0.7; // Default inactive scale

  if (isTwoItemCarousel && !isMobile) { // Special case for two items
    scaleActive = 0.9;
    scaleInactive = 0.9;
  }
  
  const renderSlide = (video, forceActive = false) => {
    const isActive = forceActive || video.id === activeVideoId;
    const isLiveOrEvent = isLive || video.isLiveThumbnail || video.isEvent;
    const isBlurred = !isLiveOrEvent && !(isTwoItemCarousel && !isMobile) && !isActive;
    
    return (
        <motion.div
            onClick={() => handleVideoClick(video)}
            onMouseEnter={() => !isTwoItemCarousel && !isMobile && handleMouseEnter(video)}
            className="relative cursor-pointer group rounded-lg overflow-hidden card-blur shadow-thumbnail overflow-visible"
            animate={{ 
                scale: isActive ? scaleActive : (isLiveOrEvent ? 1 : scaleInactive),
                zIndex: isActive ? 10 : 1,
                filter: isBlurred ? 'blur(2px)' : 'blur(0px)',
                opacity: isLiveOrEvent ? 1 : (isActive ? 1 : 0.7)
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            data-video-id={video.id}
        >
            <div className={`${slideWidthClass} aspect-video flex items-center justify-center`}>
                <img
                  loading="lazy"
                  src={getYoutubeThumbnail(video)}
                  alt={video.nombre || "Miniatura de video"}
                  className={`w-full h-full ${isLiveOrEvent ? 'object-contain' : 'object-cover'}`}
                />
            </div>
            <div 
              className="absolute inset-0 transition-all group-hover:bg-black/20"
            ></div>
            {(isActive || isEventCarousel) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`absolute inset-0 p-2 bg-gradient-to-t from-black/80 to-transparent flex justify-center text-center ${video.isEvent || video.isLiveThumbnail ? 'items-end' : 'items-end'}`}
                >
                  <p className={`text-white font-['Century_Gothic'] uppercase leading-tight ${video.isEvent || video.isLiveThumbnail ? "text-sm" : "text-xs"} ${isMobile ? 'font-bold' : 'font-thin'}`}>{video.nombre}</p>
                </motion.div>
            )}
        </motion.div>
    );
  }

  const prevButtonId = `prev-${carouselId}`;
  const nextButtonId = `next-${carouselId}`;
  
  const slidesPerView = videos.length === 1 ? 1 : (isMobile ? 'auto' : 3);
  const showNavButtons = videos.length > (isMobile ? 1 : (isTwoItemCarousel ? 0 : 3)) && !isLive;
  
  const handleNext = () => swiperRef.current.swiper.slideNext();
  const handlePrev = () => swiperRef.current.swiper.slidePrev();
  
  const swiperProps = {
    ref: swiperRef,
    slidesPerView: slidesPerView,
    centeredSlides: true,
    initialSlide: isMobile ? 0 : (videos.length > 1 ? 1 : 0),
    spaceBetween: isMobile ? 10 : (isTwoItemCarousel ? 16 : 12),
    loop: videos.length > (isMobile ? (isTwoItemCarousel ? 2 : 3) : 3),
    navigation: false,
    modules: [Navigation],
    className: "exclusive-video-carousel",
    onSlideChange: (swiper) => {
      const activeIndex = swiper.realIndex;
      if (videos[activeIndex]) {
        setActiveVideoId(videos[activeIndex].id);
      }
    },
    onSwiper: (swiper) => {
      if (videos[swiper.realIndex]) {
        setActiveVideoId(videos[swiper.realIndex].id);
      }
    },
  };

  return (
    <div className={carouselContainerClasses} onMouseLeave={!isMobile ? handleMouseLeave : undefined}>
      {isTwoItemCarousel && !isMobile ? (
         <div className={`flex justify-center items-center gap-4`}>
             {videos.map(video => <div key={video.id}>{renderSlide(video, true)}</div>)}
         </div>
      ) : (
        <>
          <Swiper {...swiperProps}>
            {videos.map((video) => (
              <SwiperSlide key={video.id || video.url} className={`!w-auto flex ${categoryName === 'Ver en VIVO' ? 'justify-start' : 'justify-center'}`}>
                 {renderSlide(video)}
              </SwiperSlide>
            ))}
          </Swiper>
           {showNavButtons && (
              <>
                  <button id={prevButtonId} onClick={handlePrev} className="carousel-nav-button absolute top-1/2 -translate-y-1/2 left-0 z-20 transition-colors text-white rounded-full p-2 cursor-pointer dark:active:bg-accent-blue dark:active:text-white">
                      <ChevronLeft size={16} className="text-white" />
                  </button>
                  <button id={nextButtonId} onClick={handleNext} className="carousel-nav-button absolute top-1/2 -translate-y-1/2 right-0 z-20 transition-colors text-white rounded-full p-2 cursor-pointer dark:active:bg-accent-blue dark:active:text-white">
                      <ChevronRight size={16} className="text-white" />
                  </button>
              </>
          )}
        </>
      )}
    </div>
  );
};

export default ExclusiveVideoCarousel;