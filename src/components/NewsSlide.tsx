'use client';

import React, { useEffect, useRef } from 'react';
import { Article } from '@/lib/types';
import { isValidSlideUrl } from '@/lib/utils';

interface NewsSlideProps {
  article: Article | null;
  onEnd: () => void; // Prop para notificar la finalización
}

const NewsSlide: React.FC<NewsSlideProps> = ({ article, onEnd }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // If the article or its slide URL is invalid, end the process.
    if (!article || !isValidSlideUrl(article.url_slide)) {
      onEnd();
      return; // Exit the effect.
    }

    // Otherwise, play the video.
    const video = videoRef.current;
    if (video) {
      video.play().catch(error => {
        console.error("La reproducción automática del video falló:", error);
      });
    }
  }, [article, onEnd]);

  // Render nothing if the article is invalid. This check happens after hooks.
  if (!article || !isValidSlideUrl(article.url_slide)) {
    return null;
  }

  return (
    <div className="absolute inset-0 w-full h-full bg-black">
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out forwards;
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

      <video
        ref={videoRef}
        src={article.url_slide}
        className="w-full h-full object-cover animate-fadeIn"
        onEnded={onEnd}
        autoPlay
        muted
        playsInline
      />

      <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-12 z-10 pointer-events-none">
        <div className="text-white w-full">
          <h1 className="text-3xl md:text-6xl font-bold leading-tight mb-4 opacity-0 animate-slideUp" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}>
            {article.titulo}
          </h1>
          {article.resumen && (
            <div className="relative w-full bg-red-600/80 text-white overflow-hidden whitespace-nowrap py-2 mt-4">
              <p className="inline-block text-lg md:text-xl font-semibold animate-ticker pl-4">
                {article.resumen}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsSlide;
