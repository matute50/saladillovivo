'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Cargamos el cliente de forma dinámica para evitar errores de hidratación
const DynamicHomePageClient = dynamic(
  () => import("@/components/HomePageClient"),
  { 
    ssr: false, 
    loading: () => <div className="min-h-screen bg-black" /> 
  }
);

// IMPORTANTE: Recibimos initialData y se la pasamos al componente hijo
export default function DynamicClientWrapper({ initialData }: { initialData: any }) {
  return <DynamicHomePageClient initialData={initialData} />;
}