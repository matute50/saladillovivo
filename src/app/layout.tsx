import React from "react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import "@/app/globals.css";

import Script from 'next/script';
import ClientLayoutWrapper from "./ClientLayoutWrapper";

export const metadata: Metadata = {
  title: "Saladillo Vivo",
  description: "Noticias y streaming en vivo de Saladillo",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head />
      <body className="bg-main-gradient">
        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>

        <Script
          src="https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1"
          strategy="lazyOnload"
        />
        <SpeedInsights />
      </body>
    </html>
  );
}


