'use client';

import React, { useState, useEffect } from 'react';
import DesktopLayout from './layout/DesktopLayout';
import MobileLayout from './layout/MobileLayout';
import { useMediaPlayer } from '@/context/MediaPlayerContext';

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024); // Use 1024px as the breakpoint for desktop layout
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  return isMobile;
};

const HomePageClient = ({ data }) => {
  const isMobile = useIsMobile();
  const [hasMounted, setHasMounted] = useState(false);
  const { loadInitialPlaylist } = useMediaPlayer();

  useEffect(() => {
    setHasMounted(true);
    // Una vez que el componente se monta, iniciamos la lógica de la playlist.
    const params = new URLSearchParams(window.location.search);
    const videoUrl = params.get('videoUrl');
    
    loadInitialPlaylist(videoUrl); // El contexto se encargará si el videoUrl es nulo o no

    // Limpiar la URL si venía con parámetro para no recargar el mismo video si el usuario refresca
    if (videoUrl) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [loadInitialPlaylist]); // Se ejecuta solo una vez


  if (!hasMounted) {
    return null; // Evita mismatch de hidratación
  }

  if (isMobile) {
    return <MobileLayout data={data} isMobile={isMobile} />;
  }

  return <DesktopLayout data={data} isMobile={isMobile} />;
};

export default HomePageClient;