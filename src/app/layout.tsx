import React from "react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { NewsProvider } from "@/context/NewsContext";
import { MediaPlayerProvider } from "@/context/MediaPlayerContext";
import { VolumeProvider } from "@/context/VolumeContext";
import type { Metadata } from "next";
import "@/app/globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Script from 'next/script';

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
        <NewsProvider>
          <VolumeProvider>
            <MediaPlayerProvider>
              {children}
            </MediaPlayerProvider>
          </VolumeProvider>
        </NewsProvider>

        <Script
          src="https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1"
          strategy="lazyOnload"
        />
        <SpeedInsights />
      </body>
    </html>
  );
}
