'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react'; 
import { SlideMedia } from '@/lib/types';
import { format } from 'date-fns';
import { useNewsPlayerStore } from '@/store/useNewsPlayerStore';
import { cn } from '@/lib/utils';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useVolumeStore } from '@/store/useVolumeStore';

// 1. CORRECCIÓN CLAVE: Aseguramos que la interfaz acepte 'onCardClick'
interface NewsCardProps {
  newsItem: any;
  index?: number;
  className?: string;
  isFeatured?: boolean;
}

const YOUTUBE_REGEX = new RegExp('(?:youtube\\.com\\/(?:[^/]+\\/.+\\/|(?:v|e(?:mbed)?)\\/|.*[?&]v=)|youtu\\.be\\/)([^"&?/\\s]{11})');

const NewsCard: React.FC<NewsCardProps> = ({ newsItem, index = 0, className = '', isFeatured = false }) => {
<<<<<<< HEAD
  const { playSlide } = useNewsPlayerStore();
  const { playTemporaryVideo } = usePlayerStore();
  const { unmute, setVolume } = useVolumeStore();
=======
  const { playSlide } = useNewsPlayer();
  const { playTemporaryVideo, volume } = useMediaPlayer();
>>>>>>> f79c05b1de757249d336ae1a1955d3cb762736f4

  if (!newsItem) return null;

  const rawTitle = newsItem.title || newsItem.titulo;
  const title = rawTitle ? rawTitle.replace(/\|/g, '').replace(/\s{2,}/g, ' ').trim().toUpperCase() : '';

  
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
  const finalAudioUrl = getProcessedImageUrl(newsItem.audio_url || newsItem.audioUrl);
  
  const createdAt = newsItem.created_at || newsItem.fecha;
<<<<<<< HEAD
=======
  const rawAudioUrl = newsItem.audio_url || newsItem.audioUrl;
  const audioUrl = rawAudioUrl && rawAudioUrl.includes('pub-5b294f92f42e4cbda687d0122e15bc72.r2.dev') 
      ? rawAudioUrl.replace('pub-5b294f92f42e4cbda687d0122e15bc72.r2.dev', 'media.saladillovivo.com.ar') 
      : rawAudioUrl;
>>>>>>> f79c05b1de757249d336ae1a1955d3cb762736f4
  const urlSlide = newsItem.url_slide || newsItem.urlSlide;
  const duration = newsItem.animation_duration || 15;

  const hasSlide = !!urlSlide;
  const isHtmlSlide = hasSlide && urlSlide.endsWith('.html');
  const hasAudioImage = !!finalImageUrl && !!finalAudioUrl;
  const isPlayable = hasSlide || hasAudioImage;



  // Lógica para REPRODUCIR (Clic en toda la tarjeta)
  const handlePlaySlide = (e: React.MouseEvent) => {
    e.preventDefault();
    
<<<<<<< HEAD
    // Des-muteo proactivo para capturar la bendición del navegador (PC Autoplay fix)
    unmute();
    setVolume(1);

    if (isHtmlSlide) {
        if (playSlide) {
            playSlide({
                url: urlSlide,
                type: 'html',
                duration: duration,
                audioUrl: finalAudioUrl,
                title: title
=======
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

    // Reproducir a través del Slide Player si es HTML o puramente Imagen+Audio
    if (isHtmlSlide || (!hasSlide && hasAudioImage)) {
        if (playSlide) {
            playSlide({
                url: isHtmlSlide ? urlSlide : finalImageUrl,
                type: isHtmlSlide ? 'html' : 'image',
                duration: duration || 15,
                audioUrl: audioUrl || null
>>>>>>> f79c05b1de757249d336ae1a1955d3cb762736f4
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
<<<<<<< HEAD
    } else if (hasAudioImage) {
        mediaData = {
            id: newsItem.id.toString(),
            type: 'image',
            url: "", 
            imageSourceUrl: finalImageUrl,
            audioSourceUrl: finalAudioUrl,
            nombre: title,
            createdAt: createdAt,
            categoria: 'Noticias',
            imagen: finalImageUrl,
            novedad: true,
            duration: duration
        };
=======
>>>>>>> f79c05b1de757249d336ae1a1955d3cb762736f4
    }

    if (mediaData) {
        playTemporaryVideo(mediaData, 1, setVolume);
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
        "border-0 border-transparent shadow-none outline-none",
        "hover:scale-[1.02] hover:shadow-none",
        "cursor-pointer", 
        className
      )}
      onClick={handlePlaySlide} 
    >
      <div className="relative w-full h-full aspect-video overflow-hidden bg-black border-0">
        <Image
          src={finalImageUrl}
          alt={title || 'Noticia'}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          priority={priority}
          unoptimized={true} 
          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.jpg'; }}
        />
<<<<<<< HEAD
        {/* Viñeta Negra Intensificada sin blur sobre la imagen */}
        <div className="absolute inset-0 z-10 pointer-events-none bg-black/10 [mask-image:radial-gradient(circle,transparent_30%,black_100%)] shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />
        <div className="absolute inset-x-0 top-0 h-[50%] bg-gradient-to-b from-black/95 via-black/50 to-transparent opacity-100 z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-90 z-20" />
=======
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
>>>>>>> f79c05b1de757249d336ae1a1955d3cb762736f4

        {createdAt && (
          <div className="absolute top-3 left-3 z-30">
            <span className="bg-black/60 backdrop-blur-md text-white text-[9px] md:text-[11px] font-medium px-2 py-1 rounded shadow-sm">
                {format(new Date(createdAt), "dd/MM/yyyy")}
            </span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 w-full p-4 pr-12 z-30"> {/* pr-12 para dejar espacio al icono play */}
            <h3 className={`font-bold ${titleSizeClass} text-white leading-tight drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] group-hover:text-blue-200 transition-colors line-clamp-3`}>
              {title}
            </h3>
        </div>

        {/* Indicador de Play sutil en esquina inferior derecha */}
        {isPlayable && (
            <div className={cn(
                "absolute bottom-2 right-2 flex items-center justify-center rounded-full p-0.5 border border-white/70 shadow-lg shadow-black/50 backdrop-blur-md bg-black/40 group-hover:!bg-[#003399] group-hover:border-white group-hover:bg-opacity-100 z-30",
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
