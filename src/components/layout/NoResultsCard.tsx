'use client';

import React from 'react';

const NoResultsCard = ({ onClearSearch }) => {
  return (
    <div className="w-full flex flex-col items-center justify-center p-4 bg-background rounded-lg shadow-md text-center min-h-[200px]">
      <p className="text-lg font-semibold text-foreground mb-4">
        No se encontraron videos que coincidan con tu búsqueda.
      </p>
      <button
        onClick={onClearSearch}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
      >
        Volver a Últimas Noticias
      </button>
    </div>
  );
};

export default NoResultsCard;
