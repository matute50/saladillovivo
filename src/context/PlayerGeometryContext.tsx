'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

// 1. Interface for Geometry Data
export interface PlayerGeometry {
  top: number;
  left: number;
  width: number;
  height: number;
  isReady: boolean;
}

// 2. Interfaz para el Contexto
export interface PlayerGeometryContextType extends PlayerGeometry {
  setCoordinates: (rect: DOMRect | null) => void;
  playerRect: PlayerGeometry;
}

// Estado por defecto
export const DEFAULT_GEOMETRY: PlayerGeometry = {
  top: 0,
  left: 0,
  width: 0,
  height: 0,
  isReady: false,
};

// 3. Crear Contexto para las coordenadas del reproductor
export const PlayerGeometryContext = createContext<PlayerGeometryContextType | undefined>(undefined);

// 4. Hook para Consumidores (usePlayerGeometry)
export const usePlayerGeometry = () => {
  const context = useContext(PlayerGeometryContext);
  if (context === undefined) {
    throw new Error('usePlayerGeometry must be used within a PlayerGeometryProvider');
  }
  return context;
};

// 5. Componente Proveedor
export const PlayerGeometryProvider = ({ children }: { children: ReactNode }) => {
  const [playerGeometry, setPlayerGeometry] = useState<PlayerGeometry>(DEFAULT_GEOMETRY);

  const setCoordinates = (rect: DOMRect | null) => {
    if (rect) {
      setPlayerGeometry({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        isReady: true,
      });
    } else {
      setPlayerGeometry(DEFAULT_GEOMETRY);
    }
  };

  const value = {
    ...playerGeometry,
    setCoordinates,
    playerRect: playerGeometry,
  };

  return (
    <PlayerGeometryContext.Provider value={value}>
      {children}
    </PlayerGeometryContext.Provider>
  );
};
