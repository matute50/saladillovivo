"use client";

import dynamic from "next/dynamic";
import React from "react";
import type { PageData } from "@/lib/types"; // Asumiendo que PageData se define en types.ts

import { useNewsStore } from "@/store/useNewsStore";

const DynamicHomePageClient = dynamic(() => import("@/components/HomePageClient"), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-black" /> // Placeholder mientras carga
});

interface ClientPageWrapperProps {
  initialData: PageData;
}

const ClientPageWrapper: React.FC<ClientPageWrapperProps> = ({ initialData }) => {
  const hydrate = useNewsStore(state => state.hydrate);

  React.useEffect(() => {
    // 1. Hidratar stores con datos del servidor
    if (initialData) {
      hydrate(initialData);
    }

    // 2. Redirección Mobile (Solo cliente)
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    if (/android|ipad|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase())) {
      window.location.href = "https://m.saladillovivo.com.ar";
    }
  }, [initialData, hydrate]);

  return <DynamicHomePageClient initialData={initialData} />;
};

export default ClientPageWrapper;
