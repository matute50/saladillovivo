'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface ShieldModeContextType {
  isShieldActive: boolean;
  toggleShield: () => void;
}

const ShieldModeContext = createContext<ShieldModeContextType | undefined>(undefined);

export const useShieldMode = () => {
  const context = useContext(ShieldModeContext);
  if (context === undefined) {
    throw new Error('useShieldMode must be used within a ShieldModeProvider');
  }
  return context;
};

export const ShieldModeProvider = ({ children }: { children: ReactNode }) => {
  const [isShieldActive, setIsShieldActive] = useState(false);

  const toggleShield = () => {
    setIsShieldActive(prev => !prev);
  };

  const value = {
    isShieldActive,
    toggleShield,
  };

  return (
    <ShieldModeContext.Provider value={value}>
      {children}
    </ShieldModeContext.Provider>
  );
};
