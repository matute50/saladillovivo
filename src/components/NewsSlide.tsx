'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { Article } from '@/lib/types';
import { X } from 'lucide-react';

interface NewsSlideContentProps {
  article: Article;
  onClose: () => void;
  isMuted?: boolean;
}

const NewsSlideContent: React.FC<NewsSlideContentProps> = ({ article, onClose, isMuted = false }) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (article.audio_url && audioRef.current) {
      audioRef.current.muted = isMuted;
      audioRef.current.play().catch(error => {
        console.error("Audio autoplay failed:", error);
      });

      const handleAudioEnd = () => {
        onClose();
      };

      audioRef.current.addEventListener('ended', handleAudioEnd);

      return () => {
        if (audioRef.current) {
          // eslint-disable-next-line react-hooks/exhaustive-deps
          audioRef.current.removeEventListener('ended', handleAudioEnd);
        }
      };
    } else {
        const timer = setTimeout(() => {
            onClose();
        }, 15000);

        return () => clearTimeout(timer);
    }
  }, [article.audio_url, isMuted, onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center animate-fadeIn">
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideUp {
          animation: slideUp 0.8s ease-out 0.5s forwards;
        }
        @keyframes ticker {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-ticker {
          animation: ticker 20s linear infinite;
        }
      `}</style>

      <div className="relative w-full h-full max-w-screen max-h-screen">
        {article.imageUrl && (
          <Image
            src={article.imageUrl}
            alt={article.titulo}
            layout="fill"
            objectFit="cover"
            className="opacity-40"
            priority
          />
        )}

        <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-12">
          <div className="text-white relative z-10 w-full">
            <h1 className="text-3xl md:text-6xl font-bold leading-tight mb-4 opacity-0 animate-slideUp" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}>
              {article.titulo}
            </h1>
            {article.resumen && (
              <div className="relative w-full bg-red-600/80 text-white overflow-hidden whitespace-nowrap py-2">
                 <p className="inline-block text-lg md:text-xl font-semibold animate-ticker pl-4">
                    {article.resumen}
                 </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-colors z-20"
        aria-label="Cerrar"
      >
        <X size={32} />
      </button>

      {article.audio_url && <audio ref={audioRef} src={article.audio_url} />}
    </div>
  );
};

interface NewsSlideProps {
  article: Article;
  onClose: () => void;
  isMuted?: boolean;
}

const NewsSlide: React.FC<NewsSlideProps> = ({ article, onClose, isMuted = false }) => {
  if (!article || !article.titulo) {
    return null;
  }
  
  return <NewsSlideContent article={article} onClose={onClose} isMuted={isMuted} />;
};

export default NewsSlide;
