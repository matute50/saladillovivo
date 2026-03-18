'use client';

import React, { createContext, useContext, useRef } from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useVolumeStore } from '@/store/useVolumeStore';

interface MediaPlayerContextType {
    captureVolumeForHistory: () => void;
}

const MediaPlayerContext = createContext<MediaPlayerContextType | undefined>(undefined);

export const MediaPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { volume } = useVolumeStore();
    const volumeHistoryRef = useRef<number>(volume);

    // Capturar volumen 10 segundos antes del fin (manejado por VideoSection o Store)
    const captureVolumeForHistory = () => {
        volumeHistoryRef.current = volume;
        usePlayerStore.setState({ historyVolume: volume });
    };

    // Sincronización de Capas (Intro -> YouTube)
    // Movido a VideoSection para acceso directo a refs de tiempo

    return (
        <MediaPlayerContext.Provider value={{ captureVolumeForHistory }}>
            {children}
        </MediaPlayerContext.Provider>
    );
};

export const useMediaPlayer = () => {
    const context = useContext(MediaPlayerContext);
    if (!context) throw new Error('useMediaPlayer must be used within MediaPlayerProvider');
    return context;
};
