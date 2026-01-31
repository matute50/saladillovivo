"use client";

import React from "react";
import { VolumeProvider } from "@/context/VolumeContext";
import { NewsPlayerProvider } from "@/context/NewsPlayerContext";
import { MediaPlayerProvider } from "@/context/MediaPlayerContext";
import { NewsProvider } from "@/context/NewsContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <VolumeProvider>
      <NewsPlayerProvider>
        <MediaPlayerProvider>
          <NewsProvider>
            {children}
          </NewsProvider>
        </MediaPlayerProvider>
      </NewsPlayerProvider>
    </VolumeProvider>
  );
}