'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Play } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Article } from '@/lib/types';
import Image from 'next/image';
import NewsSlide from './NewsSlide';
import { useMediaPlayer } from '@/context/useMediaPlayer';
import { useVolume } from '@/context/VolumeContext';
import ReactPlayer from 'react-player';
import { supabase } from '@/lib/supabaseClient';

// --- Helper function to fetch random intros ---
async function getRandomIntroUrls(count: number): Promise<string[]> {
  const { data, error } = await supabase.from('intros').select('url');
  if (error || !data || data.length === 0) {
    console.error('Error fetching intros or no intros found:', error);
    return [];
  }
  const urls = data.map(item => item.url);
  // Shuffle and pick
  const shuffled = urls.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// --- The new Interrupt Sequence Modal Component ---
type InterruptPhase = 'INTRO_1' | 'SLIDE' | 'INTRO_2' | 'FADING_OUT' | 'IDLE';

interface InterruptSequenceModalProps {
  newsItem: Article;
  onClose: () => void;
  isMuted: boolean;
}

const InterruptSequenceModal: React.FC<InterruptSequenceModalProps> = ({ newsItem, onClose, isMuted }) => {
  const [phase, setPhase] = useState<InterruptPhase>('IDLE');
  const [introUrls, setIntroUrls] = useState<string[]>([]);
  const { setIsPlaying } = useMediaPlayer();
  const { unmute } = useVolume();

  // 1. Fetch intros on mount
  useEffect(() => {
    getRandomIntroUrls(2).then(urls => {
      if (urls.length === 2) {
        setIntroUrls(urls);
        setPhase('INTRO_1'); // Start the sequence once URLs are ready
      } else {
        // Fallback if intros can't be fetched
        console.warn("Could not fetch 2 intros, proceeding directly to slide.");
        setPhase('SLIDE');
      }
    });
  }, []);

  const handleSequenceEnd = useCallback(() => {
    setIsPlaying(true); // Resume main video
    unmute(); // Restore main volume
    onClose(); // Close the modal
  }, [setIsPlaying, unmute, onClose]);

  const handleIntro1End = () => setPhase('SLIDE');
  const handleSlideEnd = () => setPhase('INTRO_2');
  const handleIntro2End = () => {
    setPhase('FADING_OUT');
    // The fade-out animation will trigger the final cleanup
    setTimeout(handleSequenceEnd, 1000); // Match fade-out duration
  };

  const renderPhase = () => {
    switch (phase) {
      case 'INTRO_1':
        return (
          <motion.div key="intro1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
            className="flex items-center justify-center w-full h-full p-4" // Centering for the phase
          >
            <motion.div className="relative w-full max-w-[90vw] max-h-[90vh] aspect-video mx-auto my-auto"> {/* Inner content container */}
              <ReactPlayer
                url={introUrls[0]}
                playing={true}
                onEnded={handleIntro1End}
                width="100%"
                height="100%"
                playsinline
                muted
              />
            </motion.div>
          </motion.div>
        );
      case 'SLIDE':
        return (
          <motion.div key="slide" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}
            className="flex items-center justify-center w-full h-full p-4" // Centering for the phase
          >
            <motion.div className="relative w-full max-w-[90vw] max-h-[90vh] aspect-video mx-auto my-auto"> {/* Inner content container */}
              <NewsSlide
                article={newsItem}
                onClose={handleSlideEnd}
                isMuted={isMuted}
              />
            </motion.div>
          </motion.div>
        );
      case 'INTRO_2':
        return (
          <motion.div key="intro2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
            className="flex items-center justify-center w-full h-full p-4" // Centering for the phase
          >
            <motion.div className="relative w-full max-w-[90vw] max-h-[90vh] aspect-video mx-auto my-auto"> {/* Inner content container */}
              <ReactPlayer
                url={introUrls[1]}
                playing={true}
                onEnded={handleIntro2End}
                width="100%"
                height="100%"
                playsinline
                muted
              />
            </motion.div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center">
      <AnimatePresence mode="wait">
        {renderPhase()}
      </AnimatePresence>
    </div>
  );
};


// --- Modified NewsCard Component ---
interface NewsCardProps {
  newsItem: Article;
  variant: 'destacada-principal' | 'secundaria' | 'default';
  index?: number;
  className?: string;
}

const NewsCard: React.FC<NewsCardProps> = ({ newsItem, variant, index = 0, className = '' }) => {
  const [isSequenceOpen, setIsSequenceOpen] = useState(false);
  const { setIsPlaying } = useMediaPlayer();
  const { setVolume } = useVolume();

  // Fallback seguro si no hay datos
  if (!newsItem) return null;

  const { titulo, fecha, slug, imageUrl, audio_url } = newsItem;
  
  const hasSlide = !!(audio_url);

  const handlePlaySlideClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    // --- FASE 1: PAUSA & SILENCIO (Pre-roll) ---
    setIsPlaying(false); // Pausa el video principal
    setVolume(0);       // Silencia el video principal
    
    setIsSequenceOpen(true); // Abre el modal de la secuencia
  };

  const handleCloseSequence = () => {
    setIsSequenceOpen(false);
  };

  let cardClass = 'card overflow-hidden flex flex-col group cursor-pointer';
  let titleClass = '';
  const imageContainerClass = 'aspect-video';
  let dateDisplay;
  let priority = false;

  switch (variant) {
    case 'destacada-principal':
      cardClass += ' shadow-pop';
      titleClass = 'font-futura-bold text-3xl mt-2 text-card-foreground';
      priority = true;
      dateDisplay = (
        <div className="date-on-image">
          <Calendar size={12} className="inline-block mr-1" />
          {formatDate(fecha, 'numeric')}
        </div>
      );
      break;

    case 'secundaria':
    case 'default':
      cardClass += ' shadow-pop';
      titleClass = `font-futura-bold text-card-foreground group-hover:text-primary transition-colors ${variant === 'secundaria' ? 'text-lg line-clamp-4' : 'text-base line-clamp-3'}`;
      dateDisplay = (
        <div className="date-on-image">
          <Calendar size={10} className="mr-1" />
          <span>{formatDate(fecha, 'numeric')}</span>
        </div>
      );
      break;
  }

  const articleLink = `/noticia/${slug}`;

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className={`${cardClass} ${className}`}
        aria-label={`Noticia: ${titulo}`}
      >
        <div className="h-full w-full flex flex-col">
            <Link href={articleLink} passHref legacyBehavior>
                <a className="contents">
                    <div className={`relative news-image-container overflow-hidden ${imageContainerClass}`}>
                        <Image
                        src={imageUrl || "/placeholder.jpg"}
                        alt={titulo}
                        fill
                        objectFit="cover"
                        priority={priority}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.jpg'; }}
                        />
                        {dateDisplay}

                        {hasSlide && (
                        <div className="absolute bottom-2 right-2 z-20">
                            <button
                            onClick={handlePlaySlideClick}
                            className="z-10 bg-red-600 p-2 rounded-full border-2 border-white/20 shadow-lg
                                        hover:bg-red-700 hover:scale-110 transition-all
                                        flex items-center justify-center text-white"
                            aria-label="Reproducir noticia en formato slide"
                            >
                            <Play size={24} fill="currentColor" />
                            </button>
                        </div>
                        )}
                    </div>
                    <div className="p-2 flex flex-col flex-grow">
                        <h3 className={titleClass}>
                            {titulo}
                        </h3>
                    </div>
                </a>
            </Link>
        </div>
      </motion.article>

      <AnimatePresence>
        {isSequenceOpen && (
            <InterruptSequenceModal
              newsItem={newsItem}
              onClose={handleCloseSequence}
              isMuted={false} // El slide de noticia puede tener su propio sonido
            />
        )}
      </AnimatePresence>
    </>
  );
};

export default NewsCard;