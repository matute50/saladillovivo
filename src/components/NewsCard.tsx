'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react'; // Eliminamos Volume2 y VolumeX
import { Article } from '@/lib/types';
import { format } from 'date-fns';
import { useNewsPlayer } from '@/context/NewsPlayerContext';
import { useVolume } from '@/context/VolumeContext'; // Mantenemos el hook de volumen
import { cn } from '@/lib/utils';

interface NewsCardProps {
  newsItem: any;
  index?: number;
  className?: string;
  onCardClick?: (article: Article) => void;
  isFeatured?: boolean;
}

const NewsCard: React.FC<NewsCardProps> = ({ newsItem, index = 0, className = '', onCardClick, isFeatured = false }) => {
  const { playSlide } = useNewsPlayer();
  const { isMuted, toggleMute } = useVolume(); // Mantenemos el uso del hook de volumen

  if (!newsItem) return null;

  const title = newsItem.title || newsItem.titulo;
  const imageUrl = newsItem.imageUrl || newsItem.image_url || '/placeholder.png';
  const createdAt = newsItem.created_at || newsItem.fecha;
  const audioUrl = newsItem.audio_url || newsItem.audioUrl;
  const urlSlide = newsItem.url_slide || newsItem.urlSlide;
  const duration = newsItem.animation_duration || 15;

  const hasSlide = !!urlSlide;
  const isHtmlSlide = hasSlide && urlSlide.endsWith('.html');
  const hasAudioImage = !!imageUrl && !!audioUrl;
  const isPlayable = hasSlide || hasAudioImage;

  const handleOpenNews = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onCardClick) {
      onCardClick(newsItem);
    }
  };

  const handleToggleMuteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Si la noticia tiene un slide HTML, lo reproducimos como antes.
    if (isHtmlSlide) {
        console.log("▶ Reproduciendo Slide HTML en Overlay:", title);
        if (playSlide) {
            playSlide({
                url: urlSlide,
                type: 'html',
                duration: duration
            });
        } else {
            console.error("NewsPlayer no disponible para reproducir HTML");
        }
        return;
    }

    // Para cualquier otro tipo de slide, controlamos el mute.
    console.log(`🔊 Clic para alternar mute. Estado actual: ${isMuted ? 'Muted' : 'Unmuted'}`);
    toggleMute();
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
              src={imageUrl}
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
              onClick={handleToggleMuteClick} // Mantenemos la nueva función
              className="pointer-events-auto flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/50 text-white shadow-[0_0_15px_rgba(0,0,0,0.5)] opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[#012078] hover:border-[#012078] hover:scale-110 cursor-pointer"
              whileTap={{ scale: 0.95 }}
              title="Reproducir Slide en Multimedia" // Título restaurado
            >
              {/* Ícono Play restaurado */}
              <Play size={32} fill="currentColor" className="ml-1" />
            </motion.button>
          </div>
        )}
      </div>
    </motion.article>
  );
};

export default NewsCard;