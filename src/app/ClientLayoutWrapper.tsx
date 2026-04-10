'use client';

import React, { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PreloadIntros from '@/components/PreloadIntros';
import { usePlayerStore } from '@/store/usePlayerStore';

import StreamListener from '@/components/StreamListener';

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
}

export default function ClientLayoutWrapper({ children }: ClientLayoutWrapperProps) {
  useEffect(() => {
    // Inicialización global de diseño si es necesario
  }, []);

  const viewMode = usePlayerStore(state => state.viewMode);

  return (
    <>
      <PreloadIntros />
      <StreamListener />
      {viewMode === 'diario' && <Header />}
      {children}
      {viewMode === 'diario' && <Footer />}
    </>
  );
}