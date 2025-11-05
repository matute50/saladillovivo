import React from "react";
import { NewsProvider } from "@/context/NewsContext";
import type { Metadata } from "next";
import "@/app/globals.css";
import dynamic from 'next/dynamic';

export const metadata: Metadata = {
  title: "Saladillo Vivo",
  description: "Noticias y streaming en vivo de Saladillo",
};

const DynamicMediaPlayerWrapper = dynamic(() => import("@/components/MediaPlayerWrapper"), { ssr: false });

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head />
      <body>
        <NewsProvider>
          <DynamicMediaPlayerWrapper>
            {children}
          </DynamicMediaPlayerWrapper>
        </NewsProvider>
      </body>
    </html>
  );
}