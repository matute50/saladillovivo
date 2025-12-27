'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { Article, SlideMedia } from '@/lib/types';
import { format } from 'date-fns';

import { useMediaPlayer } from '@/context/MediaPlayerContext';







interface NewsCardProps {







  newsItem: any;







  index?: number;







  className?: string;







  onCardClick?: (article: Article) => void;







  isFeatured?: boolean;







}















const NewsCard: React.FC<NewsCardProps> = ({ newsItem, index = 0, className = '', onCardClick, isFeatured = false }) => {







  const { playTemporaryVideo } = useMediaPlayer();















  if (!newsItem) return null;















  // Standardize property access







  const title = newsItem.title || newsItem.titulo;







  const slug = newsItem.slug;







  const imageUrl = newsItem.imageUrl;







      const createdAt = newsItem.created_at || newsItem.fecha;
  
      const hasAnySlideUrl = !!newsItem.url_slide;
      const isWebmVideoSlide = hasAnySlideUrl && newsItem.url_slide.endsWith('.webm');
      const isMp4VideoSlide = hasAnySlideUrl && newsItem.url_slide.endsWith('.mp4'); // Consider MP4 as video slide
      const hasImageAudioForSlide = !!newsItem.image_url && !!newsItem.audio_url;
  
      // console.log('DEBUG NewsCard - newsItem.id:', newsItem.id);
      // console.log('DEBUG NewsCard - newsItem.url_slide:', newsItem.url_slide);
      // console.log('DEBUG NewsCard - hasAnySlideUrl:', hasAnySlideUrl);
      // console.log('DEBUG NewsCard - isWebmVideoSlide:', isWebmVideoSlide);
      // console.log('DEBUG NewsCard - isMp4VideoSlide:', isMp4VideoSlide);
      // console.log('DEBUG NewsCard - hasImageAudioForSlide:', hasImageAudioForSlide);
      // console.log('DEBUG NewsCard - hasWebmSlide (final):', hasWebmSlide); // Keep this for clarity if needed.
  
    const handleImageClick = (e: React.MouseEvent) => {
      if (onCardClick) {
        e.stopPropagation();
        e.preventDefault();
        onCardClick(newsItem);
      }
    };
  
    const handlePlaySlide = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
  
      // Determine the slide type and construct SlideMedia object
      let slideToPlay: SlideMedia | null = null;
  
      if (isWebmVideoSlide || isMp4VideoSlide) {
        // It's a video slide
        slideToPlay = {
          id: newsItem.id.toString(),
          nombre: title,
          url: newsItem.url_slide!, // Asserting because isWebmVideoSlide implies url_slide exists
          createdAt: createdAt,
          categoria: 'Slides',
          imagen: imageUrl || '/placeholder.png',
          novedad: false,
          type: 'video',
        };
      } else if (hasImageAudioForSlide) {
        // It's an image + audio slide
        slideToPlay = {
          id: newsItem.id.toString(),
          nombre: title,
          imageSourceUrl: newsItem.image_url!, // Asserting because hasImageAudioForSlide implies image_url exists
          audioSourceUrl: newsItem.audio_url!, // Asserting because hasImageAudioForSlide implies audio_url exists
          createdAt: createdAt,
          categoria: 'Slides',
          imagen: imageUrl || '/placeholder.png',
          novedad: false,
          type: 'image', // New type for image+audio slides
          url: "", // Placeholder para satisfacer la interfaz SlideMedia
        };
      }
  
      if (slideToPlay) {
        playTemporaryVideo(slideToPlay);
      }
    };
  
    const articleLink = `/noticia/${slug || newsItem.id}`;
    const priority = index < 4; // Prioritize loading for first few images
  
    const titleSizeClass = isFeatured ? 'text-[28.224px]' : 'text-[19.494px]';
  
    return (
      <>
  
        <motion.article
  
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className={`group relative flex flex-col bg-main-gradient rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 h-full ${className || ''}`}
          aria-label={`Noticia: ${title}`}
        >
                  <div className="relative w-full aspect-video overflow-hidden cursor-pointer" onClick={handleImageClick}>
                    <Link href={articleLink} passHref legacyBehavior>
                      <a>
                        <Image
                          src={imageUrl || '/placeholder.png'}
                          alt={title || 'Noticia'}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          priority={priority}
                          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.jpg'; }}
                        />
                      </a>
                    </Link>
                    {createdAt && (
                      <span className="date-on-image">
                          {format(new Date(createdAt), "dd/MM/yyyy")}
                      </span>
                    )}
                    {(isWebmVideoSlide || isMp4VideoSlide || hasImageAudioForSlide) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <motion.button
                          onClick={handlePlaySlide}
                          className="flex items-center justify-center w-16 h-16 rounded-full bg-white bg-opacity-30 backdrop-blur-md text-white drop-shadow-lg"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Reproducir video"
                        >
                          <Play size={40} fill="currentColor" className="ml-1" />
                        </motion.button>
                      </div>
                    )}
                  </div>
        <div className="p-4 flex flex-col flex-grow">
          {/* <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <Clock size={14} />
            <span>{timeAgo}</span>
          </div> */}

          <Link href={articleLink} className="block flex-grow">
            <h3 className={`font-bold ${titleSizeClass} text-black dark:text-white text-shadow-[0_2px_4px_rgba(0,0,0,0.2)] dark:text-shadow-[0_2px_4px_rgba(0,0,0,0.5)] leading-tight hover:text-blue-700 transition-colors line-clamp-4`}>
              {title}
            </h3>
          </Link>
        </div>
      </motion.article>
    </>
  );
};

export default NewsCard;
