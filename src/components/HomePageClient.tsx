'use client';

import React, { useState, useEffect } from 'react';
import DesktopLayout from '@/components/layout/DesktopLayout';
import TvModeLayout from '@/components/layout/TvModeLayout';
import { PageData } from '@/lib/types';
import { usePlayerStore } from '@/store/usePlayerStore';

/**
 * HomePageClient - Componente principal del lado del cliente.
 * Recibe 'initialData' desde page.tsx (Servidor).
 */
const HomePageClient = ({ initialData }: { initialData: PageData }) => {
  const [mounted, setMounted] = useState(false);
  const { loadInitialPlaylist, viewMode } = usePlayerStore();

  useEffect(() => {
    setMounted(true);

    // 2. Debug de datos (Ayuda a detectar los "faltantes" en la consola del PC)
    if (process.env.NODE_ENV === 'development') {
      console.log("Saladillo Vivo - Datos cargados:", {
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

  // Validación defensiva: Si no hay datos, evitamos que DesktopLayout/MobileLayout fallen
  if (!initialData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Cargando contenidos...
      </div>
    );
  }

  // Prioridad 1: Modo TV (si está activo, gana a todo)
  if (viewMode === 'tv') {
    return <TvModeLayout />;
  }

  // Prioridad 2: SIEMPRE Desktop (Mobile eliminado)
  return <DesktopLayout data={initialData} />;
};

export default HomePageClient;