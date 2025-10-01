import React, { useRef, useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/navigation';
import { useMediaPlayer } from '@/context/MediaPlayerContext';

const VideoCarousel = ({ 
  title,
  category,
  allVideos, 
  isLoadingVideos, 
  carouselId,
  isMobile = false,
}) => {
  const { playUserSelectedVideo } = useMediaPlayer();
  const swiperRef = useRef(null);

  const filteredVideos = useMemo(() => {
    if (!allVideos) return [];
    const categoryMap = {
      "Entrevistas": "Entrevistas",
      "Archivo": "Archivo",
      "Detrás de escena": "Detras de Escena",
      "Especiales": "Especiales"
    };
    const mappedCategory = categoryMap[category] || category;
    return allVideos.filter(video => video.categoria === mappedCategory && video.categoria !== 'SV');
  }, [allVideos, category]);

  const getYoutubeThumbnail = (video) => {
    if (!video || !video.url) return video?.imagen || 'https://via.placeholder.com/160x90.png?text=Miniatura+no+disponible';
    if (video.url.includes('youtube.com') || video.url.includes('youtu.be')) {
      const videoIdMatch = video.url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      return videoIdMatch ? `https://img.youtube.com/vi/${videoIdMatch[1]}/mqdefault.jpg` : (video.imagen || 'https://via.placeholder.com/160x90.png?text=Miniatura+YouTube');
    }
    return video.imagen || 'https://via.placeholder.com/160x90.png?text=Miniatura';
  };
  
  const handleVideoSelect = (video) => {
    playUserSelectedVideo(video);
  };

  if (isLoadingVideos) {
    return (
      <div className="w-full">
        <div className="h-6 w-1/2 bg-muted/50 dark:bg-muted/10 animate-pulse rounded-md mb-2"></div>
        <div className="h-24 bg-muted/50 dark:bg-muted/10 animate-pulse rounded-md"></div>
      </div>
    );
  }

  if (!filteredVideos || filteredVideos.length === 0) {
    return null;
  }
  
  const navButtonClasses = "swiper-nav-button absolute top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-primary transition-all text-white rounded-full p-1 cursor-pointer dark:active:bg-accent-blue dark:active:text-white";
  const nextButtonId = `next-${carouselId}`;
  const prevButtonId = `prev-${carouselId}`;

  return (
    <div className="video-carousel-container w-full relative">
       {title && <h2 className="text-lg font-futura-bold mb-2 text-foreground">{title}</h2>}
        <Swiper
          ref={swiperRef}
          grabCursor={true}
          slidesPerView={isMobile ? 2.5 : 4}
          spaceBetween={10}
          modules={[Navigation]}
          navigation={{
            nextEl: `#${nextButtonId}`,
            prevEl: `#${prevButtonId}`,
          }}
          className="video-carousel w-full"
        >
          {filteredVideos.map((video) => (
            <SwiperSlide key={video.id || video.url} onClick={() => handleVideoSelect(video)} className="cursor-pointer group">
              <div className="w-full aspect-video bg-muted dark:bg-muted rounded-md overflow-hidden relative">
                <img  
                  loading="lazy"
                  src={getYoutubeThumbnail(video)}
                  alt={video.nombre || "Miniatura de video"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => { e.target.src = video.imagen || 'https://via.placeholder.com/160x90.png?text=Error'; }}
                />
                 <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all"></div>
              </div>
              <p className="text-center font-semibold text-xs text-foreground mt-1.5 truncate group-hover:text-primary transition-colors">
                {video.nombre}
              </p>
            </SwiperSlide>
          ))}
        </Swiper>
        
        <button id={prevButtonId} className={`${navButtonClasses} left-1`}>
            <ChevronLeft size={20} />
        </button>
        <button id={nextButtonId} className={`${navButtonClasses} right-1`}>
            <ChevronRight size={20} />
        </button>
    </div>
  );
};

export default VideoCarousel;
