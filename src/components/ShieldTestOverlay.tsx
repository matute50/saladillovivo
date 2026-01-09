'use client';

import React from 'react';
import { useShieldMode } from '@/context/ShieldModeContext';

const ShieldTestOverlay = () => {
  const { toggleShield } = useShieldMode();

  return (
    <div className="fixed inset-0 z-[9999] bg-red-500/10 backdrop-blur-sm flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-white mb-4">Modo de Prueba Activo</h2>
        <p className="text-white mb-8">La aplicación base está protegida.</p>
        <button
          onClick={toggleShield}
          className="bg-white text-red-500 font-bold py-2 px-4 rounded-lg hover:bg-red-100 transition-colors"
        >
          Desactivar Blindaje
        </button>
      </div>
    </div>
  );
};

export default ShieldTestOverlay;
