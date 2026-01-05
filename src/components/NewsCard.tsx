'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react'; 
import { Article, SlideMedia } from '@/lib/types';
import { format } from 'date-fns';
import { useNewsPlayer } from '@/context/NewsPlayerContext';
import { cn } from '@/lib/utils';
import { useMediaPlayer } from '@/context/MediaPlayerContext';

interface NewsCardProps {
  newsItem: any;
  index?: number;
  className?: string;
  isFeatured?: boolean;
}

// FIX DEFINITIVO: Usamos 'new RegExp' con cadena de texto.
// Esto evita cualquier error de sintaxis con las barras '/' en Vercel.
const YOUTUBE_REGEX = new RegExp('(?:youtube\\.com\\/(?:[^/]+\\/.+\\/|(?:v|e(?:mbed)?)\\/|.*[?&]v=)|youtu\\.be\\/)([^"&?/\\s]{11})');

const NewsCard: React.FC<NewsCardProps> = ({ newsItem, index = 0, className = '', isFeatured = false }) => {
  const { playSlide } = useNewsPlayer();
  const { playTemporaryVideo } = useMediaPlayer();

  if (!newsItem) return null;

  const title = newsItem.title || newsItem.titulo;
  
  const getProcessedImageUrl = (inputUrl: string | undefined | null): string => {
      if (!inputUrl) {
          return '/placeholder.png';
      }
      
      const cleanUrl = inputUrl.trim();
      
      // 1. Usamos la constante definida arriba
      const ytMatch = cleanUrl.match(YOUTUBE_REGEX);
      
      if (ytMatch && ytMatch[1]) {
          return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
      }

      // 2. Si ya es absoluta (http/https), úsala tal cual
      if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
          return cleanUrl;
      }

      // 3. Si es relativa, concatena el dominio de medios
      return `${process.env.NEXT_PUBLIC_MEDIA_URL || ''}${cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`}`;
  };

  const finalImageUrl = getProcessedImageUrl(newsItem.image_url || newsItem.imageUrl);
  
  // DETECCIÓN INTELIGENTE: Si es YouTube, no la optimizamos (evita error 400 en Vercel)
  const isYouTubeImage = finalImageUrl.includes('youtube.com') || finalImageUrl.includes('ytimg.com');

  const createdAt = newsItem.created_at || newsItem.fecha;
  const audioUrl = newsItem.audio_url || newsItem.audioUrl;
  const urlSlide = newsItem.url_slide || newsItem.urlSlide;
  const duration = newsItem.animation_duration || 15;

  const hasSlide = !!urlSlide;
  const isHtmlSlide = hasSlide && urlSlide.endsWith('.html');
  const hasAudioImage = !!finalImageUrl && !!audioUrl;
  const isPlayable = hasSlide || hasAudioImage;

  const handlePlaySlide = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (isHtmlSlide) {
        if (playSlide) {
            playSlide({
                url: urlSlide,
                type: 'html',
                duration: duration
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
            duration: duration
        };
    } else if (hasAudioImage) {
        mediaData = {
            id: newsItem.id.toString(),
            type: 'image',
            url: "", 
            imageSourceUrl: finalImageUrl,
            audioSourceUrl: audioUrl,
            nombre: title,
            createdAt: createdAt,
            categoria: 'Noticias',
            imagen: finalImageUrl,
            novedad: true,
            duration: duration
        };
    }

    if (mediaData) {
        playTemporaryVideo(mediaData);
    }
  };

  const priority = index < 4;
  const titleSizeClass = isFeatured ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl';

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={cn(
        "group relative flex flex-col rounded-xl overflow-hidden transition-all duration-300 h-full",
        "shadow-[0_4px_20px_rgba(0,0,0,0.5)] dark:shadow-[0_0_20px_rgba(255,255,255,0.3)]",
        "hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)] dark:hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]",
        "cursor-pointer", // Aseguramos cursor de mano
        className
      )}
      onClick={handlePlaySlide} // AQUI ES DONDE QUIERO LA ACCIÓN PRINCIPAL
    >
      <div className="relative w-full h-full aspect-video overflow-hidden bg-black">
        {/* La imagen ya no necesita onClick separado, es parte del contenedor */}
        <Image
          src={finalImageUrl}
          alt={title || 'Noticia'}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          priority={priority}
          unoptimized={isYouTubeImage} 
          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.jpg'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-90" />

        {createdAt && (
          <div className="absolute top-3 left-3">
            <span className="bg-black/40 backdrop-blur-md text-white text-[9px] md:text-[11px] font-medium px-2 py-1 rounded border border-white/10 shadow-sm">
                {format(new Date(createdAt), "dd/MM/yyyy")}
            </span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 w-full p-4">
            <h3 className={`font-bold ${titleSizeClass} text-white leading-tight drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] group-hover:text-blue-200 transition-colors line-clamp-3`}>
              {title}
            </h3>
        </div>

        {/* Indicador visual de Play (Opcional, pero recomendado para UX) */}
        {isPlayable && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                 <Play size={48} className="text-white/80 drop-shadow-lg" />
            </div>
        )}
      </div>
    </motion.article>
  );
};

export default NewsCard;