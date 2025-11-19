'use client';

import { useMediaPlayer } from '@/context/MediaPlayerContext';
import { useThemeButtonColors } from '@/hooks/useThemeButtonColors';
import { useToast } from '../../ui/use-toast';

// ...

const ExclusiveVideoCarousel: React.FC<ExclusiveVideoCarouselProps> = ({ videos, isLoading, carouselId, isMobile = false, isLive = false }) => {
  const { playSpecificVideo, playLiveStream, streamStatus } = useMediaPlayer();
  const { toast } = useToast();
  const swiperRef = useRef(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { buttonColor, buttonBorderColor } = useThemeButtonColors();


  const getYoutubeThumbnail = (video: Video) => {
    if (!video) return 'https://via.placeholder.com/320x180.png?text=No+disponible';

    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([\w-]{11})/;

    // Priorizar la URL del video para extraer la miniatura de YouTube
    if (video.url && (video.url.includes('youtube.com') || video.url.includes('youtu.be'))) {
      const videoIdMatch = video.url.match(youtubeRegex);
      if (videoIdMatch) {
        return `https://img.youtube.com/vi/${videoIdMatch[1]}/hqdefault.jpg`;
      }
    }

    // Si la URL del video no es de YouTube o no se pudo extraer el ID, intentar con la URL de la imagen
    if (video.imagen && (video.imagen.includes('youtube.com') || video.imagen.includes('youtu.be'))) {
      const videoIdMatch = video.imagen.match(youtubeRegex);
      if (videoIdMatch) {
        return `https://img.youtube.com/vi/${videoIdMatch[1]}/mqdefault.jpg`;
      }
    }

    // Si ninguna de las anteriores es una URL de YouTube o no se pudo extraer el ID,
    // o si es un video en vivo/evento, usar video.imagen directamente.
    // Esto cubre los casos donde video.imagen ya es una URL de miniatura válida
    // o una imagen personalizada.
    return video.imagen || 'https://via.placeholder.com/320x180.png?text=Miniatura';
  };

  const handleVideoClick = (video: Video) => {
    if (isLive || video.isLiveThumbnail) {
      if (streamStatus) {
        playLiveStream(streamStatus);
      }
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
                <div className="relative w-56 aspect-video flex items-center justify-center bg-black">
                  <Image
                    src={getYoutubeThumbnail(video)}
                    alt={video.nombre || "Miniatura de video"}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Añadido para mejor rendimiento
                    priority={index === 0}
                    className={`${isLiveOrEvent ? 'object-contain' : 'object-cover'} transition-transform duration-300 group-hover:scale-105`}
                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.jpg'; }}
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
            className="carousel-nav-button absolute top-1/2 -translate-y-1/2 left-0 z-20 rounded-md p-1 cursor-pointer border shadow-lg shadow-black/50"
            animate={{ color: buttonColor, borderColor: buttonBorderColor }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <ChevronLeft size={30} />
          </motion.button>
          <motion.button
            id={`next-${carouselId}`}
            className="carousel-nav-button absolute top-1/2 -translate-y-1/2 right-0 z-20 rounded-md p-1 cursor-pointer border shadow-lg shadow-black/50"
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