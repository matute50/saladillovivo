// src/app/[slug]/NoticiaClient.tsx
"use client";

import Image from 'next/image';
import React from 'react';
import { Play, Pause, Loader2 } from 'lucide-react'; 

// Simulación del hook 'useAudioPlayer'
const useAudioPlayer = (audioUrl: string | null) => {
    const state = { isPlaying: false, time: 0 };
    const play = () => console.log('Simulación: Audio Play');
    const pause = () => console.log('Simulación: Audio Pause');
    return { state, play, pause };
};

// Recibimos 'article' como prop desde la página de servidor
export default function NoticiaClient({ article }: { article: any }) {
  
  // 1. INICIALIZAMOS EL HOOK DE AUDIO (usando la simulación)
  const { state, play, pause } = useAudioPlayer(article.audio_url || null);

  // 2. FUNCIÓN PARA EL BOTÓN
  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    e.preventDefault();

    if (state.isPlaying) { // Corregido para usar la propiedad del objeto state
      pause();
    } else {
      play(); 
    }
  };

  // 3. RENDERIZAMOS EL HTML
  return (
    <main className="container mx-auto max-w-4xl px-4 py-8">
      <article>
        <h1 className="text-3xl font-bold leading-tight text-gray-900 dark:text-white md:text-4xl mb-4">
          {article.title}
        </h1>
        
        {/* --- INICIO DE CAMBIOS (IMAGEN Y BOTÓN) --- */}
        {article.imageUrl && (
          <div 
            // 1. IMAGEN MÁS PEQUEÑA: Cambiado max-w-4xl (del contenedor padre) a max-w-2xl y centrado
            className="max-w-2xl mx-auto rounded-lg shadow-lg mb-6 relative" 
            style={{ aspectRatio: '16 / 9' }}
          >
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="w-full h-full object-cover rounded-lg"
            />

            {/* 2. BOTÓN MOVIDO Y ESTILIZADO (como en la tarjeta) */}
            {article.audio_url && (
              <button
                onClick={handleTogglePlay}
                // Clases de esquina, tamaño pequeño, borde y sombra
                className="absolute bottom-4 right-4 z-10 
                           bg-black bg-opacity-50 text-white rounded-full 
                           w-10 h-10 flex items-center justify-center
                           hover:bg-opacity-70 transition-all focus:outline-none
                           ring-offset-background focus-visible:outline-none focus-visible:ring-2 
                           focus-visible:ring-ring focus-visible:ring-offset-2
                           border border-white drop-shadow-[0_0_15px_black]"
                aria-label={state.isPlaying ? "Pausar audio" : "Reproducir audio"}
              >
                {/* Íconos huecos y de tamaño 20px */}
                {state.isPlaying && <Pause size={20} />}
                {(!state.isPlaying) && <Play size={20} />}
              </button>
            )}
          </div>
        )}
        {/* --- FIN DE CAMBIOS --- */}


        {/* Cuerpo de la noticia (sin cambios) */}
        {article.text ? (
          <div
            className="prose prose-lg dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: article.text }}
          />
        ) : (
          <p className="text-lg dark:text-gray-300">{article.description}</p>
        )}
      </article>
    </main>
  );
}
