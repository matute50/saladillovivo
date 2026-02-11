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
  const [isMounted, setIsMounted] = React.useState(false);
  const fetchInitialData = useNewsStore(state => state.fetchInitialData);

  useEffect(() => {
    setIsMounted(true);
    // Inicialización global de datos
    fetchInitialData();

    // Mobile Redirection Strategy
    const checkMobileAndRedirect = () => {
      if (typeof window !== 'undefined') {
        const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
        // Basic mobile detection regex
        if (/android|ipad|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase())) {
          window.location.href = "https://m.saladillovivo.com.ar";
        }
      }
    };

    checkMobileAndRedirect();
  }, [fetchInitialData]);

  const viewMode = usePlayerStore(state => state.viewMode);

  // Hydration safety: render basic structure until mounted
  if (!isMounted) {
    return <>{children}</>;
  }

  return (
    <>
      <PreloadIntros />
      {viewMode === 'diario' && <Header />}
      {children}
      {viewMode === 'diario' && <Footer />}
    </>
  );
}