'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { Article } from '@/lib/types';

interface NewsSlideProps {
  article: Article | null;
  onEnd: () => void; // Prop para notificar la finalización
}

const NewsSlide: React.FC<NewsSlideProps> = ({ article, onEnd }) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  // Efecto para reproducir el audio y manejar su finalización
  useEffect(() => {
    const audio = audioRef.current;
    if (article?.audio_url && audio) {
      audio.play().catch(error => {
        console.error("La reproducción automática del audio falló:", error);
      });
      
      // El evento 'ended' se maneja directamente en el elemento JSX con onEnded
      // Pero si quisiéramos usar un listener, sería así:
      // audio.addEventListener('ended', onEnd);
      // return () => audio.removeEventListener('ended', onEnd);

    } else if (!article?.audio_url) {
      // Si no hay audio, cerramos el modal después de un tiempo prudencial (ej. 15 segundos)
      const timer = setTimeout(() => {
        onEnd();
      }, 15000);

      return () => clearTimeout(timer);
    }
  }, [article, onEnd]);

  // Manejo de error si no hay datos
  if (!article) {
    return (
      <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black text-white p-4">
        <p className="text-lg text-red-500">Error: No se pudieron cargar los datos del slide.</p>
      </div>
    );
  }

  // Lógica principal: Priorizar url_slide para iframe
  if (article.url_slide) {
    return (
      <div className="w-full aspect-video bg-black rounded-lg overflow-hidden relative shadow-xl">
        <iframe
          src={article.url_slide}
          className="absolute inset-0 w-full h-full border-0"
          title={article.titulo || "Slide de Noticia"}
          allow="autoplay" // Permite la reproducción automática del contenido del iframe
          allowFullScreen // Permite pantalla completa si el contenido del iframe lo soporta
        />
      </div>
    );
  }

  // Fallback: Si no hay url_slide, renderizar el contenido de la noticia manualmente (lógica existente)
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

      {article.imageUrl && (
        <Image
          src={article.imageUrl}
          alt={article.titulo}
          layout="fill"
          objectFit="cover"
          className="opacity-40 animate-fadeIn"
          priority
        />
      )}

                          <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-12 z-10">

                            <div className="text-white w-full">

                              <h1 className="text-3xl md:text-6xl font-bold leading-tight mb-4 opacity-0 animate-slideUp" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}>

                                {article.titulo}

                              </h1>          {article.resumen && (
            <div className="relative w-full bg-red-600/80 text-white overflow-hidden whitespace-nowrap py-2 mt-4">
               <p className="inline-block text-lg md:text-xl font-semibold animate-ticker pl-4">
                  {article.resumen}
               </p>
            </div>
          )}
        </div>
      </div>

      {article.audio_url && <audio ref={audioRef} src={article.audio_url} onEnded={onEnd} />}
    </div>
  );
};

export default NewsSlide;