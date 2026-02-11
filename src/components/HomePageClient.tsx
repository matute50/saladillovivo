'use client';

import React, { useState, useEffect } from 'react';
import TvModeLayout from '@/components/layout/TvModeLayout';
import { PageData } from '@/lib/types';
import { usePlayerStore } from '@/store/usePlayerStore';

/**
 * HomePageClient - Componente principal del lado del cliente.
 * Recibe 'initialData' desde page.tsx (Servidor).
 */
const HomePageClient = ({ initialData }: { initialData: PageData }) => {
  const [mounted, setMounted] = useState(false);
  const { loadInitialPlaylist } = usePlayerStore();

  useEffect(() => {
    setMounted(true);

    // 2. Debug de datos (Ayuda a detectar los "faltantes" en la consola del PC)
    if (process.env.NODE_ENV === 'development') {
      console.log("Saladillo Vivo TV - Iniciando en Modo TV");
      console.log("Datos cargados:", {
        articulos: initialData?.articles?.secondaryNews?.length || 0,
        noticiaPrincipal: !!initialData?.articles?.featuredNews,
        videos: initialData?.videos?.recentVideos?.length || 0,
        eventos: initialData?.events?.length || 0
      });
    }

    loadInitialPlaylist(null); // Call to initiate playback
  }, [initialData, loadInitialPlaylist]);

  // Prevenir errores de hidratación: el servidor y el cliente deben coincidir en el primer render
  if (!mounted) {
    return <div className="min-h-screen bg-black" />;
  }

  // Validación defensiva: Si no hay datos, evitamos que TvModeLayout falle
  if (!initialData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Cargando experiencia TV...
      </div>
    );
  }

  // SIEMPRE Modo TV
  return <TvModeLayout />;
};

export default HomePageClient;