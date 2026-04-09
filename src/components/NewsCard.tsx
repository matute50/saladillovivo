'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react'; 
import { SlideMedia } from '@/lib/types';
import { format } from 'date-fns';
import { useNewsPlayer } from '@/context/NewsPlayerContext';
import { cn } from '@/lib/utils';
import { useMediaPlayer } from '@/context/MediaPlayerContext';

// 1. CORRECCIÓN CLAVE: Aseguramos que la interfaz acepte 'onCardClick'
interface NewsCardProps {
  newsItem: any;
  index?: number;
  className?: string;
  isFeatured?: boolean;
}

const YOUTUBE_REGEX = new RegExp('(?:youtube\\.com\\/(?:[^/]+\\/.+\\/|(?:v|e(?:mbed)?)\\/|.*[?&]v=)|youtu\\.be\\/)([^"&?/\\s]{11})');

const NewsCard: React.FC<NewsCardProps> = ({ newsItem, index = 0, className = '', isFeatured = false }) => {
  const { playSlide } = useNewsPlayer();
  const { playTemporaryVideo, volume } = useMediaPlayer();

  if (!newsItem) return null;

  const title = newsItem.title || newsItem.titulo;
  
  const getProcessedImageUrl = (inputUrl: string | undefined | null): string => {
      if (!inputUrl) return '/placeholder.png';
      
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

  const finalImageUrl = getProcessedImageUrl(newsItem.image_url || newsItem.imageUrl);
  
  const createdAt = newsItem.created_at || newsItem.fecha;
  const rawAudioUrl = newsItem.audio_url || newsItem.audioUrl;
  const audioUrl = rawAudioUrl && rawAudioUrl.includes('pub-5b294f92f42e4cbda687d0122e15bc72.r2.dev') 
      ? rawAudioUrl.replace('pub-5b294f92f42e4cbda687d0122e15bc72.r2.dev', 'media.saladillovivo.com.ar') 
      : rawAudioUrl;
  const urlSlide = newsItem.url_slide || newsItem.urlSlide;
  const duration = newsItem.animation_duration || 15;

  const hasSlide = !!urlSlide;
  const isHtmlSlide = hasSlide && urlSlide.endsWith('.html');
  const hasAudioImage = !!finalImageUrl && !!audioUrl;
  const isPlayable = hasSlide || hasAudioImage;



  // Lógica para REPRODUCIR (Clic en toda la tarjeta)
  const handlePlaySlide = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Play synchronously in the click handler to bypass Safari/Chrome autoplay restrictions!
    if (audioUrl) {
      const audioEl = document.getElementById('global-slide-audio') as HTMLAudioElement;
      if (audioEl) {
         audioEl.volume = volume;
         audioEl.src = audioUrl;
         const playPromise = audioEl.play();
         if (playPromise !== undefined) {
            playPromise.catch(err => console.warn("AutoPlay still blocked:", err));
         }
      }
    }

    if (isHtmlSlide) {
        if (playSlide) {
            playSlide({
                url: urlSlide,
                type: 'html',
                duration: duration,
                audioUrl: audioUrl || null // <-- Audio de locución del estudio
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
  const titleSizeClass = isFeatured ? 'text-2xl md:text-3xl' : 'text-base md:text-lg';

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={cn(
        "group relative flex flex-col rounded-xl overflow-hidden transition-all duration-300 h-full",
        "shadow-[0_4px_20px_rgba(0,0,0,0.5)] dark:shadow-[0_0_20px_rgba(255,255,255,0.3)]",
        "hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)] dark:hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]",
        "cursor-pointer", 
        className
      )}
      onClick={handlePlaySlide} // 2. CORRECCIÓN UX: Clic general dispara video
    >
      <div className="relative w-full h-full aspect-video overflow-hidden bg-black">
        <Image
          src={finalImageUrl}
          alt={title || 'Noticia'}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          priority={priority}
          unoptimized={true} 
          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.jpg'; }}
        />
        {/* Capa de Blur (Viñeta) - Solo en el área del texto para no empañar el contenido principal */}
        <div 
          className="absolute inset-x-0 bottom-0 h-2/3 backdrop-blur-md z-10 pointer-events-none" 
          style={{ 
            maskImage: 'linear-gradient(to top, black 15%, transparent 80%)',
            WebkitMaskImage: 'linear-gradient(to top, black 15%, transparent 80%)'
          }} 
        />
        {/* Viñeta oscura clásica para contraste del texto */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-100 z-10" />

        {createdAt && (
          <div className="absolute top-3 left-3">
            <span className="bg-black/60 backdrop-blur-md text-white text-[9px] md:text-[11px] font-medium px-2 py-1 rounded border border-white/10 shadow-sm">
                {format(new Date(createdAt), "dd/MM/yyyy")}
            </span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 w-full p-4 pr-12"> {/* pr-12 para dejar espacio al icono play */}
            <h3 className={`font-bold ${titleSizeClass} text-white leading-tight drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] group-hover:text-blue-200 transition-colors line-clamp-3`}>
              {title}
            </h3>
        </div>

        {/* Indicador de Play sutil en esquina inferior derecha */}
        {isPlayable && (
            <div className={cn(
                "absolute bottom-2 right-2 flex items-center justify-center rounded-full p-0.5 border border-white shadow-lg shadow-black/50 backdrop-blur-md bg-black/40 group-hover:!bg-[#003399] group-hover:bg-opacity-100",
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