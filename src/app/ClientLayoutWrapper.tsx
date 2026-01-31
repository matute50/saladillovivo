'use client';

import React, { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PreloadIntros from '@/components/PreloadIntros';
import { useNewsStore } from '@/store/useNewsStore';
import { usePlayerStore } from '@/store/usePlayerStore';

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
}

export default function ClientLayoutWrapper({ children }: ClientLayoutWrapperProps) {
  const fetchData = useNewsStore(state => state.fetchData);
  const loadInitialPlaylist = usePlayerStore(state => state.loadInitialPlaylist);

  useEffect(() => {
    // Inicialización global de datos
    fetchData();
    // La playlist se suele cargar cuando el reproductor está listo o en HomePage
    // Pero podemos asegurar una carga inicial aquí si es necesario.
  }, [fetchData]);

  const viewMode = usePlayerStore(state => state.viewMode);

  return (
    <>
      <PreloadIntros />
      {viewMode === 'diario' && <Header />}
      {children}
      {viewMode === 'diario' && <Footer />}
    </>
  );
}