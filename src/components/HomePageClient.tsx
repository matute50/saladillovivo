'use client';

import React, { useState, useEffect } from 'react';
import DesktopLayout from '@/components/layout/DesktopLayout';
import MobileLayout from '@/components/layout/MobileLayout';
import { PageData } from '@/lib/types';

/**
 * HomePageClient - Componente principal del lado del cliente.
 * Recibe 'initialData' desde page.tsx (Servidor).
 */
const HomePageClient = ({ initialData }: { initialData: PageData }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // 1. Detección de dispositivo para renderizado condicional en el cliente
    const checkIsMobile = () => {
      // Usamos 1024px como límite para tablets/móviles en este componente
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    // 2. Debug de datos (Ayuda a detectar los "faltantes" en la consola del PC)
    if (process.env.NODE_ENV === 'development' || true) {
      console.log("Saladillo Vivo - Datos cargados:", {
        articulos: initialData?.articles?.secondaryNews?.length || 0,
        noticiaPrincipal: !!initialData?.articles?.featuredNews,
        videos: initialData?.videos?.recentVideos?.length || 0,
        eventos: initialData?.events?.length || 0
      });
    }

    return () => window.removeEventListener('resize', checkIsMobile);
  }, [initialData]);

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

  // El Middleware ya redirige al subdominio 'm.', pero este componente 
  // asegura que si cambias el tamaño del navegador en PC, la UI se adapte.
  if (isMobile) {
    return <MobileLayout data={initialData} isMobile={true} />;
  }

  // Renderizado para Desktop
  return <DesktopLayout data={initialData} />;
};

export default HomePageClient;