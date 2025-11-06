import React from "react";
import { NewsProvider } from "@/context/NewsContext";
import { MediaPlayerProvider } from "@/context/MediaPlayerContext";
import { VolumeProvider } from "@/context/VolumeContext";
import type { Metadata } from "next";
import "@/app/globals.css";
import dynamic from 'next/dynamic';
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
      <body className="bg-main-gradient">
        <NewsProvider>
          <VolumeProvider>
            <MediaPlayerProvider>
              <Header />
              <DynamicMediaPlayerWrapper>
                {children}
              </DynamicMediaPlayerWrapper>
              <Footer />
            </MediaPlayerProvider>
          </VolumeProvider>
        </NewsProvider>
      </body>
    </html>
  );
}