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

    // Mobile Redirection Strategy
    const checkMobileAndRedirect = () => {
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        // Exception: Do not redirect if already on TV subdomain
        if (hostname.startsWith('tv.')) {
          console.log("TV Subdomain detected. Skipping mobile redirection.");
          return;
        }

        const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
        // Basic mobile detection regex
        if (/android|ipad|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase())) {
          window.location.href = "https://m.saladillovivo.com.ar";
        }
      }
    };

    checkMobileAndRedirect();

    // TV Native Experience: Hide cursor on tv. subdomains
    if (typeof window !== 'undefined' && window.location.hostname.startsWith('tv.')) {
      document.body.classList.add('tv-cursor-hide');
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