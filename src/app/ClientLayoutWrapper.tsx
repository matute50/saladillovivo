'use client';

import React from "react";
import { NewsProvider } from "@/context/NewsContext";
import { MediaPlayerProvider } from "@/context/MediaPlayerContext";
import { VolumeProvider } from "@/context/VolumeContext";
import { NewsPlayerProvider } from "@/context/NewsPlayerContext"; // <--- NUEVO
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useMediaPlayer } from "@/context/MediaPlayerContext";

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
}

function ClientContent({ children }: { children: React.ReactNode }) {
  const { viewMode } = useMediaPlayer();
  const isTvMode = viewMode === 'tv';

  return (
    <>
      {!isTvMode && <Header />}
      {children}
      {!isTvMode && <Footer />}
    </>
  );
}

export default function ClientLayoutWrapper({ children }: ClientLayoutWrapperProps) {
  return (
    <NewsProvider>
      <VolumeProvider>
        <MediaPlayerProvider>
          {/* Agregamos el proveedor de Slides aquí */}
          <NewsPlayerProvider>
            <ClientContent>{children}</ClientContent>
          </NewsPlayerProvider>
        </MediaPlayerProvider>
      </VolumeProvider>
    </NewsProvider>
  );
}