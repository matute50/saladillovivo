import React from "react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next"; // Importa Viewport para mejor SEO móvil
import "@/app/globals.css";
import Script from 'next/script';
import ClientLayoutWrapper from "./ClientLayoutWrapper";

export const metadata: Metadata = {
  title: {
    default: "Saladillo Vivo",
    template: "%s | Saladillo Vivo"
  },
  description: "Noticias, streaming en vivo y actualidad de Saladillo y la región.",
  // Agrega esto para mejorar compartir en redes
  openGraph: {
    title: "Saladillo Vivo",
    description: "Todas las noticias y vivo de Saladillo.",
    url: "https://www.saladillovivo.com.ar",
    siteName: "Saladillo Vivo",
    locale: "es_AR",
    type: "website",
  },
};

// Configuración correcta del viewport en Next.js 14+
export const viewport: Viewport = {
  themeColor: 'black',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, // Ayuda a evitar zoom indeseado en inputs en móvil
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Preconectar a dominios críticos acelera la carga */}
        <link rel="preconnect" href="https://media.saladillovivo.com.ar" />
        <link rel="preconnect" href="https://www.youtube.com" />
      </head>
      
      {/* 'antialiased' mejora la renderización de fuentes.
         'overflow-x-hidden' evita el scroll horizontal indeseado en móviles.
      */}
      <body className="bg-main-gradient antialiased overflow-x-hidden min-h-screen">
        
        {/* Aquí está la clave: ClientLayoutWrapper debe contener LOS PROVIDERS.
           Asegúrate de que ClientLayoutWrapper NO tenga un `key` cambiante.
        */}
        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>

        {/* Carga del script de Cast (Chromecast) */}
        <Script
          src="https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1"
          strategy="lazyOnload" 
        />
        
        <SpeedInsights />
      </body>
    </html>
  );
}