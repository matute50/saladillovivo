'use client';

import React from 'react';
import NewsCard from '../NewsCard'; // Importar el nuevo componente consolidado

const MobileNewsGrid = ({ featuredItem, gridItems }) => {
  if (!featuredItem && (!gridItems || gridItems.length === 0)) return null;

  return (
    <div className="mb-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {featuredItem && (
          <div className="sm:col-span-2">
            <NewsCard newsItem={featuredItem} variant="featured-mobile" />
          </div>
        )}
        {gridItems && gridItems.map((item) => (
          item && <NewsCard key={item.id} newsItem={item} variant="grid-mobile" />
        ))}
      </div>
    </div>
  );
};

export default MobileNewsGrid;
