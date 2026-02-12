'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';

import { usePlayerStore } from '@/store/usePlayerStore';
import { useVolumeStore } from '@/store/useVolumeStore';
import { useToast } from '@/components/ui/use-toast';
import { Video, ExclusiveVideoCarouselProps } from '@/lib/types';
import { cleanTitle } from '@/lib/utils';
import { Focusable } from '@/components/ui/Focusable';

const ExclusiveVideoCarousel: React.FC<ExclusiveVideoCarouselProps> = ({
  videos,
  isLoading,
  carouselId,
  isLive = false,
  onVideoClick,
  layer,
  loop = true,
  isSearchResult = false
}) => {
  const { playSpecificVideo, playLiveStream, streamStatus } = usePlayerStore();
  const { volume, setVolume } = useVolumeStore();
  const { toast } = useToast();
  const swiperRef = useRef<any>(null);


  // Multiplicar elementos si son pocos para asegurar que el loop de Swiper siempre esté "lleno"
  // en resoluciones de TV (hasta 4K). Necesitamos al menos 15-20 elementos.
  const displayVideos = React.useMemo(() => {
    if (!videos || videos.length === 0) return [];
    if (!loop) return videos; // No repetir si no es infinito

    let result = [...videos];
    // Si hay pocos, repetimos la secuencia hasta tener al menos 15 items
    while (result.length > 0 && result.length < 15) {
      result = [...result, ...videos];
    }
    return result;
  }, [videos, loop]);

  // Encontrar el índice del primer "featuredNews" (o primer video) en el array original
  // y proyectarlo al set central de la lista repetida para que aparezca enfocado al inicio.
  const middleInitialSlide = React.useMemo(() => {
    if (!displayVideos.length) return 0;
    if (!loop) return 0; // Si no es infinito, empezar desde el principio

    const originalLength = videos.length;
    const middleIndex = Math.floor(displayVideos.length / 2);
    // Ajustar para que sea el inicio de un bloque original
    return middleIndex - (middleIndex % originalLength);
  }, [displayVideos, videos, loop]);


  const getYoutubeThumbnail = (video: Video): string => {
    if (!video) return 'https://via.placeholder.com/320x180.png?text=No+disponible';

    const youTubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

    // Prioridad: Extraer del video.url si es link de YouTube
    if (video.url) {
      const videoIdMatch = video.url.match(youTubeRegex);
      if (videoIdMatch) {
        return `https://img.youtube.com/vi/${videoIdMatch[1]}/hqdefault.jpg`;
      }
    }

    // Procesar video.imagen
    const cleanImageUrl = (video.imagen || '').trim();

    if (!cleanImageUrl) {
      return 'https://via.placeholder.com/320x180.png?text=Miniatura';
    }

    // Si video.imagen es URL de YouTube, extraer miniatura
    if (cleanImageUrl.includes('youtube.com') || cleanImageUrl.includes('youtu.be')) {
      const videoIdMatch = cleanImageUrl.match(youTubeRegex);
      if (videoIdMatch) {
        return `https://img.youtube.com/vi/${videoIdMatch[1]}/mqdefault.jpg`;
      }
    }

    // Supports Data URI
    if (cleanImageUrl.startsWith('data:image')) {
      return cleanImageUrl;
    }

    // Si es absoluta, usarla tal cual
    if (cleanImageUrl.match(/^(http|https):\/\//)) {
      return cleanImageUrl;
    }

    // CORRECCIÓN DE BUG: 'cleanUrl' no existía, debía ser 'cleanImageUrl'
    return `${process.env.NEXT_PUBLIC_MEDIA_URL || ''}${cleanImageUrl.startsWith('/') ? '' : '/'}${cleanImageUrl}`;
  };

  const handleVideoClick = (video: Video) => {
    if (onVideoClick) {
      onVideoClick(video);
      return;
    }

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
      playSpecificVideo(video, volume, setVolume);
    }
  };

  if (isLoading) {
    return <div className="relative w-full flex items-center justify-center min-h-[126px] bg-muted/50 animate-pulse rounded-lg"></div>;
  }

  if (!videos || videos.length === 0) {
    return <div className="relative w-full flex items-center justify-center min-h-[126px] text-muted-foreground rounded-lg bg-muted/20">No hay contenido disponible.</div>;
  }

  return (
    <div className="relative w-full flex items-center justify-center rounded-xl p-4">
      <Swiper
        ref={swiperRef}
        slidesPerView={'auto'}
        centeredSlides={!isSearchResult}
        initialSlide={middleInitialSlide}
        spaceBetween={isSearchResult ? 32 : 12}
        loop={displayVideos.length > 1 && loop}
        observer={true}
        observeParents={true}
        watchSlidesProgress={true}
        centerInsufficientSlides={true}
        slidesOffsetBefore={0}
        slidesOffsetAfter={0}
        navigation={{
          prevEl: `#prev-${carouselId}`,
          nextEl: `#next-${carouselId}`,
        }}
        modules={[Navigation]}
      >
        {displayVideos.map((video, index) => {
          const isLiveOrEvent = isLive || video.isLiveThumbnail || video.isEvent;

          const slideClasses = "transition-all duration-300 ease-in-out opacity-100 blur-none";
          const titleOverlayClasses = "absolute inset-0 p-2 bg-gradient-to-t from-black/80 to-transparent flex justify-center items-end text-center opacity-100 z-20 transition-opacity duration-300 ease-in-out";

          // La lógica de clase para slideClasses y titleOverlayClasses se ha simplificado
          // para que siempre estén visibles y sin blur/opacidad dinámica para el fondo y título.
          // El z-index ya se gestiona en titleOverlayClasses.
          const thumbUrl = getYoutubeThumbnail(video);

          return (
            <SwiperSlide
              key={`${carouselId}-${video.id || index}-${index}`}
              style={{ width: 'auto' }}
              className={slideClasses}
            >
              <Focusable
                id={`video-card-${carouselId}-${video.id || 'no-id'}-${index}`}
                group={`carousel-${carouselId}`}
                onSelect={() => handleVideoClick(video)}
                onFocus={() => {
                  if (swiperRef.current?.swiper) {
                    swiperRef.current.swiper.slideToLoop(index);
                  }
                }}
                focusClassName=""
                layer={layer || 3}
              >
                {({ isFocused }) => (
                  <div className="relative">
                    {/* Borde blanco overlay - solo visible cuando está enfocado */}
                    {isFocused && (
                      <div className="absolute inset-0 border-8 border-white rounded-xl pointer-events-none z-50" />
                    )}
                    {/* Contenido de la miniatura */}
                    <div className="relative w-[258px] cursor-pointer group rounded-xl overflow-hidden border border-white/5 transition-transform duration-200">
                      <div className="relative w-[258px] aspect-video flex items-center justify-center bg-black">
                        <Image
                          src={thumbUrl}
                          alt={cleanTitle(video.nombre) || "Miniatura de video"}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          priority={index === 0}
                          loading={index === 0 ? 'eager' : 'lazy'}
                          className={`${(isLiveOrEvent || isSearchResult) ? 'object-contain' : 'object-cover'} transition-transform duration-300 group-hover:scale-110`}
                          // LA SOLUCIÓN MÁGICA:
                          unoptimized={false}
                          onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='; }}
                        />
                      </div>
                      <div className={titleOverlayClasses}>
                        <p className="text-white font-bold uppercase leading-tight text-sm drop-shadow-md">{cleanTitle(video.nombre)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </Focusable>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default ExclusiveVideoCarousel;