'use client';

import React from 'react';

import SmartImage from '@/components/ui/SmartImage';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { SlideMedia } from '@/lib/types';
import { format } from 'date-fns';
import { useNewsPlayerStore } from '@/store/useNewsPlayerStore';
import { cn, cleanTitle } from '@/lib/utils';
import { usePlayerStore } from '@/store/usePlayerStore';


interface NewsCardProps {
  newsItem: any;
  index?: number;
  className?: string;
  isFeatured?: boolean;
}

const YOUTUBE_REGEX = new RegExp('(?:youtube\\.com\\/(?:[^/]+\\/.+\\/|(?:v|e(?:mbed)?)\\/|.*[?&]v=)|youtu\\.be\\/)([^"&?/\\s]{11})');

const NewsCard: React.FC<NewsCardProps> = ({ newsItem, index = 0, className = '', isFeatured = false }) => {
  const { playSlide } = useNewsPlayerStore();
  const { playTemporaryVideo } = usePlayerStore();

  if (!newsItem) return null;

  const title = cleanTitle(newsItem.title || newsItem.titulo);

  const getProcessedImageUrl = (inputUrl: string | undefined | null): string => {
    if (!inputUrl) return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

    const cleanUrl = inputUrl.trim();
    const ytMatch = cleanUrl.match(YOUTUBE_REGEX);

    if (ytMatch && ytMatch[1]) {
      return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
    }
    if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
      return cleanUrl;
    }
    return `${process.env.NEXT_PUBLIC_MEDIA_URL || ''}${cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`}`;
  };

  const getProcessedAudioUrl = (inputUrl: string | undefined | null): string | null => {
    if (!inputUrl) return null;
    const cleanUrl = inputUrl.trim();
    if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
      return cleanUrl;
    }
    return `${process.env.NEXT_PUBLIC_MEDIA_URL || ''}${cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`}`;
  };

  const finalImageUrl = getProcessedImageUrl(newsItem.image_url || newsItem.imageUrl);

  const createdAt = newsItem.created_at || newsItem.fecha;
  const audioUrl = getProcessedAudioUrl(newsItem.audio_url || newsItem.audioUrl);
  const urlSlide = newsItem.url_slide || newsItem.urlSlide;
  const duration = newsItem.animation_duration || 15;

  const hasSlide = !!urlSlide;
  const isHtmlSlide = hasSlide && urlSlide.endsWith('.html');
  const hasAudioImage = !!finalImageUrl && !!audioUrl;
  const isPlayable = hasSlide || hasAudioImage;



  // Lógica para REPRODUCIR (Clic en toda la tarjeta)
  const handlePlaySlide = (e: React.MouseEvent) => {
    e.preventDefault();

    if (isHtmlSlide) {
      if (playSlide) {
        playSlide({
          url: urlSlide,
          type: 'html',
          duration: duration,
          audioUrl: audioUrl,
          title: title,
          subtitle: newsItem.resumen || newsItem.description
        });
      }
      return;
    }

    let mediaData: SlideMedia | null = null;

    if (hasSlide && !isHtmlSlide) {
      mediaData = {
        id: newsItem.id.toString(),
        type: 'video',
        url: urlSlide,
        nombre: title,
        createdAt: createdAt,
        categoria: 'Noticias',
        imagen: finalImageUrl,
        novedad: true,
        duration: duration,
        resumen: newsItem.resumen || newsItem.description
      };
    }

    if (mediaData) {
      playTemporaryVideo(mediaData);
    }
  };

  const priority = index < 4;
  const titleSizeClass = isFeatured ? 'text-[23px] md:text-[29px]' : 'text-base md:text-lg';

  return (
    <motion.article
      initial={index < 8 ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={index < 8 ? { duration: 0.5, delay: index * 0.1 } : { duration: 0 }}
      className={cn(
        "group relative flex flex-col rounded-xl overflow-hidden transition-all duration-300 h-full",
        "shadow-[0_4px_20px_rgba(0,0,0,0.5)] dark:shadow-[0_0_20px_rgba(255,255,255,0.3)]",
        "hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)] dark:hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]",
        "cursor-pointer",
        className
      )}
      onClick={handlePlaySlide}
    >
      <div className="relative w-full h-full aspect-video overflow-hidden bg-black">
        <SmartImage
          src={finalImageUrl}
          alt={title || 'Noticia'}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110 will-change-transform"
          priority={priority}
          loading={priority ? 'eager' : 'lazy'}

        />
        {/* Viñeta Negra con Efecto Blur y Refuerzo Superior Intensificado */}
        <div className="absolute inset-0 z-10 pointer-events-none bg-black/10 backdrop-blur-[3px] [mask-image:radial-gradient(circle,transparent_30%,black_100%)] shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />
        <div className="absolute inset-x-0 top-0 h-[50%] bg-gradient-to-b from-black/95 via-black/50 to-transparent backdrop-blur-[2px] opacity-100 z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-90 z-20" />

        {createdAt && (
          <div className="absolute top-3 left-3 z-30">
            <span className="bg-black/60 backdrop-blur-md text-white text-[9px] md:text-[11px] font-medium px-2 py-1 rounded border border-white/10 shadow-sm">
              {format(new Date(createdAt), "dd/MM/yyyy")}
            </span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 w-full p-4 pr-12 z-30"> {/* z-30 para estar por encima de la viñeta */}
          <h3 className={`font-bold ${titleSizeClass} text-white leading-[0.9] [text-shadow:0_4px_8px_black,0_0_20px_black,0_0_10px_black] group-hover:text-blue-200 transition-colors line-clamp-4`}>
            {title}
          </h3>
        </div>

        {/* Indicador de Play sutil en esquina inferior derecha */}
        {isPlayable && (
          <div className={cn(
            "absolute bottom-2 right-2 flex items-center justify-center rounded-full p-0.5 border border-white shadow-lg shadow-black/50 backdrop-blur-md bg-black/40 group-hover:!bg-[#003399] group-hover:bg-opacity-100 z-30",
            isFeatured ? "w-11 h-11" : "w-8 h-8"
          )}>
            <Play
              size={isFeatured ? 25 : 18}
              fill="white"
              className="text-white drop-shadow-lg"
              strokeWidth={1.35}
            />
          </div>
        )}
      </div>



    </motion.article>
  );
};

export default NewsCard;