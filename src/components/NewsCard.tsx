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
  onCardClick?: (article: Article) => void;
  isFeatured?: boolean;
}

const NewsCard: React.FC<NewsCardProps> = ({ newsItem, index = 0, className = '', onCardClick, isFeatured = false }) => {
  const { playSlide } = useNewsPlayer();
  const { playTemporaryVideo } = useMediaPlayer();

  if (!newsItem) return null;

  const title = newsItem.title || newsItem.titulo;
  
  const getProcessedImageUrl = (inputUrl: string | undefined | null): string => {
      if (!inputUrl) {
          return '/placeholder.png';
      }
      
      const cleanUrl = inputUrl.trim();
      
      // FIX DEFINITIVO: Usamos 'new RegExp' para evitar conflictos con las barras '/'
      // Esto satisface tanto al parser de JS como a las reglas de ESLint.
      try {
        const youtubeRegex = new RegExp('(?:youtube\\.com\\/(?:[^/]+\\/.+\\/|(?:v|e(?:mbed)?)\\/|.*[?&]v=)|youtu\\.be\\/)([^"&?/\\s]{11})');
        const ytMatch = cleanUrl.match(youtubeRegex);
        
        if (ytMatch && ytMatch[1]) {
            return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
        }
      } catch (e) {
        // Fallback silencioso por si el regex falla
      }

      // Si ya es absoluta (http/https), úsala tal cual
      if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
          return cleanUrl;
      }

      // Si es relativa, concatena el dominio de medios
      return `${process.env.NEXT_PUBLIC_MEDIA_URL || ''}${cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`}`;
  };

  const finalImageUrl = getProcessedImageUrl(newsItem.image_url || newsItem.imageUrl);
  
  const createdAt = newsItem.created_at || newsItem.fecha;
  const audioUrl = newsItem.audio_url || newsItem.audioUrl;
  const urlSlide = newsItem.url_slide || newsItem.urlSlide;
  const duration = newsItem.animation_duration || 15;

  const hasSlide = !!urlSlide;
  const isHtmlSlide = hasSlide && urlSlide.endsWith('.html');
  const hasAudioImage = !!finalImageUrl && !!audioUrl;
  const isPlayable = hasSlide || hasAudioImage;

  const handleOpenNews = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onCardClick) {
      onCardClick(newsItem);
    }
  };

  const handlePlaySlide = (e: React.MouseEvent) => {
    e.stopPropagation();
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
        className
      )}
    >
      <div className="relative w-full h-full aspect-video overflow-hidden bg-black">
        <div 
          className="absolute inset-0 z-10 cursor-pointer"
          onClick={handleOpenNews}
          title="Leer noticia"
        >
            <Image
              src={finalImageUrl}
              alt={title || 'Noticia'}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              priority={priority}
              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.jpg'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-90" />

            {createdAt && (
              <div className="absolute top-3 left-3">
                <span className="bg-black/60 backdrop-blur-md text-white text-[9px] md:text-[11px] font-medium px-2 py-1 rounded border border-white/10 shadow-sm">
                    {format(new Date(createdAt), "dd/MM/yyyy")}
                </span>
              </div>
            )}

            <div className="absolute bottom-0 left-0 w-full p-4">
                <h3 className={`font-bold ${titleSizeClass} text-white leading-tight drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] group-hover:text-blue-200 transition-colors line-clamp-3`}>
                  {title}
                </h3>
            </div>
        </div>

        {isPlayable && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
            <motion.button
              onClick={handlePlaySlide} 
              className="pointer-events-auto flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/50 text-white shadow-[0_0_15px_rgba(0,0,0,0.5)] opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[#012078] hover:border-[#012078] hover:scale-110 cursor-pointer"
              whileTap={{ scale: 0.95 }}
              title="Reproducir Slide en Multimedia"
            >
              <Play size={32} fill="currentColor" className="ml-1" />
            </motion.button>
          </div>
        )}
      </div>
    </motion.article>
  );
};

export default NewsCard;