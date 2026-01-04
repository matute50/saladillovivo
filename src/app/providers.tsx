"use client";

import React from "react";
import { VolumeProvider } from "@/context/VolumeContext";
import { NewsPlayerProvider } from "@/context/NewsPlayerContext";
import { MediaPlayerProvider } from "@/context/MediaPlayerContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <VolumeProvider>
      <NewsPlayerProvider>
        <MediaPlayerProvider>
          {children}
        </MediaPlayerProvider>
      </NewsPlayerProvider>
    </VolumeProvider>
  );
}