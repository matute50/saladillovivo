'use client';

import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useMediaPlayer } from "@/context/MediaPlayerContext";

interface LayoutClientContentProps {
  children: React.ReactNode;
}

export default function LayoutClientContent({ children }: LayoutClientContentProps) {
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
