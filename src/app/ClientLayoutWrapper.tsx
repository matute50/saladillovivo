'use client';

import React, { useEffect } from 'react';
import PreloadIntros from '@/components/PreloadIntros';
import { useNewsStore } from '@/store/useNewsStore';

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

    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const userAgent = typeof navigator !== 'undefined' ? (navigator.userAgent || navigator.vendor || (window as any).opera).toLowerCase() : '';

    // Mobile Redirection Strategy
    const checkMobileAndRedirect = () => {
      if (hostname) {
        // Exception: Do not redirect if already on TV subdomain
        if (hostname.startsWith('tv.')) {
          console.log("TV Subdomain detected. Skipping mobile redirection.");
          return;
        }

        // Basic mobile detection regex
        if (/android|ipad|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
          window.location.href = "https://m.saladillovivo.com.ar";
        }
      }
    };

    checkMobileAndRedirect();

    // TV Native Experience: Hide cursor on tv. subdomains or standalone/android TV
    const isTV = hostname.startsWith('tv.') ||
      /android tv|tv|viera|smarttv/i.test(userAgent) ||
      (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches);

    if (typeof window !== 'undefined' && isTV) {
      document.body.classList.add('tv-cursor-hide');
      console.log("TV Experience Mode enabled: Cursor hidden.");
    }

    return () => {
      if (typeof window !== 'undefined') {
        document.body.classList.remove('tv-cursor-hide');
      }
    };
  }, [fetchInitialData]);

  // Hydration safety: render basic structure until mounted
  return (
    <>
      <div className={isMounted ? "opacity-100" : "opacity-0 invisible"} key="client-extras">
        <PreloadIntros />
      </div>

      {children}
    </>
  );
}