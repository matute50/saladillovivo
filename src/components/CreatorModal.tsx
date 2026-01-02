'use client';

import React from 'react';

interface CreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreatorModal: React.FC<CreatorModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-background p-8 rounded-lg text-foreground max-w-md w-full mx-4 shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4">Creador</h2>
        <p className="mb-4">Contenido del modal del creador.</p>
        <button 
          onClick={onClose}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default CreatorModal;
