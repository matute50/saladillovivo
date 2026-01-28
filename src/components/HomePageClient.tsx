'use client';

import React, { useState, useEffect } from 'react';
import DesktopLayout from '@/components/layout/DesktopLayout';
import MobileLayout from '@/components/layout/MobileLayout';
import { PageData } from '@/lib/types';

const HomePageClient = ({ data }: { data: PageData }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkIsMobile = () => {
      // Usamos 768px como punto de corte estándar
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Evitamos renderizar nada hasta saber dónde estamos para no dar "flickers"
  if (!mounted) return null;

  if (isMobile) {
    return <MobileLayout data={data} isMobile={true} />;
  }

  // ESTA LÍNEA GARANTIZA QUE EL ESCRITORIO SIGUE EXACTAMENTE IGUAL
  return <DesktopLayout data={data} />;
};

export default HomePageClient;