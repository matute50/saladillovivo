'use client';

import React, { useState, useEffect } from 'react';
import DesktopLayout from '@/components/layout/DesktopLayout';
import MobileLayout from '@/components/layout/MobileLayout';
import { PageData } from '@/lib/types';

// CORRECCIÓN: El prop debe llamarse initialData para coincidir con page.tsx
const HomePageClient = ({ initialData }: { initialData: PageData }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkIsMobile = () => {
      // Usamos 768px como punto de corte estándar para la detección en el cliente
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // 1. Evitamos el "flicker" de hidratación
  if (!mounted) {
    return <div className="min-h-screen bg-black" />; // Pantalla de carga simple
  }

  // 2. Verificación de seguridad: si no hay datos, mostramos un error amigable o nada
  if (!initialData || !initialData.articles) {
    console.warn("Advertencia: initialData llegó incompleto a HomePageClient");
    // Puedes retornar un componente de error aquí si lo prefieres
  }

  // 3. Renderizado Condicional
  // Nota: Aunque el Middleware ya redirigió al subdominio 'm', 
  // esto sirve para cuando cambias el tamaño de la ventana en PC.
  if (isMobile) {
    return <MobileLayout data={initialData} isMobile={true} />;
  }

  // Renderizado para Escritorio
  return <DesktopLayout data={initialData} />;
};

export default HomePageClient;